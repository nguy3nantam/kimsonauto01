export function publicAsset(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  const base = import.meta.env.BASE_URL || '/';
  if (base !== '/' && value.startsWith(base)) return value;
  return `${base}${value.slice(1)}`;
}
