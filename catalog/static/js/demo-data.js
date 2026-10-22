/* ТОЛЬКО ПУСТЫШКИ ДЛЯ ПРЕДПРОСМОТРА.
   Как только Django API возвращает данные, используются товары из API, а не этот массив. */
window.SelenaDemoProducts = [
  {
    id: 1, slug: 'lunnaya-koloda', name: 'Лунная колода', category: 'decks',
    description: 'История о свете, который можно найти даже в самой тихой ночи.',
    full_description: 'Демонстрационная колода для проверки оформления страницы Selena Znaju. Здесь можно будет разместить историю создания, особенности иллюстраций и информацию о составе набора.\n\nВесь текст и фотографии в этой записи — пустышки. После подключения бэкенда они заменятся реальными данными.',
    price: 3900, stock: 7, images: ['assets/deck-moon.svg','assets/gallery-back.svg','assets/gallery-spread.svg','assets/gallery-box.svg']
  },
  {
    id: 2, slug: 'polyarnaya-zvezda', name: 'Полярная звезда', category: 'decks',
    description: 'Созвездия, символы и очарование ночного неба.',
    full_description: 'Демонстрационное описание второй колоды. Здесь будет реальный текст о товаре, материалах и художественном замысле.\n\nИзображения являются временными иллюстрациями.',
    price: 4200, stock: 4, images: ['assets/deck-star.svg','assets/gallery-back.svg','assets/gallery-spread.svg','assets/gallery-box.svg']
  },
  {
    id: 3, slug: 'zolotoe-solntse', name: 'Золотое солнце', category: 'decks',
    description: 'Тёплые образы и сияние золотого света.',
    full_description: 'Демонстрационное описание третьей колоды. Данные и характеристики будут поступать из API.\n\nЭто пример заполнения карточки товара.',
    price: 3600, stock: 11, images: ['assets/deck-sun.svg','assets/gallery-back.svg','assets/gallery-spread.svg','assets/gallery-box.svg']
  },
  {
    id: 4, slug: 'zerkalo-nochi', name: 'Зеркало ночи', category: 'accessories',
    description: 'Аксессуар из воображаемой мистической коллекции.',
    full_description: 'Демонстрационный аксессуар. Название, иллюстрации, остатки и стоимость на этой странице являются примером.\n\nЗдесь появится полное описание товара из Django.',
    price: 4500, stock: 3, images: ['assets/deck-mirror.svg','assets/gallery-back.svg','assets/gallery-spread.svg','assets/gallery-box.svg']
  },
  {
    id: 5, slug: 'taynyy-sad', name: 'Тайный сад', category: 'art',
    description: 'Образы, вдохновлённые тайными садами и цветами.',
    full_description: 'Демонстрационная авторская работа для проверки категории в каталоге. При подключении бэкенда содержание будет взято из реальной записи товара.',
    price: 2800, stock: 5, images: ['assets/deck-garden.svg','assets/gallery-back.svg','assets/gallery-spread.svg','assets/gallery-box.svg']
  }
];
