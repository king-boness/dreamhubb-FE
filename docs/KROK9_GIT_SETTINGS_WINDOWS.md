# Git Settings for Windows - EOL Normalization

**Cieľ:** Minimalizovať CRLF/LF warningy a zabezpečiť konzistentné line endings v repo

---

## 📋 Odporúčané Git Nastavenia

### Global Settings (Pre všetky repozitárie)

```powershell
# Nastav core.autocrlf na input (LF v repo, CRLF v working directory)
git config --global core.autocrlf input

# Alebo nastav core.autocrlf na false (ak chceš plnú kontrolu)
git config --global core.autocrlf false

# Normalize line endings pri commit
git config --global core.eol lf

# Over, že .gitattributes je respektovaný
git config --global core.attributesfile true
```

### Pre Konkrétny Repozitár

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Nastav pre tento repo
git config core.autocrlf input
git config core.eol lf
```

---

## 🔧 Normalizácia Existujúceho Repo

**Poznámka:** Tieto kroky by mali byť vykonané len raz, ak máš problémy s EOL.

### 1. Normalize All Files

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Re-normalize všetky súbory podľa .gitattributes
git add --renormalize .

# Over zmeny
git status

# Ak sú zmeny len EOL (nie obsah), commitni ich
git commit -m "chore: normalize line endings (LF)"
```

### 2. Over .gitattributes

```powershell
# Skontroluj, že .gitattributes je správne nastavený
cat .gitattributes
```

---

## ⚠️ Dôležité Poznámky

### core.autocrlf Values

- **`true`** (Windows default):
  - CRLF v working directory
  - LF v repo
  - **Problém:** Môže spôsobiť problémy s .gitattributes

- **`input`** (Odporúčané):
  - LF v working directory aj v repo
  - Automaticky konvertuje CRLF → LF pri commit
  - **Výhoda:** Konzistentné s .gitattributes

- **`false`**:
  - Žiadna automatická konverzia
  - Plná kontrola cez .gitattributes
  - **Výhoda:** Maximálna kontrola

### Prečo `input`?

- Konzistentné s `.gitattributes` nastavením (`eol=lf`)
- Minimalizuje EOL warningy
- Funguje dobre s Windows aj Mac/Linux

---

## 🧪 Overenie

### Check Current Settings

```powershell
git config --global core.autocrlf
git config --global core.eol
git config core.autocrlf
git config core.eol
```

### Test EOL Normalization

```powershell
# Vytvor test súbor
echo "test" > test-eol.txt

# Add a commit
git add test-eol.txt
git commit -m "test: EOL normalization"

# Over, že súbor má LF endings v repo
git show HEAD:test-eol.txt | Format-Hex
# Mal by byť: 0A (LF), nie 0D 0A (CRLF)

# Cleanup
git rm test-eol.txt
git commit -m "test: remove EOL test file"
```

---

## 🔗 Súvisiace Dokumenty

- `.gitattributes` - Definuje EOL normalization pre rôzne súbory
- `docs/KROK9_STEP1_EXECUTION_REPORT.md` - Release execution report

---

**Poznámka:** Po nastavení týchto hodnôt by ďalšie commity nemali meniť stovky súborov len kvôli EOL.
