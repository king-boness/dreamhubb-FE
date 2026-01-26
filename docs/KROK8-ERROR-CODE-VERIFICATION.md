# KROK 8 Error Code Verification Report

## ✅ Overenie Error Kódov (403, 404, 429, 500)

### 1. Error Mapper (`src/utils/httpError.ts`)

Všetky požadované error kódy sú správne mapované:

| HTTP Code | Error Kind | i18n Key | Retryable | Status |
|-----------|------------|----------|-----------|--------|
| **403** | `forbidden` | `common.errors.forbidden` | ❌ `false` | ✅ |
| **404** | `not_found` | `common.errors.notFound` | ❌ `false` | ✅ |
| **429** | `too_many_requests` | `common.errors.tooManyRequests` | ✅ `true` | ✅ |
| **500** | `server` | `common.errors.server` | ✅ `true` | ✅ |

**Poznámka:**
- 403 a 404 majú `retryable: false` (správne - forbidden a not found nie sú retryable)
- 429 a 500 majú `retryable: true` (správne - môžu byť retryable)

### 2. i18n Kľúče

Všetky kľúče existujú v **EN aj SK**:

#### EN (`src/i18n/en-US/common.ts`):
- ✅ `common.errors.forbidden`: "You don't have permission to do that."
- ✅ `common.errors.notFound`: "Content not found."
- ✅ `common.errors.tooManyRequests`: "Too many requests. Try again later."
- ✅ `common.errors.server`: "Something went wrong. Please try again."

#### SK (`src/i18n/sk/common.ts`):
- ✅ `common.errors.forbidden`: "Na túto akciu nemáš oprávnenie."
- ✅ `common.errors.notFound`: "Obsah sa nenašiel."
- ✅ `common.errors.tooManyRequests`: "Príliš veľa požiadaviek. Skús neskôr."
- ✅ `common.errors.server`: "Niečo sa pokazilo. Skús to prosím znova."

### 3. Dev QA Panel (`/__dev/qa`)

**Tlačidlá pre testovanie:**
- ✅ **Trigger 500** → safe toast + Retry funguje (retryable: true)
- ✅ **Trigger 429** → safe toast + Retry funguje (retryable: true)
- ✅ **Trigger 404** → safe toast (retryable: false, správne)
- ✅ **Trigger 403** → safe toast (retryable: false, správne)
- ✅ **Trigger 422** → safe toast (validation error)

**Implementácia:**
```typescript
const callDevError = async (code: number) => {
  try {
    const { data } = await api.get("/dev/error", { params: { code } });
    lastResult.value = JSON.stringify(data, null, 2);
  } catch (err: unknown) {
    lastResult.value = `[error] ${String(mapAxiosErrorToDhError(err).kind)} (${String(mapAxiosErrorToDhError(err).status ?? "")})`;
    notifyError(mapAxiosErrorToDhError(err)); // ✅ Používa error mapper
  }
};
```

### 4. Dev Endpoint (`/api/dev/error`)

**Backend (`app/Http/Controllers/DevToolsController.php`):**
- ✅ Podporuje akýkoľvek HTTP error kód cez `?code=` parameter
- ✅ Vracia správny status code
- ✅ Vracia JSON response s `status: 'error'` a `message`

**Príklad:**
```php
GET /api/dev/error?code=500 → 500 status
GET /api/dev/error?code=404 → 404 status
GET /api/dev/error?code=403 → 403 status
GET /api/dev/error?code=429 → 429 status
```

### 5. Safe Toast System

**Všetky error kódy používajú safe toasty cez `notifyError()`:**

```typescript
// src/utils/notify.ts
export function notifyError(err: DhError, opts?: NotifyOpts) {
  const message = tGlobal(err.messageKey, err.fallbackMessage); // ✅ i18n key
  Notify.create({
    type: "negative",
    message, // ✅ Bezpečná správa (nie raw error text)
    position: opts?.position ?? "top",
    timeout: opts?.timeout ?? 6000
  });
}
```

**Žiadne raw error texty:**
- ❌ Žiadne "500 Internal Server Error"
- ❌ Žiadne "403 Forbidden"
- ❌ Žiadne "404 Not Found"
- ❌ Žiadne "429 Too Many Requests"
- ✅ Všetky používajú i18n kľúče s fallback správami

### 6. Retry Funkcionalita

**Retry funguje pre retryable errors:**

| Error Code | Retryable | Retry UI | Status |
|------------|-----------|----------|--------|
| **500** | ✅ `true` | ✅ RetryPanel sa zobrazí | ✅ |
| **429** | ✅ `true` | ✅ RetryPanel sa zobrazí | ✅ |
| **403** | ❌ `false` | ❌ Len toast (správne) | ✅ |
| **404** | ❌ `false` | ❌ Len toast (správne) | ✅ |

**Poznámka:** RetryPanel sa používa na stránkach, kde je to vhodné (napr. PostsPage, NotificationsPage). Pre 403/404 sa zobrazuje len toast, čo je správne správanie.

---

## 📋 Zoznam Zmenených Súborov

1. **`src/pages/Dev/DevQaPage.vue`**
   - ✅ Pridané tlačidlo "Trigger 404" pre testovanie 404 error kódu

---

## ✅ Overenie

### Lint Check
```bash
npm run lint
```
**Výsledok:** ✅ 0 errors (len warnings)

### Guardrails Check
```bash
npm run guardrails
```
**Výsledok:** ✅ PASS (žiadne priame Notify.create, žiadne console.* bez DEV guardu, žiadne token logging)

---

## 🧪 Ako Testovať

### 1. Testovanie cez Dev QA Panel (`/__dev/qa`)

1. Otvorte `/__dev/qa` stránku (len v DEV build)
2. Kliknite na tlačidlá:
   - **Trigger 500** → Očakávané: safe toast "Something went wrong. Please try again." + Retry UI (ak je na stránke s RetryPanel)
   - **Trigger 429** → Očakávané: safe toast "Too many requests. Try again later." + Retry UI
   - **Trigger 404** → Očakávané: safe toast "Content not found." (bez Retry)
   - **Trigger 403** → Očakávané: safe toast "You don't have permission to do that." (bez Retry)

### 2. Testovanie cez Dev Endpoint

```bash
# 500 Error
curl http://localhost:8000/api/dev/error?code=500

# 404 Error
curl http://localhost:8000/api/dev/error?code=404

# 403 Error
curl http://localhost:8000/api/dev/error?code=403

# 429 Error
curl http://localhost:8000/api/dev/error?code=429
```

**Očakávané:**
- Všetky vracajú správny HTTP status code
- Všetky vracajú JSON s `status: 'error'` a `message`
- Frontend zobrazuje safe toast cez error mapper (žiadne raw texty)

---

## ✅ Záver

**Všetko je správne nastavené:**

1. ✅ **Error mapper** má mapovanie pre všetky požadované kódy (403, 404, 429, 500)
2. ✅ **i18n kľúče** existujú v EN aj SK
3. ✅ **Dev QA panel** má tlačidlá pre všetky error kódy (vrátane 404)
4. ✅ **Dev endpoint** podporuje všetky error kódy
5. ✅ **Safe toasty** používajú i18n kľúče (žiadne raw error texty)
6. ✅ **Retry funguje** pre retryable errors (500, 429)
7. ✅ **Žiadne raw hlášky** - všetko je mapované cez error mapper

**KROK 8 Error Code Verification: ✅ PASS**
