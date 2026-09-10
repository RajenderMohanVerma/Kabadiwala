# Kabadivala

**From local collection to responsible recycling.** Kabadivala is a Phase 2
foundation connecting customers, informal collectors, hubs and recyclers with
a traceable, role-aware platform.

## Phase 1 and Phase 2 delivered

- React/Vite frontend with React Router and responsive public, authentication,
  and dashboard layouts.
- Reusable design primitives, Framer Motion transitions, Lucide icons,
  React Hook Form + Zod validation, Axios service, and installable PWA.
- Express API with Helmet, CORS, auth rate limiting, Zod request validation,
  JWT/bcrypt authentication, global error handling, and role authorization.
- Prisma + PostgreSQL `User` model, migration, and seed data for all five roles:
  `ADMIN`, `CUSTOMER`, `COLLECTOR`, `HUB_MANAGER`, and `RECYCLER`.

Phase 3 adds persistent collection hubs, material batches, recycler processing,
chain-of-custody timelines, digital PDF certificates, admin operations,
complaints, audit logs, bulk pickups and campus drives.

## Setup

### Backend

```bash
cd server
npm install
copy .env.example .env       # Windows
npx prisma migrate deploy
npm run prisma:seed
npm start
```

The API runs at `http://localhost:5000`. Health is available at
`GET /api/health` and returns:

```json
{"success":true,"message":"Kabadivala API is running"}
```

The backend uses PostgreSQL through Prisma. Set `DATABASE_URL` to your local
PostgreSQL or hosted Supabase/Neon connection string before running migrations.
For Render, keep the same PostgreSQL URL in the service environment variables;
never commit it to GitHub.

For a hosted deployment, configure Render with:

```text
Root Directory: server
Build Command: npm install && npx prisma generate
Pre-Deploy Command: npx prisma migrate deploy && npm run prisma:seed
Start Command: npm start
```

The repository contains a PostgreSQL baseline migration under
`server/prisma/migrations/20260910210500_postgresql_init`. Existing SQLite
migration history is no longer used. Changing `DATABASE_URL` alone is not
enough; the Prisma provider and migration history must remain PostgreSQL as
configured in this repository.

### Frontend

```bash
cd client
npm install
npm run dev
```

Set `VITE_API_URL` when the API is not at the default
`http://localhost:5000/api`.

## Demo accounts

Every seeded account uses `Demo@12345` as the clearly fake local password:

| Role | Email |
| --- | --- |
| Admin | `admin@kabadivala.demo` |
| Customer | `customer@kabadivala.demo` |
| Collector | `collector@kabadivala.demo` |
| Hub manager | `hub@kabadivala.demo` |
| Recycler | `recycler@kabadivala.demo` |

Public registration intentionally permits only Customer and Collector roles.
Operational roles are provisioned through seed/admin processes.

## Useful commands

```bash
# root
npm run client
npm run server

# server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# client
npm run build
```

## API foundation

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (authenticated)
- `GET /api/protected` (authenticated smoke route)
- `GET /api/admin/overview` (ADMIN only)
- `GET /api/health`

The server never returns `passwordHash`. Keep `.env` local and use a strong
`JWT_SECRET` outside development.

## Phase 2 pickup workflow

The PostgreSQL database contains `Pickup`, `PickupStatusEvent`, `CollectorMatch`, `Review`, `PointTransaction`, `Notification`, and `Complaint` models in addition to the Phase 1 `User` model. Collection records actual weight and optional proof images. Run `npx prisma migrate deploy` and `npm run prisma:seed` after pulling.

Customer pages are available at `/customer/dashboard`, `/customer/pickups`, `/customer/pickups/new`, `/customer/pickups/:id`, `/customer/profile`, `/customer/points`, `/customer/reviews`, `/customer/complaints`, and `/customer/notifications`. Collectors use the equivalent `/collector/*` pages for requests, status updates, availability, history and ratings.

Pickup IDs use `KC-YYYY-000001` format. Requests start at `REQUESTED`; the server enforces `MATCHING -> ASSIGNED -> ACCEPTED -> COLLECTOR_ON_THE_WAY -> ARRIVED -> COLLECTED`, with `REJECTED` and `CANCELLED` terminal paths. Status events include actor, note, location and timestamp. Explainable matching prioritizes verification, availability, service area, supported categories, capacity, coordinates, rating and workload.

After collection, points are calculated as `10 base + category rate x actual kilograms` (falling back to estimated kilograms when actual weight is unavailable; metal 6, paper 3, plastic 4, e-waste 10, glass 3 and textile 4 points/kg; minimum 10). Handoff QR tokens are SHA-256-backed and replaceable. Multer accepts at most five PNG/JPG/WEBP images, 5MB each.

## Phase 3 operations

Hub managers use `/hub/dashboard`, `/hub/collections`, `/hub/batches`,
`/hub/batches/:id`, `/hub/inventory`, and `/hub/analytics`. The operational UI
verifies collected weights, groups multiple pickups into a batch, generates a
replaceable batch handoff QR, and sends a batch to a selected active recycler.
Batch status is persisted through
`CREATED → READY_FOR_RECYCLER → SENT_TO_RECYCLER → RECEIVED → PROCESSING →
RECYCLED → COMPLETED`.

Recyclers use `/recycler/dashboard`, `/recycler/batches`,
`/recycler/batches/:id`, `/recycler/processing`, `/recycler/history`,
`/recycler/profile`, and `/recycler/analytics`. The UI supports accepting or
rejecting assigned batches, recording processing stages and recovered-material
JSON, and completing recycling. Completing recycling creates a
`RecyclingCertificate`; only the owning customer, assigned recycler, or an
admin can download the generated PDF from
`/api/certificates/:id/download`. `/api/traceability/:entity/:id` returns the
chain timeline.

Admins have dashboards for users, collectors, hubs, recyclers, pickups, batches,
complaints, reviews, notifications, analytics, and audit logs. Admin controls
can verify/unverify users, change account status, and move complaints through
`OPEN`, `IN_REVIEW`, `RESOLVED`, and `CLOSED`. Bulk pickup and campus drive data
is stored in PostgreSQL (`BulkPickup`, `CampusDrive`, and `CampusDepartment`).

## Final audit and demo readiness

The Phase 4 stabilization pass verified the authenticated customer-to-certificate
workflow against the relational database workflow, including collector matching, collection proof,
hub verification, batch handoff, recycler processing, certificate download,
points, notifications, and role restrictions. The production client build
generates an installable PWA with a manifest, service worker, offline
navigation fallback, theme metadata, and the bundled favicon.

For production deployments, set `NODE_ENV=production` and provide a random
`JWT_SECRET` of at least 32 characters. The development fallback secret is
rejected in production. Current limitations are that realtime Socket.IO
updates and map views are not yet enabled, and the frontend remains a compact
single-bundle hackathon implementation; both are documented extension points.
