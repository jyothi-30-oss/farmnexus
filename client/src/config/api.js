// Production API configuration for FarmNexus
export const API_BASE = (import.meta.env.VITE_API_URL || 'https://farmnexus.onrender.com').replace(/\/+$/, '');

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
