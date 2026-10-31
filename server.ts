import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createCheckoutSessionHandler from './api/create-checkout-session.ts';
import publicConfigHandler from './api/public-config.ts';
import stripeWebhookHandler from './api/stripe-webhook.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Preserve raw request body buffer for Stripe webhook signature verification
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  // Live Backend API routes (compatible with both Express and Vercel Serverless Functions)
  app.all('/api/public-config', async (req, res) => {
    try {
      await publicConfigHandler(req, res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  });

  app.all('/api/create-checkout-session', async (req, res) => {
    try {
      await createCheckoutSessionHandler(req, res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  });

  app.all('/api/stripe-webhook', async (req, res) => {
    try {
      await stripeWebhookHandler(req, res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  });

  const distPath = path.join(__dirname, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.npm_lifecycle_event === 'start' && fs.existsSync(distIndexPath));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Delightful Juices server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
