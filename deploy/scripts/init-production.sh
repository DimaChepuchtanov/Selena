#!/bin/sh
set -eu
python manage.py shell -c "from pathlib import Path; from django.db import connection; sql = Path('db/init/001_create_schemas.sql').read_text(encoding='utf-8'); connection.cursor().execute(sql)"
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py check --deploy --fail-level ERROR
