# Selena Znaju — запуск React + Django + PostgreSQL через Docker

Это **локальная среда разработки**, не production. Один `Dockerfile` содержит две цели сборки (`backend` и `frontend`); Compose запускает их отдельными контейнерами.

## Первый запуск

1. Убедись, что в корне проекта есть `.env`. Если нет — создай его на основе `.env.example`.
2. Укажи минимум `SECRET_KEY` и параметры `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`. Пароль должен совпадать с паролем уже существующего PostgreSQL-тома, если база не новая.
3. Запусти из корня репозитория:

   ```bash
   docker compose config
   docker compose up -d --build
   docker compose ps -a
   ```

- **Сайт (React):** http://localhost:5173
- **Django API:** http://localhost:8000/api/catalog/
- **Документация API:** http://localhost:8000/api/docs/
- **Админка Selena:** http://localhost:5173/manage

Если 5173/8000 заняты, можно указать `FRONTEND_PORT` и `APP_PORT` в `.env`. При изменении порта frontend также обнови `CSRF_TRUSTED_ORIGINS` в `manager/settings/dev.py`.

## Как всё запускается

1. `db` запускает PostgreSQL.
2. `db-init` выполняет `db/init/001_create_schemas.sql` и `python manage.py migrate --noinput`, затем завершается с кодом 0.
3. `web` запускает Django на внутреннем порту 8000.
4. `frontend` запускает Vite на внутреннем порту 5173.

Vite обращается к Django через `http://web:8000` и проксирует пути `/api`, `/user` и `/media`. Путь `/static` остаётся у Vite, потому что картинки находятся в `frontend/public/static/`.

Для Windows/WSL включён polling для обновления интерфейса при изменениях файлов.

## Диагностика

```bash
docker compose ps -a
docker compose logs --tail=100 db-init
docker compose logs --tail=100 web
docker compose logs --tail=100 frontend
```

Если `db-init` завершился с ошибкой, контейнер `web` и затем `frontend` не запустятся. Смотри первую ошибку в `db-init`; **не удаляй базу** только ради перезапуска миграций.

При изменении зависимостей frontend:

```bash
docker compose exec frontend npm ci
docker compose restart frontend
```

Миграции вручную (в случае необходимости):

```bash
docker compose run --rm db-init
```

Остановить без потери данных:

```bash
docker compose down
```

**Не используй `docker compose down -v`**, если не намерен удалить базу PostgreSQL и volume с node_modules.
