# `docs/DEV_GUIDE.md` — Developer onboarding & commands (copy-paste ready)

> **Purpose:** quick, exact commands + short explanations so any frontend or backend developer (esp. interns) can set up, run, debug and contribute to the Idara-Al-Khair SIS monorepo.

---

## 0) Prerequisites (every dev)

* Git installed & authenticated with SSH for GitHub.
* Docker Desktop (Windows/Mac) or Docker Engine + docker-compose (Linux).
* Node.js (v18+) and npm (for local frontend dev if you want to run without Docker).
* Python 3.11+ and `venv` if running backend locally (optional — Docker preferable).
* Editor: VS Code recommended.

Make sure Docker Desktop is running before using any `docker-compose` commands.

---

## 1) Where files live (monorepo)

```
student-management-system/
├─ backend/           # Django project
├─ frontend/          # Next.js project
├─ docker-compose.yml
├─ .env               # root env (docker-compose)
├─ backend/.env       # backend-only secrets
├─ frontend/.env      # frontend env (NEXT_PUBLIC_*)
├─ docs/DEV_GUIDE.md  # (this file)
```

---

## 2) First-time project bootstrap (one command for Docker users)

Run in repo root:

```bash
# starts DB + backend + frontend + pgadmin (detached)
docker-compose up --build -d
```

Wait 10–30 seconds for containers to start. Then:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend:  [http://localhost:8000](http://localhost:8000)
* PgAdmin:  [http://localhost:5050](http://localhost:5050)  (login from root .env values)

---

## 3) Useful docker-compose commands (daily)

```bash
# Start (foreground) - useful for logs
docker-compose up

# Start detached (background)
docker-compose up -d

# Rebuild services after Dockerfile or dependency changes
docker-compose up --build -d

# Rebuild a specific service only
docker-compose build backend
docker-compose up -d backend

# Stop everything
docker-compose down

# Remove volumes too (warning: deletes DB data)
docker-compose down -v

# See running containers & ports
docker-compose ps

# Follow logs for a single service
docker-compose logs -f backend

# Follow all logs
docker-compose logs -f

# Enter a running container (run shell)
docker-compose exec backend bash    # for Debian/Ubuntu based image
docker-compose exec frontend sh     # for Alpine based node image

# Run one-off commands inside container
docker-compose run --rm backend python manage.py migrate
docker-compose run --rm backend python manage.py createsuperuser
docker-compose exec backend python manage.py makemigrations <app>
docker-compose exec backend python manage.py migrate
```

---

## 4) Backend (Django) — dev tasks & package workflow

### Run migrations & create superuser

```bash
# make migrations for a specific app
docker-compose exec backend python manage.py makemigrations users

# apply migrations
docker-compose exec backend python manage.py migrate

# create admin user
docker-compose run --rm backend python manage.py createsuperuser
```

### Run tests

```bash
docker-compose exec backend pytest -q
# or
docker-compose exec backend python manage.py test
```

### Add a new Python package (recommended)

Option A — modify locally and update `requirements.txt` (safer):

```bash
# on your machine (or inside container shell)
pip install somepackage

# update requirement file
pip freeze > backend/requirements.txt
# commit requirements.txt so everyone else builds same container
git add backend/requirements.txt && git commit -m "chore: add somepackage to requirements"
```

Then rebuild backend:

```bash
docker-compose up --build -d backend
```

Option B — temporary install inside running container (not persistent):

```bash
docker-compose exec backend bash
pip install somepackage
# note: container restart will lose this unless requirements.txt updated and image rebuilt
```

### Edit `backend/.env`

Put secrets used only by Django (do not commit `.env`):

```
DJANGO_SECRET_KEY=some-secret
DEBUG=1
DB_NAME=project_db
DB_USER=project_user
DB_PASSWORD=project_pass
DB_HOST=db
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```

`docker-compose.yml` reads root `.env` for DB image env; backend reads `backend/.env` via `env_file:`.

---

## 5) Frontend (Next.js) — dev tasks & package workflow

### Start dev server locally (without Docker)

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

### Add frontend package (npm)

```bash
cd frontend
npm install some-package
# commit package.json & package-lock.json
git add package.json package-lock.json
git commit -m "feat(frontend): add some-package"
```

If using Docker for frontend, rebuild image after package change:

```bash
docker-compose build frontend
docker-compose up -d frontend
```

### Environment variables for frontend

`frontend/.env` or root `.env` with `NEXT_PUBLIC_API_URL`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Note: only variables prefixed with `NEXT_PUBLIC_` are exposed to client-side code.

---

## 6) Database (Postgres) — using pgAdmin and backups

### Connect with pgAdmin (browser)

* Open [http://localhost:5050](http://localhost:5050)
* Login: use `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from root `.env`
* Create a new server connection:

  * Host: `db` (container name)
  * Port: `5432`
  * Username: `${POSTGRES_USER}`
  * Password: `${POSTGRES_PASSWORD}`
  * Database: `${POSTGRES_DB}`

### View data & run SQL

pgAdmin lets you view tables, run queries, export/import data.

### Backups & persistence

* The docker-compose file mounts a volume `postgres_data:` so DB data survives container restarts.
* For production, schedule DB dumps off the container (e.g., `pg_dump`) to safe storage.

---

## 7) Logs & debugging (common issues)

* Container won’t start → `docker-compose logs -f <service>` and inspect trace.
* Port busy → change the port in `.env` or stop the process using that port.
* Missing requirements → `ModuleNotFoundError` in backend logs; ensure `backend/requirements.txt` includes new packages and rebuild image.
* Permission / file copy errors during Docker build → check `COPY` source paths are correct (relative to build context).

Helpful commands:

```bash
# view last 200 lines of backend logs
docker-compose logs backend --tail=200

# follow logs and filter (ctrl+C to stop)
docker-compose logs -f backend
```

---

## 8) Git — project specific basic workflow (exact commands)

### Branch naming (convention)

* `main` — stable production code (protected)
* `dev` — integration branch for completed features
* `feature/<issue#>-short-desc` — feature branch
* `fix/<issue#>-short-desc` — bug fix

### Typical day-to-day

```bash
# 1. Sync main & dev
git checkout main
git pull origin main
git checkout dev
git pull origin dev

# 2. Create a new feature branch from dev
git checkout dev
git checkout -b feature/123-login

# 3. Work, add & commit changes frequently
git add .
git commit -m "feat(auth): add login endpoint"

# 4. Push branch to remote
git push -u origin feature/123-login

# 5. Create PR on GitHub:
# - Target: dev (or main if release)
# - Title: feat(auth): add login endpoint
# - Description: what changed, how to test, linked issue

# 6. After PR approved and CI green: Merge (Squash & Merge recommended)
# 7. Update local dev/main
git checkout dev
git pull origin dev
```

### Quick fixes

```bash
# Switch branch
git checkout feature/123-login

# Pull remote changes
git pull origin feature/123-login

# Rebase feature branch onto latest dev (optional, avoid if team prefers merges)
git fetch origin
git rebase origin/dev
# Resolve conflicts, then:
git push --force-with-lease
```

---

## 9) How to add new project tasks (tickets → branch → PR)

1. Create Issue in GitHub with acceptance criteria & test steps.
2. Create feature branch: `feature/<issue#>-short`.
3. Implement code + tests + documentation update (if needed).
4. Commit using conventional message: `feat(auth): add login`.
5. Push and open PR targeting `dev`. Add reviewers and test instructions.
6. Fix review comments, then merge when green.

---

## 10) Troubleshooting checklist (quick)

* If frontend shows blank page: check frontend logs and ensure `NEXT_PUBLIC_API_URL` points to running backend.
* If backend cannot connect to DB: ensure DB container is up (`docker-compose ps`) and check `DB_HOST` = `db` in backend/.env.
* If migrations fail: run `docker-compose run --rm backend python manage.py makemigrations` then migrate.
* If Docker build fails on `COPY requirements.txt`: ensure `backend/requirements.txt` exists and spelled correctly.

---

## 11) Good practices & tips for interns

* Always run `docker-compose pull` occasionally to refresh base images.
* Do not commit `.env` files. Commit `.env.example` instead with placeholder values.
* After adding a dependency, update `requirements.txt` or `package.json` and commit it.
* Keep PRs small; explain how to test in PR description.

---

## 12) Example `README` snippet to link this doc

Add to repo root `README.md`:

```md
## Developer Guide
See [docs/DEV_GUIDE.md](./docs/DEV_GUIDE.md) for step-by-step setup, commands and workflows for interns & devs.
```

---
