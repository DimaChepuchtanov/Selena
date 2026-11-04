import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useShop } from '../context/ShopContext';

const icons = {
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3.1-6.2 7-6.2s7 2.2 7 6.2"/></>,
  cart: <><path d="M3 5h2l2.1 10.5h11.5l2-8H6"/><circle cx="9" cy="19" r="1"/><circle cx="18" cy="19" r="1"/></>,
};
export function SiteHeader({ catalogStyle = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const shop = useShop();
  const navigate = useNavigate();
  return <header className="site-header sz-header">
    <div className="shell header-inner">
      <Link to="/" className="brand" aria-label="Selena Znaju — главная">
        <span className="brand__mark" aria-hidden="true"><svg viewBox="0 0 46 46" fill="none"><circle cx="23" cy="23" r="20" stroke="currentColor" strokeOpacity=".75"/><path d="M23 7v32M7 23h32M12 12l22 22M34 12 12 34" stroke="currentColor" strokeOpacity=".28"/><path d="M23 12l3.3 7.7L34 23l-7.7 3.3L23 34l-3.3-7.7L12 23l7.7-3.3L23 12Z" fill="currentColor"/></svg></span>
        <span className="brand__type"><span>SELENA ZNAJU</span><small>АВТОРСКИЕ КАРТЫ ТАРО</small></span>
      </Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Основная навигация">
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>Главная</NavLink>
        <NavLink to="/catalog" onClick={() => setMenuOpen(false)}>Каталог</NavLink>
        <Link to="/#author" onClick={() => setMenuOpen(false)}>Об авторе</Link>
        <Link to="/#delivery" onClick={() => setMenuOpen(false)}>Доставка</Link>
      </nav>
      <div className="header-actions">
        <button type="button" className="icon-link" onClick={() => navigate('/profile')} aria-label="Профиль"><svg viewBox="0 0 24 24">{icons.user}</svg></button>
        <button type="button" className="icon-link icon-link--basket" aria-label="Корзина" onClick={() => shop.setCartOpen(true)}>
          <svg viewBox="0 0 24 24">{icons.cart}</svg>{shop.cartCount > 0 && <span className="cart-count">{shop.cartCount}</span>}
        </button>
        <button className="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
      </div>
    </div>
  </header>;
}
