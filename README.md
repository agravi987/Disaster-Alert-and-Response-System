# Disaster Alert & Rescue Coordination

Role-based Next.js (App Router) application for disaster reporting, dispatch coordination, and rescue operations.

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- `react-icons`
- Local MongoDB (`mongodb` driver)
- Playwright (`@playwright/test`) for e2e tests

## Environment Setup

Credentials and MongoDB configuration are loaded from `.env`.

1. Copy `.env.example` to `.env` (already included in this project).
2. Ensure local MongoDB is running.

```bash
mongod
```

Default `.env` values:

- `MONGODB_URI=mongodb://127.0.0.1:27017`
- `MONGODB_DB_NAME=disaster_alert_rescue`
- Demo credentials for exactly four roles: admin, citizen, rescue center, rescue team

## Auth Features

- Login (`/login`)
- Signup (`/signup`) with role selection
- Auto-seeded default users from `.env`
- Four-role RBAC model only: `admin`, `citizen`, `rescue-center`, `rescue-team`

## Role Responsibility Model

### 1) Admin
- Governs users and role access
- Monitors the full incident network
- Has global override for alert corrections and deletions

### 2) Citizen
- Reports incidents from the ground
- Can edit/delete only their own reports
- Tracks response progress on submitted alerts

### 3) Rescue Center
- Validates and triages incoming alerts
- Creates and updates dispatch-side operational alerts
- Resolves incidents after coordination confirmation

### 4) Rescue Team
- Executes field missions
- Cannot create/edit/delete alerts
- Can mark active incidents as resolved after on-ground completion

## Role Dashboards and Pages

- `/admin/dashboard`, `/admin/users`, `/admin/all-alerts`
- `/citizen/dashboard`, `/citizen/report-alert`, `/citizen/my-alerts`
- `/rescue-center/dashboard`, `/rescue-center/incoming-alerts`, `/rescue-center/assignments`
- `/rescue-team/dashboard`, `/rescue-team/my-missions`, `/rescue-team/check-in`

## Alert RBAC Rules

- Read alerts: all authenticated roles
- Create alerts: `admin`, `citizen`, `rescue-center`
- Resolve alerts: `admin`, `rescue-center`, `rescue-team`
- Edit alerts:
  - any alert: `admin`, `rescue-center`
  - own alert only: `citizen`
- Delete alerts:
  - any alert: `admin`
  - own alert only: `citizen`

## Dispatch and Team Workflow

- Alert form is hidden by default and opens on demand via **Add Alert** for cleaner dashboards.
- Rescue Center can:
  - view live rescue-team availability (`available`, `busy`, `offline`)
  - assign active alerts to only available rescue teams
  - track all current mission assignments in one board
- Rescue Team can:
  - update check-in availability from the check-in page
  - manage assigned missions (`Assigned` -> `In Progress` -> `Completed`)
  - automatically return to available when active missions are completed

## Theme Support

- Full dark/light mode support
- Theme toggle available on login and all role dashboards
- Theme preference persists in local storage

## Run Locally

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

- `POST /api/login`
- `POST /api/signup`
- `POST /api/logout`
- `GET /api/alerts`
- `POST /api/alerts`
- `PUT /api/alerts/:id`
- `PATCH /api/alerts/:id`
- `DELETE /api/alerts/:id`
- `GET /api/rescue-teams`
- `PATCH /api/rescue-teams`
- `GET /api/missions`
- `POST /api/missions`
- `PATCH /api/missions/:id`

## End-to-End Tests

```bash
npm run test:e2e
```

Major covered scenarios:

- Unauthorized route guard -> login redirect
- Invalid login error handling
- Legacy coordinator rejection
- Signup flow for citizen role
- Role-based login redirects for all 4 roles
- Cross-role access protection
- Responsibility-based RBAC checks for alert actions
- Rescue-center to rescue-team assignment workflow
- Hidden-on-load alert form UX with Add Alert toggle
- Admin navigation links
- Theme toggle and persistence
- Logout flow
- Create/edit/resolve alert flows and validation
