const optimizedAssets = {
  '/logo-kimson.png': '/logo-kimson.webp',
  '/logo-kimson-white.png': '/logo-kimson-white.webp',
  '/logo-square.png': '/og-kimson.jpg',
  '/vinfast-kimson-bienhoa.jpg': '/vinfast-kimson-bienhoa.avif',
};

export function publicAsset(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  const asset = optimizedAssets[value] || value;
  const base = import.meta.env.BASE_URL || '/';
  if (base !== '/' && asset.startsWith(base)) return asset;
  return `${base}${asset.slice(1)}`;
}

export function imageVariant(value, { width, quality = 75 } = {}) {
  const asset = publicAsset(value);
  if (typeof asset !== 'string' || !asset.startsWith('https://images.unsplash.com/')) return asset;
  const url = new URL(asset);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  if (width) url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  return url.toString();
}
