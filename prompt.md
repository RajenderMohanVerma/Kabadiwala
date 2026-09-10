You are the lead full-stack developer, UI/UX designer, software architect, database designer, QA engineer, and code reviewer for this project.

PROJECT NAME:
Kabadivala

PROJECT PURPOSE:
Kabadivala is a modern digital e-waste collection and recycling platform that connects customers, informal e-waste collectors/kabadiwalas, collection hubs, recyclers, and administrators.

The goal is NOT to replace local kabadiwalas.

The goal is to digitally connect local/informal collectors with customers and the formal recycling chain.

CORE IDEA:
Customer → Pickup Request → Smart Collector Matching → Verified Collector → Pickup → Collection Hub → Recycler → Processing → Recycling → Digital Certificate + Eco Points

IMPORTANT:
This is a real working web application, not a static UI demo.

Do not create fake buttons, fake forms, fake dashboards, fake statistics, or non-functional navigation.

Every important UI action must eventually connect to real application logic/API/database functionality.

==================================================
TECH STACK
==================================================

FRONTEND:

- React
- Vite
- JavaScript / JSX
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React
- React Hook Form
- Zod
- Axios
- Recharts
- React Leaflet
- Leaflet
- qrcode
- html5-qrcode where appropriate
- vite-plugin-pwa

BACKEND:

- Node.js
- Express.js
- JavaScript
- REST API
- Socket.IO where realtime functionality is useful

DATABASE:

- SQLite
- Prisma ORM

AUTHENTICATION:

- JWT-based authentication
- bcrypt/bcryptjs for password hashing
- Role-based authorization

FILE UPLOAD:

- Multer
- Local uploads directory for this MVP

PDF:

- PDFKit

SECURITY:

- Helmet
- CORS
- express-rate-limit
- input validation
- server-side authorization
- secure password handling

TESTING:

- Vitest for frontend where useful
- Jest/Supertest or an appropriate Node testing setup for backend
- Playwright where practical for critical end-to-end flows

==================================================
DATABASE REQUIREMENT
==================================================

USE SQLITE.

Do NOT switch to PostgreSQL.

Use Prisma ORM so the database layer remains organized.

Database file can be:

server/prisma/dev.db

Never commit secrets.

Never expose the SQLite database directly to the frontend.

Architecture must always be:

React Frontend
↓
REST API
↓
Express Backend
↓
Prisma
↓
SQLite

==================================================
PROJECT STRUCTURE
==================================================

Use a clean monorepo-style structure:

kabadivala/
│
├── client/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ ├── layouts/
│ │ ├── pages/
│ │ ├── routes/
│ │ ├── hooks/
│ │ ├── context/
│ │ ├── services/
│ │ ├── utils/
│ │ ├── lib/
│ │ ├── App.jsx
│ │ └── main.jsx
│ │
│ ├── public/
│ ├── package.json
│ ├── vite.config.js
│ └── ...
│
├── server/
│ ├── src/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── services/
│ │ ├── validators/
│ │ ├── utils/
│ │ ├── sockets/
│ │ ├── config/
│ │ ├── app.js
│ │ └── server.js
│ │
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── seed.js
│ │
│ ├── uploads/
│ ├── package.json
│ └── .env.example
│
├── brain.md
├── README.md
├── .gitignore
└── package.json if a root workspace is useful

Adapt this structure to the existing repository if necessary.

DO NOT destroy a useful existing structure just to match this exactly.

==================================================
MOST IMPORTANT RULE: EXISTING PROJECT FIRST
==================================================

The developer has already created part of the frontend.

Before writing or changing code:

1. Inspect the complete existing repository.
2. Inspect package.json files.
3. Inspect the existing React/Vite setup.
4. Inspect routing.
5. Inspect components.
6. Inspect pages.
7. Inspect CSS/Tailwind configuration.
8. Inspect assets.
9. Inspect existing responsive behavior.
10. Inspect existing design system.
11. Inspect existing forms and interactions.
12. Inspect any existing API/service files.
13. Inspect existing environment files safely.
14. Inspect README.md.
15. Inspect brain.md if it already exists.
16. Identify what is reusable.
17. Identify what is incomplete.
18. Identify what is broken.
19. Identify duplicate code.
20. Identify missing functionality.

DO NOT blindly recreate the frontend.

The existing frontend should be treated as the starting point.

Preserve useful components, assets, layouts, pages, styling ideas, and working functionality where appropriate.

Redesign and improve them rather than deleting everything without reason.

==================================================
DESIGN DIRECTION
==================================================

Create a professional sustainability-tech product.

The design should feel:

- modern
- clean
- trustworthy
- premium
- eco-friendly
- practical
- human
- accessible
- mobile-first
- suitable for a college hackathon demonstration
- suitable for a real startup MVP

Avoid:

- generic AI-looking designs
- excessive gradients
- excessive glassmorphism
- excessive rounded cards
- huge unnecessary animations
- childish UI
- template-like dashboards
- meaningless decorative elements
- lorem ipsum
- fake statistics

Use a consistent visual language.

Use a sustainable green-inspired visual identity, but do not overuse green.

Create proper:

- typography hierarchy
- spacing system
- buttons
- cards
- badges
- status indicators
- inputs
- tables
- modals
- drawers
- alerts
- toast notifications
- empty states
- loading states
- error states
- skeleton loaders

==================================================
RESPONSIVENESS
==================================================

The application must work properly on:

320px
375px
425px
768px
1024px
1280px
1440px+

Test mobile layouts carefully.

Do not simply shrink desktop UI.

Create proper mobile navigation.

Dashboards must remain usable on phones.

Tables should transform into cards or horizontally scroll intelligently.

Forms should work comfortably with touch.

Buttons must have appropriate touch targets.

==================================================
ANIMATIONS
==================================================

Use Framer Motion.

Animations should be subtle and purposeful:

- page transitions
- card entrance
- modal transitions
- sidebar transitions
- hover effects
- button feedback
- status transitions
- pickup timeline animations
- dashboard number animations where useful
- skeleton/loading transitions

Respect:

prefers-reduced-motion

Do not animate everything.

==================================================
PWA
==================================================

The application should be installable as a PWA.

Implement:

- manifest
- app name: Kabadivala
- icons
- theme color
- standalone display
- service worker
- offline fallback
- installability
- appropriate caching strategy

The application must still behave correctly when opened normally in a browser.

==================================================
ROLES
==================================================

Implement role-based access.

Roles:

CUSTOMER
COLLECTOR
HUB_MANAGER
RECYCLER
ADMIN

Do not rely only on frontend route protection.

Backend must verify user roles.

Example:

A customer must never be able to call an admin-only API simply by manually editing frontend code.

==================================================
CORE FEATURES
==================================================

CUSTOMER:

- registration
- login
- profile
- address management
- create pickup request
- select e-waste category
- item details
- quantity
- estimated weight
- item images
- preferred pickup date/time
- pickup address
- pickup status
- assigned collector
- collector details
- tracking timeline
- QR verification
- pickup history
- eco points
- rewards
- reviews
- complaints
- notifications
- digital recycling certificate
- certificate download
- bulk pickup request

COLLECTOR:

- registration
- KYC/document submission
- verification status
- profile
- service area
- availability
- capacity
- categories handled
- incoming pickup requests
- accept/reject pickup
- pickup details
- navigation/map
- QR verification
- mark arrived
- mark collected
- update collected weight
- upload collection proof
- pickup history
- earnings/collection statistics if implemented
- ratings
- notifications

HUB MANAGER:

- hub dashboard
- incoming collections
- scan QR
- receive items
- verify weight
- create/assign batches
- inventory
- outgoing batches
- send batch to recycler
- tracking
- hub analytics

RECYCLER:

- recycler registration
- verification
- profile
- capacity
- material categories
- incoming recycling batches
- accept/reject batch
- mark received
- processing stages
- recycling completion
- recovered material information
- recycling records
- certificates
- analytics

ADMIN:

- dashboard
- user management
- customer management
- collector verification
- hub management
- recycler verification
- pickup management
- collection monitoring
- batch management
- complaints
- reviews
- notifications
- analytics
- system settings
- audit logs

==================================================
PICKUP WORKFLOW
==================================================

Implement real pickup lifecycle.

Possible statuses:

REQUESTED
MATCHING
ASSIGNED
ACCEPTED
COLLECTOR_ON_THE_WAY
ARRIVED
COLLECTED
AT_COLLECTION_HUB
BATCH_CREATED
SENT_TO_RECYCLER
RECEIVED_BY_RECYCLER
PROCESSING
RECYCLED
COMPLETED

Additional:

CANCELLED
REJECTED

Every important status change should be recorded.

Store:

- timestamp
- actor/user
- status
- optional location
- note

Show this as a visual chain-of-custody timeline.

==================================================
SMART COLLECTOR MATCHING
==================================================

Implement actual backend matching logic.

Prioritize:

1. verified collector
2. availability
3. service area
4. distance
5. supported category
6. capacity
7. rating
8. current workload

Do not claim AI if this is rule-based.

Call it:

Smart Collector Matching

not:

AI Matching

unless an actual AI model is implemented.

Keep architecture ready for future AI/ML integration.

==================================================
QR SYSTEM
==================================================

Generate unique QR codes for pickup requests.

QR should contain a secure identifier/token.

Collector can scan the pickup QR.

Hub manager can scan the QR.

Recycler can scan batch QR where appropriate.

Do not trust only client-provided IDs.

Validate QR tokens on backend.

==================================================
E-WASTE CATEGORIES
==================================================

Support categories such as:

- Mobile Phones
- Laptops
- Computers
- Monitors
- TVs
- Printers
- Tablets
- Chargers
- Batteries
- Cables
- Small Appliances
- Large Appliances
- Other Electronics

Keep categories configurable where practical.

==================================================
CERTIFICATE
==================================================

After successful recycling completion:

Generate a digital recycling certificate.

Include:

- Kabadivala branding
- certificate ID
- customer name
- pickup ID
- item category
- quantity/weight
- collection date
- recycling completion date
- recycler information
- recycling summary
- verification/reference ID

IMPORTANT:

Do NOT falsely call this a government certificate.

Use wording such as:

"Kabadivala Digital Recycling Certificate"

or

"Platform Recycling Record"

==================================================
ECO POINTS
==================================================

Implement a real points system.

Example:

points based on:

- category
- verified weight
- completed recycling

Store point transactions.

Do not simply display a hardcoded number.

Show:

- current balance
- earned points
- transaction history
- reward redemption if implemented

==================================================
REVIEWS
==================================================

Customers can review collectors after completed pickups.

Support:

- rating
- comment
- created date

Prevent duplicate review for the same completed pickup.

Show collector rating statistics.

==================================================
COMPLAINTS
==================================================

Customers can create complaints.

Support:

- complaint category
- description
- pickup ID
- optional attachment
- status

Statuses:

OPEN
IN_REVIEW
RESOLVED
CLOSED

Admin can manage complaints.

==================================================
NOTIFICATIONS
==================================================

Implement application notifications.

Examples:

- pickup created
- collector assigned
- collector accepted
- collector on the way
- item collected
- hub received
- recycler received
- recycling completed
- certificate generated
- complaint update

Use Socket.IO for realtime updates where appropriate.

Also keep persistent notification records in SQLite.

==================================================
MAP
==================================================

Use:

Leaflet + OpenStreetMap

Do not use a paid map provider unless explicitly required.

Use maps for:

- collector service area
- pickup location
- nearby collectors/hubs
- tracking where appropriate

Do not expose sensitive location information unnecessarily.

==================================================
ANALYTICS
==================================================

Use Recharts.

Customer:

- pickups
- recycled weight
- eco points

Collector:

- completed pickups
- monthly collection
- ratings

Hub:

- received items
- outgoing batches
- categories

Recycler:

- processed weight
- recycling stages
- monthly processing

Admin:

- total users
- collectors
- recyclers
- pickups
- completed recycling
- total e-waste collected
- recycling rate
- category distribution
- monthly trends
- complaints
- performance

All statistics must come from database/API.

No fake numbers in production/demo mode unless clearly seeded demo data.

==================================================
BULK PICKUP
==================================================

Support organizations such as:

- colleges
- offices
- companies
- institutions

They should be able to request bulk e-waste collection.

Include:

- organization name
- contact person
- email
- phone
- address
- estimated quantity
- category
- preferred date
- notes

Admin/collector can manage these requests.

==================================================
CAMPUS E-WASTE DRIVE
==================================================

Include an optional campus drive feature.

Support:

- drive creation
- start/end date
- departments/groups
- collected weight
- leaderboard
- progress
- campaign status

This can be used for hackathon demonstration.

==================================================
ADMIN AUDIT LOG
==================================================

Important actions should be logged.

Examples:

- user verification
- collector approval
- recycler approval
- pickup status change
- complaint resolution
- batch creation
- recycling completion

Store:

- actor
- action
- entity
- entity ID
- timestamp
- metadata where useful

==================================================
AI-READY ARCHITECTURE
==================================================

Prepare architecture for future AI features:

- e-waste image classification
- item category prediction
- condition detection
- estimated value
- route optimization
- demand prediction

BUT:

Do not fake AI.

If AI is not actually implemented:

label features as:

"AI-ready"

or

"Coming Soon"

Never claim that a feature is powered by AI if it is only rule-based.

==================================================
API DESIGN
==================================================

Create clean REST endpoints.

Example structure:

/api/auth
/api/users
/api/customers
/api/collectors
/api/hubs
/api/recyclers
/api/pickups
/api/tracking
/api/qr
/api/batches
/api/certificates
/api/rewards
/api/reviews
/api/complaints
/api/notifications
/api/analytics
/api/admin
/api/bulk-pickups
/api/campus-drives

Use proper:

GET
POST
PUT/PATCH
DELETE

Use appropriate HTTP status codes.

Return consistent JSON responses.

Example:

{
"success": true,
"message": "...",
"data": {}
}

For errors:

{
"success": false,
"message": "...",
"errors": []
}

==================================================
VALIDATION
==================================================

Frontend validation:

React Hook Form + Zod

Backend validation:

Zod or equivalent server-side validation.

Never trust frontend validation alone.

==================================================
ERROR HANDLING
==================================================

Implement:

- global Express error handler
- async error handling
- frontend error boundaries where useful
- API error states
- loading states
- retry states
- empty states
- 404 page
- unauthorized page
- forbidden page

Do not leave users staring at blank screens.

==================================================
SECURITY
==================================================

Implement:

- password hashing
- JWT verification
- role authorization
- CORS
- Helmet
- rate limiting
- input validation
- secure file upload validation
- file size limits
- safe error messages
- environment variables
- no secret keys in frontend
- no hardcoded production secrets

==================================================
BRAIN.MD
==================================================

Create and continuously maintain:

brain.md

This file is the permanent project memory.

It must contain:

1. Project overview
2. Project goals
3. Tech stack
4. Architecture
5. Folder structure
6. Database schema summary
7. All models
8. Relationships
9. Authentication system
10. Roles and permissions
11. API routes
12. Important frontend routes
13. Major components
14. Feature completion status
15. Pickup workflow
16. QR workflow
17. Recycling workflow
18. Certificate workflow
19. Environment variables
20. Important commands
21. Known limitations
22. Bugs
23. Future improvements
24. Current phase
25. Last completed task
26. Next recommended task

After every major feature:

UPDATE brain.md.

Do not forget this.

==================================================
README.MD
==================================================

Maintain a useful README containing:

- project overview
- features
- screenshots section placeholder
- architecture
- setup instructions
- installation
- environment variables
- database setup
- Prisma commands
- seed instructions
- frontend start
- backend start
- build instructions
- testing
- PWA instructions
- demo accounts
- troubleshooting

==================================================
NO FAKE FUNCTIONALITY
==================================================

Never implement:

<button> that does nothing

fake API responses

hardcoded dashboard numbers

fake authentication

fake QR verification

fake tracking

fake database writes

fake AI

fake certificate verification

If a feature cannot yet be fully implemented in the current phase:

- create the correct architecture
- clearly label it as pending
- record it in brain.md
- continue only when dependencies are ready

==================================================
DEMO DATA
==================================================

Create a seed script.

Seed realistic demo data for:

- admin
- customer
- collector
- hub manager
- recycler
- pickup requests
- statuses
- notifications
- reviews
- recycling records
- points
- batches

Use obviously fake/demo credentials.

Do not use real personal information.

==================================================
CODE QUALITY
==================================================

Write maintainable code.

Prefer:

- reusable components
- reusable API services
- reusable validation schemas
- reusable status components
- reusable modal/dialog components
- centralized constants
- clean controllers/services
- small focused functions
- meaningful names

Avoid:

- giant components
- duplicated logic
- deeply nested conditionals
- unnecessary dependencies
- dead code
- unused imports

==================================================
WORKING STYLE
==================================================

Before implementing a feature:

1. Inspect existing code.
2. Understand dependencies.
3. Identify files to modify.
4. Plan the change.
5. Implement.
6. Run/test it.
7. Fix errors.
8. Check responsive behavior.
9. Check console errors.
10. Update brain.md.
11. Update README if needed.

Do not make massive unrelated changes.

Do not rewrite working features without reason.

When something breaks, debug the actual cause instead of hiding the error.

==================================================
PHASE EXECUTION RULE
==================================================

The project will be built in phases.

DO NOT attempt to implement every feature in one response.

Complete the requested phase properly.

At the end of each phase:

- run the application
- verify important flows
- fix errors
- ensure frontend builds
- ensure backend starts
- ensure database works
- update brain.md
- update README
- provide a concise summary of what was completed
- list any remaining issues

Then STOP.

Wait for the next phase instruction.

==================================================
FINAL QUALITY STANDARD
==================================================

The final Kabadivala application must feel like a real polished product.

It must be:

- functional
- responsive
- accessible
- animated
- installable as PWA
- database-backed
- role-based
- secure
- visually consistent
- mobile friendly
- demo ready
- easy to continue developing

/
/
/
/
/
/
/
/

PHASE 0 — EXISTING PROJECT AUDIT

Do NOT start building new features yet.

First, deeply inspect the existing repository.

The developer has already created approximately some portion of the frontend.

Your first responsibility is to understand what already exists.

Inspect:

- complete folder structure
- client/frontend structure
- package.json
- Vite configuration
- React entry point
- App component
- routes
- layouts
- pages
- components
- CSS
- Tailwind configuration
- assets
- images
- icons
- existing forms
- existing UI interactions
- existing state management
- API/service files if any
- environment configuration
- README.md
- brain.md if present

Do not modify major files yet.

Create a detailed internal assessment:

1. What is already implemented?
2. What is visually good?
3. What should be preserved?
4. What needs redesign?
5. What is broken?
6. What is incomplete?
7. What duplicate code exists?
8. What architecture problems exist?
9. What dependencies are installed?
10. What dependencies are missing?
11. What can be reused for Kabadivala?
12. What needs to be replaced?
13. What pages already exist?
14. What pages are missing?
15. How responsive is the current UI?
16. What accessibility problems exist?
17. What animation opportunities exist?
18. What backend currently exists, if any?

Then create/update:

brain.md

Add a section:

CURRENT REPOSITORY AUDIT

Record:

- existing architecture
- existing pages
- existing components
- existing dependencies
- reusable assets
- current problems
- recommended migration/improvement plan

IMPORTANT:

Do not delete the existing frontend.

Do not create duplicate versions of existing pages.

Do not replace useful components unnecessarily.

At the end, provide:

- audit summary
- files that should be preserved
- files that should be redesigned
- files that should be created
- recommended next implementation order

Then STOP.

Do not start Phase 1 automatically.

/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/

PHASE 1 — KABADIVALA FOUNDATION + EXISTING FRONTEND REDESIGN

Now implement Phase 1.

Use the repository audit from Phase 0.

IMPORTANT:
Redesign the existing frontend instead of blindly replacing it.

Preserve useful existing work.

==================================================

1. # PROJECT BRAND

Project name:

Kabadivala

Use a consistent brand identity throughout the application.

Suggested positioning:

"Kabadivala — From Local Collection to Responsible Recycling"

Do not make the tagline appear everywhere.

# ================================================== 2. FRONTEND FOUNDATION

Ensure:

React + Vite

React Router

Tailwind CSS

Framer Motion

Lucide React

React Hook Form

Zod

Axios

Recharts

PWA support

are correctly configured.

Remove unnecessary dependencies where appropriate.

# ================================================== 3. GLOBAL DESIGN SYSTEM

Create a reusable design system:

- typography
- spacing
- buttons
- inputs
- cards
- badges
- status chips
- modal
- dropdown
- toast
- tooltip
- table
- pagination
- skeleton
- empty state
- error state
- loading state

Use reusable components.

# ================================================== 4. PUBLIC WEBSITE

Build/redesign:

/

Landing page

Include:

Hero

Problem explanation

How Kabadivala works

Why Kabadivala

E-waste categories

For customers

For collectors

For recyclers

Traceability section

Eco impact

How it works timeline

CTA

FAQ

Footer

Make it polished and responsive.

# ================================================== 5. AUTHENTICATION UI

Create:

/login
/register
/forgot-password if appropriate

Registration should allow selecting:

Customer
Collector

Other operational roles should be provisioned appropriately.

Do not expose unrestricted admin registration.

# ================================================== 6. APP SHELL

Create reusable layouts:

PublicLayout
AuthLayout
DashboardLayout

Dashboard layout should include:

desktop sidebar

mobile navigation

topbar

notifications

profile menu

breadcrumbs where useful

# ================================================== 7. RESPONSIVE REDESIGN

Test existing and new pages at:

320
375
425
768
1024
1280
1440

Fix overflow.

Fix mobile navigation.

Fix typography.

Fix cards.

Fix forms.

Fix dashboard layouts.

# ================================================== 8. PWA

Add initial PWA support:

manifest

icons

service worker

theme

installability

offline fallback

Do not overcomplicate caching yet.

# ================================================== 9. BACKEND FOUNDATION

Create:

server/

Express application

health endpoint:

GET /api/health

Return:

{
"success": true,
"message": "Kabadivala API is running"
}

Add:

Helmet
CORS
rate limiting
environment variables
global error handler

# ================================================== 10. PRISMA + SQLITE

Configure Prisma with SQLite.

Create initial User model.

Include appropriate fields for:

id
name
email
phone
passwordHash
role
status
createdAt
updatedAt

Use enums where appropriate if Prisma SQLite supports the intended design.

Add migrations.

Add seed foundation.

# ================================================== 11. AUTH API

Implement:

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

JWT authentication.

Hash passwords.

Never return passwordHash.

# ================================================== 12. FRONTEND API CONNECTION

Create centralized Axios API service.

Use environment variable:

VITE_API_URL

Do not hardcode API URLs throughout components.

Create auth context/state.

Implement:

login

logout

persist session safely

protected routes

role-aware routes

# ================================================== 13. ERROR/LOADING STATES

No blank screens.

Implement proper:

loading

success

error

empty

unauthorized

not found

# ================================================== 14. SEED DATA

Create demo users:

admin
customer
collector
hub manager
recycler

Use clearly fake demo credentials.

Document them in README.

# ================================================== 15. TEST

Verify:

frontend starts

backend starts

SQLite works

Prisma works

register works

login works

logout works

protected routes work

role restrictions work

PWA builds

desktop works

mobile works

No major console errors.

# ================================================== 16. DOCUMENTATION

Update:

brain.md

README.md

Record everything implemented.

Then STOP.

Do not start Phase 2 automatically.

/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/

PHASE 2 — CUSTOMER, COLLECTOR AND COMPLETE PICKUP SYSTEM

Before coding:

Inspect the existing implementation.

Read brain.md.

Do not break Phase 1.

Implement the following as real database-backed features.

==================================================
CUSTOMER
==================================================

Create customer dashboard.

Pages:

/customer/dashboard
/customer/pickups
/customer/pickups/new
/customer/pickups/:id
/customer/profile
/customer/points
/customer/reviews
/customer/complaints
/customer/notifications

Dashboard:

- active pickup
- recent pickups
- total recycled weight
- eco points
- recycling progress
- quick pickup CTA

==================================================
CREATE PICKUP
==================================================

Fields:

category
item details
brand
condition
quantity
estimated weight
images
pickup address
preferred date
preferred time
notes

Validate frontend and backend.

Upload images safely.

Generate pickup ID:

KC-YYYY-000001

or an equivalent unique format.

Store pickup in SQLite.

Initial status:

REQUESTED

==================================================
COLLECTOR
==================================================

Pages:

/collector/dashboard
/collector/requests
/collector/requests/:id
/collector/profile
/collector/availability
/collector/history
/collector/ratings

Collector can:

accept

reject

mark on the way

mark arrived

mark collected

upload collection proof

enter actual weight

==================================================
SMART MATCHING
==================================================

Implement real rule-based collector matching.

Use:

verification status
availability
service area
supported categories
capacity
distance if coordinates are available
rating
current workload

Create matching service on backend.

Do not claim AI.

==================================================
PICKUP STATUS
==================================================

Implement complete lifecycle:

REQUESTED
MATCHING
ASSIGNED
ACCEPTED
COLLECTOR_ON_THE_WAY
ARRIVED
COLLECTED

Also:

REJECTED
CANCELLED

Prevent invalid status transitions.

Only authorized roles can perform each transition.

==================================================
TRACKING
==================================================

Create tracking event model.

Every important transition creates:

status
timestamp
actor
note
location if available

Create visual timeline on frontend.

==================================================
QR
==================================================

Generate pickup QR.

Create secure QR token.

Customer can display QR.

Collector can scan/verify.

Do not trust raw pickup IDs.

Validate token on server.

==================================================
REVIEWS
==================================================

After completion:

customer can rate collector.

Prevent duplicate reviews.

==================================================
ECO POINTS
==================================================

Calculate real points after collection/completion according to a simple documented formula.

Create point transactions.

Display history.

==================================================
NOTIFICATIONS
==================================================

Create persistent notifications.

Trigger notifications on pickup events.

Use Socket.IO where appropriate for realtime updates.

==================================================
MAP
==================================================

Integrate Leaflet/OpenStreetMap.

Show pickup location and collector location where appropriate.

Do not expose unnecessary sensitive data.

==================================================
TESTING
==================================================

Test:

customer creates pickup

collector receives request

matching works

collector accepts

status updates work

timeline updates

QR verification works

points update

notification is created

review works

invalid actions are rejected

==================================================
UI
==================================================

Make all new screens consistent with Phase 1.

Use animations.

Add mobile layouts.

Add skeleton loaders.

Add empty states.

Add proper errors.

==================================================
DOCUMENTATION
==================================================

Update brain.md and README.md.

Then STOP.

/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/

PHASE 3 — COLLECTION HUB, RECYCLER, BATCHES, CERTIFICATES AND ADMIN

First inspect existing code and brain.md.

Do not break previous phases.

==================================================
COLLECTION HUB
==================================================

Create:

/hub/dashboard
/hub/collections
/hub/batches
/hub/inventory
/hub/analytics

Hub manager can:

receive collected items

scan pickup QR

verify collection

record actual weight

create recycling batch

add multiple pickup items to a batch

generate batch QR

send batch to recycler

==================================================
BATCH
==================================================

Create Batch model.

Include:

batch ID
QR token
hub
recycler
status
total weight
categories
created date
sent date
received date
completed date

Batch lifecycle:

CREATED
READY_FOR_RECYCLER
SENT_TO_RECYCLER
RECEIVED
PROCESSING
RECYCLED
COMPLETED

==================================================
RECYCLER
==================================================

Create recycler dashboard.

Pages:

/recycler/dashboard
/recycler/batches
/recycler/batches/:id
/recycler/processing
/recycler/history
/recycler/profile
/recycler/analytics

Recycler can:

accept batch

reject batch

mark received

start processing

update processing stage

record recovered material

mark recycled

complete batch

==================================================
CHAIN OF CUSTODY
==================================================

Connect:

Customer

Collector

Hub

Recycler

Every movement should be traceable.

Create complete timeline:

Pickup requested
Collector assigned
Collected
Hub received
Batch created
Sent to recycler
Recycler received
Processing
Recycled
Completed

==================================================
CERTIFICATE
==================================================

After successful recycling:

Generate Kabadivala Digital Recycling Certificate.

Use PDFKit.

Certificate must contain:

certificate ID

customer

pickup ID

batch ID

category

weight

collection date

recycling date

recycler

recycling summary

verification reference

Do not call it a government certificate.

Provide download button.

==================================================
ADMIN
==================================================

Create:

/admin/dashboard
/admin/users
/admin/collectors
/admin/recyclers
/admin/hubs
/admin/pickups
/admin/batches
/admin/complaints
/admin/reviews
/admin/notifications
/admin/analytics
/admin/audit-logs

Admin can:

verify collectors

verify recyclers

manage hubs

view users

monitor pickups

monitor batches

manage complaints

review ratings

view analytics

view audit logs

==================================================
COMPLAINTS
==================================================

Implement complete complaint system.

OPEN
IN_REVIEW
RESOLVED
CLOSED

Admin can update status.

Customer can see updates.

==================================================
AUDIT LOG
==================================================

Record important administrative and workflow actions.

==================================================
ANALYTICS
==================================================

Use Recharts.

All values must come from API/database.

Create charts:

monthly collection

category distribution

pickup status

recycling progress

collector performance

recycler performance

complaints

==================================================
BULK PICKUP
==================================================

Implement organization bulk pickup.

Include customer-facing request form.

Admin/collector management interface.

==================================================
CAMPUS DRIVE
==================================================

Implement campus e-waste drive.

Include:

campaign

departments/groups

leaderboard

weight

progress

status

==================================================
UI
==================================================

Admin dashboards should feel professional.

Avoid overloading the screen.

Use:

cards

tables

charts

filters

search

pagination

status badges

modals

drawers

responsive layouts

==================================================
TEST
==================================================

Test complete flow:

Customer

→ Collector

→ Hub

→ Batch

→ Recycler

→ Recycling

→ Certificate

→ Customer receives completion

Fix all major errors.

Update brain.md and README.

Then STOP.

/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/
/

PHASE 4 — FINAL AUDIT, POLISH, PWA, SECURITY AND DEMO READINESS

This is the final stabilization phase.

Read:

brain.md

README.md

and inspect the entire project.

Do not blindly rewrite working features.

==================================================

1. # COMPLETE FEATURE AUDIT

Check every feature from previous phases.

Mark:

WORKING
PARTIALLY WORKING
BROKEN
NOT IMPLEMENTED

Fix important broken functionality.

# ================================================== 2. END-TO-END DEMO

Perform the complete demo flow:

Customer registration/login

↓

Create e-waste pickup

↓

Collector matching

↓

Collector accepts

↓

Collector arrives

↓

QR verification

↓

Collection

↓

Hub receives

↓

Batch creation

↓

Recycler receives

↓

Processing

↓

Recycling completion

↓

Certificate generation

↓

Customer sees completed pickup

↓

Eco points updated

↓

Notification generated

Ensure the flow actually works using SQLite.

# ================================================== 3. RESPONSIVE AUDIT

Check every important page:

320px
375px
425px
768px
1024px
1280px
1440px+

Fix:

overflow

broken grids

tables

sidebar

forms

modals

buttons

charts

navigation

cards

text wrapping

mobile interactions

# ================================================== 4. UI POLISH

Improve:

spacing

typography

alignment

visual hierarchy

empty states

loading states

error states

hover states

focus states

transitions

micro-interactions

Do not add unnecessary decoration.

# ================================================== 5. ACCESSIBILITY

Check:

keyboard navigation

focus states

button labels

form labels

ARIA where needed

color contrast

alt text

reduced motion

semantic HTML

# ================================================== 6. PWA

Finalize:

manifest

icons

service worker

offline fallback

installability

app metadata

cache strategy

Test production build.

# ================================================== 7. SECURITY

Audit:

JWT

password hashing

CORS

Helmet

rate limiting

file uploads

validation

authorization

role permissions

environment variables

error messages

Do not expose secrets.

# ================================================== 8. PERFORMANCE

Improve:

lazy loading

image handling

bundle size

unnecessary re-renders

API requests

loading states

large components

# ================================================== 9. DATABASE

Verify:

Prisma schema

relations

constraints

indexes where useful

seed

migrations

data consistency

No destructive migration unless necessary.

# ================================================== 10. TESTING

Run:

frontend build

backend start

API tests

critical UI tests

end-to-end demo flow

Fix errors.

# ================================================== 11. DEMO DATA

Ensure demo accounts work.

Ensure seeded records produce realistic dashboards.

Do not use fake hardcoded analytics.

# ================================================== 12. README

README must clearly explain:

project

features

architecture

folder structure

installation

environment variables

SQLite

Prisma

migration

seed

run commands

testing

PWA

demo accounts

troubleshooting

future AI features

# ================================================== 13. BRAIN.MD

Update brain.md with the final state.

Include:

completed features

database models

API routes

frontend routes

roles

permissions

workflow

known limitations

future improvements

AI-ready areas

PWA details

important commands

current architecture

# ================================================== 14. FINAL CODE CLEANUP

Remove:

unused imports

dead code

temporary console logs

debug code

unused components

unused dependencies

broken links

placeholder text

fake buttons

fake statistics

unfinished TODOs where possible

Do not remove useful documentation comments.

# ================================================== 15. FINAL RESULT

The application must be suitable for:

college hackathon demonstration

live demo

portfolio

future development

The result should feel like a real working product, not a generated template.

At the end provide:

1. Final feature list
2. Working demo credentials
3. Important run commands
4. Known limitations
5. Future improvements
6. Final architecture summary

Update brain.md one final time.

STOP.
