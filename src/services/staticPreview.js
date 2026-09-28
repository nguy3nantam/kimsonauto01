import settings from '../../server/data/settings.json';
import pillars from '../../server/data/pillars.json';
import branches from '../../server/data/branches.json';
import esg from '../../server/data/esg.json';
import news from '../../server/data/news.json';
import sliders from '../../server/data/sliders.json';
import { publicAsset } from './assets';

const enabled = import.meta.env.VITE_STATIC_PREVIEW === 'true';
const clone = value => JSON.parse(JSON.stringify(value));
const withImages = item => {
  const result = { ...item };
  for (const key of ['image', 'imageUrl', 'thumbnail', 'logo', 'logoWhite', 'favicon']) {
    if (key in result) result[key] = publicAsset(result[key]);
  }
  return result;
};

export function getStaticPreviewData(endpoint, options = {}) {
  if (!enabled || (options.method && !['GET', 'HEAD'].includes(options.method.toUpperCase()))) {
    return undefined;
  }

  const url = new URL(endpoint, 'https://preview.local');
  const path = url.pathname;
  let value;

  if (path === '/api/settings') value = withImages(settings);
  else if (path === '/api/pillars') value = pillars.map(withImages);
  else if (path === '/api/branches') value = branches.map(withImages);
  else if (path === '/api/esg') value = esg.map(withImages);
  else if (path === '/api/sliders') value = sliders.filter(item => item.active !== false).map(withImages);
  else if (path === '/api/news') value = news.filter(item => item.published !== false).map(withImages);
  else if (path.startsWith('/api/news/')) {
    const id = decodeURIComponent(path.slice('/api/news/'.length));
    value = news.find(item => String(item.id) === id && item.published !== false) || null;
  } else if (path === '/api/auth/me') {
    throw Object.assign(new Error('Authentication is unavailable in the static preview'), { status: 401 });
  } else {
    return undefined;
  }

  return clone(value);
}
