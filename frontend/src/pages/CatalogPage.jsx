import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { CATEGORY_NAMES, itemCount } from '../utils/format';

const categories = Object.entries(CATEGORY_NAMES);
export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const selected = CATEGORY_NAMES[params.get('category')] ? params.get('category') : 'all';
  const [search, setSearch] = useState(params.get('search') || '');
  const [sort, setSort] = useState('default');
  const { items, pending, error } = useProducts(selected);
  const displayed = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('ru');
    const result = items.filter(item => !q || `${item.name} ${item.description}`.toLocaleLowerCase('ru').includes(q));
    if (sort === 'price-asc') result.sort((a,b) => a.price-b.price);
    if (sort === 'price-desc') result.sort((a,b) => b.price-a.price);
    if (sort === 'title') result.sort((a,b) => a.name.localeCompare(b.name,'ru'));
    return result;
  }, [items, search, sort]);
  const select = key => setParams(key === 'all' ? {} : {category:key});
  return <div className="catalog-theme"><div className="sky" aria-hidden="true"/><SiteHeader catalogStyle/>
    <main>
      <section className="catalog-intro shell" aria-labelledby="catalog-title">
        <div className="breadcrumbs"><Link to="/">Главная</Link><span>/</span><span>Каталог</span></div>
        <div className="catalog-intro__inner"><div className="intro-copy"><span className="eyebrow"><span className="eyebrow__line"/> СОЗДАНО С ДУШОЙ</span><h1 id="catalog-title">Магия в каждой <em>детали</em></h1><p>Авторские колоды и особенные вещи, в которых встречаются символы, вдохновение и тихая красота.</p><div className="intro-note"><span className="mini-spark">✧</span> Каждая вещь — маленькая история</div></div>
          <div className="intro-orbit" aria-hidden="true"><div className="intro-orbit__ring intro-orbit__ring--outer"/><div className="intro-orbit__ring intro-orbit__ring--inner"/><span className="intro-orbit__star intro-orbit__star--one">✦</span><span className="intro-orbit__star intro-orbit__star--two">✧</span><div className="intro-orbit__moon"/><span className="intro-orbit__caption">THE MAGIC WITHIN</span></div></div>
      </section>
      <section className="catalog-section shell" aria-label="Товары каталога">
        <div className="catalog-toolbar"><div className="catalog-toolbar__left"><span className="overline">КОЛЛЕКЦИЯ</span><h2>Найдите своё <em>вдохновение</em></h2><p className="result-count" aria-live="polite">{pending ? 'Загрузка...' : itemCount(displayed.length)}</p></div>
        <div className="catalog-controls"><label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} type="search" placeholder="Поиск по каталогу" aria-label="Поиск товаров"/></label><label className="sort-field"><span className="visually-hidden">Сортировка</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="default">По умолчанию</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="title">По названию</option></select><span aria-hidden="true">⌄</span></label></div></div>
        <div className="filter-row" role="group" aria-label="Категории товаров">{categories.map(([key,label]) => <button key={key} type="button" className={`filter-chip ${key === selected ? 'is-active' : ''}`} aria-pressed={key===selected} onClick={()=>select(key)}>{label}</button>)}</div>
        {error && <div className="api-status" role="alert">Не удалось загрузить товары: {error}. Проверьте доступность Django API.</div>}
        {pending ? <p className="sz-loading">Получаем товары из каталога...</p> : !error && displayed.length ? <div className="products-grid">{displayed.map(p => <ProductCard product={p} key={p.id}/>)}</div> : !error && <div className="empty-state"><span aria-hidden="true">☾</span><h3>Пока ничего не найдено</h3><p>Попробуйте выбрать другую категорию или изменить запрос.</p><button className="button button--outline" onClick={() => {select('all');setSort('default');setSearch('');}}>Показать все товары</button></div>}
      </section>
      <section className="catalog-bottom shell"><div className="catalog-bottom__icon">✧</div><div><strong>Вещи, которым хочется доверить свою историю</strong><p>Откройте понравившуюся карточку, чтобы рассмотреть изображения и подробности.</p></div><Link to="/#delivery" className="text-link">О доставке ↗</Link></section>
    </main><SiteFooter/>
  </div>;
}
