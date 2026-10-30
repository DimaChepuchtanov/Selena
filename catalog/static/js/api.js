const API_BASE = '/api/catalog'


async function request(url) {
  const response = await fetch(url, {method:'GET',headers:{Accept:'application/json'},credentials:'same-origin'});

  if (!response.ok) {
    const error = new Error(`Ошибка API: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}


async function getCards(current_catalog){
  try{
    const data = await request(API_BASE + `/${current_catalog}`);
    console.log(data);
    const records = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : (Array.isArray(data.products) ? data.products : []));
    return {items: records.map(normalizeProduct).filter(Boolean), isDemo:false};
  }
  catch (error){
      console.warn('[Selena Znaju] API каталога недоступен. Показываем демо-пустышки.',error);
      return {items:demoItems(),isDemo:true};
  }
}


// (function () {
//   'use strict';

//   const API_BASE = '/api/catalog/products/'; // ИЗМЕНИТЬ ТОЛЬКО ЗДЕСЬ, если URL в Django другой.
//   const IMAGE_FALLBACK = 'assets/deck-moon.svg';
//   const CATEGORY_NAMES = {
//     decks: 'Колоды Таро', accessories: 'Аксессуары', art: 'Авторские работы'
//   };

//   function safeImageUrl(value) {
//     if (typeof value !== 'string') return IMAGE_FALLBACK;
//     const v = value.trim();
//     // Только http(s) или относительные адреса; запрещаем javascript:, data:, file: и прочие схемы.
//     if (!v || /[\u0000-\u001F]/.test(v)) return IMAGE_FALLBACK;
//     if (/^https?:\/\//i.test(v) || /^\/(?!\/)/.test(v) || /^(?:\.\/)?[\w-][\w./%?=&+-]*$/i.test(v)) return v;
//     return IMAGE_FALLBACK;
//   }

//   function normalizeImages(raw) {
//     let list = Array.isArray(raw.images) ? raw.images : [];
//     if (!list.length && (raw.image || raw.photo)) list = [raw.image || raw.photo];
//     const normalized = list.map(item => {
//       const src = typeof item === 'string' ? item : item && (item.image || item.url || item.src);
//       return src ? safeImageUrl(src) : null;
//     }).filter(Boolean);
//     return normalized.length ? normalized : [IMAGE_FALLBACK];
//   }

//   function normalizeProduct(raw) {
//     if (!raw || typeof raw !== 'object') return null;
//     const name = String(raw.name ?? raw.title ?? 'Без названия');
//     const price = Number(raw.price ?? 0);
//     const stock = Number(raw.stock ?? raw.stock_quantity ?? raw.quantity ?? 0);
//     return {
//       id: raw.id ?? null,
//       slug: String(raw.slug ?? raw.id ?? ''),
//       name,
//       description: String(raw.description ?? ''),
//       full_description: String(raw.full_description ?? raw.description ?? ''),
//       price: Number.isFinite(price) ? Math.max(0,price) : 0,
//       stock: Number.isFinite(stock) ? Math.max(0,Math.floor(stock)) : 0,
//       category: String(raw.category ?? 'decks'),
//       images: normalizeImages(raw)
//     };
//   }

//   function demoItems() {
//     return (window.SelenaDemoProducts || []).map(normalizeProduct).filter(Boolean);
//   }

//   async function request(url) {
//     const response = await fetch(url, {method:'GET',headers:{Accept:'application/json'},credentials:'same-origin'});
//     if (!response.ok) {
//       const error = new Error(`Ошибка API: ${response.status}`);
//       error.status = response.status;
//       throw error;
//     }
//     return response.json();
//   }

//   async function getProducts() {
//     try {
//       const data = await request(API_BASE);
//       const records = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : (Array.isArray(data.products) ? data.products : []));
//       return {items: records.map(normalizeProduct).filter(Boolean), isDemo:false};
//     } catch (error) {
//       console.warn('[Selena Znaju] API каталога недоступен. Показываем демо-пустышки.',error);
//       return {items:demoItems(),isDemo:true};
//     }
//   }

//   async function getProduct(slug) {
//     try {
//       const data = await request(API_BASE + encodeURIComponent(slug) + '/');
//       const item = normalizeProduct(data.product || data);
//       return {item, isDemo:false};
//     } catch (error) {
//       console.warn('[Selena Znaju] Ошибка загрузки товара.',error);
//       // Для неизвестного slug ничего не подменяем на случайный товар.
//       const demo = demoItems().find(item => item.slug === slug) ?? null;
//       return {item: demo, isDemo: Boolean(demo), error};
//     }
//   }

//   function priceLabel(value) {
//     return new Intl.NumberFormat('ru-RU', {style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value);
//   }

//   window.SelenaApi = {
//     getProducts, getProduct, priceLabel, safeImageUrl,
//     categoryLabel(category) {return CATEGORY_NAMES[category] ?? category;}
//   };
// })();
