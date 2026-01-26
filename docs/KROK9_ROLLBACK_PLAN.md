# KROK 9 Rollback Plan

**Cieľ:** Postup pri rollbacke, ak build padne alebo je potrebné revertovať zmeny

---

## 🚨 Kedy Použiť Rollback

### Critical Issues
- Build zlyhá v Xcode (Archive fails)
- Upload do App Store Connect zlyhá
- TestFlight build má kritické bugy (crash on launch, login broken)
- App Store Review rejection kvôli kritickým problémom
- Production API má kritické problémy

### Non-Critical Issues
- Menšie bugy (nie kritické)
- UI issues (nie blokujúce)
- Performance issues (nie blokujúce)
- Metadata issues (dá sa opraviť bez nového buildu)

---

## 📋 Rollback Scenarios

### Scenario 1: Build Fails in Xcode

**Symptómy:**
- Archive zlyhá
- Build errors v Xcode
- Signing issues

**Rollback Steps:**
1. **Zastav release proces**
2. **Identifikuj problém:**
   ```bash
   # FE
   cd dreamhubb-FE
   npm run build  # Over, či build funguje lokálne
   npm run ios:release-sanity  # Over iOS sanity
   ```
3. **Oprav problém:**
   - Ak je to signing issue: Over certifikáty a provisioning profiles
   - Ak je to build error: Oprav kód alebo dependencies
   - Ak je to version issue: Over version v package.json a Xcode
4. **Test lokálne:**
   ```bash
   npm run build
   npm run ios:release-sanity
   ```
5. **Ak sa problém nedá rýchlo opraviť:**
   - Revert zmeny v release branch:
     ```bash
     git checkout release/1.0.0
     git log  # Nájd posledný working commit
     git revert <commit-hash>  # Alebo git reset --hard <commit-hash>
     ```
   - Alebo vytvor hotfix branch:
     ```bash
     git checkout -b hotfix/1.0.0-build-fix
     # Oprav problém
     git commit -m "hotfix: fix build issue"
     git push -u origin hotfix/1.0.0-build-fix
     ```

---

### Scenario 2: Upload Fails

**Symptómy:**
- Upload do App Store Connect zlyhá
- "Invalid Bundle" error
- "Missing Compliance" error

**Rollback Steps:**
1. **Zastav release proces**
2. **Identifikuj problém:**
   - Over error message v Xcode Organizer
   - Over App Store Connect → Activity → Builds
3. **Oprav problém:**
   - Invalid Bundle: Over Bundle ID, version, build number
   - Missing Compliance: Vyplň Export Compliance v App Store Connect
   - Signing: Over certifikáty a provisioning profiles
4. **Ak sa problém nedá rýchlo opraviť:**
   - Použi predchádzajúci archive (ak existuje)
   - Alebo vytvor nový archive po oprave

---

### Scenario 3: TestFlight Build Has Critical Bugs

**Symptómy:**
- Crash on launch
- Login broken
- Offline → Online fail
- Token refresh loop
- Dev endpoints accessible

**Rollback Steps:**
1. **Zastav release proces**
2. **Identifikuj problém:**
   - Test na TestFlight build
   - Zaznamenaj kroky na reprodukciu
   - Over logy (ak sú dostupné)
3. **Oprav problém:**
   - Vytvor hotfix branch:
     ```bash
     git checkout release/1.0.0
     git checkout -b hotfix/1.0.0-critical-bug
     # Oprav problém
     git commit -m "hotfix: fix critical bug [description]"
     ```
   - Test lokálne:
     ```bash
     npm run build
     npm run test
     npm run test:e2e
     ```
4. **Vytvor nový build:**
   - Increment build number
   - Archive v Xcode
   - Upload do App Store Connect
   - Pridaj do TestFlight
5. **Ak sa problém nedá rýchlo opraviť:**
   - Revert release branch na predchádzajúci working commit
   - Alebo vytvor emergency hotfix release (1.0.1)

---

### Scenario 4: App Store Review Rejection

**Symptómy:**
- App Store Review rejection
- Reviewer notes s kritickými problémami

**Rollback Steps:**
1. **Zastav release proces**
2. **Prečítaj reviewer notes:**
   - Identifikuj konkrétne problémy
   - Over, či sú to legitímne problémy
3. **Oprav problém:**
   - Ak je to legitímny problém: Oprav podľa reviewer notes
   - Ak je to false positive: Odpovedaj reviewer notes s vysvetlením
4. **Vytvor nový build (ak je potrebné):**
   - Increment build number
   - Archive v Xcode
   - Upload do App Store Connect
   - Resubmit pre review
5. **Ak sa problém nedá rýchlo opraviť:**
   - Odlož release
   - Vytvor hotfix branch pre opravu
   - Plánuj nový release dátum

---

### Scenario 5: Production API Issues

**Symptómy:**
- Production API má kritické problémy
- API endpoints nefungujú
- Database issues

**Rollback Steps:**
1. **Zastav release proces**
2. **Identifikuj problém:**
   - Over production API health endpoint
   - Over production logs
   - Over database status
3. **Oprav problém:**
   - BE hotfix (ak je potrebné):
     ```bash
     cd dreamhubb-BE
     git checkout release/1.0.0
     git checkout -b hotfix/1.0.0-api-fix
     # Oprav problém
     git commit -m "hotfix: fix production API issue"
     ```
   - Deploy hotfix do production
4. **Test production API:**
   ```bash
   curl https://api.dreamhubb.com/api/health
   ```
5. **Ak sa problém nedá rýchlo opraviť:**
   - Revert BE release branch
   - Alebo vytvor emergency hotfix release

---

## 🔄 Git Rollback Commands

### Revert Last Commit
```bash
git checkout release/1.0.0
git revert HEAD
git push origin release/1.0.0
```

### Reset to Previous Commit
```bash
git checkout release/1.0.0
git log  # Nájd working commit hash
git reset --hard <commit-hash>
git push --force origin release/1.0.0  # ⚠️ Use with caution
```

### Create Hotfix Branch
```bash
git checkout release/1.0.0
git checkout -b hotfix/1.0.0-<issue-description>
# Oprav problém
git commit -m "hotfix: fix [issue]"
git push -u origin hotfix/1.0.0-<issue-description>
```

---

## ⚠️ Important Notes

### Force Push Warning
- **NIKDY** neforce push do `main` alebo `fix/location-onboarding`
- **LEN** force push do release branch, ak je to absolútne nutné
- **VŽDY** informuj team pred force push

### Backup Before Rollback
- Vytvor backup pred rollbackom:
  ```bash
  git checkout release/1.0.0
  git tag backup/pre-rollback-$(date +%Y%m%d-%H%M%S)
  git push origin --tags
  ```

### Communication
- **VŽDY** informuj team o rollbacke
- Dokumentuj dôvod rollbacku
- Vytvor issue/ticket pre tracking

---

## 📝 Rollback Checklist

### Before Rollback
- [ ] Identifikuj problém
- [ ] Over, že rollback je nutný
- [ ] Vytvor backup (git tag)
- [ ] Informuj team

### During Rollback
- [ ] Zastav release proces
- [ ] Vykonaj rollback kroky
- [ ] Over, že rollback bol úspešný
- [ ] Dokumentuj rollback

### After Rollback
- [ ] Test, že všetko funguje
- [ ] Vytvor issue pre tracking
- [ ] Plánuj opravu a nový release
- [ ] Update dokumentáciu

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook
- `docs/KROK9_RELEASE_CHECKLIST.md` - Release checklist
- `docs/KROK9_TESTFLIGHT_CHECKLIST.md` - TestFlight checklist

---

**Poznámka:** Rollback by mal byť poslednou možnosťou. Vždy sa snaž najprv opraviť problém, a len ak to nie je možné, použij rollback.
