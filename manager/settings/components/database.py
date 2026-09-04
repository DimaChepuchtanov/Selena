from __future__ import annotations

from typing import Final, Any

from ..config import Config

# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

DATABASES: Final[dict[str, dict[str, Any]]] = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Для psycopg2: 'django.db.backends.postgresql_psycopg2'
        'NAME': Config.PG_DATABASE,                      # Имя базы данных
        'USER': Config.PG_USER,                          # Имя пользователя
        'PASSWORD': Config.PG_PASSWORD,                    # Пароль
        'HOST': Config.PG_HOST,                       # Хост (если база на локальной машине)
        'PORT': Config.PG_PORT,                          # Порт (стандартный для PostgreSQL)
    }
}