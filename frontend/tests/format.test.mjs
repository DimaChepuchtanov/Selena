import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { detectCategory, normalizeProduct, normalizeImages, safeImageUrl } from '../src/utils/format.js';

test('normalizes modern catalog product with primary image', () => {
  const product = normalizeProduct({
    uuid: '00000000-0000-4000-8000-000000000001',
    name: 'Колода',
    describe: 'Описание',
    price: 2450,
    stock: 3,
    image: '/media/products/cover.png',
  });
  assert.equal(product.name, 'Колода');
  assert.equal(product.description, 'Описание');
  assert.equal(product.images[0], '/media/products/cover.png');
});

test('supports legacy array payloads', () => {
  const product = normalizeProduct(['uuid', 'Колода', 1200, 2], { id: 1, category: 'decks' });
  assert.equal(product.id, 'uuid');
  assert.equal(product.stock, 2);
});

test('normalizes image-gallery objects from admin API', () => {
  assert.deepEqual(normalizeImages({ images: [{ id: 1, url: '/media/products/1.png' }] }), ['/media/products/1.png']);
});

test('does not render javascript: or protocol-relative URLs as images', () => {
  assert.notEqual(safeImageUrl('javascript:alert(1)'), 'javascript:alert(1)');
  assert.notEqual(safeImageUrl('//evil.example/image'), '//evil.example/image');
});

test('recognizes catalog categories', () => {
  assert.equal(detectCategory('Аксессуары'), 'accessories');
  assert.equal(detectCategory('Колоды'), 'decks');
});

test('defines required React routes and API reverse proxy', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  for (const route of ['/', '/catalog', '/product/:id', '/auth', '/reg', '/profile', '/manage']) {
    assert.ok(app.includes('path="' + route + '"'), 'Missing route: ' + route);
  }
  const vite = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
  for (const route of ['/api', '/user', '/media']) {
    assert.ok(vite.includes("'" + route + "'"), 'Missing proxy: ' + route);
  }
});
