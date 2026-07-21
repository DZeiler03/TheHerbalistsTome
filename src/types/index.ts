export interface Continent {
  id: string;
  nameEn: string;
  nameDe: string;
  descriptionEn: string;
  descriptionDe: string;
}

export interface Country {
  id: string;
  continentId: string;
  nameEn: string;
  nameDe: string;
  /** ISO 3166-1 alpha-2 code for flag */
  flagCode: string;
}

/** Growth form for display (herb list icons, filtering). */
export type PlantKind = "herb" | "tree" | "shrub" | "vine" | "other";

export type BloomSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "yearRound";

export interface UseCategory {
  id: string;
  nameEn: string;
  nameDe: string;
}

export interface Plant {
  id: string;
  countryIds: string[];
  nameEn: string;
  nameDe: string;
  scientificName: string;
  family: string;
  /** Defaults to "herb" when omitted in older data files. */
  kind?: PlantKind;
  /** Use-case / effect-area category IDs (see use-categories.json). */
  useCategoryIds?: string[];
  /**
   * Structured bloom seasons for the seasonal view.
   * Northern-hemisphere-oriented where relevant; tropical species often include yearRound.
   */
  bloomSeasons?: BloomSeason[];
  partsUsed: string;
  partsUsedDe?: string;
  habitat: string;
  habitatDe?: string;
  traditionalUsesEn: string;
  traditionalUsesDe: string;
  activeCompounds: string;
  activeCompoundsDe?: string;
  preparation: string;
  preparationDe?: string;
  cautions: string;
  cautionsDe?: string;
  floweringSeason: string;
  floweringSeasonDe?: string;
  historicalNotes: string;
  historicalNotesDe?: string;
}

export type View =
  | { type: "start" }
  | { type: "continents" }
  | { type: "countries"; continentId: string }
  | { type: "plants"; countryId: string }
  | {
      type: "plant";
      plantId: string;
      /** Sibling plant ids for prev/next arrows (same list context). */
      navIds?: string[];
    }
  | { type: "search"; query: string; results: Plant[] }
  | { type: "favorites" }
  | {
      type: "season";
      /** Which season to show; defaults to current calendar season. */
      season?: BloomSeason;
    };

export interface AppData {
  continents: Continent[];
  countries: Country[];
  plants: Plant[];
  useCategories: UseCategory[];
}
