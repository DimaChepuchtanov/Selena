# Selena: VPS production deployment

The original docker-compose.yml and Dockerfile are for development only.
For a real VPS use compose.prod.yml and Dockerfile.production.
The production stack builds React in Node 22, serves it with container Nginx,
runs Django via Gunicorn, and stores PostgreSQL and uploaded images in Docker
volumes. Host Nginx terminates TLS and forwards requests to 127.0.0.1:8080.

## 1. Check the VPS

Run docker --version, docker compose version, free -h and df -h.
You need Docker with the Compose plugin, Git, and enough RAM/disk for image builds.
On a tiny VPS the Node build may require temporary swap or more RAM.

Clone the PRIVATE repo using a GitHub SSH deploy key (do not embed a token in
the clone URL). Use git switch dev, git pull --ff-only origin dev once this PR
is merged; before merge, test with git switch vps-production.

## 2. Configure secrets

From the root of Selena:

    cp deploy/env.production.example .env.production
    chmod 600 .env.production
    nano .env.production

Edit SITE_DOMAIN, SECRET_KEY, PG_PASSWORD. Generate two independent secrets:

    python3 -c "import secrets; print(secrets.token_urlsafe(64))"
    openssl rand -hex 32

Do not commit .env.production or paste actual passwords anywhere.
Rotate any previously committed values from the original .env in Git history.
A fresh production stack uses its own NEW database and media volumes; it does
NOT import the dev catalog, users or pictures. Backups must be migrated separately.

## 3. Build and launch production containers

    docker compose --env-file .env.production -f compose.prod.yml config --quiet
    docker compose --env-file .env.production -f compose.prod.yml up -d --build
    docker compose --env-file .env.production -f compose.prod.yml ps -a

Expected: db (healthy), db-init (exited 0), web (healthy), frontend (healthy).
The only published container port is 127.0.0.1:8080 on the VPS.
DO NOT expose 5432, 8000, 5173 or 8080 to the internet.

Check the React frontend on the VPS (replace your-domain.ru):

    curl -I -H 'Host: your-domain.ru' http://127.0.0.1:8080/
    curl -I -H 'Host: your-domain.ru' http://127.0.0.1:8080/catalog

Until TLS is installed, /api/ may redirect to HTTPS; that is expected with
USE_HTTPS=1. Check containers and logs on failures:

    docker compose --env-file .env.production -f compose.prod.yml logs --tail=100 db-init web frontend

## 4. Connect the domain and HTTPS

At REG.RU / DNSadmin, both A records for your-domain.ru and optionally
www.your-domain.ru should point to the PUBLIC VPS IPv4. Confirm with:

    dig +short A your-domain.ru @1.1.1.1

On Ubuntu/Debian install host Nginx and Certbot:

    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx

Copy deploy/nginx/host-vps.conf.example to /etc/nginx/sites-available/selena
and replace example.ru with the real domain in server_name. Enable it:

    sudo ln -s /etc/nginx/sites-available/selena /etc/nginx/sites-enabled/selena
    sudo nginx -t
    sudo systemctl reload nginx

The VPS firewall and REG.Cloud security group must allow TCP 80 and 443.
Keep SSH allowed. Verify http://your-domain.ru serves the app, then run:

    sudo certbot --nginx -d your-domain.ru -d www.your-domain.ru

Omit www if its A record is not set. Enable HTTP -> HTTPS redirection when
offered. Check certificate renewal:

    sudo certbot renew --dry-run

Verify the actual https:// domain, /catalog, /api/catalog/, /user/csrf/,
login, /manage, images and admin image uploading. On a proxy setup, host
Nginx overwrites X-Forwarded-Proto and forwards it through container Nginx,
allowing Django to validate HTTPS securely.

## 5. Updating

Back up PostgreSQL data, media volume and the private .env.production first.
Then update the selected branch and rebuild:

    git switch dev
    git pull --ff-only origin dev
    docker compose --env-file .env.production -f compose.prod.yml up -d --build

NEVER run docker compose down -v on a real deployment: this deletes persistent
database and media volumes. Avoid changing the PG_PASSWORD for an existing
PostgreSQL volume without also updating the database user.
