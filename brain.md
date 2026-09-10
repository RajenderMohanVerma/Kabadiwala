# Kabadivala Project Memory

## Project overview

Kabadivala is intended to connect customers, informal e-waste collectors
(kabadiwalas), collection hubs, recyclers, and administrators. The current
repository is an early hackathon prototype named Kabadiwala Connect.

## Project goals

The target product is a real, database-backed recycling chain:

Customer -> pickup request -> smart collector matching -> verified collector
-> pickup -> collection hub -> recycler -> processing -> recycling -> digital
certificate and eco points.

The project must preserve and digitally strengthen the informal collector
network rather than replace it.

## Current repository audit

### Existing architecture

- Root scripts delegate to separate client and server npm projects.
- The client is a Vite React single-page prototype.
- The server is a single Express entry point with in-memory arrays.
- The server has optional Mongoose connection code, but the current API works
  without a database.
- The current architecture does not yet use the required Prisma and SQLite
  stack.
- Authentication currently returns JWTs, but API authorization middleware is
  not implemented.
- The client calls the API directly with `fetch` and uses a hardcoded
  `http://localhost:5000/api` base URL.
- No Socket.IO, upload pipeline, PDF generation, PWA configuration, or
  frontend test setup is present.

### Existing folder structure

```text
/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── models/
│       ├── User.js
│       ├── Pickup.js
│       ├── MaterialLot.js
│       └── Transaction.js
├── package.json
├── package-lock.json
├── README.md
└── prompt.md
```

`node_modules` directories and the generated client `dist` output are
environment/build artifacts and are not application source.

### Existing frontend pages and views

There is no React Router route tree. The application switches views through
local React state in `main.jsx`:

- Login/demo role selection
- Household overview
- Collector dashboard
- Recycler overview
- Municipality/admin overview
- Waste scanner
- Pickup list/history
- Digital transactions/wallet
- Digital Kabadi ID
- Recycler inventory
- City analytics

The current application supports four demo roles: household, collector,
recycler, and admin. The required hub manager role is not represented.

### Existing frontend components

All UI components currently live in one large `client/src/main.jsx` file.
Reusable local components include:

- `Login`
- `Sidebar`
- role-specific home components
- `Scanner`
- `Pickups`
- `Wallet`
- `Identity`
- `Inventory`
- `Analytics`
- `RequestTable`
- `LotTable`
- `PickupMini`
- `Stat`
- `Panel`

This is useful prototype code, but it should eventually be split into pages,
layouts, components, services, and role-aware routes without discarding the
working visual patterns.

### Existing styling and design system

`client/src/styles.css` contains a custom CSS design system with:

- green sustainability palette
- DM Sans and Manrope typography
- sidebar/topbar dashboard shell
- cards, panels, status badges, tables, pickup cards, wallet, ID card, and
  analytics styling
- responsive rules and dashboard-specific classes

The visual direction is a strong reusable starting point: restrained green
branding, high contrast dark hero panels, compact data cards, and clear status
indicators. It currently relies on text symbols rather than the required
Lucide icon library, and animation support is not present.

### Existing assets and entry points

- `client/index.html` provides the Vite HTML shell and page title.
- `client/src/main.jsx` is both the React entry point and the complete app
  implementation.
- `client/src/styles.css` is the only stylesheet.
- No local image or icon asset directories exist.
- No Tailwind configuration exists.
- No PWA manifest, service worker, or install icons exist.

### Existing backend API

The single `server/server.js` file currently provides:

- `GET /` service information
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- dashboard endpoints for household, collector, recycler, and admin
- `GET /api/pickups`
- `POST /api/pickups`
- `PATCH /api/pickups/:id/status`
- `POST /api/transactions`
- `GET /api/materials/rates`
- `POST /api/ai/classify`
- `GET /api/recycler/inventory`
- `GET /api/admin/analytics`

The API uses demo arrays for users, pickups, lots, and transactions. Responses
are not yet normalized to the required `{ success, message, data }` contract.
Most endpoints have no authentication, role checks, validation, audit log,
persistent status history, or ownership checks.

### Existing data models

The four Mongoose model files describe early schemas for:

- users
- pickups
- material lots
- transactions

They are not currently imported by the API and do not form a persistent
workflow. They should inform, but not constrain, the future Prisma schema.

### Existing dependencies

Root:

- npm scripts for starting the client and server

Client:

- React
- React DOM
- React Router DOM is installed but unused
- Vite
- Vite React plugin

Server:

- Express
- CORS
- dotenv
- jsonwebtoken
- Mongoose

The target stack dependencies that are not currently installed include Prisma,
SQLite Prisma client, bcrypt/bcryptjs, Helmet, express-rate-limit, Zod,
Multer, PDFKit, Socket.IO, Framer Motion, Tailwind CSS, Lucide React, React
Hook Form, Axios, Recharts, React Leaflet, Leaflet, QR tooling, PWA tooling,
and test tooling.

### What is reusable

- The existing dashboard visual language and color tokens.
- The role-specific dashboard information hierarchy.
- The demo account flow as seed/demo UX inspiration.
- Pickup, transaction, inventory, and analytics display patterns.
- Material rate and pickup status concepts.
- The existing root/client/server separation.
- The existing README's local startup flow as a starting point for future
  setup documentation.

### What needs redesign or replacement

- Replace the single state-driven view switcher with route-aware pages and
  protected role routes.
- Split `main.jsx` into maintainable modules.
- Replace direct hardcoded API access with a service layer and environment
  configuration.
- Replace Mongoose/in-memory persistence with Prisma and SQLite.
- Replace plaintext demo passwords with bcrypt-hashed seeded users.
- Add server authentication, role authorization, validation, and consistent
  error handling.
- Rework the current scanner wording: the endpoint is filename-based demo
  classification and must not be presented as real AI.
- Replace hardcoded dashboard fallback values with API/database-backed values.
- Add the missing hub manager role and the full chain-of-custody workflow.
- Add real pickup creation from the client; the current scanner "Request
  Pickup" action only shows a toast.
- Add mobile navigation, accessibility semantics, loading/error/empty states,
  and purposeful reduced-motion-safe animations.

### Current problems and broken/incomplete behavior

- The current implementation is a demo, not a persistent working platform.
- The backend's optional MongoDB setup conflicts with the required SQLite
  architecture.
- The frontend stores only a user object in local storage; the returned token
  is not used for API authorization.
- Dashboard endpoints and pickup endpoints are publicly callable.
- Registration accepts minimal input and stores a predictable demo password.
- Role names and workflow statuses use prototype-specific lowercase values and
  do not cover the required domain statuses.
- The scanner does not upload or inspect an image and its pickup action does
  not create a pickup.
- Several displayed values are fallback or seeded constants rather than
  calculated database statistics.
- There is no persistent notification, review, complaint, points, batch,
  certificate, QR, hub, campus drive, or audit-log feature.
- The installed React Router dependency is unused.
- No dedicated error boundary, 404 page, forbidden page, or unauthorized page
  exists.
- The README describes MongoDB and prototype behavior, so it will need to be
  updated as the architecture changes.

### Baseline validation

- `npm --prefix client run build` succeeds with the current client.
- `node --check server/server.js` succeeds with the current server.
- Running `npm run build` or `node --check server.js` from the repository root
  is not valid because those paths/scripts are not defined at the root.

## Recommended migration and improvement plan

1. Establish Phase 1 foundation: Prisma/SQLite configuration, environment
   handling, server app structure, secure auth, role model, and seed data.
2. Preserve the existing visual system while splitting the client into route,
   layout, page, component, context, and service modules.
3. Implement customer and collector pickup flows with validated forms,
   ownership-aware APIs, smart rule-based collector matching, and status
   history.
4. Add hub, recycler, batch, QR, recycling completion, certificate, points,
   reviews, complaints, notifications, and audit logs.
5. Add responsive/mobile navigation, accessible states, maps, charts, uploads,
   PWA support, and focused tests.
6. Run a final end-to-end audit, remove prototype fallbacks, update README,
   and verify seeded demo flows.

## Database schema summary

Not yet implemented. The future Prisma schema should cover users and role
profiles, addresses, pickups, pickup status history, collector matching,
collection hubs, batches, recycling records, certificates, point
transactions, rewards, reviews, complaints, notifications, bulk pickups,
campus drives, and audit logs.

## Authentication system

Current prototype: demo login returns a JWT and user object. The JWT is not
currently consumed by protected middleware.

Target: bcrypt password hashes, JWT verification middleware, role
authorization, ownership checks, safe responses, rate limiting, and secure
environment-based secrets.

## Roles and permissions

Current: household, collector, recycler, admin.

Target: CUSTOMER, COLLECTOR, HUB_MANAGER, RECYCLER, ADMIN with server-side
authorization for every protected operation.

## API routes

Current routes are listed in the backend audit above. Target routes should be
organized under `/api` by auth, users, customers, collectors, hubs,
recyclers, pickups, tracking, QR, batches, certificates, rewards, reviews,
complaints, notifications, analytics, admin, bulk pickups, and campus drives.

## Important frontend routes

Current views are local state values rather than URL routes. Target routes
should provide public auth pages, role-aware dashboards, pickup creation and
tracking, hub and recycler operations, certificates, complaints, notifications,
analytics, and fallback unauthorized/forbidden/not-found pages.

## Major components

Current components are colocated in `client/src/main.jsx`; see the frontend
audit above. Future shared components should include navigation, status
timeline, forms, tables/cards, modal/drawer, toast, loading, error, empty
state, QR scanner, map, charts, and certificate presentation.

## Feature completion status

### Prototype-present

- Demo login
- Four role dashboards
- Basic pickup list and status mutation
- Material rates
- Filename-based classifier demo
- Transaction list
- Recycler inventory display
- Admin analytics display
- Responsive CSS foundation

### Not implemented

- Prisma/SQLite persistence
- Full authentication and authorization
- Hub manager role
- Smart Collector Matching
- Full pickup lifecycle and status history
- QR verification
- Image uploads
- Batches and recycling records
- Certificates and PDF download
- Eco points and rewards
- Reviews and complaints
- Persistent notifications and realtime updates
- Maps
- Bulk pickups and campus drives
- Audit logs
- PWA
- Automated tests

## Pickup workflow

Current prototype statuses are `requested`, `accepted`, `picked_up`, and
`completed`, stored only in memory.

Target workflow includes REQUESTED, MATCHING, ASSIGNED, ACCEPTED,
COLLECTOR_ON_THE_WAY, ARRIVED, COLLECTED, AT_COLLECTION_HUB, BATCH_CREATED,
SENT_TO_RECYCLER, RECEIVED_BY_RECYCLER, PROCESSING, RECYCLED, COMPLETED,
CANCELLED, and REJECTED, with actor, timestamp, optional location, and note
for each transition.

## QR workflow

Not implemented. Target QR values must contain secure server-issued tokens and
be validated by the backend for collector, hub, and recycler scans.

## Recycling workflow

Not implemented. Target flow is hub receipt and weighing, batch creation,
recycler receipt, processing stages, recovered materials, and completion.

## Certificate workflow

Not implemented. Target output is a Kabadivala Digital Recycling Certificate
or Platform Recycling Record, never a government certificate.

## Environment variables

Current server example:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`

Target environment configuration must remove the MongoDB requirement and
define SQLite/Prisma database URL, JWT settings, client origin, upload limits,
and other non-secret runtime settings. Secrets must remain out of source
control.

## Important commands

Current:

- `npm run server`
- `npm run client`
- `npm --prefix client run build`
- `npm --prefix server run dev`

Target Prisma, seed, test, and production commands still need to be added to
the appropriate package files.

## Known limitations

The current app is demo-only, memory-backed, minimally validated, and lacks
the production security, persistence, workflow, and role coverage required by
the project brief.

## Bugs

No new bug fixes were made during Phase 0. The prototype limitations listed
above should be treated as implementation risks, not silently ignored.

## Future improvements

After the required MVP: multilingual and voice-assisted collector UX, real
image classification, route optimization, demand prediction, external
payments, production object storage, stronger identity verification, and
municipal integrations.

## Current phase

Phase 3 - Hub, batch, recycler, certificate and admin operations completed.

## Last completed task

Reviewed and completed the Phase 3 operational UI on top of the Phase 2
customer and collector pickup workflow. The product now includes persistent
batch inventory, chain-of-custody events, recycler processing stages, PDF
certificates, admin monitoring, complaint management, audit logs, bulk pickups,
campus drives, and database-backed analytics. The Phase 2 customer and
collector pickup workflow remains intact on top of the
Phase 1 React/Vite foundation, responsive route tree, centralized Axios/auth
context, PWA build, Express security middleware, Prisma SQLite, JWT/bcrypt
auth, role authorization, migration, and five-role seed data. The existing
green visual direction and dashboard information hierarchy were preserved
while the old state-switching prototype was retired.

The Phase 3 routes now make real authenticated API calls: hubs verify weights,
create and extend batches, generate replaceable handoff QR codes, and send batches;
recyclers accept/reject, record stages and recovered materials, and complete
recycling; admins can manage user verification/status and complaint status.
Nested relation values render correctly in tables, the hub batch detail route is
declared, and certificate downloads enforce customer/recycler ownership.

Validation completed:

- `npm --prefix client run build`
- `node --check server/server.js`
- `npx prisma validate --schema prisma/schema.prisma`
- live health, login, hub/recycler dashboard and Phase 3 endpoint smoke requests

## Phase 2 files

Created/updated the client route foundation in `client/src/App.jsx`,
`layouts.jsx`, `pages.jsx`, `context/AuthContext.jsx`, `services/api.js`,
`main.jsx`, and `styles.css`; PWA is configured in `client/vite.config.js`.
The server foundation is in `server/server.js`,
`server/prisma/schema.prisma`, `server/prisma/seed.js`, and the initial
Prisma migration. README documents setup, demo users and API routes.

## Phase 4 final audit (2026-09-09)

### Feature status

- **WORKING:** React/Vite routing, public/auth pages, role-aware dashboard
  shells, customer pickup creation, collector matching/status lifecycle,
  collection proof, points, notifications, reviews and complaints.
- **WORKING:** Hub verification and batching, QR handoff, recycler processing,
  chain-of-custody events, certificate PDF generation/download, admin
  monitoring, user verification/status, complaint workflow, audit logs and
  database-backed analytics.
- **WORKING:** Prisma migrations/seed, SQLite persistence, JWT/bcrypt auth,
  Helmet, CORS, auth rate limiting, request validation, upload restrictions,
  PWA manifest/service worker and offline navigation fallback.
- **PARTIALLY WORKING:** Analytics are API-backed and charted for key views,
  but the UI remains intentionally compact rather than a complete reporting
  suite. Bulk pickup and campus-drive APIs are persisted; dedicated rich
  management screens are limited.
- **NOT IMPLEMENTED:** Socket.IO realtime delivery and Leaflet/OpenStreetMap
  maps. These are documented future integration points, not simulated.

### Final validation

- Full live SQLite demo passed: customer pickup -> matching -> collector
  acceptance/arrival/collection -> hub verification -> batch -> recycler
  acceptance/processing/recycling -> certificate download.
- Customer points and notifications were created during the flow.
- Customer access to hub operations and protected mutations returned HTTP 403.
- `npm --prefix client run build` passed and generated `manifest.webmanifest`,
  `sw.js`, Workbox assets and the favicon.
- `node --check server/server.js`, Prisma validation and source diagnostics
  passed.

### Stabilization changes

- Production startup now rejects missing/short `JWT_SECRET` values.
- Recharts visualizations were added for hub category weight and admin pickup
  status.
- Keyboard focus-visible styles and reduced-motion CSS were added.
- Certificate ownership checks and QR documentation were reconciled.

## Remaining intentional scope

Socket.IO realtime updates, Leaflet maps, multilingual and voice-assisted UX,
and external production integrations remain future work.

## Next recommended task

## Phase 2 implementation notes (2026-09-09)

Phase 1 remains intact and is now backed by a Prisma SQLite pickup workflow.
Phase 3 adds `Batch`, `BatchPickup`, `ChainOfCustodyEvent`,
`ProcessingStage`, `RecyclingCertificate`, `AuditLog`, `BulkPickup`,
`CampusDrive`, and `CampusDepartment`. The migration is
`20260909175243_phase3_hubs_recyclers_admin`.

`server/server.js` enforces JWT role/ownership checks and the complete pickup lifecycle. `POST /api/pickups` starts every request at REQUESTED, and `POST /api/pickups/:id/match` ranks verified, available collectors by service area, categories, capacity, coordinates, rating and workload. Multer validates five 5MB PNG/JPG/WEBP images. Collector collection submission records actual weight and optional proof, then creates one immutable points transaction using the documented category formula. QR tokens are random, hashed and replaceable; status events provide the timeline and notifications are persistent.

The React Router application now has dedicated customer, collector, hub,
recycler and admin routes, with responsive loading/error/empty states and
certificate/bulk pickup views. Hub managers verify collection, assemble and
handoff batches; recyclers accept/reject, process and complete them; successful
recycling generates an authenticated PDF certificate.
