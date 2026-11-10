'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { useCartContext } from '@/context/CartContext';

interface SessionResponse { sessionId: string; projectKey: string; region: string; error?: string }

export default function HostedCheckout() {
  const { cart, mutateCart } = useCartContext();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('checkout');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (cart === undefined || started.current) return;
    if (!cart || cart.lineItems.length === 0) { router.replace('/cart'); return; }
    started.current = true;

    (async () => {
      try {
        const res = await fetch('/api/checkout/session', { method: 'POST' });
        const data = (await res.json()) as SessionResponse;
        if (!res.ok) throw new Error(data.error || 'Could not start checkout');

        const { checkoutFlow } = await import('@commercetools/checkout-browser-sdk');
        checkoutFlow({
          projectKey: data.projectKey,
          region: data.region,
          sessionId: data.sessionId,
          locale,
          styles: {
            '--font-family': 'var(--font-sans)',
            '--color-primary': '#1a1a1a',
            '--color-primary-hover': '#4a4a4a',
            '--border-radius': '0.125rem',
          },
          onInfo: async (message) => {
            if (message.code === 'checkout_completed') {
              const payload = message.payload as { order?: { id?: string } } | undefined;
              await fetch('/api/checkout/complete', { method: 'POST' }).catch(() => undefined);
              mutateCart.clear();
              router.push(`/checkout/confirmation?orderId=${encodeURIComponent(payload?.order?.id ?? '')}`);
            }
          },
          onError: (message) => {
            setError(typeof message.payload === 'string' ? message.payload : message.code);
            setStatus('error');
          },
        });
        setStatus('ready');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not start checkout');
        setStatus('error');
      }
    })();
  }, [cart, locale, router, mutateCart]);

  return (
    <div>
      {status === 'loading' && <div className="flex items-center gap-3 py-10 text-sm text-charcoal-light"><Spinner className="h-5 w-5" />{t('loading')}</div>}
      {status === 'error' && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">{t('error')}</p>
          <p className="mt-1">{error}</p>
          <Link href="/cart" className="mt-4 inline-block"><Button variant="outline" size="sm">{t('backToCart')}</Button></Link>
        </div>
      )}
      {/* Required mount point — without it the widget takes over the whole page */}
      <div data-ctc className="min-h-[60vh]" />
    </div>
  );
}
