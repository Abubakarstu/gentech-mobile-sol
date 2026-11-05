# GenTech Marketplace — Multi-Agent Directives & Capabilities

This file establishes multi-agent guidelines, boundaries, and autonomous instructions for AI agents working in this repository.

## 1. Prime Directives for Agents
1. **Autonomous Responsibility:** Do not stall waiting for instructions. Identify the next required task on the roadmap (`docs/PROJECT_ROADMAP.md`), develop it, verify it, test it, and update `docs/PROJECT_STATUS.md`.
2. **Inward Dependency Rule:**
   - Presentation: `app/` and `components/`
   - Orchestration & Slice UI: `features/<name>/actions/` and `features/<name>/components/`
   - Business Logic: `features/<name>/services/`
   - Data Access: `features/<name>/repositories/` (Prisma is permitted **only** here)
   - Infrastructure & Shared: `lib/`, `types/`, `utils/`
3. **Database Guardrails:**
   - Always run Prisma operations safely.
   - Never run destructive migrations on production databases without explicit instructions.
   - Use Decimal for monetary calculations.
4. **Testing Baseline:**
   - All tests must pass before ending a development session: `pnpm test`.
   - TypeScript must remain at zero errors: `pnpm typecheck`.
   - Next.js build must pass: `cross-env SKIP_ENV_VALIDATION=1 next build`.

## 2. Specialized Roles
When executing specific project functions, adopt the corresponding skill mindset located in `.agent/skills/`:
- `software-architect`: System structure, interfaces, scalability, boundaries.
- `business-analyst`: Mobile marketplace domain rules, Pakistani market specifics (PTA, CPID, offline dealers).
- `project-manager`: Scope control, roadmap execution, milestone delivery, status tracking.
- `fullstack-development`: React 19, Server Actions, shadcn/ui, type safety.
- `database-architect`: Prisma schema, relational integrity, indexing, migrations.
- `ui-ux-development`: Mobile-first responsive layouts, accessible forms, loading states.
- `qa-testing`: Vitest tests, unit testing domain logic, integration testing flows.
- `security-review`: Server-side authorization, input sanitation with Zod, role enforcement (`requireAdmin`).
- `devops-deployment`: Environment variables, build configuration, Vercel deployments.

