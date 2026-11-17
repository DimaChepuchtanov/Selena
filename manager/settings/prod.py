"""Production settings. Activate with DJANGO_SETTINGS_MODULE=manager.settings.prod.

The shared hosting and VPS deployments use the same Django security defaults;
the proxy trust setting is *never* enabled unless the operator opts in.
"""
import os
import re
from pathlib import Path

from .components import *  # noqa: F401,F403
from .base import *  # noqa: F401,F403

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEBUG = False

SITE_DOMAIN = os.environ.get("SITE_DOMAIN", "").strip().lower()
if not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?", SITE_DOMAIN):
    raise RuntimeError("SITE_DOMAIN must be a hostname, e.g. example.ru")
if ".." in SITE_DOMAIN or "." not in SITE_DOMAIN:
    raise RuntimeError("SITE_DOMAIN must be a valid domain, e.g. example.ru")
if not SECRET_KEY or len(SECRET_KEY) < 32 or SECRET_KEY.startswith("REPLACE_"):
    raise RuntimeError("Set a unique SECRET_KEY of at least 32 characters")

ALLOWED_HOSTS = [SITE_DOMAIN, f"www.{SITE_DOMAIN}"]
FRONTEND_ORIGIN = f"https://{SITE_DOMAIN}"
CSRF_TRUSTED_ORIGINS = [FRONTEND_ORIGIN, f"https://www.{SITE_DOMAIN}"]

# /static/ belongs to the compiled React SPA, not Django's collected assets.
STATIC_URL = "/django-static/"
STATIC_ROOT = PROJECT_ROOT / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = PROJECT_ROOT / "media"

USE_HTTPS = os.environ.get("USE_HTTPS", "1") == "1"
SECURE_SSL_REDIRECT = USE_HTTPS
SESSION_COOKIE_SECURE = USE_HTTPS
CSRF_COOKIE_SECURE = USE_HTTPS
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # the frontend reads the CSRF token via /user/csrf/
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"

# Enable only behind a trusted proxy that overwrites any supplied X-Forwarded-Proto.
if os.environ.get("TRUST_PROXY_SSL_HEADER", "0") == "1":
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HSTS must be explicitly activated after TLS is verified for the real domain.
SECURE_HSTS_SECONDS = int(os.environ.get("HSTS_SECONDS", "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = False

# Database is PostgreSQL; remote PostgreSQL connections must use TLS.
DATABASES["default"]["CONN_MAX_AGE"] = 60
db_host = str(DATABASES["default"]["HOST"]).strip().lower()
remote_db = db_host not in {"localhost", "127.0.0.1", "::1", "/var/run/postgresql"}
sslmode = os.environ.get("PG_SSLMODE", "require" if remote_db else "prefer")
if remote_db and sslmode not in {"require", "verify-ca", "verify-full"}:
    raise RuntimeError("Remote PostgreSQL requires PG_SSLMODE=require, verify-ca or verify-full")
DATABASES["default"]["OPTIONS"] = {"sslmode": sslmode}
