# KROK 9 Privacy Matrix

**Cieľ:** Mapovanie dát, ktoré app zbierá, pre App Store Connect Privacy questions

---

## 📊 Data Collection Matrix

| Data Type | Collected? | Purpose | Linked to User? | Tracking? | Retention | Notes |
|-----------|------------|---------|-----------------|----------|-----------|-------|
| **Email Address** | ✅ Yes | Account creation, login, password reset, notifications | ✅ Yes | ❌ No | TBD | Stored in backend database |
| **Password** | ✅ Yes | Authentication | ✅ Yes | ❌ No | TBD | Hashed, never stored in plain text |
| **Username** | ✅ Yes | User identification, profile display | ✅ Yes | ❌ No | TBD | Stored in backend database |
| **User-Generated Content (Posts)** | ✅ Yes | Core app functionality (posts, descriptions) | ✅ Yes | ❌ No | TBD | Stored in backend database |
| **User-Generated Content (Images)** | ✅ Yes | Post attachments, profile pictures | ✅ Yes | ❌ No | TBD | Stored in backend/cloud storage |
| **Location (Country/Continent)** | ✅ Yes | User profile, content filtering | ✅ Yes | ❌ No | TBD | Stored in backend database (not GPS coordinates) |
| **Device ID / Identifier** | ⚠️ TBD | Authentication token storage | ⚠️ TBD | ❌ No | TBD | JWT token stored in localStorage (not device ID) |
| **Crash Logs** | ❌ No | N/A | N/A | N/A | N/A | No crash reporting service (Firebase, Sentry, etc.) |
| **Analytics Data** | ❌ No | N/A | N/A | N/A | N/A | No analytics service (Google Analytics, etc.) |
| **Advertising Data** | ❌ No | N/A | N/A | N/A | N/A | No advertising SDK |
| **Purchase History** | ⚠️ TBD | Token purchases (if applicable) | ⚠️ TBD | ❌ No | TBD | Check if token purchases are tracked |
| **Search History** | ❌ No | N/A | N/A | N/A | N/A | No search functionality |
| **Browsing History** | ❌ No | N/A | N/A | N/A | N/A | No browsing history stored |
| **Contacts** | ❌ No | N/A | N/A | N/A | N/A | No contacts access |
| **Photos (Library Access)** | ⚠️ TBD | Image uploads (if user selects from library) | ⚠️ TBD | ❌ No | TBD | Check if photo library access is requested |
| **Camera** | ⚠️ TBD | Image capture (if user takes photo) | ⚠️ TBD | ❌ No | TBD | Check if camera access is requested |

---

## 🔍 Detailný Popis

### Email Address
- **Collected:** ✅ Yes
- **Purpose:** Account creation, login, password reset, email notifications
- **Linked to User:** ✅ Yes (required for account)
- **Tracking:** ❌ No
- **Retention:** TBD (check backend data retention policy)
- **Storage:** Backend database

### Password
- **Collected:** ✅ Yes
- **Purpose:** Authentication
- **Linked to User:** ✅ Yes
- **Tracking:** ❌ No
- **Retention:** TBD (stored as hash, never plain text)
- **Storage:** Backend database (hashed)

### Username
- **Collected:** ✅ Yes
- **Purpose:** User identification, profile display
- **Linked to User:** ✅ Yes
- **Tracking:** ❌ No
- **Retention:** TBD
- **Storage:** Backend database

### User-Generated Content (Posts)
- **Collected:** ✅ Yes
- **Purpose:** Core app functionality (users create posts)
- **Linked to User:** ✅ Yes (posts are associated with user account)
- **Tracking:** ❌ No
- **Retention:** TBD
- **Storage:** Backend database

### User-Generated Content (Images)
- **Collected:** ✅ Yes
- **Purpose:** Post attachments, profile pictures
- **Linked to User:** ✅ Yes
- **Tracking:** ❌ No
- **Retention:** TBD
- **Storage:** Backend/cloud storage (Cloudinary or similar)

### Location (Country/Continent)
- **Collected:** ✅ Yes
- **Purpose:** User profile, content filtering
- **Linked to User:** ✅ Yes
- **Tracking:** ❌ No
- **Retention:** TBD
- **Storage:** Backend database
- **Note:** NOT GPS coordinates, only country/continent selection

### Device ID / Identifier
- **Collected:** ⚠️ TBD
- **Purpose:** Authentication token storage (JWT in localStorage)
- **Linked to User:** ⚠️ TBD (JWT token contains user ID)
- **Tracking:** ❌ No
- **Retention:** TBD (token expires after TTL)
- **Storage:** localStorage (client-side)
- **Note:** JWT token, not device ID. Check if iOS collects device identifier automatically.

### Photos (Library Access)
- **Collected:** ⚠️ TBD
- **Purpose:** Image uploads (if user selects from photo library)
- **Linked to User:** ⚠️ TBD
- **Tracking:** ❌ No
- **Retention:** TBD (only uploaded images are stored, not library access)
- **Note:** Check if app requests photo library permission.

### Camera
- **Collected:** ⚠️ TBD
- **Purpose:** Image capture (if user takes photo)
- **Linked to User:** ⚠️ TBD
- **Tracking:** ❌ No
- **Retention:** TBD (only captured images are stored, not camera access)
- **Note:** Check if app requests camera permission.

---

## 📱 App Store Connect Privacy Questions

### Pre každý Data Type, ktorý je Collected = Yes:

1. **Is this data used to track you?**
   - **Answer:** ❌ No (pre všetky data types)

2. **Is this data linked to your identity?**
   - **Answer:** ✅ Yes (pre email, password, username, posts, images, location)
   - **Answer:** ⚠️ TBD (pre device ID, photos, camera - overiť)

3. **Is this data used for third-party advertising?**
   - **Answer:** ❌ No (pre všetky data types)

4. **Is this data shared with third parties?**
   - **Answer:** ⚠️ TBD (overiť, či sa dáta zdieľajú s tretími stranami, napr. cloud storage provider)

---

## ⚠️ TODO - Overenie

Pred App Store submission, over:

1. [ ] **Photo Library Permission:** Over, či app žiada photo library permission
2. [ ] **Camera Permission:** Over, či app žiada camera permission
3. [ ] **Device Identifier:** Over, či iOS automaticky zbierá device identifier
4. [ ] **Third-Party Sharing:** Over, či sa dáta zdieľajú s tretími stranami (cloud storage, analytics, atď.)
5. [ ] **Data Retention:** Definuj data retention policy pre každý data type
6. [ ] **Account Deletion:** Over, či existuje account deletion endpoint/flow

---

## 🔗 Súvisiace Dokumenty

- `docs/PRIVACY_POLICY_TEMPLATE.md` - Privacy Policy template
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook

---

**Poznámka:** Tento matrix je **preliminárny**. Pred App Store submission je potrebné:
1. Overiť všetky "TBD" položky
2. Definovať data retention policy
3. Overiť third-party sharing
4. Vytvoriť Privacy Policy na základe tohto matrixu
