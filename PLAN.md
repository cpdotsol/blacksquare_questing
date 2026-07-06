# BlackSquare Questing Platform — Plan

## 1. Overview

A simple, community-exclusive questing platform for BlackSquare. Members complete quests (tasks defined by admins), submit proof, and an admin **manually reviews and approves/rejects** each submission. Approved submissions award points/XP, which drive a leaderboard and member profile.

Inspiration: dashboard/carousel feel of [Galxe](https://app.galxe.com/) and the community engagement model of [Supr](https://www.suprcommunity.com/) — but built as our own product, not a clone of either.

**Guiding principle:** keep the MVP simple. No blockchain, no auto-verification, no external identity providers. Manual review is the core trust mechanism and the main feature to get right.

## 2. Roles

- **Member** — browses quests, submits proof of completion, tracks points/progress, views leaderboard and own submission history.
- **Admin / Reviewer** — creates and manages quests, reviews the submission queue (approve/reject with a note), manages point values, can promote a member to reviewer.

## 3. Tech Stack

Chosen for simplicity, strong community support, and low ops overhead for a small team. Every term below has a one-line "what it actually does" explanation — no prior knowledge assumed.

| Layer | Choice | What it actually does |
|---|---|---|
| Framework | **Next.js** (App Router) + **TypeScript** | Next.js is the toolkit that turns our code into an actual website — it handles routing (turning URLs like `/quests/123` into pages), renders pages, and runs our backend logic, all in one project instead of juggling separate frontend/backend apps. TypeScript is just JavaScript with typo/type-checking built in, so we catch bugs (e.g. treating a number as text) before they reach users. |
| Database | **PostgreSQL** + **Prisma** (ORM) | PostgreSQL is where all the real data lives permanently — users, quests, submissions, points — like a very organized, very reliable spreadsheet that many people can read/write at once. Prisma is a translator: instead of writing raw database query language by hand, we write plain code (`getQuestById(id)`) and Prisma turns it into safe database queries. This also protects against SQL injection (a common hacking technique against databases). |
| Auth | **Auth.js** (a.k.a. NextAuth), email/password login | Handles the "log in / sign up / stay logged in" plumbing — securely hashing passwords (never storing them as plain text), managing login sessions, and gating pages so only logged-in members/admins can see them. Building this from scratch is a common source of security bugs, so we use a maintained library instead. |
| Styling / UI | **Tailwind CSS** + **shadcn/ui** | Tailwind is a shorthand way of styling pages (spacing, colors, layout) directly in the code, so we don't maintain giant separate CSS files. shadcn/ui is a set of ready-made, good-looking building blocks (buttons, cards, modals, forms) built on top of Tailwind — it gets us a clean, Galxe-style dashboard look without needing a dedicated designer. |
| File storage | **S3-compatible object storage** (e.g. Cloudflare R2) — Phase 2 | A place to store uploaded files (screenshots, images) outside the database, since databases aren't built for large files. "S3-compatible" just means it works the same way as Amazon's popular file-storage service, so we're not locked into one provider. Only needed once we add file-upload submissions in Phase 2. |
| Hosting | **Vercel** (runs the app) + managed Postgres (e.g. Neon/Supabase) | Vercel is the service that actually runs our Next.js app on the internet 24/7 and gives it a public URL — no servers for us to manually set up or patch. "Managed Postgres" means a company runs and backs up our database for us, instead of us maintaining a database server ourselves. |

## 4. Data Model (high-level)

This is the shape of the information the platform stores — think of each block below as a table in a spreadsheet, with each line being a column.

```
User
  id, email, passwordHash, displayName, avatarUrl,
  role (member | admin), totalPoints, createdAt

Quest
  id, title, description, coverImage, pointValue,
  instructions, submissionType (link | text | file),
  status (draft | active | archived),
  isFeatured (drives landing page carousel),
  category, startAt, endAt, createdAt

Submission
  id, questId, userId, content (link/text/fileUrl),
  status (pending | approved | rejected),
  reviewerId, reviewNote,
  submittedAt, reviewedAt

PointsLedger (append-only, for auditability)
  id, userId, submissionId, amount, createdAt
```

Plain-English breakdown:

- **User** — one row per person with an account. `passwordHash` is the scrambled, unreadable version of their password (we never store the real password anywhere — this is a basic security requirement). `role` decides whether they see the member dashboard or the admin panel. `totalPoints` is their running score.
- **Quest** — one row per task admins create (e.g. "Retweet our launch post"). `submissionType` tells the app what kind of proof to ask for (a link, free text, or a file). `status` controls whether members can see/attempt it. `isFeatured` is the on/off switch for showing a quest in the landing-page carousel.
- **Submission** — one row every time a member attempts a quest. This is the record an admin looks at during manual review: what the member submitted, and — once reviewed — who reviewed it, what they decided, and any note explaining why (especially important for rejections, so the member knows what to fix).
- **PointsLedger** — a running, unchangeable log of every point ever awarded ("append-only" means we only ever add new rows, never edit or delete old ones). This exists so a member's point total can always be traced back to exactly which approved submissions earned it — useful for resolving disputes ("why do I have 50 points?") and preventing silent point manipulation.

## 5. Pages / UX

### Landing page (public)
- Hero **carousel** — a rotating banner of featured/high-value quests (Galxe-style cards: image, title, point value, call-to-action button)
- "Active Quests" grid — all currently open quests, browsable without an account
- Leaderboard preview — top members by points, to create some friendly competition
- Community stats (members, quests completed)
- Sign up / log in buttons

### Member dashboard
- Quest grid/list with filters (category, and status: not started / pending / approved / rejected)
- Quest detail page → submission form → shows the current status and the admin's note if rejected
- Profile page: total points, submission history
- Leaderboard (all-time, to start)

### Admin panel
- **Review queue** — the core manual-review screen: pending submissions listed oldest-first, filterable by quest, with a quick approve/reject action plus a note field
- **Quest management** — create/edit/archive quests, set how many points each is worth, mark a quest as "featured" (which is what feeds the landing-page carousel)
- **Member management** — promote a trusted member to reviewer, look up a member's full submission history

## 6. Roadmap

### Phase 1 — MVP (build first)
*MVP = "Minimum Viable Product": the smallest working version that still delivers the core value (manual quest review + points), so we can launch and get real feedback fast instead of over-building upfront.*

1. Auth (email/password) with member + admin roles
2. Quest CRUD (admin) — "CRUD" = Create, Read, Update, Delete: the basic four actions admins need to manage quests. Active/inactive only for now, no scheduling yet.
3. Submission flow (member) — one submission type to start: a link plus an optional text note (simplest to build and review)
4. Manual review queue (admin) — approve/reject with a note, which writes an entry to the `PointsLedger`
5. Points total + a simple all-time leaderboard
6. Landing page with the carousel of featured quests + active quest grid

### Phase 2 — after MVP is live and used
- File/screenshot uploads for submissions (needs the file storage piece from Section 3)
- Badges/achievements, quest categories/tags
- Email notifications on approve/reject
- Weekly/seasonal leaderboards, quest start/end scheduling
- Bulk review actions (approve/reject several submissions at once)

### Explicitly out of scope for now
- Wallets / NFTs / on-chain rewards (no blockchain — points are a plain database number, not a crypto asset)
- Auto-verification or bots (every submission is checked by a human, on purpose — that's the trust model)
- Multi-tenant / white-label support (this is only for BlackSquare, not a product other communities could license)
- Discord (or other) SSO — "SSO" = Single Sign-On, i.e. logging in via an existing account like Discord/Google instead of a new password. Skipped for now since we're using plain email/password.

## 7. Visual Identity

Based on the BlackSquare brand assets (logo + banner):

- **Palette**: near-black background (`#0A0A0A`–`#000000`), white/off-white text and line work, no accent color by default — pure monochrome. If a highlight color is needed for CTAs/status (e.g. "approved"), introduce a single accent sparingly rather than a full color system.
- **Mark**: the black 3D cube is the brand anchor — use it as a favicon/loading motif and echo its geometry (sharp edges, subtle top-light gradient) in card treatments and section dividers, rather than pasting the logo everywhere.
- **Wordmark**: "BLACKSQUARE" set in a bold, geometric sans, with the open-square glyph standing in for the "Q" — reuse this treatment for the product name ("Questing" naturally reinforces the square/Q motif already in the brand).
- **Layout language from the banner**: vertical strip/column composition (alternating image and dark panels) translates well to landing-page section dividers or the quest carousel's card rhythm.
- **Tone**: "THE SIGNAL IN A WORLD OF NOISE" — minimal, high-contrast, no clutter. This reinforces the "don't make this complicated" brief: a clean monochrome dashboard, not a busy gamified UI.
- **Asset handling**: the real logo/banner files now live in the repo root (`blacksquare logo.jpg`, `blacksquare banner.jpg`); during scaffolding they'll be moved into `public/branding/` and wired into the landing page header/hero and favicon.

## 8. Next steps

Once this plan is approved, the next step is scaffolding the Next.js project: Prisma schema, auth setup, Tailwind theme matching the visual identity above, and empty pages for the landing page, member dashboard, and admin review queue.
