import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router';
import { adminApi } from '../api/admin';
import { ProductShowcase } from '../components/ProductShowcase';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { DEFAULT_IMAGE, normalizeProduct, priceLabel } from '../utils/format';

function Msg({message,kind='info'}) { return message ? <div role={kind==='error'?'alert':'status'} className={`manage-message manage-message--${kind}`}>{message}</div> : null; }

export function AdminLayout() {
  const [access,setAccess] = useState({loading:true,ok:false,error:''});
  useEffect(()=>{let mounted=true;adminApi.me().then(u=>mounted&&setAccess({loading:false,ok:true,user:u,error:''})).catch(e=>mounted&&setAccess({loading:false,ok:false,error:e.message,status:e.status}));return ()=>{mounted=false;};},[]);
  return <div className="catalog-theme manage-theme"><div className="sky" aria-hidden="true"/><SiteHeader/>
    <main className="manage-page shell">
      <div className="manage-top"><div><span className="overline">SELENA ZNAJU · УПРАВЛЕНИЕ</span><h1>Панель <em>управления</em></h1><p>Каталоги, товары, фотографии и проверка публикации.</p></div><Link to="/catalog" className="button button--outline">На сайт ↗</Link></div>
      {access.loading ? <p className="sz-loading">Проверяем права доступа...</p> : !access.ok ? <div className="manage-gate"><h2>Доступ ограничен</h2><p>{access.status===403 ? 'Для управления каталогом требуется вход с ролью «Администратор».' : access.error}</p><Link className="button button--gold" to="/auth?next=%2Fmanage">Войти как администратор</Link></div> : <><div className="manage-bar"><nav className="manage-nav" aria-label="Разделы управления"><Link to="/manage">Товары</Link><Link to="/manage/catalogs">Каталоги</Link><Link to="/manage/products/new">+ Добавить товар</Link></nav><span className="manage-account">{access.user.login}</span></div><Outlet/></>}
    </main><SiteFooter/>
  </div>;
}

export function AdminCatalogsPage() {
  const [items,setItems] = useState([]),[newName,setNewName] = useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function refresh(){setItems(await adminApi.catalogs());}
  useEffect(()=>{refresh().catch(e=>setError(e.message));},[]);
  async function add(e){e.preventDefault();setBusy(true);setError('');try{await adminApi.createCatalog(newName.trim());setNewName('');await refresh();}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function rename(item){const name=window.prompt('Новое название каталога:',item.name);if(name===null||!name.trim()||name===item.name)return;setError('');try{await adminApi.renameCatalog(item.id,name.trim());await refresh();}catch(e){setError(e.message);}}
  async function remove(item){if(!window.confirm(`Удалить каталог «${item.name}»? Можно удалить только пустой каталог.`))return;setError('');try{await adminApi.deleteCatalog(item.id);await refresh();}catch(e){setError(e.message);}}
  return <section className="manage-panel"><div className="manage-panel-head"><h2>Каталоги</h2><span>{items.length} разделов</span></div><Msg message={error} kind="error"/>
    <form onSubmit={add} className="manage-create-row"><input value={newName} maxLength={255} onChange={e=>setNewName(e.target.value)} placeholder="Название нового каталога" required/><button className="button button--gold" disabled={busy||!newName.trim()}>Создать каталог</button></form>
    <div className="manage-table-wrap"><table className="manage-table"><thead><tr><th>ID</th><th>Название</th><th>Товаров</th><th>Действия</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td>{item.id}</td><td><strong>{item.name}</strong></td><td>{item.product_count??0}</td><td><button onClick={()=>rename(item)} className="manage-link">Изменить</button><button onClick={()=>remove(item)} className="manage-link manage-link--danger">Удалить</button></td></tr>)}</tbody></table></div>
    {!items.length&&<p className="sz-muted">Пока нет каталогов.</p>}
  </section>;
}

export function AdminProductsPage() {
  const [items,setItems] = useState([]),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function refresh(){setItems(await adminApi.products());}
  useEffect(()=>{refresh().catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  const shown=useMemo(()=>items.filter(p=>`${p.name} ${p.catalog_name}`.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru'))),[items,query]);
  async function remove(item){if(!window.confirm(`Удалить товар «${item.name}» со всеми фотографиями? Это нельзя отменить.`))return;setError('');try{await adminApi.deleteProduct(item.uuid);await refresh();}catch(e){setError(e.message);}}
  return <section className="manage-panel"><div className="manage-panel-head"><div><h2>Товары</h2><p>Черновики видны только администраторам.</p></div><Link className="button button--gold" to="/manage/products/new">+ Новый товар</Link></div><Msg message={error} kind="error"/><input className="manage-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию или каталогу"/>
    {loading?<p className="sz-loading">Получаем товары...</p>:<div className="manage-table-wrap"><table className="manage-table"><thead><tr><th>Обложка</th><th>Товар</th><th>Цена</th><th>Остаток</th><th>Статус</th><th>Действия</th></tr></thead><tbody>{shown.map(p=><tr key={p.uuid}><td><img className="manage-cover" src={p.images?.find(i=>i.is_primary)?.url||p.images?.[0]?.url||DEFAULT_IMAGE} alt=""/></td><td><strong>{p.name}</strong><small>{p.catalog_name}</small></td><td>{priceLabel(p.price)}</td><td>{p.stock}</td><td><span className={p.is_published?'manage-state manage-state--on':'manage-state'}>{p.is_published?'Опубликован':'Черновик'}</span></td><td><Link className="manage-link" to={`/manage/products/${p.uuid}/edit`}>Редактировать</Link>{p.is_published&&<Link className="manage-link" to={`/product/${p.uuid}`}>Смотреть</Link>}<button className="manage-link manage-link--danger" onClick={()=>remove(p)}>Удалить</button></td></tr>)}</tbody></table></div>}
    {!loading&&shown.length===0&&<p className="sz-muted">Товары не найдены.</p>}
  </section>;
}

const emptyForm={name:'',describe:'',price:'',stock:'0',catalog:'',is_published:false};
function previewItem(form,photos,catalogs,primaryKey,id) {
  const sorted=[...photos].sort((a,b)=>Number(b.key===primaryKey)-Number(a.key===primaryKey));
  const name= form.name.trim() || 'Название новой колоды';
  return {
    id:id||'preview',name,price:Number(form.price)||0,stock:Number(form.stock)||0,
    catalog_name:catalogs.find(c=>String(c.id)===String(form.catalog))?.name||'Авторские карты',
    description:form.describe,full_description:form.describe,
    images:sorted.length?sorted.map(p=>p.url):[DEFAULT_IMAGE]
  };
}

export function AdminProductEditor() {
  const {id}=useParams();
  const navigate=useNavigate();
  const editing=Boolean(id);
  const [catalogs,setCatalogs]=useState([]),[form,setForm]=useState(emptyForm),[photos,setPhotos]=useState([]),[primaryKey,setPrimaryKey]=useState(null),[removed,setRemoved]=useState([]);
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[previewOpen,setPreviewOpen]=useState(false);
  // Revoke object URLs only when the editor unmounts; don't revoke on each photo change.
  const createdUrls = useRef(new Set());
  useEffect(() => () => {for(const url of createdUrls.current) URL.revokeObjectURL(url);}, []);
  useEffect(()=>{let active=true;setLoading(true);setError('');Promise.all([adminApi.catalogs(),editing?adminApi.product(id):Promise.resolve(null)])
    .then(([cs,p])=>{if(!active)return;setCatalogs(cs);setForm(p?{name:p.name,describe:p.describe||'',price:String(p.price),stock:String(p.stock),catalog:String(p.catalog),is_published:p.is_published}:{...emptyForm,catalog:String(cs[0]?.id||'')});const list=p?.images?.map(img=>({key:`saved:${img.id}`,id:img.id,url:img.url,file:null}))||[];setPhotos(list);setPrimaryKey(p?.images?.find(x=>x.is_primary)?`saved:${p.images.find(x=>x.is_primary).id}`:list[0]?.key||null);setRemoved([]);})
    .catch(e=>active&&setError(e.message)).finally(()=>active&&setLoading(false));return()=>{active=false;};},[id,editing]);
  function change(name,value){setForm(s=>({...s,[name]:value}));}
  function addFiles(e){
    const files=[...e.target.files];e.target.value='';
    const valid=files.filter(f=>['image/jpeg','image/png','image/webp'].includes(f.type)&&f.size<=10*1024*1024);
    if(valid.length!==files.length)setError('Допустимы JPG, PNG и WebP размером до 10 МБ каждый.');
    const newPhotos=valid.map(file=>{const url=URL.createObjectURL(file);createdUrls.current.add(url);return {key:`new:${crypto.randomUUID()}`,file,url};});
    setPhotos(existing=>[...existing,...newPhotos]);
    if(!primaryKey && newPhotos.length)setPrimaryKey(newPhotos[0].key);
  }
  function removePhoto(photo){setPhotos(current=>current.filter(x=>x.key!==photo.key));if(photo.id)setRemoved(r=>[...r,photo.id]);if(primaryKey===photo.key)setPrimaryKey(photos.find(x=>x.key!==photo.key)?.key||null);}
  const preview=previewItem(form,photos,catalogs,primaryKey,id);

  async function save(e){e.preventDefault();setSaving(true);setError('');setNotice('');let savedId=id;
    try {
      const values={name:form.name.trim(),describe:form.describe,price:Number(form.price),stock:Number(form.stock),catalog:Number(form.catalog)};
      if(!values.name||!values.catalog||!Number.isInteger(values.price)||values.price<0||!Number.isInteger(values.stock)||values.stock<0)throw new Error('Проверьте название, каталог, цену и остаток.');
      // A new product is always created unpublished; publish only after uploads finish.
      if(editing)await adminApi.updateProduct(savedId,values);
      else {const created=await adminApi.createProduct({...values,is_published:false});savedId=created.uuid;}
      const ids=new Map(photos.filter(p=>p.id).map(p=>[p.key,p.id]));
      for(const photoId of removed)await adminApi.deletePhoto(savedId,photoId);
      for(const photo of photos.filter(p=>p.file)){
        const uploaded=await adminApi.upload(savedId,photo.file);
        ids.set(photo.key,uploaded.id);
      }
      if(primaryKey&&ids.has(primaryKey))await adminApi.setCover(savedId,ids.get(primaryKey));
      await adminApi.updateProduct(savedId,{is_published:form.is_published});
      setNotice('Товар сохранён. ' +(form.is_published?'Он опубликован.':'Он остаётся в черновиках.'));
      if(!editing){navigate(`/manage/products/${savedId}/edit`,{replace:true});}
      else {
        const updated=await adminApi.product(savedId);
        const list=updated.images.map(img=>({key:`saved:${img.id}`,id:img.id,url:img.url,file:null}));
        setPhotos(list);setPrimaryKey(updated.images.find(x=>x.is_primary)?`saved:${updated.images.find(x=>x.is_primary).id}`:list[0]?.key||null);setRemoved([]);
      }
    }catch(e){setError(`Не удалось завершить сохранение: ${e.message}. Если загрузка прервалась, часть изменений могла сохраниться. ${savedId?'Откройте товар повторно перед следующей попыткой.':''}`);
      if(!editing&&savedId)navigate(`/manage/products/${savedId}/edit`,{replace:true});
    }finally{setSaving(false);}
  }

  if(loading)return <p className="sz-loading">Загружаем редактор...</p>;
  return <section className="manage-panel manage-editor"><div className="manage-panel-head"><div><Link className="manage-back" to="/manage">← Все товары</Link><h2>{editing?'Редактирование товара':'Добавление товара'}</h2><p>Заполните данные, отметьте главное фото и проверьте внешний вид карточки.</p></div><button type="button" className="button button--outline" onClick={()=>setPreviewOpen(true)}>✧ Предпросмотр на сайте</button></div>
    <Msg message={error} kind="error"/><Msg message={notice} kind="success"/>
    <form onSubmit={save} className="manage-form"><div className="manage-fields">
      <label className="manage-field">Название товара<input required maxLength={200} value={form.name} onChange={e=>change('name',e.target.value)} placeholder="Например: Оракул Мятный ангел"/></label>
      <label className="manage-field">Каталог<select required value={form.catalog} onChange={e=>change('catalog',e.target.value)}><option value="">Выберите каталог</option>{catalogs.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      {!catalogs.length&&<div className="manage-message manage-message--error">Нет каталогов. <Link to="/manage/catalogs">Создайте хотя бы один каталог.</Link></div>}
      <label className="manage-field">Цена, ₽<input type="number" min="0" step="1" required value={form.price} onChange={e=>change('price',e.target.value)} placeholder="3455"/></label>
      <label className="manage-field">Остаток, шт.<input type="number" min="0" step="1" required value={form.stock} onChange={e=>change('stock',e.target.value)}/></label>
      <label className="manage-field manage-field--full">Описание<textarea rows={7} value={form.describe} onChange={e=>change('describe',e.target.value)} placeholder="Описание колоды, материалы, размер, комплектация..."/></label>
      <label className="manage-publish"><input type="checkbox" checked={form.is_published} onChange={e=>change('is_published',e.target.checked)}/><span><strong>Опубликовать после сохранения</strong><small>Если выключено, карточка видна только администраторам.</small></span></label>
    </div>
    <div className="manage-photo-panel"><div className="manage-photo-head"><div><h3>Фотографии товара</h3><p>Загрузите несколько изображений. Отметьте главную обложку — она будет первой в каталоге и галерее.</p></div><label className="manage-upload">+ Добавить фото<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={addFiles}/></label></div>
      <div className="manage-photo-grid">{photos.map((photo,index)=><article key={photo.key} className={`manage-photo ${photo.key===primaryKey?'manage-photo--primary':''}`}><img src={photo.url} alt={`Фотография ${index+1}`}/><label className="manage-radio"><input type="radio" name="primaryPhoto" checked={photo.key===primaryKey} onChange={()=>setPrimaryKey(photo.key)}/> Главная обложка</label>{photo.file&&<span className="manage-photo-new">Новая</span>}<button type="button" className="manage-photo-remove" onClick={()=>removePhoto(photo)} aria-label="Удалить фотографию">×</button></article>)}
        {!photos.length&&<div className="manage-no-photo"><img src={DEFAULT_IMAGE} alt="Обложка по умолчанию"/><p>Фотографии не добавлены. На сайте появится стандартная обложка.</p></div>}
      </div><p className="sz-muted">JPG, PNG, WebP · до 10 МБ каждое. Новые файлы будут загружены при сохранении товара.</p></div>
    <div className="manage-savebar"><button className="button button--gold" type="submit" disabled={saving||!catalogs.length}>{saving?'Сохраняем и загружаем фото...':form.is_published?'Сохранить и опубликовать':'Сохранить черновик'}</button><button type="button" className="button button--outline" onClick={()=>setPreviewOpen(true)}>Посмотреть перед публикацией</button>{editing&&form.is_published&&<Link to={`/product/${id}`} target="_blank" rel="noopener noreferrer" className="manage-link">Открыть опубликованный товар ↗</Link>}</div></form>
    {previewOpen&&<div className="manage-preview-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPreviewOpen(false);}}><div className="manage-preview-window" role="dialog" aria-modal="true" aria-label="Предпросмотр карточки товара"><div className="manage-preview-toolbar"><span>✧ Как увидит покупатель</span><button type="button" onClick={()=>setPreviewOpen(false)} aria-label="Закрыть предпросмотр">Закрыть ×</button></div><div className="catalog-theme"><div className="sky"/><SiteHeader/><div className="product-page shell"><div className="breadcrumbs breadcrumbs--product"><span>Главная</span><span>/</span><span>Каталог</span><span>/</span><span>{preview.name}</span></div><ProductShowcase product={preview} preview/></div><SiteFooter/></div></div></div>}
  </section>;
}
