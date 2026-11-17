"""WSGI entrypoint. Production is the safe default for WSGI servers.

Local Django commands and Docker explicitly select manager.settings.dev.
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "manager.settings.prod")
application = get_wsgi_application()
