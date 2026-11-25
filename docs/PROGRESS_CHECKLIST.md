# GenTech Marketplace — Progress Checklist

Last updated: 2026-11-25

Sources: local Git state, `docs/PROJECT_STATUS.md`, `docs/PROJECT_ROADMAP.md`, and GitHub issue #8.

## Repository state

- [x] Advanced product viewing and optional 3D committed as `538e11c`.
- [x] Browser-side SF3D generation committed as `ca651cd`.
- [x] New branch `feat/sf3d-webgpu-generation` created from `main` and pushed.
- [x] `main` fast-forwarded to `ca651cd` (`ca651cda5a472ac21c3c1095788403f15bbea7e9`).
- [x] Working tree clean after the push.
- [x] GitHub Issues enabled in `Abubakarstu/gentech`.
- [x] GitHub issue #8 created: [Clear legal gate before enabling browser-side SF3D generation](https://github.com/Abubakarstu/gentech/issues/8).

## Completed local work

- [x] Seller "Generate 3D" flow added to create-listing and post-publication management.
- [x] WebGPU capability check and explicit seller licence acceptance gate added.
- [x] SF3D producer vendored under `public/sf3d/`; weights remain external, unpinned in source.
- [x] Browser-only inference: no image, prompt, or tensor sent to GenTech or an AI API.
- [x] Finished GLB uploaded through the existing authenticated Cloudinary raw path under `models/${user.id}`.
- [x] `ListingModel` provenance/status fields added by `20261125130000_add_listing_model_generation_provenance`.
- [x] Buyer-facing "AI-generated 3D model" label and approximation notice added in EN/AR/UR.
- [x] Root GLB URL-resolver bug fixed in `lib/model-assets.ts`; unauthorized GLTF asset references remain blocked.
- [x] Localhost buyer 3D flow verified with a temporary GLB fixture: `photos,3d` modes, live R3F canvas, no fallback, rotation/reset/fullscreen controls.
- [x] Temporary fixture, helper scripts, and local DB row removed; `ListingModel` count back to `0`.

## Verification baseline

- [x] `pnpm typecheck` — 0 errors.
- [x] `pnpm test` — 446/446 across 69 files.
- [x] `pnpm lint` — 0 errors, 46 pre-existing non-blocking warnings.
- [x] `pnpm build` — passed, 259 pages generated.
- [x] `npx prisma migrate status` — up to date; no destructive migration run.
- [x] `git diff --check` — no whitespace errors.

## Milestone status

- [x] **M1-F01–M1-F06** — core catalog, approval workflow, taxonomy, and admin analytics verified.
- [x] **M2-F01–M2-F03** — dealer registration, verification queue, branches, and inventory verified.
- [x] **M3-F01** — promotion package management verified.
- [x] **M3-F02** — PayFast inspection payment code verified; live/promotion payments remain paused pending merchant verification.
- [ ] **M3-F03** — automated transaction ledger and invoice generation is not implemented; tracked in issue #31.
- [x] **M4-F01–M4-F03** — filters, messaging, favorites, and saved-search alerts verified.
- [x] **M5-F01, M5-F03, M5-F04** — valuation, spec comparison, and inspection reports verified.
- [ ] **M5-F02** — PTA/CPID simulator and provider abstraction verified; real PTA DIRBS/CPID adapter pending provider credentials.

## Active blockers and next actions

- [ ] Close GitHub issue #8: obtain legal clearance for the SF3D runtime, inference kit, and Stability AI weights; record the outcome in ADR-019 and `docs/SF3D_WEBGPU.md`.
- [ ] If cleared, configure `NEXT_PUBLIC_SF3D_ENABLED`, `NEXT_PUBLIC_SF3D_WEIGHTS_URL`, `NEXT_PUBLIC_SF3D_WEIGHTS_BYTES`, and `NEXT_PUBLIC_SF3D_WEIGHTS_ETAG` in deployment.
- [ ] Run `npx prisma migrate deploy` in each target environment before enabling generation.
- [ ] Verify the seller Generate 3D flow in a WebGPU-capable browser with the pinned weights.
- [ ] If not cleared, disable or remove the generation path while keeping manual GLB/GLTF upload intact.
- [ ] Verify real payment providers (BenefitPay, JazzCash, Easypaisa) with merchant credentials and sandbox tests.
- [ ] Integrate a real PTA DIRBS/CPID adapter for M5-F02.
- [ ] Recheck `/bh/ar` after the next Vercel deployment; the earlier 404 preceded the Prisma build-generation fix.

## Notes

- Generated 3D is explicitly labelled as an approximation; it is not a measured 3D scan.
- Manual seller GLB/GLTF upload remains fully supported when WebGPU or generation is unavailable.
- Honest photo tiers stay `1`, `2–3`, `4–11`, `12–23`, `24–36`; rotation only at `12+`, and `360°` only at `24+`.

## QA finding issues

Closed archive issues — already fixed and verified:

- [#17](https://github.com/Abubakarstu/gentech/issues/17) — Compare preview listing IDs dropped from selection.
- [#18](https://github.com/Abubakarstu/gentech/issues/18) — Compare checkbox hit target was intercepted.
- [#19](https://github.com/Abubakarstu/gentech/issues/19) — Compare selected IDs lost when catalog lookup failed.
- [#20](https://github.com/Abubakarstu/gentech/issues/20) — Removing one of two compare listings cleared the remaining product.
- [#21](https://github.com/Abubakarstu/gentech/issues/21) — Compare metadata had placeholder and duplicated suffix.
- [#22](https://github.com/Abubakarstu/gentech/issues/22) — Compare spec table had blank cells.
- [#23](https://github.com/Abubakarstu/gentech/issues/23) — Compare browser bundle imported Prisma currency helper.

Open tracking issues — still actionable:

- [#24](https://github.com/Abubakarstu/gentech/issues/24) — Admin subpage navigation can stay on loading skeleton.
- [#25](https://github.com/Abubakarstu/gentech/issues/25) — Image upload signing returned 503 without Cloudinary credentials.
- [#26](https://github.com/Abubakarstu/gentech/issues/26) — Bahrain inspection CTA shows PKR price.
- [#27](https://github.com/Abubakarstu/gentech/issues/27) — City and area labels are not localized.
- [#28](https://github.com/Abubakarstu/gentech/issues/28) — Orphaned countries detect helper remains as legacy code.
- [#29](https://github.com/Abubakarstu/gentech/issues/29) — Live Vercel smoke check is manual.
- [#30](https://github.com/Abubakarstu/gentech/issues/30) — Local DB unavailable triggers demo-data fallback.

## Audit-created delivery backlog

New issues created from the full audit. Every issue has labels so a fellow developer can filter by work type:

- [#31](https://github.com/Abubakarstu/gentech/issues/31) — `enhancement, blocked, help wanted` — M3-F03 transaction ledger and invoice generation.
- [#32](https://github.com/Abubakarstu/gentech/issues/32) — `bug, devops, test` — health endpoint uses placeholder DB/Cloudinary checks.
- [#33](https://github.com/Abubakarstu/gentech/issues/33) — `enhancement, integration, blocked` — real PTA DIRBS/CPID adapter for M5-F02.
- [#34](https://github.com/Abubakarstu/gentech/issues/34) — `security, devops, blocked` — live PayFast verification and enablement.
- [#35](https://github.com/Abubakarstu/gentech/issues/35) — `enhancement, integration, blocked` — BenefitPay for Bahrain checkout.
- [#36](https://github.com/Abubakarstu/gentech/issues/36) — `enhancement, integration, blocked` — JazzCash and Easypaisa for Pakistan checkout.
- [#37](https://github.com/Abubakarstu/gentech/issues/37) — `security, enhancement, blocked` — private dealer document storage and upload flow.
- [#38](https://github.com/Abubakarstu/gentech/issues/38) — `bug, localization, qa` — recheck `/bh/ar` and localized child routes after deployment.
- [#39](https://github.com/Abubakarstu/gentech/issues/39) — `refactor, good first issue` — reduce remaining ESLint warnings to zero.
- [#40](https://github.com/Abubakarstu/gentech/issues/40) — `enhancement, blocked` — investigate SF3D fixed 512px image-size limitation.
- [#41](https://github.com/Abubakarstu/gentech/issues/41) — `test, good first issue` — regression coverage for the previous-comparison history branch.

## Issue hygiene

- Issue #9 was closed as completed after confirming `main` contains the progress checklist and one-by-one status list.
- Labels applied to earlier issues: #8 `legal, blocked`; #10–#16 `documentation`; #17–#23 `bug, qa`; #24 `bug, qa`; #25 `bug, devops`; #26 `bug, localization, qa`; #27 `enhancement, localization`; #28 `refactor, good first issue`; #29 `devops, test`; #30 `documentation, devops`.
- Available repository labels now include `bug`, `documentation`, `enhancement`, `good first issue`, `help wanted`, `security`, `devops`, `test`, `refactor`, `localization`, `integration`, `legal`, `blocked`, and `qa`.
