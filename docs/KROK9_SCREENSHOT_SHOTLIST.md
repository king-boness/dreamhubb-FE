# KROK 9 Screenshot Shotlist

**Cieľ:** Zoznam screenshots pre App Store Connect (8-10 screenshots, poradie, obsah)

---

## 📱 Screenshot Requirements

### Minimálne Požadované Veľkosti

1. **iPhone 6.7"** (1290 x 2796 px) - **REQUIRED**
2. **iPhone 6.1"** (1179 x 2556 px) - **REQUIRED**

### Odporúčané (Optional)

3. **iPhone 6.5"** (1242 x 2688 px)
4. **iPad Pro 12.9"** (2048 x 2732 px)

---

## 📸 Screenshot Shotlist (8-10 Screenshots)

### 1. Login / Welcome Screen
**Poradie:** 1  
**Scenár:**
- Otvor app (prvý launch alebo logout)
- Zobrazuje sa login screen s email/password políčkami
- dreamhubb branding/logo viditeľný

**Obsah na Screenshote:**
- Login form (email input, password input, "Sign In" button)
- "Sign Up" link alebo button
- dreamhubb logo/branding
- Clean, modern UI

**Text Overlay (EN):**
- Top: "Connect with your dreams"
- Bottom: "Share your aspirations"

**Text Overlay (SK):**
- Top: "Spoj sa so svojimi snami"
- Bottom: "Zdieľaj svoje túžby"

**Poznámka:** Uisti sa, že nie sú viditeľné žiadne sensitive data (test emails, passwords).

---

### 2. Feed / Posts List
**Poradie:** 2  
**Scenár:**
- Po login, naviguj na feed (/donor/posts alebo /donee/posts)
- Feed je načítaný s viacerými posts
- Zobrazuje sa aspoň 3-4 posts (ak je možné)

**Obsah na Screenshote:**
- Feed list s viacerými post cards
- Každý post card zobrazuje: title, description (skrátený), image (ak existuje), category
- Clean, scrollable list
- Navigation bar viditeľný

**Text Overlay (EN):**
- Top: "Discover dreams and ideas"
- Bottom: "Browse inspiring posts"

**Text Overlay (SK):**
- Top: "Objav sny a nápady"
- Bottom: "Prehliadaj inšpiratívne príspevky"

**Poznámka:** Uisti sa, že posts obsahujú reprezentatívny obsah (nie test data alebo sensitive info).

---

### 3. Post Detail
**Poradie:** 3  
**Scenár:**
- Z feed listu klikni na post
- Otvorí sa post detail page
- Post obsahuje: full title, full description, image(s), category, user info

**Obsah na Screenshote:**
- Post detail view s full content
- Post image (ak existuje) - zobrazuje sa prominentne
- Post title a description (full text)
- Category badge/tag
- User info (username, profile picture)
- "Support" alebo "Contribute" button (ak je applicable)
- Scrollable content

**Text Overlay (EN):**
- Top: "Explore post details"
- Bottom: "View contributions and comments"

**Text Overlay (SK):**
- Top: "Preskúmaj detaily príspevku"
- Bottom: "Zobraz príspevky a komentáre"

**Poznámka:** Uisti sa, že post obsah je reprezentatívny a bez sensitive data.

---

### 4. Post Creation
**Poradie:** 4  
**Scenár:**
- Naviguj na post creation page (/donee/post-creation)
- Form je prázdny alebo čiastočne vyplnený (pre lepšiu vizualizáciu)
- Zobrazuje sa upload button pre images

**Obsah na Screenshote:**
- Post creation form
- Title input field (prázdny alebo s placeholder text)
- Description textarea (prázdny alebo s placeholder text)
- Category picker/selector (viditeľné kategórie)
- Image upload button/area (s "+" icon alebo "Upload Image" text)
- "Create Post" alebo "Submit" button
- Clean, user-friendly form UI

**Text Overlay (EN):**
- Top: "Share your dream"
- Bottom: "Create your post"

**Text Overlay (SK):**
- Top: "Zdieľaj svoj sen"
- Bottom: "Vytvor svoj príspevok"

**Poznámka:** Uisti sa, že form neobsahuje sensitive data alebo test content.

---

### 5. Notifications
**Poradie:** 5  
**Scenár:**
- Naviguj na notifications page (/donor/notifications)
- Zobrazuje sa notifications list (ak existujú notifications)
- Alebo empty state (ak nie sú notifications)

**Obsah na Screenshote:**
- Notifications list s viacerými notifications (ak existujú)
- Každá notification zobrazuje: type, message, timestamp
- Alebo empty state s message "No notifications"
- Navigation bar viditeľný

**Text Overlay (EN):**
- Top: "Stay updated"
- Bottom: "Never miss important updates"

**Text Overlay (SK):**
- Top: "Zostaň informovaný"
- Bottom: "Nepremeškaj dôležité aktualizácie"

**Poznámka:** Ak nie sú notifications, použij empty state (nie error state).

---

### 6. Profile
**Poradie:** 6  
**Scenár:**
- Naviguj na profile page (/donor/profile alebo /donee/profile)
- Zobrazuje sa user profile s user info a posts

**Obsah na Screenshote:**
- Profile header: profile picture, username, bio
- Location info (country/continent)
- User's posts list (aspoň 2-3 posts)
- Stats alebo contributions (ak existujú)
- Settings button alebo link

**Text Overlay (EN):**
- Top: "Your profile"
- Bottom: "Manage your account"

**Text Overlay (SK):**
- Top: "Tvoj profil"
- Bottom: "Spravuj svoj účet"

**Poznámka:** Uisti sa, že profile obsahuje reprezentatívny obsah (nie test data).

---

### 7. Settings
**Poradie:** 7  
**Scenár:**
- Naviguj na settings page (/donor/settings alebo /donee/settings)
- Zobrazuje sa settings list s options

**Obsah na Screenshote:**
- Settings list s options:
  - Language selector (EN/SK) - viditeľný
  - Privacy settings (ak existujú)
  - Notification settings (ak existujú)
  - Account settings
  - Logout button
- Clean, organized settings UI

**Text Overlay (EN):**
- Top: "Customize your experience"
- Bottom: "Adjust app settings"

**Text Overlay (SK):**
- Top: "Prispôsob si zážitok"
- Bottom: "Uprav nastavenia appky"

**Poznámka:** Uisti sa, že language selector je viditeľný (EN/SK).

---

### 8. Offline / Error Handling
**Poradie:** 8  
**Scenár:**
- Simuluj offline (airplane mode alebo DevTools → Network → Offline)
- Alebo vyvolaj error (500 cez /api/dev/error)
- Zobrazuje sa OfflineBanner alebo RetryPanel

**Obsah na Screenshote:**
- Feed alebo post detail page
- OfflineBanner na vrchu (ak je offline) - "You're offline. Check your connection."
- Alebo RetryPanel v strede (ak je error) - "Something went wrong. Please try again." + Retry button
- Safe error message (nie raw text ako "ERR_NETWORK" alebo "500")

**Text Overlay (EN):**
- Top: "Works offline"
- Bottom: "Reliable error handling"

**Text Overlay (SK):**
- Top: "Funguje offline"
- Bottom: "Spoľahlivé spracovanie chýb"

**Poznámka:** Uisti sa, že error message je safe (i18n key, nie raw text).

---

### 9. Token Shop / Donations (Optional)
**Poradie:** 9 (Optional)  
**Obsah:**
- Token shop alebo donation page
- Zobrazuje token purchases alebo donations

**Text Overlay (EN):**
- "Support dreams"
- "Make a difference"

**Text Overlay (SK):**
- "Podpor sny"
- "Urob rozdiel"

---

### 10. Category / Filter (Optional)
**Poradie:** 10 (Optional)  
**Obsah:**
- Category selection alebo filter page
- Zobrazuje categories, filters

**Text Overlay (EN):**
- "Find what you need"
- "Filter by category"

**Text Overlay (SK):**
- "Nájdi, čo potrebuješ"
- "Filtruj podľa kategórie"

---

## 📋 Screenshot Creation Process

### Metóda 1: iOS Simulator

1. **Spusti app v Simulator:**
   ```bash
   cd dreamhubb-FE
   npm run ios
   ```

2. **Naviguj na požadovanú stránku**

3. **Vytvor screenshot:**
   - **Device → Screenshot** (alebo Cmd+S)
   - Screenshot sa uloží na Desktop

4. **Uprav screenshot:**
   - Otvor v image editori
   - Pridaj text overlay (ak je potrebné)
   - Zmeň veľkosť na požadovanú (1290 x 2796 px pre iPhone 6.7")

### Metóda 2: Real Device

1. **Spusti app na real device (TestFlight alebo development build)**

2. **Naviguj na požadovanú stránku**

3. **Vytvor screenshot:**
   - **iPhone:** Power + Volume Up
   - Screenshot sa uloží do Photos

4. **Exportuj screenshot:**
   - Otvor Photos app
   - Exportuj screenshot
   - Uprav veľkosť v image editori

### Metóda 3: Automated Tools (Future)

- **Fastlane:** Automatizácia screenshot creation
- **App Store Connect API:** Programmatic upload

---

## ✅ Screenshot Checklist

### Pre každý Screenshot:

- [ ] Správna veľkosť (1290 x 2796 px pre iPhone 6.7", 1179 x 2556 px pre iPhone 6.1")
- [ ] Správny obsah (podľa shotlist)
- [ ] Text overlay (ak je potrebné)
- [ ] PNG alebo JPEG formát
- [ ] Bez osobné údaje (ak je potrebné)
- [ ] Bez sensitive data (tokens, passwords, atď.)

### Pre App Store Connect:

- [ ] Screenshots pre iPhone 6.7" (1290 x 2796 px) - **REQUIRED**
- [ ] Screenshots pre iPhone 6.1" (1179 x 2556 px) - **REQUIRED**
- [ ] Screenshots v správnom poradí (1-8 alebo 1-10)
- [ ] Screenshots uploadované do App Store Connect
- [ ] Screenshots overené v App Store Connect preview

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_ASSETS_SPEC.md` - Assets špecifikácie
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook
- `docs/KROK9_APPSTORE_METADATA.md` - App Store metadata

---

**Poznámka:** Screenshots môžu byť vytvorené manuálne alebo automaticky. Pre prvý release odporúčame manuálne vytvorenie na real device alebo simulator, aby boli screenshots presné a reprezentatívne.
