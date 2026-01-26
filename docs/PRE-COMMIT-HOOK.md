# Pre-commit Hook Documentation

Tento dokument popisuje pre-commit hook pre dreamhubb-FE, ktorý automaticky kontroluje guardrails pred každým commitom.

---

## 📋 Čo robí

Pre-commit hook automaticky spustí:
1. **`npm run guardrails`** - Kontrola zakázaných patternov:
   - Priame `Notify.create` / `$q.notify` volania mimo `src/utils/notify.ts`
   - `console.log/warn/error` bez DEV guardu
   - Logovanie tokenov/passwords/authorization headers

2. **`npm run test`** (voliteľné) - Unit testy (komentované, lebo môže byť pomalé)

---

## 🔧 Inštalácia

### Windows (PowerShell):

```powershell
# Skopírujte pre-commit.cmd do .git/hooks/pre-commit
Copy-Item .git\hooks\pre-commit.cmd .git\hooks\pre-commit

# Alebo manuálne vytvorte .git\hooks\pre-commit s obsahom z pre-commit.cmd
```

### Mac/Linux:

```bash
# Skopírujte pre-commit do .git/hooks/
cp .git/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Poznámka:** Ak `.git/hooks/pre-commit` už existuje, zálohujte ho pred prepísaním.

---

## 🚀 Použitie

Hook sa automaticky spustí pri každom `git commit`. Ak guardrails check zlyhá, commit bude zablokovaný.

**Príklad:**
```bash
git add .
git commit -m "Add new feature"
# 🔍 Running pre-commit checks...
# ❌ Pre-commit hook failed: Guardrails check failed
#    Please fix the issues above before committing.
```

---

## ⏭️ Preskočenie (nie odporúčané)

Ak potrebujete preskočiť hook (napr. pre emergency fix):

```bash
git commit --no-verify -m "Emergency fix"
```

**⚠️ VAROVANIE:** Používajte `--no-verify` len v prípade absolútnej núdze. Vždy opravte problémy namiesto preskakovania hooku.

---

## 🔧 Konfigurácia

### Povolenie unit testov v pre-commit hooku:

Otvorte `.git/hooks/pre-commit` a odkomentujte sekciu s unit testami:

```bash
# Odkomentujte tieto riadky:
echo "🧪 Running unit tests..."
npm run test
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Pre-commit hook failed: Unit tests failed"
  exit 1
fi
```

**Poznámka:** Unit testy môžu byť pomalé, preto sú komentované. Odporúčame ich spúšťať manuálne pred commitom alebo v CI.

---

## 🐛 Riešenie problémov

### Hook sa nespúšťa:

1. **Skontrolujte, že súbor existuje:**
   ```bash
   ls -la .git/hooks/pre-commit  # Mac/Linux
   dir .git\hooks\pre-commit     # Windows
   ```

2. **Skontrolujte oprávnenia (Mac/Linux):**
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

3. **Skontrolujte, že Git hooky sú povolené:**
   ```bash
   git config core.hooksPath .git/hooks
   ```

### Hook je príliš pomalý:

- Odkomentujte unit testy len ak sú rýchle (< 5 sekúnd)
- Alebo použite `--no-verify` pre urgentné fixy (nie odporúčané)

---

## 📚 Ďalšie zdroje

- [Git Hooks dokumentácia](https://git-scm.com/docs/githooks)
- [Guardrails dokumentácia](../docs/KROK8-*.md)
