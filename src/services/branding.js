import { useState, useEffect } from 'react';
import { api } from './api';

export const DEFAULT_BRANDING = {
  logo: '/logo-kimson.png',
  logoWhite: '/logo-kimson-white.png',
  favicon: '/favicon.png',
  siteTitle: 'Kim Sơn Automobiles - Cổng Thông Tin Hệ Sinh Thái Ô Tô'
};

export function getStoredBranding() {
  try {
    const raw = localStorage.getItem('kimson_branding');
    if (raw) return { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading stored branding:', e);
  }
  return DEFAULT_BRANDING;
}

export function applyFavicon(faviconUrl) {
  if (!faviconUrl) return;
  const links = document.querySelectorAll("link[rel*='icon']");
  links.forEach(link => {
    link.href = faviconUrl;
  });
}

export function useBranding() {
  const [branding, setBranding] = useState(getStoredBranding);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch latest from API on mount
    api.getSettings()
      .then(data => {
        if (!isMounted || !data) return;
        const updated = {
          logo: data.logo || DEFAULT_BRANDING.logo,
          logoWhite: data.logoWhite || DEFAULT_BRANDING.logoWhite,
          favicon: data.favicon || DEFAULT_BRANDING.favicon,
          siteTitle: data.siteTitle || DEFAULT_BRANDING.siteTitle
        };
        setBranding(updated);
        try {
          localStorage.setItem('kimson_branding', JSON.stringify(updated));
        } catch (e) {}

        applyFavicon(updated.favicon);
      })
      .catch(err => {
        console.warn('Could not load branding settings, using cached:', err.message);
      });

    // 2. Listen to real-time branding update events
    const handleUpdate = (e) => {
      if (e.detail) {
        setBranding(prev => {
          const next = { ...prev, ...e.detail };
          try {
            localStorage.setItem('kimson_branding', JSON.stringify(next));
          } catch (err) {}
          applyFavicon(next.favicon);
          return next;
        });
      }
    };

    window.addEventListener('kimson-branding-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('kimson-branding-updated', handleUpdate);
    };
  }, []);

  return branding;
}
