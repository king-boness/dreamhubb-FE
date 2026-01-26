# CHANGELOG - KROK 8: Notifications, Errors & Edge Cases

## 📋 Prehľad

KROK 8 implementuje unified error handling systém, bezpečné notifikácie, offline handling a robustné edge case scenáre pre dreamhubb aplikáciu.

**Dátum dokončenia:** 2024

---

## 🎯 Hlavné zmeny

### 1. Unified Error Handling

**Čo sa zmenilo:**
- Všetky error toasty idú cez unified wrapper (`notifyError`, `notifySuccess`, `notifyInfo`)
- Error mapper (`mapAxiosErrorToDhError`) konvertuje AxiosError → DhError s i18n keys
- Žiadne raw error texty v UI ("Unauthorized", "ERR_NETWORK", "500", atď.)

**Kľúčové súbory:**
- `src/utils/httpError.ts` - Error mapper a DhError interface
- `src/utils/notify.ts` - Unified notify wrappers s anti-duplication
- `src/boot/axios.ts` - Axios interceptors pre unified error handling

**Ako testovať:**
- Otvorte `/__dev/qa` (len v DEV) a kliknite "Trigger 500/403/429/422"
- Overte, že toasty obsahujú safe i18n texty (nie raw error strings)

---

### 2. Offline Handling & Retry UI

**Čo sa zmenilo:**
- `OfflineBanner` komponent sa zobrazuje pri offline stave
- Zdieľaný `RetryPanel` komponent pre error states
- Retry UI na všetkých kritických stránkach (posts, notifications, post detail)

**Kľúčové súbory:**
- `src/components/common/RetryPanel.vue` - Zdieľaný Retry UI komponent
- `src/components/common/OfflineBanner.vue` - Offline banner (ak existuje)
- `src/stores/network.ts` - Network state management

**Ako testovať:**
- DevTools → Network → Throttling: Offline
- Obnovte stránku alebo prekliknite medzi tabmi
- Overte OfflineBanner + Retry button
- Nastavte Online → kliknite Retry → overte, že stránka sa načíta

---

### 3. Guardrails proti regresiám

**Čo sa zmenilo:**
- Grep gate script kontroluje zakázané patterny
- CI workflow failne, ak sa objavia priame `Notify.create` / `$q.notify` volania
- CI workflow failne, ak sa objavia `console.log/warn/error` bez DEV guard-u

**Kľúčové súbory:**
- `scripts/guardrails-check.js` - Statická kontrola zakázaných patternov
- `.github/workflows/ci.yml` - CI gate pre guardrails
- `package.json` - `npm run guardrails` script

**Ako testovať:**
```bash
npm run guardrails
```

**Povolené:**
- `Notify.create` v `src/utils/notify.ts` (wrapper)
- `console.debug` v `import.meta.env.DEV` bloku

**Zakázané:**
- Priame `Notify.create` / `$q.notify` mimo wrappera
- `console.log/warn/error` bez DEV guard-u

---

### 4. Token Refresh & Single-Flight

**Čo sa zmenilo:**
- Single-flight refresh token mechanism (žiadne refresh loops)
- Silent logout pri expired/invalid token
- Redirect na `/login` bez spam toastov

**Kľúčové súbory:**
- `src/boot/axios.ts` - Refresh token interceptor
- `src/stores/auth.ts` - Auth state management

**Ako testovať:**
- DevTools → Application → Local Storage → zmeňte `token` na `"invalid"`
- Obnovte stránku → overte redirect na `/login` + max 1-2 toasty

---

### 5. i18n Error & Success Messages

**Čo sa zmenilo:**
- Všetky error/success messages používajú i18n keys
- Fallback messages pre chýbajúce preklady
- EN + SK preklady pre všetky error scenáre

**Kľúčové súbory:**
- `src/i18n/en-US/common.ts` - EN error/success messages
- `src/i18n/sk/common.ts` - SK error/success messages
- `src/utils/i18nGlobal.ts` - Global i18n helper

**Ako testovať:**
- Zmeňte jazyk aplikácie (EN ↔ SK)
- Vyvolajte error (offline, 500, 422, atď.)
- Overte, že toasty sú v správnom jazyku

---

### 6. Dev-Only Features

**Čo sa zmenilo:**
- FE route `/__dev/qa` existuje len v DEV buildoch
- BE endpoints `/api/dev/*` dostupné len v local/dev/testing
- V produkcii sa tieto route vôbec neregistrujú (404)

**Kľúčové súbory:**
- `src/router/routes.ts` - Conditional route registration
- `routes/api.php` (BE) - Environment-based route registration

**Ako testovať:**
- V DEV: `/__dev/qa` funguje
- V PROD build: `/__dev/qa` → 404

---

### 7. E2E Test Coverage

**Čo sa zmenilo:**
- Playwright smoke testy pokrývajú donee flow + edge cases
- Testy pre offline→online recovery
- Testy pre parallel 401 refresh sanity
- Testy pre upload/share/reply fail scenáre

**Kľúčové súbory:**
- `e2e/smoke.spec.ts` - E2E test suite
- `playwright.config.ts` - Playwright konfigurácia

**Ako testovať:**
```bash
# Lokálne
npm run test:e2e

# Proti production buildu
npm run test:e2e:release
```

---

## 📁 Zoznam upravených súborov

### Frontend

**Core:**
- `src/utils/httpError.ts` - Error mapper
- `src/utils/notify.ts` - Unified notify wrappers
- `src/utils/i18nGlobal.ts` - Global i18n helper
- `src/boot/axios.ts` - Axios interceptors
- `src/boot/auth.ts` - Auth boot logic

**Komponenty:**
- `src/components/common/RetryPanel.vue` - Zdieľaný Retry UI
- `src/components/common/OfflineBanner.vue` - Offline banner (ak existuje)

**Stránky (Retry UI refactor):**
- `src/pages/DonorPages/PostsPage.vue`
- `src/pages/DonorPages/NotificationsPage.vue`
- `src/pages/DonorPages/HelpPage.vue`
- `src/pages/DoneePages/PostPage.vue`
- `src/pages/DoneePages/TopDreamPage.vue`

**Stores (console cleanup):**
- `src/stores/preferences.ts`
- `src/stores/user-store.ts`
- `src/stores/api-calls-store.ts`
- `src/composables/useGeolocation.ts`

**i18n:**
- `src/i18n/en-US/common.ts` - EN messages
- `src/i18n/sk/common.ts` - SK messages

**Scripts:**
- `scripts/guardrails-check.js` - Guardrails gate
- `scripts/release-smoke.js` - Release-mode E2E

**Config:**
- `package.json` - Nové scripts
- `.eslintrc.js` - ESLint pravidlá
- `playwright.config.ts` - Playwright config

**E2E:**
- `e2e/smoke.spec.ts` - E2E test suite
- `e2e/README.md` - E2E dokumentácia

**Dokumentácia:**
- `docs/qa-krok8.md` - Manuálny QA checklist

### Backend

**Routes:**
- `routes/api.php` - Dev-only endpoints

**CI/CD:**
- `.github/workflows/ci.yml` - CI workflow s guardrails

---

## 🧪 Ako testovať

### Lokálne testovanie

1. **Guardrails check:**
   ```bash
   cd dreamhubb-FE
   npm run guardrails
   ```

2. **Lint + Build:**
   ```bash
   npm run lint
   npm run build
   ```

3. **E2E testy (dev server):**
   ```bash
   # Spustite backend
   cd dreamhubb-BE
   php artisan serve

   # Spustite frontend
   cd dreamhubb-FE
   npm run dev

   # Spustite E2E testy (v novom termináli)
   cd dreamhubb-FE
   $env:E2E_EMAIL="test@example.com"
   $env:E2E_PASSWORD="testpassword"
   $env:E2E_POST_ID="1"
   npm run test:e2e
   ```

4. **E2E testy (production build):**
   ```bash
   cd dreamhubb-FE
   npm run test:e2e:release
   ```

5. **Manuálne QA:**
   - Otvorte `docs/qa-krok8.md`
   - Postupujte podľa 15-minútového checklistu

### CI/CD

CI workflow automaticky:
1. ✅ Spustí `npm run lint`
2. ✅ Spustí `npm run guardrails`
3. ✅ Spustí `npm run build`
4. ✅ Spustí E2E testy proti dev serveru

---

## 🚨 Dôležité poznámky

### Pre developérov

- **NIKDY** nepoužívajte priame `Notify.create` / `$q.notify` - vždy použite wrappery
- **NIKDY** nepoužívajte `console.log/warn/error` bez DEV guard-u
- **VŽDY** použite `notifyError(mapAxiosErrorToDhError(error))` pre error toasty
- **VŽDY** použite `notifySuccess({ key: 'common.success....' })` pre success toasty
- **VŽDY** použite `console.debug` v `import.meta.env.DEV` bloku pre debug logging

### Pre QA

- Všetky error scenáre by mali zobrazovať **safe i18n texty** (nie raw error strings)
- Offline scenáre by mali zobrazovať **OfflineBanner + Retry button**
- Invalid token by mal spôsobiť **silent logout + redirect** (nie spam toastov)
- **Žiadne tokeny ani PII** by sa nemali logovať do konzoly

### Pre release

- Pred release spustite `npm run test:e2e:release` (testuje production build)
- Overte, že `/__dev/qa` route nie je dostupná v production buildu
- Overte, že BE `/api/dev/*` endpoints vracajú 404 v produkcii

---

## 📚 Súvisiace dokumenty

- `e2e/README.md` - E2E testy dokumentácia
- `docs/qa-krok8.md` - Manuálny QA checklist
- `src/utils/notify.ts` - Unified notify wrappers
- `src/utils/httpError.ts` - Error mapper

---

## ✅ KROK 8 DoD Checklist

- [x] Unified error mapper (`mapAxiosErrorToDhError`)
- [x] Unified notify wrappers (`notifyError`, `notifySuccess`, `notifyInfo`)
- [x] Offline handling (`OfflineBanner` + Retry UI)
- [x] Zdieľaný `RetryPanel` komponent
- [x] Single-flight refresh token mechanism
- [x] Silent logout pri expired token
- [x] i18n error/success messages (EN + SK)
- [x] Dev-only routes/endpoints (FE + BE)
- [x] Guardrails proti regresiám (grep gate + CI)
- [x] E2E test coverage (donee flow + edge cases)
- [x] Release-mode smoke script
- [x] Dokumentácia (QA checklist + changelog)

---

**KROK 8 je 100% uzavretý a pripravený na release.** 🎉
