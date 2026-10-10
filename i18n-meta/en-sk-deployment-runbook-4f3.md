# EN/SK Deployment Runbook (4F.3) — PREPARE ONLY

**Do not execute this runbook in this phase.**  
Local rehearsals used only `dreamhubb_e2e`.

## PRE-DEPLOY

1. **Backups** — full DB backup + verify restore procedure; export current `users` sample for `preferred_locale` nullability check.
2. **Migration verification** — confirm on staging clone: `2026_10_10_120000_add_preferred_locale_to_users_table` up; column `varchar` nullable, default null; existing users remain readable.
3. **Optional jobs table** — only if production will use `QUEUE_CONNECTION=database`; apply `2026_10_10_180000_create_jobs_table_for_local_queue` (or standard Laravel jobs migration). Skip if Redis/SQS already in use.
4. **FE build** — `npm run i18n:check` (0 errors), `npm run build`.
5. **BE tests** — targeted locale/auth/token suite green; resolve or waive legacy Moderation/UnreadCount failures.
6. **Environment validation**
   - `APP_ENV` / `APP_DEBUG` production-safe
   - Mail driver real SMTP only after approval
   - `JWT_TTL` production value unchanged by this track
   - `RATE_LIMITER_*` must NOT be `disabled` in production (bypass is local/testing only)
   - `AUTH_REQUIRE_EMAIL_VERIFICATION` per product policy
7. **Queue configuration** — worker uses same code as web; mail templates locale via explicit args (AuthServiceProvider).
8. **Legal approval gate** — Terms/Privacy EN + SK decision recorded; do not ship SK as fully localized legal without approval.
9. **Feature compatibility** — FE `release/1.0.0` working tree + BE `main` working tree must be the paired release set (commit SHAs once frozen).

## DEPLOY ORDER (dependency-derived)

1. **Database preparation** — apply `preferred_locale` migration (backward compatible; nullable).
2. **Backend compatibility** — deploy BE that reads/writes `preferred_locale` and returns localized messages (older FE still works with Accept-Language).
3. **Queue compatibility** — restart/deploy workers with new BE code before relying on localized mail.
4. **Frontend deployment** — deploy FE build that sends `preferred_locale` / language Save.
5. **Post-deploy smoke** — see below.

Rationale: column-first avoids FE writing unknown column; BE-before-FE avoids FE calling APIs that 500 on missing column; workers must match mail builders.

## POST-DEPLOY SMOKE

- [ ] Login EN + SK
- [ ] Registration (test account) + preferred_locale persisted
- [ ] Feed load
- [ ] Create Post (donee) with sufficient tokens
- [ ] Help/contribution
- [ ] Notifications list titles switch with Accept-Language
- [ ] Tokens / Earn titles EN + SK
- [ ] Language Save EN→SK→EN without logout
- [ ] Email verification (staging sink) subject locale
- [ ] Password reset (staging sink) subject locale
- [ ] Monitoring: 5xx rate, queue failed_jobs, auth 429 spikes

## ROLLBACK

| Layer | Action | Notes |
|-------|--------|-------|
| FE | Redeploy previous static build | Safe; older FE ignores preferred_locale write |
| BE | Redeploy previous release | Localized `__()` messages revert; API shapes additive |
| DB | Prefer **keep** `preferred_locale` column | Dropping column loses preferences; only roll back if emergency and column unused |
| Queue | Restart workers on rolled-back BE | Drain/retry failed_jobs carefully |
| Data | Preserve user rows | Do not truncate |

## CRITICAL

- No production migration or deploy was executed in 4F.3.
- Production `preferred_locale` state remains UNKNOWN until verified.
