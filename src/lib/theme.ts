import { SiteContent, ColorThemeSettings, TypographySettings } from '../types';

export const DEFAULT_COLORS: ColorThemeSettings = {
  primaryColor: '#1B4D2E',
  secondaryColor: '#E1AD01',
  accentColor: '#E1AD01',
  pageBgColor: '#FFFFFF',
  cardBgColor: '#FFFFFF',
  headerBgColor: '#FFFFFF',
  footerBgColor: '#12351F',
  textColor: '#1B4D2E',
  buttonBgColor: '#1B4D2E',
  buttonTextColor: '#FFF8E7',
  borderColor: '#1B4D2E26',
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  headingFont: "'Playfair Display', Georgia, serif",
  bodyFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  baseFontSize: '16px',
  headingWeight: '700',
  bodyWeight: '400',
};

/**
 * Injects dynamic CSS variables on document.documentElement
 * so all components instantly inherit admin-customized theme colors and fonts.
 */
export function applyTheme(content?: Partial<SiteContent> | null) {
  if (typeof document === 'undefined') return;

  const colors = { ...DEFAULT_COLORS, ...(content?.colors || {}) };
  const typography = { ...DEFAULT_TYPOGRAPHY, ...(content?.typography || {}) };
  const root = document.documentElement;

  // Colors
  root.style.setProperty('--brand-primary', colors.primaryColor);
  root.style.setProperty('--brand-green', colors.primaryColor);
  root.style.setProperty('--brand-secondary', colors.secondaryColor);
  root.style.setProperty('--brand-yellow', colors.secondaryColor);
  root.style.setProperty('--brand-accent', colors.accentColor);
  root.style.setProperty('--page-bg', colors.pageBgColor || '#FFFFFF');
  root.style.setProperty('--card-bg', colors.cardBgColor || '#FFFFFF');
  root.style.setProperty('--header-bg', colors.headerBgColor || '#FFFFFF');
  root.style.setProperty('--footer-bg', colors.footerBgColor || '#12351F');
  root.style.setProperty('--text-color', colors.textColor || '#1B4D2E');
  root.style.setProperty('--btn-bg', colors.buttonBgColor || '#1B4D2E');
  root.style.setProperty('--btn-text', colors.buttonTextColor || '#FFF8E7');
  root.style.setProperty('--border-color', colors.borderColor || '#1B4D2E26');

  // Typography
  if (typography.headingFont) {
    root.style.setProperty('--heading-font', typography.headingFont);
  }
  if (typography.bodyFont) {
    root.style.setProperty('--body-font', typography.bodyFont);
  }
  if (typography.baseFontSize) {
    root.style.setProperty('--base-font-size', typography.baseFontSize);
  }
}
