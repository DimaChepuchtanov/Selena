import { useEffect, useState } from 'react';
import { getProducts } from '../api/catalog';

export function useProducts(category = 'all') {
  const [state, setState] = useState({ items: [], pending: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    setState(old => ({ ...old, pending: true, error: '' }));
    getProducts(category, { signal: controller.signal })
      .then(items => setState({ items, pending: false, error: '' }))
      .catch(error => { if (error.name !== 'AbortError') setState({ items: [], pending: false, error: error.message }); });
    return () => controller.abort();
  }, [category]);
  return state;
}
