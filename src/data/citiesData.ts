// Cities data organized by country code
// This is a simplified database - for production, consider using a comprehensive cities API

export interface City {
  name: string;
  countryCode: string;
}

// Major cities by country code (ISO 3166-1 alpha-2)
export const citiesByCountry: Record<string, string[]> = {
  // Slovakia
  SK: [
    "Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica",
    "Trnava", "Trenčín", "Martin", "Poprad", "Prievidza", "Zvolen",
    "Považská Bystrica", "Nové Zámky", "Michalovce", "Spišská Nová Ves",
    "Komárno", "Levice", "Humenné", "Bardejov", "Liptovský Mikuláš",
    "Ružomberok", "Piešťany", "Topoľčany", "Čadca", "Rimavská Sobota",
    "Dunajská Streda", "Pezinok", "Partizánske", "Vranov nad Topľou",
    "Senica", "Nové Mesto nad Váhom", "Kežmarok", "Rožňava", "Dolný Kubín",
    "Brezno", "Snina", "Stará Ľubovňa", "Zlaté Moravce", "Lučenec",
    "Bánovce nad Bebravou", "Púchov", "Malacky", "Handlová", "Kysucké Nové Mesto",
    "Galanta", "Detva", "Skalica", "Levoča", "Revúca", "Sabinov", "Bytča",
    "Veľký Krtíš", "Svidník", "Moldava nad Bodvou", "Holíč", "Stropkov",
    "Šaľa", "Stará Turá", "Fiľakovo", "Sereď", "Krompachy", "Veľké Kapušany",
    "Myjava", "Vrútky", "Svit", "Krupina", "Námestovo", "Bojnice", "Tvrdošín",
    "Žiar nad Hronom", "Hlohovec", "Turčianske Teplice", "Ilava", "Dubnica nad Váhom",
    "Kráľovský Chlmec", "Šamorín", "Hriňová", "Sládkovičovo", "Žarnovica",
    "Hnúšťa", "Lipany", "Modra", "Kremnica", "Brezová pod Bradlom",
    "Trenčianske Teplice", "Medzilaborce", "Gelnica", "Poltár", "Veľký Meder",
    "Sobrance", "Rajec", "Tornaľa", "Kráľová nad Váhom", "Nová Baňa",
    "Sečovce", "Tisovec", "Želiezovce", "Kozárovce", "Kováčová", "Kamenica nad Cirochou"
  ],
  // Czech Republic
  // Note: "Prague" was removed to avoid duplicate with "Praha"
  CZ: [
    "Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem",
    "České Budějovice", "Hradec Králové", "Pardubice", "Zlín", "Havířov",
    "Kladno", "Most", "Opava", "Frýdek-Místek", "Jihlava", "Karviná", "Teplice",
    "Děčín", "Chomutov", "Jablonec nad Nisou", "Mladá Boleslav", "Prostějov",
    "Přerov", "Česká Lípa", "Třebíč", "Třinec", "Tábor", "Znojmo", "Příbram",
    "Orlová", "Cheb", "Modřany", "Kroměříž", "Litoměřice", "Hodonín",
    "Nový Jičín", "Uherské Hradiště", "Chrudim", "Jindřichův Hradec", "Vsetín",
    "Valašské Meziříčí", "Litvínov", "Trutnov", "Písek", "Kopřivnice", "Klatovy",
    "Břeclav", "Šumperk", "Varnsdorf", "Kutná Hora", "Sokolov", "Žďár nad Sázavou",
    "Český Těšín", "Hranice", "Jeseník", "Karlovy Vary", "Louny", "Mělník",
    "Náchod", "Pelhřimov", "Rakovník", "Semily", "Strakonice", "Svitavy",
    "Tachov", "Ústí nad Orlicí", "Vysoké Mýto", "Zábřeh", "Žatec"
  ],
  // Poland
  PL: [
    "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin",
    "Bydgoszcz", "Lublin", "Katowice", "Białystok", "Gdynia", "Częstochowa",
    "Radom", "Sosnowiec", "Toruń", "Kielce", "Gliwice", "Zabrze", "Bytom",
    "Olsztyn", "Bielsko-Biała", "Rzeszów", "Ruda Śląska", "Rybnik", "Tychy",
    "Dąbrowa Górnicza", "Płock", "Elbląg", "Opole", "Gorzów Wielkopolski",
    "Wałbrzych", "Zielona Góra", "Włocławek", "Tarnów", "Chorzów", "Kalisz",
    "Koszalin", "Legnica", "Grudziądz", "Słupsk", "Jaworzno", "Jastrzębie-Zdrój",
    "Jelenia Góra", "Nowy Sącz", "Jędrzejów", "Konin", "Piotrków Trybunalski",
    "Lubin", "Ostrołęka", "Stargard", "Mysłowice", "Piekary Śląskie", "Głogów",
    "Chełm", "Zamość", "Tomaszów Mazowiecki", "Przemyśl", "Stalowa Wola",
    "Mielec", "Łomża", "Żory", "Tarnowskie Góry", "Bełchatów", "Mikołów",
    "Ostrołęka", "Gniezno", "Knurow", "Zawiercie", "Rumia", "Starachowice",
    "Świętochłowice", "Zgierz", "Tczew", "Pabianice", "Gostyń", "Siedlce",
    "Lębork", "Żywiec", "Oława", "Brzeg", "Jarocin", "Jasło", "Nowa Sól",
    "Świdnica", "Chojnice", "Mława", "Żyrardów", "Augustów", "Bolesławiec",
    "Zduńska Wola", "Świecie", "Ostrów Wielkopolski", "Skarżysko-Kamienna",
    "Kraśnik", "Wejherowo", "Racibórz", "Ostróda", "Śrem", "Turek", "Wodzisław Śląski"
  ],
  // Austria
  AT: [
    "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach",
    "Wels", "Sankt Pölten", "Dornbirn", "Steyr", "Wiener Neustadt", "Feldkirch",
    "Bregenz", "Leonding", "Klosterneuburg", "Baden", "Wolfsberg", "Leoben",
    "Krems", "Traun", "Amstetten", "Kapfenberg", "Hallein", "Kufstein",
    "Traiskirchen", "Schwechat", "Braunau am Inn", "Spittal an der Drau",
    "Saalfelden", "Ansfelden", "Tulln", "Hohenems", "Ternitz", "Perchtoldsdorf",
    "Bad Ischl", "Eisenstadt", "Gmunden", "Bludenz", "Wörgl", "Vöcklabruck",
    "Knittelfeld", "Bischofshofen", "Grieskirchen", "Lienz", "Zwettl", "Judenburg",
    "Voitsberg", "Sankt Veit an der Glan", "Waidhofen an der Ybbs", "Mistelbach",
    "Gänserndorf", "Bruck an der Mur", "Sankt Johann im Pongau", "Korneuburg",
    "Neunkirchen", "Hollabrunn", "Tamsweg", "Mattersburg", "Oberwart", "Güssing",
    "Jennersdorf", "Deutschlandsberg", "Leibnitz", "Hartberg", "Fürstenfeld",
    "Weiz", "Gleisdorf", "Mürzzuschlag", "Bruck an der Leitha", "Neusiedl am See",
    "Eisenstadt", "Rust", "Oberpullendorf", "Oberwart", "Güssing", "Jennersdorf"
  ],
  // Hungary
  HU: [
    "Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza",
    "Kecskemét", "Székesfehérvár", "Szombathely", "Szolnok", "Tatabánya",
    "Kaposvár", "Békéscsaba", "Érd", "Veszprém", "Zalaegerszeg", "Sopron",
    "Eger", "Nagykanizsa", "Dunaújváros", "Hódmezővásárhely", "Salgótarján",
    "Cegléd", "Baja", "Ózd", "Szekszárd", "Pápa", "Gyöngyös", "Kazincbarcika",
    "Gödöllő", "Gyula", "Hajdúböszörmény", "Kiskunfélegyháza", "Ajka",
    "Orosháza", "Szentes", "Szigetszentmiklós", "Esztergom", "Jászberény",
    "Komló", "Makó", "Kiskunhalas", "Szentendre", "Hatvan", "Karcag", "Gárdony",
    "Mohács", "Dombóvár", "Sárvár", "Vác", "Sárospatak", "Hajdúszoboszló",
    "Balmazújváros", "Mezőtúr", "Bicske", "Pásztó", "Sümeg", "Tapolca", "Zirc",
    "Balatonfüred", "Siófok", "Keszthely", "Hévíz", "Balatonboglár", "Fonyód",
    "Tihany", "Badacsony", "Nagyvázsony", "Várpalota", "Pákozd", "Martonvásár",
    "Érd", "Törökbálint", "Biatorbágy", "Budakeszi", "Pilisvörösvár", "Szentendre",
    "Visegrád", "Esztergom", "Tata", "Tatabánya", "Komárom", "Győr", "Mosonmagyaróvár",
    "Sopron", "Kőszeg", "Szombathely", "Körmend", "Sárvár", "Celldömölk", "Pápa"
  ],
  // Germany
  DE: [
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf",
    "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nuremberg",
    "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Karlsruhe",
    "Mannheim", "Augsburg", "Wiesbaden", "Gelsenkirchen", "Mönchengladbach",
    "Braunschweig", "Chemnitz", "Kiel", "Aachen", "Halle", "Magdeburg", "Freiburg",
    "Krefeld", "Lübeck", "Oberhausen", "Erfurt", "Mainz", "Rostock", "Kassel",
    "Hagen", "Hamm", "Saarbrücken", "Mülheim", "Potsdam", "Ludwigshafen", "Oldenburg",
    "Leverkusen", "Osnabrück", "Solingen", "Heidelberg", "Herne", "Neuss", "Darmstadt",
    "Paderborn", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Wolfsburg", "Offenbach",
    "Ulm", "Heilbronn", "Pforzheim", "Göttingen", "Bottrop", "Trier", "Recklinghausen",
    "Reutlingen", "Bremerhaven", "Koblenz", "Bergisch Gladbach", "Jena", "Remscheid",
    "Erlangen", "Moers", "Siegen", "Hildesheim", "Salzgitter", "Cottbus", "Gera",
    "Kaiserslautern", "Schwerin", "Gütersloh", "Iserlohn", "Düren", "Esslingen",
    "Ratingen", "Tübingen", "Lünen", "Villingen-Schwenningen", "Flensburg", "Hanau",
    "Marl", "Ludwigsburg", "Velbert", "Minden", "Dessau", "Worms", "Neumünster",
    "Konstanz", "Norderstedt", "Delmenhorst", "Viersen", "Gladbeck", "Rheine",
    "Dorsten", "Detmold", "Schwäbisch Gmünd", "Castrop-Rauxel", "Lüneburg", "Marburg",
    "Arnsberg", "Lüdenscheid", "Bamberg", "Bayreuth", "Stolberg", "Baden-Baden",
    "Fulda", "Hof", "Lingen", "Landshut", "Aschaffenburg", "Dinslaken", "Aalen",
    "Plauen", "Neubrandenburg", "Brandenburg", "Celle", "Kempten", "Freiburg im Breisgau"
  ],
  // United States
  US: [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
    "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
    "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis",
    "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit",
    "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
    "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City",
    "Mesa", "Atlanta", "Omaha", "Colorado Springs", "Raleigh", "Miami", "Long Beach",
    "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Tampa", "Cleveland",
    "Wichita", "Arlington", "New Orleans", "Honolulu", "Anaheim", "Santa Ana",
    "St. Louis", "Riverside", "Corpus Christi", "Lexington", "Henderson", "Stockton",
    "Saint Paul", "St. Petersburg", "Cincinnati", "St. Louis", "Pittsburgh",
    "Greensboro", "Lincoln", "Anchorage", "Plano", "Orlando", "Irvine", "Newark",
    "Durham", "Chula Vista", "Toledo", "Fort Wayne", "St. Petersburg", "Laredo",
    "Jersey City", "Chandler", "Madison", "Lubbock", "Scottsdale", "Reno", "Buffalo",
    "Gilbert", "Glendale", "North Las Vegas", "Winston-Salem", "Chesapeake", "Norfolk",
    "Fremont", "Garland", "Irving", "Hialeah", "Richmond", "Boise", "Spokane",
    "Baton Rouge", "Tacoma", "San Bernardino", "Grand Rapids", "Huntsville", "Salt Lake City",
    "Frisco", "Yonkers", "Amarillo", "Glendale", "McKinney", "Birmingham", "Rochester",
    "Tacoma", "Fontana", "Oxnard", "Moreno Valley", "Fayetteville", "Aurora", "Columbus",
    "Montgomery", "Shreveport", "Akron", "Little Rock", "Augusta", "Grand Prairie",
    "Mobile", "Des Moines", "Tallahassee", "Huntsville", "Grand Rapids", "Overland Park",
    "Port St. Lucie", "Tempe", "Ontario", "Vancouver", "Sioux Falls", "Chattanooga",
    "Fort Lauderdale", "Providence", "Newport News", "Rancho Cucamonga", "Santa Clarita",
    "Peoria", "Oceanside", "Elk Grove", "Salem", "Pembroke Pines", "Eugene", "Garden Grove",
    "Cary", "Santa Rosa", "Fort Collins", "Corona", "Springfield", "Jackson", "Alexandria",
    "Hayward", "Lancaster", "Lakewood", "Lafayette", "Salinas", "Palmdale", "Hollywood",
    "Pasadena", "Sunnyvale", "Macon", "Pomona", "Escondido", "Kansas City", "Joliet",
    "Torrance", "Bridgeport", "Paterson", "Naperville", "Savannah", "Mesquite", "Syracuse",
    "McAllen", "Pasadena", "Orange", "Fullerton", "Killeen", "Dayton", "Miramar",
    "Thornton", "West Valley City", "Olathe", "Hampton", "Warren", "Midland", "Waco",
    "Charleston", "Columbia", "Denton", "Carrollton", "Surprise", "Roseville", "Sterling Heights",
    "Murfreesboro", "Gainesville", "Cedar Rapids", "Visalia", "Coral Springs", "New Haven",
    "Stamford", "Concord", "Kent", "Santa Clara", "Elizabeth", "Round Rock", "Thousand Oaks",
    "Lakeland", "Edison", "Fargo", "Lewisville", "Athens", "Clarksville", "Independence",
    "Simi Valley", "Hartford", "Abilene", "Topeka", "Vallejo", "Norman", "Berkeley",
    "Victorville", "Richmond", "Kalamazoo", "Odessa", "Columbia", "Evansville", "Allentown",
    "Beaumont", "Peoria", "Provo", "Lansing", "Downey", "Carlsbad", "El Monte", "Murrieta",
    "Temecula", "Springfield", "Fairfield", "Clearwater", "Richardson", "West Jordan",
    "Cambridge", "Waterbury", "Billings", "Lowell", "San Buenaventura", "Pueblo", "High Point",
    "West Covina", "Richmond", "Murrieta", "Gresham", "Fargo", "Arvada", "Inglewood",
    "Santa Monica", "Daly City", "Erie", "Nampa", "Spokane Valley", "San Mateo", "Rialto",
    "El Cajon", "Burbank", "Las Cruces", "Compton", "South Bend", "Vista", "Renton",
    "Davie", "Greeley", "Mission Viejo", "Miami Gardens", "Brockton", "Hillsboro", "Lawton",
    "Somerville", "Wichita Falls", "San Angelo", "Lakewood", "Merced", "Kenosha", "Trenton",
    "Bellingham", "Boca Raton", "Green Bay", "Reading", "Norwalk", "Fort Smith", "Wilmington",
    "Rio Rancho", "Longmont", "Avondale", "Bloomington", "Tuscaloosa", "Gary", "Arlington Heights",
    "Sparks", "Yakima", "Rochester", "Albany", "Lynn", "Edinburg", "Tyler", "Dearborn",
    "Livonia", "Westminster", "Boulder", "Sandy", "Brockton", "Burbank", "Racine", "Greenville",
    "Waukegan", "Fall River", "San Leandro", "Bethlehem", "Schaumburg", "Mount Pleasant",
    "Auburn", "Muncie", "Santa Barbara", "Terre Haute", "Citrus Heights", "Iowa City",
    "Suffolk", "Davenport", "Hickory", "San Marcos", "Lawrence", "Carol Stream", "South Gate",
    "Deltona", "Kenner", "Bossier City", "Layton", "Rapid City", "Yuma", "Spokane",
    "Appleton", "Gastonia", "Folsom", "Southfield", "Hoboken", "Lee's Summit", "San Rafael",
    "Bethlehem", "Wyoming", "Hammond", "Missouri City", "Baldwin Park", "Gary", "St. Joseph",
    "Lakeland", "Bellingham", "Lakewood", "Casper", "Lynwood", "Pittsfield", "New Bedford",
    "Tamarac", "South San Francisco", "Camden", "Yuba City", "Edmond", "Bossier City",
    "Albany", "Coeur d'Alene", "Danbury", "St. Cloud", "Jefferson City", "Racine", "Pawtucket",
    "La Crosse", "Troy", "Madera", "Joplin", "Chico", "Auburn", "Gloucester", "Santa Fe",
    "Bismarck", "Kennewick", "Bellingham", "Greenville", "Brockton", "Burbank", "Racine",
    "Greenville", "Waukegan", "Fall River", "San Leandro", "Bethlehem", "Schaumburg",
    "Mount Pleasant", "Auburn", "Muncie", "Santa Barbara", "Terre Haute", "Citrus Heights",
    "Iowa City", "Suffolk", "Davenport", "Hickory", "San Marcos", "Lawrence", "Carol Stream",
    "South Gate", "Deltona", "Kenner", "Bossier City", "Layton", "Rapid City", "Yuma",
    "Spokane", "Appleton", "Gastonia", "Folsom", "Southfield", "Hoboken", "Lee's Summit",
    "San Rafael", "Bethlehem", "Wyoming", "Hammond", "Missouri City", "Baldwin Park",
    "Gary", "St. Joseph", "Lakeland", "Bellingham", "Lakewood", "Casper", "Lynwood",
    "Pittsfield", "New Bedford", "Tamarac", "South San Francisco", "Camden", "Yuba City",
    "Edmond", "Bossier City", "Albany", "Coeur d'Alene", "Danbury", "St. Cloud",
    "Jefferson City", "Racine", "Pawtucket", "La Crosse", "Troy", "Madera", "Joplin",
    "Chico", "Auburn", "Gloucester", "Santa Fe", "Bismarck", "Kennewick", "Bellingham"
  ]
};

// Helper function to get cities by country code
export function getCitiesByCountryCode(countryCode: string): string[] {
  const list = citiesByCountry[countryCode] || [];
  // Deduplicate by case-insensitive name to avoid obvious duplicates (e.g. Praha / Prague)
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of list) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  }
  return result;
}

// Helper function to filter cities by search term
export function filterCitiesBySearch(cities: string[], searchTerm: string): string[] {
  if (!searchTerm) return cities;
  const lowerSearch = searchTerm.toLowerCase();
  return cities.filter(city => city.toLowerCase().includes(lowerSearch));
}

// Helper function to get cities for a country with autocomplete
export function getCitySuggestions(countryCode: string, searchTerm: string): string[] {
  const cities = getCitiesByCountryCode(countryCode);
  return filterCitiesBySearch(cities, searchTerm);
}
