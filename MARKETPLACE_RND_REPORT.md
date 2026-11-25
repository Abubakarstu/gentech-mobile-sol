# GenTech Marketplace — Business R&D and Multi-Region Readiness Report

## 1. Executive overview

- Repository: `Abubakarstu/gentech`
- Local path: `D:\Shomlie Future Updates\TestProject\gentech`
- Branch/commit inspected: `feat/sf3d-webgpu-generation` @ `25f74a9`
- Marketplace model inferred: mobile-first classifieds marketplace for BH and PK with inspection, dealer storefronts, promotions and trust signals.
- Configured markets: Bahrain (`bh`) and Pakistan (`pk`); locales `en`, `ar`, `ur`; currencies BHD and PKR.
- Main strengths: locale routing, BHD precision, cart/order isolation, inspections, search, and a broad Prisma schema.
- Highest-value gaps: payment verification boundary, authoritative checkout totals, PKR precision, seller/region enforcement, and missing finance/ops records.
- Key unknowns: live provider behaviour, deployed DB data, BH/PK tax and privacy rules, browser RTL verification.

## 2. Existing capability map

| Domain | Status | Evidence | Business impact |
|---|---|---|---|
| Storefront/search | Ready | `features/listings/repositories/listing.repository.ts:374-385`, `app/api/v1/search/*` | Core discovery works; compare regressions already tracked. |
| Cart/checkout | Partial | `features/cart/services/cart.service.ts:84-110`, `app/api/checkout/calculate/route.ts:5-21` | Totals/address gaps threaten conversion and trust. |
| Orders/fulfilment | Partial | `features/orders/services/order-status.service.ts:31-41`, `app/admin/shipments/page.tsx:22-31` | Role mismatch and no shipment model. |
| Payments | Partial | `features/payments/services/payment.service.ts:138-219`, `features/payments/providers/index.ts:17-20` | Sandbox-only, unsafe callback boundary, no orchestration. |
| Seller/admin | Partial | `features/listings/actions/create-listing.ts:20-41`, `features/admin/lib/require-admin.ts:6-15` | Eligibility not enforced; RBAC coarse. |
| Inspections/trust | Ready code / Unverified runtime | `features/inspections/actions/*`, `features/phone-intelligence/providers/index.ts:18-33` | Workflow complete; real providers pending. |
| Regional support | Partial | `lib/countries/index.ts:18-27`, `lib/currency.ts:21-24`, `middleware.ts:20-40` | BHD ready; PKR precision and tax fields missing. |
| Ops/observability | Missing | `lib/monitoring.ts:56-87`, `app/api/webhooks/route.ts:30-96`, `.github/workflows/ci.yml:44-51` | Silent failures, no scheduler, CI lacks tests. |

## 3. Multi-region readiness scorecard

| Domain | BH | PK | Evidence / decision |
|---|---|---|---|
| Region config | Partial | Ready | `lib/countries/index.ts:18-27`; GeoIP fallback uses plain HTTP (`lib/countries/detect.ts:36-54`). |
| Locale routing | Ready | Ready | `middleware.ts:20-40,187-217`; runtime deployment still #38. |
| RTL | Ready / visual Unverified | Ready / visual Unverified | `app/layout.tsx:69-75`, `components/direction-setter.tsx:5-9`. |
| Translations | Partial | Partial | Key parity exists; checkout/order strings hardcoded. |
| Currency | Ready for BHD | Missing for 2-dp PKR | `lib/currency.ts:21-24`; `1000.57 -> Rs 1,001`. See issue #74. |
| Exchange/conversion | Missing by design | Missing by design | Admin reports currencies separately; business decision required. |
| Tax/invoicing | Partial | Partial | Empty BH `vatNumber`, placeholder PK tax; see #87. |
| Address/shipping | Partial / data Unverified | Partial / data Unverified | Empty address posted; no code seed for shipping rows; see #76 and #90. |
| Payments | Missing real / Partial sandbox | Partial metadata / Missing real | Provider registry sandbox-only; see #77, #34-#36. |
| Catalog | Ready | Ready | Region-scoped listing filters and seeds. |
| Seller eligibility | Partial | Partial | Authentication only at listing creation; see #75. |
| Privacy/compliance | Missing | Missing | Policy strings not reachable; see #86. |

## 4. Opportunity portfolio

| GitHub | Recommendation | Priority | Effort | Confidence | Success metric |
|---|---|---|---|---|---|
| [#67](https://github.com/Abubakarstu/gentech/issues/67) | [P0][Payments][Bug] Require signed, amount-checked verification and isolate read-only return callbacks | P0 | M | High | No unauthenticated or unsigned callback can change payment/order state; all state changes carry provider event evidence. |
| [#68](https://github.com/Abubakarstu/gentech/issues/68) | [P1][Checkout][Bug] Make checkout totals authoritative and persist the quoted discount | P1 | M | High | Displayed total, persisted order total and charged amount are identical in BH/PK regression tests. |
| [#69](https://github.com/Abubakarstu/gentech/issues/69) | [P1][Inventory][Feature] Enforce atomic listing availability and cart quantity limits | P1 | M | High | No order can exceed available stock or sell an already sold unique listing under concurrent checkout. |
| [#70](https://github.com/Abubakarstu/gentech/issues/70) | [P1][Payments][Bug] Bind payment initiation to the authenticated order owner | P1 | S | High | No authenticated user can initiate or redirect payment for another customer order. |
| [#71](https://github.com/Abubakarstu/gentech/issues/71) | [P1][Payments][Improvement] Make payment initiation and webhook processing retry-safe | P1 | M | High | Duplicate initiation or webhook retries produce one payment, one state transition and a usable redirect. |
| [#72](https://github.com/Abubakarstu/gentech/issues/72) | [P1][Orders][Bug] Use real order roles and gate fulfilment on paid state | P1 | M | High | Seller, customer and admin transitions behave correctly and fulfilment cannot start before payment. |
| [#73](https://github.com/Abubakarstu/gentech/issues/73) | [P1][Payments][Feature] Add provider-backed partial refunds with cumulative state | P1 | L | High | Refund amounts reconcile with provider records and orders reflect FULL/PARTIAL/NONE refund state. |
| [#74](https://github.com/Abubakarstu/gentech/issues/74) | [P1][Multi-region][Bug] Restore PKR 2-decimal precision across pricing and notifications | P1 | M | High | PKR 1000.57 formats as Rs 1,000.57 and all order/payment/notification totals retain 2 decimals. |
| [#75](https://github.com/Abubakarstu/gentech/issues/75) | [P1][Seller][Bug] Enforce seller approval and route region before listing creation | P1 | M | High | Unapproved sellers cannot list and BH/PK routes create listings in the matching country. |
| [#76](https://github.com/Abubakarstu/gentech/issues/76) | [P1][Checkout][Bug] Capture a validated, zone-aware delivery address | P1 | M | High | Orders cannot be created without a validated address and COD is rejected outside eligible zones. |
| [#77](https://github.com/Abubakarstu/gentech/issues/77) | [P1][Payments][Bug] Align payment configuration with executable providers and wire checkout initiation | P1 | M | High | Every method shown at checkout has an executable provider and checkout actually starts payment. |
| [#78](https://github.com/Abubakarstu/gentech/issues/78) | [P2][Finance][Feature] Record provider settlements, fees, FX and seller payouts | P2 | L | High | Net receipts, fees, FX and payouts are traceable to provider settlements and exception-free after sign-off. |
| [#79](https://github.com/Abubakarstu/gentech/issues/79) | [P2][Orders][Feature] Support per-seller fulfilments and split shipment tracking | P2 | L | High | Each seller can fulfil and track only their items, with independent shipment status. |
| [#80](https://github.com/Abubakarstu/gentech/issues/80) | [P2][Payments][Improvement] Add failed-payment retry and stale-payment reconciler | P2 | M | High | Stale PENDING/PROCESSING payments are reconciled automatically and customers get a working retry path. |
| [#81](https://github.com/Abubakarstu/gentech/issues/81) | [P2][Integrations][Feature] Turn generic /api/webhooks into a signed, durable event pipeline | P2 | L | High | Webhook events are verified, persisted, processed idempotently, retryable and monitored. |
| [#82](https://github.com/Abubakarstu/gentech/issues/82) | [P2][Admin][Feature] Replace single-role admin gate with data-driven permissions | P2 | L | High | Every admin action is authorised by Role x Module x Action rules, including dealer permissions. |
| [#83](https://github.com/Abubakarstu/gentech/issues/83) | [P2][Audit][Bug] Make audit writes failure-safe and cover financial and privilege changes | P2 | M | High | All financially and privilege-sensitive mutations produce durable, authorised audit records or fail the transaction. |
| [#84](https://github.com/Abubakarstu/gentech/issues/84) | [P2][Observability][Feature] Connect structured error logging to an external sink with alerting | P2 | M | High | Production errors reach an external sink with correlation id and trigger defined alerts. |
| [#85](https://github.com/Abubakarstu/gentech/issues/85) | [P2][Operations][Feature] Add a scheduled job runner with run history and retries | P2 | L | High | Maintenance jobs run on schedule with recorded outcomes, retries and alerts. |
| [#86](https://github.com/Abubakarstu/gentech/issues/86) | [P2][Privacy][Research] Validate and implement consent, export, erasure and retention workflows | P2 | L | Medium | Approved policy is reflected in reachable pages, consent records and automated retention jobs. |
| [#87](https://github.com/Abubakarstu/gentech/issues/87) | [P2][Multi-region][Research] Validate and model region-specific tax identity and invoice fields | P2 | M | Medium | Approved BH/PK tax identity and invoice requirements are represented in the order/invoice model. |
| [#88](https://github.com/Abubakarstu/gentech/issues/88) | [P2][Localization][Improvement] Translate checkout and order-status UI strings | P2 | M | High | Checkout and order pages render fully in en/ar/ur with correct direction and no hardcoded English. |
| [#89](https://github.com/Abubakarstu/gentech/issues/89) | [P2][Multi-region][Bug] Remove hardcoded PKR defaults outside the known Bahrain CTA | P2 | M | High | No Bahrain surface displays PKR except where a tracked defect explicitly allows it. |
| [#90](https://github.com/Abubakarstu/gentech/issues/90) | [P2][Shipping][Research] Verify or seed region shipping methods and zones | P2 | S | Medium | Both markets return at least one valid shipping method and zone in deployed environments. |
| [#91](https://github.com/Abubakarstu/gentech/issues/91) | [P2][Quality][Improvement] Run unit tests in CI and replace placeholder integration suites | P2 | M | High | CI blocks merge on lint, typecheck, build and tests; no placeholder assertions remain. |
| [#92](https://github.com/Abubakarstu/gentech/issues/92) | [P2][Authentication][Research] Harden or retire the simulated OTP subsystem before production use | P2 | M | Medium | No production path can use in-memory OTP, Math.random codes, console-logged codes or unthrottled verification. |

## 5. GitHub issues created

All issues are local Markdown files under `R&D Issues\` and published at https://github.com/Abubakarstu/gentech/issues

| GitHub | Title | Labels | Priority / stage | Market |
|---|---|---|---|---|
| [#67](https://github.com/Abubakarstu/gentech/issues/67) | [P0][Payments][Bug] Require signed, amount-checked verification and isolate read-only return callbacks | bug, security, payments, validation | P0 / Ready for development | BH + PK (general) |
| [#68](https://github.com/Abubakarstu/gentech/issues/68) | [P1][Checkout][Bug] Make checkout totals authoritative and persist the quoted discount | bug, finance, currency, validation | P1 / Ready for development | BH + PK (general) |
| [#69](https://github.com/Abubakarstu/gentech/issues/69) | [P1][Inventory][Feature] Enforce atomic listing availability and cart quantity limits | enhancement, data-quality | P1 / Ready for development | BH + PK (general) |
| [#70](https://github.com/Abubakarstu/gentech/issues/70) | [P1][Payments][Bug] Bind payment initiation to the authenticated order owner | bug, security, payments, validation | P1 / Ready for development | BH + PK (general) |
| [#71](https://github.com/Abubakarstu/gentech/issues/71) | [P1][Payments][Improvement] Make payment initiation and webhook processing retry-safe | enhancement, payments, integration, data-quality | P1 / Ready for development | BH + PK (general) |
| [#72](https://github.com/Abubakarstu/gentech/issues/72) | [P1][Orders][Bug] Use real order roles and gate fulfilment on paid state | bug, data-quality, validation | P1 / Ready for development | BH + PK (general) |
| [#73](https://github.com/Abubakarstu/gentech/issues/73) | [P1][Payments][Feature] Add provider-backed partial refunds with cumulative state | enhancement, payments, finance | P1 / Ready for development | BH + PK (general) |
| [#74](https://github.com/Abubakarstu/gentech/issues/74) | [P1][Multi-region][Bug] Restore PKR 2-decimal precision across pricing and notifications | bug, currency, pakistan-market, qa | P1 / Ready for development | PK |
| [#75](https://github.com/Abubakarstu/gentech/issues/75) | [P1][Seller][Bug] Enforce seller approval and route region before listing creation | bug, validation, pakistan-market, bahrain-market | P1 / Ready for development | BH + PK |
| [#76](https://github.com/Abubakarstu/gentech/issues/76) | [P1][Checkout][Bug] Capture a validated, zone-aware delivery address | bug, validation, delivery, pakistan-market, bahrain-market | P1 / Ready for development | BH + PK |
| [#77](https://github.com/Abubakarstu/gentech/issues/77) | [P1][Payments][Bug] Align payment configuration with executable providers and wire checkout initiation | bug, integration, payments, ux | P1 / Ready for development | BH + PK (general) |
| [#78](https://github.com/Abubakarstu/gentech/issues/78) | [P2][Finance][Feature] Record provider settlements, fees, FX and seller payouts | enhancement, finance, payments, reconciliation | P2 / Needs business validation | BH + PK (general) |
| [#79](https://github.com/Abubakarstu/gentech/issues/79) | [P2][Orders][Feature] Support per-seller fulfilments and split shipment tracking | enhancement, delivery, ux | P2 / Ready for development | BH + PK (general) |
| [#80](https://github.com/Abubakarstu/gentech/issues/80) | [P2][Payments][Improvement] Add failed-payment retry and stale-payment reconciler | enhancement, payments, devops | P2 / Ready for development | BH + PK (general) |
| [#81](https://github.com/Abubakarstu/gentech/issues/81) | [P2][Integrations][Feature] Turn generic /api/webhooks into a signed, durable event pipeline | enhancement, integration, security, devops | P2 / Ready for development | BH + PK (general) |
| [#82](https://github.com/Abubakarstu/gentech/issues/82) | [P2][Admin][Feature] Replace single-role admin gate with data-driven permissions | enhancement, security, ux | P2 / Needs business validation | BH + PK (general) |
| [#83](https://github.com/Abubakarstu/gentech/issues/83) | [P2][Audit][Bug] Make audit writes failure-safe and cover financial and privilege changes | bug, security, finance, data-quality | P2 / Ready for development | BH + PK (general) |
| [#84](https://github.com/Abubakarstu/gentech/issues/84) | [P2][Observability][Feature] Connect structured error logging to an external sink with alerting | enhancement, devops, integration | P2 / Ready for development | BH + PK (general) |
| [#85](https://github.com/Abubakarstu/gentech/issues/85) | [P2][Operations][Feature] Add a scheduled job runner with run history and retries | enhancement, devops, integration | P2 / Ready for development | BH + PK (general) |
| [#86](https://github.com/Abubakarstu/gentech/issues/86) | [P2][Privacy][Research] Validate and implement consent, export, erasure and retention workflows | investigation, legal, pakistan-market, bahrain-market | P2 / Research required | BH + PK |
| [#87](https://github.com/Abubakarstu/gentech/issues/87) | [P2][Multi-region][Research] Validate and model region-specific tax identity and invoice fields | investigation, finance, vat, sales-tax, pakistan-market, bahrain-market | P2 / Research required | BH + PK |
| [#88](https://github.com/Abubakarstu/gentech/issues/88) | [P2][Localization][Improvement] Translate checkout and order-status UI strings | enhancement, localization, pakistan-market, bahrain-market | P2 / Ready for development | BH + PK |
| [#89](https://github.com/Abubakarstu/gentech/issues/89) | [P2][Multi-region][Bug] Remove hardcoded PKR defaults outside the known Bahrain CTA | bug, currency, pakistan-market | P2 / Ready for development | PK |
| [#90](https://github.com/Abubakarstu/gentech/issues/90) | [P2][Shipping][Research] Verify or seed region shipping methods and zones | investigation, delivery, devops, pakistan-market, bahrain-market | P2 / Research required | BH + PK |
| [#91](https://github.com/Abubakarstu/gentech/issues/91) | [P2][Quality][Improvement] Run unit tests in CI and replace placeholder integration suites | enhancement, test, devops | P2 / Ready for development | BH + PK (general) |
| [#92](https://github.com/Abubakarstu/gentech/issues/92) | [P2][Authentication][Research] Harden or retire the simulated OTP subsystem before production use | investigation, security, devops | P2 / Research required | BH + PK (general) |

### Additional task and feature issues (#93–#97)

Filed after dedupe from the five previously unfiled recommendations. Labels `task` and `feature` were created in the repository for work-type filtering.

| GitHub | Title | Labels |
|---|---|---|
| [#93](https://github.com/Abubakarstu/gentech/issues/93) | [Task][P1][Seller] Wire verification form to upload API and JSON submit contract | task, bug, security, validation, bahrain-market, pakistan-market |
| [#94](https://github.com/Abubakarstu/gentech/issues/94) | [Feature][P2][Trust] Add buyer-facing review creation for completed listings | feature, enhancement, ux, bahrain-market, pakistan-market |
| [#95](https://github.com/Abubakarstu/gentech/issues/95) | [Task][P1][Promotions] Add /dashboard/promotions/new route | task, enhancement, ux, payments |
| [#96](https://github.com/Abubakarstu/gentech/issues/96) | [Task][P2][Bahrain] Make WhatsApp number normalization region-aware | task, bug, localization, bahrain-market |
| [#97](https://github.com/Abubakarstu/gentech/issues/97) | [Feature][P2][Admin] Replace static readiness panels with evidence-backed launch-gate register | feature, enhancement, devops, security, documentation |

## 6. Existing issues reused / not duplicated

- #26 Bahrain CTA PKR price; #89 removes other PKR defaults but explicitly excludes #26.
- #31 ledger/invoice generation; #78 supplies settlement source data and #87 supplies tax identity fields.
- #34-#36 live provider enablement; #77 covers orchestration/config only.
- #37 private dealer documents; #75 uses existing seller eligibility rules and does not redesign storage.
- #42 unsigned POST callback; #67 covers the wider verification boundary and supersedes it for implementation.
- #43/#44 FCM endpoints; #83-#85 cover audit, logging, and job infrastructure, not token persistence.
- #45-#66 Access report audit; no Access-report work was re-filed.

## 7. Needs validation

- BH VAT categories, zero-rating/exemptions, TRN and invoice content (#87, #63).
- Pakistan federal/provincial tax treatment and required identifiers (#87, #59).
- Deployed shipping methods/zones and COD policy (#90, #76).
- Live provider credentials, callback semantics and refund capability (#34-#36, #67, #73, #80).
- BH/PK privacy, consent, retention and cross-border transfer obligations (#86).
- Visual RTL rendering and browser checkout flow (#64, #88, #38).
- Role matrix for delegated finance/support/content/admin permissions (#82).

## 8. Roadmap dependencies

- Protect: #42, #43, #67, #70, #81, #83.
- Foundation: #8, #26, #31, #32, #74, #82, #84, #85, #86, #87, #91, #92.
- Core marketplace: #68, #69, #71, #72, #73, #76, #77, #79, #80.
- Regional expansion: #34-#36, #75, #78, #88, #89, #90.
- Growth: #94 user review creation and #95 promotion creation route filed; promotion completion remains paused pending product decision and #34.
- Optimization: #39, #41, #88, #91.

## 9. Coverage and limitations

- Four read-only agents inspected architecture/capabilities, payments/finance, multi-region readiness, and ops/quality.
- Evidence is code-level at commit `25f74a9`; no browser, database, provider credentials or live runtime checks were performed.
- No external market research was performed; regulatory/provider facts are marked Research required or Needs business validation.
- Pre-existing working-tree changes (`AGENTS.md`, `docs/PROGRESS_CHECKLIST.md`, untracked skill files) were left untouched.
- Existing labels were used for #67–#92; `task` and `feature` were created for #93–#97 work-type filtering.
- Previously unfiled recommendations are now #93–#97: seller-verification form/upload mismatch, review creation, promotions route, BH WhatsApp normalization, and launch-gate register.

Counts: opportunities discovered 31; issues created/published 31; existing issues matched 12+; recommendations not filed 0; items needing validation 8.
