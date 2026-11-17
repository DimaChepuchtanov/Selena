# REG.RU Host-A deployment decision (Selena)

Status: NOT DEPLOYED. Host-A is shared hosting, so do not upload the VPS Nginx
configuration or attempt Docker/systemd there.

REG.RU documents Python on Host-A and Passenger/WSGI Django installation, but
the availability of the required Python version and Python option must be checked
on the actual hosting account. Earlier screenshot showed disabled CGI and no Python.

The Selena backend is PostgreSQL-specific:
- Django models target the "identity" and "product" PostgreSQL schemas;
- migration/setup runs CREATE SCHEMA and requires permission to do so;
- the standard Host-A database offering is MySQL, NOT PostgreSQL.
Therefore a separate reachable PostgreSQL service with CREATE SCHEMA permission
is required if Host-A is retained. Do not switch to MySQL without an explicit
database migration and test plan.

Pre-deployment checks (must pass BEFORE uploading the Python backend):
1. REG.RU confirms Python >= 3.12 with Passenger/WSGI for the site.
2. A private Python virtual environment and packages are allowed.
3. PostgreSQL accessible from Host-A, with network/TLS and CREATE SCHEMA rights.
4. The hosting panel permits routing /api/ and /user/ to Django, plus the
   React SPA document root with /assets/, /static/ and /media/ mappings.
5. HTTPS is active on the real domain and the runtime correctly detects SSL.

If these cannot be met, move the backend to a VPS; React can be served as static
content, or move everything to the VPS to keep same-origin cookies and CSRF.

Template deploy/passenger_wsgi.py.example is provided ONLY after checks pass.
Do not set DJANGO_SETTINGS_MODULE=manager.settings.dev on a public website.
Do not publish .env, source code, SQLite/PostgreSQL dumps or media backups.
