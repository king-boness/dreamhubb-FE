# KROK 9 Step 2 - Mac/Xcode/App Store Connect Runbook

**Cieľ:** Kompletný runbook pre iOS Archive, Upload, TestFlight a App Store submission  
**Platform:** macOS / Xcode  
**Version:** 1.0.0

---

## 📋 Prerequisites

### 1. Mac Setup
- [ ] macOS nainštalovaný (min. macOS 13+)
- [ ] Xcode nainštalovaný (min. Xcode 14+)
- [ ] Command Line Tools: `xcode-select --install`
- [ ] Apple Developer Account aktívny

### 2. Git & Dependencies
- [ ] Git nainštalovaný
- [ ] Node.js nainštalovaný (v18+)
- [ ] npm nainštalovaný
- [ ] Capacitor CLI: `npx cap --version`

### 3. Apple Developer Setup
- [ ] App ID vytvorený: `com.dreamhubb`
- [ ] Certificates (Development + Distribution)
- [ ] Provisioning Profiles (Development + App Store)
- [ ] Team ID známy

---

## 🔧 Step 1: Repository Setup

### 1.1 Clone/Checkout Release Branch

```bash
# Navigate to project directory
cd ~/projects/dreamhubb-FE  # Alebo tvoja cesta

# Over, že si na release branch
git checkout release/1.0.0
git pull origin release/1.0.0

# Over status
git status
# Malo by byť: "nothing to commit, working tree clean"
```

### 1.2 Install Dependencies

```bash
# Install dependencies
npm ci

# Over, že všetko je nainštalované
npm list --depth=0
```

---

## 📱 Step 2: iOS Version Sync

### 2.1 Sync Version from package.json

```bash
# Sync version z package.json do iOS projektu
npm run ios:sync-version

# Očakávaný výstup:
# ✅ Updated MARKETING_VERSION to 1.0.0
# ✅ Updated CURRENT_PROJECT_VERSION to [build number]
```

**Poznámka:** Build number sa automaticky incrementuje, alebo môžeš nastaviť manuálne:
```bash
IOS_BUILD_NUMBER=1 npm run ios:sync-version
```

### 2.2 Verify Version in Xcode

1. Otvor Xcode:
   ```bash
   open ios/App/App.xcodeproj
   ```

2. V Xcode:
   - Project Navigator → Select "App" project → Select "App" target
   - **General** tab → **Identity** section
   - Over:
     - **Version (Marketing Version):** `1.0.0`
     - **Build (Current Project Version):** `1` (alebo vyššie)

---

## 🔐 Step 3: Signing & Capabilities

### 3.1 Signing Configuration

1. V Xcode:
   - Project Navigator → Select "App" project → Select "App" target
   - **Signing & Capabilities** tab

2. Over:
   - [ ] **Team:** Tvoj Apple Developer Team (nie "None")
   - [ ] **Bundle Identifier:** `com.dreamhubb`
   - [ ] **Provisioning Profile:** Automaticky vybraný (alebo manuálne App Store profile)
   - [ ] **Signing Certificate:** Automaticky vybraný (alebo manuálne Distribution certificate)

### 3.2 Capabilities

Over, že tieto capabilities sú správne nastavené (ak sa používajú):
- [ ] **Push Notifications** (ak sa používa)
- [ ] **Background Modes** (ak sa používa)
- [ ] **App Transport Security Settings** (over ATS exceptions)

### 3.3 App Transport Security (ATS)

Over v `Info.plist` alebo Xcode:
- [ ] **NSAppTransportSecurity** nastavenia
- [ ] **NSAllowsArbitraryLoads** = `false` (pre production)
- [ ] Ak sú ATS exceptions, over, že sú potrebné

**Poznámka:** Pre production by ATS exceptions mali byť minimálne.

---

## 🏗️ Step 4: Build Configuration

### 4.1 Build Configuration

1. V Xcode:
   - **Product** → **Scheme** → **Edit Scheme...**
   - **Run** → **Build Configuration:** `Debug` (pre testovanie)
   - **Archive** → **Build Configuration:** `Release` ✅

2. Over **Destination:**
   - **Product** → **Destination:** `Any iOS Device` (nie Simulator)
   - Alebo vyber konkrétne zariadenie

### 4.2 Clean Build Folder

```bash
# V Xcode: Product → Clean Build Folder (⇧⌘K)
# Alebo terminál:
cd ios/App
xcodebuild clean -project App.xcodeproj -scheme App
```

---

## 📦 Step 5: Archive

### 5.1 Create Archive

1. V Xcode:
   - **Product** → **Archive**
   - Počkaj, kým sa archive dokončí (môže trvať 5-10 minút)

2. **Očakávané:**
   - Archive sa zobrazí v **Organizer** okne
   - Status: "Archive Succeeded"

### 5.2 Verify Archive

1. V Organizer okne:
   - Vyber archive
   - Over:
     - **Version:** `1.0.0`
     - **Build:** `1` (alebo vyššie)
     - **Bundle Identifier:** `com.dreamhubb`

2. **Distribute App:**
   - Klikni **Distribute App**
   - Vyber **App Store Connect**
   - Klikni **Next**

---

## ☁️ Step 6: Upload to App Store Connect

### 6.1 Upload Process

1. V **Distribute App** wizard:
   - **Upload:** Vyber **Upload** (nie Export)
   - **Distribution Options:**
     - [ ] **Include bitcode:** (ak je potrebné, zvyčajne nie)
     - [ ] **Upload symbols:** ✅ (odporúčané)
   - **App Thinning:**
     - [ ] **All compatible device variants** (odporúčané)
   - Klikni **Next**

2. **Signing:**
   - [ ] **Automatically manage signing** (odporúčané)
   - Alebo **Manually manage signing** (ak máš špecifické požiadavky)
   - Klikni **Next**

3. **Review:**
   - Over všetky informácie
   - Klikni **Upload**

### 6.2 Upload Status

- Upload môže trvať 10-30 minút (závisí od veľkosti)
- Po úspešnom upload sa zobrazí: "Upload Succeeded"
- V App Store Connect: Build sa zobrazí v **TestFlight** → **Builds** (môže trvať 10-30 minút na processing)

### 6.3 Common Upload Errors

**"Invalid Bundle":**
- Over Bundle ID, version, build number
- Over signing certificates

**"Missing Compliance":**
- Vyplň Export Compliance v App Store Connect
- Odpovedaj na Export Compliance otázky

**"Signing Error":**
- Over certificates v Keychain
- Over Provisioning Profiles
- Over Team ID

---

## 🧪 Step 7: TestFlight - Internal Testing

### 7.1 Add Build to Internal Testing

1. V App Store Connect:
   - **TestFlight** tab
   - **iOS Builds** section
   - Počkaj, kým build je "Ready to Submit" (môže trvať 10-30 minút)

2. **Add Build:**
   - Vyber build
   - Klikni **Add to Internal Testing**
   - Vyber **Internal Testing** group (alebo vytvor novú)

### 7.2 Internal Testing Setup

1. **Internal Testers:**
   - **Users and Access** → **Internal Testing**
   - Pridaj internal testers (ak ešte nie sú)
   - Internal testers = členovia tvojho App Store Connect teamu

2. **Test Build:**
   - Internal testers dostanú email notifikáciu
   - Môžu stiahnuť build cez TestFlight app
   - Over, že build funguje na vlastnom zariadení

### 7.3 Test Checklist

- [ ] Build sa stiahne cez TestFlight
- [ ] App sa spustí bez crashu
- [ ] Login funguje
- [ ] Offline → Online sync funguje
- [ ] Token refresh funguje
- [ ] Dev endpoints NIE sú dostupné
- [ ] Production API URL sa používa

---

## 🌐 Step 8: TestFlight - External Testing (Optional)

### 8.1 External Testing Setup

1. V App Store Connect:
   - **TestFlight** tab
   - **External Testing** section
   - Klikni **+** pre vytvorenie external testing group

2. **Beta App Review:**
   - Pridaj build do external testing
   - Vyplň **Beta App Review Information:**
     - **What to Test:** Popis, čo testovať
     - **Contact Information:** Email, phone
     - **Notes:** Ďalšie poznámky pre review
   - **Submit for Review**

### 8.2 External Testing Approval

- Beta App Review môže trvať 1-2 dni
- Po approval môžeš pridať external testers
- External testers dostanú email notifikáciu

---

## 📝 Step 9: App Store Connect Metadata

### 9.1 App Information

1. V App Store Connect:
   - **App Store** tab
   - **App Information** section

2. Over:
   - [ ] **App Name:** `dreamhubb`
   - [ ] **Subtitle (EN):** `Share your dreams`
   - [ ] **Subtitle (SK):** `Zdieľaj svoje sny`
   - [ ] **Category:** Primary + Secondary
   - [ ] **Privacy Policy URL:** `https://dreamhubb.com/privacy` (REQUIRED)
   - [ ] **Support URL:** `https://dreamhubb.com/support` (REQUIRED)

**Pozri:** `docs/APP_STORE_CONNECT_PACK.md` pre všetky texty.

### 9.2 Version Information

1. **Version:** `1.0.0`
2. **Description (EN):** Copy z `docs/APP_STORE_CONNECT_PACK.md`
3. **Description (SK):** Copy z `docs/APP_STORE_CONNECT_PACK.md`
4. **Keywords (EN):** `dream, aspiration, goal, idea, community, share, support, inspiration, social, network`
5. **Keywords (SK):** `sen, túžba, cieľ, nápad, komunita, zdieľanie, podpora, inšpirácia, sociálna sieť`
6. **Promo Text (EN+SK):** Copy z `docs/APP_STORE_CONNECT_PACK.md`
7. **What's New (EN+SK):** Copy z `docs/APP_STORE_CONNECT_PACK.md`

### 9.3 Screenshots

1. **Upload Screenshots:**
   - **iPhone 6.7"** (min. 1 screenshot, odporúčané 3-5)
   - **iPhone 6.1"** (min. 1 screenshot, odporúčané 3-5)

2. **Screenshot Shotlist:**
   - Postupuj podľa `docs/KROK9_SCREENSHOT_SHOTLIST.md`
   - Každý screenshot má scenár, obsah a text overlay (EN+SK)

**Pozri:** `docs/KROK9_SCREENSHOT_SHOTLIST.md` pre detailný shotlist.

### 9.4 App Review Information

1. **Contact Information:**
   - **Name:** [YOUR_NAME]
   - **Phone:** [YOUR_PHONE]
   - **Email:** [YOUR_EMAIL]

2. **Notes for Reviewer:**
   - Copy z `docs/APP_STORE_CONNECT_PACK.md`
   - Nahraď placeholders (`[DEMO_EMAIL]`, `[PRIVACY_POLICY_URL]`, atď.)

3. **Demo Account (if applicable):**
   - **Email:** [DEMO_EMAIL]
   - **Password:** [DEMO_PASSWORD]

### 9.5 Age Rating

1. **Answer Questions:**
   - Postupuj podľa `docs/APP_STORE_CONNECT_PACK.md` → Age Rating Checklist
   - Odpovedaj na všetky otázky podľa skutočného obsahu app

2. **Confirm Age Rating:**
   - Over, že age rating je správny
   - Očakávaný: `4+` alebo `12+` (závisí od odpovedí)

---

## 🔒 Step 10: Privacy & Compliance

### 10.1 Privacy Questions

1. V App Store Connect:
   - **App Privacy** tab
   - **Privacy Types** section

2. **Answer Questions:**
   - Postupuj podľa `docs/KROK9_PRIVACY_MATRIX.md`
   - Odpovedaj na všetky privacy questions
   - Over, že všetky data types sú správne označené

### 10.2 Privacy Policy

1. **Privacy Policy URL:**
   - Over, že Privacy Policy je hostovaná na verejnom URL
   - URL je pridaný do App Store Connect
   - Privacy Policy obsah je podľa `docs/PRIVACY_POLICY_TEMPLATE.md`

**Pozri:** `docs/KROK9_PRIVACY_MATRIX.md` a `docs/PRIVACY_POLICY_TEMPLATE.md`.

---

## ✅ Step 11: Pre-Submission Checklist

### 11.1 Build & Version

- [ ] Version = `1.0.0`
- [ ] Build number incrementovaný
- [ ] Build je "Ready to Submit" v App Store Connect
- [ ] Build bol otestovaný v TestFlight (internal/external)

### 11.2 Metadata

- [ ] Všetky metadata vyplnené (App Information, Version Information)
- [ ] Screenshots uploadnuté (min. iPhone 6.7" a 6.1")
- [ ] Privacy Policy URL nastavený
- [ ] Support URL nastavený

### 11.3 Privacy & Compliance

- [ ] Privacy questions zodpovedané
- [ ] Age Rating nastavený
- [ ] Export Compliance vyplnený (ak je potrebné)

### 11.4 App Review

- [ ] Contact Information vyplnené
- [ ] Notes for Reviewer vyplnené
- [ ] Demo Account (ak je potrebné)

---

## 🚀 Step 12: Submit for Review

### 12.1 Final Review

1. V App Store Connect:
   - **App Store** tab
   - **Version Information** section
   - Over všetky sekcie vyššie

2. **Submit for Review:**
   - Klikni **Submit for Review**
   - Over Export Compliance (ak je potrebné)
   - Over Content Rights (ak je potrebné)
   - Klikni **Submit**

### 12.2 Submission Status

- Status sa zmení na **"Waiting for Review"**
- Review môže trvať 1-7 dní (zvyčajne 1-2 dni)
- Sleduj email notifikácie z App Store Connect

---

## ⚠️ Common Issues & Solutions

### Archive Fails

**Problém:** Archive zlyhá s chybou

**Riešenie:**
1. Clean Build Folder (⇧⌘K)
2. Over Signing & Capabilities
3. Over Bundle Identifier
4. Over certificates v Keychain
5. Skús Archive znova

### Upload Fails

**Problém:** Upload do App Store Connect zlyhá

**Riešenie:**
1. Over internet connection
2. Skontroluj certifikáty v Keychain
3. Over Provisioning Profile
4. Over Export Compliance
5. Skús upload znova

### Build Not Appearing in App Store Connect

**Problém:** Build sa nezobrazuje v App Store Connect

**Riešenie:**
1. Počkaj 10-30 minút (processing time)
2. Over, že upload bol úspešný
3. Skontroluj email notifikácie
4. Over v App Store Connect → TestFlight → Builds

### TestFlight Build Not Available

**Problém:** Build nie je dostupný v TestFlight

**Riešenie:**
1. Over, že build je "Ready to Submit"
2. Pridaj build do Internal/External Testing group
3. Over, že testers majú prístup
4. Over email notifikácie pre testers

### Signing Issues

**Problém:** Signing errors v Xcode

**Riešenie:**
1. Over Team v Signing & Capabilities
2. Over certificates v Keychain Access
3. Over Provisioning Profiles v Xcode
4. Skús "Automatically manage signing"
5. Ak to nefunguje, manuálne nastav signing

---

## 🔗 Súvisiace Dokumenty

- `docs/APP_STORE_CONNECT_PACK.md` - App Store Connect metadata (copy/paste ready)
- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Screenshot shotlist
- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy matrix
- `docs/PRIVACY_POLICY_TEMPLATE.md` - Privacy Policy template
- `docs/KROK9_TESTFLIGHT_CHECKLIST.md` - TestFlight checklist
- `docs/KROK9_RELEASE_CHECKLIST.md` - Release checklist
- `docs/KROK9_ROLLBACK_PLAN.md` - Rollback plan

---

## 📝 Quick Reference Commands

```bash
# 1. Checkout release branch
cd dreamhubb-FE
git checkout release/1.0.0
git pull origin release/1.0.0

# 2. Install dependencies
npm ci

# 3. Sync version
npm run ios:sync-version

# 4. Open Xcode
open ios/App/App.xcodeproj

# 5. Build (v Xcode)
# Product → Archive

# 6. Upload (v Xcode Organizer)
# Distribute App → App Store Connect → Upload
```

---

**Poznámka:** Po úspešnom submission budeš dostávať email notifikácie o review status. Sleduj App Store Connect pre updates.
