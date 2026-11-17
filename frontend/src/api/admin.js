import { ApiError, ensureCsrfToken } from './client';

const BASE = '/api/manage';

async function call(path, { method = 'GET', payload, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (method !== 'GET') {
    headers['X-CSRFToken'] = await ensureCsrfToken();
    if (!(payload instanceof FormData)) headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${BASE}${path}`, {
    method, headers, signal, credentials: 'same-origin',
    ...(payload === undefined ? {} : {body: payload instanceof FormData ? payload : JSON.stringify(payload)}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const msg = data?.detail || Object.entries(data || {}).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(', '):v}`).join('; ');
    throw new ApiError(msg || `Ошибка API (${response.status})`, response.status);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const adminApi = {
  me: () => call('/me/'),
  catalogs: () => call('/catalogs/'),
  createCatalog: (name) => call('/catalogs/', {method:'POST',payload:{name}}),
  renameCatalog: (id,name) => call(`/catalogs/${id}/`, {method:'PATCH',payload:{name}}),
  deleteCatalog: (id) => call(`/catalogs/${id}/`, {method:'DELETE'}),
  products: () => call('/products/'),
  product: (id) => call(`/products/${encodeURIComponent(id)}/`),
  createProduct: (values) => call('/products/', {method:'POST',payload:values}),
  updateProduct: (id,values) => call(`/products/${encodeURIComponent(id)}/`, {method:'PATCH',payload:values}),
  deleteProduct: (id) => call(`/products/${encodeURIComponent(id)}/`, {method:'DELETE'}),
  upload: (id,file) => {
    const data = new FormData();
    data.append('image', file, file.name);
    return call(`/products/${encodeURIComponent(id)}/images/`, {method:'POST',payload:data});
  },
  setCover: (id,photoId) => call(`/products/${encodeURIComponent(id)}/images/${photoId}/`, {method:'PATCH',payload:{is_primary:true}}),
  deletePhoto: (id,photoId) => call(`/products/${encodeURIComponent(id)}/images/${photoId}/`, {method:'DELETE'}),
};
