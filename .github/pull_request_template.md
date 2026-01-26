## Description
<!-- Popíšte zmeny v tomto PR -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] Other (specify): ___________

## KROK 8 Regression Checks
<!-- ⚠️ DÔLEŽITÉ: Tieto checkboxy musia byť zaškrtnuté pred merge -->

### Automated Checks
- [ ] `npm run preflight` prešiel (lint + build + guardrails + unit tests + prod-safety-check + e2e)
- [ ] `npm run test:e2e:release` prešiel (E2E proti production build)
- [ ] Guardrails check prešiel (žiadne priame Notify.create / console.log bez DEV guardu)

### Manual Smoke Test (10 min)
<!-- Postupujte podľa `docs/KROK8-QA.md` alebo `RELEASE_SMOKE_10MIN.md` -->

- [ ] **Offline → Online Recovery:**
  - [ ] Donee feed: offline → banner + Retry → online → Retry funguje
  - [ ] Donor feed: offline → banner + Retry → online → Retry funguje
  - [ ] Post detail: offline → banner + Retry → online → Retry funguje
  - [ ] Notifications: offline → banner + Retry → online → Retry funguje

- [ ] **Error States:**
  - [ ] 401 (expired token): safe toast + redirect /login (bez raw textov)
  - [ ] 403: safe toast (bez raw textov)
  - [ ] 422 (validation): safe i18n text (EN aj SK)
  - [ ] 429: safe toast + anti-duplication (žiadne spam toasty)
  - [ ] 500: safe toast + Retry UI kde má byť

- [ ] **Edge Cases:**
  - [ ] Slow 3G / timeout: UI nezamrzne, tlačidlá sa odblokujú
  - [ ] Expired token počas akcie (reply/topup/upload): safe toast + logout/redirect
  - [ ] Language switch počas error stavu: i18n kľúče fungujú (EN → SK)

### Verification
- [ ] Žiadne raw error texty v UI ("Unauthorized", "ERR_NETWORK", "ERR_BAD_REQUEST", Laravel stacktrace)
- [ ] Žiadne logovanie tokenov/passwords/authorization (ani v DEV konzole)
- [ ] Dev-only routy (`/_dev/qa`, `/api/dev/*`) nie sú dostupné v production build

## Testing
<!-- Ako ste testovali tieto zmeny? -->

- [ ] Lokálne testovanie
- [ ] E2E testy
- [ ] Manuálne QA

## Screenshots/Videos (if applicable)
<!-- Pridajte screenshoty/videá ak je to relevantné -->

## Checklist
- [ ] Kód je podľa coding standards
- [ ] Self-review vykonaný
- [ ] Komentáre pridané pre komplexnú logiku
- [ ] Dokumentácia aktualizovaná (ak je potrebné)
- [ ] Žiadne nové warnings/errors v konzole
- [ ] KROK 8 regression checks splnené (pozri vyššie)

## Related Issues
<!-- Link na related issues -->
Closes #__________
