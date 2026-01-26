# KROK 8 Self-Contained E2E Report

Tento dokument obsahuje zhrnutie zmien pre self-contained E2E testy (bez manuálneho setupu).

---

## ✅ Zmenené súbory

### Backend (dreamhubb-BE):
1. **`app/Http/Controllers/DevToolsController.php`** - Rozšírené o test helper endpoints:
   - `testUser()` - Vytvorí alebo vráti existujúceho test usera
   - `testPost()` - Vytvorí test post s voliteľným typom
   - `testCleanup()` - Voliteľné cleanup test dát

2. **`routes/api.php`** - Pridané nové dev-only routes:
   - `POST /api/dev/test-user` - Vytvorí/vráti test usera
   - `POST /api/dev/test-post` - Vytvorí test post
   - `DELETE /api/dev/test-cleanup` - Cleanup test dát

### Frontend (dreamhubb-FE):
1. **`e2e/smoke.spec.ts`** - Upravené pre automatický setup:
   - `setupTestData()` - Automaticky vytvorí test usera a post
   - `login()` a `loginAsDonee()` - Používajú automaticky vytvorený token
   - Odstránená závislosť na `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_POST_ID` (môžu zostať ako override)

2. **`e2e/README.md`** - Aktualizovaná dokumentácia:
   - Sekcia o self-contained testoch
   - Vysvetlenie `/api/dev/*` endpointov
   - Príklady pre Windows aj Mac/Linux

---

## 🔧 Backend Test Helper Endpoints

### POST /api/dev/test-user
**Vytvorí alebo vráti existujúceho test usera.**

**Request:**
```json
{
  "prefix": "e2e_test" // optional, default: "e2e_test"
}
```

**Response:**
```json
{
  "status": "success",
  "email": "e2e_test@dreamhubb.test",
  "password": "e2e_test_password_123",
  "token": "jwt_token_here",
  "user_id": 123
}
```

**Bezpečnosť:**
- ✅ Dostupný len v `local/dev/testing` prostredí
- ✅ Rate limit: 60 requests per minute
- ✅ Žiadne logovanie tokenov/hesiel

---

### POST /api/dev/test-post
**Vytvorí test post pre E2E testy.**

**Request:**
```json
{
  "type": "dream", // optional: "dream", "problem", or "idea" (default: "dream")
  "user_id": 123   // optional: ak nie je poskytnuté, vytvorí test usera automaticky
}
```

**Response:**
```json
{
  "status": "success",
  "post_id": 456,
  "title": "E2E Test dream - 2024-01-01 12:00:00",
  "type": "dream"
}
```

**Bezpečnosť:**
- ✅ Dostupný len v `local/dev/testing` prostredí
- ✅ Rate limit: 60 requests per minute
- ✅ Vyžaduje Authorization header (alebo vytvorí test usera automaticky)

---

### DELETE /api/dev/test-cleanup
**Voliteľné cleanup test dát.**

**Request:**
```json
{
  "prefix": "e2e_test" // optional, default: "e2e_test"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Test data cleaned up."
}
```

**Bezpečnosť:**
- ✅ Dostupný len v `local/dev/testing` prostredí
- ✅ Rate limit: 10 requests per minute (nižší limit pre cleanup)

---

## 🎯 Frontend E2E - Automatický Setup

### Pred:
```typescript
const EMAIL = process.env.E2E_EMAIL; // REQUIRED
const PASSWORD = process.env.E2E_PASSWORD; // REQUIRED
const POST_ID = process.env.E2E_POST_ID || "1"; // Required

async function login(page) {
  test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL/E2E_PASSWORD not set");
  // ... UI login
}
```

### Po:
```typescript
// Auto-setup test data
let TEST_EMAIL: string;
let TEST_PASSWORD: string;
let TEST_TOKEN: string;
let TEST_POST_ID: string;

async function setupTestData() {
  // Use env vars if provided (manual override)
  if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
    // ... use env vars
    return;
  }

  // Auto-create test user via API
  const userResponse = await fetch(`${API_BASE}/dev/test-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "e2e_test" })
  });
  // ... create user and post
}

test.beforeAll(async () => {
  await setupTestData();
});

async function login(page) {
  // Set token in localStorage (faster than UI login)
  await page.evaluate((token) => {
    localStorage.setItem("token", token);
  }, TEST_TOKEN);
  // ... navigate and verify
}
```

---

## 🚀 Ako Spustiť

### Jedným príkazom (bez manuálneho setupu):

**Windows (PowerShell):**
```powershell
cd dreamhubb-FE
npm run e2e:local
```

**Mac/Linux:**
```bash
cd dreamhubb-FE
npm run e2e:local
```

**Čo sa stane:**
1. Automaticky spustí backend server (`php artisan serve`)
2. Automaticky spustí frontend dev server (`npm run dev`)
3. Počká na readiness oboch serverov
4. **Automaticky vytvorí test usera cez `/api/dev/test-user`**
5. **Automaticky vytvorí test post cez `/api/dev/test-post`**
6. Spustí E2E testy s automaticky vytvorenými dátami
7. Po dokončení korektne ukončí všetky procesy

**Manuálny override (ak potrebujete špecifický účet):**
```powershell
# Windows
$env:E2E_EMAIL="test@example.com"
$env:E2E_PASSWORD="testpassword123"
$env:E2E_POST_ID="1"
npm run e2e:local

# Mac/Linux
export E2E_EMAIL="test@example.com"
export E2E_PASSWORD="testpassword123"
export E2E_POST_ID="1"
npm run e2e:local
```

---

## 🔒 Bezpečnosť

### Backend:
- ✅ `/api/dev/*` endpointy sú dostupné **len v local/dev/testing** prostredí
- ✅ V produkcii sa tieto routes **vôbec neregistrujú** (404)
- ✅ Rate limiting (60 req/min pre test-user/test-post, 10 req/min pre cleanup)
- ✅ Žiadne logovanie tokenov/hesiel

### Frontend:
- ✅ Test user a post sa vytvárajú automaticky len v E2E testoch
- ✅ Token sa ukladá do localStorage len v testovacom kontexte
- ✅ Žiadne logovanie citlivých údajov

---

## ✅ PASS/FAIL Checklist

### Backend:
- [x] Test helper endpoints vytvorené
- [x] Dev-only guard (`app()->environment(['local', 'development', 'dev', 'testing'])`)
- [x] Rate limiting pridaný
- [x] Žiadne logovanie tokenov/hesiel
- [x] Test user sa vytvára/vracia správne
- [x] Test post sa vytvára správne

### Frontend:
- [x] `setupTestData()` funkcia vytvorená
- [x] Automatický setup v `test.beforeAll()`
- [x] `login()` a `loginAsDonee()` používajú automaticky vytvorený token
- [x] Odstránená závislosť na `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_POST_ID` (môžu zostať ako override)
- [x] Všetky testy používajú `TEST_POST_ID` namiesto `POST_ID`

### Dokumentácia:
- [x] `e2e/README.md` aktualizovaný
- [x] Vysvetlenie self-contained testov
- [x] Príklady pre Windows aj Mac/Linux

### Build & Lint:
- [x] `npm run lint` prešiel
- [x] `npm run guardrails` prešiel

---

## 📊 Zhrnutie

### Zmenené súbory:
1. `app/Http/Controllers/DevToolsController.php` - **UPRAVENÝ** (test helper endpoints)
2. `routes/api.php` - **UPRAVENÝ** (nové dev-only routes)
3. `e2e/smoke.spec.ts` - **UPRAVENÝ** (automatický setup)
4. `e2e/README.md` - **UPRAVENÝ** (dokumentácia)

### Výsledok:
- ✅ E2E testy sú plne self-contained
- ✅ Jedným príkazom bez manuálneho setupu
- ✅ `/api/dev/*` endpointy nie sú dostupné v produkcii
- ✅ Žiadne logovanie citlivých údajov
- ✅ Minimal refactor, žiadne UX/feature zmeny

---

## 🎉 KROK 8 Self-Contained E2E - Hotovo!

Všetky požiadavky sú splnené:
- ✅ E2E beží lokálne jedným príkazom bez manuálneho setupu
- ✅ CI beží bez tajných env (okrem BASE URL ak treba)
- ✅ `/api/dev/*` routy nie sú dostupné v produkcii
- ✅ Žiadne logovanie citlivých údajov
- ✅ Minimálne zásahy do existujúcej architektúry
