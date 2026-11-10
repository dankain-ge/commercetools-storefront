import type { Money } from './types';

export interface CountryConfig { currency: string; locale: string; country: string; label: string }

export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  'en-US': { locale: 'en-US', currency: 'USD', country: 'US', label: 'United States' },
  'en-GB': { locale: 'en-GB', currency: 'GBP', country: 'GB', label: 'United Kingdom' },
  'de-DE': { locale: 'de-DE', currency: 'EUR', country: 'DE', label: 'Germany' },
};

export const DEFAULT_LOCALE = COUNTRY_CONFIG['en-US'];

export const LOCALE_COOKIE = 'your-shop-country-locale';

export function configForLocale(locale: string | undefined): CountryConfig {
  return (locale && COUNTRY_CONFIG[locale]) || DEFAULT_LOCALE;
}

export function formatMoney(money: Money | undefined, locale = 'en-US'): string {
  if (!money) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: money.currencyCode })
    .format(money.centAmount / Math.pow(10, money.fractionDigits ?? 2));
}

export function getLocalizedString(obj: Record<string, string> | undefined, locale: string): string {
  if (!obj) return '';
  if (obj[locale]) return obj[locale];
  const lang = locale.split('-')[0];
  const sameLang = Object.keys(obj).find((k) => k === lang || k.startsWith(`${lang}-`));
  if (sameLang) return obj[sameLang];
  return Object.values(obj)[0] ?? '';
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
