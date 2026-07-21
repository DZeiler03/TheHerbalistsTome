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

export interface Plant {
  id: string;
  countryIds: string[];
  nameEn: string;
  nameDe: string;
  scientificName: string;
  family: string;
  partsUsed: string;
  habitat: string;
  traditionalUsesEn: string;
  traditionalUsesDe: string;
  activeCompounds: string;
  preparation: string;
  cautions: string;
  floweringSeason: string;
  historicalNotes: string;
}

export type View =
  | { type: 'start' }
  | { type: 'continents' }
  | { type: 'countries'; continentId: string }
  | { type: 'plants'; countryId: string }
  | { type: 'plant'; plantId: string }
  | { type: 'search'; query: string; results: Plant[] };

export interface AppData {
  continents: Continent[];
  countries: Country[];
  plants: Plant[];
}
