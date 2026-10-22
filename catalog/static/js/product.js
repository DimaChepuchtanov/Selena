/* Динамическая карточка товара, галерея и демонстрационная корзина. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded',async () => {
    const slug=new URLSearchParams(window.location.search).get('slug')||'lunnaya-koloda';
    const status=document.getElementById('api-status');
    const layout=document.getElementById('product-layout');
    const addButton=document.getElementById('add-to-cart');
    const number=document.getElementById('qty-number');
    const minus=document.getElementById('qty-minus');
    const plus=document.getElementById('qty-plus');
    const mainImage=document.getElementById('main-image');
    const thumbs=document.getElementById('gallery-thumbs');
    const count=document.getElementById('gallery-count');
    const badge=document.getElementById('gallery-badge');
    let product=null;let quantity=1;let imageIndex=0;

    function chooseImage(index) {
      if(!product) return;
      imageIndex=(index+product.images.length)%product.images.length;
      mainImage.src=product.images[imageIndex];
      mainImage.alt=`${product.name}: изображение ${imageIndex+1} из ${product.images.length}`;
      count.textContent=`${String(imageIndex+1).padStart(2,'0')} / ${String(product.images.length).padStart(2,'0')}`;
      Array.from(thumbs.children).forEach((child,i)=>{const active=i===imageIndex;child.classList.toggle('is-active',active);child.setAttribute('aria-pressed',String(active));});
    }
    function buildGallery() {
      thumbs.replaceChildren();
      product.images.forEach((src,i)=>{
        const thumb=document.createElement('button');thumb.type='button';thumb.className='gallery__thumb';thumb.setAttribute('aria-label',`Изображение ${i+1}`);
        const image=document.createElement('img');image.src=src;image.alt='';image.loading='lazy';
        image.addEventListener('error',()=>{if(!image.src.endsWith('deck-moon.svg')) image.src='assets/deck-moon.svg';});
        thumb.append(image);thumb.addEventListener('click',()=>chooseImage(i));thumbs.append(thumb);
      });
      const arrows=document.querySelectorAll('.gallery__arrow');arrows.forEach(a=>a.hidden=product.images.length<=1);
      chooseImage(0);
    }
    function updateQuantity() {
      quantity=Math.min(Math.max(1,quantity),Math.max(1,product.stock));
      number.textContent=String(quantity);
      minus.disabled=quantity<=1||product.stock===0;
      plus.disabled=quantity>=product.stock;
    }
    function fillDescription(text) {
      const container=document.getElementById('product-description');container.replaceChildren();
      const paragraphs=text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
      for(const text of (paragraphs.length?paragraphs:['Описание появится позже.'])) {
        const p=document.createElement('p');p.textContent=text;container.append(p);
      }
    }
    function fillProduct(isDemo) {
      document.title=`${product.name} — Selena Znaju`;
      document.getElementById('crumb-title').textContent=product.name;
      document.getElementById('product-category').textContent=window.SelenaApi.categoryLabel(product.category).toLocaleUpperCase('ru');
      const title=document.getElementById('product-title');
      const titleParts=product.name.trim().split(/\s+/);
      title.replaceChildren();
      if(titleParts.length>1){
        title.append(document.createTextNode(titleParts.slice(0,-1).join(' ')+' '));
        const accent=document.createElement('em');accent.textContent=titleParts[titleParts.length-1];title.append(accent);
      }else{title.textContent=product.name;}
      document.getElementById('product-short').textContent=product.description;
      document.getElementById('product-price').textContent=window.SelenaApi.priceLabel(product.price);
      const hasStock=product.stock>0;const availability=document.querySelector('.availability');availability.classList.toggle('availability--out',!hasStock);
      document.getElementById('stock-label').textContent=hasStock?'В наличии':'Нет в наличии';
      document.getElementById('stock-count').textContent=hasStock?`Осталось ${product.stock} шт.`:'Количество: 0';
      document.querySelector('.availability__separator').hidden=!hasStock;
      addButton.disabled=!hasStock;
      if(!hasStock) {addButton.textContent='Нет в наличии';}
      badge.hidden=!isDemo;
      fillDescription(product.full_description);
      buildGallery();updateQuantity();
    }
    document.getElementById('gallery-prev').addEventListener('click',()=>chooseImage(imageIndex-1));
    document.getElementById('gallery-next').addEventListener('click',()=>chooseImage(imageIndex+1));
    mainImage.addEventListener('error',()=>{if(!mainImage.src.endsWith('deck-moon.svg'))mainImage.src='assets/deck-moon.svg';});
    minus.addEventListener('click',()=>{quantity--;updateQuantity();});
    plus.addEventListener('click',()=>{quantity++;updateQuantity();});
    addButton.addEventListener('click',()=>{if(product&&product.stock>0)window.SelenaShop.addToCart(product,quantity);});

    const result=await window.SelenaApi.getProduct(slug);
    if(!result.item){layout.replaceChildren();status.hidden=false;status.textContent='Товар не найден. Вернитесь в каталог и выберите другую карточку.';return;}
    product=result.item;
    if(result.isDemo){status.hidden=false;status.textContent='Демонстрационный режим: фото, цена, описание и количество товара — пустышки. При подключении Django API карточка заполнится настоящими данными.';}
    fillProduct(result.isDemo);
  });
})();
