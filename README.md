# BlackSquare Quests

The BlackSquare community questing platform. See [`PLAN.md`](./PLAN.md) for the product plan, data model, and roadmap.

## Stack

Next.js (App Router) + TypeScript, PostgreSQL via Prisma, Tailwind CSS. No external auth provider — email/password login with a signed httpOnly cookie session (bcrypt + jose), following the pattern in the [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication).

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** — copy `.env.example` to `.env` and fill in a real `DATABASE_URL` (a local Postgres instance works fine) and a random `SESSION_SECRET`:

   ```bash
   cp .env.example .env
   ```

3. **Run migrations**

   ```bash
   npm run db:migrate
   ```

4. **Seed the database** with an admin, a member, and a few starter quests:

   ```bash
   npm run db:seed
   ```

   Seeded logins:
   - Admin: `admin@blacksquare.test` / `adminpass123`
   - Member: `member@blacksquare.test` / `memberpass123`

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

Other useful scripts: `npm run db:studio` (browse the database with Prisma Studio), `npm run build` (production build), `npm run lint`.

## Project structure

- `src/app/` — pages: public landing page, `/login` & `/signup`, `/dashboard/*` (member), `/admin/*` (admin/reviewer)
- `src/lib/actions/` — Server Actions for auth, quests, submissions, and role management
- `src/lib/session.ts` — cookie-based session creation/verification and role gating
- `src/proxy.ts` — route protection (Next.js 16 renamed `middleware.ts` to `proxy.ts`); this is an optimistic check only — every Server Action also re-checks authorization itself
- `prisma/schema.prisma` — data model (see PLAN.md section 4 for the plain-English explanation)
- `prisma/seed.ts` — seed script
- `public/branding/` — BlackSquare logo and banner assets

## Notes on this Next.js version

This project was scaffolded on Next.js 16 and Prisma 7, both of which have breaking changes versus older docs/training data:

- Route protection lives in `proxy.ts`, not `middleware.ts`.
- Prisma Client is generated to `src/generated/prisma` (not imported from `@prisma/client` directly) and is constructed with an explicit driver adapter (`@prisma/adapter-pg`) rather than reading `DATABASE_URL` implicitly — see `src/lib/prisma.ts`.
