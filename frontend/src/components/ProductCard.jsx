import { Link } from 'react-router';
import { ProductImage } from './Images';
import { CATEGORY_NAMES, priceLabel } from '../utils/format';
export function ProductCard({ product }) {
  const to = `/product/${encodeURIComponent(product.slug || product.id)}`;
  return <article className="product-card">
    <Link to={to} className="product-card__image"><ProductImage src={product.images?.[0]} alt={`Изображение товара «${product.name}»`}/></Link>
    <div className="product-card__body"><span className="product-card__category">{(CATEGORY_NAMES[product.category] || product.category).toLocaleUpperCase('ru')}</span>
      <h3><Link to={to}>{product.name}</Link></h3>
      <p className="product-card__desc">{product.description || 'Авторская коллекция Selena Znaju'}</p>
      <div className="product-card__bottom"><strong>{priceLabel(product.price)}</strong><span className={`stock ${product.stock ? 'stock--available' : 'stock--unavailable'}`}>{product.stock ? `В наличии: ${product.stock}` : 'Нет в наличии'}</span></div>
    </div>
    <Link to={to} className="product-card__link">Подробнее <span aria-hidden="true">↗</span></Link>
  </article>;
}
