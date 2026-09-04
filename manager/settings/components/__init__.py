from .apps import INSTALLED_APPS
from .auth import AUTH_PASSWORD_VALIDATORS
from .database import DATABASES
from .middleware import MIDDLEWARE
from .site import TEMPLATES, STATIC_URL


__all__ = [
    "INSTALLED_APPS",
    "AUTH_PASSWORD_VALIDATORS",
    "DATABASES",
    "MIDDLEWARE",
    "TEMPLATES",
    "STATIC_URL"
]