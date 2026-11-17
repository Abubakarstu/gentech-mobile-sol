# GenTech Marketplace — Project Status Tracker

Last Updated: 2026-11-17

## Overall Status

- **Baseline Technical Quality:** Verified (145/145 unit & integration tests passing, TypeScript 0 errors, Next.js production build clean).
- **Active Phase:** Milestone 5 — Trust & Phone Intelligence. M5-F04 is verified; M3-F02 payment checkout implemented with server-verified payment gating; M5-F02 remains simulated until a real PTA/CPID adapter is issued.

---

## Milestone Feature Tracking

| Feature ID | Module         | Description                                                      | Priority | Dependencies                  | Status                                                                     |
| :--------- | :------------- | :--------------------------------------------------------------- | :------- | :---------------------------- | :------------------------------------------------------------------------- |
| **M1-F01** | Admin / Brands | Dynamic Brand Management (CRUD, logo, active toggle)             | P1       | Prisma Brand                  | **VERIFIED**                                                               |
| **M1-F02** | Admin / Models | Dynamic Phone Model Management (CRUD, specs, variants)           | P1       | M1-F01, Prisma PhoneModel     | **VERIFIED**                                                               |
| **M1-F03** | Marketplace    | Dynamic Specs/Variants in Dropdowns (Sell, Filters)              | P1       | M1-F01, M1-F02                | **VERIFIED**                                                               |
| **M1-F04** | Listings       | Listing Approval Workflow (Pending, Approve, Reject with Reason) | P1       | Admin Actions, Listing Schema | **VERIFIED**                                                               |
| **M1-F05** | Locations      | Location Taxonomy (Country → City → Area)                        | P1       | Prisma Schema                 | **VERIFIED**                                                               |
| **M1-F06** | Dashboard      | Admin Dashboard Visual Analytics & Approval Counts               | P1       | M1-F04                        | **VERIFIED**                                                               |
| **M2-F01** | Dealers        | Dealer Registration & Profile Management                         | P2       | Better Auth, Dealer Model     | **VERIFIED**                                                               |
| **M2-F02** | Dealers        | Dealer Verification Queue (private document uploads deferred)    | P2       | M2-F01                        | **VERIFIED**                                                               |
| **M2-F03** | Dealers        | Branch & Inventory Management                                    | P2       | M2-F01, M2-F02                | **VERIFIED**                                                               |
| **M3-F01** | Monetization   | Promotion Package Management                                     | P2       | Promotion Models              | **VERIFIED**                                                               |
| **M3-F02** | Monetization   | Payment Gateway Aggregator (PayFast direct API)                  | P2       | M3-F01                        | **VERIFIED — paid promotion checkout with server-verified payment gating** |
| **M4-F01** | Discovery      | Dynamic Multi-Attribute Mobile Filter System                     | P2       | M1-F02, M1-F03                | **VERIFIED**                                                               |
| **M4-F02** | Communication  | Buyer-Seller Messaging & WhatsApp Lead Link                      | P2       | Conversation Model            | **VERIFIED**                                                               |
| **M4-F03** | Engagement     | Persistent Favorites & Saved Search Alerts                       | P2       | Favorite, SavedSearch Models  | **VERIFIED**                                                               |
| **M5-F01** | Trust          | Automated Phone Valuation Algorithm                              | P3       | PhoneModel, Listing Repos     | **VERIFIED**                                                               |
| **M5-F02** | Trust          | IMEI Check & PTA Status Verification                             | P3       | ImeiVerification Model        | **SIMULATED — real PTA/CPID adapter pending**                              |
| **M5-F03** | Trust          | Side-by-Side Mobile Spec Comparison                              | P3       | PhoneModel Repository         | **VERIFIED**                                                               |
| **M5-F04** | Trust          | Inspection Scheduling & Graded Trust Reports                     | P3       | Inspection Models             | **VERIFIED** — scheduling, graded reports, payment-gated release            |

---

## Technical Health Metrics
- **Auth API Origin:** Browser auth uses the current origin; Vercel production/preview URLs are detected without URL environment variables.
- **Tests Passing:** 145 / 145
- **TypeScript Errors:** 0
- **Production Build:** Success (`cross-env SKIP_ENV_VALIDATION=1 next build`)
- **M4-F01:** Dynamic filters for storage, RAM, color, battery health, PTA/CPID, warranty, inspection, verified sellers, and dealers; database query paths implemented and preview behavior covered by tests.
- **M4-F02:** Listing-scoped chat with text/image messages, polling updates, typing indicators, and read receipts; validated WhatsApp links use seller/dealer contact numbers and prefilled listing context.
- **M4-F03:** Favorite toggles persist per user, dashboard favorites list is available, and enabled saved searches notify once per listing activation through in-app and email channels. Saved searches can pause or resume alerts.
- **M5-F02:** IMEI lookup runs through a provider abstraction. Outside production a deterministic simulator is used; production returns no status (fail closed) unless `DEVICE_VERIFICATION_TEST_MODE=true`. Simulated rows are stored with `isSimulated=true` and labelled in the UI. A real PTA DIRBS/CPID adapter still requires provider credentials.
- **M5-F04:** Buyers book or request an inspection, inspectors claim and schedule it, then submit a graded checklist report. Reports are released only for an open, fee-paid request; terminal requests cannot be claimed, rescheduled, or reported on. Grades derive from the checklist (N/A lines excluded) and buyers choose whether to publish the report on the listing. IMEI is masked unless full access is authorized and audit-logged.
- **Payments:** PayFast direct API implemented for inspection payments; live mode remains disabled pending merchant sandbox/3-D Secure and compliance verification. `PAYMENTS_TEST_MODE=true` enables the labelled sandbox gateway in a production build for preview/staging testing only. **Promotion checkout is now implemented** — creates promotion in pending state, snapshots plan price server-side, routes to payment provider (PayFast 3DS or sandbox), and activates on server-verified PAID; seller-submitted outcomes are rejected (ADR-012).
- **M3-F02:** Paid promotion checkout implemented with server-verified payment gating. Flow: create promotion → snapshot plan price → create PENDING payment → buyer pays via provider (PayFast 3DS or sandbox) → on server-verified PAID → promotion activated; seller-submitted outcomes rejected (ADR-012).
- **Admin UI:** Responsive layouts, route context, loading/error states, and clearer catalog/moderation workflows verified.
- **Lint Status:** 0 errors; two Next.js image optimization advisories remain in catalog manager views.
