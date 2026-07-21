export type Lang = "en" | "de";

export function labels(lang: Lang) {
  return lang === "de"
    ? {
        continents: "Kontinente",
        countries: "Länder",
        plants: "Pflanzen",
        search: "Suche (DE / EN)…",
        back: "← Zurück",
        home: "⌂ Atlas",
        enter: "Den Folianten öffnen",
        authorBy: "Verfasst von",
        subtitle: "Ein Kräuter-Atlas der Welt",
        hint: "Desktop-Erfahrung · Echte Pflanzenfakten",
        noResults: "Keine Pflanzen gefunden.",
        noPlants: "Keine Pflanzen für dieses Land verzeichnet.",
        folio: "Foliant der Kräuterkunde",
        rightTitle: "Blättere behutsam",
        rightBody:
          "Wähle einen Kontinent, ein Land und entdecke Heilpflanzen mit gesicherten Angaben. Unsicheres Wissen steht als „Unknown“.",
        partsUsed: "Verwendete Teile",
        habitat: "Lebensraum",
        uses: "Traditionelle Anwendungen",
        compounds: "Inhaltsstoffe",
        preparation: "Zubereitung",
        cautions: "Hinweise & Vorsicht",
        flowering: "Blütezeit",
        history: "Historisches",
        regions: "Vorkommen (Länder)",
        results: "Suchergebnisse",
        plantCount: (n: number) => `${n} Pflanze${n === 1 ? "" : "n"}`,
        countryCount: (n: number) => `${n} Land${n === 1 ? "" : "länder"}`,
        loading: "Der Foliant wird geöffnet…",
        mobileTitle: "Nur für Desktop",
        mobileBody:
          "The Herbalists Tome ist für größere Bildschirme gestaltet. Bitte öffne die Seite auf einem Desktop- oder Laptop-Gerät.",
        further: "Weiteres Wissen",
        nameBoth: "Name (EN / DE)",
        contIntro: "Sechs Regionen · ein Foliant heilkundlicher Pflanzen.",
        pickCountry:
          "Wähle ein Land, um die dort verzeichneten Heilpflanzen zu sehen.",
        pickPlant:
          "Öffne einen Eintrag für botanische Details, Anwendungen und Vorsichtshinweise.",
        searchHint:
          "Suche durchsucht deutsche und englische Namen sowie wissenschaftliche Bezeichnungen.",
      }
    : {
        continents: "Continents",
        countries: "Countries",
        plants: "Plants",
        search: "Search (DE / EN)…",
        back: "← Back",
        home: "⌂ Atlas",
        enter: "Enter the Tome",
        authorBy: "Authored by",
        subtitle: "A World Atlas of Herbal Lore",
        hint: "Desktop experience · Real botanical facts",
        noResults: "No plants found.",
        noPlants: "No plants recorded for this country.",
        folio: "The Herbalist's Folio",
        rightTitle: "Turn the leaves",
        rightBody:
          "Choose a continent, a country, and discover medicinal plants with verified facts. Uncertain knowledge is marked “Unknown”.",
        partsUsed: "Parts used",
        habitat: "Habitat",
        uses: "Traditional uses",
        compounds: "Active compounds",
        preparation: "Preparation",
        cautions: "Cautions",
        flowering: "Flowering season",
        history: "Historical notes",
        regions: "Associated countries",
        results: "Search results",
        plantCount: (n: number) => `${n} plant${n === 1 ? "" : "s"}`,
        countryCount: (n: number) => `${n} countr${n === 1 ? "y" : "ies"}`,
        loading: "Opening the tome…",
        mobileTitle: "Desktop only",
        mobileBody:
          "The Herbalists Tome is designed for larger screens. Please open this page on a desktop or laptop device.",
        further: "Further notes",
        nameBoth: "Name (EN / DE)",
        contIntro: "Six regions · one folio of medicinal plants.",
        pickCountry: "Select a country to view its recorded medicinal plants.",
        pickPlant:
          "Open an entry for botanical details, uses, and cautions.",
        searchHint:
          "Search matches German and English names as well as scientific names.",
      };
}

export type Labels = ReturnType<typeof labels>;
