// Sample-data images live on storage.googleapis.com and support no on-the-fly resizing,
// so every transform is the identity. Swap these for your CDN's URL rules later.
export function transformListingImageUrl(url: string): string { return url; }
export function transformDetailImageUrl(url: string): string { return url; }
export function transformThumbnailImageUrl(url: string): string { return url; }
