# KROK 9 Assets Specification

**Cieľ:** Špecifikácie pre iOS App Store assets (ikony, splash screens, screenshots)

---

## 📱 App Icon

### Požadované Veľkosti

**App Store Connect vyžaduje:**
- ✅ **1024x1024 px** (PNG, bez alpha channel)

**Lokalizácia:**
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

**Poznámka:** Pre nové iOS projekty (iOS 11+) stačí jedna ikona 1024x1024. Xcode automaticky generuje všetky potrebné veľkosti.

### Overenie

```bash
# Skontroluj, či ikona existuje
ls -la ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

# Skontroluj veľkosť (malo by byť 1024x1024)
file ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
```

**Status:** ✅ Ikona existuje (1024x1024)

---

## 🎨 Splash Screen

### Požadované Veľkosti

**iOS Launch Screen:**
- ✅ **2732x2732 px** (PNG, pre všetky veľkosti)

**Lokalizácia:**
- `ios/App/App/Assets.xcassets/Splash.imageset/`

**Poznámka:** iOS automaticky škáluje splash screen pre rôzne veľkosti zariadení.

### Overenie

```bash
# Skontroluj, či splash existuje
ls -la ios/App/App/Assets.xcassets/Splash.imageset/
```

**Status:** ✅ Splash screen existuje

---

## 📸 Screenshots

### Požadované Veľkosti (App Store Connect)

**iPhone 6.7" Display (iPhone 14 Pro Max, iPhone 13 Pro Max, iPhone 12 Pro Max):**
- **Required:** 1290 x 2796 pixels (portrait)
- **Optional:** 2796 x 1290 pixels (landscape)

**iPhone 6.5" Display (iPhone 11 Pro Max, iPhone XS Max):**
- **Required:** 1242 x 2688 pixels (portrait)
- **Optional:** 2688 x 1242 pixels (landscape)

**iPhone 6.1" Display (iPhone 14, iPhone 13, iPhone 12, iPhone 11):**
- **Required:** 1179 x 2556 pixels (portrait)
- **Optional:** 2556 x 1179 pixels (landscape)

**iPhone 5.5" Display (iPhone 8 Plus, iPhone 7 Plus, iPhone 6s Plus):**
- **Optional:** 1242 x 2208 pixels (portrait)
- **Optional:** 2208 x 1242 pixels (landscape)

**iPad Pro 12.9" (3rd generation):**
- **Optional:** 2048 x 2732 pixels (portrait)
- **Optional:** 2732 x 2048 pixels (landscape)

**iPad Pro 11" (2nd generation):**
- **Optional:** 1668 x 2388 pixels (portrait)
- **Optional:** 2388 x 1668 pixels (landscape)

### Minimálne Požadované

Pre prvý release stačí:
- ✅ **iPhone 6.7"** (1290 x 2796 px) - **REQUIRED**
- ✅ **iPhone 6.1"** (1179 x 2556 px) - **REQUIRED**

**Pozri:** `docs/KROK9_SCREENSHOT_SHOTLIST.md` pre shotlist a obsah screenshots.

---

## 📋 Assets Checklist

### App Icon
- [x] 1024x1024 px ikona existuje
- [ ] Ikona je bez alpha channel (ak je potrebné)
- [ ] Ikona je PNG formát
- [ ] Ikona je v `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Splash Screen
- [x] Splash screen existuje
- [ ] Splash screen je správnej veľkosti (2732x2732 px)
- [ ] Splash screen je v `ios/App/App/Assets.xcassets/Splash.imageset/`

### Screenshots
- [ ] Screenshots pre iPhone 6.7" (1290 x 2796 px)
- [ ] Screenshots pre iPhone 6.1" (1179 x 2556 px)
- [ ] Screenshots obsahujú správny obsah (pozri shotlist)
- [ ] Screenshots sú PNG alebo JPEG formát
- [ ] Screenshots sú pripravené na upload do App Store Connect

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Screenshot shotlist a obsah
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook

---

**Poznámka:** Screenshots môžu byť vytvorené manuálne (simulator alebo real device) alebo automaticky (screenshot tools). Pre prvý release odporúčame manuálne vytvorenie na real device alebo simulator.
