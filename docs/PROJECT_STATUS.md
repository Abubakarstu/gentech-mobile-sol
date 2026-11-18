# GenTech Marketplace — Project Status Tracker

Last Updated: 2026-11-18

## Overall Status

- **Baseline Technical Quality:** Verified (206/206 unit & integration tests passing, TypeScript 0 errors, ESLint 0 errors / 47 non-blocking warnings, Next.js production build clean from a freshly generated Prisma client).
- **Active Phase:** Multi-country marketplace (BH/PK), checkout, payments, and order management. Country detection uses saved preference → Vercel/CF geo header → configured default, routing Bahrain visitors to Arabic/BHD. Admin region analytics and region filter are live. Real payment providers (BenefitPay, JazzCash, Easypaisa) remain blocked pending verified docs, merchant credentials, and sandbox testing; M5-F02 remains simulated until a real PTA/CPID adapter is issued.
- **Localization Regression Fixed:** Shared server components (header, footer, hero, how-it-works, CTA, listings grid) now resolve the request locale from middleware headers and pass it explicitly to `getTranslations`, so visible Arabic/Urdu copy no longer falls back to English. Verified locally on `/bh/ar`, `/bh/en`, `/pk/ur`, `/pk/en`: correct `<html lang/dir>`, localized hero, BHD/PKR isolation, BH cities vs PK cities, and PTA text only on PK routes. One localized homepage under `app/[country]/[locale]/page.tsx`; the duplicate nested homepage was removed.

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
- **Tests Passing:** 206 / 206
- **TypeScript Errors:** 0
- **Production Build:** Success after clean Prisma generation; `pnpm db:generate` runs in both `build` and `vercel-build`, and the clean build log reports zero `Module not found` warnings.
- **Region Analytics:** Admin dashboard and analytics page report Bahrain/Pakistan users, listings, orders, payments, and city/area breakdowns. BHD (3 dp) and PKR (0 dp) stay in their own currency — no cross-conversion. Admin listings region filter restored after a bad `main` merge dropped it.
- **Merge Integrity:** A bad merge into `feature/phase7-country-payments` left `features/admin/components/location-manager.tsx` half-converted (duplicate handlers, undefined state, unclosed brace) which broke TypeScript, and dropped the admin listings region filter. Both restored. Remote `main` contains the full multi-country work, the pnpm 11 native-build allowlist fix, and the Prisma build-generation fix. Live check on 2026-11-18 still returned 404 for `/bh/ar` before the build-generation fix deployed; recheck after the next Vercel deployment.
- **M4-F01:** Dynamic filters for storage, RAM, color, battery health, PTA/CPID, warranty, inspection, verified sellers, and dealers; database query paths implemented and preview behavior covered by tests.
- **M4-F02:** Listing-scoped chat with text/image messages, polling updates, typing indicators, and read receipts; validated WhatsApp links use seller/dealer contact numbers and prefilled listing context.
- **M4-F03:** Favorite toggles persist per user, dashboard favorites list is available, and enabled saved searches notify once per listing activation through in-app and email channels. Saved searches can pause or resume alerts.
- **M5-F02:** IMEI lookup runs through a provider abstraction. Outside production a deterministic simulator is used; production returns no status (fail closed) unless `DEVICE_VERIFICATION_TEST_MODE=true`. Simulated rows are stored with `isSimulated=true` and labelled in the UI. A real PTA DIRBS/CPID adapter still requires provider credentials.
- **M5-F04:** Buyers book or request an inspection, inspectors claim and schedule it, then submit a graded checklist report. Reports are released only for an open, fee-paid request; terminal requests cannot be claimed, rescheduled, or reported on. Grades derive from the checklist (N/A lines excluded) and buyers choose whether to publish the report on the listing. IMEI is masked unless full access is authorized and audit-logged.
- **Payments:** PayFast direct API implemented for inspection payments; live mode remains disabled pending merchant sandbox/3-D Secure and compliance verification. `PAYMENTS_TEST_MODE=true` enables the labelled sandbox gateway in a production build for preview/staging testing only. **Promotion checkout is now implemented** — creates promotion in pending state, snapshots plan price server-side, routes to payment provider (PayFast 3DS or sandbox), and activates on server-verified PAID; seller-submitted outcomes are rejected (ADR-012).
- **M3-F02:** Paid promotion checkout implemented with server-verified payment gating. Flow: create promotion → snapshot plan price → create PENDING payment → buyer pays via provider (PayFast 3DS or sandbox) → on server-verified PAID → promotion activated; seller-submitted outcomes rejected (ADR-012).
- **Admin UI:** Responsive layouts, route context, loading/error states, and clearer catalog/moderation workflows verified.
- **Lint Status:** 0 errors; `pnpm lint` exits 0. All explicit `any`, `require()`, raw `<a href="/...">`, and optional-module findings are resolved. Remaining non-blocking advisories: 47 warnings (unused variables, `next/no-img-element`, Vite config native-loader notice); CI runs `pnpm lint` without `--max-warnings`.
- **Typed Safety:** No `@typescript-eslint/no-explicit-any` findings remain and the temporary rule downgrade was removed from `eslint.config.mjs`. Prisma `Region`, `OrderStatus`, `PaymentStatus`, `Prisma.Decimal`, `Prisma.InputJsonValue`, and typed DTOs replace casts. The optional `googleapis` import is typed and marked `turbopackOptional`, so Vercel/Turbopack reports no module warning.
