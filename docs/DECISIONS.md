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

## ADR-005: Relational Location References With Historical Snapshots

- **Date:** 2026-11-11
- **Status:** Approved
- **Decision:** Countries, cities, and areas are managed relationally and active selections are validated server-side. Listings and inspection requests keep their existing city/area text alongside nullable foreign keys so legacy or historical location text remains readable when a managed location is removed.

## ADR-006: Dealer Review Without Public Document Uploads

- **Date:** 2026-11-11
- **Status:** Approved
- **Decision:** Dealer applications are reviewed from submitted business profile data. Admin approval activates and verifies the dealer; rejection requires a reason stored on the profile and in the audit log. Private tax or identity documents are deferred until private file storage is configured; the public image-upload flow must not be used for them.

## ADR-007: PayFast Direct API With No Payment-Detail Persistence

- **Date:** 2026-11-11
- **Status:** Approved, live processing gated
- **Decision:** Inspection payments use PayFast's direct token/tokenized-transaction/status API. Card, wallet, and OTP details are sent to PayFast but never persisted or logged by GenTech. A short-lived authenticated continuation carries only the temporary provider instrument token and transaction context. Live processing remains disabled until merchant sandbox/3-D Secure testing and compliance review are complete. Promotion checkout must not activate listings or accept seller-submitted payment outcomes until it is connected to verified server-side payment processing.

## ADR-008: Pause PayFast Verification and Continue Discovery Work

- **Date:** 2026-11-11
- **Status:** Approved
- **Decision:** Pause M3-F02 at its code-complete boundary while merchant sandbox access and compliance review are unavailable. Keep live payment processing and promotion checkout disabled. Continue with M4-F01, the next prioritized roadmap module, without treating the payment integration as verified.

## ADR-009: WhatsApp Contact Uses Seller-Provided Listing Contact Numbers

- **Date:** 2026-11-11
- **Status:** Approved
- **Decision:** Listing WhatsApp links use the seller's profile phone or, for dealer listings, the dealer's business phone. The account and dealer forms identify these numbers as listing contact options. Format common Pakistani local numbers for WhatsApp, and omit the contact action when a usable number is unavailable.

## ADR-010: Saved Search Alerts Follow Listing Approval

- **Date:** 2026-11-11
- **Status:** Approved
- **Decision:** A saved search enables in-app and email alerts by default; users can pause or resume alerts per search. Match alerts are sent only when a listing transitions from pending approval to active, never for pending listings, and the listing owner is excluded. Favorites remain private to the user and require an active listing.
