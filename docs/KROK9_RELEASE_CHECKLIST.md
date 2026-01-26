# KROK 9 Release Checklist - Manual Steps (Mac/Xcode)

**Cieľ:** iOS App Store Release - Manual Steps  
**Platform:** macOS / Xcode  
**Version:** 1.0.0

---

## 📋 Pre-Release Checklist (10-15 bodov)

### 1. Environment Setup
- [ ] Mac s Xcode nainštalovaným (min. Xcode 14+)
- [ ] Apple Developer Account aktívny
- [ ] Certifikáty a Provisioning Profiles nastavené v Xcode
- [ ] Production API URL nastavená v `.env.production`

### 2. Version & Build Number
- [ ] `package.json` version = `1.0.0` ✅ (už nastavené)
- [ ] Spusti `npm run ios:sync-version` na synchronizáciu version do Xcode
- [ ] Over v Xcode: Project → Target "App" → General tab
  - [ ] **Version (Marketing Version):** `1.0.0`
  - [ ] **Build (Current Project Version):** Increment (napr. `1` → `2`)

### 3. Xcode Configuration
- [ ] Otvor `ios/App/App.xcodeproj` v Xcode
- [ ] Over **Signing & Capabilities:**
  - [ ] Team nastavený
  - [ ] Bundle Identifier: `com.dreamhubb`
  - [ ] Provisioning Profile správny
- [ ] Over **Build Configuration:**
  - [ ] Scheme: `App` (Release)
  - [ ] Destination: `Any iOS Device` (nie Simulator)

### 4. Build & Archive
- [ ] Clean Build Folder: `Product → Clean Build Folder` (⇧⌘K)
- [ ] Archive: `Product → Archive` (⌘B potom Archive)
- [ ] Over, že archive bol úspešný
- [ ] Over, že sa zobrazilo "Organizer" okno s archive

### 5. Upload to App Store Connect
- [ ] V Organizer okne: Vyber archive → **Distribute App**
- [ ] Vyber **App Store Connect**
- [ ] Postupuj cez wizard:
  - [ ] Upload (nie Export)
  - [ ] Over signing options
  - [ ] Upload
- [ ] Over, že upload bol úspešný
- [ ] Over v App Store Connect, že build sa zobrazil (môže trvať 10-30 min)

### 6. TestFlight - Internal Testing
- [ ] V App Store Connect: **TestFlight** tab
- [ ] Over, že build je "Processing" alebo "Ready to Submit"
- [ ] Pridaj build do **Internal Testing** group
- [ ] Over, že internal testers môžu stiahnuť build
- [ ] Otestuj build na vlastnom zariadení cez TestFlight

### 7. TestFlight - External Testing (Optional)
- [ ] Ak chceš external testing:
  - [ ] Vytvor **External Testing** group
  - [ ] Pridaj build do external testing
  - [ ] Vyplň **Beta App Review Information** (ak je potrebné)
  - [ ] Submit pre Beta App Review
  - [ ] Počkaj na approval (1-2 dni)

### 8. App Store Connect Metadata
- [ ] **App Information:**
  - [ ] App Name: `dreamhubb`
  - [ ] Subtitle (EN): `Share your dreams`
  - [ ] Subtitle (SK): `Zdieľaj svoje sny`
  - [ ] Category: Primary + Secondary
  - [ ] Privacy Policy URL: `https://dreamhubb.com/privacy` (REQUIRED)
  - [ ] Support URL: `https://dreamhubb.com/support` (REQUIRED)
- [ ] **Version Information:**
  - [ ] Description (EN): Copy z `docs/APP_STORE_CONNECT_PACK.md`
  - [ ] Description (SK): Copy z `docs/APP_STORE_CONNECT_PACK.md`
  - [ ] Keywords (EN): `dream, aspiration, goal, idea, community, share, support, inspiration, social, network`
  - [ ] Keywords (SK): `sen, túžba, cieľ, nápad, komunita, zdieľanie, podpora, inšpirácia, sociálna sieť`
  - [ ] Promo Text (EN+SK): Copy z `docs/APP_STORE_CONNECT_PACK.md`
  - [ ] Screenshots: Upload podľa `docs/KROK9_SCREENSHOT_SHOTLIST.md`
    - [ ] iPhone 6.7" (min. 1 screenshot)
    - [ ] iPhone 6.1" (min. 1 screenshot)
  - [ ] What's New (EN+SK): Copy z `docs/APP_STORE_CONNECT_PACK.md`
- [ ] **App Review Information:**
  - [ ] Contact Name, Phone, Email
  - [ ] Notes for Reviewer: Copy z `docs/APP_STORE_CONNECT_PACK.md`
  - [ ] Demo Account (ak je potrebné)
- [ ] **Age Rating:**
  - [ ] Odpovedaj na všetky otázky podľa `docs/APP_STORE_CONNECT_PACK.md`

### 9. Privacy & Compliance
- [ ] **Privacy Questions:**
  - [ ] Odpovedaj na všetky privacy questions podľa `docs/KROK9_PRIVACY_MATRIX.md`
  - [ ] Over, že všetky data types sú správne označené
- [ ] **Privacy Policy:**
  - [ ] Privacy Policy je hostovaná na verejnom URL
  - [ ] URL je pridaný do App Store Connect
  - [ ] Privacy Policy obsah je podľa `docs/PRIVACY_POLICY_TEMPLATE.md`

### 10. Final Submission
- [ ] Over, že všetky metadata sú vyplnené
- [ ] Over, že screenshots sú uploadnuté
- [ ] Over, že build je "Ready to Submit"
- [ ] **Submit for Review:**
  - [ ] Klikni **Submit for Review**
  - [ ] Over Export Compliance (ak je potrebné)
  - [ ] Over Content Rights (ak je potrebné)
  - [ ] Submit
- [ ] Over, že app je v "Waiting for Review" stave

### 11. Post-Submission
- [ ] Sleduj App Store Connect pre review status
- [ ] Priprav sa na možné reviewer questions
- [ ] Over email notifikácie z App Store Connect

---

## ⚠️ Common Issues & Solutions

### Archive Fails
- **Problém:** Archive zlyhá s chybou
- **Riešenie:**
  1. Clean Build Folder (⇧⌘K)
  2. Skontroluj Signing & Capabilities
  3. Over Bundle Identifier
  4. Skús Archive znova

### Upload Fails
- **Problém:** Upload do App Store Connect zlyhá
- **Riešenie:**
  1. Over internet connection
  2. Skontroluj certifikáty v Keychain
  3. Over Provisioning Profile
  4. Skús upload znova

### Build Not Appearing in App Store Connect
- **Problém:** Build sa nezobrazuje v App Store Connect
- **Riešenie:**
  1. Počkaj 10-30 minút (processing time)
  2. Over, že upload bol úspešný
  3. Skontroluj email notifikácie
  4. Over v App Store Connect → TestFlight → Builds

### TestFlight Build Not Available
- **Problém:** Build nie je dostupný v TestFlight
- **Riešenie:**
  1. Over, že build je "Ready to Submit"
  2. Pridaj build do Internal/External Testing group
  3. Over, že testers majú prístup
  4. Over email notifikácie pre testers

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_IOS_RUNBOOK.md` - Detailný iOS build runbook
- `docs/APP_STORE_CONNECT_PACK.md` - App Store Connect metadata
- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Screenshot shotlist
- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy matrix
- `docs/PRIVACY_POLICY_TEMPLATE.md` - Privacy Policy template
- `docs/KROK9_TESTFLIGHT_CHECKLIST.md` - TestFlight checklist

---

## ✅ Final Verification

Pred submission over:
- [ ] Version = `1.0.0`
- [ ] Build number incrementovaný
- [ ] Všetky metadata vyplnené
- [ ] Screenshots uploadnuté
- [ ] Privacy Policy URL nastavený
- [ ] Privacy questions zodpovedané
- [ ] TestFlight testing prebehol úspešne
- [ ] Build je "Ready to Submit"

**Potom môžeš submitnúť pre App Store Review!** 🚀
