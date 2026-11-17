import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { postDjangoForm } from '../api/client';

export function AuthPage({ initialTab = 'login' }) {
  const [params,setParams] = useSearchParams();
  const tab = params.get('tab') === 'register' || initialTab === 'register' && !params.has('tab') ? 'register' : 'login';
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState(''); const [remember,setRemember] = useState(true);
  const [agreement,setAgreement] = useState(false); const [visible,setVisible] = useState(false);
  const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  const navigate = useNavigate(); const location = useLocation();
  const change = mode => {setError('');setVisible(false);setPassword('');setConfirm('');setParams(mode==='register'?{...Object.fromEntries(params),tab:'register'}:{...Object.fromEntries(params),tab:'login'});};
  async function submit(e) { e.preventDefault();setError('');
    if (tab==='register' && password!==confirm) {setError('Пароли не совпадают');return;}
    if (tab==='register' && !agreement) {setError('Необходимо согласие на обработку персональных данных');return;}
    setBusy(true);
    try {
      const fields = tab==='login'? {email,password,remember:remember?'1':''} : {email,password,password_confirm:confirm,agreement:'1'};
      await postDjangoForm(tab==='login'?'/user/auth/':'/user/reg/',fields);
      const next = params.get('next');
      navigate(next?.startsWith('/') && !next.startsWith('//') ? next : '/profile', {replace:true});
    } catch(e) {setError(e.message)} finally{setBusy(false)}
  }
  return <div className="auth-theme"><div className="auth-ambient"/><div className="auth-page"><header className="auth-topbar"><Link className="auth-brand" to="/"><span>☾</span><span>Selena Znaju<small>АВТОРСКИЕ КАРТЫ ТАРО</small></span></Link><nav><Link to="/catalog">Коллекция</Link><Link to="/#delivery">Доставка</Link></nav><Link className="auth-back" to="/">← На главную</Link></header>
    <main className="auth-layout"><section className="auth-hero"><div className="auth-kicker">ПРОСТРАНСТВО SELENA ZNAJU</div><h1>У каждой истории<br/>есть своя <em>магия</em></h1><p>Добро пожаловать в мир авторских карт Таро. Здесь начинается ваше знакомство с коллекциями, созданными с вниманием к каждой детали.</p><div className="auth-arcana"><div className="auth-arcana__orbit"/><div className="auth-arcana__card"><img src="/static/img/arcana.svg" onError={e=>{e.currentTarget.src='/images/default-cover.png'}} alt="Декоративная карта"/></div><div className="auth-arcana__caption">Откройте свою историю</div></div></section>
      <section className="auth-box" aria-label="Вход и регистрация"><span className="auth-box__star">✧</span><p className="auth-overline">ВАШЕ ПРОСТРАНСТВО</p><div className="auth-tabs" role="tablist" aria-label="Выберите действие"><button type="button" role="tab" aria-selected={tab==='login'} className={tab==='login'?'active':''} onClick={()=>change('login')}>Вход</button><button type="button" role="tab" aria-selected={tab==='register'} className={tab==='register'?'active':''} onClick={()=>change('register')}>Регистрация</button></div>
        <h2>{tab==='login'?'С возвращением':'Начните свою историю'}</h2><p className="auth-intro">{tab==='login'?'Рады вновь видеть вас в Selena Znaju':'Создайте аккаунт, чтобы оформить свой первый заказ'}</p>
        <form onSubmit={submit} className="auth-form"><label>Электронная почта<input type="email" name="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required maxLength={254} autoComplete="email"/></label>
          <label>Пароль<input type={visible?'text':'password'} name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={tab==='register'?'Не менее 8 символов':'Введите пароль'} minLength={tab==='register'?8:undefined} autoComplete={tab==='login'?'current-password':'new-password'} required/></label><button className="auth-eye" type="button" aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?'Скрыть пароль':'Показать пароль'}</button>
          {tab==='register'?<><label>Повторите пароль<input type={visible?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Подтвердите пароль" autoComplete="new-password" required minLength={8}/></label><label className="auth-check"><input type="checkbox" checked={agreement} onChange={e=>setAgreement(e.target.checked)}/> Согласен(на) с обработкой персональных данных</label></>:<label className="auth-check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Запомнить меня</label>}
          {error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={busy}>{busy?'Проверяем...':tab==='login'?'Войти →':'Создать аккаунт →'}</button>
        </form>
        <p className="auth-bottom">{tab==='login'?'Ещё нет аккаунта?':'Уже зарегистрированы?'} <button type="button" onClick={()=>change(tab==='login'?'register':'login')}>{tab==='login'?'Зарегистрироваться':'Войти'}</button></p>
      </section></main><footer className="auth-footer">© Selena Znaju · Авторские карты Таро <Link to="/">На главную</Link></footer></div>
  </div>;
}
