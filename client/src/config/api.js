// In production, VITE_API_URL can point to the deployed backend domain.
// If unset, it defaults to empty string for same-origin or reverse-proxy routing.
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
