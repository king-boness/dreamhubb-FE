# 🌐 Dreamhubb Frontend (Vue 3 + Quasar)

Tento priečinok obsahuje frontendovú časť aplikácie **Dreamhubb**, postavenú na frameworku **Vue 3 + Quasar**.

Frontend komunikuje s backend API (Laravel + PostgreSQL) a zabezpečuje používateľské rozhranie pre **Donees** aj **Donors**.

---

## 🎯 Cieľ frontendovej vrstvy
Frontend reprezentuje **vizuálnu a interaktívnu časť platformy**, zameranú na:
- 🧭 prepojenie s backend API (autentifikácia, príspevky, správy),
- 🧍‍♀️ správu používateľských profilov (upload, editácia, nastavenia),
- 💬 chatový systém (1:1 a skupinové konverzácie),
- 🔔 notifikácie v reálnom čase,
- ⚙️ optimalizáciu výkonu a UX prostredníctvom komponentov Quasar.

---

## 🏗️ Technická štruktúra

| Priečinok | Účel |
|:-----------|:------|
| `/src/pages` | Hlavné obrazovky aplikácie (Login, Register, Feed, Profile) |
| `/src/components` | Recyklovateľné UI komponenty |
| `/src/layouts` | Layout šablóny (hlavný panel, navigácia, header/footer) |
| `/src/boot` | Inicializačné skripty (napr. Axios, Auth) |
| `/src/stores` | Pinia store pre stav aplikácie |
| `/src/router` | Definícia routingu (cesty a middleware) |
| `/src/assets` | Obrázky, ikony, statické súbory |
| `/src/css` | Globálne štýly a Quasar overrides |

---

## ⚙️ Inštalácia a spustenie

### 1️⃣ Inštalácia závislostí
    npm install
### alebo
    yarn

### 2️⃣ Spustenie vývojového prostredia
    quasar dev

### 3️⃣ Build pre produkciu
    quasar build

### 4️⃣ Lintovanie kódu
    npm run lint
### alebo
    yarn lint

---

## 🔑 Dôležité prepojenia
- Backend API URL: http://127.0.0.1:8000/api
- JWT token: uchovávaný v localStorage (jwtToken)
- .env.example: obsahuje konfiguráciu pre FE prostredie
- Axios inštancia: src/boot/axios.ts
- Autentifikačné volania: spravované cez api.interceptors (s automatickým pridaním Bearer tokenu)

---

## 🧩 Vývojová roadmapa (Frontend)

| Fáza | Názov | Popis | Stav |
|:-------|:------|:-------|:------:|
| **2.0** | Integrácia s Backend-om | Inicializácia, login/register, test API | 🔜 |
| **2.1** | Auth Flow | Implementácia FE autentifikačných tokov | ⏳ |
| **2.2** | Profil & Upload | Správa profilu, obrázky, nastavenia | ⏳ |
| **2.3** | Notifikácie & Chat | Real-time messaging systém | ⏳ |
| **2.4** | Optimalizácia & Deployment | Build, publish, testovanie | ⏳ |

---

## 🧠 Meta informácie

| Parameter | Hodnota |
|:-------|:------|
| **Verzia** | v1.0.0-FE |
| **Autor** | WolfPack Group / Maťo |
| **Dátum založenia** | November 2025 |
| **Nadväzuje na** | v1.1.0-docs-frontend-init |
| **Motto** | 'Cause dreams matter. |

---

Tento súbor slúži ako hlavný orientačný bod pre FE vývoj Dreamhubb.
Nadväzuje na backendovú dokumentáciu (v1.1.0-docs-frontend-init)
a otvára novú vývojovú fázu: 2.0 / Frontend – Integrácia s Backend-om (Start FE).

---

📘 Posledná aktualizácia: November 2025

🧩 Status: Pripravené pre inicializáciu FE vývoja

🧠 Powered by: CursorAI + GPT-5 Workflow
