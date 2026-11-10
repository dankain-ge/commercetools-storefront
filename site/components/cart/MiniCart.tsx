'use client';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { useCartContext } from '@/context/CartContext';
import { formatMoney } from '@/lib/utils';
import { transformThumbnailImageUrl } from '@/lib/ct/image-config';

export default function MiniCart() {
  const { cart, showMiniCart, closeMiniCart, mutateCart } = useCartContext();
  const locale = useLocale();
  const t = useTranslations('cart');
  const items = cart?.lineItems ?? [];

  return (
    <Drawer
      isOpen={showMiniCart}
      onClose={closeMiniCart}
      title={t('title')}
      footer={cart && items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm"><span>{t('subtotal')}</span><strong>{formatMoney(cart.subtotal, locale)}</strong></div>
          <Link href="/cart" onClick={closeMiniCart}><Button variant="outline" className="w-full">{t('viewCart')}</Button></Link>
          <Link href="/checkout" onClick={closeMiniCart}><Button className="w-full">{t('checkout')}</Button></Link>
        </div>
      ) : undefined}
    >
      {items.length === 0 ? (
        <p className="text-sm text-charcoal-light">{t('empty')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((li) => (
            <li key={li.id} className="flex gap-3 py-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                {li.image && <Image src={transformThumbnailImageUrl(li.image)} alt={li.name} fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col text-sm">
                <Link href={`/p/${li.sku}`} onClick={closeMiniCart} className="font-medium hover:underline">{li.name}</Link>
                <span className="text-xs text-charcoal-light">{t('qty')} {li.quantity}</span>
                <span className="mt-auto">{formatMoney(li.totalPrice, locale)}</span>
              </div>
              <button onClick={() => mutateCart.removeItem(li.id).catch(() => undefined)} className="self-start text-xs text-charcoal-light hover:text-red-600">{t('remove')}</button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
