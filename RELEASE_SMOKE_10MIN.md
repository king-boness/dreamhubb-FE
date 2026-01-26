# Release Smoke Test (10 min) - KROK 8

**Pre App Store / Production Release**

Tento checklist zabezpečuje, že error handling, notifications a edge cases fungujú správne pred release.

---

## ✅ Quick Checks (2 min)

1. **Login Flow:**
   - [ ] Login funguje (bez raw error textov)
   - [ ] Expired token → safe toast + redirect /login

2. **Basic Navigation:**
   - [ ] Donor feed (`/donor/posts`) sa načíta
   - [ ] Donee posts (`/donee/posts`) sa načíta
   - [ ] Notifications (`/donor/notifications`) sa načíta

---

## 🔴 Critical Error Scenarios (5 min)

### Offline → Online Recovery
- [ ] **Donee feed:** DevTools → Network → Offline → obnoviť stránku → OfflineBanner + Retry → Online → Retry funguje
- [ ] **Donor feed:** Offline → prekliknúť tab → OfflineBanner + Retry → Online → Retry funguje
- [ ] **Post detail:** Offline → obnoviť → OfflineBanner + Retry → Online → Retry funguje

**Expected:** OfflineBanner sa zobrazí, Retry funguje, žiadne raw error texty ("ERR_NETWORK", "Failed to fetch")

### Error States
- [ ] **401 (expired token):** Logout a prihlásenie znova → safe toast + redirect /login (bez raw "Unauthorized")
- [ ] **422 (validation):** Vytvoriť post bez povinných polí → safe i18n text (EN aj SK)
- [ ] **500:** Použiť `/api/dev/error?code=500` (ak je dostupné) → safe toast + Retry UI kde má byť

**Expected:** Všetky error toasty sú safe i18n texty, nikdy raw backend messages

---

## ⚠️ Edge Cases (3 min)

1. **Slow 3G / Timeout:**
   - [ ] DevTools → Network → Slow 3G → načítať feed → UI nezamrzne, tlačidlá sa odblokujú

2. **Expired Token počas Akcie:**
   - [ ] Počas reply/topup/upload → invalid token → safe toast + logout/redirect (bez refresh loop)

3. **Language Switch:**
   - [ ] Vyvolať error (offline alebo 500) → overiť toast v EN → prepnúť na SK → overiť že text sa zmenil (nie raw key)

---

## 🚫 STOP Ship Criteria

**NEPOUŠŤAJTE do produkcie ak:**
- ❌ V UI sa zobrazujú raw error texty ("Unauthorized", "ERR_NETWORK", "ERR_BAD_REQUEST", Laravel stacktrace)
- ❌ OfflineBanner sa nezobrazí pri offline stave
- ❌ Retry button nefunguje alebo spôsobí crash
- ❌ Expired token nespôsobí logout/redirect (alebo spôsobí refresh loop)
- ❌ Error toasty sú v raw forme (nie i18n keys)

---

## 📝 Notes

- **Test Environment:** Production build (`npm run build` → `npm run preview`)
- **Browser:** Chrome/Safari (podľa target platformy)
- **Network:** Test offline aj online scenáre
- **Language:** Test EN aj SK

**Poznámka:** Kompletný checklist nájdete v `docs/KROK8-QA.md`
