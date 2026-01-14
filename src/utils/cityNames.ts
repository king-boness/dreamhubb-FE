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
 * Extract city name from entity (Post or User) with multiple fallbacks
 * Handles various field names that might be used in API responses
 * Priority order:
 * A) location_city_name
 * B) city_name
 * C) author_city
 * D) location_city?.name or city?.name (if objects are provided)
 * E) location_city (direct string)
 * F) city (direct string)
 * @param entity - Post or User object
 * @returns City name string or null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCityName(entity: any): string | null {
  if (!entity) return null;

  // A) location_city_name (preferred for posts)
  if (entity.location_city_name && typeof entity.location_city_name === "string") {
    return entity.location_city_name.trim() || null;
  }

  // B) city_name
  if (entity.city_name && typeof entity.city_name === "string") {
    return entity.city_name.trim() || null;
  }

  // C) author_city (for posts)
  if (entity.author_city && typeof entity.author_city === "string") {
    return entity.author_city.trim() || null;
  }

  // D) location_city?.name or city?.name (if objects are provided)
  if (entity.location_city?.name && typeof entity.location_city.name === "string") {
    return entity.location_city.name.trim() || null;
  }
  if (entity.city?.name && typeof entity.city.name === "string") {
    return entity.city.name.trim() || null;
  }

  // E) location_city (direct string)
  if (entity.location_city && typeof entity.location_city === "string") {
    return entity.location_city.trim() || null;
  }

  // F) city (direct string)
  if (entity.city && typeof entity.city === "string") {
    return entity.city.trim() || null;
  }

  return null;
}

/**
 * Extract country name from entity (Post or User) with multiple fallbacks
 * Priority order:
 * A) location_country_name
 * B) country_name
 * C) location_country
 * D) country (direct string or object)
 * E) author_country (for posts)
 * @param entity - Post or User object
 * @returns Country name string or null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCountryName(entity: any): string | null {
  if (!entity) return null;

  // A) location_country_name (preferred for posts)
  if (entity.location_country_name && typeof entity.location_country_name === "string") {
    return entity.location_country_name.trim() || null;
  }

  // B) country_name
  if (entity.country_name && typeof entity.country_name === "string") {
    return entity.country_name.trim() || null;
  }

  // C) location_country (direct string)
  if (entity.location_country && typeof entity.location_country === "string") {
    return entity.location_country.trim() || null;
  }

  // D) country (direct string or object)
  if (entity.country) {
    if (typeof entity.country === "string") {
      return entity.country.trim() || null;
    }
    if (entity.country.name && typeof entity.country.name === "string") {
      return entity.country.name.trim() || null;
    }
  }

  // E) author_country (for posts)
  if (entity.author_country && typeof entity.author_country === "string") {
    return entity.author_country.trim() || null;
  }

  return null;
}

/**
 * [A3] Get location label from Post or User object - unified location display logic
 * Handles various field names that might be used in API responses with multiple fallbacks
 * Works for both Post objects (from /api/posts) and User objects (from /api/user)
 *
 * Why multiple fallbacks?
 * - Backend may return different field names depending on API version
 * - Some fields may be null/undefined in certain cases
 * - Objects vs strings may vary (location_city.name vs location_city)
 * - Ensures UI always displays location when available, even if field names change
 *
 * @param entity - Post or User object (can have city/country in various formats)
 * @param locale - Current locale (e.g., "en-US", "sk")
 * @returns Formatted location string: "City, Country" if city exists, otherwise just "Country"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocationLabel(entity: any, locale = "en-US"): string {
  if (!entity) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[getLocationLabel] Entity is null/undefined");
    }
    return "";
  }

  const city = extractCityName(entity);
  const country = extractCountryName(entity);

  // Debug warning in dev mode if no location data found
  if (process.env.NODE_ENV === "development" && !city && !country) {
    console.warn("[getLocationLabel] No location data found in entity:", {
      availableFields: Object.keys(entity).filter(key =>
        key.includes("city") || key.includes("country") || key.includes("location")
      ),
      sample: {
        location_city_name: entity.location_city_name,
        city_name: entity.city_name,
        author_city: entity.author_city,
        location_country_name: entity.location_country_name,
        country_name: entity.country_name,
        author_country: entity.author_country
      }
    });
  }

  return formatLocation(city, country, locale);
}
