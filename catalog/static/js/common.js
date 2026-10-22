/* Общие интерактивные элементы — без проверки токена и без авторизации. */
(function () {
  'use strict';
  const CART_KEY = 'selena-znaju-demo-cart-v1';
  let toastTimer;
  function readCart() {
    try {const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');return Array.isArray(value) ? value : [];} catch {return [];}
  }
  function cartAmount() {return readCart().reduce((sum,item) => sum + (Number(item.quantity) || 0),0);}
  function refreshCartCount() {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      const count = cartAmount();el.textContent = String(count);el.hidden = count <= 0;
    });
  }
  function showToast(message) {
    const el = document.getElementById('toast');if (!el) return;
    clearTimeout(toastTimer);el.textContent=message;el.classList.add('is-visible');
    toastTimer=setTimeout(() => el.classList.remove('is-visible'),3400);
  }
  function addToCart(product, quantity) {
    const cart = readCart();const existing = cart.find(item => item.slug===product.slug);
    if (existing) existing.quantity=Math.min(product.stock, existing.quantity+quantity);
    else cart.push({slug:product.slug,name:product.name,price:product.price,quantity:Math.min(product.stock,quantity)});
    try {localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch {showToast('Не удалось сохранить корзину в браузере.');return;}
    refreshCartCount();showToast(`«${product.name}» добавлен в демо-корзину.`);
  }

  document.addEventListener('DOMContentLoaded',() => {
    const menu = document.querySelector('.main-nav');const toggle=document.querySelector('[data-menu-toggle]');
    toggle?.addEventListener('click',()=>{
      const opened=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(opened));toggle.setAttribute('aria-label',opened?'Закрыть меню':'Открыть меню');
    });
    menu?.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>{menu.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}));
    document.querySelectorAll('[data-open-cart]').forEach(el=>el.addEventListener('click',event=>{
      event.preventDefault();const count=cartAmount();showToast(count?`В демо-корзине товаров: ${count}. Оформление заказа будет подключено позже.`:'Демо-корзина пока пуста.');
    }));
    refreshCartCount();
  });
  window.SelenaShop={showToast,addToCart,refreshCartCount};
})();
