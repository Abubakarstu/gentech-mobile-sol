# GenTech Marketplace

A production-grade, mobile-first marketplace platform. Generic by design — the first
vertical is **mobile phones (Pakistan)**.

**Stack:** Next.js 16 (App Router, React 19) · TypeScript (strict) · Tailwind v4 ·
shadcn/ui (Base UI) · Framer Motion · Prisma 7 + Neon PostgreSQL · Better Auth ·
Cloudinary · Google Maps · FCM (later phases).

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the layering and conventions.

---

## Prerequisites

- **Node.js** ≥ 20.19 (22.x or newer recommended)
- **pnpm** ≥ 10 — `npm install -g pnpm`
- A **Neon** PostgreSQL database (free tier is fine)

## 1. Install

```bash
pnpm install
```

## 2. Configure environment

For a database-free public demo, copy the example as-is. The homepage uses demo fixtures
when PostgreSQL is unavailable. The read-only demo login is `user` / `user`; admin,
dealer, registration, and database-backed write features are disabled.

```bash
cp .env.example .env
```

For database-backed features, set `DEMO_MODE="false"` and `DEMO_READ_ONLY="false"`,
then replace the database and auth placeholders with real values.

For an initial database-free Vercel demo, no environment variables are required. When
both `DATABASE_URL` and `BETTER_AUTH_SECRET` are absent, production automatically
starts in read-only demo mode and exposes only the `user` / `user` preview login.
Database requests and all write methods are blocked. To use the real app later, configure
the database and auth variables and set `DEMO_MODE=false` and `DEMO_READ_ONLY=false`.

Minimum required to run auth locally:

| Variable             | Where to get it                                             |
| -------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`       | Neon dashboard → Connection Details → **Pooled** connection |
| `DIRECT_URL`         | Neon dashboard → **Direct** connection (used by migrations) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32`                                   |

Vercel automatically detects the origin for production and preview deployments.
Browser sign-in always uses the current page's origin, so no URL environment
variables are required. The current production origin is
`https://gentech-mauve.vercel.app`; staging uses its Vercel Preview URL, and local
development uses `http://localhost:3000`. Set `APP_URL` or `BETTER_AUTH_URL` only
for non-Vercel deployments that need a fixed canonical origin.

Optional (features degrade gracefully until set):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google sign-in
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` — Facebook sign-in
- `RESEND_API_KEY` / `EMAIL_FROM` — real verification & reset emails
  (without these, email links are printed to the server console)

OAuth redirect URIs (add in each provider's console):

- Google: `http://localhost:3000/api/auth/callback/google`
- Facebook: `http://localhost:3000/api/auth/callback/facebook`

For production OAuth, also register `https://gentech-mauve.vercel.app/api/auth/callback/<provider>`.

## 3. Create the database schema

```bash
pnpm db:migrate      # development database: creates tables + generates the client
```

For staging or production, apply committed migrations explicitly with
`pnpm db:deploy` before deploying the application. Builds seed catalog data in every
environment, but do not run migrations; configure the environment's intended database
connection before building.

## Demo accounts

All dev-like environments — local development, tests, and Vercel Preview — may use every
documented demo role. Vercel Production remains restricted to the read-only preview user.

Use a separate database for protected Vercel Preview. Dev-like environments
(local development, tests, Vercel Preview) enable demo mode automatically; set
`DEMO_SEED_USERS="true"` in any environment where the build or local startup should
create or refresh verified Better Auth-compatible accounts. Set `DEMO_MODE="false"`
explicitly to opt out. Accounts are marked email-verified, so no verification bypass
is needed. Seeding is independent of `DEMO_MODE`: `DEMO_SEED_USERS="true"` seeds all three
environments, including Production. Seeding does not change sign-in policy: Vercel Production
still allows only the read-only preview user, and normal registration/sign-in use the same
database regardless of demo flags. A missing or un-migrated database never blocks the build.
You can also run `pnpm db:seed:demo` explicitly:

| Panel     | Email                         | Password              |
| --------- | ----------------------------- | --------------------- |
| Admin     | `admin@demo.gentech.test`     | `DemoAdmin-2026!`     |
| Inspector | `inspector@demo.gentech.test` | `DemoInspector-2026!` |
| User      | `user@demo.gentech.test`      | `DemoUser-2026!`      |
| Dealer    | `dealer@demo.gentech.test`    | `DemoDealer-2026!`    |

The admin account has full admin access in dev-like environments. Enable
`DEMO_SEED_USERS` only where those accounts are intended to exist; production sign-in
policy still blocks admin, inspector, and dealer sessions. Use the target database's
`DATABASE_URL` and `DIRECT_URL`; setting the flag alone does not create or migrate a
schema. Apply committed migrations explicitly with `pnpm db:deploy` on the intended
database before expecting seeded listings or catalog data.

Sign-in itself is database-independent: when demo mode is enabled, the documented
credentials always create a signed demo session from the normal email/password form,
even if the database is unavailable. Email verification is off by default and can be
switched on by an admin at `/admin/settings` (the change is server-side,
permission-gated, and audited).

## 4. Run

```bash
pnpm dev             # http://localhost:3000
```

---

## Scripts

| Script            | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Start the dev server (Turbopack)               |
| `pnpm build`      | Production build                               |
| `pnpm start`      | Run the production build                       |
| `pnpm typecheck`  | `tsc --noEmit`                                 |
| `pnpm lint`       | ESLint                                         |
| `pnpm format`     | Prettier write                                 |
| `pnpm db:migrate` | Create/apply a dev migration + generate client |
| `pnpm db:push`    | Push schema without a migration (prototyping)  |
| `pnpm db:studio`  | Open Prisma Studio                             |
| `pnpm db:seed`    | Run the seed script                            |

> Tip: to run a build without a populated `.env` (CI), prefix with
> `SKIP_ENV_VALIDATION=1`.

## Promoting a user to admin

Roles are not self-assignable. After signing up, promote yourself via Prisma Studio
(`pnpm db:studio` → `user` → set `role` = `ADMIN`) or SQL:

```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'you@example.com';
```
