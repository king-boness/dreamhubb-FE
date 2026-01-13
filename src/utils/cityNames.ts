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

/**
 * Format location string from city and country
 * @param city - City name (can be null/undefined)
 * @param country - Country name (can be null/undefined)
 * @param locale - Current locale (e.g., "en-US", "sk")
 * @returns Formatted location string: "City, Country" if city exists, otherwise just "Country"
 */
export function formatLocation(city: string | null | undefined, country: string | null | undefined, locale = "en-US"): string {
  const translatedCity = city ? translateCityName(city, locale) : null;
  const translatedCountry = country ? translateCountryName(country, locale) : null;

  if (translatedCity && translatedCountry) {
    return `${translatedCity}, ${translatedCountry}`;
  }
  if (translatedCountry) {
    return translatedCountry;
  }
  if (translatedCity) {
    return translatedCity;
  }
  return "";
}

/**
 * [A3] Get location label from post object - unified location display logic
 * Handles various field names that might be used in the API response
 * Priority: location_city_name > location_city > city > author_city > city_name
 * @param post - Post object (can have city/country in various formats)
 * @param locale - Current locale (e.g., "en-US", "sk")
 * @returns Formatted location string: "City, Country" if city exists, otherwise just "Country"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocationLabel(post: any, locale = "en-US"): string {
  if (!post) return "";

  // Try various field name combinations that might be used in API
  // Priority: post-level location > author location > fallback names
  // Backend vracia: location_city_name, location_country_name (ak existujú) alebo author_city, author_country
  const city = post.location_city_name ||
    post.location_city ||
    post.city ||
    post.author_city ||
    post.city_name ||
    null;

  const country = post.location_country_name ||
    post.location_country ||
    post.country ||
    post.author_country ||
    post.country_name ||
    null;

  // Debug logging in development
  if (process.env.NODE_ENV === "development" && (!city || !country)) {
    console.log("📍 getLocationLabel - Post location data:", {
      location_city_name: post.location_city_name,
      location_city: post.location_city,
      city: post.city,
      author_city: post.author_city,
      city_name: post.city_name,
      location_country_name: post.location_country_name,
      location_country: post.location_country,
      country: post.country,
      author_country: post.author_country,
      country_name: post.country_name,
      result: formatLocation(city, country, locale)
    });
  }

  return formatLocation(city, country, locale);
}
