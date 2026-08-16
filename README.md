# Renewals Tracker

A renewal reminder app built on the Thin Frontend / Fat Backend / JSON storage
stack from your spec.

- **Frontend** (`/frontend`) - React + Vite. Pure UI: renders items, collects
  form input, calls the API, displays whatever the backend returns. No business
  rules live here.
- **Backend** (`/backend`) - Spring Boot (Java 17, Maven). Owns validation,
  the reminder "safe check", days-left calculations, and reading/writing the
  JSON files. Single source of truth.
- **Storage** (`/backend/data`) - `items.json` and `categories.json`, created
  automatically on first run.

## Features implemented

**Add item** - Name/Title, Amount, Date/deadline, Category (optional),
Description/Notes. Items are fully editable and deletable from the same form.

**Renewal cycle**
- The add/edit form is a 2-step flow: fill in the item details, hit **Next**,
  then choose how it repeats - **One-time** (a final payment, never renews),
  **Monthly**, **Yearly**, or **Custom** (e.g. "every 45 days" / "every 6
  months"). This is stored per item (`cycleType`, plus `customIntervalValue` /
  `customIntervalUnit` for custom cycles).
- Categories ship with 7 sample defaults (Subscription, Insurance, License,
  Domain/Hosting, Membership, Utility Bill, Other) and can be created, renamed,
  or deleted from **Manage categories**.
- Safe check: whenever an item's reminders would give little advance notice
  (no reminder set, or the earliest one fires fewer than 3 days before the
  deadline, or there's only a single reminder), the backend attaches a warning
  and suggested additional offsets (e.g. "add a reminder 7 days before").
  The frontend just displays it - it never decides on its own when to warn.

**Mark as paid** - Every item has a **✓ Mark as paid** button (on its card,
and inside the edit form). Clicking it:
- **One-time items** are deleted entirely - the payment is final, nothing
  left to track.
- **Recurring items** (monthly/yearly/custom) have their deadline rolled
  forward by one cycle and go back into the list with a fresh due date.
  `POST /api/items/{id}/complete` does this server-side and returns either
  `{ deleted: true, item: null }` or `{ deleted: false, item: <updated item> }`.

**Notification** - `GET /api/notifications` returns every item whose reminder
window has been reached, each with its name and time left (e.g. "3 days left",
"Due today", "Overdue by 2 days"). The bell icon in the top bar polls this
every 60 seconds and shows a red dot when anything is active. If you click
**🔔 Enable notifications** in the top bar, the browser also fires a real OS-level
popup for each newly-active reminder (via the Notification API), even if the
tab isn't focused. Each reminder only pops once per item/offset/deadline
combination (tracked in `localStorage`) so it doesn't repeat every 60 seconds.

## Running it

### Option A: Docker (recommended)

This is the easiest way to run both services together - no local Java/Node/Maven
setup needed, just Docker Desktop.

```bash
docker compose up --build
```

- App: **http://localhost:3000**
- Backend directly (for testing with curl/Postman): **http://localhost:8080**

What's happening under the hood:
- `docker-compose.yml` builds two images (`backend`, `frontend`) and starts
  them on a shared network.
- `backend/Dockerfile` is a multi-stage build: compiles the jar with Maven,
  then runs it on a slim JRE image.
- `frontend/Dockerfile` is also multi-stage: builds the React app with Vite,
  then serves the static files with nginx.
- `frontend/nginx.conf` serves the app and forwards any `/api/...` request to
  `http://backend:8080/api/...` - `backend` is just the service name from
  compose, resolved automatically over Docker's internal network. This means
  the browser only ever talks to `localhost:3000`, so there's no CORS issue.
- `./backend/data` is mounted as a volume into the backend container, so your
  `items.json`/`categories.json` survive container restarts.

**Useful commands:**

| Command | What it does |
|---|---|
| `docker compose up --build` | Build (if needed) and start both containers |
| `docker compose up -d` | Same, but detached (runs in the background) |
| `docker compose down` | Stop and remove the containers |
| `docker compose down --rmi all -v` | Also remove the built images and volumes - use this for a fully clean slate |
| `docker compose build --no-cache` | Force a from-scratch rebuild (skip this unless something looks stale) |
| `docker compose logs -f backend` | Tail the backend's logs |

**When to rebuild:** any time you change source code in `backend/` or
`frontend/`, you need to rebuild that image - Docker doesn't hot-reload code
changes automatically the way `mvn spring-boot:run` or `npm run dev` do. Run
`docker compose up --build` again after making changes. If something looks
stale even after a normal `--build` (e.g. old styling or old behavior showing
up), do a full clean rebuild:

```bash
docker compose down --rmi all -v
docker compose build --no-cache
docker compose up
```

...and hard-refresh your browser (Ctrl+Shift+R / Cmd+Shift+R) or test in an
incognito window, since browsers can cache the old JS/CSS bundle too.

### Option B: run each service manually (no Docker)

#### 1. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`. On first run it creates `backend/data/`
with seeded `categories.json` and an empty `items.json`.

#### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` to the backend (see
`vite.config.js`), so no CORS setup is needed in dev.

## API reference

| Method | Path                  | Purpose                              |
|--------|-----------------------|---------------------------------------|
| GET    | `/api/items`          | List all items (sorted by deadline)   |
| GET    | `/api/items/{id}`     | Get one item                          |
| POST   | `/api/items`          | Create an item                        |
| PUT    | `/api/items/{id}`     | Update an item                        |
| DELETE | `/api/items/{id}`     | Delete an item                        |
| POST   | `/api/items/{id}/complete` | Mark as paid: rolls recurring items forward, deletes one-time items |
| GET    | `/api/categories`     | List categories                       |
| POST   | `/api/categories`     | Create a category                     |
| PUT    | `/api/categories/{id}`| Rename/re-icon a category              |
| DELETE | `/api/categories/{id}`| Delete a category                     |
| GET    | `/api/notifications`  | Active "you should know about this" list |

Item request/response bodies use ISO dates (`"deadline": "2026-09-01"`) and
`reminderOffsets` as a list of integers meaning "days before the deadline",
e.g. `[7, 1]`.

## What's simple by design

- Single user, no auth/login.
- Notifications work while the app/browser is running - there's no server-side
  push, email, or scheduled job, so nothing fires if the browser is fully
  closed.
- No recurring auto-renewal logic (e.g. auto-advancing the date after it
  passes without you doing anything) - "Mark as paid" is how a cycle rolls
  forward.

Happy to add any of those next if you want them.