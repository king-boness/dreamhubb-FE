# KROK 8 – Manuálny QA Checklist

Tento dokument obsahuje kompletný manuálny QA checklist pre KROK 8 (Notifications, Errors & Edge Cases).

---

## 📋 Obsah

1. [Offline → Online Recovery](#1-offline--online-recovery)
2. [Slow 3G / Timeout](#2-slow-3g--timeout)
3. [Expired Token počas akcie](#3-expired-token-počas-akcie)
4. [Multi-tab Sanity](#4-multi-tab-sanity)
5. [422 Validation](#5-422-validation)
6. [Upload Edge Cases](#6-upload-edge-cases)
7. [Language Switch počas Error Stavu](#7-language-switch-počas-error-stavu)

---

## 1. Offline → Online Recovery

### 1.1 Donee Feed (My Posts)

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/posts`

**Steps:**
1. DevTools → Network → Throttling: **Offline**
2. Obnovte stránku (F5) alebo prekliknite medzi Ongoing/Accomplished
3. Overte OfflineBanner + Retry button
4. DevTools → Network → Throttling: **Online**
5. Kliknite na Retry button

**Expected:**
- ✅ OfflineBanner sa zobrazí s textom "You're offline" / "Si offline"
- ✅ Retry button je viditeľný a klikateľný
- ✅ Po kliknutí na Retry (keď je online) sa stránka načíta (zobrazia sa posty alebo empty state)
- ✅ OfflineBanner zmizne po úspešnom načítaní
- ✅ Žiadne raw error texty ("ERR_NETWORK", "Failed to fetch", atď.)

---

### 1.2 Donor Feed

**Setup:**
- Prihlásený ako donor
- Otvorená stránka `/donor/posts`

**Steps:**
1. DevTools → Network → Throttling: **Offline**
2. Prekliknite medzi tabmi (Help / Pay / Top) alebo obnovte stránku
3. Overte OfflineBanner + Retry button
4. DevTools → Network → Throttling: **Online**
5. Kliknite na Retry button

**Expected:**
- ✅ OfflineBanner sa zobrazí
- ✅ Retry button funguje
- ✅ Po návrate online sa feed načíta
- ✅ Žiadne raw error texty

---

### 1.3 Post Detail (Donor)

**Setup:**
- Prihlásený ako donor
- Otvorený post detail (`/donor/post-detail/{id}`)

**Steps:**
1. DevTools → Network → Throttling: **Offline**
2. Obnovte stránku (F5)
3. Overte OfflineBanner + Retry button
4. DevTools → Network → Throttling: **Online**
5. Kliknite na Retry button

**Expected:**
- ✅ OfflineBanner sa zobrazí
- ✅ Retry button funguje
- ✅ Post detail sa načíta po návrate online
- ✅ Žiadne raw error texty

---

### 1.4 Notifications

**Setup:**
- Prihlásený ako donor
- Otvorená stránka `/donor/notifications`

**Steps:**
1. DevTools → Network → Throttling: **Offline**
2. Obnovte stránku alebo pull-to-refresh
3. Overte OfflineBanner + Retry button
4. DevTools → Network → Throttling: **Online**
5. Kliknite na Retry button

**Expected:**
- ✅ OfflineBanner sa zobrazí
- ✅ Retry button funguje
- ✅ Notifications sa načítajú po návrate online
- ✅ Žiadne raw error texty

---

### 1.5 Post Creation (Donee)

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`
- Formulár je čiastočne vyplnený

**Steps:**
1. DevTools → Network → Throttling: **Offline**
2. Kliknite na Submit/Publish
3. Overte OfflineBanner + Retry button (ak existuje)
4. DevTools → Network → Throttling: **Online**
5. Kliknite na Retry alebo skúste znova Submit

**Expected:**
- ✅ OfflineBanner sa zobrazí pri pokuse o submit
- ✅ Safe error toast ("Something went wrong" / "Niečo sa pokazilo")
- ✅ Formulár zostáva interaktívny (nie stuck)
- ✅ Po návrate online sa submit úspešne dokončí
- ✅ Žiadne raw error texty

---

## 2. Slow 3G / Timeout

### 2.1 Feed Loading

**Setup:**
- Prihlásený ako donor/donee
- Otvorená stránka feed (`/donor/posts` alebo `/donee/posts`)

**Steps:**
1. DevTools → Network → Throttling: **Slow 3G**
2. Obnovte stránku (F5)
3. Počkajte na timeout (môže trvať 30-60s)

**Expected:**
- ✅ Loading spinner sa zobrazí
- ✅ Po timeout sa zobrazí safe timeout toast ("Something went wrong" / "Niečo sa pokazilo")
- ✅ Retry UI je dostupný (ak existuje na stránke)
- ✅ UI nie je zaseknuté (tlačidlá sa odblokujú)
- ✅ Žiadne raw timeout error texty

---

### 2.2 Post Detail Loading

**Setup:**
- Prihlásený ako donor
- Navigácia na post detail (`/donor/post-detail/{id}`)

**Steps:**
1. DevTools → Network → Throttling: **Slow 3G**
2. Navigujte na post detail
3. Počkajte na timeout

**Expected:**
- ✅ Loading spinner sa zobrazí
- ✅ Po timeout safe toast + Retry UI
- ✅ UI nie je zaseknuté
- ✅ Žiadne raw error texty

---

### 2.3 Upload počas Slow 3G

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`
- Vybratý obrázok na upload

**Steps:**
1. DevTools → Network → Throttling: **Slow 3G**
2. Kliknite na Upload/Submit
3. Počkajte na timeout počas uploadu

**Expected:**
- ✅ Upload progress sa zobrazí (ak existuje)
- ✅ Po timeout safe toast
- ✅ Upload tlačidlo sa odblokuje (nie stuck)
- ✅ Môžete skúsiť znova
- ✅ Žiadne raw error texty

---

## 3. Expired Token počas akcie

### 3.1 Reply počas Expired Token

**Setup:**
- Prihlásený ako donor
- Otvorený post detail s komentármi
- Token je platný

**Steps:**
1. DevTools → Application → Local Storage → Zmeňte `token` na `"expired-token"`
2. Napíšte reply a kliknite Submit
3. Overte správanie

**Expected:**
- ✅ Safe error toast ("Something went wrong" / "Niečo sa pokazilo")
- ✅ Automatický redirect na `/login` (po chvíli)
- ✅ Max 1-2 toasty (nie spam)
- ✅ Žiadne raw error texty ("Unauthorized", "401", atď.)
- ✅ Silent logout (žiadne console errors)

---

### 3.2 Top-up/Donation počas Expired Token

**Setup:**
- Prihlásený ako donor
- Otvorený post detail
- Token je platný

**Steps:**
1. DevTools → Application → Local Storage → Zmeňte `token` na `"expired-token"`
2. Kliknite na Donate/Top-up
3. Vyberte sumu a kliknite Submit

**Expected:**
- ✅ Safe error toast
- ✅ Automatický redirect na `/login`
- ✅ Max 1-2 toasty
- ✅ Žiadne raw error texty
- ✅ Silent logout

---

### 3.3 Upload počas Expired Token

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`
- Token je platný

**Steps:**
1. DevTools → Application → Local Storage → Zmeňte `token` na `"expired-token"`
2. Vyberte obrázok a kliknite Submit

**Expected:**
- ✅ Safe error toast
- ✅ Automatický redirect na `/login`
- ✅ Max 1-2 toasty
- ✅ Žiadne raw error texty
- ✅ Silent logout

---

## 4. Multi-tab Sanity

### 4.1 Paralelné Requesty (Feed + Notifications)

**Setup:**
- Prihlásený ako donor
- Otvorené 2 tably:
  - Tab 1: `/donor/posts`
  - Tab 2: `/donor/notifications`

**Steps:**
1. V Tab 1: Obnovte stránku (F5)
2. Súčasne v Tab 2: Obnovte stránku (F5)
3. Overte správanie

**Expected:**
- ✅ Obe tably sa načítajú správne
- ✅ Žiadny refresh token loop
- ✅ Max 1-2 toasty v každom tably (nie spam)
- ✅ Žiadne raw error texty

---

### 4.2 Expired Token v Multi-tab

**Setup:**
- Prihlásený ako donor
- Otvorené 2 tably:
  - Tab 1: `/donor/posts`
  - Tab 2: `/donor/notifications`

**Steps:**
1. DevTools → Application → Local Storage → Zmeňte `token` na `"expired-token"`
2. V Tab 1: Obnovte stránku (F5)
3. V Tab 2: Obnovte stránku (F5)

**Expected:**
- ✅ Obe tably redirectujú na `/login`
- ✅ Žiadny refresh token loop
- ✅ Max 1-2 toasty v každom tably
- ✅ Žiadne raw error texty

---

## 5. 422 Validation

### 5.1 Post Creation (Empty Required Fields)

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`

**Steps:**
1. Nevyplňte povinné polia (napr. title, description)
2. Kliknite na Submit/Publish

**Expected:**
- ✅ Safe validation toast ("Please check your input" / "Skontroluj zadané údaje")
- ✅ Žiadne raw Laravel validation texty (field names, "422", atď.)
- ✅ Formulár zostáva interaktívny (nie stuck)
- ✅ Validation errors sú zobrazené pri poliach (ak existuje inline validation)

---

### 5.2 Reply (Empty Comment)

**Setup:**
- Prihlásený ako donor
- Otvorený post detail s komentármi

**Steps:**
1. Nevyplňte komentár
2. Kliknite na Submit/Reply

**Expected:**
- ✅ Safe validation toast
- ✅ Žiadne raw validation texty
- ✅ Formulár zostáva interaktívny

---

## 6. Upload Edge Cases

### 6.1 Invalid File Type

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`

**Steps:**
1. Skúste nahrať súbor, ktorý nie je obrázok (napr. `.pdf`, `.txt`)
2. Overte správanie

**Expected:**
- ✅ Safe error toast ("Invalid file type" / "Neplatný typ súboru")
- ✅ Žiadne raw error texty
- ✅ Upload tlačidlo zostáva interaktívne

---

### 6.2 File Too Large

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`

**Steps:**
1. Skúste nahrať veľmi veľký obrázok (>10MB, ak existuje limit)
2. Overte správanie

**Expected:**
- ✅ Safe error toast ("File too large" / "Súbor je príliš veľký")
- ✅ Žiadne raw error texty
- ✅ Upload tlačidlo zostáva interaktívne

---

### 6.3 Network Drop počas Uploadu

**Setup:**
- Prihlásený ako donee
- Otvorená stránka `/donee/post-creation`
- Vybratý obrázok na upload

**Steps:**
1. Kliknite na Upload/Submit
2. Počas uploadu: DevTools → Network → Throttling: **Offline**
3. Počkajte na error

**Expected:**
- ✅ Upload progress sa zastaví (ak existuje)
- ✅ Safe error toast ("Upload failed" / "Nahrávanie zlyhalo")
- ✅ Upload tlačidlo sa odblokuje (nie stuck)
- ✅ Môžete skúsiť znova
- ✅ Žiadne raw error texty

---

## 7. Language Switch počas Error Stavu

### 7.1 Error Toast + Language Switch

**Setup:**
- Prihlásený ako donor/donee
- Aplikácia je v anglickom jazyku

**Steps:**
1. Vyvolajte error (napr. offline, 500 cez `/__dev/qa`)
2. Zmeňte jazyk aplikácie na slovenčinu (ak existuje language switcher)
3. Overte toast messages

**Expected:**
- ✅ Toast messages sa zmenia na slovenčinu
- ✅ Nové toasty sú v slovenčine
- ✅ i18n kľúče fungujú správne
- ✅ Žiadne raw error texty (ani po language switch)

---

### 7.2 Retry UI + Language Switch

**Setup:**
- Prihlásený ako donor
- Otvorená stránka `/donor/posts`
- Error state (offline alebo 500)

**Steps:**
1. Vyvolajte error state (offline alebo 500)
2. Overte Retry UI text
3. Zmeňte jazyk aplikácie
4. Overte Retry UI text

**Expected:**
- ✅ Retry button text sa zmení podľa jazyka
- ✅ Error message sa zmení podľa jazyka
- ✅ i18n kľúče fungujú správne

---

## 🚨 Červené vlajky (FAIL ak vidíte)

- ❌ **Raw error texty** v UI: "Unauthorized", "ERR_NETWORK", "ERR_BAD_REQUEST", "500", "403", "422", "AxiosError", Laravel stacktrace
- ❌ **Tokeny alebo PII** v konzole (okrem `console.debug` v DEV guard-e)
- ❌ **Spam toasty** (viac ako 2-3 toasty pre jeden error)
- ❌ **Stuck loading spinnery** (spinner sa nezastaví)
- ❌ **Zaseknuté UI** (tlačidlá nefungujú po errore)
- ❌ **Refresh loop** (nekonečné refresh token requesty)
- ❌ **Raw backend messages** v toaste (namiesto i18n keys)
- ❌ **UI zamrzne** počas timeout (tlačidlá zostanú disabled)

---

## 📝 Poznámky

- **Dev QA page** (`/__dev/qa`) je dostupná **len v DEV buildoch** (nie v produkcii)
- **Offline simulácia** funguje najlepšie cez DevTools Network throttling
- **Invalid token** test vyžaduje manuálnu zmenu v Local Storage
- **Všetky error toasty** by mali byť **i18n** (EN + SK podľa jazyka)
- **Multi-tab testy** môžu byť nestabilné - ak sa vyskytnú problémy, zdokumentujte ich

---

## 🔗 Súvisiace dokumenty

- `e2e/README.md` - E2E testy dokumentácia
- `CHANGELOG-KROK8.md` - Kompletná dokumentácia KROK 8 zmien
- `docs/qa-krok8.md` - Rýchly 15-min smoke checklist
