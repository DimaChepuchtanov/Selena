/* Загрузка товаров из Django + поиск / фильтрация / сортировка. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded',async () => {
    const grid=document.getElementById('products-grid');
    const resultCount=document.getElementById('result-count');
    const status=document.getElementById('api-status');
    const empty=document.getElementById('empty-state');
    const search=document.getElementById('catalog-search');
    const sort=document.getElementById('catalog-sort');
    const categoryButtons=Array.from(document.querySelectorAll('[data-category]'));
    const reset=document.getElementById('reset-filters');
    let products=[];
    let category='all';
    let isDemo=false;

    function el(tag,className,text) {
      const element=document.createElement(tag);
      if(className) element.className=className;
      if(text!==undefined) element.textContent=text;
      return element;
    }
    function buildCard(product) {
      const card=el('article','product-card');
      const url='product.html?slug='+encodeURIComponent(product.slug);
      const imageLink=el('a','product-card__image');imageLink.href=url;
      const img=el('img');img.src=product.images[0];img.alt=`Изображение товара «${product.name}»`;img.loading='lazy';
      img.addEventListener('error',()=>{if(!img.src.endsWith('deck-moon.svg')) img.src='assets/deck-moon.svg';});
      imageLink.append(img);
      if(isDemo) imageLink.append(el('span','product-card__badge','ДЕМО'));
      const body=el('div','product-card__body');
      body.append(el('span','product-card__category',window.SelenaApi.categoryLabel(product.category).toLocaleUpperCase('ru')));
      const title=el('h3');const titleLink=el('a',null,product.name);titleLink.href=url;title.append(titleLink);body.append(title);
      body.append(el('p','product-card__desc',product.description));
      const bottom=el('div','product-card__bottom');bottom.append(el('strong',null,window.SelenaApi.priceLabel(product.price)));
      bottom.append(el('span','stock '+(product.stock>0?'stock--available':'stock--unavailable'),product.stock>0?`В наличии: ${product.stock}`:'Нет в наличии'));
      body.append(bottom);
      const more=el('a','product-card__link');more.href=url;more.append(document.createTextNode('Подробнее '));
      more.append(el('span',null,'↗'));more.lastElementChild.setAttribute('aria-hidden','true');
      card.append(imageLink,body,more);return card;
    }
    function render() {
      const query=search.value.trim().toLocaleLowerCase('ru');
      let displayed=products.filter(p=>(category==='all'||p.category===category)&&(!query||(`${p.name} ${p.description}`).toLocaleLowerCase('ru').includes(query)));
      if(sort.value==='price-asc') displayed.sort((a,b)=>a.price-b.price);
      if(sort.value==='price-desc') displayed.sort((a,b)=>b.price-a.price);
      if(sort.value==='title') displayed.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
      grid.replaceChildren(...displayed.map(buildCard));
      resultCount.textContent=`${displayed.length} ${declension(displayed.length,['изделие','изделия','изделий'])} в коллекции`;
      empty.hidden=displayed.length>0;grid.hidden=displayed.length===0;
    }
    function declension(number,forms) {
      const n=Math.abs(number)%100;const n1=n%10;
      if(n>10&&n<20) return forms[2];if(n1>1&&n1<5) return forms[1];if(n1===1)return forms[0];return forms[2];
    }

    search.addEventListener('input',render);sort.addEventListener('change',render);
    categoryButtons.forEach(btn=>btn.addEventListener('click',()=>{
      category=btn.dataset.category;categoryButtons.forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});render();
    }));
    reset?.addEventListener('click',()=>{search.value='';sort.value='default';categoryButtons[0].click();});

    const response=await window.SelenaApi.getProducts();
    products=response.items;isDemo=response.isDemo;
    if(isDemo){status.textContent='Демонстрационный режим: товары, изображения, цены и остатки — пустышки. При доступном Django API здесь появятся настоящие товары.';status.hidden=false;}
    render();
  });
})();
