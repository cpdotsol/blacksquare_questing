# BlackSquare Questing Platform — Plan

## 1. Overview

A simple, community-exclusive questing platform for BlackSquare. Members complete quests (tasks defined by admins), submit proof, and an admin **manually reviews and approves/rejects** each submission. Approved submissions award points/XP, which drive a leaderboard and member profile.

Inspiration: dashboard/carousel feel of [Galxe](https://app.galxe.com/) and the community engagement model of [Supr](https://www.suprcommunity.com/) — but built as our own product, not a clone of either.

**Guiding principle:** keep the MVP simple. No blockchain, no auto-verification, no external identity providers. Manual review is the core trust mechanism and the main feature to get right.

## 2. Roles

- **Member** — browses quests, submits proof of completion, tracks points/progress, views leaderboard and own submission history.
- **Admin / Reviewer** — creates and manages quests, reviews the submission queue (approve/reject with a note), manages point values, can promote a member to reviewer.

## 3. Tech Stack

Chosen for simplicity, strong community support, and low ops overhead for a small team.

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | One codebase for public site, member dashboard, and admin panel |
| Database | PostgreSQL + Prisma ORM | Relational data fits well; Prisma keeps migrations simple |
| Auth | Auth.js (NextAuth), email/password (credentials) provider | Matches current BlackSquare sign-in approach; no external dependency |
| Styling / UI | Tailwind CSS + shadcn/ui | Fast to build a clean, Galxe-like dashboard without a design team |
| File storage | S3-compatible object storage (e.g. Cloudflare R2) | For submission proof uploads (Phase 2) |
| Hosting | Vercel (app) + managed Postgres (Neon / Supabase / RDS) | Minimal ops overhead |

## 4. Data Model (high-level)

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

`User.totalPoints` is always derivable from `PointsLedger`, giving a clean audit trail for every point awarded.

## 5. Pages / UX

### Landing page (public)
- Hero **carousel** of featured/high-value quests (Galxe-style cards: image, title, point value, CTA)
- "Active Quests" grid
- Leaderboard preview
- Community stats (members, quests completed)
- Sign up / log in CTA

### Member dashboard
- Quest grid/list with filters (category, status: not started / pending / approved / rejected)
- Quest detail page → submission form → shows current status and admin's note if rejected
- Profile page: total points, submission history
- Leaderboard (all-time to start)

### Admin panel
- **Review queue** — pending submissions, oldest first, filterable by quest, quick approve/reject + note
- **Quest management** — create/edit/archive quests, set point values, mark as featured (feeds the carousel)
- **Member management** — promote to reviewer, view a member's submission history

## 6. Roadmap

### Phase 1 — MVP (build first)
1. Auth (email/password) with member + admin roles
2. Quest CRUD (admin) — active/inactive only, no scheduling yet
3. Submission flow (member) — single submission type: link + optional text note
4. Manual review queue (admin) — approve/reject with note, writes to `PointsLedger`
5. Points total + simple all-time leaderboard
6. Landing page with carousel of featured quests + active quest grid

### Phase 2 — after MVP is live and used
- File/screenshot uploads for submissions
- Badges/achievements, quest categories/tags
- Email notifications on approve/reject
- Weekly/seasonal leaderboards, quest start/end scheduling
- Bulk review actions

### Explicitly out of scope for now
- Wallets / NFTs / on-chain rewards
- Auto-verification or bots
- Multi-tenant / white-label support
- Discord (or other) SSO integration

## 7. Visual Identity

Based on the BlackSquare brand assets (logo + banner):

- **Palette**: near-black background (`#0A0A0A`–`#000000`), white/off-white text and line work, no accent color by default — pure monochrome. If a highlight color is needed for CTAs/status (e.g. "approved"), introduce a single accent sparingly rather than a full color system.
- **Mark**: the black 3D cube is the brand anchor — use it as a favicon/loading motif and echo its geometry (sharp edges, subtle top-light gradient) in card treatments and section dividers, rather than pasting the logo everywhere.
- **Wordmark**: "BLACKSQUARE" set in a bold, geometric sans, with the open-square glyph standing in for the "Q" — reuse this treatment for the product name ("Questing" naturally reinforces the square/Q motif already in the brand).
- **Layout language from the banner**: vertical strip/column composition (alternating image and dark panels) translates well to landing-page section dividers or the quest carousel's card rhythm.
- **Tone**: "THE SIGNAL IN A WORLD OF NOISE" — minimal, high-contrast, no clutter. This reinforces the "don't make this complicated" brief: a clean monochrome dashboard, not a busy gamified UI.
- **Asset handling**: once real logo/banner files are added to the repo, they'll live under `public/branding/` (e.g. `logo.png`, `banner.png`) and be wired into the landing page header/hero and favicon during scaffolding.

## 8. Next steps

Once this plan is approved, the next step is scaffolding the Next.js project: Prisma schema, auth setup, Tailwind theme matching the visual identity above, and empty pages for the landing page, member dashboard, and admin review queue.
