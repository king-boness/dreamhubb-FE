# KROK 9 TestFlight Checklist

**Cieľ:** Checklist pre TestFlight internal/external testing a "what to check before submitting"

---

## 📱 TestFlight Overview

**TestFlight** je Apple's beta testing platforma, ktorá umožňuje:
- **Internal Testing:** Testovanie medzi členmi App Store Connect teamu (max 100 testerov)
- **External Testing:** Testovanie s externými testermi (max 10,000 testerov, vyžaduje App Review)

---

## 🔐 Internal Testing vs External Testing

### Internal Testing

**Kto môže testovať:**
- Členovia App Store Connect teamu (App Manager, Admin, Developer roles)
- Max 100 testerov

**Výhody:**
- ✅ Rýchle (build je dostupný okamžite po upload)
- ✅ Nevyžaduje App Review
- ✅ Vhodné pre early testing a QA

**Nevýhody:**
- ❌ Obmedzený počet testerov (100)
- ❌ Len pre team members

**Kedy použiť:**
- Early testing pred external release
- QA testing
- Team validation

### External Testing

**Kto môže testovať:**
- Ktokoľvek s TestFlight linkom
- Max 10,000 testerov

**Výhody:**
- ✅ Viac testerov (10,000)
- ✅ Real-world testing
- ✅ Feedback od externých používateľov

**Nevýhody:**
- ❌ Vyžaduje App Review (Beta App Review)
- ❌ Môže trvať 24-48 hodín na schválenie
- ❌ Musí spĺňať App Store guidelines

**Kedy použiť:**
- Po internal testing
- Pred App Store submission
- Public beta testing

---

## ✅ Pre-upload Checklist (Pred Uploadom do TestFlight)

### 1. Build Readiness

- [ ] **Version & Build Number:**
  - [ ] Version (MARKETING_VERSION) je nastavený a zodpovedá package.json
  - [ ] Build number (CURRENT_PROJECT_VERSION) je incrementovaný
  - [ ] Overené v Xcode (General tab)

- [ ] **Signing & Provisioning:**
  - [ ] Signing je správne nastavené (Team, Bundle ID)
  - [ ] Provisioning profile je validný
  - [ ] Certificates sú platné

- [ ] **Archive:**
  - [ ] Archive je úspešný
  - [ ] Archive je validovaný (bez errors)
  - [ ] Archive obsahuje správny build

### 2. Code Quality

- [ ] **Release Gate:**
  - [ ] `npm run release:gate` prešiel (PASS)
  - [ ] Všetky checks sú OK

- [ ] **iOS Sanity:**
  - [ ] `npm run ios:release-sanity` prešiel (PASS)
  - [ ] Žiadne kritické errors

- [ ] **Production Safety:**
  - [ ] `npm run prod-safety-check` prešiel (PASS)
  - [ ] Dev routes nie sú v production build

### 3. Functionality

- [ ] **Core Features:**
  - [ ] Login funguje
  - [ ] Feed sa načíta
  - [ ] Post creation funguje
  - [ ] Image upload funguje
  - [ ] Notifications fungujú (ak sú implementované)

- [ ] **Error Handling:**
  - [ ] Offline banner sa zobrazí (ak je offline)
  - [ ] Retry button funguje
  - [ ] Safe error messages (nie raw texty)
  - [ ] Token refresh funguje (bez loops)

- [ ] **Edge Cases:**
  - [ ] Expired token → redirect na login (bez loop)
  - [ ] Network timeout → safe toast + Retry UI
  - [ ] 500 error → safe toast + Retry UI
  - [ ] 403/404 error → safe toast (bez Retry)

### 4. Assets

- [ ] **App Icon:**
  - [ ] App icon existuje (1024x1024)
  - [ ] App icon je správnej veľkosti
  - [ ] App icon je bez alpha channel (ak je potrebné)

- [ ] **Splash Screen:**
  - [ ] Splash screen existuje
  - [ ] Splash screen je správnej veľkosti

### 5. Privacy & Compliance

- [ ] **Privacy Policy:**
  - [ ] Privacy Policy je vyplnená a hostovaná
  - [ ] Privacy Policy URL je pridaný v App Store Connect
  - [ ] Privacy Policy je dostupná v app (Settings → Privacy Policy)

- [ ] **Info.plist Permissions:**
  - [ ] Všetky potrebné permissions sú pridané (camera, photos, atď.)
  - [ ] Permission descriptions sú pridané (NSCameraUsageDescription, atď.)

---

## 🧪 Internal Testing Checklist

### Setup

- [ ] **App Store Connect:**
  - [ ] Build je uploadnutý a processed (10-30 min)
  - [ ] Build je dostupný v TestFlight → Internal Testing

- [ ] **Testers:**
  - [ ] Internal testers sú pridaní (App Store Connect → Users and Access)
  - [ ] Testers majú správne role (App Manager, Admin, Developer)

### Testing

- [ ] **Installation:**
  - [ ] Testers môžu nainštalovať app cez TestFlight
  - [ ] App sa spustí bez crashov

- [ ] **Core Functionality:**
  - [ ] Login funguje
  - [ ] Feed sa načíta
  - [ ] Post creation funguje
  - [ ] Image upload funguje

- [ ] **Error Handling:**
  - [ ] Offline → Online recovery funguje
  - [ ] Error messages sú safe (nie raw texty)
  - [ ] Retry button funguje

- [ ] **Feedback:**
  - [ ] Testers môžu posielať feedback cez TestFlight
  - [ ] Crash reports sú dostupné (ak sa vyskytnú)

---

## 🌍 External Testing Checklist

### Setup

- [ ] **App Store Connect:**
  - [ ] Build je uploadnutý a processed
  - [ ] Build je pridaný do External Testing group
  - [ ] Beta App Review je submitted (ak je potrebné)

- [ ] **Beta App Review:**
  - [ ] Beta App Review je submitted
  - [ ] Beta App Review je schválený (24-48 hodín)
  - [ ] Build je dostupný pre external testers

- [ ] **Testers:**
  - [ ] External testers sú pridaní (email addresses)
  - [ ] Testers dostali TestFlight invitation email
  - [ ] TestFlight link je dostupný (ak je public link)

### Testing

- [ ] **Installation:**
  - [ ] External testers môžu nainštalovať app
  - [ ] App sa spustí bez crashov

- [ ] **Core Functionality:**
  - [ ] Všetky core features fungujú
  - [ ] Error handling funguje
  - [ ] Offline support funguje

- [ ] **Feedback:**
  - [ ] Testers môžu posielať feedback
  - [ ] Crash reports sú dostupné
  - [ ] Feedback je reviewovaný

---

## 🚨 What to Check Before Submitting to App Store

### Critical Checks

- [ ] **Crash on Launch:**
  - [ ] App sa spustí bez crashov
  - [ ] Žiadne console errors pri launch

- [ ] **Login Broken:**
  - [ ] Login funguje s valid credentials
  - [ ] Invalid credentials zobrazujú safe error
  - [ ] Token refresh funguje (bez loops)

- [ ] **Offline → Online Fail:**
  - [ ] Offline banner sa zobrazí (ak je offline)
  - [ ] Retry button funguje po obnovení spojenia
  - [ ] Žiadne stuck loading states

- [ ] **Token Refresh Loop:**
  - [ ] Token refresh funguje bez infinite loops
  - [ ] Expired token → redirect na login (bez loop)
  - [ ] Single-flight refresh funguje

- [ ] **Dev Endpoints Accessible:**
  - [ ] `/api/dev/*` nie sú dostupné v production build
  - [ ] `/__dev/qa` nie je dostupné v production build
  - [ ] Prod-safety-check prešiel

- [ ] **Raw Error Text:**
  - [ ] Žiadne raw error texty v UI (napr. "500", "ERR_NETWORK")
  - [ ] Všetky error messages používajú i18n kľúče
  - [ ] Safe toasty sú použité

### Functionality Checks

- [ ] **Core Features:**
  - [ ] Login/Register funguje
  - [ ] Feed sa načíta a zobrazuje posts
  - [ ] Post creation funguje
  - [ ] Image upload funguje
  - [ ] Post detail funguje
  - [ ] Notifications fungujú (ak sú implementované)
  - [ ] Profile funguje
  - [ ] Settings fungujú

- [ ] **Error Handling:**
  - [ ] 500 error → safe toast + Retry UI
  - [ ] 403 error → safe toast (bez Retry)
  - [ ] 404 error → safe toast (bez Retry)
  - [ ] 429 error → safe toast + Retry UI
  - [ ] Network timeout → safe toast + Retry UI
  - [ ] Offline → safe toast + OfflineBanner

- [ ] **Edge Cases:**
  - [ ] Expired token počas akcie → safe toast + redirect
  - [ ] Language switch počas error → text sa zmení na správny jazyk
  - [ ] Multi-tab sanity → žiadny refresh loop

### Compliance Checks

- [ ] **Privacy:**
  - [ ] Privacy Policy URL je pridaný v App Store Connect
  - [ ] Privacy Policy je hostovaná a dostupná
  - [ ] Privacy Policy obsahuje všetky potrebné informácie

- [ ] **Permissions:**
  - [ ] Všetky potrebné permissions sú v Info.plist
  - [ ] Permission descriptions sú pridané
  - [ ] Permissions sú používané len keď je potrebné

- [ ] **Age Rating:**
  - [ ] Age rating questions sú zodpovedané
  - [ ] Age rating je správny (4+ alebo 12+)

### Metadata Checks

- [ ] **App Store Connect:**
  - [ ] App name je nastavený
  - [ ] Description je pridaný (EN+SK)
  - [ ] Keywords sú pridané (EN+SK)
  - [ ] Screenshots sú uploadnuté (iPhone 6.7", iPhone 6.1")
  - [ ] Support URL je pridaný
  - [ ] Privacy Policy URL je pridaný
  - [ ] Reviewer notes sú pridané

---

## 📋 TestFlight Workflow

### Step 1: Upload Build

1. **Archive v Xcode:**
   - Product → Archive
   - Po dokončení sa otvorí Organizer

2. **Upload:**
   - V Organizer, select archive
   - Klikni "Distribute App"
   - Select "App Store Connect"
   - Upload (nie Export)

3. **Processing:**
   - Počkaj 10-30 minút na processing
   - Build sa zobrazí v App Store Connect → TestFlight → Builds

### Step 2: Internal Testing

1. **Add Build to Internal Testing:**
   - App Store Connect → TestFlight → Internal Testing
   - Klikni "+" alebo "Add Build"
   - Select build

2. **Add Testers (if needed):**
   - App Store Connect → Users and Access
   - Pridaj team members (ak ešte nie sú)

3. **Testing:**
   - Testers dostanú email s TestFlight linkom
   - Testers môžu nainštalovať app cez TestFlight app

### Step 3: External Testing (Optional)

1. **Create External Testing Group:**
   - App Store Connect → TestFlight → External Testing
   - Klikni "+" alebo "Create Group"
   - Pomenuj skupinu (napr. "Beta Testers")

2. **Add Build:**
   - Select build
   - Submit for Beta App Review (ak je potrebné)

3. **Beta App Review:**
   - Počkaj 24-48 hodín na review
   - Po schválení: build je dostupný pre external testers

4. **Add Testers:**
   - Pridaj email addresses testers
   - Testers dostanú TestFlight invitation email

---

## ✅ Final Checklist Pre App Store Submission

### Pred Submit for Review

- [ ] **Build:**
  - [ ] Build je testovaný v TestFlight (internal alebo external)
  - [ ] Žiadne kritické bugs
  - [ ] Všetky core features fungujú

- [ ] **Metadata:**
  - [ ] App name, description, keywords sú pridané
  - [ ] Screenshots sú uploadnuté
  - [ ] Support URL a Privacy Policy URL sú pridané
  - [ ] Reviewer notes sú pridané

- [ ] **Compliance:**
  - [ ] Privacy Policy je hostovaná a dostupná
  - [ ] Age rating je správny
  - [ ] Všetky permissions sú správne

- [ ] **Release Gate:**
  - [ ] `npm run release:gate` prešiel (PASS)
  - [ ] `npm run ios:release-sanity` prešiel (PASS)
  - [ ] Všetky checks sú OK

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook
- `docs/KROK9_VERSIONING.md` - Versioning process
- `docs/APP_STORE_CONNECT_PACK.md` - App Store Connect metadata

---

**Poznámka:** TestFlight je dôležitý krok pred App Store submission. Vždy testuj v TestFlight pred submitom do App Store, aby si zachytil bugs a problémy skôr, ako sa dostanú k end users.
