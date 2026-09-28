import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { ecosystemData } from '../data/ecosystem';
import { DEFAULT_BRANDING, applyFavicon, getStoredBranding } from './branding';

const PublicContentContext = createContext(null);
const pendingLoads = new Map();
const sources = {
  settings: { load: api.getSettings, fallback: { ...ecosystemData, totalEngineers: 300, totalCustomers: 50000, satisfactionRate: '99%' } },
  pillars: { load: api.getPillars, fallback: ecosystemData.pillars },
  branches: { load: api.getBranches, fallback: ecosystemData.branches },
  esg: { load: api.getEsg, fallback: ecosystemData.sustainability },
};
const initialSettings = { ...sources.settings.fallback, ...getStoredBranding() };
const loadShared = (name, loader) => {
  if (!pendingLoads.has(name)) {
    pendingLoads.set(name, Promise.resolve().then(loader).finally(() => pendingLoads.delete(name)));
  }
  return pendingLoads.get(name);
};

export function PublicContentProvider({ children }) {
  const [content, setContent] = useState({ settings: initialSettings, pillars: [], branches: [], esg: [] });
  const [loading, setLoading] = useState({ settings: true, pillars: true, branches: true, esg: true });

  useEffect(() => {
    let mounted = true;
    applyFavicon(initialSettings.favicon);
    const versions = {};
    const loaded = {};
    const load = name => {
      const source = sources[name];
      const version = versions[name] = (versions[name] || 0) + 1;
      const current = () => mounted && versions[name] === version;
      loadShared(name, source.load).then(data => {
        if (name === 'settings' ? !data || Array.isArray(data) || typeof data !== 'object' : !Array.isArray(data)) {
          throw new Error(`Invalid public ${name} data`);
        }
        if (current()) {
          loaded[name] = true;
          const value = name === 'settings' ? {
            ...data,
            logo: data.logo || DEFAULT_BRANDING.logo,
            logoWhite: data.logoWhite || DEFAULT_BRANDING.logoWhite,
            favicon: data.favicon || DEFAULT_BRANDING.favicon,
            siteTitle: data.siteTitle || DEFAULT_BRANDING.siteTitle,
          } : data;
          setContent(previous => ({ ...previous, [name]: value }));
          if (name === 'settings') {
            applyFavicon(value.favicon);
            try {
              localStorage.setItem('kimson_branding', JSON.stringify({ logo: value.logo, logoWhite: value.logoWhite, favicon: value.favicon, siteTitle: value.siteTitle }));
            } catch {}
          }
        }
      }).catch(error => {
        console.warn(`Could not load ${name}; using fallback:`, error.message);
        if (current() && !loaded[name]) setContent(previous => ({ ...previous, [name]: name === 'settings' ? initialSettings : source.fallback }));
      }).finally(() => {
        if (current()) setLoading(previous => ({ ...previous, [name]: false }));
      });
    };
    Object.keys(sources).forEach(load);
    const onUpdate = event => { if (sources[event.detail]) load(event.detail); };
    window.addEventListener('kimson-content-updated', onUpdate);
    return () => { mounted = false; window.removeEventListener('kimson-content-updated', onUpdate); };
  }, []);

  return <PublicContentContext.Provider value={{ ...content, loading }}>{children}</PublicContentContext.Provider>;
}

export function usePublicContent() {
  return useContext(PublicContentContext);
}
