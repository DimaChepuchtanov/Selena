import { createContext, useContext, useMemo, useState } from 'react';

const Context = createContext(null);
const KEY = 'selena-shop-v1';

function readState() {
  try {
    const state = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { cart: Array.isArray(state.cart) ? state.cart : [], favorites: Array.isArray(state.favorites) ? state.favorites : [] };
  } catch { return { cart: [], favorites: [] }; }
}

export function ShopProvider({ children }) {
  const [state, setState] = useState(readState);
  const [cartOpen, setCartOpen] = useState(false);
  function update(mutator) {
    setState(current => {
      const next = mutator(current);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage may be disabled */ }
      return next;
    });
  }
  function addToCart(product, amount = 1) {
    if (!product || product.stock <= 0) return;
    update(s => {
      const item = s.cart.find(item => item.id === product.id);
      const cart = item
        ? s.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + amount } : i)
        : [...s.cart, { id: product.id, name: product.name, price: product.price, image: product.images?.[0], quantity: amount }];
      return { ...s, cart };
    });
    setCartOpen(true);
  }
  const removeFromCart = id => update(s => ({ ...s, cart: s.cart.filter(item => item.id !== id) }));
  const toggleFavorite = id => update(s => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter(i => i !== id) : [...s.favorites, id] }));
  const value = useMemo(() => ({ ...state, cartOpen, setCartOpen, addToCart, removeFromCart, toggleFavorite,
    cartCount: state.cart.reduce((n, item) => n + item.quantity, 0),
  }), [state, cartOpen]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useShop = () => useContext(Context);
