# iPhone Safe-Area + Performance Test Checklist

## Predpoklady
- Projekt zostavený: `quasar build`
- iOS sync: `npx cap sync ios`
- App otvorená na fyzickom iPhone (simulátor nemusí mať notch)

## Checklist

### 1. Safe-area (top + bottom)
- [ ] Header/topbar sa nedotýka status baru ani notch
- [ ] Obsah pod headerom je pod safe-area (žiadne pretečenie)
- [ ] Footer je nad home indicator (safe-area-bottom)
- [ ] Scrolling funguje bez orezania obsahu

### 2. Status bar overlay
- [ ] Webview nezačína pod status barom (content pod ním)
- [ ] Status bar je čitateľný (overlay: false)

### 3. Ružový roh / background
- [ ] Vpravo hore žiadna ružová ani biela farba
- [ ] html/body/#q-app majú jednotný background podľa dark/light theme
- [ ] Pri scrollovaní sa neobjavuje iná farba

### 4. Create post + upload
- [ ] Create post flow funguje
- [ ] Upload obrázkov funguje
- [ ] Žiadne chyby v konzole

### 5. Navigácia
- [ ] Tab navigácia (Donor/Donee) funguje
- [ ] Back button funguje
- [ ] Routing bez chýb

### 6. Feed (performance)
- [ ] Feed sa plynule scrolluje
- [ ] Obrázky sa lazy-loadujú pri scrollovaní

## Kroky po zmene boot / plugin
```bash
# Ak sa pridá nový plugin
npm install @capacitor/status-bar  # už nainštalované
npx cap sync ios
```
