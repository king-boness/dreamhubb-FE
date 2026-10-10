# dreamhubb — German UI Human Review Guide (Phase 4C.2)

This guide is for an independent German language reviewer / corrector.
It is **not** a legal brief and **not** product approval.

## What dreamhubb is

dreamhubb is a social help platform. People share **Dreams**, **Problems**, and **Ideas**. Others can help with advice, skills, contacts, encouragement, or in-app **Tokens** — not only money.

Do **not** translate the brand name `dreamhubb`.

## Core product terms

| Concept | Meaning | German guidance |
|---|---|---|
| **Dream** | A personal goal someone wants to fulfil | **Traum** |
| **Problem** | A difficulty seeking help | **Problem** |
| **Idea** | A concept/project seeking support | **Idee** |
| **Post** | The content item in the feed | **Beitrag** |
| **Contribution / Help action** | An act of helping on a post (message/help) | Prefer **Hilfeaktion** / CTA **HELFEN** — do **not** call this “Beitrag” |
| **Donation / Token top-up** | Adding Tokens to a post | Prefer **Auffüllung / aufstocken** — avoid charity **Spende** unless the string is truly about donating goods |
| **Donor** | Role: person who helps others | Keep **Donor** (product term) unless product decides otherwise |
| **Donee** | Role: person seeking help | Keep **Donee** (product term) — avoid parcel-like **Empfänger** |
| **Help** | Offering support | **Hilfe** |
| **Feed** | Scrolling list of posts | **Feed** (loanword OK) |
| **Token** | In-app unit | **Token** |

See also: `i18n-meta/glossary.de.json` and `i18n-meta/terminology-decisions.de.json`.

## Address style

German UI uses informal **du** (not formal Sie), matching the Slovak tone and mobile social product voice.

## How to review

1. Open `i18n-meta/packages/de-4c2-human-review-workpackage.csv` (or JSON).
2. For each row, set **reviewerDecision**:
   - `ACCEPT` — keep `currentDe`
   - `CORRECT` — fill `correctedTranslation` with the fixed German string
   - `REJECT` — text is wrong; leave comment; do not approve
   - `NEEDS_CONTEXT` — need product/UI context before deciding
   - `NOT_REVIEWED` — skipped for now
3. Optional: `reviewerComment`, `terminologyDecision`, `followUpRequired`, `reviewCompleted`.
4. Prioritize buckets: `P0_FIXED_4C1`, `P1_TERMINOLOGY`, `P1_AUTH_ONBOARDING`, `P1_IDENTICAL_EN`, then P2/P3.

## Placeholders & plurals

- Keep placeholders exactly: `{name}`, `{amount}`, `{n}`, `{terms}`, `{privacy}`, `{zeroTolerance}`, etc.
- Pipe plurals (`a | b` or `a | b | c`) must keep the **same number of forms** as English.
- German plurals are **not** Slovak rules. Prefer natural German for 0/1/many.

## Identical-to-EN rows

Some strings match English on purpose (brand, FAQ, Donor/Donee labels, onboarding icon keys, city names, native language names). Confirm they should stay English, or propose a German alternative with `CORRECT`.

## What not to review here

- Legal **body** of Terms / Privacy (separate legal track)
- Backend API / email / Earn server strings (often still English)
- User-generated content (UGC)
- Secrets / personal data

## Returning results

Return the filled JSON (preferred) or CSV converted back to the JSON schema.
Import uses attestation — a real reviewer id and `confirmedRealReview: true`.
AI/Cursor preflight is **not** a substitute for your review.
