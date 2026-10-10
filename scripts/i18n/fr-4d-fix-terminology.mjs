#!/usr/bin/env node
/** Post-process fr-4d-translations-data.mjs for dreamhubb product terminology. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "fr-4d-translations-data.mjs");

const mod = await import(`./fr-4d-translations-data.mjs?fix=${Date.now()}`);
const map = { ...mod.default };

const OVERRIDES = {
  "onboardingInfo.category.health.description":
    "Sur dreamhubb, la santé concerne votre bien-être physique et mental — des objectifs fitness et habitudes saines aux défis de santé ou au burnout. Partagez ce que vous souhaitez améliorer ou ce avec quoi vous luttez ; d'autres peuvent vous soutenir par la motivation, les connaissances, les ressources ou leur expérience.",
  "onboardingInfo.category.learning.ctaLabel": "CHOISIR APPRENTISSAGE",
  "posts.commentsTabContribution": "Contribution",
  "notifications.topUpTitle": "{name} a rechargé votre publication de {amount} tokens",
  "common.success.donationSuccessful": "Recharge réussie : {amount} Tokens !",
  "success.donationSuccessful": "Recharge réussie : {amount} Tokens !",
  "onboardingInfo.side.donee.ctaLabel": "CHOISIR DONEE",
  "onboardingInfo.side.donee.highlight": "donees",
  "onboardingInfo.side.donee.title": "Donees",
  "onboardingInfo.side.donor.ctaLabel": "CHOISIR DONOR",
  "onboardingInfo.side.donor.highlight": "donors",
  "onboardingInfo.side.donor.title": "Donors",
  "aboutDonee": "À propos du Donee",
  "onboarding.sideDonee": "Donee",
  "onboarding.sideDonor": "Donor",
  "profileUi.rateDonor": "Évaluez votre Donor",
  "profileUi.reviewPlaceholder": "Écrivez votre message à un Donor…",
  "earnUi.freeTokensDescription":
    "En tant que nouvel utilisateur, vous recevez des Tokens pour vérifier votre compte.",
  "posts.edit.donations": "Recharges",
  "topUpTheDream": "RECHARGER LA PUBLICATION",
  "topUpThePost": "RECHARGER LA PUBLICATION",
  "posts.edit.tokensToTopUp": "TOKENS À RECHARGER",
  "badges.badge": "Badge",
  "badges.patron": "Patron",
  "onboardingInfo.category.possessions.title": "Biens",
  "onboardingInfo.category.profession.title": "Profession",
  "subcategories.possessions": "Biens",
  "possessions": "Biens",
  "subcategories.profession": "Profession",
  "profession": "Profession",
  "inspirations": "Inspirations",
  "continent": "Continent",
};

function fixValue(key, v) {
  if (OVERRIDES[key]) return OVERRIDES[key];
  let s = v;
  s = s.replace(/\bjetons\b/gi, "tokens");
  s = s.replace(/\bJetons\b/g, "Tokens");
  s = s.replace(/\bdonataires\b/gi, "Donees");
  s = s.replace(/\bdonataire\b/gi, "Donee");
  s = s.replace(/\bdonateurs\b/gi, "Donors");
  s = s.replace(/\bdonateur\b/gi, "Donor");
  s = s.replace(/\bDonataire\b/g, "Donee");
  s = s.replace(/\bDonateur\b/g, "Donor");
  s = s.replace(/\bun publication\b/gi, "une publication");
  s = s.replace(/\bdu publication\b/gi, "de la publication");
  s = s.replace(/\bmessage de \{amount\}/g, "publication de {amount}");
  s = s.replace(/Signaler une publication/g, "Signaler la publication");
  return s;
}

for (const [k, v] of Object.entries(map)) {
  map[k] = fixValue(k, v);
}

const lines = [
  "/** Phase 4D EN→FR machine translations (keyPath → translation) */",
  "export default {",
];
for (const [k, v] of Object.entries(map).sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
}
lines.push("};", "");
fs.writeFileSync(dataPath, lines.join("\n"), "utf8");
console.log("Fixed", Object.keys(map).length, "entries");
