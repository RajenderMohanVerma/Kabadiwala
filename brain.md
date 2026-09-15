# Kabadivala Engineering Memory

This file is the maintainer-facing record of the current implementation. It
should describe the repository as it exists today, not the original prototype.
Update it when architecture, deployment, security, or workflow behavior
changes.

## Current status

**Phase:** Production-oriented stabilization after the PostgreSQL migration,
with the public support and legal experience completed.

**Validated:** React/Vite production build, Express syntax, Prisma PostgreSQL
schema/migration setup, seeded demo accounts, authenticated role workflows,
image upload validation, and the customer pickup camera/upload flow.

**Live topology:**

```text
Vercel frontend
  https://kabadiwala-26.vercel.app
        │
        ▼
Render Express API
  https://kabadivala-api.onrender.com
        │
        ├── Supabase PostgreSQL
        ├── Gemini API (server-side)
        └── Render local uploads (temporary)
```

## Product model

Kabadivala preserves the local collector network while making the recycling
chain traceable:

```text
Customer
  → Pickup request
  → Collector matching
  → Collection proof and weight
  → Hub verification and batch
  → Recycler processing
  → Recycling certificate and eco points
```

The five supported roles are:

| Role | Responsibility |
| --- | --- |
| `CUSTOMER` | Create pickups, review AI suggestions, track progress, earn points |
| `COLLECTOR` | Accept work, advance status, record collection and proof |
| `HUB_MANAGER` | Verify collections, manage inventory, create and hand off batches |
| `RECYCLER` | Process batches, record recovered materials, complete recycling |
| `ADMIN` | Operate and audit the platform across all roles |

## Source structure

### Frontend

- `client/src/App.jsx` contains the route tree and protected role routes.
- `client/src/layouts.jsx` contains the public header/footer and role-aware
  dashboard shell.
- `client/src/pages.jsx` contains the landing page, public information pages,
  auth pages, customer pages, and collector pages.
- `client/src/phase3.jsx` contains hub, recycler, and admin operations.
- `client/src/NewPickupPage.jsx` contains the camera-first customer pickup
  form, image upload, AI analysis, scheduling, and submission logic.
- `client/src/context/AuthContext.jsx` stores the authenticated user and token
  lifecycle.
- `client/src/services/api.js` configures Axios and the production API
  fallback.
- `client/src/styles.css` contains the responsive design system, animation,
  scan card, image gallery, focus states, reduced-motion behavior, redesigned
  Contact page, and legal-page components.

### Backend

- `server/server.js` is the Express API entry point.
- `server/prisma/schema.prisma` is the canonical PostgreSQL schema.
- `server/prisma/seed.js` creates demo users and operational records.
- `server/prisma/migrations/20260910210500_postgresql_init` is the active
  PostgreSQL baseline migration.
- `server/uploads` is local file storage only and is not durable production
  object storage.

## Backend guarantees

The API currently provides:

- JWT authentication with bcrypt password hashes.
- Role authorization and ownership checks.
- Helmet security headers, CORS, auth rate limiting, and Zod validation.
- Consistent `{ success, message, data }` response envelopes.
- Pickup status transition enforcement and persistent event timelines.
- Collector matching with explainable ranking reasons.
- Multer file-size and image-format validation.
- QR token generation with hashed server-side values.
- PDF certificate generation and ownership-aware downloads.
- Persistent notifications, reviews, complaints, points, batches, processing
  stages, custody events, audit logs, bulk pickups, and campus drives.

## Support, contact, and legal pages

The public React route tree includes:

| Route | Behavior |
| --- | --- |
| `/faq` | Animated FAQ cards, predefined Kabadivala answers, and a Gemini assistant |
| `/contact` | Role-aware support form with validation, animated contact channels, 24/7 support copy, and SMTP delivery |
| `/privacy-policy` | Structured privacy policy with sticky section navigation |
| `/terms-of-service` | Structured usage terms with fair-use guidance |

The FAQ assistant calls `POST /api/ai/faq`. Its server prompt is grounded in
Kabadivala workflows, roles, materials, benefits, limitations, eco points,
certificates, and admin operations. It must not invent prices, private account
details, guarantees, or unsupported policies.

The Contact form calls `POST /api/contact`, validates name, email, role,
subject, and a 3–2000 character message, then sends an email to
`rajendramohan7800@gmail.com` using Nodemailer. SMTP values remain on the
backend. SMTP uses bounded connection/greeting/socket timeouts, removes spaces
from grouped Gmail App Passwords, and returns safe, specific messages for
authentication, connection, timeout, and DNS failures. Footer links and
legal-page support notices use React Router and
open the dedicated Contact page.

The Contact visual system includes a gradient hero, animated support orbit,
floating trust cards, role cards, support-hours channel, message counter,
promise section, hover transitions, and mobile breakpoints. Legal pages reuse
the same visual language with animated hero cards, numbered sections,
responsive table-of-contents links, and direct Contact navigation.

## Admin user details

The admin Users page includes a **View details** action backed by
`GET /api/admin/users/:id`. The response excludes `passwordHash` and includes
safe profile, contact, verification, operational, timestamp, and activity
count information. The detail panel can be closed without leaving the Users
page.

## Render deployment fixes

- `app.set('trust proxy', 1)` is configured before rate-limit middleware so
  Render's `X-Forwarded-For` header is handled correctly.
- The Prisma seed script runs `prisma migrate deploy` before seeding, reducing
  schema drift during hosted builds.
- The repair migration
  `20260913170000_repair_profile_fields` uses PostgreSQL-compatible
  `ADD COLUMN IF NOT EXISTS` for profile fields.
- Contact route registration remains below the `asyncRoute` declaration to
  avoid startup-time `ReferenceError` failures.

## Pickup workflow

Allowed pickup statuses:

```text
REQUESTED
MATCHING
ASSIGNED
ACCEPTED
COLLECTOR_ON_THE_WAY
ARRIVED
COLLECTED
REJECTED
CANCELLED
```

The server, not the client, controls legal transitions. A customer starts at
`REQUESTED`; matching ranks active collectors by:

1. Verification
2. Availability
3. Supported category
4. Capacity
5. Service area
6. Coordinates
7. Rating
8. Existing workload

Collection records actual weight and optional proof images. Points are created
once per completed collection using category rates and actual weight, with an
estimated-weight fallback.

## Customer image and AI workflow

The customer page supports:

- Mobile camera capture with `capture="environment"`.
- Gallery/file-picker upload.
- JPG, JPEG, PNG, and WEBP extensions and MIME variants.
- A 5 MB maximum per image.
- Preview before submission.
- Automatic analysis after selecting a file.
- Manual editing of every AI-suggested field.
- Pickup submission even when AI is unavailable.

The authenticated endpoint is `POST /api/ai/identify-item` with multipart
field `image`.

### Gemini implementation

`server/server.js`:

1. Rejects missing configuration or missing files.
2. Validates one image in memory.
3. Normalizes JPEG MIME variants to `image/jpeg`.
4. Queries `/v1beta/models` using the server-side API key.
5. Selects enabled models supporting `generateContent`, preferring the
   configured flash model list.
6. Sends the image as Gemini `inlineData`.
7. Retries without strict `responseMimeType` if a provider rejects JSON mode.
8. Removes optional Markdown code fences from the response.
9. Validates the result with `itemIdentificationSchema`.
10. Logs only truncated provider details, never the API key.

The result is advisory. The user remains responsible for reviewing category,
condition, weight, and item details.

### If Gemini fails

Check Render in this order:

1. `GEMINI_API_KEY` exists and is a newly rotated valid key.
2. The key has Generative Language API access.
3. API restrictions do not block the Gemini API.
4. Render is running the latest backend commit.
5. Render logs show which provider status/model failed.

Never put the key in `client/.env`, a `VITE_` variable, `.env.example`, a
commit, a screenshot, or a support message.

## Database and deployment memory

The application uses PostgreSQL, not SQLite. The migration lock and schema
must remain PostgreSQL-compatible. Render uses:

```text
npm install && npx prisma generate && npx prisma migrate deploy && npm run prisma:seed
```

The seed script is idempotent and resets demo account passwords to
`Demo@12345`, which prevents stale deployed demo credentials.

The Supabase Session Pooler is preferred when direct database connections
produce Render `P1001` connectivity failures.

## Historical incident notes

### PostgreSQL migration BOM

The initial PostgreSQL migration contained a UTF-8 BOM. PostgreSQL rejected
the first character with SQLSTATE `42601`. The migration is now BOM-free.
Failed migration state was resolved before redeploying.

### Production login

The deployed frontend originally used `http://localhost:5000/api`. The Axios
service now uses `VITE_API_URL` and a production Render fallback. Production
frontend deployments must set `VITE_API_URL` explicitly.

### JSON login body

Login requests must send valid JSON with quoted property names and the
`Content-Type: application/json` header. Browser forms and the Axios service
now handle this correctly.

### Secret exposure

A Gemini key was previously placed in a sample environment file. The
placeholder-only file and reachable Git history were sanitized. Any key that
was ever exposed must still be revoked in Google AI Studio.

## Validation commands

```bash
node --check server/server.js
npm --prefix client run build
npx prisma validate --schema server/prisma/schema.prisma
```

The existing frontend build may report non-blocking third-party Zod annotation
warnings and a large main chunk. These are known warnings, not build failures.

## Current limitations

- Render local uploads disappear on service recreation; use durable object
  storage for production.
- Socket.IO realtime delivery is not implemented.
- Map/route views are not implemented.
- Bulk pickup and campus-drive management screens are compact.
- There is no configured automated end-to-end test suite.
- The frontend primary bundle is larger than the ideal code-splitting target.
- AI classification remains probabilistic and must not be treated as an
  authoritative material or valuation decision.
- SMTP delivery and Gemini availability depend on valid Render environment
  variables and third-party provider quotas.

## Safe next improvements

1. Move uploads to Supabase Storage or Cloudinary.
2. Add focused API and end-to-end tests for auth, pickup transitions, and AI
   multipart requests.
3. Add route-level frontend code splitting.
4. Add Socket.IO notifications and map-assisted collector routing.
5. Add model/provider observability without recording credentials or image
   contents.
6. Expand bulk pickup and campus-drive management screens.

## Working conventions

- Make surgical changes and preserve existing user behavior unless a change is
  explicitly requested.
- Keep secrets out of source control.
- Validate changed backend syntax and the frontend build before pushing.
- Update this file and `README.md` when architecture or deployment behavior
  changes.
- Keep public copy, legal pages, support links, and environment-variable
  documentation synchronized when those surfaces change.
