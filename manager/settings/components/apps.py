from __future__ import annotations

from typing import Final


INSTALLED_APPS: Final[list[str]] = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_spectacular',
    # CUSTOM
    'identity',
    'profile_',
    'catalog',
]