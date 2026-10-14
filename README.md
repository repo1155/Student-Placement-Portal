# Pathway — Student Placement Portal

A responsive student-to-employer placement portal built with React, Express, and MongoDB. It includes role-based accounts, opportunity discovery, saved roles, application tracking, and employer applicant management.

## Features

- **Student accounts:** secure registration and sign-in, profile basics, searchable/filterable internships and co-ops, saved roles, applications with an optional resume link and cover note, and live application statuses.
- **Employer accounts:** company-linked accounts, role publishing and closing, applicant lists, resume links, and status updates (submitted, in review, interview, offer, or not selected).
- **Platform basics:** server-side validation, HTTP-only JWT session cookies, password hashing, role checks, rate-limited authentication, security headers, CORS allow-list, responsive layout, health endpoint, and MongoDB indexes.
- **Seed data:** six sample opportunities for local evaluation. These are fictional sample listings and should be removed before public launch.

The feature set follows familiar career-marketplace conventions such as keyword/category/work-style discovery, saved searches/roles, application status visibility, and employer applicant workflows. Career-readiness content references [NACE's career readiness competencies](https://www.naceweb.org/career-readiness/competencies/career-readiness-defined).

## Run locally with Docker

Requirements: Docker Engine with Compose.

```sh
cp .env.example .env
# Replace JWT_SECRET and MONGO_ROOT_PASSWORD with unique values before use.
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). Seed sample listings in a second terminal:

```sh
docker compose exec api node src/seed.js
```

Demo employer account: `demo@northstar.example` / `PlacementDemo2026!`. For a full walkthrough, register a student account and apply to one of the sample roles.

To stop the services, run `docker compose down`. Mongo data remains in the `mongo-data` volume.

## Run without Docker

Requirements: Node.js 20+, npm, and MongoDB.

```sh
cp backend/.env.example backend/.env
# Set a unique JWT_SECRET of at least 32 characters and your MongoDB connection string.
cd backend && npm install && npm run seed
```

In another terminal:

```sh
cd frontend && npm install && npm run dev
```

The Vite development server proxies `/api` to `http://localhost:5000`. Start the API in another terminal with `cd backend && npm run dev`. Open [http://localhost:5173](http://localhost:5173).

## Configuration

The API requires `MONGODB_URI` and `JWT_SECRET`. `CLIENT_ORIGIN` is the exact allowed frontend origin (a comma-separated list is supported for multiple trusted origins); `PORT` defaults to `5000`. Compose initializes MongoDB with root credentials from `.env` and connects the API to the MongoDB service over Docker's internal network. MongoDB's port is published on loopback for local tools. Set `MONGODB_URI` to a managed database connection string when deploying externally. URL-encode credentials embedded in MongoDB URIs. In production, set `NODE_ENV=production` so session cookies are marked `Secure`, terminate TLS in front of the API, and set `CLIENT_ORIGIN` to the deployed frontend origin.

For standalone hosting, set `VITE_API_URL` at frontend build time to the API origin. For the included Nginx deployment, the frontend and API share one origin and `/api` is proxied internally.

## Frontend structure

- `frontend/src/components/` contains reusable site-wide UI such as buttons, dialogs, navigation, job cards, and status labels.
- `frontend/src/features/` groups product screens and forms by workflow: opportunity discovery, student applications, employer hiring, and authentication.
- `frontend/src/hooks/usePlacementPortal.js` owns shared portal state and API actions; `App.jsx` composes the screens and dialogs.

## Production deployment checklist

The repository provides production builds and container images; a real launch still requires environment-specific operations:

- Use HTTPS, a strong unique secret from a secret manager, and production MongoDB credentials/network rules.
- Configure MongoDB backups, monitoring, alerting, and a tested restore process.
- Use a shared rate-limit store when running multiple API replicas; the included limiter uses the process-local default store.
- Add transactional email and account recovery, moderation/reporting, privacy/retention policies, and an operational admin workflow before opening signups broadly.
- Review resume-link handling and define an approved document storage/scanning provider before accepting uploaded files. The initial release stores optional external resume links only.
- Replace/remove demo data and rotate all credentials before any public deployment.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | Liveness check |
| `POST` | `/api/auth/register` | Public | Create student/employer account |
| `POST` | `/api/auth/login` | Public | Start session |
| `POST` | `/api/auth/logout` | Public | End session |
| `GET` | `/api/auth/me` | Signed in | Current account |
| `GET` | `/api/jobs` | Public | Search/filter open opportunities (`page`, `limit`, `search`, `category`, `workMode`, `type`, `location`, `sort=recent`) |
| `GET` | `/api/jobs/:id` | Public | Opportunity details |
| `POST` | `/api/jobs` | Employer | Publish opportunity |
| `GET` | `/api/jobs/mine` | Employer | Own listings |
| `PATCH` | `/api/jobs/:id/status` | Employer | Open or close listing |
| `GET` | `/api/jobs/:id/applications` | Listing owner | View applicants |
| `POST` | `/api/applications/jobs/:jobId/applications` | Student | Apply once to an open opportunity |
| `GET` | `/api/applications/mine` | Student | Track submitted applications |
| `PATCH` | `/api/applications/:id/status` | Listing owner | Update application status |
| `GET`, `POST`, `DELETE` | `/api/saved`, `/api/saved/:jobId` | Student | List, save, and unsave opportunities |

## Checks

```sh
cd backend && npm test
cd frontend && npm run build
```
