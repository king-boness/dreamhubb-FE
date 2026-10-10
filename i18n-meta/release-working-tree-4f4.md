# Release working-tree control — 4F.4

**No commit / push / cleanup performed.**

## Counts

| Repo | Dirty | Modified | Untracked | Deleted |
|------|------:|---------:|----------:|--------:|
| dreamhubb-FE | 336 | 170 | 163 | 3 |
| dreamhubb-BE | 45 | 19 | 26 | 0 |

## Classification guidance

### Needed for EN/SK release (BE)
- Controllers (Auth, Post, User, Notification, Contribution, Earn, …)
- `NotificationLocalizer`, `UserLocale`, `lang/en|sk/*`
- `preferred_locale` migration
- AuthServiceProvider mail locale
- Tests validating release behavior

### Needed for EN/SK release (FE)
- i18n packs (esp. en-US, sk), locale runtime
- Onboarding / auth / notifications / settings language
- Legal pages + `legalDocuments.ts` (meta only)
- E2E specs for release regression

### Test-only / local
- `i18n-meta/packages/*` large export/import workpackages (many)
- `.tmp-uk/*`, apply logs
- E2E helper scripts; `dreamhubb_e2e` fixtures under `/tmp`
- Local `.env` — **do not commit secrets**

### Must not publish
- `.env` / credentials
- Generated agent temp dumps

### VERSIONED RELEASE ARTIFACT
**NOT READY** — candidate exists only as dirty working trees on known HEADs; no frozen release commit SHA.
