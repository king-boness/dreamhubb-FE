# KROK 8 Mobile Smoke Test (10-15 min)

**Pre TestFlight / Real Device Testing**

Tento checklist pokrýva mobile-specific edge cases pre KROK 8 (Notifications, Errors & Edge Cases).

---

## 📋 Obsah

1. [Offline → Online Recovery (Airplane Mode)](#1-offline--online-recovery-airplane-mode)
2. [Background/Resume](#2-backgroundresume)
3. [Slow Network](#3-slow-network)
4. [Upload Fail](#4-upload-fail)
5. [Expired Token počas Akcie](#5-expired-token-počas-akcie)
6. [Language Switch počas Erroru](#6-language-switch-počas-erroru)

---

## 1. Offline → Online Recovery (Airplane Mode)

### Setup
- Prihlásený ako donor/donee
- Otvorená stránka feed (`/donor/posts` alebo `/donee/posts`)
- Aplikácia je v foreground

### Steps
1. **Enable Airplane Mode** (v device settings)
2. Obnovte stránku alebo prekliknite medzi tabmi
3. Overte OfflineBanner + Retry button
4. **Disable Airplane Mode**
5. Kliknite na Retry button

### Expected
- ✅ OfflineBanner sa zobrazí s textom "You're offline" / "Si offline"
- ✅ Retry button je viditeľný a klikateľný
- ✅ Po návrate online (disable airplane mode) sa `navigator.onLine` a `networkStore.isOnline` synchronizujú
- ✅ Po kliknutí na Retry sa stránka načíta (zobrazia sa posty alebo empty state)
- ✅ OfflineBanner zmizne po úspešnom načítaní
- ✅ **Žiadne auto-retry** - user musí kliknúť Retry button
- ✅ Žiadne raw error texty ("ERR_NETWORK", "Failed to fetch", atď.)

### Red Flags
- ❌ OfflineBanner sa nezobrazí pri airplane mode
- ❌ Retry button nefunguje po návrate online
- ❌ Auto-retry bez user interakcie (spam requestov)
- ❌ Raw error texty v UI

---

## 2. Background/Resume

### Setup
- Prihlásený ako donor/donee
- Otvorená stránka feed (`/donor/posts` alebo `/donee/posts`)
- Aplikácia je v foreground

### Steps
1. **Put app in background** (home button / app switcher)
2. Počkajte 5-10 sekúnd
3. **Resume app** (vráťte sa do aplikácie)
4. Overte online status synchronizáciu

### Expected
- ✅ Po resume sa `navigator.onLine` a `networkStore.isOnline` synchronizujú
- ✅ Ak je online, `networkStore.isOnline` sa nastaví na `true`
- ✅ Ak je offline, `networkStore.isOnline` zostáva `false`
- ✅ **Žiadne auto-retry** - user musí kliknúť Retry button ak existuje error state
- ✅ OfflineBanner sa zobrazí/skryje podľa aktuálneho online statusu

### Red Flags
- ❌ Online status sa nesynchronizuje po resume
- ❌ Auto-retry bez user interakcie
- ❌ App crash alebo freeze po resume

---

## 3. Slow Network

### Setup
- Prihlásený ako donor/donee
- Otvorená stránka feed (`/donor/posts` alebo `/donee/posts`)
- **Slow 3G / 2G network** (device settings alebo network throttling)

### Steps
1. Obnovte stránku (pull-to-refresh alebo F5)
2. Počkajte na timeout (môže trvať 30-60s)
3. Overte správanie UI

### Expected
- ✅ Loading spinner sa zobrazí
- ✅ Po timeout sa zobrazí safe timeout toast ("Something went wrong" / "Niečo sa pokazilo")
- ✅ Retry UI je dostupný (ak existuje na stránke)
- ✅ UI nie je zaseknuté (tlačidlá sa odblokujú)
- ✅ Žiadne raw timeout error texty

### Red Flags
- ❌ UI zamrzne (tlačidlá zostanú disabled)
- ❌ Loading spinner sa nezastaví
- ❌ Raw timeout error texty

---

## 4. Upload Fail

### Setup
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`
- Vybratý obrázok na upload

### Steps
1. Kliknite na Upload/Submit
2. **Počas uploadu:** Enable airplane mode alebo disable WiFi
3. Počkajte na error
4. **Re-enable network**
5. Skúste znova Upload

### Expected
- ✅ Upload progress sa zastaví (ak existuje)
- ✅ Safe error toast ("Upload failed" / "Nahrávanie zlyhalo")
- ✅ Upload tlačidlo sa odblokuje (nie stuck)
- ✅ Môžete skúsiť znova po návrate online
- ✅ Žiadne raw error texty

### Red Flags
- ❌ Upload tlačidlo zostane stuck (disabled)
- ❌ Upload progress sa nezastaví
- ❌ Raw error texty

---

## 5. Expired Token počas Akcie

### Setup
- Prihlásený ako donor/donee
- Otvorená stránka s akciou (reply, topup, upload)
- Token je platný

### Steps
1. **Simulate expired token:** DevQaPage → "Simulate invalid token" → Reload
2. Alebo manuálne: Local Storage → zmeňte `token` na `"invalid-token"`
3. Spustite akciu (reply, topup, upload)
4. Overte správanie

### Expected
- ✅ Safe error toast ("Something went wrong" / "Niečo sa pokazilo")
- ✅ Automatický redirect na `/login` (po chvíli)
- ✅ Max 1-2 toasty (nie spam)
- ✅ Žiadne raw error texty ("Unauthorized", "401", atď.)
- ✅ Silent logout (žiadne console errors)

### Red Flags
- ❌ Spam toasty (viac ako 2-3)
- ❌ Raw error texty
- ❌ Refresh token loop
- ❌ App crash alebo freeze

---

## 6. Language Switch počas Erroru

### Setup
- Prihlásený ako donor/donee
- Aplikácia je v anglickom jazyku
- Error state (offline alebo 500)

### Steps
1. Vyvolajte error (napr. airplane mode, 500 cez DevQaPage)
2. Overte toast/banner text v EN
3. Zmeňte jazyk aplikácie na slovenčinu (ak existuje language switcher)
4. Overte toast/banner text

### Expected
- ✅ Toast messages sa zmenia na slovenčinu
- ✅ Nové toasty sú v slovenčine
- ✅ i18n kľúče fungujú správne
- ✅ Žiadne raw error texty (ani po language switch)
- ✅ Retry button text sa zmení podľa jazyka

### Red Flags
- ❌ Raw i18n keys zobrazené ("common.errors.offline")
- ❌ Toast messages zostanú v pôvodnom jazyku
- ❌ Raw error texty

---

## 🚨 STOP Ship Criteria

**NEPOUŠŤAJTE do produkcie ak:**
- ❌ OfflineBanner sa nezobrazí pri airplane mode
- ❌ Resume nespôsobí synchronizáciu online statusu
- ❌ Auto-retry bez user interakcie (spam requestov)
- ❌ Upload tlačidlo zostane stuck po network drop
- ❌ Expired token nespôsobí logout/redirect (alebo spôsobí refresh loop)
- ❌ Language switch nezmení error messages
- ❌ Raw error texty v UI ("Unauthorized", "ERR_NETWORK", "500", atď.)

---

## 📝 Poznámky

- **Test na real device** (nie len emulator) - network throttling môže byť iné
- **Airplane mode** je najspoľahlivejší spôsob offline simulácie na mobile
- **Background/Resume** test vyžaduje real device (emulator môže mať iné správanie)
- **Slow network** môže byť simulované cez device settings alebo network throttling
- **Všetky error toasty** by mali byť **i18n** (EN + SK podľa jazyka)

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK8-QA.md` - Kompletný manuálny QA checklist
- `RELEASE_SMOKE_10MIN.md` - 10-minútový release smoke test
- `KROK8_GATE_REPORT.md` - Gate report s kontrolami
