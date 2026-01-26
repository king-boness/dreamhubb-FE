# KROK 9 Versioning Process

## 📋 Prehľad

Tento dokument popisuje, ako sa spravuje versioning pre iOS App Store release.

---

## 🔢 Version Format

**Format:** `MAJOR.MINOR.PATCH` (semantic versioning)

**Príklady:**
- `1.0.0` - Prvý release
- `1.0.1` - Patch (bug fixes)
- `1.1.0` - Minor (nové features)
- `2.0.0` - Major (breaking changes)

---

## 📍 Kde sa Nastavuje Version

### 1. Frontend (package.json)
```json
{
  "version": "1.0.0"
}
```
**Lokalizácia:** `dreamhubb-FE/package.json`

### 2. iOS (Xcode Project)
**Marketing Version (CFBundleShortVersionString):**
- Zobrazuje sa v App Store
- Format: `MAJOR.MINOR.PATCH` (napr. `1.0.0`)

**Build Number (CFBundleVersion):**
- Interný build number (incrementuje sa pri každom build)
- Format: číslo (napr. `1`, `2`, `3`, ...)
- **Dôležité:** App Store vyžaduje, aby každý nový build mal vyšší build number

**Lokalizácia:** `dreamhubb-FE/ios/App/App.xcodeproj/project.pbxproj`
- `MARKETING_VERSION = 1.0.0;`
- `CURRENT_PROJECT_VERSION = 1;`

### 3. Capacitor Config
**Lokalizácia:** `dreamhubb-FE/capacitor.config.ts`
- Momentálne neobsahuje explicit version (používa sa z iOS projektu)

---

## 🔄 Versioning Workflow

### Pre Nový Release

1. **Aktualizuj package.json:**
   ```bash
   cd dreamhubb-FE
   # Manuálne uprav package.json: "version": "1.0.0"
   ```

2. **Aktualizuj iOS Marketing Version v Xcode:**
   - Otvor `ios/App/App.xcodeproj` v Xcode
   - Project Navigator → Select "App" project → Select "App" target
   - General tab → Identity section
   - **Version:** `1.0.0` (zodpovedá package.json)
   - **Build:** Increment (napr. `1` → `2`)

3. **Overenie:**
   ```bash
   # Skontroluj package.json
   cat package.json | grep version
   
   # Skontroluj Xcode project (manuálne v Xcode)
   ```

### Pre Patch Release (napr. 1.0.0 → 1.0.1)

1. **package.json:** `"version": "1.0.1"`
2. **Xcode Marketing Version:** `1.0.1`
3. **Xcode Build Number:** Increment (napr. `2` → `3`)

### Pre Minor Release (napr. 1.0.0 → 1.1.0)

1. **package.json:** `"version": "1.1.0"`
2. **Xcode Marketing Version:** `1.1.0`
3. **Xcode Build Number:** Increment (napr. `3` → `4`)

---

## ⚠️ Dôležité Poznámky

### Build Number
- **App Store vyžaduje:** Každý nový build musí mať vyšší build number ako predchádzajúci
- **Odporúčanie:** Incrementuj build number pri každom archive (aj pre TestFlight)
- **Format:** Číslo (nie string, nie semantic versioning)

### Marketing Version
- **Zobrazuje sa:** V App Store, na iOS zariadení (Settings → App)
- **Format:** Semantic versioning (`MAJOR.MINOR.PATCH`)
- **Synchronizácia:** Mala by zodpovedať `package.json` version

### Automatizácia (TODO - Future Enhancement)
- Momentálne je versioning **manuálny**
- **Budúca možnosť:** Script na synchronizáciu package.json ↔ Xcode
- **Budúca možnosť:** Automatický build number increment

---

## 🧪 Overenie Version

### Pred Release

1. **Skontroluj package.json:**
   ```bash
   cd dreamhubb-FE
   cat package.json | grep '"version"'
   ```

2. **Skontroluj Xcode:**
   - Otvor `ios/App/App.xcodeproj` v Xcode
   - Project → Target "App" → General tab
   - Over: **Version** a **Build** sú správne

3. **Skontroluj Info.plist (automaticky z Xcode):**
   - `CFBundleShortVersionString` = Marketing Version
   - `CFBundleVersion` = Build Number

---

## 📝 Príklad Pre Prvý Release

### Setup:
- **package.json:** `"version": "1.0.0"`
- **Xcode Marketing Version:** `1.0.0`
- **Xcode Build Number:** `1`

### Pre TestFlight (Internal Testing):
- **Version:** `1.0.0` (nezmenené)
- **Build:** `2` (increment)

### Pre App Store Submission:
- **Version:** `1.0.0` (nezmenené, ak je to rovnaká verzia)
- **Build:** `3` (increment, ak bol už build 2 v TestFlight)

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_IOS_RUNBOOK.md` - iOS build kroky
- `docs/KROK9-RELEASE-AUDIT.md` - Release audit

---

## ✅ Checklist Pre Release

- [ ] package.json version aktualizovaný
- [ ] Xcode Marketing Version aktualizovaný (zodpovedá package.json)
- [ ] Xcode Build Number incrementovaný
- [ ] Version overený v Xcode (General tab)
- [ ] Version overený v Info.plist (cez Xcode)

---

**Poznámka:** Momentálne je versioning **manuálny**. Pre automatizáciu by bolo potrebné vytvoriť script, ktorý synchronizuje package.json ↔ Xcode project. Toto je **TODO pre budúcu vylepšenie**.
