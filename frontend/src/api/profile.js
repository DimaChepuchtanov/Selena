import { request, ensureCsrfToken } from './client';

// These routes are API contracts for the next backend iteration;
// the current Django repo does NOT yet implement them.
export const getMe = ({ signal } = {}) => request('/api/me/', { signal });
export const getDelivery = ({ signal } = {}) => request('/api/profile/delivery/', { signal });
export const getPurchases = ({ signal } = {}) => request('/api/profile/purchases/', { signal });
export const getViews = ({ signal } = {}) => request('/api/profile/views/', { signal });
export async function saveDelivery(service, payload) {
  const csrf = await ensureCsrfToken();
  return request(`/api/profile/delivery/${service}/`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
    body: JSON.stringify(payload),
  });
}
