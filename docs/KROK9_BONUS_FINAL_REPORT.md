# KROK 9 Bonus Tasks Final Report

**Dátum:** 2026-01-25  
**Cieľ:** Bonus úlohy - App Store texty, Privacy Policy, Screenshot shotlist, TestFlight checklist  
**Status:** ✅ **Hotové**

---

## 📋 Zoznam Zmenených Súborov

### Dokumentácia (Aktualizované)

1. **`docs/APP_STORE_CONNECT_PACK.md`** (UPDATED)
   - ✅ Pridaný **Promo Text** (EN+SK, 170 char limit)
   - ✅ Pridané **Support URL Texty** (EN+SK) - placeholder content pre support page
   - ✅ Všetky texty sú copy/paste ready

2. **`docs/PRIVACY_POLICY_TEMPLATE.md`** (UPDATED)
   - ✅ Doplnené konkrétne položky podľa Privacy Matrix
   - ✅ Detailný popis každého data type (email, password, posts, images, location, tokens)
   - ✅ Konkrétne informácie o storage (backend database, Cloudinary, localStorage)
   - ✅ Konkrétne informácie o data retention (account data, posts, tokens)
   - ✅ Konkrétne informácie o third-party services (Cloudinary, hosting provider)
   - ✅ Explicitne uvedené: No analytics, no tracking, no advertising

3. **`docs/KROK9_SCREENSHOT_SHOTLIST.md`** (UPDATED)
   - ✅ Rozšírené o **presné scenáre** pre každý screenshot
   - ✅ Rozšírené o **detailný obsah** na každom screenshote
   - ✅ Pridané **text overlays** (EN+SK) pre každý screenshot
   - ✅ Pridané **poznámky** (bez sensitive data, reprezentatívny obsah)

4. **`docs/KROK9_TESTFLIGHT_CHECKLIST.md`** (NEW)
   - ✅ Kompletný TestFlight checklist
   - ✅ Internal vs External Testing porovnanie
   - ✅ Pre-upload checklist
   - ✅ Internal Testing checklist
   - ✅ External Testing checklist
   - ✅ "What to check before submitting" checklist
   - ✅ TestFlight workflow (upload, internal, external)

---

## ✅ Čo je Hotové

### 1. App Store Texty (2-3 jazykové varianty)

- ✅ **Subtitle** (EN+SK) - už bolo, overené
- ✅ **Keywords** (EN+SK) - už bolo, overené
- ✅ **Promo Text** (EN+SK, 170 char limit) - **NOVÉ**
- ✅ **Reviewer Notes** - už bolo, overené
- ✅ **Support URL Texty** (EN+SK) - **NOVÉ**
  - Common Questions (Q&A format)
  - Support page placeholder content
  - Copy/paste ready

### 2. Privacy Policy Text

- ✅ **Template existuje** - už bolo
- ✅ **Doplnené konkrétne položky** - **NOVÉ**
  - Detailný popis každého data type
  - Konkrétne informácie o storage (backend, Cloudinary, localStorage)
  - Konkrétne informácie o data retention
  - Konkrétne informácie o third-party services
  - Explicitne: No analytics, no tracking, no advertising
- ✅ **Založené na Privacy Matrix** - všetky data types sú pokryté

### 3. Screenshot Shotlist

- ✅ **Presné scenáre** - **NOVÉ**
  - Pre každý screenshot: konkrétny scenár (ako sa dostať na stránku)
  - Detailný obsah (čo má byť viditeľné)
  - Text overlays (EN+SK)
  - Poznámky (bez sensitive data)
- ✅ **8-10 screenshots** - už bolo, rozšírené
- ✅ **Poradie a obsah** - už bolo, rozšírené

### 4. TestFlight Checklist

- ✅ **Internal vs External Testing** - **NOVÉ**
  - Porovnanie (výhody, nevýhody, kedy použiť)
  - Setup kroky pre každý typ
- ✅ **Pre-upload Checklist** - **NOVÉ**
  - Build readiness
  - Code quality
  - Functionality
  - Assets
  - Privacy & compliance
- ✅ **Internal Testing Checklist** - **NOVÉ**
  - Setup
  - Testing
  - Feedback
- ✅ **External Testing Checklist** - **NOVÉ**
  - Setup
  - Beta App Review
  - Testing
  - Feedback
- ✅ **"What to Check Before Submitting"** - **NOVÉ**
  - Critical checks (crash, login, offline, token refresh, dev endpoints, raw errors)
  - Functionality checks
  - Compliance checks
  - Metadata checks
- ✅ **TestFlight Workflow** - **NOVÉ**
  - Step-by-step kroky (upload, internal, external)

---

## 📊 Detailný Prehľad

### App Store Texty

**Všetky texty sú v `docs/APP_STORE_CONNECT_PACK.md`:**

1. **App Name:** `dreamhubb`
2. **Subtitle (EN):** `Share your dreams`
3. **Subtitle (SK):** `Zdieľaj svoje sny`
4. **Description (EN):** 4000 char limit, copy/paste ready
5. **Description (SK):** 4000 char limit, copy/paste ready
6. **Keywords (EN):** `dream, aspiration, goal, idea, community, share, support, inspiration, social, network`
7. **Keywords (SK):** `sen, túžba, cieľ, nápad, komunita, zdieľanie, podpora, inšpirácia, sociálna sieť`
8. **Promo Text (EN):** 170 char limit, **NOVÉ**
9. **Promo Text (SK):** 170 char limit, **NOVÉ**
10. **Support URL Text (EN):** Common Questions format, **NOVÉ**
11. **Support URL Text (SK):** Common Questions format, **NOVÉ**
12. **What's New (EN+SK):** Pre prvý release
13. **Reviewer Notes:** Template s placeholders

### Privacy Policy

**Všetky informácie sú v `docs/PRIVACY_POLICY_TEMPLATE.md`:**

- ✅ Detailný popis každého data type (email, password, posts, images, location, tokens)
- ✅ Konkrétne informácie o storage (backend database, Cloudinary, localStorage)
- ✅ Konkrétne informácie o data retention (account data, posts, tokens, account deletion)
- ✅ Konkrétne informácie o third-party services (Cloudinary, hosting provider)
- ✅ Explicitne: No analytics, no tracking, no advertising
- ✅ Account deletion process (contact email, 30 days processing)

### Screenshot Shotlist

**Všetky informácie sú v `docs/KROK9_SCREENSHOT_SHOTLIST.md`:**

- ✅ 8-10 screenshots s presnými scenármi
- ✅ Detailný obsah pre každý screenshot
- ✅ Text overlays (EN+SK) pre každý screenshot
- ✅ Poznámky (bez sensitive data, reprezentatívny obsah)
- ✅ Screenshot creation process (Simulator, Real Device, Automated Tools)

### TestFlight Checklist

**Všetky informácie sú v `docs/KROK9_TESTFLIGHT_CHECKLIST.md`:**

- ✅ Internal vs External Testing porovnanie
- ✅ Pre-upload checklist (build, code quality, functionality, assets, privacy)
- ✅ Internal Testing checklist (setup, testing, feedback)
- ✅ External Testing checklist (setup, Beta App Review, testing, feedback)
- ✅ "What to Check Before Submitting" (critical, functionality, compliance, metadata)
- ✅ TestFlight workflow (step-by-step)

---

## 🧪 Ako Použiť

### App Store Texty

1. **Otvoriť:** `docs/APP_STORE_CONNECT_PACK.md`
2. **Copy/paste** texty do App Store Connect:
   - App Information tab → App Name, Subtitle
   - Version Information tab → Description, Keywords, Promo Text, What's New
   - App Review Information tab → Reviewer Notes
3. **Nahradiť placeholders** (`[YOUR_NAME]`, `[CONTACT_EMAIL]`, atď.)

### Privacy Policy

1. **Otvoriť:** `docs/PRIVACY_POLICY_TEMPLATE.md`
2. **Nahradiť placeholders:**
   - `[COMPANY_NAME]` → skutočný názov
   - `[APP_NAME]` → dreamhubb
   - `[CONTACT_EMAIL]` → skutočný email
   - `[CLOUD_STORAGE_PROVIDER]` → Cloudinary
   - `[HOSTING_PROVIDER]` → skutočný hosting provider
   - `[TOKEN_TTL]` → 24 hours
   - `[CONTACT_METHOD]` → email
3. **Hostovať** na verejnom URL
4. **Pridať URL** do App Store Connect

### Screenshot Shotlist

1. **Otvoriť:** `docs/KROK9_SCREENSHOT_SHOTLIST.md`
2. **Postupovať podľa shotlistu:**
   - Pre každý screenshot: postupuj podľa scenára
   - Zajisti, že obsah zodpovedá shotlistu
   - Pridaj text overlays (ak je potrebné)
3. **Vytvoriť screenshots** (Simulator alebo Real Device)
4. **Upload** do App Store Connect

### TestFlight Checklist

1. **Otvoriť:** `docs/KROK9_TESTFLIGHT_CHECKLIST.md`
2. **Postupovať podľa checklistu:**
   - Pre-upload: over všetky body
   - Internal Testing: setup a testing
   - External Testing: setup, Beta App Review, testing
   - Before Submitting: over všetky critical checks
3. **Použiť workflow** pre upload a testing

---

## ✅ DoD Checklist

### App Store Texty
- [x] Subtitle (EN+SK)
- [x] Keywords (EN+SK)
- [x] Promo Text (EN+SK) - **NOVÉ**
- [x] Support URL Texty (EN+SK) - **NOVÉ**
- [x] Reviewer Notes
- [x] What's New (EN+SK)

### Privacy Policy
- [x] Template existuje
- [x] Doplnené konkrétne položky - **NOVÉ**
- [x] Založené na Privacy Matrix
- [x] Copy/paste ready

### Screenshot Shotlist
- [x] Presné scenáre - **NOVÉ**
- [x] Detailný obsah - **NOVÉ**
- [x] Text overlays (EN+SK) - **NOVÉ**
- [x] Poznámky - **NOVÉ**
- [x] 8-10 screenshots

### TestFlight Checklist
- [x] Internal vs External Testing - **NOVÉ**
- [x] Pre-upload Checklist - **NOVÉ**
- [x] Internal Testing Checklist - **NOVÉ**
- [x] External Testing Checklist - **NOVÉ**
- [x] "What to Check Before Submitting" - **NOVÉ**
- [x] TestFlight Workflow - **NOVÉ**

---

## 🔗 Súvisiace Dokumenty

- `docs/APP_STORE_CONNECT_PACK.md` - App Store Connect Copy Pack (rozšírený)
- `docs/PRIVACY_POLICY_TEMPLATE.md` - Privacy Policy template (doplnený)
- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Screenshot shotlist (rozšírený)
- `docs/KROK9_TESTFLIGHT_CHECKLIST.md` - TestFlight checklist (nový)
- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy matrix
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook

---

## 🎯 Záver

**Status:** ✅ **Všetky bonus úlohy sú hotové**

Všetky texty, dokumenty a checklists sú pripravené a copy/paste ready. Zostáva len:
1. Nahradiť placeholders skutočnými hodnotami
2. Hostovať Privacy Policy na verejnom URL
3. Vytvoriť screenshots podľa shotlistu
4. Použiť TestFlight checklist pre testing

**KROK 9 Bonus Tasks sú pripravené!** 🚀
