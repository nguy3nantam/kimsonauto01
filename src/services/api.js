// API client for Kim Sơn Backend
const BASE_URL = '';

export async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Lỗi máy chủ' }));
      throw Object.assign(new Error(err.error || `HTTP ${res.status}`), { status: res.status });
    }

    const data = await res.json();
    if (options.method && !['GET', 'HEAD'].includes(options.method.toUpperCase())) {
      const collection = endpoint.match(/^\/api\/(settings|pillars|branches|esg)(?:\/|\?|$)/)?.[1];
      if (collection) window.dispatchEvent(new CustomEvent('kimson-content-updated', { detail: collection }));
    }
    return data;
  } catch (error) {
    if (error.status !== 401) console.warn(`API call ${endpoint} failed:`, error.message);
    throw error;
  }
}

let currentUserRequest;
const getCurrentUser = () => {
  if (!currentUserRequest) {
    currentUserRequest = fetchApi('/api/auth/me').finally(() => { currentUserRequest = null; });
  }
  return currentUserRequest;
};

export const api = {
  // Auth
  login: (credentials) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: getCurrentUser,
  logout: () => fetchApi('/api/auth/logout', { method: 'POST' }),

  // Users / Registrations
  getUsers: (params = '') => {
    let query = '';
    if (typeof params === 'object' && params !== null) {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') sp.append(k, v);
      });
      const s = sp.toString();
      query = s ? `?${s}` : '';
    } else if (typeof params === 'string' && params) {
      query = params.startsWith('?') ? params : `?${params}`;
    }
    return fetchApi(`/api/users${query}`);
  },
  createUser: (data) => fetchApi('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => fetchApi(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id, params = '') => {
    let query = '';
    if (typeof params === 'object' && params !== null) {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') sp.append(k, v);
      });
      const s = sp.toString();
      query = s ? `?${s}` : '';
    } else if (typeof params === 'string' && params) {
      query = params.startsWith('?') ? params : `?${params}`;
    }
    return fetchApi(`/api/users/${id}${query}`, { method: 'DELETE' });
  },

  // Stats
  getStats: () => fetchApi('/api/stats'),

  // Pillars
  getPillars: () => fetchApi('/api/pillars'),
  updatePillar: (id, data) => fetchApi(`/api/pillars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Branches
  getBranches: () => fetchApi('/api/branches'),
  createBranch: (data) => fetchApi('/api/branches', { method: 'POST', body: JSON.stringify(data) }),
  updateBranch: (id, data) => fetchApi(`/api/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBranch: (id) => fetchApi(`/api/branches/${id}`, { method: 'DELETE' }),

  // News
  getNews: (all = false) => fetchApi(`/api/news${all ? '?all=true' : ''}`),
  getArticle: (id) => fetchApi(`/api/news/${encodeURIComponent(id)}`),
  getEsg: () => fetchApi('/api/esg'),
  createNews: (data) => fetchApi('/api/news', { method: 'POST', body: JSON.stringify(data) }),
  updateNews: (id, data) => fetchApi(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNews: (id) => fetchApi(`/api/news/${id}`, { method: 'DELETE' }),

  // Contacts
  getContacts: () => fetchApi('/api/contacts'),
  submitContact: (data) => fetchApi('/api/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => fetchApi(`/api/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => fetchApi(`/api/contacts/${id}`, { method: 'DELETE' }),

  // Announcements (Thông Báo Nội Bộ)
  getAnnouncements: (params = '') => fetchApi(`/api/announcements${params ? `?${params}` : ''}`),
  createAnnouncement: (data) => fetchApi('/api/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => fetchApi(`/api/announcements/${id}`, { method: 'DELETE' }),

  // Shared Files (File Dùng Chung)
  getSharedFiles: (params = '') => fetchApi(`/api/shared-files${params ? `?${params}` : ''}`),
  createSharedFile: (data) => fetchApi('/api/shared-files', { method: 'POST', body: JSON.stringify(data) }),
  deleteSharedFile: (id) => fetchApi(`/api/shared-files/${id}`, { method: 'DELETE' }),

  // Sliders
  getSliders: (params = '') => fetchApi(`/api/sliders${params ? `?${params}` : ''}`),
  reorderSliders: (ids) => fetchApi('/api/sliders/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
  createSlider: (data) => fetchApi('/api/sliders', { method: 'POST', body: JSON.stringify(data) }),
  updateSlider: (id, data) => fetchApi(`/api/sliders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSlider: (id) => fetchApi(`/api/sliders/${id}`, { method: 'DELETE' }),

  // Settings & Branding
  getSettings: () => fetchApi('/api/settings'),
  updateSettings: (data) => fetchApi('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  uploadImage: (data) => fetchApi('/api/upload', { method: 'POST', body: JSON.stringify(data) }),
};
