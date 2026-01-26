# KROK 8 Release Runbook

Tento dokument obsahuje inštrukcie pre release KROK 8 (Notifications, Errors & Edge Cases).

---

## 🚀 Pre-Release Kontroly

### 1. Spustenie Preflight

**Windows (PowerShell):**
```powershell
cd dreamhubb-FE
npm run preflight
```

**Mac/Linux:**
```bash
cd dreamhubb-FE
npm run preflight
```

**Čo kontroluje:**
- `npm run lint` - ESLint kontroly
- `npm run build` - Production build
- `npm run guardrails` - Zakázané patterny (Notify.create, console.*, token logging)
- `npm run test:e2e` - E2E testy (ak sú servery pripravené)
- `npm run test:e2e:release` - E2E testy proti production buildu (ak sú servery pripravené)

**Očakávaný výsledok:** Všetky kroky musia prejsť (OK).

---

### 2. Spustenie E2E Testov (Dev Prostredie)

**Windows (PowerShell):**
```powershell
cd dreamhubb-FE
$env:E2E_EMAIL="test@example.com"
$env:E2E_PASSWORD="testpassword123"
npm run e2e:local
```

**Mac/Linux:**
```bash
cd dreamhubb-FE
export E2E_EMAIL="test@example.com"
export E2E_PASSWORD="testpassword123"
npm run e2e:local
```

**Čo robí:**
- Automaticky spustí backend server (`php artisan serve`)
- Automaticky spustí frontend dev server (`npm run dev`)
- Počká na readiness oboch serverov
- Spustí E2E testy
- Po dokončení korektne ukončí všetky procesy

**Očakávaný výsledok:** Všetky E2E testy musia prejsť.

---

### 3. Spustenie E2E Testov (Production Build)

**Windows (PowerShell):**
```powershell
cd dreamhubb-FE
$env:E2E_EMAIL="test@example.com"
$env:E2E_PASSWORD="testpassword123"
npm run e2e:release
```

**Mac/Linux:**
```bash
cd dreamhubb-FE
export E2E_EMAIL="test@example.com"
export E2E_PASSWORD="testpassword123"
npm run e2e:release
```

**Čo robí:**
- Zbuildí frontend pre produkciu (`npm run build`)
- Spustí frontend production server (`npx serve`)
- Spustí backend server (`php artisan serve`)
- Počká na readiness oboch serverov
- Spustí E2E testy proti production buildu
- Po dokončení korektne ukončí všetky procesy

**Očakávaný výsledok:** Všetky E2E testy musia prejsť.

---

## ⚠️ Najčastejšie Problémy

### 1. Server Readiness Fail

**Príznaky:**
```
❌ Backend not ready at http://localhost:8000/api/health
❌ Frontend not ready at http://localhost:9000/
```

**Príčiny:**
- Backend server nie je spustený (`php artisan serve`)
- Frontend server nie je spustený (`npm run dev`)
- Porty sú obsadené iným procesom
- Backend/Frontend sa ešte načítavajú (potrebujú viac času)

**Riešenie:**
1. Skontroluj, či servery bežia:
   ```bash
   # Backend
   cd dreamhubb-BE
   php artisan serve
   
   # Frontend (v novom termináli)
   cd dreamhubb-FE
   npm run dev
   ```

2. Skontroluj, či porty nie sú obsadené:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   netstat -ano | findstr :9000
   
   # Mac/Linux
   lsof -i :8000
   lsof -i :9000
   ```

3. Ak sú porty obsadené, buď ukonči proces alebo zmeň porty v `.env` súbore.

4. Počkaj na úplné načítanie serverov (môže trvať 10-30 sekúnd).

---

### 2. Environment Premenné Chýbajú

**Príznaky:**
```
⚠️  E2E_EMAIL or E2E_PASSWORD not set. Tests may be skipped.
```

**Riešenie:**
1. Nastav environment premenné:
   ```bash
   # Windows (PowerShell)
   $env:E2E_EMAIL="test@example.com"
   $env:E2E_PASSWORD="testpassword123"
   
   # Mac/Linux
   export E2E_EMAIL="test@example.com"
   export E2E_PASSWORD="testpassword123"
   ```

2. Alebo vytvor `.env.e2e` súbor (skopíruj z `.env.example.e2e`):
   ```bash
   cp .env.example.e2e .env.e2e
   # Vyplň hodnoty v .env.e2e
   ```

---

### 3. Porty Sú Obsadené

**Príznaky:**
```
Error: listen EADDRINUSE: address already in use :8000
Error: listen EADDRINUSE: address already in use :9000
```

**Riešenie:**
1. Nájdite proces, ktorý používa port:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -i :8000
   kill -9 <PID>
   ```

2. Alebo zmeňte porty v `.env` súbore:
   ```env
   E2E_BASE_URL=http://localhost:9001
   E2E_API_BASE=http://localhost:8001/api
   ```

---

### 4. Flaky E2E Testy

**Príznaky:**
- Testy občas zlyhajú, občas prejdú
- Timeout errors
- Element not found errors

**Riešenie:**
1. Skontroluj, či servery sú plne pripravené (čakaj 10-30 sekúnd po spustení).

2. Skontroluj, či testovacie dáta existujú (testovací účet, posty).

3. Spusti testy viackrát:
   ```bash
   npm run test:e2e -- --retries=3
   ```

4. Skontroluj Playwright reporty:
   ```bash
   npx playwright show-report
   ```

5. Ak problém pretrváva, skontroluj `e2e/smoke.spec.ts` - možno potrebuje úpravu timeoutov.

---

## 🛑 STOP Ship Kritériá

**NIKDY nešli do produkcie, ak:**

### 1. Raw Error Texty v UI
- ❌ "Unauthorized", "ERR_NETWORK", "ERR_BAD_REQUEST", "AxiosError"
- ❌ Laravel stacktrace
- ❌ Raw axios error messages
- ✅ **MUSÍ BYŤ:** i18n kľúče (napr. "common.errors.sessionExpired")

**Ako overiť:**
- Spusti E2E testy a skontroluj screenshots
- Manuálne otestuj error scenáre (offline, 500, 401, 422, 429)
- Skontroluj DevTools Console - žiadne raw error stringy v DOM

---

### 2. Token/Password/Authorization Logging
- ❌ `console.log(token)`, `console.log(password)`, `console.log(authorization)`
- ❌ Logovanie Authorization headerov
- ✅ **MUSÍ BYŤ:** Žiadne logovanie citlivých údajov (ani v DEV)

**Ako overiť:**
```bash
npm run guardrails
```
Musí prejsť bez chýb.

---

### 3. Refresh Loop
- ❌ Nekonečný refresh token loop
- ❌ Viacero paralelných refresh requestov
- ❌ Refresh sa spúšťa pre auth endpointy (`/login`, `/register`, `/refresh`)
- ✅ **MUSÍ BYŤ:** Single-flight refresh, auth endpoint protection

**Ako overiť:**
- Spusti E2E test "token refresh storm"
- Manuálne: Nastav invalid token, spusti 2 paralelné requesty, over že nedôjde k loopu
- Skontroluj Network tab v DevTools - žiadne nekonečné refresh requesty

---

### 4. Stuck Loading
- ❌ UI zostane v loading state po chybe
- ❌ Tlačidlá zostanú disabled po chybe
- ❌ Spinner sa nezastaví po chybe
- ✅ **MUSÍ BYŤ:** Loading flags sa vždy vyčistia, UI je interaktívne po chybe

**Ako overiť:**
- Spusti E2E test "upload fail" a "500 error"
- Manuálne: Vyvolaj error (offline, 500), over že UI nie je stuck
- Skontroluj, či Retry tlačidlá sú enabled a klikateľné

---

### 5. Offline Bez Banneru
- ❌ Offline stav bez OfflineBanner
- ❌ Offline bez Retry možnosti
- ✅ **MUSÍ BYŤ:** OfflineBanner sa vždy zobrazí pri offline stave

**Ako overiť:**
- Spusti E2E test "offline→online recovery"
- Manuálne: DevTools → Network → Offline, over OfflineBanner
- Skontroluj, či Retry tlačidlo funguje

---

## 🔧 Čo Robiť Pri Failoch

### Preflight Fail

1. **Lint Fail:**
   ```bash
   npm run lint
   # Oprav chyby podľa ESLint výstupu
   ```

2. **Build Fail:**
   ```bash
   npm run build
   # Oprav chyby podľa build výstupu
   ```

3. **Guardrails Fail:**
   ```bash
   npm run guardrails
   # Oprav zakázané patterny (Notify.create, console.*, token logging)
   ```

4. **E2E Fail (Server Readiness):**
   - Spusti servery manuálne
   - Skontroluj porty
   - Počkaj na readiness

5. **E2E Fail (Testy):**
   - Skontroluj Playwright reporty
   - Over testovacie dáta
   - Skontroluj environment premenné

---

### E2E Test Fail

1. **Skontroluj Playwright reporty:**
   ```bash
   npx playwright show-report
   ```

2. **Skontroluj screenshots/videos:**
   - `test-results/` adresár
   - Screenshots pri failoch
   - Videos pri failoch
   - Traces pri failoch

3. **Skontroluj environment premenné:**
   ```bash
   # Windows
   $env:E2E_EMAIL
   $env:E2E_PASSWORD
   
   # Mac/Linux
   echo $E2E_EMAIL
   echo $E2E_PASSWORD
   ```

4. **Skontroluj testovacie dáta:**
   - Testovací účet existuje?
   - Posty existujú?
   - Backend je pripravený?

5. **Spusti testy s debug módom:**
   ```bash
   npx playwright test --debug
   ```

---

## ✅ Release Checklist

Pred releaseom skontroluj:

- [ ] `npm run preflight` prešiel bez chýb
- [ ] `npm run e2e:local` prešiel bez chýb
- [ ] `npm run e2e:release` prešiel bez chýb
- [ ] Žiadne raw error texty v UI (manuálne test)
- [ ] Žiadne token/password logging (`npm run guardrails`)
- [ ] Žiadny refresh loop (E2E test + manuálne)
- [ ] Žiadne stuck loading (E2E test + manuálne)
- [ ] Offline banner funguje (E2E test + manuálne)
- [ ] Dev-only routes nie sú v production build
- [ ] Dokumentácia je aktualizovaná

---

## 📚 Súvisiace Dokumenty

- `docs/KROK8-FINAL-SANITY.md` - Finálny sanity pass report
- `docs/KROK8-AUTOMATION-REPORT.md` - Automation & hardening report
- `e2e/README.md` - E2E testy dokumentácia
- `docs/KROK8-QA.md` - Manuálny QA checklist
