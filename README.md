# Kabadivala

> A traceable recycling platform connecting customers, collectors, collection
> hubs, recyclers, and administrators.

[![Live frontend](https://img.shields.io/badge/live-vercel-000000?logo=vercel&logoColor=white)](https://kabadiwala-26.vercel.app)
[![API](https://img.shields.io/badge/API-Render-46e3b7?logo=render&logoColor=111111)](https://kabadivala-api.onrender.com/api/health)
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Express%20%7C%20PostgreSQL-2f7d55)](#architecture)
[![License](https://img.shields.io/badge/license-academic%20project-7c5cff)](#)

<p align="center">
  <strong>From pickup request to recycling certificate — one visible, responsible journey.</strong>
</p>

<p align="center">
  <a href="https://kabadiwala-26.vercel.app">Open app</a> ·
  <a href="https://kabadiwala-26.vercel.app/faq">Read FAQ</a> ·
  <a href="https://kabadiwala-26.vercel.app/contact">Contact support</a>
</p>

## Dashboard

| Area | What is included |
| --- | --- |
| **Customer** | Book pickups, upload item photos, review AI suggestions, track status, earn points, review collectors, download certificates |
| **Collector** | View matched requests, accept work, update pickup status, capture proof and actual weight, manage availability |
| **Hub manager** | Verify collections, manage inventory, create batches, use QR handoffs and preserve custody history |
| **Recycler** | Accept batches, record processing stages and recovered materials, complete recycling |
| **Admin** | Manage users, open full user details, verification, pickups, hubs, recyclers, complaints, notifications, analytics and audit logs |
| **Public experience** | Landing page, How it works, Impact, redesigned FAQ with Gemini assistant, Contact, Privacy Policy and Terms of Service |

## Quick start

```bash
git clone https://github.com/RajenderMohanVerma/Kabadiwala.git
cd Kabadiwala
npm install
npm --prefix server install
npm --prefix client install
```

Create `server/.env` from `server/.env.example`, then start the API and frontend
in separate terminals:

```bash
npm run server
npm run client
```

Open [http://localhost:5173](http://localhost:5173).

<details>
<summary><strong>Public pages</strong></summary>

| Page | Route |
| --- | --- |
| How it works | `/how-it-works` |
| Our impact | `/impact` |
| FAQ + AI assistant | `/faq` |
| Contact support | `/contact` |
| Privacy policy | `/privacy-policy` |
| Terms of service | `/terms-of-service` |

</details>

Kabadivala turns a pickup request into a visible recycling journey: customers
can schedule collections and earn eco points, collectors can manage assigned
requests, hubs can verify weights and create batches, recyclers can record
processing, and administrators can monitor the complete chain.

## Product highlights

- Role-aware workspaces for `CUSTOMER`, `COLLECTOR`, `HUB_MANAGER`, `RECYCLER`,
  and `ADMIN`.
- Secure JWT authentication with bcrypt password hashing, ownership checks,
  role authorization, Helmet, CORS, rate limiting, and Zod validation.
- Customer pickup booking with date, time, AM/PM period, address, notes,
  quantity, category, and item images.
- Camera-first and manual image upload flow with Gemini-assisted item
  identification.
- Explainable collector matching based on verification, availability,
  supported categories, capacity, service area, coordinates, rating, and
  workload.
- Pickup status history, collection proof, actual-weight capture, points,
  notifications, reviews, and complaints.
- Hub verification, inventory, batch creation, QR handoffs, recycler
  processing stages, recovered materials, chain-of-custody events, and
  recycling certificates.
- Admin operations, analytics, audit logs, bulk pickup records, and campus
  drive records.
- Responsive React interface with public landing pages, role-based navigation,
  Framer Motion-ready UI, Lucide icons, charts, loading/error/empty states,
  and PWA support.
- Dedicated support experience with animated FAQ cards, predefined answers,
  Gemini-powered project-aware questions, role-based Contact form, SMTP email
  delivery, and 24/7 support messaging.
- Professional legal pages for Privacy Policy and Terms of Service with
  responsive layouts, animated hero cards, section navigation, and links back
  to Contact support.

## Architecture

```text
React + Vite + React Router
        │
        │ Axios / JSON / multipart uploads
        ▼
Express API + JWT + Zod + Multer
        │
        ├── Prisma ORM
        ├── PostgreSQL
        ├── Gemini Vision API (server-side only)
        └── PDF / QR generation
```

### Repository layout

```text
.
├── client/
│   └── src/
│       ├── App.jsx                 # Route tree and protected routes
│       ├── NewPickupPage.jsx       # Camera/upload pickup workflow
│       ├── layouts.jsx             # Public and dashboard layouts
│       ├── pages.jsx               # Public, customer, and collector pages
│       ├── phase3.jsx              # Hub, recycler, and admin operations
│       ├── context/                # Authentication state
│       ├── services/               # Axios API service
│       └── styles.css              # Responsive design system
├── server/
│   ├── server.js                   # Express API
│   ├── prisma/
│   │   ├── schema.prisma           # PostgreSQL schema
│   │   ├── migrations/             # PostgreSQL migration history
│   │   └── seed.js                 # Demo data
│   ├── uploads/                    # Local development uploads
│   └── .env.example
├── brain.md                        # Maintainer project memory
└── README.md
```

## Local development

### Prerequisites

- Node.js 18 or newer
- PostgreSQL 14 or newer, local or hosted
- A Gemini API key is optional and required only for AI item identification

### Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### Configure the backend

```powershell
cd server
copy .env.example .env
```

Set the values in `server/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173,https://kabadiwala-26.vercel.app
GEMINI_API_KEY=replace-with-your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-account@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-smtp-account@gmail.com
```

`GEMINI_API_KEY` is optional for the rest of the application. Never commit a
real key, database URL, JWT secret, or `server/.env`.

The public Contact page sends messages to `rajendramohan7800@gmail.com` through
SMTP. Configure the SMTP variables above in Render; for Gmail, use an App
Password rather than your normal account password.

`CLIENT_ORIGIN` accepts a comma-separated list. Keep both the local Vite
origin and the deployed frontend origin when the same API serves both:

```env
CLIENT_ORIGIN=http://localhost:5173,https://kabadiwala-26.vercel.app
```

The local backend requires a running PostgreSQL server at the host in
`DATABASE_URL`. The frontend cannot log in against the local API while that
database is stopped or unavailable; the API will return a clear database
availability error instead of a generic server error.

### Configure the frontend

The frontend defaults to `http://localhost:5000/api` during local development.
To override it, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run the application

Use two terminals:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

The frontend runs at `http://localhost:5173` and the API at
`http://localhost:5000`.

### Prisma commands

```bash
cd server
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

`npm run prisma:seed` applies pending PostgreSQL migrations before running the
seed, which keeps hosted deployments from seeding against an outdated schema.

For local schema development:

```bash
npm run prisma:migrate
```

The active Prisma provider is PostgreSQL. The baseline migration is
`server/prisma/migrations/20260910210500_postgresql_init`.

## Demo accounts

The seed script creates the following clearly fake demo accounts. All use
`Demo@12345` as the local demo password.

| Role | Email |
| --- | --- |
| Customer | `customer@kabadivala.demo` |
| Collector | `collector@kabadivala.demo` |
| Hub manager | `hub@kabadivala.demo` |
| Recycler | `recycler@kabadivala.demo` |
| Admin | `admin@kabadivala.demo` |

Public registration supports only customer and collector accounts. Operational
roles are provisioned by seed/admin processes.

## Main user journeys

### Customer

1. Register or sign in.
2. Open **New pickup**.
3. Take a photo or upload a JPG, JPEG, PNG, or WEBP image.
4. Review the optional Gemini suggestion and edit the fields.
5. Choose an address, date, time, and AM/PM period.
6. Submit the pickup and track its status, proof, points, notifications, and
   certificate.

### Collector

Collectors see eligible requests, accept work, advance status, and record
actual weight with optional collection proof. Customer item photos are visible
to the assigned operational team.

### Hub manager

Hub managers verify collected weights, inspect photos, manage inventory,
create batches, generate replaceable QR handoff tokens, and send batches to
active recyclers.

### Recycler

Recyclers accept or reject batches, record processing stages and recovered
materials, and complete recycling. Completion creates a downloadable
Kabadivala recycling certificate.

### Administrator

Administrators manage users, verification, account status, pickups, batches,
complaints, notifications, analytics, audit logs, hubs, collectors, and
recyclers.

## Pickup and recycling lifecycle

Pickup requests begin at `REQUESTED` and follow server-enforced transitions:

```text
REQUESTED
  → MATCHING
  → ASSIGNED
  → ACCEPTED
  → COLLECTOR_ON_THE_WAY
  → ARRIVED
  → COLLECTED
```

`REJECTED` and `CANCELLED` are terminal paths. Subsequent hub, batch, and
recycler records preserve custody and processing history until recycling is
completed.

Pickup codes use the `KC-YYYY-000001` format. Points use a documented
category-rate formula based on actual collected weight, with estimated weight
as a fallback where necessary.

## Gemini item identification

The authenticated endpoint is:

```text
POST /api/ai/identify-item
```

Send one multipart field named `image`. Supported formats are:

- `image/jpeg`
- `image/jpg`
- `.jpg`
- `.jpeg`
- `image/png`
- `image/webp`

The maximum file size is 5 MB. The backend normalizes JPEG MIME variants,
discovers models enabled for the configured API key, selects a compatible
`generateContent` model, retries compatible response formats, and validates
the structured result before returning it.

The result can include:

```json
{
  "itemName": "old laptop",
  "category": "E-waste",
  "material": "mixed electronics and plastic",
  "condition": "used",
  "estimatedWeightKg": 2.4,
  "confidence": 0.91,
  "notes": "Review the weight before submitting."
}
```

AI output is an assistive suggestion, not an authoritative classification.
Users can always edit the fields or continue manually if AI is unavailable.

## API foundation

Important endpoints include:

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/pickups
POST   /api/pickups
POST   /api/pickups/:id/match
PATCH  /api/pickups/:id/status
POST   /api/ai/identify-item
GET    /api/traceability/:entity/:id
GET    /api/certificates/:id/download
```

The API uses the response shape:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

### Public support endpoints

```text
POST   /api/ai/faq
POST   /api/contact
```

The FAQ assistant is constrained to Kabadivala product context and returns
clear provider errors when the Gemini key, model, quota, or network is
misconfigured. Contact messages are validated server-side and delivered to the
configured support inbox through SMTP; credentials never enter the frontend.

## Production deployment

### Backend on Render

Recommended service settings:

```text
Root Directory: server
Build Command: npm install && npx prisma generate && npx prisma migrate deploy && npm run prisma:seed
Start Command: npm start
```

Required Render environment variables:

```text
NODE_ENV=production
PORT=10000
DATABASE_URL=<PostgreSQL connection string>
JWT_SECRET=<random secret with at least 32 characters>
CLIENT_ORIGIN=https://your-frontend-domain
GEMINI_API_KEY=<new valid Gemini API key>
GEMINI_MODEL=gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash
```

The Render free plan may not expose a separate pre-deploy command, so Prisma
migrations and seeding are intentionally part of the build command. Use a
PostgreSQL Session Pooler connection when the database provider requires it
for external hosting.

### Frontend on Vercel

Set the following Vercel environment variable:

```text
VITE_API_URL=https://your-render-service.onrender.com/api
```

Because `VITE_` values are bundled into browser code, this is configuration,
not a secret. Never place private credentials in a `VITE_` variable.

## Support configuration

The Contact page accepts customers, collectors, hub managers, recyclers,
admins, and other visitors. Configure these backend variables on Render:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-account@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-smtp-account@gmail.com
```

For Gmail, enable 2-Step Verification and create a 16-character App Password.
Use that App Password in `SMTP_PASS`; never use or commit the normal Gmail
password. Support messages are sent to `rajendramohan7800@gmail.com`.

## Production checklist

- Set `CLIENT_ORIGIN` to the deployed frontend URL.
- Set `VITE_API_URL` on Vercel to the Render API `/api` URL.
- Run migrations before seed data with `npx prisma migrate deploy`.
- Keep `GEMINI_API_KEY`, `JWT_SECRET`, `DATABASE_URL`, and SMTP credentials
  server-side only.
- Confirm Render uses `app.set('trust proxy', 1)` before rate-limited routes.
- Test `/api/health`, login, FAQ, Contact, and one complete pickup flow after
  every deployment.

## Validation

```bash
node --check server/server.js
npm --prefix client run build
npx prisma validate --schema server/prisma/schema.prisma
```

The frontend build currently reports non-blocking Zod annotation and main
bundle-size warnings. They do not prevent deployment.

## Validation

Run the existing checks from the repository root:

```bash
node --check server/server.js
npm --prefix client run build
```

The frontend build generates the PWA manifest, service worker, Workbox assets,
and production bundle. Existing non-blocking warnings include third-party Zod
annotation messages and the large main JavaScript chunk.

## Security and data handling

- Keep `server/.env`, database credentials, JWT secrets, and Gemini keys out
  of Git.
- Rotate any key that has ever been exposed.
- Store Gemini credentials only on the backend.
- Use a strong production `JWT_SECRET` of at least 32 characters.
- Treat AI output as editable user input.
- Keep role and ownership checks on the server; frontend navigation is not a
  security boundary.
- Local `server/uploads` storage is not durable across Render recreation.

## Known limitations and next improvements

- Realtime Socket.IO notifications are not implemented.
- Map views and route optimization are not implemented.
- Render local uploads should be moved to Supabase Storage, Cloudinary, or
  another durable object store for production.
- Bulk pickup and campus-drive APIs exist, but their management UI is compact.
- The frontend is still delivered as a large primary bundle and can be
  improved with route-level code splitting.
- Automated end-to-end coverage is not configured.

## License

This project is maintained as an educational and product-prototyping
repository. Add a project-specific license before distributing it publicly.
