from .apps import INSTALLED_APPS
from .auth import AUTH_PASSWORD_VALIDATORS, AUTH_USER_MODEL
from .database import DATABASES
from .middleware import MIDDLEWARE
from .site import TEMPLATES, STATIC_URL, MEDIA_URL, MEDIA_ROOT
from .rest import REST_FRAMEWORK
from .swagger import SPECTACULAR_SETTINGS


__all__ = [
    "INSTALLED_APPS",
    "AUTH_PASSWORD_VALIDATORS",
    "AUTH_USER_MODEL",
    "DATABASES",
    "MIDDLEWARE",
    "TEMPLATES",
    "STATIC_URL",
    "REST_FRAMEWORK",
    "SPECTACULAR_SETTINGS",
    "MEDIA_URL",
    "MEDIA_ROOT"
]