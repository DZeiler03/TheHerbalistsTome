import type { Plant } from "../types";
import type { Lang } from "./i18n";

/** Prefer German field when UI language is DE. */
export function plantText(
  plant: Plant,
  field:
    | "partsUsed"
    | "habitat"
    | "activeCompounds"
    | "preparation"
    | "cautions"
    | "floweringSeason"
    | "historicalNotes",
  lang: Lang,
  unknown = "Unknown"
): string {
  if (lang === "de") {
    const deKey = `${field}De` as keyof Plant;
    const de = plant[deKey];
    if (typeof de === "string" && de.trim()) return de;
  }
  const en = plant[field];
  return typeof en === "string" && en.trim() ? en : unknown;
}

export function plantUses(plant: Plant, lang: Lang): string {
  return lang === "de" ? plant.traditionalUsesDe : plant.traditionalUsesEn;
}

export function kindLabel(
  plant: Plant,
  L: {
    kindTree: string;
    kindShrub: string;
    kindVine: string;
    kindHerb: string;
  }
): string {
  const k = plant.kind ?? "herb";
  if (k === "tree") return L.kindTree;
  if (k === "shrub") return L.kindShrub;
  if (k === "vine") return L.kindVine;
  return L.kindHerb;
}
