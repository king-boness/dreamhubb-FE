// Countries data organized by continent
// Based on UN member states (193) + Vatican City + Palestine = 195 countries

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  continent: string;
}

export interface City {
  name: string;
  countryCode: string;
}

// Continents
export const continents = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Australia and Oceania"
];

// Countries by continent
export const countriesByContinent: Record<string, Country[]> = {
  Africa: [
    { name: "Algeria", code: "DZ", continent: "Africa" },
    { name: "Angola", code: "AO", continent: "Africa" },
    { name: "Benin", code: "BJ", continent: "Africa" },
    { name: "Botswana", code: "BW", continent: "Africa" },
    { name: "Burkina Faso", code: "BF", continent: "Africa" },
    { name: "Burundi", code: "BI", continent: "Africa" },
    { name: "Cabo Verde", code: "CV", continent: "Africa" },
    { name: "Cameroon", code: "CM", continent: "Africa" },
    { name: "Central African Republic", code: "CF", continent: "Africa" },
    { name: "Chad", code: "TD", continent: "Africa" },
    { name: "Comoros", code: "KM", continent: "Africa" },
    { name: "Congo", code: "CG", continent: "Africa" },
    { name: "Côte d'Ivoire", code: "CI", continent: "Africa" },
    { name: "Djibouti", code: "DJ", continent: "Africa" },
    { name: "Egypt", code: "EG", continent: "Africa" },
    { name: "Equatorial Guinea", code: "GQ", continent: "Africa" },
    { name: "Eritrea", code: "ER", continent: "Africa" },
    { name: "Eswatini", code: "SZ", continent: "Africa" },
    { name: "Ethiopia", code: "ET", continent: "Africa" },
    { name: "Gabon", code: "GA", continent: "Africa" },
    { name: "Gambia", code: "GM", continent: "Africa" },
    { name: "Ghana", code: "GH", continent: "Africa" },
    { name: "Guinea", code: "GN", continent: "Africa" },
    { name: "Guinea-Bissau", code: "GW", continent: "Africa" },
    { name: "Kenya", code: "KE", continent: "Africa" },
    { name: "Lesotho", code: "LS", continent: "Africa" },
    { name: "Liberia", code: "LR", continent: "Africa" },
    { name: "Libya", code: "LY", continent: "Africa" },
    { name: "Madagascar", code: "MG", continent: "Africa" },
    { name: "Malawi", code: "MW", continent: "Africa" },
    { name: "Mali", code: "ML", continent: "Africa" },
    { name: "Mauritania", code: "MR", continent: "Africa" },
    { name: "Mauritius", code: "MU", continent: "Africa" },
    { name: "Morocco", code: "MA", continent: "Africa" },
    { name: "Mozambique", code: "MZ", continent: "Africa" },
    { name: "Namibia", code: "NA", continent: "Africa" },
    { name: "Niger", code: "NE", continent: "Africa" },
    { name: "Nigeria", code: "NG", continent: "Africa" },
    { name: "Rwanda", code: "RW", continent: "Africa" },
    { name: "São Tomé and Príncipe", code: "ST", continent: "Africa" },
    { name: "Senegal", code: "SN", continent: "Africa" },
    { name: "Seychelles", code: "SC", continent: "Africa" },
    { name: "Sierra Leone", code: "SL", continent: "Africa" },
    { name: "Somalia", code: "SO", continent: "Africa" },
    { name: "South Africa", code: "ZA", continent: "Africa" },
    { name: "South Sudan", code: "SS", continent: "Africa" },
    { name: "Sudan", code: "SD", continent: "Africa" },
    { name: "Tanzania", code: "TZ", continent: "Africa" },
    { name: "Togo", code: "TG", continent: "Africa" },
    { name: "Tunisia", code: "TN", continent: "Africa" },
    { name: "Uganda", code: "UG", continent: "Africa" },
    { name: "Zambia", code: "ZM", continent: "Africa" },
    { name: "Zimbabwe", code: "ZW", continent: "Africa" }
  ],
  Asia: [
    { name: "Afghanistan", code: "AF", continent: "Asia" },
    { name: "Armenia", code: "AM", continent: "Asia" },
    { name: "Azerbaijan", code: "AZ", continent: "Asia" },
    { name: "Bahrain", code: "BH", continent: "Asia" },
    { name: "Bangladesh", code: "BD", continent: "Asia" },
    { name: "Bhutan", code: "BT", continent: "Asia" },
    { name: "Brunei", code: "BN", continent: "Asia" },
    { name: "Cambodia", code: "KH", continent: "Asia" },
    { name: "China", code: "CN", continent: "Asia" },
    { name: "Georgia", code: "GE", continent: "Asia" },
    { name: "India", code: "IN", continent: "Asia" },
    { name: "Indonesia", code: "ID", continent: "Asia" },
    { name: "Iran", code: "IR", continent: "Asia" },
    { name: "Iraq", code: "IQ", continent: "Asia" },
    { name: "Israel", code: "IL", continent: "Asia" },
    { name: "Japan", code: "JP", continent: "Asia" },
    { name: "Jordan", code: "JO", continent: "Asia" },
    { name: "Kazakhstan", code: "KZ", continent: "Asia" },
    { name: "Kuwait", code: "KW", continent: "Asia" },
    { name: "Kyrgyzstan", code: "KG", continent: "Asia" },
    { name: "Laos", code: "LA", continent: "Asia" },
    { name: "Lebanon", code: "LB", continent: "Asia" },
    { name: "Malaysia", code: "MY", continent: "Asia" },
    { name: "Maldives", code: "MV", continent: "Asia" },
    { name: "Mongolia", code: "MN", continent: "Asia" },
    { name: "Myanmar", code: "MM", continent: "Asia" },
    { name: "Nepal", code: "NP", continent: "Asia" },
    { name: "North Korea", code: "KP", continent: "Asia" },
    { name: "Oman", code: "OM", continent: "Asia" },
    { name: "Pakistan", code: "PK", continent: "Asia" },
    { name: "Palestine", code: "PS", continent: "Asia" },
    { name: "Philippines", code: "PH", continent: "Asia" },
    { name: "Qatar", code: "QA", continent: "Asia" },
    { name: "Saudi Arabia", code: "SA", continent: "Asia" },
    { name: "Singapore", code: "SG", continent: "Asia" },
    { name: "South Korea", code: "KR", continent: "Asia" },
    { name: "Sri Lanka", code: "LK", continent: "Asia" },
    { name: "Syria", code: "SY", continent: "Asia" },
    { name: "Taiwan", code: "TW", continent: "Asia" },
    { name: "Tajikistan", code: "TJ", continent: "Asia" },
    { name: "Thailand", code: "TH", continent: "Asia" },
    { name: "Timor-Leste", code: "TL", continent: "Asia" },
    { name: "Turkey", code: "TR", continent: "Asia" },
    { name: "Turkmenistan", code: "TM", continent: "Asia" },
    { name: "United Arab Emirates", code: "AE", continent: "Asia" },
    { name: "Uzbekistan", code: "UZ", continent: "Asia" },
    { name: "Vietnam", code: "VN", continent: "Asia" },
    { name: "Yemen", code: "YE", continent: "Asia" }
  ],
  Europe: [
    { name: "Albania", code: "AL", continent: "Europe" },
    { name: "Andorra", code: "AD", continent: "Europe" },
    { name: "Austria", code: "AT", continent: "Europe" },
    { name: "Belarus", code: "BY", continent: "Europe" },
    { name: "Belgium", code: "BE", continent: "Europe" },
    { name: "Bosnia and Herzegovina", code: "BA", continent: "Europe" },
    { name: "Bulgaria", code: "BG", continent: "Europe" },
    { name: "Croatia", code: "HR", continent: "Europe" },
    { name: "Cyprus", code: "CY", continent: "Europe" },
    { name: "Czech Republic", code: "CZ", continent: "Europe" },
    { name: "Denmark", code: "DK", continent: "Europe" },
    { name: "Estonia", code: "EE", continent: "Europe" },
    { name: "Finland", code: "FI", continent: "Europe" },
    { name: "France", code: "FR", continent: "Europe" },
    { name: "Germany", code: "DE", continent: "Europe" },
    { name: "Greece", code: "GR", continent: "Europe" },
    { name: "Hungary", code: "HU", continent: "Europe" },
    { name: "Iceland", code: "IS", continent: "Europe" },
    { name: "Ireland", code: "IE", continent: "Europe" },
    { name: "Italy", code: "IT", continent: "Europe" },
    { name: "Latvia", code: "LV", continent: "Europe" },
    { name: "Liechtenstein", code: "LI", continent: "Europe" },
    { name: "Lithuania", code: "LT", continent: "Europe" },
    { name: "Luxembourg", code: "LU", continent: "Europe" },
    { name: "Malta", code: "MT", continent: "Europe" },
    { name: "Moldova", code: "MD", continent: "Europe" },
    { name: "Monaco", code: "MC", continent: "Europe" },
    { name: "Montenegro", code: "ME", continent: "Europe" },
    { name: "Netherlands", code: "NL", continent: "Europe" },
    { name: "North Macedonia", code: "MK", continent: "Europe" },
    { name: "Norway", code: "NO", continent: "Europe" },
    { name: "Poland", code: "PL", continent: "Europe" },
    { name: "Portugal", code: "PT", continent: "Europe" },
    { name: "Romania", code: "RO", continent: "Europe" },
    { name: "Russia", code: "RU", continent: "Europe" },
    { name: "San Marino", code: "SM", continent: "Europe" },
    { name: "Serbia", code: "RS", continent: "Europe" },
    { name: "Slovakia", code: "SK", continent: "Europe" },
    { name: "Slovenia", code: "SI", continent: "Europe" },
    { name: "Spain", code: "ES", continent: "Europe" },
    { name: "Sweden", code: "SE", continent: "Europe" },
    { name: "Switzerland", code: "CH", continent: "Europe" },
    { name: "Ukraine", code: "UA", continent: "Europe" },
    { name: "United Kingdom", code: "GB", continent: "Europe" },
    { name: "Vatican City", code: "VA", continent: "Europe" }
  ],
  "North America": [
    { name: "Antigua and Barbuda", code: "AG", continent: "North America" },
    { name: "Bahamas", code: "BS", continent: "North America" },
    { name: "Barbados", code: "BB", continent: "North America" },
    { name: "Belize", code: "BZ", continent: "North America" },
    { name: "Canada", code: "CA", continent: "North America" },
    { name: "Costa Rica", code: "CR", continent: "North America" },
    { name: "Cuba", code: "CU", continent: "North America" },
    { name: "Dominica", code: "DM", continent: "North America" },
    { name: "Dominican Republic", code: "DO", continent: "North America" },
    { name: "El Salvador", code: "SV", continent: "North America" },
    { name: "Grenada", code: "GD", continent: "North America" },
    { name: "Guatemala", code: "GT", continent: "North America" },
    { name: "Haiti", code: "HT", continent: "North America" },
    { name: "Honduras", code: "HN", continent: "North America" },
    { name: "Jamaica", code: "JM", continent: "North America" },
    { name: "Mexico", code: "MX", continent: "North America" },
    { name: "Nicaragua", code: "NI", continent: "North America" },
    { name: "Panama", code: "PA", continent: "North America" },
    { name: "Saint Kitts and Nevis", code: "KN", continent: "North America" },
    { name: "Saint Lucia", code: "LC", continent: "North America" },
    { name: "Saint Vincent and the Grenadines", code: "VC", continent: "North America" },
    { name: "Trinidad and Tobago", code: "TT", continent: "North America" },
    { name: "United States", code: "US", continent: "North America" }
  ],
  "South America": [
    { name: "Argentina", code: "AR", continent: "South America" },
    { name: "Bolivia", code: "BO", continent: "South America" },
    { name: "Brazil", code: "BR", continent: "South America" },
    { name: "Chile", code: "CL", continent: "South America" },
    { name: "Colombia", code: "CO", continent: "South America" },
    { name: "Ecuador", code: "EC", continent: "South America" },
    { name: "Guyana", code: "GY", continent: "South America" },
    { name: "Paraguay", code: "PY", continent: "South America" },
    { name: "Peru", code: "PE", continent: "South America" },
    { name: "Suriname", code: "SR", continent: "South America" },
    { name: "Uruguay", code: "UY", continent: "South America" },
    { name: "Venezuela", code: "VE", continent: "South America" }
  ],
  "Australia and Oceania": [
    { name: "Australia", code: "AU", continent: "Australia and Oceania" },
    { name: "Fiji", code: "FJ", continent: "Australia and Oceania" },
    { name: "Kiribati", code: "KI", continent: "Australia and Oceania" },
    { name: "Marshall Islands", code: "MH", continent: "Australia and Oceania" },
    { name: "Micronesia", code: "FM", continent: "Australia and Oceania" },
    { name: "Nauru", code: "NR", continent: "Australia and Oceania" },
    { name: "New Zealand", code: "NZ", continent: "Australia and Oceania" },
    { name: "Palau", code: "PW", continent: "Australia and Oceania" },
    { name: "Papua New Guinea", code: "PG", continent: "Australia and Oceania" },
    { name: "Samoa", code: "WS", continent: "Australia and Oceania" },
    { name: "Solomon Islands", code: "SB", continent: "Australia and Oceania" },
    { name: "Tonga", code: "TO", continent: "Australia and Oceania" },
    { name: "Tuvalu", code: "TV", continent: "Australia and Oceania" },
    { name: "Vanuatu", code: "VU", continent: "Australia and Oceania" }
  ]
};

// Helper function to get all countries
export function getAllCountries(): Country[] {
  return Object.values(countriesByContinent).flat();
}

// Helper function to get countries by continent
export function getCountriesByContinent(continent: string): Country[] {
  return countriesByContinent[continent] || [];
}

// Helper function to get country by code
export function getCountryByCode(code: string): Country | undefined {
  return getAllCountries().find(c => c.code === code);
}

// Helper function to get continent by country code
export function getContinentByCountryCode(code: string): string | undefined {
  const country = getCountryByCode(code);
  return country?.continent;
}
