import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { getMe, getPurchases, getViews, getDelivery, saveDelivery } from '../api/profile';
import { ProductImage } from '../components/Images';
import { priceLabel } from '../utils/format';
const fieldSets = {
  cdek: [
    {key:'fio',label:'ФИО получателя',required:true},{key:'phone',label:'Телефон',required:true,type:'tel'},
    {key:'email',label:'Электронная почта',type:'email'},{key:'country',label:'Страна'},
    {key:'region',label:'Область / край'},{key:'city',label:'Город',required:true},
    {key:'postal_code',label:'Почтовый индекс'},{key:'delivery_point',label:'Код ПВЗ СДЭК (для самовывоза)'},
    {key:'address',label:'Адрес доставки (для курьера)'},
  ],
  russian_post: [
    {key:'fio',label:'ФИО получателя',required:true},{key:'phone',label:'Телефон',type:'tel',required:true},
    {key:'index',label:'Почтовый индекс',required:true},{key:'region',label:'Регион'},
    {key:'place',label:'Населённый пункт',required:true},{key:'street',label:'Улица',required:true},
    {key:'house',label:'Дом',required:true},{key:'corpus',label:'Корпус'},
    {key:'building',label:'Строение'},{key:'room',label:'Квартира / офис'},
  ],
};
const sections = [['delivery','Доставка'],['purchases','История покупок'],['views','История просмотров']];
function DeliveryForm({ service, initial, disabled, onSave }) {
  const [values,setValues] = useState(initial || {});
  useEffect(()=>setValues(initial || {}),[initial,service]);
  return <form className="profile-form" onSubmit={e=>{e.preventDefault();onSave(values)}}>
    <div className="profile-fields">{fieldSets[service].map(f => <label key={f.key} className="profile-field"><span>{f.label}{f.required?' *':''}</span><input type={f.type || 'text'} value={values[f.key] || ''} required={f.required} disabled={disabled} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/></label>)}</div>
    <button className="button button--gold" disabled={disabled} type="submit">Сохранить адрес</button>
  </form>;
}
export function ProfilePage() {
  const [tab,setTab]=useState('delivery'); const [service,setService]=useState('cdek');
  const [user,setUser]=useState(null); const [delivery,setDelivery]=useState(null); const [purchases,setPurchases]=useState([]); const [views,setViews]=useState([]);
  const [status,setStatus]=useState('Проверяем авторизацию...'); const [saving,setSaving]=useState(false); const [err,setErr]=useState('');
  useEffect(()=>{const ctl=new AbortController();
    getMe({signal:ctl.signal}).then(u=>{setUser(u);setStatus('');
      Promise.allSettled([getDelivery({signal:ctl.signal}),getPurchases({signal:ctl.signal}),getViews({signal:ctl.signal})]).then(results=>{
        if(results[0].status==='fulfilled')setDelivery(results[0].value);
        if(results[1].status==='fulfilled')setPurchases(results[1].value.results || results[1].value);
        if(results[2].status==='fulfilled')setViews(results[2].value.results || results[2].value);
      });
    }).catch(e=>{if(e.name!=='AbortError')setStatus(e.status===401||e.status===403?'Для просмотра профиля необходимо войти.':e.status===404?'API профиля ещё не подключён в Django. Интерфейс готов, но личные данные не загружаются.':e.message)});
    return ()=>ctl.abort();
  },[]);
  async function handleSave(fields){setErr('');setSaving(true);try{const saved=await saveDelivery(service,fields);setDelivery(old=>({...old,[service]:saved || fields}));}catch(e){setErr(e.message)}finally{setSaving(false)}}
  return <div className="profile-theme"><SiteHeader/><main className="shell profile-main"><header className="profile-intro"><p className="home-section__kicker">ЛИЧНОЕ ПРОСТРАНСТВО</p><h1>Личный <em>кабинет</em></h1><p>Ваши данные, адреса доставки и история знакомства с коллекциями.</p></header>
    {status && <div role="status" className="profile-warning">{status} <Link to="/auth?next=%2Fprofile">Войти или зарегистрироваться →</Link></div>}
    <div className="profile-layout"><aside className="profile-aside"><div className="profile-avatar">{user?.avatar || user?.photo ? <img src={user.avatar || user.photo} alt="Фотография профиля"/> : '✦'}</div><h2>{user?.name || user?.first_name || user?.login || 'Гость Selena Znaju'}</h2><div className="profile-meta">{user?.email || 'Email пока не загружен'}</div><div className="profile-meta">{user?.date_joined ? `Дата регистрации: ${new Date(user.date_joined).toLocaleDateString('ru-RU')}` : 'Дата регистрации неизвестна'}</div>
      <nav className="profile-nav" aria-label="Разделы профиля">{sections.map(([key,name])=><button key={key} onClick={()=>setTab(key)} className={key===tab?'active':''} aria-pressed={tab===key} type="button">✧ &nbsp; {name}</button>)}</nav>
    </aside><section className="profile-content">
      {tab==='delivery' && <><h2>Адреса доставки</h2><p className="profile-hint">Выберите службу и заполните данные получателя.</p><div className="profile-service-tabs" role="group" aria-label="Служба доставки"><button className={service==='cdek'?'active':''} onClick={()=>setService('cdek')}>СДЭК</button><button className={service==='russian_post'?'active':''} onClick={()=>setService('russian_post')}>Почта России</button></div>
      <p className="profile-info">{service==='cdek'?'Для СДЭК укажите код пункта выдачи или адрес курьерской доставки.':'Для Почты России укажите почтовый индекс и полный адрес.'}</p><DeliveryForm service={service} initial={delivery?.[service]} disabled={!user||saving} onSave={handleSave}/>{err&&<p role="alert" className="auth-error">{err}</p>}</>}
      {tab==='purchases'&&<><h2>История покупок</h2>{Array.isArray(purchases)&&purchases.length ? purchases.map((p,i)=><div key={p.id||i} className="profile-list-row"><strong>{p.name || `Заказ №${p.id || i+1}`}</strong><span>{p.price!=null?priceLabel(p.price):p.status || 'Заказ'}</span></div>):<div className="profile-empty">Пока нет истории покупок.</div>}</>}
      {tab==='views'&&<><h2>История просмотров</h2>{Array.isArray(views)&&views.length ? views.map((p,i)=><div key={p.id||i} className="profile-list-row"><Link to={`/product/${p.slug||p.id}`}>{p.name||'Товар'}</Link><span>{p.viewed_at?new Date(p.viewed_at).toLocaleDateString('ru-RU'):''}</span></div>):<div className="profile-empty">История просмотров пока пуста.</div>}</>}
    </section></div>
  </main><SiteFooter/></div>;
}
