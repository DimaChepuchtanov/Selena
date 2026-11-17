import { request } from './client';
import { detectCategory, normalizeProduct } from '../utils/format';

const normalizeList = data => Array.isArray(data) ? data : data?.results ?? data?.products ?? data?.items ?? [];

export async function getCatalogs({ signal } = {}) {
  const data = await request('/api/catalog/', { signal });
  return normalizeList(data).map(row => {
    const id = Array.isArray(row) ? row[0] : row.id;
    const name = Array.isArray(row) ? row[1] : row.name;
    return { id, name: String(name), category: detectCategory(name) };
  });
}

export async function getCards(catalogId, { signal } = {}) {
  // Current Django supports GET /api/catalog/<int:catalog_id> (not /products/).
  const data = await request(`/api/catalog/${encodeURIComponent(catalogId)}`, { signal });
  return normalizeList(data);
}

export async function getProducts(category = 'all', { signal } = {}) {
  const catalogs = await getCatalogs({ signal });
  const selected = category === 'all' ? catalogs : catalogs.filter(c => c.category === category);
  const lists = await Promise.all(selected.map(async catalog => {
    const records = await getCards(catalog.id, { signal });
    return records.map(row => normalizeProduct(row, catalog)).filter(Boolean);
  }));
  return lists.flat();
}

export async function getProduct(productId, { signal } = {}) {
  // Preferred future detail API, supports slug/UUID; not yet in current Django repo.
  try {
    const item = await request(`/api/catalog/products/${encodeURIComponent(productId)}/`, { signal });
    return normalizeProduct(item);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    if (error.status !== 404 && error.status !== 405) throw error;
  }
  // Fallback to existing list endpoints: no description or image data yet.
  const items = await getProducts('all', { signal });
  return items.find(item => item.id === productId || item.slug === productId) ?? null;
}
