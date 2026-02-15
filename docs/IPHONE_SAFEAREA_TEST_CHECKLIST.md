# iPhone Safe-Area + Performance Test Checklist

## Build kroky
```bash
quasar build -m capacitor -T ios
npx cap sync ios
# V Xcode: Product → Clean Build Folder, potom Run na fyzickom iPhone
```

## Predpoklady
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

### 4b. Edit post + photo change (3 screens: Edit post, Donor feed, Donee feed)
- [ ] Edit post → "+ add photo" v modale reaguje na tap (native button + z-index)
- [ ] Po tlapnutí sa otvorí Photos picker (Info.plist: NSPhotoLibraryUsageDescription + NSPhotoLibraryAddUsageDescription)
- [ ] Zmeň fotku → SAVE CHANGES → BE 200/204 (žiadne 500, žiadne "images.0 must be a file")
- [ ] Request pri zmene fotky je multipart FormData (images[] = File objekty)
- [ ] Ak fotku nezmením a dám SAVE CHANGES → images sa neposielajú, post sa uloží

**How to test "+ Add photo" after Info.plist change:**
1. `npx cap sync ios`
2. Xcode → **Product → Clean Build Folder**
3. Run na fyzickom iPhone
4. Otvor post v edit mode → "+ Add photo" → over, že sa otvorí Photos picker (žiadna chyba v Xcode logu o missing NSPhotoLibraryAddUsageDescription)

### 5. Navigácia
- [ ] Tab navigácia (Donor/Donee) funguje
- [ ] Back button funguje
- [ ] Routing bez chýb

### 6. Feed (performance – QVirtualScroll)
- [ ] Feed sa plynule scrolluje (virtualizovaný zoznam)
- [ ] Obrázky sa lazy-loadujú (loading="lazy")

### 7. Produkcia (Cloudinary)
- [ ] Upload URL po nahratí je Cloudinary (žiadne /storage/... 404)

## Kroky po zmene boot / plugin
```bash
# Ak sa pridá nový plugin
npm install @capacitor/status-bar  # už nainštalované
npx cap sync ios
```
