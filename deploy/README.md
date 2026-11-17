# Selena production deployment

This branch separates production settings from development. No live REG.RU
deployment is performed by merging this code.

Architecture:
- React: run npm ci, npm test, npm run build in frontend/; serve frontend/dist
  as a static SPA with an index.html fallback.
- Django: manager.settings.prod; same origin /api/ and /user/.
- Static images: /static/ (React public directory), /assets/ (Vite output),
  /django-static/ (Django collectstatic), /media/ (uploaded product images).
- PostgreSQL: db/init/001_create_schemas.sql must run before Django migrations.

SECURITY: Root .env previously appeared in Git history. The new branch removes
it from the current tree, NOT from existing history. Revoke/rotate the
historically committed SECRET_KEY, database credentials and any other exposed
secrets. Keep runtime credentials in a private environment or file outside
the public document root and Git. Protect DB backups separately.

Before production:
1. Inspect deploy/REG-RU-HOST-A.md if using shared REG.RU Host-A.
2. Supply SITE_DOMAIN, secure SECRET_KEY, PostgreSQL credentials, TLS config.
3. Activate manager.settings.prod via DJANGO_SETTINGS_MODULE.
4. Run python manage.py check --deploy and unit/integration tests.
5. Ensure the DB exists; run the schema SQL using a privileged DB account.
6. Run python manage.py migrate --noinput.
7. Run python manage.py collectstatic --noinput.
8. Run cd frontend && npm ci && npm test && npm run build.
9. Verify the front proxy maps /api/ and /user/ to Django and SPA paths to
   frontend/dist. Verify media persistence and access controls.
10. Verify real HTTPS, security headers, CSRF, session cookies and uploaded
    image serving, then consider increasing HSTS_SECONDS.

For VPS only:
- install Gunicorn from requirements.prod.txt and start
  gunicorn manager.wsgi:application --bind 127.0.0.1:8000
  using a controlled process manager such as systemd.
- edit deploy/nginx/selena.conf.example with the real domain and paths;
  run nginx -t BEFORE reload. The sample is HTTP bootstrap ONLY.
- install a valid certificate, configure an HTTPS server block and redirect
  HTTP to HTTPS; set TRUST_PROXY_SSL_HEADER=1 ONLY when the proxy overwrites
  incoming X-Forwarded-Proto.
- do not expose PostgreSQL or Gunicorn publicly.

For local CI use SITE_DOMAIN=example.test and USE_HTTPS=0 while testing HTTP.
Real published deployment should use USE_HTTPS=1.
