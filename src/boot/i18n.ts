import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";

import messages from "src/i18n";

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages["en-US"];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module "vue-i18n" {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

export default boot(({ app }) => {
  // Load saved language from localStorage
  const LANGUAGE_STORAGE_KEY = "dreamhubb_language";
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  // Map language codes to i18n locale codes
  const localeMap: Record<string, string> = {
    sk: "sk",
    "en-US": "en-US",
    "en-GB": "en-US" // Use en-US as fallback for en-GB
  };

  const mappedLocale = savedLanguage ? (localeMap[savedLanguage] || savedLanguage) : "en-US";
  const defaultLocale = mappedLocale || "en-US";

  const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: "en-US",
    legacy: false,
    messages
  });

  // Set i18n instance on app
  app.use(i18n);
});
