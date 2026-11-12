import { test } from 'node:test';
import assert from 'node:assert/strict';

import { filterAndSortProducts } from '../src/utils/catalogFilters.js';

const products = [
  { id: 'alpha', name: 'Колода Альфа', description: 'Солнце', price: 1200 },
  { id: 'beta', name: 'Колода Бета', description: 'Созвездие', price: 2800 },
  { id: 'pouch', name: 'Мешочек', description: 'Аксессуар', price: 500 },
];
const ids = arr => arr.map(p => p.id);

test('catalog shows every product with empty search', () => {
  assert.deepEqual(ids(filterAndSortProducts(products)), ['alpha','beta','pouch']);
});

test('search is case insensitive and ignores surrounding spaces', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, '  КОЛОДА  ')), ['alpha','beta']);
});

test('catalog search includes description', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, 'созвездие')), ['beta']);
});

test('unknown search term returns empty list', () => {
  assert.deepEqual(filterAndSortProducts(products, 'несуществующее'), []);
});

test('price sorting works ascending', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, '', 'price-asc')), ['pouch','alpha','beta']);
});

test('price sorting works descending', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, '', 'price-desc')), ['beta','alpha','pouch']);
});

test('sorting does not mutate original products', () => {
  const before = [...products];
  filterAndSortProducts(products, '', 'price-desc');
  assert.deepEqual(products, before);
});

test('title sorting uses Russian collation', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, '', 'title')), ['alpha','beta','pouch']);
});
