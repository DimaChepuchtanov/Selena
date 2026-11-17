import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { ProductShowcase } from '../components/ProductShowcase';
import { getProduct } from '../api/catalog';

export function ProductPage({ legacy = false }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const key = legacy ? params.get('slug') : id;
  const [state, setState] = useState({ loading: true, item: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    setState({loading: true, item: null, error: ''});
    if (!key) {setState({loading:false,item:null,error:'Не указан товар'});return;}
    getProduct(key, {signal: controller.signal})
      .then(item => {if(!controller.signal.aborted) setState({loading:false,item,error:''});})
      .catch(e => {if(e.name!=='AbortError')setState({loading:false,item:null,error:e.message});});
    return () => controller.abort();
  }, [key]);
  const product = state.item;
  return <div className="catalog-theme"><div className="sky"/><SiteHeader/>
    <main className="product-page shell">
      <nav className="breadcrumbs breadcrumbs--product"><Link to="/">Главная</Link><span>/</span><Link to="/catalog">Каталог</Link><span>/</span><span>{product?.name || 'Карточка товара'}</span></nav>
      <Link to="/catalog" className="back-link">← Вернуться в каталог</Link>
      {state.loading ? <p className="sz-loading">Загружаем информацию о товаре...</p> : state.error || !product ? <div className="api-status">{state.error || 'Товар не найден'}. <Link to="/catalog">Вернуться в каталог</Link></div> : <ProductShowcase product={product}/>}
    </main><SiteFooter/>
  </div>;
}
