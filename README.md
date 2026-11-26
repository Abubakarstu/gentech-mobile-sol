# GenTech Marketplace

A production-grade, mobile-first marketplace platform. Generic by design — the first
vertical is **mobile phones (Pakistan)**.

**Stack:** Next.js 16 (App Router, React 19) · TypeScript (strict) · Tailwind v4 ·
shadcn/ui (Base UI) · Framer Motion · Prisma 7 + Neon PostgreSQL · Better Auth ·
Cloudinary · Google Maps · FCM (later phases).

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the layering and conventions.
Browser-side image-to-3D generation is documented in [`docs/SF3D_WEBGPU.md`](./docs/SF3D_WEBGPU.md); it is disabled unless explicitly configured and legally cleared.

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

Copy the example and replace the database and auth placeholders with real values.
`DATABASE_URL` and `BETTER_AUTH_SECRET` are required in every environment.

```bash
cp .env.example .env
```

There are no demo accounts or demo-mode flags. The first account registered after
deployment becomes `ADMIN` when no administrator exists; later accounts are `USER`.
New accounts are pre-verified and can sign in immediately.

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
- `RESEND_API_KEY` / `EMAIL_FROM` — password-reset emails
  (without these, reset links are printed to the server console)
- `NEXT_PUBLIC_SF3D_ENABLED` / `NEXT_PUBLIC_SF3D_WEIGHTS_URL` — optional browser-only 3D generation; see [`docs/SF3D_WEBGPU.md`](./docs/SF3D_WEBGPU.md) before enabling

OAuth redirect URIs (add in each provider's console):

- Google: `http://localhost:3000/api/auth/callback/google`
- Facebook: `http://localhost:3000/api/auth/callback/facebook`

For production OAuth, also register `https://gentech-mauve.vercel.app/api/auth/callback/<provider>`.

## 3. Create the database schema

```bash
pnpm db:migrate      # development database: creates tables + generates the client
```

For staging or production, apply committed migrations explicitly with
`pnpm db:deploy` before deploying the application. Builds do not seed or migrate data;
run `pnpm db:seed` explicitly against the intended database for catalog reference data.

## Accounts

Only real registered accounts can sign in. On a database with no administrator, the
first successful registration is assigned `ADMIN`; every later registration is `USER`.
Email verification is disabled, so no verification step is required after sign-up.
Use a separate database for Vercel Preview so preview registrations cannot claim the
production administrator role.

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
| `pnpm db:seed`    | Seed catalog + 200 image-backed listings       |
| `pnpm db:seed:admin` | Seed a credential-backed ADMIN user (requires `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`) |

> Tip: to run a build without a populated `.env` (CI), prefix with
> `SKIP_ENV_VALIDATION=1`.

## Promoting a user to admin

Roles are not self-assignable. After signing up, promote yourself via Prisma Studio
(`pnpm db:studio` → `user` → set `role` = `ADMIN`) or SQL:

```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'you@example.com';
```
