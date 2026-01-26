# KROK 9 Final Report

**Dátum:** 2026-01-25  
**Cieľ:** iOS App Store Release Preparation  
**Status:** ✅ **Dokumentácia a procesy pripravené**

---

## 📋 Zoznam Zmenených Súborov

### Dokumentácia (docs/)

1. **`docs/KROK9-RELEASE-AUDIT.md`**
   - Release audit report (FE/BE readiness)
   - Identifikované chýbajúce veci

2. **`docs/KROK9_VERSIONING.md`**
   - Versioning process dokumentácia
   - package.json ↔ iOS synchronizácia
   - Build number increment proces

3. **`docs/KROK9_IOS_RUNBOOK.md`**
   - Presné kroky pre iOS build
   - Xcode configuration
   - Archive & upload proces
   - TestFlight setup
   - App Store submission
   - STOP SHIP kritériá

4. **`docs/KROK9_PRIVACY_MATRIX.md`**
   - Data collection matrix
   - App Store Connect privacy questions
   - TODO checklist

5. **`docs/PRIVACY_POLICY_TEMPLATE.md`**
   - Privacy Policy template
   - Placeholders pre nahradenie
   - Checklist

6. **`docs/KROK9_ASSETS_SPEC.md`**
   - App icon špecifikácie
   - Splash screen špecifikácie
   - Screenshot requirements

7. **`docs/KROK9_SCREENSHOT_SHOTLIST.md`**
   - 8-10 screenshots shotlist
   - Poradie a obsah
   - Text overlays (EN+SK)
   - Creation process

8. **`docs/KROK9_APPSTORE_METADATA.md`**
   - App Store metadata templates
   - Description (EN+SK)
   - Keywords
   - URLs placeholders
   - Reviewer notes template
   - Age rating checklist

9. **`docs/KROK9_FINAL_REPORT.md`** (tento súbor)
   - Final report
   - Zoznam zmenených súborov
   - Manuálne kroky
   - DoD checklist

### Scripts

10. **`scripts/release-gate.js`** (NEW)
    - KROK 9 specific release gate checks
    - Version info check
    - Privacy Policy check
    - Production API URL check
    - Production safety check

### Konfigurácia

11. **`package.json`**
    - Pridaný script: `"release:gate": "node scripts/release-gate.js"`

### Release Notes

12. **`RELEASE_NOTES.md`**
    - Pridaná KROK 9 sekcia

---

## ✅ Čo je Hotové

### Dokumentácia
- ✅ Release audit report
- ✅ Versioning process dokumentácia
- ✅ iOS Build Runbook (presné kroky)
- ✅ Privacy & Compliance pack (matrix + template)
- ✅ Assets špecifikácie
- ✅ Screenshot shotlist
- ✅ App Store metadata templates

### Scripts
- ✅ Release gate script (`npm run release:gate`)
- ✅ Integrácia do package.json

### Release Notes
- ✅ KROK 9 sekcia v RELEASE_NOTES.md

---

## ⚠️ Čo Zostáva Manuálne

### 1. Xcode Configuration (Manuálne)
- [ ] Otvoriť `ios/App/App.xcworkspace` v Xcode
- [ ] Nastaviť Signing & Capabilities (Team, Bundle ID, Provisioning Profile)
- [ ] Overiť Version & Build Number (zodpovedá package.json)
- [ ] Clean Build Folder
- [ ] Archive

**Pozri:** `docs/KROK9_IOS_RUNBOOK.md` - Step 4: Xcode Configuration

### 2. App Store Connect (Manuálne)
- [ ] Vytvoriť App ID (`com.dreamhubb`) v App Store Connect
- [ ] Vytvoriť App record
- [ ] Pridať Privacy Policy URL (hostovaný na verejnom URL)
- [ ] Pridať Support URL
- [ ] Upload build (cez Xcode Organizer)
- [ ] Pridať screenshots (iPhone 6.7", iPhone 6.1")
- [ ] Vyplniť metadata (description, keywords, atď.)
- [ ] Submit for Review

**Pozri:** `docs/KROK9_IOS_RUNBOOK.md` - Step 6-8

### 3. Privacy Policy (Manuálne)
- [ ] Vyplniť Privacy Policy template (`docs/PRIVACY_POLICY_TEMPLATE.md`)
- [ ] Nahradiť všetky placeholders
- [ ] Hostovať na verejnom URL
- [ ] Pridať URL do App Store Connect

**Pozri:** `docs/PRIVACY_POLICY_TEMPLATE.md`

### 4. Screenshots (Manuálne)
- [ ] Vytvoriť 8-10 screenshots (podľa shotlist)
- [ ] Upraviť veľkosti (iPhone 6.7", iPhone 6.1")
- [ ] Pridať text overlays (ak je potrebné)
- [ ] Upload do App Store Connect

**Pozri:** `docs/KROK9_SCREENSHOT_SHOTLIST.md`

### 5. Version Synchronization (Manuálne)
- [ ] Aktualizovať package.json version
- [ ] Aktualizovať iOS Marketing Version v Xcode
- [ ] Incrementovať Build Number v Xcode

**Pozri:** `docs/KROK9_VERSIONING.md`

### 6. Production API URL (Manuálne)
- [ ] Vytvoriť `.env.production` s production API URL
- [ ] Overiť, že production build používa production URL

**Pozri:** `docs/KROK9_IOS_RUNBOOK.md` - Step 1.1

---

## 🧪 Presné Príkazy na Lokálne Overenie

### 1. Release Gate Check

```bash
cd dreamhubb-FE

# Spusti release gate checks
npm run release:gate
```

**Očakávané:**
- ✅ Version info check
- ✅ Privacy Policy check
- ✅ Production API URL check (warning, ak je localhost)
- ✅ Production safety check

### 2. Preflight Check

```bash
cd dreamhubb-FE

# Spusti preflight (lint, build, guardrails, e2e)
npm run preflight
```

**Očakávané:**
- ✅ Lint: 0 errors
- ✅ Guardrails: PASS
- ✅ Build: SUCCESS
- ✅ Prod Safety: PASS (ak je build hotový)
- ⚠️ E2E: SKIP (ak servery nie sú ready)

### 3. Version Check

```bash
cd dreamhubb-FE

# Skontroluj package.json version
cat package.json | grep '"version"'

# Skontroluj iOS version (manuálne v Xcode)
# Otvor ios/App/App.xcodeproj → General tab → Version
```

### 4. Production Build Check

```bash
cd dreamhubb-FE

# Production build
npm run build

# Skontroluj, že dev routes nie sú v build
grep -r "__dev" dist/spa/ && echo "❌ Dev routes found!" || echo "✅ No dev routes"

# Skontroluj, že production API URL je použité (ak je .env.production)
grep -r "api.dreamhubb.com" dist/spa/ || echo "⚠️ Production URL not found (check .env.production)"
```

### 5. iOS Build (Lokálne Test)

```bash
cd dreamhubb-FE

# Sync Capacitor
npx cap sync ios

# Otvor Xcode
open ios/App/App.xcworkspace

# V Xcode:
# 1. Select "App" target
# 2. General tab → Over Version & Build
# 3. Signing & Capabilities → Over Team & Bundle ID
# 4. Product → Clean Build Folder
# 5. Product → Archive
```

---

## ✅ DoD Checklist Pre KROK 9

### Dokumentácia
- [x] Release audit report
- [x] Versioning process dokumentácia
- [x] iOS Build Runbook
- [x] Privacy & Compliance pack
- [x] Assets špecifikácie
- [x] Screenshot shotlist
- [x] App Store metadata templates

### Scripts
- [x] Release gate script
- [x] Integrácia do package.json

### Release Notes
- [x] KROK 9 sekcia

### Manuálne Kroky (Pre Release)
- [ ] Version synchronizovaný (package.json ↔ iOS)
- [ ] Production API URL nastavené
- [ ] Privacy Policy vyplnená a hostovaná
- [ ] Screenshots vytvorené a pripravené
- [ ] App Store Connect metadata vyplnené
- [ ] Xcode signing & provisioning nastavené
- [ ] Archive vytvorený a uploadnutý
- [ ] TestFlight build testovaný
- [ ] App Store submission dokončené

---

## 📚 Súvisiace Dokumenty

- `docs/KROK9-RELEASE-AUDIT.md` - Release audit
- `docs/KROK9_VERSIONING.md` - Versioning process
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook
- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy matrix
- `docs/PRIVACY_POLICY_TEMPLATE.md` - Privacy Policy template
- `docs/KROK9_ASSETS_SPEC.md` - Assets špecifikácie
- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Screenshot shotlist
- `docs/KROK9_APPSTORE_METADATA.md` - App Store metadata

---

## 🎯 Záver

**Status:** ✅ **Dokumentácia a procesy sú pripravené**

Všetky dokumenty, templates a scripts sú vytvorené a pripravené na použitie. Zostáva len **manuálne dokončenie** krokov v Xcode a App Store Connect.

**Ďalšie kroky:**
1. Prečítaj `docs/KROK9_IOS_RUNBOOK.md` pre presné kroky
2. Postupuj podľa runbooku krok za krokom
3. Použi templates z `docs/KROK9_APPSTORE_METADATA.md` pre App Store Connect
4. Spusti `npm run release:gate` pred každým release

**KROK 9 je pripravený na implementáciu!** 🚀
