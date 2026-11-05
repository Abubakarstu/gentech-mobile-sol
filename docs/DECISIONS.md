# GenTech Marketplace — Architectural & Business Decisions (ADR)

## ADR-001: Autonomous Execution Model
- **Date:** 2026-11-05
- **Status:** Approved
- **Decision:** The AI operates as Lead Technical Authority and Project Owner, autonomously executing sequential roadmap milestones without pausing for trivial approvals. Questions are reserved strictly for irreversible operations or external credentials.

## ADR-002: Dynamic Catalog (No Hardcoded Brands or Specs)
- **Date:** 2026-11-05
- **Status:** Approved
- **Decision:** All brands, phone models, storage options, RAM options, and colors must be stored in PostgreSQL and configurable via the Admin Panel. Marketplace forms and filters query these models dynamically so the platform can expand to tablets and accessories without code changes.

## ADR-003: Inward Dependency Rule for Database Access
- **Date:** 2026-11-05
- **Status:** Approved
- **Decision:** Prisma client is imported exclusively within `features/<feature>/repositories/`. Services and server actions interact through repository abstractions, keeping business logic testable and decoupled from database drivers.

## ADR-004: Listing Moderation & Approval State Machine
- **Date:** 2026-11-05
- **Status:** Approved
- **Decision:** Listings support an approval workflow. New ad submissions can be verified before being marked `ACTIVE`. Rejections require a reason and are logged to `AuditLog`.

