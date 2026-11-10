'use client';
import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { useCartContext } from '@/context/CartContext';
import { formatMoney } from '@/lib/utils';
import { transformThumbnailImageUrl } from '@/lib/ct/image-config';

export default function CartView() {
  const { cart, isLoading, mutateCart } = useCartContext();
  const locale = useLocale();
  const t = useTranslations('cart');
  const [busy, setBusy] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  if (cart === undefined || (isLoading && !cart)) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-6 text-charcoal-light">{t('empty')}</p>
        <Link href="/"><Button variant="outline">{t('continueShopping')}</Button></Link>
      </div>
    );
  }

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try { await fn(); } catch { /* cart state is unchanged on failure */ } finally { setBusy(null); }
  };

  const applyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCodeError(null);
    setBusy('code');
    try { await mutateCart.applyDiscountCode(code.trim()); setCode(''); }
    catch (err) { setCodeError(err instanceof Error ? err.message : t('invalidCode')); }
    finally { setBusy(null); }
  };

  const discountTotal = cart.subtotal.centAmount - cart.totalPrice.centAmount;

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <ul className="divide-y divide-border lg:col-span-3">
        {cart.lineItems.map((li) => (
          <li key={li.id} className="flex gap-4 py-5">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
              {li.image && <Image src={transformThumbnailImageUrl(li.image)} alt={li.name} fill sizes="96px" className="object-cover" />}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex justify-between gap-4">
                <div>
                  <Link href={`/p/${li.sku}`} className="font-medium hover:underline">{li.name}</Link>
                  <p className="text-xs text-charcoal-light">{li.sku}</p>
                </div>
                <div className="text-right text-sm">
                  {li.price.discounted ? (
                    <><span className="font-medium">{formatMoney(li.price.discounted, locale)}</span> <s className="text-charcoal-light">{formatMoney(li.price.value, locale)}</s></>
                  ) : <span className="font-medium">{formatMoney(li.price.value, locale)}</span>}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="inline-flex items-center rounded-sm border border-border">
                  <button className="px-3 py-1 disabled:opacity-40" disabled={busy === li.id} onClick={() => run(li.id, () => mutateCart.updateQuantity(li.id, li.quantity - 1))} aria-label="−">−</button>
                  <span className="min-w-8 text-center text-sm">{busy === li.id ? '…' : li.quantity}</span>
                  <button className="px-3 py-1 disabled:opacity-40" disabled={busy === li.id} onClick={() => run(li.id, () => mutateCart.updateQuantity(li.id, li.quantity + 1))} aria-label="+">+</button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <strong>{formatMoney(li.totalPrice, locale)}</strong>
                  <button className="text-xs text-charcoal-light hover:text-red-600" onClick={() => run(li.id, () => mutateCart.removeItem(li.id))}>{t('remove')}</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-sm border border-border bg-white p-6 lg:col-span-2 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-semibold">{t('summary')}</h2>
        <form onSubmit={applyCode} className="mb-4 flex items-end gap-2">
          <div className="flex-1"><Input label={t('discountCode')} value={code} onChange={(e) => setCode(e.target.value)} error={codeError ?? undefined} placeholder="BOGO" /></div>
          <Button type="submit" variant="outline" isLoading={busy === 'code'}>{t('apply')}</Button>
        </form>
        {cart.discountCodes.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-2">
            {cart.discountCodes.map((d) => (
              <li key={d.id}>
                <Badge variant={d.state === 'MatchesCart' ? 'success' : 'warning'} className="gap-2">
                  {d.code || d.id}
                  <button onClick={() => run(d.id, () => mutateCart.removeDiscountCode(d.id))} aria-label={t('remove')}>✕</button>
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>{t('subtotal')}</dt><dd>{formatMoney(cart.subtotal, locale)}</dd></div>
          {discountTotal > 0 && <div className="flex justify-between text-sage"><dt>{t('discount')}</dt><dd>−{formatMoney({ ...cart.totalPrice, centAmount: discountTotal }, locale)}</dd></div>}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>{t('total')}</dt><dd>{formatMoney(cart.totalPrice, locale)}</dd></div>
        </dl>
        <p className="mt-1 text-xs text-charcoal-light">{t('shippingNote')}</p>
        <Link href="/checkout" className="mt-6 block"><Button size="lg" className="w-full">{t('checkout')}</Button></Link>
      </aside>
    </div>
  );
}
