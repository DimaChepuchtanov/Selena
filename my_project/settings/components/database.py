from pathlib import Path

from ..config import Config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': Config.PG_DATABASE,
        'USER': Config.PG_USER,
        'PASSWORD': Config.PG_PASSWORD,
        'HOST': Config.PG_HOST,
        'PORT': Config.PG_PORT,
    }
}