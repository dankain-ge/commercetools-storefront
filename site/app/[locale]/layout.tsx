import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SWRConfig } from 'swr';
import { routing } from '@/i18n/routing';
import { getSession } from '@/lib/session';
import { getCart } from '@/lib/ct/cart';
import { getCategoryTree } from '@/lib/ct/categories';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { KEY_ACCOUNT, KEY_CART } from '@/lib/cache-keys';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MiniCart from '@/components/cart/MiniCart';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Lifestyle & Home', template: '%s | Lifestyle & Home' },
  description: 'Furniture, kitchen and home decor — a commercetools demo storefront.',
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [session, messages, categoryTree] = await Promise.all([getSession(), getMessages(), getCategoryTree(locale)]);

  // Seed SWR so the header renders cart count and account state without a client round-trip.
  let initialCart = null;
  if (session.cartId) {
    const cart = await getCart(session.cartId, locale).catch(() => null);
    if (cart && cart.state === 'Active' && cart.currencyCode === COUNTRY_CONFIG[locale].currency) initialCart = cart;
  }
  const initialUser = session.customerId
    ? { id: session.customerId, email: session.customerEmail ?? '', firstName: session.customerFirstName, lastName: session.customerLastName, addresses: [] }
    : null;

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SWRConfig value={{ fallback: { [KEY_CART]: initialCart, [KEY_ACCOUNT]: initialUser } }}>
            <CartProvider>
              <Header categoryTree={categoryTree} />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
              <Footer />
              <MiniCart />
            </CartProvider>
          </SWRConfig>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
