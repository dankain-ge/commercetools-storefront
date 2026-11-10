'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { useCartContext } from '@/context/CartContext';

export default function AddToCartButton({ sku, disabled }: { sku: string; disabled?: boolean }) {
  const { addToCart } = useCartContext();
  const t = useTranslations('product');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    setBusy(true); setError(null);
    try { await addToCart(sku, qty); }
    catch (e) { setError(e instanceof Error ? e.message : t('addFailed')); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="inline-flex items-center rounded-sm border border-border">
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="−">−</button>
          <span className="min-w-8 text-center text-sm">{qty}</span>
          <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)} aria-label="+">+</button>
        </div>
        <Button size="lg" className="flex-1" onClick={add} isLoading={busy} disabled={disabled}>
          {disabled ? t('outOfStock') : t('addToCart')}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
