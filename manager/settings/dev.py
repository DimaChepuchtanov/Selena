from __future__ import annotations

from .components import *
from .base import *

DEBUG = True

# Vite forwards API requests to the Docker service "web" (Host: web:8000).
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "web",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Django legacy routes redirect to the React application.
import os
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173").rstrip("/")
