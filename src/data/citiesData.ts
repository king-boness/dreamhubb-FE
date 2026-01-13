// Cities data organized by country code
// This is a simplified database - for production, consider using a comprehensive cities API

export interface City {
  name: string;
  countryCode: string;
}

// Major cities by country code (ISO 3166-1 alpha-2)
export const citiesByCountry: Record<string, string[]> = {
  // Slovakia - 141 oficiálnych miest SR
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
    "Sečovce", "Tisovec", "Želiezovce", "Kozárovce", "Kováčová", "Kamenica nad Cirochou",
    "Veľký Šariš", "Stupava", "Šurany", "Štúrovo", "Štrba", "Šahy",
    "Sliač", "Senec", "Spišské Podhradie", "Spišská Belá", "Spišské Vlachy",
    "Spišský Štvrtok", "Spišský Hrhov", "Spišská Stará Ves", "Spišská Kapitula",
    "Spišské Hanušovce", "Spišské Bystré", "Spišská Teplica", "Spišská Sobota",
    "Vrbové", "Banská Štiavnica", "Čierna nad Tisou", "Giraltovce"
    // Note: Function getCitiesByCountryCode() automatically removes duplicates
    // Current count after deduplication: ~105 unique cities
    // TODO: Add remaining ~36 cities to reach 141 total from official SR cities list
  ],
  // Czech Republic - 610 miest (27 statutárnych + 583 s titulom město)
  // Note: "Prague" was removed to avoid duplicate with "Praha"
  // All cities are sorted alphabetically
  CZ: [
    "Adamov", "Aš", "Bakov nad Jizerou", "Bavorov", "Bechyně", "Bečov nad Teplou",
    "Bělá nad Radbuzou", "Bělá pod Bezdězem", "Benátky nad Jizerou", "Benešov",
    "Beroun", "Bílina", "Blansko", "Blatná", "Blovice", "Bohumín", "Bohušovice nad Ohří",
    "Bojkovice", "Bor", "Borohrádek", "Boskovice", "Brandýs nad Labem-Stará Boleslav",
    "Brandýs nad Orlicí", "Brno", "Broumov", "Brumov-Bylnice", "Bruntál", "Břeclav",
    "Březnice", "Břidličná", "Bučovice", "Budišov nad Budišovkou", "Bystřice",
    "Bystřice nad Pernštejnem", "Bystřice pod Hostýnem", "Čáslav", "Čelákovice",
    "Černošice", "Černovice", "Česká Kamenice", "Česká Lípa", "Česká Třebová",
    "České Budějovice", "Český Brod", "Český Dub", "Český Krumlov", "Český Těšín",
    "Dačice", "Dašice", "Děčín", "Desná", "Dobrovice", "Dobruška", "Dobřany",
    "Dobříš", "Doksy", "Dolní Benešov", "Dolní Bousov", "Dolní Kounice", "Domažlice",
    "Dubí", "Dubňany", "Duchcov", "Dvůr Králové nad Labem", "Frýdek-Místek",
    "Frýdlant", "Frýdlant nad Ostravicí", "Fulnek", "Golčův Jeníkov", "Habartov",
    "Habry", "Hanušovice", "Harrachov", "Havířov", "Havlíčkův Brod", "Hejnice",
    "Heřmanův Městec", "Hlinsko", "Hluboká nad Vltavou", "Hlučín", "Hodkovice nad Mohelkou",
    "Hodonín", "Holice", "Holýšov", "Horažďovice", "Horní Benešov", "Horní Blatná",
    "Horní Bříza", "Horní Planá", "Horšovský Týn", "Hořice", "Hořovice", "Hostinné",
    "Hostivice", "Hostomice", "Hradec Králové", "Hradec nad Moravicí", "Hrádek nad Nisou",
    "Hranice", "Hronov", "Hrotovice", "Humpolec", "Hustopeče", "Cheb", "Chlumec",
    "Chlumec nad Cidlinou", "Chodov", "Chomutov", "Chotěboř", "Chrast", "Chrudim",
    "Chřibská", "Jablonec nad Jizerou", "Jablonec nad Nisou", "Jablonné nad Orlicí",
    "Jablonné v Podještědí", "Jáchymov", "Janské Lázně", "Jaroměř", "Jaroměřice nad Rokytnou",
    "Javorník", "Jemnice", "Jesenice", "Jeseník", "Jevíčko", "Jičín", "Jihlava",
    "Jilemnice", "Jindřichův Hradec", "Jirkov", "Jiříkov", "Kadaň", "Kamenice nad Lipou",
    "Kamenický Šenov", "Kaplice", "Kardašova Řečice", "Karlovy Vary", "Karviná",
    "Kasejovice", "Kaznějov", "Kdyně", "Kelč", "Kladno", "Kladruby", "Klášterec nad Ohří",
    "Klatovy", "Klecany", "Klimkovice", "Klobouky u Brna", "Kojetín", "Kolín",
    "Konice", "Kopřivnice", "Koryčany", "Kosmonosy", "Kostelec nad Černými lesy",
    "Kostelec nad Labem", "Kostelec nad Orlicí", "Košťany", "Kouřim", "Kralovice",
    "Kralupy nad Vltavou", "Králíky", "Králův Dvůr", "Kraslice", "Kravaře", "Krnov",
    "Kroměříž", "Krupka", "Kryry", "Kunovice", "Kunštát", "Kurim", "Kutná Hora",
    "Kyjov", "Lanškroun", "Lázně Bělohrad", "Ledeč nad Sázavou", "Letohrad", "Letovice",
    "Libáň", "Liberec", "Libochovice", "Libušín", "Lichnov", "Lidice", "Lípa",
    "Lipník nad Bečvou", "Litoměřice", "Litomyšl", "Litovel", "Litvínov", "Loket",
    "Lomnice nad Lužnicí", "Lomnice nad Popelkou", "Loštice", "Loučná nad Desnou",
    "Louny", "Lovosice", "Lučany nad Nisou", "Luhačovice", "Luže", "Mariánské Lázně",
    "Mělník", "Meziměstí", "Městec Králové", "Město Albrechtice", "Město Touškov",
    "Mikulášovice", "Mikulov", "Milovice", "Mimoň", "Miroslav", "Mladá Boleslav",
    "Mnichovo Hradiště", "Modřany", "Mohelnice", "Moravská Třebová", "Moravské Budějovice",
    "Moravský Beroun", "Moravský Krumlov", "Most", "Mšeno", "Náchod", "Nalžovské Hory",
    "Napajedla", "Neratovice", "Nesovice", "Netolice", "Neveklov", "Nová Bystřice",
    "Nová Paka", "Nová Role", "Nová Včelnice", "Nové Hrady", "Nové Město nad Metují",
    "Nové Město pod Smrkem", "Nové Sedlo", "Nový Bor", "Nový Bydžov", "Nový Jičín",
    "Nymburk", "Odolena Voda", "Odry", "Olomouc", "Opařany", "Opava", "Orlová",
    "Osek", "Oslavany", "Ostrava", "Ostrov", "Ostrov nad Ohří", "Otrokovice",
    "Pacov", "Pardubice", "Paskov", "Pelhřimov", "Petřvald", "Pečky", "Písek",
    "Planá", "Plánice", "Plasy", "Plesná", "Plumlov", "Plzeň", "Podbořany",
    "Poděbrady", "Pohořelice", "Police nad Metují", "Polná", "Postoloprty",
    "Potštát", "Počátky", "Praha", "Prachatice", "Proseč", "Prostějov", "Protivín",
    "Přebuz", "Přelouč", "Přerov", "Přeštice", "Příbor", "Příbram", "Přibyslav",
    "Přimda", "Rabí", "Radnice", "Rakovník", "Ralsko", "Raspenava", "Rejštejn",
    "Rokycany", "Rokytnice nad Jizerou", "Ronov nad Doubravou", "Rosice", "Rotava",
    "Roudnice nad Labem", "Rousínov", "Rovensko pod Troskami", "Roztoky", "Rožmitál pod Třemšínem",
    "Rožnov pod Radhoštěm", "Rtyně v Podkrkonoší", "Rumburk", "Rychnov nad Kněžnou",
    "Rychvald", "Rýmařov", "Řevnice", "Říčany", "Sadská", "Sázava", "Seč",
    "Sedlčany", "Sedlec-Prčice", "Semily", "Sezemice", "Sezimovo Ústí", "Skalná",
    "Skuteč", "Slaný", "Slatiňany", "Slavkov u Brna", "Slavičín", "Slušovice",
    "Smečno", "Smržovka", "Sněžné", "Soběslav", "Sobotka", "Sokolov", "Solnice",
    "Spálené Poříčí", "Staňkov", "Staré Město", "Staré Sedliště", "Stárkov",
    "Stochov", "Stod", "Strakonice", "Stráž nad Nežárkou", "Stráž pod Ralskem",
    "Strážnice", "Strážnice", "Stříbro", "Studénka", "Suchdol nad Lužnicí",
    "Sušice", "Světlá nad Sázavou", "Svit", "Svitavy", "Šenov", "Šluknov",
    "Špindlerův Mlýn", "Šternberk", "Štětí", "Štíty", "Šumperk", "Švihov",
    "Tábor", "Tanvald", "Tachov", "Telč", "Teplice", "Teplice nad Metují",
    "Terezín", "Tišnov", "Toužim", "Tovačov", "Trhové Sviny", "Trmice",
    "Trutnov", "Třebechovice pod Orebem", "Třebenice", "Třebíč", "Třeboň",
    "Třemošná", "Třemošnice", "Třinec", "Turnov", "Týn nad Vltavou", "Týnec nad Labem",
    "Týniště nad Orlicí", "Uherské Hradiště", "Uherský Brod", "Uherský Ostroh",
    "Újezd u Brna", "Úpice", "Úsov", "Ústí nad Labem", "Ústí nad Orlicí",
    "Valašské Klobouky", "Valašské Meziříčí", "Valtice", "Vamberk", "Varnsdorf",
    "Vejprty", "Velešín", "Velká Bíteš", "Velké Bílovice", "Velké Meziříčí",
    "Velké Opatovice", "Velké Popovice", "Veltrusy", "Velvary", "Veselí nad Lužnicí",
    "Veselí nad Moravou", "Vidnava", "Vimperk", "Vítkov", "Vizovice", "Vlašim",
    "Vodňany", "Volary", "Volyně", "Votice", "Vracov", "Vratimov", "Vrbno pod Pradědem",
    "Vrchlabí", "Vroutek", "Vrchlabí", "Vsetín", "Vysoké Mýto", "Vysoké nad Jizerou",
    "Vyškov", "Vyšší Brod", "Zábřeh", "Zákupy", "Zásmuky", "Zbiroh", "Zdice",
    "Zlaté Hory", "Zlín", "Znojmo", "Žatec", "Žďár nad Sázavou", "Železná Ruda",
    "Železnice", "Železný Brod", "Židlochovice", "Žirovnice", "Žlutice"
  ],
  // Poland - 302 mestských obcí (urban gmina)
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
    "Gniezno", "Knurow", "Zawiercie", "Rumia", "Starachowice",
    "Świętochłowice", "Zgierz", "Tczew", "Pabianice", "Gostyń", "Siedlce",
    "Lębork", "Żywiec", "Oława", "Brzeg", "Jarocin", "Jasło", "Nowa Sól",
    "Świdnica", "Chojnice", "Mława", "Żyrardów", "Augustów", "Bolesławiec",
    "Zduńska Wola", "Świecie", "Ostrów Wielkopolski", "Skarżysko-Kamienna",
    "Kraśnik", "Wejherowo", "Racibórz", "Ostróda", "Śrem", "Turek", "Wodzisław Śląski"
    // TODO: Add remaining ~201 cities to reach 302 total (currently ~101 cities)
  ],
  // Austria - 77 miest (TODO: update after verification from Statistik Austria)
  // Note: Sources mention "over 200 cities", but exact official number needs verification
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
    "Rust", "Oberpullendorf"
    // TODO: update Austria city_count after we have official number from Statistik Austria
  ],
  // Hungary - 346 miest (város), vrátane 23 so župnými právami
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
    "Törökbálint", "Biatorbágy", "Budakeszi", "Pilisvörösvár",
    "Visegrád", "Tata", "Komárom", "Mosonmagyaróvár",
    "Kőszeg", "Körmend", "Celldömölk"
    // TODO: Add remaining ~254 cities to reach 346 total (currently ~92 cities)
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
    "Saint Paul", "St. Petersburg", "Cincinnati", "Pittsburgh",
    "Greensboro", "Lincoln", "Anchorage", "Plano", "Orlando", "Irvine", "Newark",
    "Durham", "Chula Vista", "Toledo", "Fort Wayne", "Laredo",
    "Jersey City", "Chandler", "Madison", "Lubbock", "Scottsdale", "Reno", "Buffalo",
    "Gilbert", "Glendale", "North Las Vegas", "Winston-Salem", "Chesapeake", "Norfolk",
    "Fremont", "Garland", "Irving", "Hialeah", "Richmond", "Boise", "Spokane",
    "Baton Rouge", "Tacoma", "San Bernardino", "Grand Rapids", "Huntsville", "Salt Lake City",
    "Frisco", "Yonkers", "Amarillo", "McKinney", "Birmingham", "Rochester",
    "Fontana", "Oxnard", "Moreno Valley", "Fayetteville", "Aurora", "Columbus",
    "Montgomery", "Shreveport", "Akron", "Little Rock", "Augusta", "Grand Prairie",
    "Mobile", "Des Moines", "Tallahassee", "Overland Park",
    "Port St. Lucie", "Tempe", "Ontario", "Vancouver", "Sioux Falls", "Chattanooga",
    "Fort Lauderdale", "Providence", "Newport News", "Rancho Cucamonga", "Santa Clarita",
    "Peoria", "Oceanside", "Elk Grove", "Salem", "Pembroke Pines", "Eugene", "Garden Grove",
    "Cary", "Santa Rosa", "Fort Collins", "Corona", "Springfield", "Jackson", "Alexandria",
    "Hayward", "Lancaster", "Lakewood", "Lafayette", "Salinas", "Palmdale", "Hollywood",
    "Pasadena", "Sunnyvale", "Macon", "Pomona", "Escondido", "Joliet",
    "Torrance", "Bridgeport", "Paterson", "Naperville", "Savannah", "Mesquite", "Syracuse",
    "McAllen", "Orange", "Fullerton", "Killeen", "Dayton", "Miramar",
    "Thornton", "West Valley City", "Olathe", "Hampton", "Warren", "Midland", "Waco",
    "Charleston", "Columbia", "Denton", "Carrollton", "Surprise", "Roseville", "Sterling Heights",
    "Murfreesboro", "Gainesville", "Cedar Rapids", "Visalia", "Coral Springs", "New Haven",
    "Stamford", "Concord", "Kent", "Santa Clara", "Elizabeth", "Round Rock", "Thousand Oaks",
    "Lakeland", "Edison", "Fargo", "Lewisville", "Athens", "Clarksville", "Independence",
    "Simi Valley", "Hartford", "Abilene", "Topeka", "Vallejo", "Norman", "Berkeley",
    "Victorville", "Kalamazoo", "Odessa", "Evansville", "Allentown",
    "Beaumont", "Provo", "Lansing", "Downey", "Carlsbad", "El Monte", "Murrieta",
    "Temecula", "Fairfield", "Clearwater", "Richardson", "West Jordan",
    "Cambridge", "Waterbury", "Billings", "Lowell", "San Buenaventura", "Pueblo", "High Point",
    "West Covina", "Gresham", "Arvada", "Inglewood",
    "Santa Monica", "Daly City", "Erie", "Nampa", "Spokane Valley", "San Mateo", "Rialto",
    "El Cajon", "Burbank", "Las Cruces", "Compton", "South Bend", "Vista", "Renton",
    "Davie", "Greeley", "Mission Viejo", "Miami Gardens", "Brockton", "Hillsboro", "Lawton",
    "Somerville", "Wichita Falls", "San Angelo", "Merced", "Kenosha", "Trenton",
    "Bellingham", "Boca Raton", "Green Bay", "Reading", "Norwalk", "Fort Smith", "Wilmington",
    "Rio Rancho", "Longmont", "Avondale", "Bloomington", "Tuscaloosa", "Gary", "Arlington Heights",
    "Sparks", "Yakima", "Albany", "Lynn", "Edinburg", "Tyler", "Dearborn",
    "Livonia", "Westminster", "Boulder", "Sandy", "Racine", "Greenville",
    "Waukegan", "Fall River", "San Leandro", "Bethlehem", "Schaumburg", "Mount Pleasant",
    "Auburn", "Muncie", "Santa Barbara", "Terre Haute", "Citrus Heights", "Iowa City",
    "Suffolk", "Davenport", "Hickory", "San Marcos", "Lawrence", "Carol Stream", "South Gate",
    "Deltona", "Kenner", "Bossier City", "Layton", "Rapid City", "Yuma",
    "Appleton", "Gastonia", "Folsom", "Southfield", "Hoboken", "Lee's Summit", "San Rafael",
    "Wyoming", "Hammond", "Missouri City", "Baldwin Park",
    "St. Joseph", "Casper", "Lynwood", "Pittsfield", "New Bedford",
    "Tamarac", "South San Francisco", "Camden", "Yuba City", "Edmond",
    "Coeur d'Alene", "Danbury", "St. Cloud",
    "Jefferson City", "Pawtucket", "La Crosse", "Troy", "Madera", "Joplin",
    "Chico", "Gloucester", "Santa Fe", "Bismarck", "Kennewick"
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

// Priority cities map (top 10 per country)
export const PRIORITY_CITIES: Record<string, string[]> = {
  SK: [
    "Bratislava",
    "Košice",
    "Prešov",
    "Žilina",
    "Nitra",
    "Banská Bystrica",
    "Trnava",
    "Trenčín",
    "Martin",
    "Poprad"
  ],
  CZ: [
    "Praha",
    "Brno",
    "Ostrava",
    "Plzeň",
    "Liberec",
    "Olomouc",
    "Ústí nad Labem",
    "České Budějovice",
    "Hradec Králové",
    "Pardubice"
  ]
  // Ostatné krajiny zatiaľ nemusia mať top10 - tam môžeš použiť len abecedné zoradenie
};

// TOP cities by country (for city select options)
export const TOP_CITIES_BY_COUNTRY: Record<string, string[]> = {
  SK: [
    "Bratislava",
    "Košice",
    "Prešov",
    "Žilina",
    "Nitra",
    "Banská Bystrica",
    "Trnava",
    "Trenčín",
    "Martin",
    "Poprad"
  ],
  CZ: [
    "Praha",
    "Brno",
    "Ostrava",
    "Plzeň",
    "Liberec",
    "Olomouc",
    "Ústí nad Labem",
    "České Budějovice",
    "Hradec Králové",
    "Pardubice"
  ]
};

// Interface for city with divider support
export interface CityWithDivider {
  id: number | string;
  name: string;
  isDivider?: boolean;
}

// Helper function to sort cities with top 10 + divider + alphabetically
export function sortCitiesWithTop10<T extends { id: number | string; name: string; country_code?: string; country_name?: string }>(
  cities: T[],
  countryCodeOrName: string
): Array<T | CityWithDivider> {
  if (!cities || cities.length === 0) {
    return [];
  }

  // Get country code from country name if needed
  let countryCode: string | undefined = countryCodeOrName;
  if (countryCodeOrName.length > 2) {
    // It's a country name, try to find the code
    const countryNameMap: Record<string, string> = {
      Slovakia: "SK",
      "Czech Republic": "CZ",
      Czechia: "CZ"
    };
    countryCode = countryNameMap[countryCodeOrName] || countryCodeOrName.substring(0, 2).toUpperCase();
  } else {
    countryCode = countryCodeOrName.toUpperCase();
  }

  // Get priority cities for this country
  const priorityCityNames = PRIORITY_CITIES[countryCode] || [];

  // Separate priority and other cities
  const priorityCities: T[] = [];
  const otherCities: T[] = [];

  for (const city of cities) {
    const cityName = city.name;
    if (priorityCityNames.includes(cityName)) {
      priorityCities.push(city);
    } else {
      otherCities.push(city);
    }
  }

  // Sort priority cities by their order in PRIORITY_CITIES
  priorityCities.sort((a, b) => {
    const indexA = priorityCityNames.indexOf(a.name);
    const indexB = priorityCityNames.indexOf(b.name);
    return indexA - indexB;
  });

  // Sort other cities alphabetically
  otherCities.sort((a, b) => {
    return a.name.localeCompare(b.name, "sk", { sensitivity: "base" });
  });

  // Combine: priority cities + divider + other cities
  const result: Array<T | CityWithDivider> = [...priorityCities];

  // Add divider only if we have both priority and other cities
  if (priorityCities.length > 0 && otherCities.length > 0) {
    result.push({
      id: -1,
      name: "divider",
      isDivider: true
    } as CityWithDivider);
  }

  result.push(...otherCities);

  return result;
}

// Type for city with id and name (from backend)
export type CityFromBackend = {
  id: number | string;
  name: string;
  country_code?: string;
  country_name?: string;
};

// Type for city option in select
export type CityOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
  separator?: boolean;
};

// Helper function to build city options for country select
export function buildCityOptionsForCountry(countryCode: string, cities: CityFromBackend[]): CityOption[] {
  const normalizedCode = countryCode.toUpperCase();
  const topNames = TOP_CITIES_BY_COUNTRY[normalizedCode] ?? [];

  // Rozdelíme na TOP a ostatné
  const topCities: CityFromBackend[] = [];
  const otherCities: CityFromBackend[] = [];

  for (const city of cities) {
    if (topNames.includes(city.name)) {
      topCities.push(city);
    } else {
      otherCities.push(city);
    }
  }

  // Zoradiť TOP mestá podľa veľkosti (poradia v TOP_CITIES_BY_COUNTRY)
  topCities.sort((a, b) => {
    const indexA = topNames.indexOf(a.name);
    const indexB = topNames.indexOf(b.name);
    return indexA - indexB;
  });

  // Abecedné zoradenie ostatných miest
  otherCities.sort((a, b) => {
    return a.name.localeCompare(b.name, normalizedCode === "CZ" ? "cs" : "sk", { sensitivity: "base" });
  });

  const topOptions: CityOption[] = topCities.map((city) => ({
    label: city.name,
    value: city.id
  }));

  const otherOptions: CityOption[] = otherCities.map((city) => ({
    label: city.name,
    value: city.id
  }));

  // Ak krajina nie je SK ani CZ, sprav len čistý abecedný zoznam bez predelu
  if (!TOP_CITIES_BY_COUNTRY[normalizedCode]) {
    return otherOptions;
  }

  // NEPOUŽÍVAJ "prázdnu možnosť" ako predel!
  // Vlož neklikateľný separator / disabled option.
  const dividerOption: CityOption = {
    label: "____",
    value: "__divider__",
    disabled: true
    // len vizuálny predel
  };

  return [...topOptions, dividerOption, ...otherOptions];
}
