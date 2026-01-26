# KROK 9 Automation Report

**Dátum:** 2026-01-25  
**Cieľ:** iOS Release automatizácie a sanity checky  
**Status:** ✅ **Hotové**

---

## 📋 Zoznam Zmenených Súborov

### Scripts (Nové)

1. **`scripts/ios-release-sanity.js`** (NEW)
   - iOS Release Sanity Check script
   - Kontroluje: version, build number, bundle ID, Info.plist permissions, ATS, capabilities, assets
   - CI-friendly output s jasnými FAIL hláškami

2. **`scripts/ios-sync-version.js`** (NEW)
   - Version Sync script (package.json → iOS)
   - Nastaví MARKETING_VERSION z package.json
   - Auto-increment alebo nastaví BUILD_NUMBER z ENV

### Dokumentácia

3. **`docs/APP_STORE_CONNECT_PACK.md`** (NEW)
   - Konsolidovaný App Store Connect Copy Pack
   - Všetky texty a metadata v jednom súbore (copy/paste ready)
   - App name, subtitle, description, keywords, URLs, What's New, Reviewer notes, Age rating checklist

### Konfigurácia

4. **`package.json`**
   - Pridané scripts:
     - `"ios:release-sanity": "node scripts/ios-release-sanity.js"`
     - `"ios:sync-version": "node scripts/ios-sync-version.js"`

### Integrácia

5. **`scripts/release-gate.js`** (UPDATED)
   - Pridaný iOS Release Sanity check
   - Integrovaný do release gate procesu
   - Spúšťa sa automaticky, ak iOS projekt existuje

---

## ✅ Čo je Hotové

### iOS Release Sanity Check
- ✅ Kontrola version a build number (CFBundleShortVersionString, CFBundleVersion)
- ✅ Kontrola bundle identifier (konzistencia, multiple targets)
- ✅ Kontrola Info.plist permissions (camera, photos, notifications, atď.)
- ✅ Kontrola ATS nastavení (varovania pre arbitrary loads)
- ✅ Kontrola capabilities/entitlements (push, background modes, atď.)
- ✅ Kontrola assets (AppIcon, splash)
- ✅ CI-friendly output s jasnými FAIL hláškami

### Version Sync
- ✅ Synchronizácia version z package.json do iOS
- ✅ Auto-increment build number alebo nastavenie z ENV
- ✅ Aktualizácia project.pbxproj súboru

### App Store Connect Copy Pack
- ✅ Konsolidovaný dokument so všetkými textami
- ✅ App name, subtitle (EN+SK)
- ✅ Description (EN+SK, 4000 char limit)
- ✅ Keywords (EN+SK, 100 char limit)
- ✅ URLs (Support, Marketing, Privacy Policy)
- ✅ What's New text pre prvý release (EN+SK)
- ✅ Reviewer notes template
- ✅ Age rating checklist
- ✅ Quick copy checklist

### Integrácia do Release Gate
- ✅ iOS Release Sanity check integrovaný do release-gate.js
- ✅ Spúšťa sa automaticky, ak iOS projekt existuje
- ✅ Jasné FAIL hlášky s návrhmi opráv

---

## 🧪 Presné Príkazy na Lokálne Overenie

### 1. iOS Release Sanity Check

```bash
cd dreamhubb-FE

# Spusti iOS release sanity check
npm run ios:release-sanity
```

**Očakávané:**
- ✅ Version a build number sú nastavené
- ✅ Bundle identifier existuje a je konzistentný
- ✅ Info.plist permissions (ak sú potrebné)
- ✅ ATS nastavenia (varovania, ak sú výnimky)
- ✅ Assets (AppIcon, splash) existujú

### 2. Version Sync

```bash
cd dreamhubb-FE

# Sync version z package.json do iOS (auto-increment build)
npm run ios:sync-version

# Sync version s konkrétnym build number
IOS_BUILD_NUMBER=5 npm run ios:sync-version
```

**Očakávané:**
- ✅ MARKETING_VERSION nastavený z package.json
- ✅ CURRENT_PROJECT_VERSION incrementovaný alebo nastavený z ENV
- ✅ project.pbxproj aktualizovaný

### 3. Release Gate (s iOS checkom)

```bash
cd dreamhubb-FE

# Spusti release gate (vrátane iOS sanity check)
npm run release:gate
```

**Očakávané:**
- ✅ Version Info check
- ✅ Privacy Policy check
- ✅ Production API URL check
- ✅ Production Safety check
- ✅ iOS Release Sanity check (ak iOS projekt existuje)

---

## ⚠️ Čo Zostáva Manuálne

### Xcode Configuration
- [ ] Overiť version a build number v Xcode (po `npm run ios:sync-version`)
- [ ] Nastaviť Signing & Capabilities (Team, Bundle ID, Provisioning Profile)
- [ ] Clean Build Folder
- [ ] Archive

**Pozri:** `docs/KROK9_IOS_RUNBOOK.md` - Step 4: Xcode Configuration

### App Store Connect
- [ ] Copy/paste texty z `docs/APP_STORE_CONNECT_PACK.md`
- [ ] Upload screenshots
- [ ] Submit for Review

**Pozri:** `docs/APP_STORE_CONNECT_PACK.md` - Quick Copy Checklist

---

## 📊 Test Results

### iOS Release Sanity Check

```bash
$ npm run ios:release-sanity

============================================================
  iOS RELEASE SANITY CHECK
============================================================

✅ iOS project found: ios/App

ℹ Checking version and build number...
✅ MARKETING_VERSION: 1.0
✅ CURRENT_PROJECT_VERSION: 1

ℹ Checking bundle identifier...
✅ PRODUCT_BUNDLE_IDENTIFIER: com.dreamhubb

ℹ Checking Info.plist permissions...
⚠️  Missing permission: NSCameraUsageDescription
⚠️  Missing permission: NSPhotoLibraryUsageDescription

ℹ Checking ATS (App Transport Security) settings...
✅ No ATS exceptions found

ℹ Checking capabilities and entitlements...
ℹ️  No entitlements file found (may be normal if no special capabilities)

ℹ Checking assets (AppIcon, splash)...
✅ AppIcon.appiconset found
   Found 1 icon size(s)
✅ Splash.imageset found
   Found 3 splash image(s)

============================================================
  SUMMARY
============================================================

Information:
  • MARKETING_VERSION: 1.0
  • CURRENT_PROJECT_VERSION: 1
  • PRODUCT_BUNDLE_IDENTIFIER: com.dreamhubb

Warnings:
  • Info.plist missing permission: NSCameraUsageDescription (may be needed for image uploads)
  • Info.plist missing permission: NSPhotoLibraryUsageDescription (may be needed for image uploads)

✅ SANITY CHECK PASSED
Review warnings above before release
```

### Version Sync

```bash
$ npm run ios:sync-version

============================================================
  iOS VERSION SYNC
============================================================

ℹ Package.json version: 1.0.0
ℹ Auto-incrementing build number: 1 → 2
✅ Updated MARKETING_VERSION to 1.0.0
✅ Updated CURRENT_PROJECT_VERSION to 2

✅ Version sync completed
   Version: 1.0.0
   Build: 2

⚠️  Remember to verify in Xcode:
   1. Open ios/App/App.xcodeproj in Xcode
   2. Select 'App' target → General tab
   3. Verify Version and Build match above
```

---

## ✅ DoD Checklist

### Scripts
- [x] iOS Release Sanity Check script
- [x] Version Sync script
- [x] Integrácia do release-gate
- [x] npm scripts pridané

### Dokumentácia
- [x] App Store Connect Copy Pack vytvorený
- [x] Konsolidované všetky texty a metadata

### Testovanie
- [x] iOS Release Sanity Check testovaný
- [x] Version Sync testovaný
- [x] Release Gate integrácia testovaná

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook
- `docs/KROK9_VERSIONING.md` - Versioning process
- `docs/APP_STORE_CONNECT_PACK.md` - App Store Connect Copy Pack
- `docs/KROK9_FINAL_REPORT.md` - KROK 9 Final Report

---

## 🎯 Záver

**Status:** ✅ **Automatizácie a sanity checky sú pripravené**

Všetky scripty, dokumentácia a integrácie sú vytvorené a testované. Zostáva len **manuálne dokončenie** krokov v Xcode a App Store Connect.

**Ďalšie kroky:**
1. Spusti `npm run ios:release-sanity` pred každým release
2. Spusti `npm run ios:sync-version` pred buildom
3. Spusti `npm run release:gate` pre kompletný release gate check
4. Použi `docs/APP_STORE_CONNECT_PACK.md` pre App Store Connect metadata

**KROK 9 Automation je pripravený!** 🚀
