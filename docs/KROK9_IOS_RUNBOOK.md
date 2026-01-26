# KROK 9 iOS Build Runbook

**Cieľ:** Presné kroky pre iOS App Store release (build, archive, upload, TestFlight, submission)

---

## 📋 Prerequisites

### 1. Apple Developer Account
- ✅ **Apple Developer Program membership** (aktívne, $99/rok)
- ✅ **App ID vytvorený:** `com.dreamhubb`
- ✅ **Certificates:** Development + Distribution certificates
- ✅ **Provisioning Profiles:** Development + App Store profiles

### 2. Xcode
- ✅ **Xcode nainštalovaný** (najnovšia verzia odporúčaná)
- ✅ **Command Line Tools:** `xcode-select --install`
- ✅ **CocoaPods** (ak sa používa): `pod --version`

### 3. Lokálne Nastavenia
- ✅ **Node.js:** `node --version` (v18+)
- ✅ **npm:** `npm --version`
- ✅ **Capacitor CLI:** `npx cap --version`
- ✅ **iOS Simulator** (pre testovanie)

---

## 🔧 Step 1: Environment Setup

### 1.1 Production API URL

**Dôležité:** Pred buildom nastav production API URL.

```bash
cd dreamhubb-FE

# Vytvor .env.production (alebo uprav .env)
echo "VITE_API_BASE=https://api.dreamhubb.com/api" > .env.production
```

**Poznámka:** Nahraď `https://api.dreamhubb.com/api` skutočnou production API URL.

### 1.2 Overenie Version

```bash
# Skontroluj package.json version
cat package.json | grep '"version"'

# Over, že zodpovedá iOS Marketing Version (v Xcode)
```

**Pozri:** `docs/KROK9_VERSIONING.md` pre detailné kroky.

---

## 🏗️ Step 2: Build Frontend

### 2.1 Production Build

```bash
cd dreamhubb-FE

# Clean previous build
rm -rf dist/

# Production build
npm run build
```

**Očakávané výstup:**
- `dist/spa/` priečinok vytvorený
- Všetky assets minifikované
- Production API URL použité

### 2.2 Overenie Build

```bash
# Skontroluj, že build obsahuje production API URL
grep -r "api.dreamhubb.com" dist/spa/ || echo "⚠️ Production URL not found"

# Skontroluj, že dev routes nie sú v build
grep -r "__dev" dist/spa/ && echo "❌ Dev routes found in build!" || echo "✅ No dev routes"
```

---

## 📱 Step 3: Sync Capacitor

### 3.1 Sync Web Assets

```bash
cd dreamhubb-FE

# Sync web assets do iOS projektu
npx cap sync ios
```

**Očakávané:**
- `ios/App/App/public/` aktualizovaný s `dist/spa/`
- Capacitor plugins synchronizované

### 3.2 Overenie Sync

```bash
# Skontroluj, že iOS projekt existuje
ls -la ios/App/App.xcodeproj

# Skontroluj, že public priečinok existuje
ls -la ios/App/App/public/
```

---

## 🍎 Step 4: Xcode Configuration

### 4.1 Otvorenie Projektu

```bash
cd dreamhubb-FE

# Otvor Xcode workspace
open ios/App/App.xcworkspace
```

**Poznámka:** Použi `.xcworkspace`, nie `.xcodeproj` (ak používa CocoaPods).

### 4.2 Signing & Capabilities

1. **Project Navigator:** Select "App" project → Select "App" target
2. **Signing & Capabilities tab:**
   - ✅ **Team:** Vyber tvoj Apple Developer Team
   - ✅ **Bundle Identifier:** `com.dreamhubb` (over, že zodpovedá App ID)
   - ✅ **Provisioning Profile:** Automaticky vybraný (alebo manuálne vyber App Store profile)

### 4.3 Version & Build

1. **General tab:**
   - **Version (Marketing Version):** `1.0.0` (zodpovedá package.json)
   - **Build (Current Project Version):** `1` (increment pre každý nový build)

**Pozri:** `docs/KROK9_VERSIONING.md` pre detailné kroky.

### 4.4 Build Configuration

1. **Product → Scheme → Edit Scheme:**
   - **Run:** Debug (pre development)
   - **Archive:** Release (pre App Store)

2. **Product → Destination:**
   - **Any iOS Device** (pre archive)

---

## 📦 Step 5: Archive

### 5.1 Clean Build

1. **Product → Clean Build Folder** (Shift+Cmd+K)

### 5.2 Archive

1. **Product → Destination:** Select "Any iOS Device"
2. **Product → Archive**

**Očakávané:**
- Xcode začne build proces
- Po dokončení sa otvorí **Organizer** (Archives window)

### 5.3 Overenie Archivu

V **Organizer** (Archives):
- ✅ **App Name:** dreamhubb
- ✅ **Version:** 1.0.0
- ✅ **Build:** 1
- ✅ **Date:** Aktuálny dátum

---

## ☁️ Step 6: Upload to App Store Connect

### 6.1 Validate App

1. V **Organizer** (Archives), select najnovší archive
2. Klikni **Distribute App**
3. **Distribution method:** App Store Connect
4. **Distribution options:**
   - ✅ **Upload** (nie Export)
   - ✅ **Automatically manage signing** (odporúčané)
5. **App Store Connect options:**
   - ✅ **Upload your app's symbols** (pre crash reports)
6. Klikni **Upload**

**Očakávané:**
- Validation prebehne
- Upload začne
- Po dokončení: "Upload successful"

### 6.2 Common Validation Errors

#### ❌ Bundle ID Mismatch
**Príčina:** Bundle ID v Xcode neodpovedá App ID v App Store Connect  
**Riešenie:** Over Bundle ID v Xcode (Signing & Capabilities) a App Store Connect

#### ❌ Provisioning Profile Missing
**Príčina:** Chýba App Store provisioning profile  
**Riešenie:** V Xcode → Signing & Capabilities → Automatically manage signing (alebo manuálne vytvor profile)

#### ❌ Missing Privacy Policy URL
**Príčina:** App Store Connect vyžaduje Privacy Policy URL  
**Riešenie:** Pridaj Privacy Policy URL v App Store Connect → App Information

#### ❌ Export Compliance
**Príčina:** App používa encryption (HTTPS)  
**Riešenie:** V App Store Connect → App Information → Export Compliance → "No" (ak používaš len štandardné HTTPS)

---

## 🧪 Step 7: TestFlight

### 7.1 Internal Testing

1. **App Store Connect → TestFlight:**
   - Po upload (cca 10-30 min) sa app zobrazí v TestFlight
   - **Internal Testing:**
     - Pridaj Internal Testers (Apple Developer Team members)
     - Build bude dostupný automaticky

### 7.2 External Testing (Optional)

1. **App Store Connect → TestFlight → External Testing:**
   - Vytvor External Test Group
   - Pridaj build do skupiny
   - **Beta App Review:** Submit pre review (vyžaduje sa pre external testing)
   - Po schválení: Testers dostanú email s TestFlight linkom

### 7.3 Compliance Notes (ak sa vyžaduje)

**Export Compliance:**
- Ak sa pýta na encryption: "No" (ak používaš len štandardné HTTPS)
- Ak používaš custom encryption: Vyplň compliance form

**Content Rights:**
- Potvrď, že máš práva na všetok obsah (obrázky, texty)

---

## 🚀 Step 8: App Store Submission

### 8.1 App Information

1. **App Store Connect → App Information:**
   - ✅ **Name:** dreamhubb
   - ✅ **Subtitle:** (voliteľné)
   - ✅ **Category:** (vyber kategóriu)
   - ✅ **Privacy Policy URL:** (vyžadované)
   - ✅ **Support URL:** (vyžadované)

### 8.2 Version Information

1. **App Store Connect → 1.0.0 (Prepare for Submission):**
   - ✅ **What's New:** (pridaj release notes)
   - ✅ **Screenshots:** (pridaj screenshots pre rôzne veľkosti)
   - ✅ **Description:** (pridaj app description)
   - ✅ **Keywords:** (pridaj keywords)
   - ✅ **Support URL:** (pridaj support URL)
   - ✅ **Marketing URL:** (voliteľné)

### 8.3 Build Selection

1. **Build:** Select build z TestFlight (1.0.0, Build 1)

### 8.4 App Review Information

1. **App Review Information:**
   - ✅ **Contact Information:** (tvoj email/phone)
   - ✅ **Demo Account:** (ak je potrebné)
   - ✅ **Notes:** (pridaj poznámky pre reviewer)

**Pozri:** `docs/KROK9_APPSTORE_METADATA.md` pre templates.

### 8.5 Version Release

1. **Version Release:**
   - **Automatic:** App sa automaticky zverejní po schválení
   - **Manual:** Ty rozhodneš, kedy zverejniť

### 8.6 Submit for Review

1. Klikni **Submit for Review**
2. Over všetky informácie
3. Potvrď submission

**Očakávané:**
- Status: **Waiting for Review** (cca 24-48 hodín)
- Po schválení: **Ready for Sale** (ak je Automatic Release)

---

## 🛑 STOP SHIP Kritériá

**NEPOSIELAJ do App Store, ak:**

1. ❌ **Crash on Launch:** App sa crashuje pri spustení
2. ❌ **Login Broken:** Login nefunguje
3. ❌ **Offline → Online Fail:** Offline banner sa nezobrazí alebo Retry nefunguje
4. ❌ **Token Refresh Loop:** Infinite refresh loop
5. ❌ **Dev Endpoints Accessible:** `/api/dev/*` sú dostupné v production build
6. ❌ **Raw Error Text:** Raw error texty sa zobrazujú v UI
7. ❌ **Missing Privacy Policy:** Privacy Policy URL chýba
8. ❌ **Missing Screenshots:** Chýbajú screenshots pre požadované veľkosti
9. ❌ **Version Mismatch:** Version v package.json ≠ iOS Marketing Version

**Overenie:**
```bash
# Spusti preflight
npm run preflight

# Spusti prod-safety-check
npm run prod-safety-check

# Spusti E2E tests (ak je možné)
npm run e2e:release
```

---

## 🔧 Troubleshooting

### Build Fails

**Príčina:** Chyby v build procese  
**Riešenie:**
- Skontroluj Xcode console pre chyby
- Skontroluj, že všetky dependencies sú nainštalované (`pod install` v `ios/App/`)
- Clean build folder (Product → Clean Build Folder)

### Archive Fails

**Príčina:** Signing alebo provisioning problémy  
**Riešenie:**
- Over Signing & Capabilities v Xcode
- Over, že máš správny provisioning profile
- Skús "Automatically manage signing"

### Upload Fails

**Príčina:** Validation errors  
**Riešenie:**
- Skontroluj validation errors v Organizer
- Over Bundle ID, Version, Build Number
- Skontroluj, že máš správne certificates

### TestFlight Build Not Appearing

**Príčina:** Upload ešte neprebehol alebo processing  
**Riešenie:**
- Počkaj 10-30 minút (processing time)
- Skontroluj App Store Connect → TestFlight → Builds
- Skontroluj email pre notifikácie

---

## ✅ Checklist Pre Release

### Pred Buildom
- [ ] Production API URL nastavené
- [ ] Version synchronizovaný (package.json ↔ iOS)
- [ ] Build number incrementovaný
- [ ] Dev routes overené (nie sú v production build)
- [ ] Preflight check prešiel

### Pred Archive
- [ ] Frontend build úspešný
- [ ] Capacitor sync úspešný
- [ ] Xcode signing správne nastavené
- [ ] Version & Build správne nastavené

### Pred Upload
- [ ] Archive úspešný
- [ ] Archive validovaný
- [ ] Privacy Policy URL pridaný v App Store Connect
- [ ] Support URL pridaný v App Store Connect

### Pred Submission
- [ ] TestFlight build testovaný (internal testing)
- [ ] Screenshots pridané
- [ ] Description pridaný
- [ ] Keywords pridané
- [ ] Reviewer notes pridané
- [ ] Demo account pridaný (ak je potrebné)
- [ ] STOP SHIP kritériá overené

---

## 📚 Súvisiace Dokumenty

- `docs/KROK9_VERSIONING.md` - Versioning process
- `docs/KROK9-RELEASE-AUDIT.md` - Release audit
- `docs/KROK9_APPSTORE_METADATA.md` - App Store metadata templates
- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy & compliance

---

**Poznámka:** Tento runbook je **manuálny proces**. Pre automatizáciu by bolo potrebné vytvoriť CI/CD pipeline (napr. Fastlane), čo je **TODO pre budúcu vylepšenie**.
