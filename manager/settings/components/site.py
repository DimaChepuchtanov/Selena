from __future__ import annotations

from pathlib import Path
from typing import Any, Final

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = Path(__file__).resolve().parents[3]

TEMPLATES: Final[list[dict[str, Any]]] = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

STATIC_URL = "/static/"
# Avoid a deploy check warning if the optional legacy static directory is absent.
STATICFILES_DIRS = [str(BASE_DIR / "static")] if (BASE_DIR / "static").is_dir() else []

MEDIA_URL = "/media/"
MEDIA_ROOT = PROJECT_ROOT / "media"
