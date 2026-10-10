# 4F.4 – Legal, Product & Final Release Gates

**Generated:** 2026-10-10  
**Deployment:** NOT PERFORMED  
**Legal approval:** NOT READY  
**Product approval:** OPEN  
**Versioned release artifact:** NOT READY (dirty working trees)

## Baseline

| | FE | BE |
|--|----|----|
| Branch | `release/1.0.0` | `main` |
| HEAD | `1a67b3d870e7a2f405fa6c7a8576d8486f2c246c` | `448295132c000c88324bf77079d8a6287e149130` |
| Dirty | 336 (170 M, 163 ??, 3 D) | 45 (19 M, 26 ??) |
| Prod SHA | UNKNOWN | UNKNOWN |

4F.3 artifacts present and consistent with current code paths.

## PHPUnit (both former failures)

| Test | Classification | Evidence | Fix |
|------|----------------|----------|-----|
| `NotificationsUnreadCountTest::unread_count_endpoint_returns_200_with_int` | **TEST BUG** (legacy at HEAD) | HEAD test omitted `location_*` NOT NULL cols; identical failure at committed HEAD | Added location + tokens fields |
| `ModerationComplianceTest::post_create_rejects_blocked_terms` | **TEST BUG** (legacy at HEAD) | HEAD `createPost` already requires `tokens`; test payload lacked it | Added `tokens: 3` so moderation path reached |

**Full suite:** **144/144 PASS** (608 assertions).

## Pure-browser onboarding

`e2e/pure-browser-onboarding.spec.ts` + `e2e/helpers/onboarding-ui.ts`  
**11/11 PASS** — donor/donee × en-US/sk, DOB wheel, validations, duplicate email block, 4 viewports, XSS probe.  
No API register shortcut for success path.

## Notification XSS

- FE `NotificationComponent.vue`: `{{ displayTitle }}` / `{{ displayText }}` — **no v-html**
- BE localizer does not escape (JSON) — **not XSS by itself**
- Browser probe + contract tests: HTML not executed

## Auth rate limiting

- Bypass only if `APP_ENV` ∈ {local,testing} **AND** `RATE_LIMITER_*=disabled`
- Production env alone cannot disable
- **Limits ON evidence:** curl wrong password → 429 on attempt 6; PHPUnit `AuthRateLimitEnabledTest` PASS
- E2E suite uses **cache:clear between tests** (not RATE_LIMITER disabled) — documented exception for fixture density

## Token integrity

| Path | Lock / safety |
|------|----------------|
| createPost | lockForUpdate (existing) |
| donate | lockForUpdate (4F.3) |
| post top-up | lockForUpdate (**4F.4**) |
| earn claim | lockForUpdate + unique claim |
| registration bonus | ledger idempotent |
| Stripe grant | code present; live prod UNKNOWN |

Economy unchanged. Concurrent donate + top-up PHPUnit PASS.

## Legal / Product

- Package: `legal-review-package-4f4.md` — **LEGAL_REVIEW_REQUIRED**, not LEGAL_APPROVED
- SK body: `not_available` + `englishOnlyNotice`
- Product pack: `product-decision-pack-4f4.md` — all owner decisions **OPEN**
- Blocking for staging claims: SK legal decision + language disclosure

## Localization / build

UI 59 · packs 58 · keys 859 · complete 15 · incomplete 43 · errors 0 · warnings 43 · tooling 49/49 · build PASS

## E2E stability (limits ON)

| Suite | Result |
|-------|--------|
| Pure-browser | 11/11 |
| Authenticated RUN 1–3 | **12/12 × 3** |

## Gates

| Gate | Status |
|------|--------|
| TECHNICAL_READINESS | READY WITH CONDITIONS |
| SECURITY_READINESS | READY WITH CONDITIONS |
| FUNCTIONAL_E2E | READY |
| LEGAL_APPROVAL | **NOT READY** |
| PRODUCT_APPROVAL | **OPEN** |
| DEPLOYMENT_APPROVAL | OPEN |
| STAGING_EVIDENCE | UNKNOWN |
| PRODUCTION_EVIDENCE | UNKNOWN |
| VERSIONED ARTIFACT | **NOT READY** |
| **OVERALL RELEASE** | **NOT READY** |
| **Proceed to 4F.5 Staging?** | **NO** — finish legal SK decision, product disclosure, freeze commits, verify prod preferred_locale |

## Staging prerequisites (before 4F.5)

1. Counsel decision on SK legal (EN+notice vs approved SK body)  
2. Product owner: official language disclosure  
3. Commit/freeze FE+BE release artifacts (SHAs)  
4. Confirm production `preferred_locale` migration state  
5. Staging deploy evidence under approved runbook  
