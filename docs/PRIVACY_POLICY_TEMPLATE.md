# Privacy Policy Template

**Poznámka:** Toto je **template**. Pred použitím:
1. Nahraď `[COMPANY_NAME]`, `[APP_NAME]`, `[CONTACT_EMAIL]`, `[PRIVACY_POLICY_URL]` skutočnými hodnotami
2. Over všetky údaje s `docs/KROK9_PRIVACY_MATRIX.md`
3. Pridaj konkrétne informácie o data retention, third-party sharing, atď.
4. Získaj právne poradenstvo (ak je potrebné)
5. Hostuj na verejne dostupnom URL (vyžadované pre App Store)

---

## Privacy Policy

**Last Updated:** [DATE]

### 1. Introduction

[COMPANY_NAME] ("we", "our", or "us") operates the [APP_NAME] mobile application (the "Service"). This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.

By using the Service, you agree to the collection and use of information in accordance with this policy.

### 2. Information We Collect

#### 2.1 Information You Provide

- **Account Information:** 
  - Email address (required for account creation and login)
  - Username (for user identification and profile display)
  - Password (hashed, never stored in plain text)
  
- **User-Generated Content:** 
  - Posts (text descriptions of dreams, ideas, aspirations)
  - Images (photos uploaded with posts or as profile pictures)
  - Comments and contributions (if applicable)
  
- **Profile Information:** 
  - Location (country/continent selection, not GPS coordinates)
  - Profile picture (optional)
  - Bio (optional user description)

#### 2.2 Information Automatically Collected

- **Authentication Tokens:** 
  - JWT (JSON Web Token) stored locally on your device in localStorage
  - Used for authentication and session management
  - Expires after 24 hours (token TTL)
  - Contains user ID (not device identifier)

- **Device Information:** 
  - iOS may automatically collect device identifier for app functionality
  - We do not actively collect or store device identifiers
  - No third-party analytics or tracking services are used

### 3. How We Use Your Information

We use the information we collect to:

- Provide and maintain the Service
- Authenticate your account
- Enable you to create and share posts
- Send you notifications (if enabled)
- Respond to your requests and support needs
- Improve the Service

### 4. Data Storage and Security

- **Backend Database:** 
  - Your account information (email, username, password hash) is stored on our secure servers
  - User-generated content (posts, descriptions) is stored in our database
  - Location data (country/continent) is stored in our database
  
- **Image Storage:** 
  - Images are stored on Cloudinary (third-party cloud storage service)
  - Cloudinary has access to uploaded images only for storage purposes
  - Images are associated with your user account
  
- **Local Storage:** 
  - Authentication tokens (JWT) are stored locally on your device in localStorage
  - Tokens are not shared with third parties
  - Tokens expire after 24 hours (automatic expiration)
  
- **Security:** 
  - We use industry-standard security measures (HTTPS, password hashing, JWT tokens)
  - Passwords are hashed using secure hashing algorithms (never stored in plain text)
  - Authentication tokens are encrypted and expire automatically

### 5. Data Retention

- **Account Data:** 
  - Retained for as long as your account is active
  - If you delete your account, account data is deleted (see Account Deletion below)
  
- **User-Generated Content:** 
  - Posts and images are retained for as long as your account is active
  - If you delete your account, your posts and images are deleted
  
- **Authentication Tokens:** 
  - Expire after 24 hours (automatic expiration)
  - Stored locally on your device, not on our servers
  
- **Account Deletion:** 
  - You can request account deletion by contacting us at [CONTACT_EMAIL]
  - Upon account deletion, all your data (account info, posts, images) will be permanently deleted
  - Account deletion is processed within 30 days of request

### 6. Third-Party Services

We may use third-party services for:

- **Cloud Storage:** 
  - Cloudinary (https://cloudinary.com) for image storage
  - Cloudinary has access to images you upload
  - Cloudinary's privacy policy: https://cloudinary.com/privacy
  
- **Hosting:** 
  - Backend services are hosted on [HOSTING_PROVIDER]
  - Hosting provider has access to server data (account info, posts) for hosting purposes only
  - Hosting provider's privacy policy: [HOSTING_PROVIDER_PRIVACY_URL]

- **No Analytics or Tracking:**
  - We do not use third-party analytics services (Google Analytics, Firebase, etc.)
  - We do not use third-party tracking services
  - We do not use advertising SDKs

These third parties have access to your data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.

### 7. Your Rights

You have the right to:

- Access your personal data
- Correct inaccurate data
- Request deletion of your account and data
- Opt-out of email notifications

To exercise these rights, contact us at [CONTACT_EMAIL].

### 8. Children's Privacy

Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.

### 9. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

### 10. Contact Us

If you have any questions about this Privacy Policy, please contact us:

- **Email:** [CONTACT_EMAIL]
- **Support URL:** [SUPPORT_URL]

---

## 📝 Checklist Pre Privacy Policy

- [ ] Nahradené všetky placeholders (`[COMPANY_NAME]`, `[APP_NAME]`, atď.)
- [ ] Overené všetky údaje s `docs/KROK9_PRIVACY_MATRIX.md`
- [ ] Pridané konkrétne informácie o data retention
- [ ] Pridané informácie o third-party sharing
- [ ] Pridané informácie o account deletion procese
- [ ] Privacy Policy hostovaná na verejne dostupnom URL
- [ ] URL pridaný do App Store Connect → App Information → Privacy Policy URL
- [ ] Privacy Policy dostupná v app (Settings → Privacy Policy)

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy matrix
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook

---

**Poznámka:** Tento template je **základný**. Pre kompletnú Privacy Policy je odporúčané:
1. Získanie právneho poradenstva
2. Overenie so všetkými third-party službami
3. Compliance s GDPR, CCPA, a inými relevantnými zákonmi
4. Pravidelné aktualizácie
