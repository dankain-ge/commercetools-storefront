import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Product } from '@/lib/types';
import { transformListingImageUrl } from '@/lib/ct/image-config';
import PriceDisplay from './PriceDisplay';

export default function ProductCard({ product, locale, priority = false }: { product: Product; locale: string; priority?: boolean }) {
  const v = product.variants[0];
  const image = v?.images[0];
  return (
    <Link href={`/p/${v?.sku}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-dark">
        {image && (
          <Image
            src={transformListingImageUrl(image)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {v?.price?.discounted && <span className="absolute left-2 top-2 rounded-full bg-terra px-2 py-0.5 text-[10px] font-semibold uppercase text-cream">Sale</span>}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium leading-snug group-hover:underline">{product.name}</h3>
        <PriceDisplay price={v?.price} locale={locale} className="text-sm" />
      </div>
    </Link>
  );
}
