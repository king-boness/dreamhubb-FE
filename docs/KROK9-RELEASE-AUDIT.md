# KROK 9 Release Audit Report

**Dátum:** 2026-01-25  
**Cieľ:** Overenie readiness pre iOS App Store release

---

## ✅ Frontend (FE) Audit

### Capacitor Configuration
- ✅ **Capacitor config existuje:** `capacitor.config.ts`
  - `appId`: `com.dreamhubb`
  - `appName`: `dreamhubb`
  - `webDir`: `dist/spa`
- ✅ **iOS projekt existuje:** `ios/App/`
- ✅ **Quasar config:** Capacitor sekcia nastavená (`hideSplashscreen: true`)

### Bundle ID & Version
- ✅ **Bundle ID:** `com.dreamhubb` (v `capacitor.config.ts` a Xcode projekte)
- ⚠️ **Version:** `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 1` (v Xcode projekte)
- ⚠️ **Package.json version:** `0.0.1` (nesúlad s iOS version)
- ❌ **Chýba:** Centralizovaný versioning proces (package.json ↔ iOS ↔ Capacitor)

### Environment Variables
- ✅ **API Base URL:** Používa `VITE_API_BASE` z `.env`
- ⚠️ **Production URL:** `.env` má `http://localhost:8000/api` (lokálne)
- ❌ **Chýba:** Production API URL pre iOS build (musí byť nastavené pred buildom)

### Assets
- ✅ **App Icon:** Existuje `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024x1024)
- ✅ **Splash Screen:** Existuje `ios/App/App/Assets.xcassets/Splash.imageset/` (2732x2732)
- ✅ **Resources:** Existujú `resources/icon.png`, `resources/splash.png`
- ⚠️ **Poznámka:** Iba jedna veľkosť ikony (1024x1024) - App Store vyžaduje len túto pre nové projekty

### Build Scripts
- ✅ **iOS script:** `npm run ios` existuje (`ionic cap run ios -l --external`)
- ✅ **Build script:** `npm run build` existuje
- ⚠️ **Chýba:** Production build script s production API URL

### Dev-Only Features
- ✅ **Guardrails:** Existujú (`npm run guardrails`)
- ✅ **Prod-safety-check:** Existuje (`npm run prod-safety-check`)
- ✅ **Dev routes:** `/__dev/qa` je guardnuté (`typeof import.meta !== "undefined" && import.meta.env?.DEV === true`)

---

## ✅ Backend (BE) Audit

### Production Settings
- ✅ **CORS:** Nakonfigurovaný (`config/cors.php`)
  - Používa `FRONTEND_URL` env variable
  - Production pattern: prázdny (len konkrétne origins)
- ✅ **Health Endpoint:** `/api/health` existuje (vracia `{ok: true, service: 'backend', ts: ...}`)
- ✅ **Rate Limiting:** Aktivovaný
  - Auth endpoints: `throttle:auth`
  - Email check: `throttle:email-check`
  - Password reset: `throttle:password-reset`
  - General API: `throttle:60,1`
- ✅ **Error Responses:** JSON formát (nie raw texty)

### Environment Variables (Production Checklist)
- ⚠️ **APP_ENV:** Musí byť `production` v production
- ⚠️ **APP_DEBUG:** Musí byť `false` v production
- ⚠️ **APP_URL:** Musí byť production URL
- ⚠️ **FRONTEND_URL:** Musí byť production FE URL pre CORS
- ✅ **Dev endpoints:** `/api/dev/*` sú guardnuté (production-safety test existuje)

### Security
- ✅ **JWT:** Konfigurovaný (TTL, refresh TTL, blacklist)
- ✅ **Rate limiting:** Aktivovaný
- ✅ **CORS:** Konfigurovaný
- ✅ **Dev endpoints:** Production-safe (test existuje)

---

## ❌ Chýbajúce Veci pre iOS App Store Release

### 1. Versioning Process
- ❌ Centralizovaný versioning (package.json ↔ iOS ↔ Capacitor)
- ❌ Dokumentácia versioning procesu
- ❌ Automatizácia version increment

### 2. Production Environment Setup
- ❌ Production API URL v FE build procese
- ❌ Dokumentácia pre nastavenie production env pre iOS build

### 3. iOS Build Runbook
- ❌ Presné kroky pre Xcode build
- ❌ Signing & provisioning guide
- ❌ Archive & upload proces
- ❌ TestFlight setup

### 4. Privacy & Compliance
- ❌ Privacy policy dokumentácia
- ❌ Data collection matrix
- ❌ App Store Connect privacy answers

### 5. App Store Metadata
- ❌ App name, subtitle, description (EN+SK)
- ❌ Keywords
- ❌ Screenshot shotlist
- ❌ Support URL
- ❌ Marketing URL
- ❌ Reviewer notes template

### 6. Assets
- ⚠️ Iba základná ikona (1024x1024) - App Store to stačí
- ❌ Screenshot shotlist a špecifikácie
- ❌ Screenshot assets (8-10 screenshots pre rôzne veľkosti)

### 7. Release Gate
- ⚠️ `preflight` existuje, ale chýbajú iOS-specific checks
- ❌ Version/build info check
- ❌ Privacy policy URL check

---

## ✅ Čo je Hotové (KROK 8)

- ✅ Unified error mapper
- ✅ Safe notifications (notifyError wrapper)
- ✅ OfflineBanner + RetryPanel
- ✅ Guardrails (no direct Notify.create, no console.* bez DEV guard)
- ✅ Prod-safety-check (dev endpoints)
- ✅ E2E tests
- ✅ Preflight script
- ✅ Documentation (KROK8_*)

---

## 📋 Priorita Pre KROK 9

1. **VYSOKÁ:** Versioning process + dokumentácia
2. **VYSOKÁ:** iOS Build Runbook (Xcode steps)
3. **VYSOKÁ:** Production API URL setup
4. **STREDNÁ:** Privacy & Compliance pack
5. **STREDNÁ:** App Store metadata pack
6. **NÍZKA:** Screenshot assets (môže byť manuálne)
7. **NÍZKA:** Release gate rozšírenie

---

## ✅ Záver

**Frontend:** ✅ Základná konfigurácia je pripravená (Capacitor, iOS projekt, assets)  
**Backend:** ✅ Production-ready (CORS, rate limiting, health endpoint, security)  
**Chýbajúce:** Versioning, iOS build runbook, privacy docs, App Store metadata

**Status:** 🟡 **READY pre implementáciu KROK 9 dokumentácie a procesov**
