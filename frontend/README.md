# Selena Znaju — React frontend

Перенос страниц проекта **DimaChepuchtanov/Selena**, ветка `create-catalog` (проверено 04.11.2026), на React 19, React Router 7 и Vite 7.

## Что перенесено

| Django template | React route | Реализация |
| --- | --- | --- |
| `pages/templates/home.html` | `/` | Главная, витрина, категории, фон, декоративные карты, блок автора |
| `identity/templates/auth.html` | `/auth`, `/reg` | Формы входа/регистрации, переключение вкладок, CSRF + POST в Django |
| `profile_/templates/profile.html` | `/profile` | Пользователь, СДЭК, Почта России, история покупок/просмотров |
| `catalog/templates/catalog.html` | `/catalog` | 5 колонок, фильтры с GET на Django, поиск, сортировка, fallback-изображения |
| `catalog/templates/product.html` | `/product/:id` | Галерея, остаток, цена, количество, демо-корзина |

Поддерживаются старые ссылки `/catalog.html`, `/product.html?slug=<uuid>` (миграционный маршрут).

## Быстрый запуск

1. Скопируйте папку **frontend** в корень Django-репозитория, рядом с `manage.py`.
2. В терминале из корня проекта выполните:

   ```bash
   cd frontend
   cp .env.example .env  # Windows: copy .env.example .env
   npm install
   npm run assets         # скопировать существующие SVG, JPEG и PNG из Django static/
   npm run dev
   ```

3. Откройте `http://localhost:5173`.
4. Django API должен работать по `http://localhost:8000`. Если другой адрес, измените `DJANGO_ORIGIN` в `frontend/.env` и перезапустите Vite.

Ключевые команды:

```bash
npm run dev       # Vite development server
npm run build     # сборка в frontend/dist
npm run preview   # просмотр production-сборки
npm run assets    # скопировать картинки из Django-приложений в frontend/public/static/img
```

**Node.js:** используйте Node.js 20.19+ или Node.js 22.12+ для Vite 7.

## Папки

```text
frontend/
├── public/
│   ├── images/default-cover.png          # наша звёздная заглушка
│   ├── images/catalog/                 # перенесённые SVG каталога
│   └── static/img/                    # фотографии из Django после npm run assets
├── scripts/copy-django-assets.mjs
├── src/
│   ├── api/                            # Django API + CSRF
│   ├── components/                     # шапка, карточка, картинки, корзина
│   ├── context/ShopContext.jsx         # временная корзина и избранное
│   ├── hooks/useProducts.js            # загрузка с отменой предыдущего запроса
│   ├── pages/                          # 5 страниц React
│   ├── styles/                         # каталог из оригинального CSS + дополнительные стили
│   ├── utils/format.js                 # нормализация API
│   ├── App.jsx                         # маршруты
│   └── main.jsx                        # точка входа
├── vite.config.js
└── package.json
```

## Связь с Django — что работает и что пока не работает

**Работает на фронтенде:** навигация без перезагрузки, категории, фильтры, сортировка, изображения-заглушки, галерея, формы и сохранение *демонстрационной* корзины в браузере. React не создаёт вымышленные товары: если API недоступен, показывает сообщение.

**Каталог:** существующие Django-эндпоинты (ветка `create-catalog`):

- `GET /api/catalog/` — список каталогов `[[id, name], ...]`;
- `GET /api/catalog/<catalog_id>` — товары `[[uuid, name, price, stock], ...]`.

`src/api/catalog.js` загружает список каталогов, выбирает ID по категории и запрашивает соответствующие товары заново при переключении вкладок. `src/utils/format.js` поддерживает как массивы, так и будущие объекты с `uuid`, `images`, `description`, `price` и `stock`.

**ВАЖНО:** в текущем Django `catalog/views.py` есть ошибка `card.title` — у модели `ProductCard` поле называется `name`. Исправьте `card.title` на `card.name`, иначе API карточек отдаёт 500. В API для фото и описаний сейчас нет данных: нужны сериализатор и endpoint деталей.

**Карточка товара:** React сначала ищет `GET /api/catalog/products/<uuid>/`, а при HTTP 404/405 пытается найти UUID в существующих списках. Во втором случае **нет фото и описания**, выводится заглушка. Для полной галереи нужен новый Django endpoint деталей с изображениями.

**Авторизация:** существующие Django endpoints `POST /user/auth/` и `POST /user/reg/` используют *сессионную авторизацию*. `src/api/client.js` получает CSRF-cookie через `GET /user/auth/`, затем POST-ит формы с `credentials: same-origin`; успешный redirect ведёт React на профиль. Это не требует хранения токена в `localStorage`.

**Профиль:** сейчас отсутствуют backend endpoints `GET /api/me/`, `GET /api/profile/delivery/`, `GET /api/profile/purchases/`, `GET /api/profile/views/`, `PUT /api/profile/delivery/<service>/`. Пока их нет, профиль отображает уведомление и **не даёт сохранять якобы реальные данные**. Следующий шаг — добавить эти API в Django, а сервер должен проверять авторизацию и права доступа.

**Корзина:** локальная демонстрация, пока нет backend заказов/оплаты. Не используйте её как подтверждение покупки.

## Изображения

`public/images/default-cover.png` — заглушка, созданная ранее: созвездие и подпись «Тут будет обложка». Она используется, если Django не прислал фото или пришёл битый URL.

Оригинальные изображения главной, фонов и авторизации физически остаются в Django-репозитории, поэтому после размещения `frontend/` рядом с `pages/`, `catalog/`, `identity/` **обязательно** выполните `npm run assets` (отсюда копируются фотографии и фоны). Без этого главный экран отобразит fallback, а некоторые текстуры фона будут упрощены.

## Развёртывание с Django

- В разработке Vite проксирует `/api`, `/user`, `/media`, `/static` на `DJANGO_ORIGIN`.
- В production используйте `npm run build` и раздавайте `frontend/dist/` как SPA, а `/api/*`, `/user/*`, `/media/*`, `/static/*` направляйте в Django / хранилище статики.
- Для React-маршрутов (`/catalog`, `/product/...`, `/profile`, `/auth`, `/reg`) сервер должен отдавать `frontend/dist/index.html`, **кроме** Django `/api/*` и `/user/*`.
- Не смешивайте маршруты старых Django-шаблонов и нового SPA на одном и том же пути без явного разделения через nginx/Django fallback. Сначала настройте проксирование и проверьте авторизацию.
- Админку `/admin/` оставить в Django.

## Проверки перед продакшеном

- [ ] `npm install && npm run build` на машине с доступом к npm (в среде подготовки не удалось скачать npm-зависимости).
- [ ] `npm run assets` с полным Django-репозиторием, проверить реальные фото на главной.
- [ ] Исправить `card.title` в Django.
- [ ] Добавить API деталей товара, профиля и заказов.
- [ ] Проверить CSRF + сессии и отказы в доступе к личным данным.
- [ ] Проверить frontend на мобильных экранах.
