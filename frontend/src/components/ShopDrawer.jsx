import { Link } from 'react-router';
import { useShop } from '../context/ShopContext';
import { priceLabel, DEFAULT_IMAGE } from '../utils/format';
export function ShopDrawer() {
  const { cartOpen, setCartOpen, cart, removeFromCart } = useShop();
  if (!cartOpen) return null;
  return <div className="sz-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setCartOpen(false); }}>
    <aside className="sz-drawer" role="dialog" aria-modal="true" aria-label="Корзина">
      <div className="sz-drawer__head"><h2>Ваша корзина</h2><button onClick={() => setCartOpen(false)} aria-label="Закрыть">✕</button></div>
      {!cart.length ? <p>В корзине пока нет товаров.</p> : <>{cart.map(item => <div className="sz-cart-item" key={item.id}>
        <img src={item.image || DEFAULT_IMAGE} alt="" onError={e => {e.currentTarget.src = DEFAULT_IMAGE;}}/>
        <div><strong>{item.name}</strong><div>{item.quantity} × {priceLabel(item.price)}</div><button className="sz-quiet" onClick={() => removeFromCart(item.id)}>Удалить</button></div>
      </div>)}<p className="sz-cart-total">Итого: {priceLabel(cart.reduce((s,x) => s + x.price * x.quantity,0))}</p>
      <p className="sz-muted">Оформление и оплата заказов будут подключены к Django отдельно. Пока корзина сохраняется только в браузере.</p></>}
      <Link to="/catalog" onClick={() => setCartOpen(false)} className="button button--outline">Продолжить покупки</Link>
    </aside>
  </div>;
}
