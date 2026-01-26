# E2E Tests - Playwright

Tento adresár obsahuje end-to-end (E2E) testy pre Dreamhubb aplikáciu pomocou Playwright.

## 📋 Požiadavky

- Node.js 18+
- npm alebo yarn
- Backend server bežiaci na `http://localhost:8000` (alebo nastavený cez `E2E_API_BASE`)
- Frontend server bežiaci na `http://localhost:9000` (alebo nastavený cez `E2E_BASE_URL`)

## 🔧 Nastavenie

### 1. Inštalácia závislostí

```bash
cd dreamhubb-FE
npm install
```

### 2. Inštalácia Playwright

```bash
npx playwright install --with-deps chromium
```

### 3. Konfigurácia environment premenných

**E2E testy sú teraz self-contained!** Test user a post sa automaticky vytvárajú cez `/api/dev/*` endpointy.

**Voliteľné premenné (pre manuálny override):**
- `E2E_BASE_URL` - Frontend URL (default: `http://localhost:9000`)
- `E2E_API_BASE` - Backend API URL (default: `http://localhost:8000/api`)
- `E2E_EMAIL` - Testovací email (optional, auto-created if not set)
- `E2E_PASSWORD` - Testovacie heslo (optional, auto-created if not set)
- `E2E_POST_ID` - ID postu pre testy (optional, auto-created if not set)

**Windows (PowerShell):**
```powershell
# Automatický setup (odporúčané):
npm run e2e:local

# Alebo manuálny override (ak potrebujete špecifický účet):
$env:E2E_EMAIL="test@example.com"
$env:E2E_PASSWORD="testpassword123"
$env:E2E_POST_ID="1"
npm run e2e:local
```

**Mac/Linux:**
```bash
# Automatický setup (odporúčané):
npm run e2e:local

# Alebo manuálny override (ak potrebujete špecifický účet):
export E2E_EMAIL="test@example.com"
export E2E_PASSWORD="testpassword123"
export E2E_POST_ID="1"
npm run e2e:local
```

**⚠️ DÔLEŽITÉ:** 
- `/api/dev/*` endpointy existujú **len v local/dev/testing** prostredí (nie v produkcii)
- Test user a post sa automaticky vytvárajú na začiatku testov
- Nikdy nepoužívajte produkčné prihlasovacie údaje
- V CI/CD používajte automatický setup (bez env premenných)

## 🚀 Spustenie testov

### Lokálne spustenie

1. **Spustite backend server:**
   ```bash
   cd dreamhubb-BE
   php artisan serve
   # Server beží na http://localhost:8000
   ```

2. **Spustite frontend dev server:**
   ```bash
   cd dreamhubb-FE
   npm run dev
   # Server beží na http://localhost:9000
   ```

3. **Spustite E2E testy:**
   ```bash
   cd dreamhubb-FE
   npm run test:e2e
   ```

### Spustenie konkrétneho testu

```bash
npx playwright test e2e/smoke.spec.ts -g "donee"
```

### Spustenie v headed móde (s otvoreným prehliadačom)

```bash
npx playwright test --headed
```

### Spustenie v debug móde

```bash
npx playwright test --debug
```

## 📝 Testy

### Aktuálne pokrytie

- ✅ **Donor flow:** login → feed → post detail → notifications
- ✅ **Donee flow:** donee posts → post detail → error handling
- ✅ **Offline handling:** offline banner + Retry button
- ✅ **Error states:** 403, 422, 429, 500 → safe messages + Retry UI
- ✅ **Token refresh:** parallel requests → no refresh loop
- ✅ **Expired token:** silent logout + redirect

### Test scenáre

1. **smoke: login → donor feed → post detail → notifications**
   - Základný smoke test pre donor flow

2. **donee: open /donee/posts → verify page loads + Retry UI on error**
   - Overuje donee posts page a Retry UI pri chybe

3. **donee: post detail → navigate and verify Retry UI**
   - Overuje donee post detail a Retry UI

4. **offline: donee/posts → offline → OfflineBanner + Retry**
   - Test offline scenára pre donee

5. **offline: donor/posts → offline → OfflineBanner + Retry**
   - Test offline scenára pre donor

6. **422 validation: post creation (donee) → empty required field**
   - Test validácie pri vytváraní postu

7. **429/500/403: dev endpoints → safe text + Retry**
   - Test error handling cez dev endpointy

8. **token refresh storm: parallel requests → no refresh loop**
   - Test paralelných requestov a refresh token handling

9. **expired token: invalid token → redirect to /login**
   - Test expired token scenára

## 🔍 Debugging

### Artifacts (screenshots, videos, traces)

**Po zlyhaní testu sa automaticky uložia:**
- **Screenshots**: `test-results/` (len pri zlyhaní)
- **Videos**: `test-results/` (len pri zlyhaní)
- **Traces**: `test-results/` (len pri zlyhaní)
- **HTML Report**: `playwright-report/index.html` (vždy po dokončení testov)

**Lokálne spustenie:**
```bash
npm run test:e2e
# Artifacts sa uložia do:
# - test-results/ (screenshots, videos, traces)
# - playwright-report/ (HTML report)
```

**Zobrazenie HTML reportu:**
```bash
npx playwright show-report
# Alebo otvorte playwright-report/index.html v prehliadači
```

### Zobrazenie trace

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

**Poznámka:** Trace súbory obsahujú kompletný záznam testu (network requests, DOM snapshots, screenshots). Užitočné pre debugging komplexných scenárov.

## 🏗️ CI/CD

E2E testy sa automaticky spúšťajú v GitHub Actions workflow (`.github/workflows/ci.yml`).

**Poznámka:** V CI sa testy spúšťajú s `continue-on-error: true`, aby neblokovali build ak testy zlyhajú (napr. kvôli nestabilnému prostrediu).

## 📚 Ďalšie zdroje

- [Playwright dokumentácia](https://playwright.dev/)
- [Playwright best practices](https://playwright.dev/docs/best-practices)