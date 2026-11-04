export const priceLabel = (value) => `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} ₽`;
export function itemCount(n) {
  const a = Math.abs(n) % 100, b = a % 10;
  return `${n} ${a > 10 && a < 20 ? 'товаров' : b === 1 ? 'товар' : b >= 2 && b <= 4 ? 'товара' : 'товаров'}`;
}
export const CATEGORY_NAMES = { all: 'Все товары', decks: 'Колоды Таро', accessories: 'Аксессуары', art: 'Авторские работы' };
export const DEFAULT_IMAGE = '/images/default-cover.png';

export function safeImageUrl(raw) {
  if (typeof raw !== 'string') return DEFAULT_IMAGE;
  const value = raw.trim();
  if (!value || /[\u0000-\u001f]/.test(value)) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value) || /^\.\/[\w./%?=&+\-]+$/.test(value)) return value;
  return DEFAULT_IMAGE;
}

export function normalizeImages(raw) {
  const list = Array.isArray(raw?.images) ? raw.images : raw?.images ? [raw.images] : [];
  const more = !list.length && (raw?.image || raw?.photo || raw?.cover) ? [raw.image || raw.photo || raw.cover] : [];
  const images = [...list, ...more].map(item => safeImageUrl(typeof item === 'string' ? item : item?.img || item?.image || item?.url || item?.src)).filter(url => url !== DEFAULT_IMAGE);
  return images.length ? [...new Set(images)] : [DEFAULT_IMAGE];
}

export function normalizeProduct(raw, catalog = {}) {
  if (!raw) return null;
  // Current Django CatalogView returns: [uuid, name, price, stock].
  // The previous JS expected objects. Support both while the API evolves.
  if (Array.isArray(raw)) {
    const id = String(raw[0] ?? '');
    if (!id) return null;
    return {
      id, slug: id, name: String(raw[1] ?? 'Без названия'), price: Number(raw[2]) || 0,
      stock: Number(raw[3]) || 0, description: '', full_description: '',
      catalogId: catalog.id ?? null, category: catalog.category ?? 'decks', images: [DEFAULT_IMAGE],
    };
  }
  if (typeof raw !== 'object') return null;
  const id = String(raw.uuid ?? raw.id ?? raw.slug ?? '');
  if (!id) return null;
  return {
    id, slug: String(raw.slug ?? id), name: String(raw.name ?? raw.title ?? 'Без названия'),
    price: Number(raw.price ?? 0) || 0, stock: Number(raw.stock ?? raw.stock_quantity ?? raw.quantity ?? 0) || 0,
    description: String(raw.description ?? raw.describe ?? ''),
    full_description: String(raw.full_description ?? raw.describe ?? raw.description ?? ''),
    category: String(raw.category ?? (raw.catalog_name ? detectCategory(raw.catalog_name) : null) ?? catalog.category ?? 'decks'),
    catalog_name: raw.catalog_name ?? catalog.name ?? '',
    catalogId: raw.catalog_id ?? raw.catalog ?? catalog.id ?? null,
    images: normalizeImages(raw),
  };
}

export function detectCategory(name = '') {
  const value = String(name).toLocaleLowerCase('ru');
  if (/аксессуар|чехол|мешоч|упаковк/.test(value)) return 'accessories';
  if (/арт|авторск.*работ|картина|постер/.test(value)) return 'art';
  return 'decks';
}
