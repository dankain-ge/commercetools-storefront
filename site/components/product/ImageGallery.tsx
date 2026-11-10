'use client';
import { useState } from 'react';
import Image from 'next/image';
import { transformDetailImageUrl, transformThumbnailImageUrl } from '@/lib/ct/image-config';
import { cn } from '@/lib/utils';

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-dark">
        {main && <Image src={transformDetailImageUrl(main)} alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover" />}
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <li key={img}>
              <button onClick={() => setActive(i)} className={cn('relative h-20 w-16 overflow-hidden rounded-sm border bg-cream-dark', i === active ? 'border-charcoal' : 'border-transparent')} aria-label={`Image ${i + 1}`}>
                <Image src={transformThumbnailImageUrl(img)} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
