// Pure client-side filter/sort logic; input array is not mutated.
export function filterAndSortProducts(items, search = '', sort = 'default') {
  const query = String(search).trim().toLocaleLowerCase('ru');
  const filtered = items.filter(item => {
    const text = `${item.name ?? ''} ${item.description ?? ''}`.toLocaleLowerCase('ru');
    return !query || text.includes(query);
  });

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'title') filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return filtered;
}
