import { describe, expect, it } from "vitest";
import { normalizeLanguageTag, resolveTargetLanguage } from "./resolveTargetLanguage";

describe("resolveTargetLanguage", () => {
  it("prefers explicit dreamhubb language setting", () => {
    expect(
      resolveTargetLanguage({
        preferredLanguage: "sk",
        i18nLocale: "en-US",
        navigatorLanguage: "de-DE"
      })
    ).toBe("sk");
  });

  it("falls back to i18n locale", () => {
    expect(
      resolveTargetLanguage({
        preferredLanguage: null,
        i18nLocale: "en-US",
        navigatorLanguage: "fr-FR"
      })
    ).toBe("en");
  });

  it("falls back to navigator.language", () => {
    expect(
      resolveTargetLanguage({
        preferredLanguage: "",
        i18nLocale: null,
        navigatorLanguage: "cs-CZ"
      })
    ).toBe("cs");
  });

  it("defaults to en", () => {
    expect(
      resolveTargetLanguage({
        preferredLanguage: null,
        i18nLocale: null,
        navigatorLanguage: null
      })
    ).toBe("en");
  });
});

describe("normalizeLanguageTag", () => {
  it("normalizes BCP47 tags to primary subtag", () => {
    expect(normalizeLanguageTag("en-US")).toBe("en");
    expect(normalizeLanguageTag("sk-SK")).toBe("sk");
    expect(normalizeLanguageTag("cs-CZ")).toBe("cs");
    expect(normalizeLanguageTag("SK")).toBe("sk");
  });

  it("rejects invalid tags", () => {
    expect(normalizeLanguageTag("!!!")).toBeNull();
    expect(normalizeLanguageTag("")).toBeNull();
    expect(normalizeLanguageTag(null)).toBeNull();
  });
});
