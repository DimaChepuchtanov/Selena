import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ProductImage } from './Images';
import { CATEGORY_NAMES, DEFAULT_IMAGE, priceLabel } from '../utils/format';
import { useShop } from '../context/ShopContext';

function DisplayImage({ src, alt = '' }) {
  // blob: URLs are created by this browser from files selected in AdminProductEditor.
  const local = typeof src === 'string' && src.startsWith('blob:');
  return local ? <img src={src} alt={alt} /> : <ProductImage src={src} alt={alt}/>;
}

// Shared by /product/:id and the admin live-preview so the layout stays identical.
export function ProductShowcase({ product: p, preview = false }) {
  const [index, setIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const shop = useShop();
  const images = p?.images?.length ? p.images : [DEFAULT_IMAGE];
  useEffect(() => { setIndex(0); setQty(1); }, [p?.id, p?.images?.[0]]);
  const currentIndex = Math.min(index, images.length - 1);
  const advance = delta => setIndex(i => (i + delta + images.length) % images.length);
  const description = p.full_description || p.description || 'Описание товара появится здесь.';

  return <>
    {preview && <div className="sz-preview-marker">ПРЕДПРОСМОТР · ДАННЫЕ ЕЩЁ НЕ ОПУБЛИКОВАНЫ</div>}
    <div className="product-layout"><section className="gallery" aria-label="Фотографии товара">
      <div className="gallery__main"><DisplayImage src={images[currentIndex]} alt={p.name}/><span className="gallery__corner-mark">✧</span>
        {images.length > 1 && <><button type="button" className="gallery__arrow gallery__arrow--prev" aria-label="Предыдущее фото" onClick={()=>advance(-1)}>‹</button><button type="button" className="gallery__arrow gallery__arrow--next" aria-label="Следующее фото" onClick={()=>advance(1)}>›</button></>}
        <span className="gallery__number">{String(currentIndex+1).padStart(2,'0')} / {String(images.length).padStart(2,'0')}</span>
      </div>
      <div className="gallery__thumbs" aria-label="Выберите изображение">
        {images.map((src,i) => <button key={`${src}-${i}`} type="button" className={`gallery__thumb ${currentIndex===i?'is-active':''}`} aria-pressed={currentIndex===i} aria-label={`Изображение ${i+1}`} onClick={()=>setIndex(i)}><DisplayImage src={src} alt=""/></button>)}
      </div>
      <div className="gallery__hint">✦ Нажмите на миниатюру, чтобы рассмотреть изображение</div>
    </section><section className="product-info">
      <div className="product-info__topline"><span className="eyebrow"><span className="eyebrow__line"/>{(p.catalog_name || CATEGORY_NAMES[p.category] || 'АВТОРСКАЯ КОЛОДА').toUpperCase()}</span><span className="product-info__symbol">✧</span></div>
      <h1>{p.name || 'Название товара'}</h1><p className="product-info__lead">{p.description || 'Авторские карты Selena Znaju'}</p><div className="fine-divider"><span>✦</span></div>
      <span className="info-label">СТОИМОСТЬ</span><div className="product-price">{priceLabel(p.price)}</div>
      <div className={`availability ${Number(p.stock) > 0 ? '' : 'availability--out'}`}><span className="availability__dot"/>{Number(p.stock) > 0 ? `В наличии · Осталось ${p.stock} шт.` : 'Нет в наличии'}</div>
      <div className="product-actions"><div className="quantity-field"><span className="quantity-field__label">КОЛИЧЕСТВО</span><div className="quantity-field__controls"><button type="button" disabled={preview} onClick={()=>setQty(q=>Math.max(1,q-1))} aria-label="Уменьшить количество">−</button><output aria-live="polite">{qty}</output><button type="button" disabled={preview} onClick={()=>setQty(q=>Math.min(Number(p.stock),q+1))} aria-label="Увеличить количество">+</button></div></div>
        <button type="button" className="button button--gold add-to-cart" disabled={preview || !Number(p.stock)} onClick={()=>shop.addToCart(p,qty)}>{Number(p.stock) > 0 ? 'Добавить в корзину ↗' : 'Нет в наличии'}</button></div>
      <p className="cart-disclaimer">{preview ? 'Кнопка покупки отключена в режиме предпросмотра.' : 'Корзина сохраняется в этом браузере. Оформление заказа подключается отдельно.'}</p>
      <div className="info-benefits"><div><span className="benefit-icon">✧</span><span><strong>Авторская работа</strong><small>Особенная вещь с характером</small></span></div><div><span className="benefit-icon">☾</span><span><strong>Бережная упаковка</strong><small>Для сохранности в пути</small></span></div></div>
    </section></div>
    <section className="product-description"><div className="product-description__heading"><span className="eyebrow"><span className="eyebrow__line"/> ИСТОРИЯ В ДЕТАЛЯХ</span><h2>О <em>товаре</em></h2><p>Чуть ближе к созданной истории</p></div><div className="product-description__text">{description.split('\n').filter(Boolean).map((para,i)=><p key={i}>{para}</p>)}</div></section>
    <section className="return-section"><div><span className="overline">ПРОДОЛЖИТЬ ЗНАКОМСТВО</span><h2>В коллекции есть ещё <em>истории</em></h2></div><Link to="/catalog" className="button button--outline">Смотреть весь каталог ↗</Link></section>
  </>;
}
