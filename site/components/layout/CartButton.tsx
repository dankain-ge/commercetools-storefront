'use client';
import { useTranslations } from 'next-intl';
import { useCartContext } from '@/context/CartContext';

export default function CartButton() {
  const { itemCount, openMiniCart } = useCartContext();
  const t = useTranslations('cart');
  return (
    <button onClick={openMiniCart} className="relative rounded px-2 py-1.5 text-sm hover:bg-cream-dark" aria-label={t('title')}>
      {t('title')}
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terra px-1 text-[10px] font-semibold text-cream">{itemCount}</span>
      )}
    </button>
  );
}
