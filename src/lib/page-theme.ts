import type { AppData, View } from "../types";
import { getCountry, getPlant } from "./data";

export type ContinentThemeId =
  | "atlas"
  | "europe"
  | "asia"
  | "north-america"
  | "south-america"
  | "africa"
  | "oceania";

export interface PageTheme {
  continent: ContinentThemeId;
  /** Secondary pattern variant for country pages (0–5). */
  countryVariant: number;
  countryId?: string;
}

const CONTINENTS: ContinentThemeId[] = [
  "europe",
  "asia",
  "north-america",
  "south-america",
  "africa",
  "oceania",
];

function isContinent(id: string): id is ContinentThemeId {
  return (CONTINENTS as string[]).includes(id);
}

/** Stable 0–5 variant from country id for secondary ornament shifts. */
export function countryVariantIndex(countryId: string): number {
  let h = 0;
  for (let i = 0; i < countryId.length; i++) {
    h = (h * 31 + countryId.charCodeAt(i)) >>> 0;
  }
  return h % 6;
}

/**
 * Resolve parchment filigree theme from the current book view.
 * Continents overview / search / favorites / season → neutral atlas.
 * Country / plant views inherit the continent motif + country variant.
 */
export function pageThemeForView(data: AppData, view: View): PageTheme {
  if (view.type === "countries" && isContinent(view.continentId)) {
    return {
      continent: view.continentId,
      countryVariant: 0,
    };
  }

  if (view.type === "plants") {
    const country = getCountry(data, view.countryId);
    const cont = country?.continentId;
    return {
      continent: cont && isContinent(cont) ? cont : "atlas",
      countryVariant: countryVariantIndex(view.countryId),
      countryId: view.countryId,
    };
  }

  if (view.type === "plant") {
    const plant = getPlant(data, view.plantId);
    const primaryId = plant?.countryIds?.[0];
    const country = primaryId ? getCountry(data, primaryId) : undefined;
    const cont = country?.continentId;
    return {
      continent: cont && isContinent(cont) ? cont : "atlas",
      countryVariant: primaryId ? countryVariantIndex(primaryId) : 0,
      countryId: primaryId,
    };
  }

  return { continent: "atlas", countryVariant: 0 };
}

/** Class string for page / filigree nodes. */
export function pageThemeClass(theme: PageTheme): string {
  const parts = [`theme-${theme.continent}`, `theme-var-${theme.countryVariant}`];
  if (theme.countryId) parts.push(`theme-country-${theme.countryId}`);
  return parts.join(" ");
}
