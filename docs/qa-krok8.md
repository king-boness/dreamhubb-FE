# KROK 8 – Manuálne QA Checklist (15 min)

Tento dokument obsahuje rýchly smoke checklist pre manuálne testovanie KROK 8 (Notifications, errors & edge cases).

## 📋 Predpoklady

- Backend beží na `http://localhost:8000`
- Frontend beží na `http://localhost:9000`
- Máte testovacie prihlasovacie údaje (donor + donee)
- Dev QA page je dostupná na `/__dev/qa` (len v DEV buildoch)

---

## ✅ 1. Offline Handling (2 min)

### Test scenár:
1. **Prihláste sa** ako donor alebo donee
2. **Otvorte** `/donor/posts` alebo `/donee/posts`
3. **V DevTools** (F12) → Network tab → **Throttling: Offline**
4. **Obnovte stránku** (F5) alebo prekliknite medzi tabmi

### Očakávaný výsledok:
- ✅ **OfflineBanner** sa zobrazí s textom "You're offline" / "Si offline"
- ✅ **Retry button** je viditeľný
- ✅ **Žiadne raw error texty** ("ERR_NETWORK", "Failed to fetch", atď.)

### Obnovenie:
5. **V DevTools** → Network tab → **Throttling: Online**
6. **Kliknite na Retry button**

### Očakávaný výsledok:
- ✅ **OfflineBanner zmizne**
- ✅ **Stránka sa načíta** (zobrazia sa posty alebo empty state)
- ✅ **Žiadne stuck loading spinnery**

---

## ✅ 2. Slow 3G / Timeout (2 min)

### Test scenár:
1. **V DevTools** → Network tab → **Throttling: Slow 3G**
2. **Otvorte** `/donor/notifications` alebo `/donee/posts`
3. **Počkajte** na timeout (môže trvať 30-60s)

### Očakávaný výsledok:
- ✅ **Safe timeout toast** ("Something went wrong" / "Niečo sa pokazilo")
- ✅ **Retry UI** je dostupný (ak je na stránke)
- ✅ **Žiadne raw timeout error texty**

---

## ✅ 3. Invalid Token / 401 (2 min)

### Test scenár:
1. **Prihláste sa** ako donor
2. **V DevTools** → Application → Local Storage → **Zmeňte `token`** na `"invalid-token"`
3. **Obnovte stránku** (F5)

### Očakávaný výsledok:
- ✅ **Automatický redirect** na `/login`
- ✅ **Žiadne raw error texty** ("Unauthorized", "401", atď.)
- ✅ **Max 1-2 toasty** (nie spam)
- ✅ **Silent logout** (žiadne console errors)

---

## ✅ 4. Validation Error / 422 (2 min)

### Test scenár:
1. **Prihláste sa** ako donee
2. **Otvorte** `/donee/post-creation`
3. **Nevyplňte povinné polia** a kliknite **Submit/Publish**

### Očakávaný výsledok:
- ✅ **Safe validation toast** ("Please check your input" / "Skontroluj zadané údaje")
- ✅ **Žiadne raw Laravel validation texty** (field names, "422", atď.)
- ✅ **Formulár zostáva interaktívny** (nie stuck)

---

## ✅ 5. Server Error / 500 (2 min)

### Test scenár:
1. **Prihláste sa** ako donor
2. **Otvorte** `/__dev/qa` (len v DEV)
3. **Kliknite** "Trigger 500"

### Očakávaný výsledok:
- ✅ **Safe server error toast** ("Something went wrong" / "Niečo sa pokazilo")
- ✅ **Žiadne raw error texty** ("500", "Internal Server Error", stack trace)
- ✅ **UI nie je stuck** (loading flag sa vypne)
- ✅ **Stránka zostáva interaktívna**

---

## ✅ 6. Rate Limit / 429 (2 min)

### Test scenár:
1. **Prihláste sa** ako donor
2. **Otvorte** `/__dev/qa` (len v DEV)
3. **Rýchlo kliknite** "Trigger 429" **3-5x za sebou**

### Očakávaný výsledok:
- ✅ **Safe rate limit toast** ("Too many requests" / "Príliš veľa požiadaviek")
- ✅ **Anti-duplication funguje** (max 1 toast, nie spam)
- ✅ **Žiadne raw texty** ("429", "Too Many Requests")

---

## ✅ 7. Forbidden / 403 (1 min)

### Test scenár:
1. **Prihláste sa** ako donor
2. **Otvorte** `/__dev/qa` (len v DEV)
3. **Kliknite** "Trigger 403"

### Očakávaný výsledok:
- ✅ **Safe forbidden toast** ("You don't have permission" / "Nemáš oprávnenie")
- ✅ **Žiadne raw texty** ("403", "Forbidden")

---

## ✅ 8. Role Switch (Donee ↔ Donor) (2 min)

### Test scenár:
1. **Prihláste sa** ako donor
2. **Prejdite** na donee side (ak existuje switch button)
3. **Otvorte** `/donee/posts`
4. **Prejdite späť** na donor side
5. **Otvorte** `/donor/posts`

### Očakávaný výsledok:
- ✅ **Žiadne error toasty** pri switch-e
- ✅ **Obe stránky sa načítajú** správne
- ✅ **Retry UI funguje** na oboch stranách

---

## 🚨 Červené vlajky (FAIL ak vidíte):

- ❌ **Raw error texty** v UI: "Unauthorized", "ERR_NETWORK", "ERR_BAD_REQUEST", "500", "403", "422", "AxiosError", Laravel stacktrace
- ❌ **Tokeny alebo PII** v konzole (okrem `console.debug` v DEV guard-e)
- ❌ **Spam toasty** (viac ako 2-3 toasty pre jeden error)
- ❌ **Stuck loading spinnery** (spinner sa nezastaví)
- ❌ **Zaseknuté UI** (tlačidlá nefungujú po errore)
- ❌ **Refresh loop** (nekonečné refresh token requesty)
- ❌ **Raw backend messages** v toaste (namiesto i18n keys)

---

## 📝 Poznámky

- **Dev QA page** (`/__dev/qa`) je dostupná **len v DEV buildoch** (nie v produkcii)
- **Offline simulácia** funguje najlepšie cez DevTools Network throttling
- **Invalid token** test vyžaduje manuálnu zmenu v Local Storage
- **Všetky error toasty** by mali byť **i18n** (EN + SK podľa jazyka)

---

## 🔗 Súvisiace dokumenty

- `e2e/README.md` - E2E testy dokumentácia
- `src/utils/notify.ts` - Unified notify wrappers
- `src/utils/httpError.ts` - Error mapper
