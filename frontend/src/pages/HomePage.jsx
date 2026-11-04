import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { CATEGORY_NAMES } from '../utils/format';

const homeCategories = [
  {code:'decks', title:'Колоды Таро',description:'Авторские полноформатные колоды',symbol:'✦'},
  {code:'decks', title:'Оракулы',description:'Тематические авторские серии',symbol:'☾'},
  {code:'art', title:'Авторские работы',description:'Особенные вещи ручной работы',symbol:'◇'},
  {code:'accessories', title:'Аксессуары',description:'Упаковка и сопутствующие товары',symbol:'✧'},
];
export function HomePage() {
  const [category,setCategory] = useState('all');
  const location = useLocation();
  useEffect(()=>{ if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView(); },[location.hash]);
  return <div className="home-theme"><SiteHeader/>
    <main>
      <section className="home-hero" id="top"><div className="shell home-hero__inner"><div className="home-hero__copy"><div className="home-kicker">АВТОРСКИЙ МИР КАРТ</div><h1>Selena<br/>Znaju <em>Авторские карты Таро</em></h1><p>Символы, которые говорят. Колоды, которые открывают миры. Авторские Таро и оракулы Selena Znaju.</p><div className="home-hero__actions"><Link to="/catalog" className="button button--gold">Смотреть каталог →</Link><a href="#author" className="button button--outline">Об авторе</a></div><div className="home-facts"><span>✦ Авторские колоды</span><span>☾ Глубокая символика</span><span>✧ Бережная доставка</span></div></div><div className="home-hero__art" aria-hidden="true"><div className="home-hero__orbit"/><div className="home-hero__moon"/><div className="home-card home-card--left"><img src="/static/img/home/tarot-photo-2.png" alt="" onError={e=>{e.currentTarget.src='/images/default-cover.png';}}/></div><div className="home-card home-card--right"><img src="/static/img/home/tarot-photo-3.png" alt="" onError={e=>{e.currentTarget.src='/images/default-cover.png';}}/></div><div className="home-card home-card--front"><img src="/static/img/home/tarot-photo-1.png" alt="" onError={e=>{e.currentTarget.src='/images/default-cover.png';}}/></div></div></div></section>
      <section className="home-section shell" id="collections"><div className="home-section__kicker">ВЫБЕРИТЕ НАПРАВЛЕНИЕ</div><h2>Коллекции Selena Znaju</h2><p className="home-section__lead">Выберите направление, чтобы перейти к соответствующей витрине.</p>
        <div className="home-categories">{homeCategories.map((cat,i)=><Link key={i} className="home-category" to={`/catalog?category=${cat.code}`}><div className="home-category__symbol">{cat.symbol}</div><div className="home-category__title">{cat.title}</div><p>{cat.description}</p><span className="home-category__arrow">→</span></Link>)}</div>
      </section>
      <section className="home-section home-section--line" id="catalog"><div className="shell"><div className="home-section__kicker">АВТОРСКИЕ КОЛОДЫ</div><h2>Витрина карт</h2><p className="home-section__lead">Выберите категорию и отправляйтесь в каталог. На главной витрина пока намеренно остаётся пустой.</p>
        <div className="home-tabs" role="group" aria-label="Выберите категорию">{Object.entries(CATEGORY_NAMES).map(([key,name])=><button className={category===key?'active':''} key={key} type="button" aria-pressed={category===key} onClick={()=>setCategory(key)}>{name}</button>)}</div><div className="home-empty"><span>☾</span><h3>Витрина готовится</h3><p>Все товары доступны на отдельной странице каталога.</p><Link className="button button--gold" to={category==='all'?'/catalog':`/catalog?category=${category}`}>Перейти в каталог →</Link></div>
      </div></section>
      <section className="home-section shell" id="author"><div className="home-author"><div><div className="home-section__kicker">АВТОР ПРОЕКТА</div><h2>Selena Znaju</h2><p>Здесь будет история автора, описание творческого подхода и художественной концепции проекта.</p></div><div className="home-author__signature">Selena Znaju</div></div></section>
      <section className="home-section shell" id="delivery"><div className="home-section__kicker">ДОСТАВКА</div><h2>С заботой о каждой колоде</h2><p className="home-section__lead">Предусмотрены варианты доставки через СДЭК и Почту России. Адреса и способы доставки можно будет указать в личном кабинете.</p><Link className="button button--outline" to="/profile">Личный кабинет →</Link></section>
    </main><SiteFooter/>
  </div>;
}
