import { ref } from "vue";

export interface LocationData {
  continent: string;
  country: string;
  city: string;
  countryCode?: string;
}

export function useGeolocation() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get user's current location using browser Geolocation API
  async function getCurrentLocation(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      error.value = "Geolocation is not supported by your browser";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = await reverseGeocode(latitude, longitude);
            isLoading.value = false;
            resolve(locationData);
          } catch (err) {
            isLoading.value = false;
            error.value = err instanceof Error ? err.message : "Failed to get location";
            resolve(null);
          }
        },
        (err) => {
          isLoading.value = false;
          error.value = err.message || "Failed to get location";
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Reverse geocode coordinates to address using OpenStreetMap Nominatim API
  async function reverseGeocode(lat: number, lon: number): Promise<LocationData | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "dreamhubb-app/1.0"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = await response.json();
      const address = data.address;

      if (!address) {
        return null;
      }

      // Extract country, city, and continent
      const country = address.country || "";
      const countryCode = address.country_code?.toUpperCase() || "";
      const city = address.city || address.town || address.village || address.municipality || "";

      // Map country to continent (simplified - you might want to use a more comprehensive mapping)
      const continent = await getContinentFromCountry(country, countryCode);

      return {
        continent,
        country,
        city,
        countryCode
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug("Reverse geocoding error:", err);
      }
      throw err;
    }
  }

  // Simple mapping of countries to continents
  // This is a simplified version - for production, use a comprehensive mapping
  async function getContinentFromCountry(country: string, countryCode: string): Promise<string> {
    // Import countries data dynamically
    const { getContinentByCountryCode } = await import("src/data/countriesData");

    if (countryCode) {
      const continent = getContinentByCountryCode(countryCode);
      if (continent) {
        return continent;
      }
    }

    // Fallback mapping for common countries
    const countryToContinent: Record<string, string> = {
      "United States": "North America",
      Canada: "North America",
      Mexico: "North America",
      Brazil: "South America",
      Argentina: "South America",
      Chile: "South America",
      "United Kingdom": "Europe",
      Germany: "Europe",
      France: "Europe",
      Italy: "Europe",
      Spain: "Europe",
      Poland: "Europe",
      "Czech Republic": "Europe",
      Slovakia: "Europe",
      China: "Asia",
      Japan: "Asia",
      India: "Asia",
      Australia: "Oceania",
      "New Zealand": "Oceania"
    };

    return countryToContinent[country] || "Europe"; // Default to Europe if not found
  }

  return {
    isLoading,
    error,
    getCurrentLocation
  };
}
