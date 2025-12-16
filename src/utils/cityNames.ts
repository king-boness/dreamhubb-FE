// Utility function to translate city names based on locale
// Maps city names from database (usually in local language) to translated names

const cityNameTranslations: Record<string, Record<string, string>> = {
  "en-US": {
    Praha: "Prague",
    Košice: "Kosice",
    Brno: "Brno",
    Bratislava: "Bratislava"
    // Add more translations as needed
  },
  sk: {
    Praha: "Praha",
    Košice: "Košice",
    Brno: "Brno",
    Bratislava: "Bratislava",
    Prague: "Praha",
    Kosice: "Košice"
    // Add more translations as needed
  }
};

/**
 * Translate city name based on current locale
 * @param cityName - City name from database
 * @param locale - Current locale (e.g., "en-US", "sk")
 * @returns Translated city name
 */
export function translateCityName(cityName: string | null | undefined, locale = "en-US"): string {
  if (!cityName) return "";

  // If locale is not in translations, return original name
  if (!cityNameTranslations[locale]) {
    return cityName;
  }

  // Return translated name if available, otherwise return original
  return cityNameTranslations[locale][cityName] || cityName;
}

/**
 * Translate country name based on current locale
 * @param countryName - Country name from database
 * @param locale - Current locale (e.g., "en-US", "sk")
 * @returns Translated country name
 */
export function translateCountryName(countryName: string | null | undefined, locale = "en-US"): string {
  if (!countryName) return "";

  const countryTranslations: Record<string, Record<string, string>> = {
    "en-US": {
      "Czech Republic": "Czech Republic",
      Slovakia: "Slovakia",
      Česko: "Czech Republic",
      Slovensko: "Slovakia"
    },
    sk: {
      "Czech Republic": "Česko",
      Slovakia: "Slovensko",
      Česko: "Česko",
      Slovensko: "Slovensko"
    }
  };

  if (!countryTranslations[locale]) {
    return countryName;
  }

  return countryTranslations[locale][countryName] || countryName;
}
