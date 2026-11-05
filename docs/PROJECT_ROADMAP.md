# GenTech Marketplace — Project Roadmap

## Vision
To develop a high-trust, mobile-first classified marketplace for mobile phones in Pakistan and emerging markets, combining the frictionless listing experience of OLX with the trust, inspection, and verification standards of PakWheels.

---

## Roadmap Phases

### Milestone 1 — Core Marketplace Foundation (Current Priority)
- **Objective:** Give administrators complete control over the catalog, approval lifecycle, and taxonomy without editing source code.
- **Key Deliverables:**
  1. **Brand Management UI (`/admin/brands`):** Full CRUD for mobile brands (Apple, Samsung, Xiaomi, etc.) with position ordering and active toggling.
  2. **Model & Specification Manager (`/admin/models`):** Full CRUD for phone models with official specifications (Display, Processor, Cameras, Battery, RAM variants, Storage variants, Colors).
  3. **Listing Approval & Rejection Workflow:**
     - Transition state machine: `DRAFT` → `PENDING_APPROVAL` → `ACTIVE` / `REJECTED`.
     - Admin review queue with one-click approve and structured rejection reasons.
     - Audit logging for reviewer and timestamps.
  4. **Location Taxonomy:**
     - Dynamic City and Area hierarchy for filtering and listing submission.
  5. **Admin Dashboard Analytics:**
     - Real-time counts for pending approvals, active ads, rejected ads, and brand distributions.

### Milestone 2 — Dealer Storefronts & Inventory
- **Objective:** Onboard professional mobile retailers.
- **Key Deliverables:**
  1. Dealer registration and business verification pipeline.
  2. Multi-branch management with dedicated staff logins.
  3. Bulk inventory feeds and dealer leads tracker.

### Milestone 3 — Monetization & Payment Processing
- **Objective:** Generate revenue through value-added seller promotions and dealer plans.
- **Key Deliverables:**
  1. Paid listing promotions (Silver, Gold, Platinum packages).
  2. PayFast / Safepay aggregator integration (JazzCash, Easypaisa, cards).
  3. Automated transaction ledger and invoice generation.

### Milestone 4 — Buyer Experience & Discovery
- **Objective:** Maximize buyer conversion and seamless mobile search.
- **Key Deliverables:**
  1. Smart multi-attribute search (filter by RAM, Storage, PTA status, CPID, Price, City).
  2. WhatsApp direct seller contact button.
  3. In-app messaging with image sharing and read receipts.
  4. Favorites and saved search alert notifications.

### Milestone 5 — Trust & Phone Intelligence
- **Objective:** Differentiate from generic classifieds through proprietary phone intelligence.
- **Key Deliverables:**
  1. Real-time price valuation based on live active and sold market data.
  2. PTA & CPID verification checks with security risk badges.
  3. Interactive side-by-side spec comparison table.
  4. In-person physical inspection scheduling and graded trust reports.

