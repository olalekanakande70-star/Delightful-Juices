import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  KeyRound,
  Lock,
  Plug,
  Power,
  RefreshCw,
  Save,
  ShieldCheck,
  Webhook,
  XCircle,
} from 'lucide-react';
import { Order, SiteContent, StripePaymentSettings } from '../types';
import { supabaseService, LiveServerStatus } from '../lib/supabaseClient';

export type StripeMode = 'test' | 'live';

interface GatewayModeDetails {
  publishableKey: string;
  hasSecretKey: boolean;
  secretKeyHint: string | null;
  hasWebhookSecret: boolean;
  webhookSecretHint: string | null;
  webhookEndpointId: string | null;
}

interface SanitizedGatewayStatus {
  connected: boolean;
  activeMode: StripeMode;
  source: 'cms' | 'env' | 'none';
  accountId: string | null;
  accountName: string | null;
  webhookUrl: string;
  webhookStatus: string;
  webhookLastError: string | null;
  lastValidatedAt: string | null;
  connectedByEmail: string | null;
  serverReady: boolean;
  missingServerRequirements: string[];
  encryptionActive: boolean;
  encryptionMismatch?: boolean;
  envReadiness?: {
    supabaseUrl: boolean;
    supabaseServiceRoleKey: boolean;
    paymentEncryptionKey: boolean;
    gatewaySecretsTable: boolean;
  };
  modes: {
    test: GatewayModeDetails;
    live: GatewayModeDetails;
  };
}

interface StripeTransactionRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

interface TransactionSummary {
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  totalPaidRevenue: number;
  recentTransactions: StripeTransactionRecord[];
}

interface StripeGatewayManagerProps {
  content: SiteContent;
  orders: Order[];
  serverStatus: LiveServerStatus;
  onUpdateContent: (next: SiteContent) => void;
  onPersistContent: (target: SiteContent, successMessage: string) => Promise<void>;
  onServerStatusRefresh: () => void;
  onNotify: (msg: string) => void;
  onOpenDatabaseTab: () => void;
}

const REQUIRED_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'payment_intent.payment_failed',
];

export const StripeGatewayManager: React.FC<StripeGatewayManagerProps> = ({
  content,
  orders,
  serverStatus,
  onUpdateContent,
  onPersistContent,
  onServerStatusRefresh,
  onNotify,
  onOpenDatabaseTab,
}) => {
  const [gateway, setGateway] = useState<SanitizedGatewayStatus | null>(null);
  const [serverTransactions, setServerTransactions] = useState<TransactionSummary | null>(null);
  const [isLoadingGateway, setIsLoadingGateway] = useState(true);
  const [gatewayLoadError, setGatewayLoadError] = useState<string | null>(null);

  // Selected mode tab in CMS credentials form ('test' | 'live')
  const [formMode, setFormMode] = useState<StripeMode>(
    content.stripe?.mode === 'test' || serverStatus.stripeMode === 'test' ? 'test' : 'live'
  );
  const [publishableKeyInput, setPublishableKeyInput] = useState('');
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [webhookSecretInput, setWebhookSecretInput] = useState('');

  // Action states
  const [isSubmittingAction, setIsSubmittingAction] = useState<
    null | 'connect' | 'test' | 'webhook' | 'reissue_webhook' | 'switch' | 'disconnect'
  >(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [clearSecretsOnDisconnect, setClearSecretsOnDisconnect] = useState(false);
  const [showManualWebhookSetup, setShowManualWebhookSetup] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [showKeyRotationHelper, setShowKeyRotationHelper] = useState(false);
  const [generatedEncryptionKey, setGeneratedEncryptionKey] = useState('');
  const [copiedGeneratedKey, setCopiedGeneratedKey] = useState(false);
  const [actionBanner, setActionBanner] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const authorizedFetch = useCallback(async (method: 'GET' | 'POST', body?: Record<string, any>) => {
    const token = await supabaseService.getAccessToken();
    if (!token) {
      throw new Error('Administrator session expired. Please sign out and sign back in.');
    }

    const res = await fetch('/api/stripe-gateway', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || `Request failed (${res.status})`);
      err.payload = data;
      throw err;
    }
    return data;
  }, []);

  const fetchGatewayState = useCallback(async () => {
    setIsLoadingGateway(true);
    setGatewayLoadError(null);
    try {
      const data = await authorizedFetch('GET');
      if (data.gateway) {
        setGateway(data.gateway);
        const targetMode: StripeMode = data.gateway.activeMode === 'test' ? 'test' : 'live';
        setFormMode(targetMode);
        setPublishableKeyInput(data.gateway.modes?.[targetMode]?.publishableKey || '');
      }
      if (data.transactions) {
        setServerTransactions(data.transactions);
      }
    } catch (err: any) {
      setGatewayLoadError(err?.message || 'Unable to load server payment gateway status.');
    } finally {
      setIsLoadingGateway(false);
    }
  }, [authorizedFetch]);

  useEffect(() => {
    fetchGatewayState();
  }, [fetchGatewayState]);

  // Keep publishable key input synced when toggling formMode tab (never pre-fill secrets)
  const handleSelectModeTab = (nextMode: StripeMode) => {
    setFormMode(nextMode);
    setPublishableKeyInput(gateway?.modes?.[nextMode]?.publishableKey || '');
    setSecretKeyInput('');
    setWebhookSecretInput('');
    setActionBanner(null);
  };

  const refreshAllStatus = async () => {
    await supabaseService.ensurePublicConfig(true);
    onServerStatusRefresh();
  };

  const handleConnectStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAction('connect');
    setActionBanner(null);

    try {
      const data = await authorizedFetch('POST', {
        action: 'connect',
        mode: formMode,
        publishableKey: publishableKeyInput.trim(),
        secretKey: secretKeyInput.trim(),
        webhookSecret: webhookSecretInput.trim(),
      });

      setGateway(data.gateway);
      if (data.transactions) setServerTransactions(data.transactions);

      // Clear secret inputs from browser memory immediately after secure server save
      setSecretKeyInput('');
      setWebhookSecretInput('');
      if (data.detectedMode) {
        setFormMode(data.detectedMode);
        setPublishableKeyInput(data.gateway?.modes?.[data.detectedMode]?.publishableKey || publishableKeyInput.trim());
      }

      const nextStripeSettings: StripePaymentSettings = {
        ...(content.stripe || {
          enabled: true,
          currency: 'USD',
          customerFacingName: 'Credit / Debit Card (Stripe)',
          description: 'Instant secure payment via Visa, Mastercard, Amex, Apple Pay & Google Pay',
        }),
        enabled: true,
        mode: data.detectedMode || formMode,
      };
      onUpdateContent({ ...content, stripe: nextStripeSettings });
      await refreshAllStatus();

      setActionBanner({ success: true, message: data.message });
      onNotify(`Stripe connected in ${(data.detectedMode || formMode).toUpperCase()} mode!`);

      if (data.gateway?.webhookStatus === 'manual_required') {
        setShowManualWebhookSetup(true);
      }
    } catch (err: any) {
      setActionBanner({
        success: false,
        message: err?.message || 'Failed to connect Stripe credentials.',
      });
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleSwitchActiveMode = async (targetMode: StripeMode) => {
    if (!gateway) return;
    const modeInfo = gateway.modes[targetMode];
    handleSelectModeTab(targetMode);

    if (!modeInfo?.hasSecretKey) {
      setActionBanner({
        success: false,
        message: `Enter your Stripe ${targetMode.toUpperCase()} keys below and click "Connect Stripe" to activate ${targetMode.toUpperCase()} mode.`,
      });
      return;
    }

    setIsSubmittingAction('switch');
    setActionBanner(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'switch_mode',
        mode: targetMode,
      });
      setGateway(data.gateway);
      if (data.transactions) setServerTransactions(data.transactions);

      const nextStripeSettings: StripePaymentSettings = {
        ...(content.stripe || {
          enabled: true,
          currency: 'USD',
          customerFacingName: 'Credit / Debit Card (Stripe)',
          description: 'Instant secure payment via Visa, Mastercard, Amex, Apple Pay & Google Pay',
        }),
        enabled: true,
        mode: targetMode,
      };
      onUpdateContent({ ...content, stripe: nextStripeSettings });
      await refreshAllStatus();

      setActionBanner({ success: true, message: data.message });
      onNotify(data.message);
    } catch (err: any) {
      setActionBanner({ success: false, message: err?.message || 'Unable to switch payment mode.' });
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleTestConnection = async () => {
    setIsSubmittingAction('test');
    setActionBanner(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'test_connection',
        mode: gateway?.activeMode || formMode,
      });
      if (data.gateway) setGateway(data.gateway);
      if (data.transactions) setServerTransactions(data.transactions);
      setActionBanner({ success: true, message: data.message });
      onNotify('Stripe connection verified!');
    } catch (err: any) {
      setActionBanner({
        success: false,
        message: err?.message || 'Stripe connection test failed.',
      });
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleConfigureWebhook = async (recreate = false) => {
    setIsSubmittingAction(recreate ? 'reissue_webhook' : 'webhook');
    setActionBanner(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'configure_webhook',
        mode: formMode,
        webhookSecret: recreate ? '' : webhookSecretInput.trim(),
        recreateWebhook: recreate,
      });
      if (data.gateway) setGateway(data.gateway);
      setWebhookSecretInput('');
      await refreshAllStatus();

      setActionBanner({
        success: Boolean(data.success),
        message: data.message,
      });
      if (!data.success) {
        setShowManualWebhookSetup(true);
      } else {
        onNotify('Stripe webhook configured!');
      }
    } catch (err: any) {
      setActionBanner({
        success: false,
        message: err?.message || 'Webhook configuration failed.',
      });
      setShowManualWebhookSetup(true);
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleDisconnectStripe = async () => {
    setIsSubmittingAction('disconnect');
    setActionBanner(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'disconnect',
        clearSecrets: clearSecretsOnDisconnect,
      });
      setGateway(data.gateway);
      setConfirmDisconnect(false);
      setClearSecretsOnDisconnect(false);
      setSecretKeyInput('');
      setWebhookSecretInput('');

      const nextStripeSettings: StripePaymentSettings = {
        ...(content.stripe || {
          mode: formMode,
          currency: 'USD',
          customerFacingName: 'Credit / Debit Card (Stripe)',
          description: 'Instant secure payment via Visa, Mastercard, Amex, Apple Pay & Google Pay',
        }),
        enabled: false,
      };
      onUpdateContent({ ...content, stripe: nextStripeSettings });
      await refreshAllStatus();

      setActionBanner({ success: true, message: data.message });
      onNotify(data.message);
    } catch (err: any) {
      setActionBanner({
        success: false,
        message: err?.message || 'Failed to disconnect Stripe.',
      });
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleCopyWebhookUrl = () => {
    const url = gateway?.webhookUrl || 'https://www.delightfuljuices.com/api/stripe-webhook';
    navigator.clipboard?.writeText(url);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  const handleGenerateEncryptionKey = () => {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    setGeneratedEncryptionKey(hex);
    setCopiedGeneratedKey(false);
  };

  const handleCopyGeneratedKey = () => {
    if (!generatedEncryptionKey) return;
    navigator.clipboard?.writeText(generatedEncryptionKey);
    setCopiedGeneratedKey(true);
    setTimeout(() => setCopiedGeneratedKey(false), 2000);
  };

  // Fallback/merged payment stats combining server summary and live CMS orders state
  const localStripeStats = useMemo(() => {
    const stripeOrders = orders.filter((o) => o.paymentMethod === 'stripe_card');
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let totalPaidRevenue = 0;

    for (const o of stripeOrders) {
      const pStatus = o.paymentStatus || 'pending';
      if (pStatus === 'paid') {
        successfulCount += 1;
        totalPaidRevenue += o.total;
      } else if (pStatus === 'failed') {
        failedCount += 1;
      } else {
        pendingCount += 1;
      }
    }

    const recentTransactions: StripeTransactionRecord[] = stripeOrders.slice(0, 20).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      amount: o.total,
      paymentStatus: o.paymentStatus || 'pending',
      orderStatus: o.status,
      stripeSessionId: o.stripeSessionId || null,
      stripePaymentIntentId: o.stripePaymentIntentId || null,
      createdAt: o.createdAt,
    }));

    return {
      successfulCount,
      pendingCount,
      failedCount,
      totalPaidRevenue,
      recentTransactions,
    };
  }, [orders]);

  const txStats =
    serverTransactions &&
    (serverTransactions.recentTransactions.length > 0 || localStripeStats.recentTransactions.length === 0)
      ? serverTransactions
      : localStripeStats;

  const activeModeDetails = gateway?.modes?.[formMode];
  const isConnected = Boolean(gateway ? gateway.connected : serverStatus.stripeConfigured);
  const currentActiveMode: StripeMode =
    gateway?.activeMode || (serverStatus.stripeMode === 'test' ? 'test' : 'live');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
            Payment Gateway Settings &amp; Management
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
            Connect, configure, and monitor your Stripe payment gateway directly from the Delightful Juices CMS
          </p>
        </div>

        <button
          type="button"
          onClick={fetchGatewayState}
          disabled={isLoadingGateway}
          className="self-start sm:self-auto bg-white hover:bg-[#FFF8E7] border border-[#1B4D2E]/15 text-[#1B4D2E] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGateway ? 'animate-spin' : ''}`} />
          <span>Refresh Gateway Status</span>
        </button>
      </div>

      {/* Infrastructure Prerequisite Notice if Server Requirements Missing */}
      {gateway && !gateway.serverReady && (
        <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 text-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-extrabold text-sm">
                One-Time Server Environment &amp; Vault Setup Required
              </div>
              <p className="leading-relaxed text-amber-900">
                Secret credentials stay strictly on the server—never in browser storage or public database tables. Configure missing variables in <strong>Vercel Project Settings → Environment Variables</strong> (for production) or <strong>Google AI Studio Secrets</strong> (for preview). If you already added them in Vercel, ensure <strong>Production</strong> is checked and trigger a <strong>Redeploy</strong> so the live backend picks them up:
              </p>

              {gateway.envReadiness && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'SUPABASE_URL', ok: gateway.envReadiness.supabaseUrl, status: gateway.envReadiness.supabaseUrl ? 'Ready' : 'Missing' },
                    { label: 'SUPABASE_SERVICE_ROLE_KEY', ok: gateway.envReadiness.supabaseServiceRoleKey, status: gateway.envReadiness.supabaseServiceRoleKey ? 'Ready' : 'Missing' },
                    { label: 'PAYMENT_ENCRYPTION_KEY', ok: gateway.envReadiness.paymentEncryptionKey, status: gateway.envReadiness.paymentEncryptionKey ? 'Ready' : 'Missing' },
                    {
                      label: 'payment_gateway_secrets table',
                      ok: gateway.envReadiness.gatewaySecretsTable,
                      status: !gateway.envReadiness.supabaseServiceRoleKey
                        ? 'Needs Service Key'
                        : gateway.envReadiness.gatewaySecretsTable
                        ? 'Ready'
                        : 'Missing',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`px-3 py-2 rounded-xl border font-mono text-[11px] flex items-center justify-between ${
                        item.ok
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-amber-300 text-amber-950'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-sans font-bold uppercase text-[10px]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenDatabaseTab}
                  className="bg-[#1B4D2E] text-[#FFF8E7] text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Open Supabase SQL Migration Script
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gateway?.encryptionMismatch && (
        <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-300 text-red-950 space-y-2 text-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="font-extrabold text-sm">
                New Encryption Key Detected — Re-enter Stripe Secret Key
              </div>
              <p className="leading-relaxed text-red-900">
                Your server&apos;s <code className="font-mono font-bold">PAYMENT_ENCRYPTION_KEY</code> changed and can no longer decrypt the previously saved Stripe credentials. Enter your Stripe Secret Key (and Webhook Signing Secret if using manual setup) in the form below and click <strong>Connect Stripe</strong> to re-encrypt them with your new server key.
              </p>
            </div>
          </div>
        </div>
      )}

      {gatewayLoadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gatewayLoadError}</span>
        </div>
      )}

      {/* Connection Status & Active Mode Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
          isConnected
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-white border-[#1B4D2E]/15 text-[#1B4D2E]'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isConnected ? 'bg-[#1B4D2E] text-[#E1AD01]' : 'bg-[#FFF8E7] text-[#1B4D2E]'
            }`}
          >
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-extrabold text-base">
                {isConnected ? 'Stripe Gateway Connected' : 'Stripe Gateway Not Connected'}
              </span>

              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isConnected
                    ? currentActiveMode === 'live'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-amber-400 text-[#1B4D2E] border-amber-500'
                    : 'bg-gray-200 text-gray-700 border-gray-300'
                }`}
              >
                {isConnected ? `${currentActiveMode.toUpperCase()} MODE` : 'DISCONNECTED'}
              </span>

              {(gateway?.modes?.[currentActiveMode]?.hasWebhookSecret || serverStatus.stripeWebhookConfigured) && (
                <span className="bg-white/90 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                  <Webhook className="w-3 h-3" />
                  <span>Webhook Active</span>
                </span>
              )}

              {gateway?.encryptionActive && (
                <span className="bg-white/90 text-[#1B4D2E] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#1B4D2E]/20 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>AES-256 Encrypted</span>
                </span>
              )}
            </div>

            <p className="text-xs opacity-85">
              {isConnected
                ? `Account: ${gateway?.accountName || 'Verified Stripe Account'}${
                    gateway?.accountId ? ` (${gateway.accountId})` : ''
                  } • Source: ${gateway?.source === 'env' ? 'Server Environment Fallback' : 'CMS Encrypted Vault'}`
                : 'Enter your Stripe Test or Live credentials below and click Connect Stripe to enable card checkout.'}
            </p>
            {gateway?.lastValidatedAt && (
              <p className="text-[11px] opacity-70">
                Last verified: {new Date(gateway.lastValidatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Live / Test Mode Quick Switcher */}
        <div className="flex flex-col items-start md:items-end space-y-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Active Payment Mode
          </span>
          <div className="inline-flex bg-white p-1 rounded-xl border border-[#1B4D2E]/15 shadow-xs">
            <button
              type="button"
              disabled={isSubmittingAction !== null}
              onClick={() => handleSwitchActiveMode('test')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                currentActiveMode === 'test' && isConnected
                  ? 'bg-amber-400 text-[#1B4D2E] shadow-xs'
                  : 'text-gray-600 hover:text-[#1B4D2E]'
              }`}
            >
              Test Mode
            </button>
            <button
              type="button"
              disabled={isSubmittingAction !== null}
              onClick={() => handleSwitchActiveMode('live')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                currentActiveMode === 'live' && isConnected
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-gray-600 hover:text-[#1B4D2E]'
              }`}
            >
              Live Mode
            </button>
          </div>
        </div>
      </div>

      {/* Server Encryption Key Setup & Rotation Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1B4D2E]/10 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E7] border border-[#1B4D2E]/15 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#1B4D2E]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-bold text-sm text-[#1B4D2E]">
                  Server Encryption Key (<code className="font-mono">PAYMENT_ENCRYPTION_KEY</code>)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    gateway?.encryptionActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  {gateway?.encryptionActive ? 'Active on Server' : 'Not Set on Server'}
                </span>
              </div>
              <p className="text-[11px] text-[#1B4D2E]/70 mt-0.5">
                To keep encrypted Stripe secrets isolated, <code className="font-mono">PAYMENT_ENCRYPTION_KEY</code> is managed strictly in server secrets—never stored in browser storage or the database.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyRotationHelper(!showKeyRotationHelper)}
            className="self-start sm:self-auto bg-[#FFF8E7] hover:bg-[#F4E8CB] border border-[#1B4D2E]/20 text-[#1B4D2E] font-bold px-3.5 py-2 rounded-xl text-[11px] shrink-0 cursor-pointer"
          >
            {showKeyRotationHelper
              ? 'Hide Rotation Guide'
              : gateway?.encryptionActive
              ? 'Rotate / Re-enter Key'
              : 'Generate & Set Key'}
          </button>
        </div>

        {(showKeyRotationHelper || (gateway && !gateway.encryptionActive) || gateway?.encryptionMismatch) && (
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateEncryptionKey}
                className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold px-3.5 py-2 rounded-xl text-[11px] flex items-center space-x-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#E1AD01]" />
                <span>Generate Strong 256-bit Key</span>
              </button>

              {generatedEncryptionKey && (
                <>
                  <button
                    type="button"
                    onClick={handleCopyGeneratedKey}
                    className="bg-[#FFF8E7] hover:bg-[#F4E8CB] border border-[#1B4D2E]/20 text-[#1B4D2E] font-bold px-3 py-2 rounded-xl text-[11px] flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedGeneratedKey ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedGeneratedKey ? 'Copied to Clipboard' : 'Copy Key'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedEncryptionKey('');
                      setCopiedGeneratedKey(false);
                    }}
                    className="text-gray-500 hover:text-[#1B4D2E] font-semibold px-2 py-1.5 text-[11px] cursor-pointer"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>

            {generatedEncryptionKey && (
              <div className="p-3 rounded-xl bg-[#FFF8E7] border border-[#1B4D2E]/20 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                  Temporary Generated 64-Char Key (never saved to browser or database)
                </div>
                <code className="block font-mono text-[11px] text-[#1B4D2E] break-all select-all">
                  {generatedEncryptionKey}
                </code>
              </div>
            )}

            <ol className="list-decimal pl-5 space-y-1.5 text-[11px] text-[#1B4D2E]/85 leading-relaxed">
              <li>
                <strong>In Google AI Studio (Preview):</strong> Open the <strong>Secrets</strong> panel in AI Studio, add or update <code className="font-mono font-bold">PAYMENT_ENCRYPTION_KEY</code> with your key, and restart/reload the preview server.
              </li>
              <li>
                <strong>On Vercel (Live Site):</strong> Go to <strong>Vercel Project Settings → Environment Variables</strong>, update <code className="font-mono font-bold">PAYMENT_ENCRYPTION_KEY</code> (with <strong>Production</strong> selected), and trigger a <strong>Redeploy</strong>.
              </li>
              <li>
                Click <strong>Refresh Gateway Status</strong> above, then re-enter your Stripe Secret Key below and click <strong>Connect Stripe</strong> so stored Stripe keys are encrypted with your new key.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Action Feedback Banner */}
      {actionBanner && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start space-x-2.5 border ${
            actionBanner.success
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-amber-50 text-amber-950 border-amber-300'
          }`}
        >
          {actionBanner.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{actionBanner.message}</span>
        </div>
      )}

      {/* PAYMENT MANAGEMENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#1B4D2E]/70">
            <span>Successful Transactions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-black text-2xl text-[#1B4D2E]">
            {txStats.successfulCount}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700">
            ${txStats.totalPaidRevenue.toFixed(2)} verified collected
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#1B4D2E]/70">
            <span>Pending Payments</span>
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display font-black text-2xl text-[#1B4D2E]">
            {txStats.pendingCount}
          </div>
          <div className="text-[11px] text-gray-500">
            Awaiting Stripe webhook confirmation
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#1B4D2E]/70">
            <span>Failed Payments</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="font-display font-black text-2xl text-[#1B4D2E]">
            {txStats.failedCount}
          </div>
          <div className="text-[11px] text-gray-500">
            Expired or declined card attempts
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#1B4D2E]/70">
            <span>Current Payment Mode</span>
            <DollarSign className="w-4 h-4 text-[#E1AD01]" />
          </div>
          <div className="font-display font-black text-2xl text-[#1B4D2E] uppercase">
            {isConnected ? currentActiveMode : 'Offline'}
          </div>
          <div className="text-[11px] text-gray-500">
            Currency: {content.stripe?.currency || 'USD'}
          </div>
        </div>
      </div>

      {/* SECTION 1 & 2: STRIPE CREDENTIALS & AUTOMATIC CONNECTION */}
      <form
        onSubmit={handleConnectStripe}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E] flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-[#E1AD01]" />
              <span>Stripe Credentials &amp; Connection</span>
            </h3>
            <p className="text-xs text-gray-500">
              Credentials are validated directly with Stripe, encrypted with AES-256-GCM, and stored exclusively on the server
            </p>
          </div>

          {/* Configure Test vs Live Keys Switch */}
          <div className="inline-flex bg-[#FFF8E7] p-1 rounded-xl border border-[#1B4D2E]/15">
            <button
              type="button"
              onClick={() => handleSelectModeTab('test')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formMode === 'test'
                  ? 'bg-amber-400 text-[#1B4D2E] shadow-xs'
                  : 'text-[#1B4D2E]/70 hover:text-[#1B4D2E]'
              }`}
            >
              Test Mode Keys
            </button>
            <button
              type="button"
              onClick={() => handleSelectModeTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formMode === 'live'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/70 hover:text-[#1B4D2E]'
              }`}
            >
              Live Mode Keys
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Publishable Key */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Stripe Publishable Key ({formMode === 'live' ? 'pk_live_...' : 'pk_test_...'})
            </label>
            <input
              type="text"
              value={publishableKeyInput}
              onChange={(e) => setPublishableKeyInput(e.target.value)}
              placeholder={
                formMode === 'live'
                  ? 'pk_live_51...'
                  : 'pk_test_51...'
              }
              autoComplete="off"
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs font-mono text-[#1B4D2E]"
            />
          </div>

          {/* Secret Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                Stripe Secret Key ({formMode === 'live' ? 'sk_live_...' : 'sk_test_...'})
              </label>
              {activeModeDetails?.hasSecretKey && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Saved: {activeModeDetails.secretKeyHint || '••••••••'}
                </span>
              )}
            </div>
            <input
              type="password"
              value={secretKeyInput}
              onChange={(e) => setSecretKeyInput(e.target.value)}
              placeholder={
                activeModeDetails?.hasSecretKey
                  ? 'Leave blank to keep stored encrypted secret key, or paste new key'
                  : formMode === 'live'
                  ? 'sk_live_...'
                  : 'sk_test_...'
              }
              autoComplete="new-password"
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs font-mono text-[#1B4D2E]"
            />
          </div>

          {/* Webhook Signing Secret */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                Webhook Signing Secret (whsec_...)
              </label>
              {activeModeDetails?.hasWebhookSecret && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Saved: {activeModeDetails.webhookSecretHint || '••••••••'}
                </span>
              )}
            </div>
            <input
              type="password"
              value={webhookSecretInput}
              onChange={(e) => setWebhookSecretInput(e.target.value)}
              placeholder={
                activeModeDetails?.hasWebhookSecret
                  ? 'Leave blank to keep stored signing secret, or paste whsec_...'
                  : 'Optional — auto-generated on Connect, or paste whsec_...'
              }
              autoComplete="new-password"
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs font-mono text-[#1B4D2E]"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={isSubmittingAction !== null}
              className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmittingAction === 'connect' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#E1AD01]" />
              ) : (
                <Plug className="w-4 h-4 text-[#E1AD01]" />
              )}
              <span>
                {isSubmittingAction === 'connect'
                  ? 'Validating & Connecting Stripe...'
                  : 'Connect Stripe'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isSubmittingAction !== null}
              className="bg-[#FFF8E7] hover:bg-[#F4E8CB] text-[#1B4D2E] border border-[#1B4D2E]/20 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingAction === 'test' ? 'animate-spin' : ''}`} />
              <span>{isSubmittingAction === 'test' ? 'Testing Stripe...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Disconnect Stripe Button + Inline Confirmation */}
          {isConnected && (
            <div>
              {confirmDisconnect ? (
                <div className="flex flex-wrap items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-xs">
                  <label className="flex items-center space-x-1.5 text-red-900 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearSecretsOnDisconnect}
                      onChange={(e) => setClearSecretsOnDisconnect(e.target.checked)}
                      className="accent-red-600"
                    />
                    <span>Erase stored keys</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDisconnectStripe}
                    disabled={isSubmittingAction !== null}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg cursor-pointer"
                  >
                    {isSubmittingAction === 'disconnect' ? 'Disconnecting...' : 'Confirm Disconnect'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDisconnect(false)}
                    className="bg-white border border-gray-200 text-gray-700 font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Disconnect Stripe</span>
                </button>
              )}
            </div>
          )}
        </div>
      </form>

      {/* SECTION 3: AUTOMATIC & MANUAL WEBHOOK CONFIGURATION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E] flex items-center space-x-2">
              <Webhook className="w-5 h-5 text-[#E1AD01]" />
              <span>Webhook Configuration</span>
            </h3>
            <p className="text-xs text-gray-500">
              Automatically registers the Delightful Juices webhook in Stripe and encrypts the signing secret
            </p>
          </div>

          <span
            className={`self-start sm:self-auto text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
              activeModeDetails?.hasWebhookSecret
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {gateway?.webhookStatus === 'auto_configured'
              ? 'Auto-Configured'
              : gateway?.webhookStatus === 'manual_configured'
              ? 'Manual Secret Stored'
              : activeModeDetails?.hasWebhookSecret
              ? 'Webhook Secret Stored'
              : 'Action Needed'}
          </span>
        </div>

        {/* Endpoint URL Box */}
        <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D2E]/60 block">
              Webhook Endpoint URL
            </span>
            <code className="font-mono font-bold text-[#1B4D2E] break-all">
              {gateway?.webhookUrl || 'https://www.delightfuljuices.com/api/stripe-webhook'}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyWebhookUrl}
            className="self-start sm:self-auto bg-white hover:bg-gray-50 border border-[#1B4D2E]/20 text-[#1B4D2E] text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedWebhookUrl ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>

        {gateway?.webhookLastError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{gateway.webhookLastError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isSubmittingAction !== null || !activeModeDetails?.hasSecretKey}
            onClick={() => handleConfigureWebhook(false)}
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Webhook className="w-3.5 h-3.5 text-[#E1AD01]" />
            <span>
              {isSubmittingAction === 'webhook'
                ? 'Configuring Webhook...'
                : 'Auto-Configure Webhook'}
            </span>
          </button>

          {activeModeDetails?.webhookEndpointId && (
            <button
              type="button"
              disabled={isSubmittingAction !== null || !activeModeDetails?.hasSecretKey}
              onClick={() => handleConfigureWebhook(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSubmittingAction === 'reissue_webhook' ? 'animate-spin' : ''}`}
              />
              <span>Re-issue Webhook Secret</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowManualWebhookSetup(!showManualWebhookSetup)}
            className="text-xs font-bold text-[#1B4D2E] hover:underline px-2 py-1.5 cursor-pointer"
          >
            {showManualWebhookSetup ? 'Hide Manual Setup Guide' : 'Manual Setup Fallback'}
          </button>
        </div>

        {showManualWebhookSetup && (
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2 text-[#1B4D2E]">
            <div className="font-bold flex items-center justify-between">
              <span>Manual Stripe Dashboard Webhook Setup</span>
              <a
                href="https://dashboard.stripe.com/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#1B4D2E] underline inline-flex items-center space-x-1"
              >
                <span>Open Stripe Webhooks</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-gray-600">
              If you use a Restricted Key or prefer registering the webhook manually in Stripe:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-[11px] text-gray-700">
              <li>
                Add endpoint URL:{' '}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border">
                  https://www.delightfuljuices.com/api/stripe-webhook
                </code>
              </li>
              <li>
                Subscribe to events:{' '}
                <span className="font-mono">{REQUIRED_WEBHOOK_EVENTS.join(', ')}</span>
              </li>
              <li>
                Reveal the Signing Secret (<code className="font-mono">whsec_...</code>), paste it into the <strong>Webhook Signing Secret</strong> input above, and click <strong>Connect Stripe</strong>.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* SECTION 4: RECENT TRANSACTION HISTORY */}
      <div className="bg-white rounded-3xl border border-[#1B4D2E]/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
              Recent Stripe Transaction History
            </h3>
            <p className="text-xs text-gray-500">
              Payment status is updated strictly via verified Stripe webhooks
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#1B4D2E]/70">
            Showing {txStats.recentTransactions.length} recent card orders
          </span>
        </div>

        {txStats.recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No Stripe card transactions recorded yet. Once customers check out with Stripe, verified payment events will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8E7] text-[#1B4D2E] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Stripe Reference</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txStats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FFF8E7]/40">
                    <td className="p-4 font-mono font-extrabold text-[#1B4D2E]">
                      {tx.orderNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#1B4D2E]">{tx.customerName}</div>
                      <div className="text-[11px] text-gray-500">{tx.customerEmail}</div>
                    </td>
                    <td className="p-4 font-extrabold text-[#1B4D2E]">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-gray-700 font-semibold">
                      {tx.orderStatus.replace('_', ' ')}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-gray-500 max-w-[160px] truncate">
                      {tx.stripePaymentIntentId || tx.stripeSessionId || '—'}
                    </td>
                    <td className="p-4 text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 5: STOREFRONT CHECKOUT PRESENTATION SETTINGS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
              Storefront Card Checkout Presentation
            </h3>
            <p className="text-xs text-gray-500">
              Configure currency and customer-facing labels shown in the checkout modal
            </p>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={content.stripe?.enabled !== false}
              onChange={(e) => {
                const updated: StripePaymentSettings = {
                  ...(content.stripe || {
                    mode: currentActiveMode,
                    currency: 'USD',
                    customerFacingName: 'Credit / Debit Card (Stripe)',
                    description: 'Instant secure checkout with Visa, Mastercard, Amex, Apple Pay & Google Pay',
                  }),
                  enabled: e.target.checked,
                };
                onUpdateContent({ ...content, stripe: updated });
              }}
              className="w-5 h-5 accent-[#1B4D2E]"
            />
            <span className="text-xs font-bold text-[#1B4D2E]">Show at Storefront</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Settlement Currency
            </label>
            <select
              value={content.stripe?.currency || 'USD'}
              onChange={(e) => {
                const updated: StripePaymentSettings = {
                  ...(content.stripe || {
                    enabled: true,
                    mode: currentActiveMode,
                    customerFacingName: 'Credit / Debit Card (Stripe)',
                    description: '',
                  }),
                  currency: e.target.value,
                };
                onUpdateContent({ ...content, stripe: updated });
              }}
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E] font-bold"
            >
              <option value="USD">USD ($ - United States Dollar)</option>
              <option value="CAD">CAD ($ - Canadian Dollar)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="EUR">EUR (€ - Euro)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Customer Facing Method Name
            </label>
            <input
              type="text"
              value={content.stripe?.customerFacingName || 'Credit / Debit Card (Stripe)'}
              onChange={(e) => {
                const updated: StripePaymentSettings = {
                  ...(content.stripe || {
                    enabled: true,
                    mode: currentActiveMode,
                    currency: 'USD',
                    description: '',
                  }),
                  customerFacingName: e.target.value,
                };
                onUpdateContent({ ...content, stripe: updated });
              }}
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Customer Facing Description
            </label>
            <input
              type="text"
              value={
                content.stripe?.description ||
                'Instant secure payment via Visa, Mastercard, Amex, Apple Pay & Google Pay'
              }
              onChange={(e) => {
                const updated: StripePaymentSettings = {
                  ...(content.stripe || {
                    enabled: true,
                    mode: currentActiveMode,
                    currency: 'USD',
                    customerFacingName: 'Credit / Debit Card (Stripe)',
                  }),
                  description: e.target.value,
                };
                onUpdateContent({ ...content, stripe: updated });
              }}
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-[#1B4D2E]/70 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1B4D2E]" />
            <span>Only non-secret display preferences are saved to public storefront config.</span>
          </div>

          <button
            type="button"
            onClick={() =>
              onPersistContent(content, 'Storefront checkout presentation settings saved!')
            }
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#E1AD01]" />
            <span>Save Presentation Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
