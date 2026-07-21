import { describe, expect, it } from "vitest";
import {
  countriesForContinent,
  getContinent,
  getCountry,
  getPlant,
  plantCountForContinent,
  plantsForCountry,
  plantsWithCategories,
  searchPlants,
} from "./data";
import type { AppData } from "../types";

const fixture: AppData = {
  continents: [
    {
      id: "europe",
      nameEn: "Europe",
      nameDe: "Europa",
      descriptionEn: "EU",
      descriptionDe: "EU",
    },
  ],
  countries: [
    {
      id: "de",
      continentId: "europe",
      nameEn: "Germany",
      nameDe: "Deutschland",
      flagCode: "de",
    },
  ],
  useCategories: [
    { id: "calming", nameEn: "Calming", nameDe: "Beruhigend" },
  ],
  plants: [
    {
      id: "chamomile",
      countryIds: ["de"],
      nameEn: "German Chamomile",
      nameDe: "Kamille",
      scientificName: "Matricaria chamomilla",
      family: "Asteraceae",
      traditionalUsesEn: "calming tea",
      traditionalUsesDe: "beruhigender Tee",
      partsUsed: "Flowers",
      habitat: "Europe",
      activeCompounds: "bisabolol",
      preparation: "tea",
      cautions: "allergy",
      floweringSeason: "Summer",
      historicalNotes: "old",
      useCategoryIds: ["calming"],
      bloomSeasons: ["summer"],
    },
    {
      id: "ginger",
      countryIds: ["de"],
      nameEn: "Ginger",
      nameDe: "Ingwer",
      scientificName: "Zingiber officinale",
      family: "Zingiberaceae",
      traditionalUsesEn: "nausea",
      traditionalUsesDe: "Übelkeit",
      partsUsed: "Rhizome",
      habitat: "Asia",
      activeCompounds: "gingerols",
      preparation: "tea",
      cautions: "none",
      floweringSeason: "Rare",
      historicalNotes: "spice",
      useCategoryIds: ["digestive"],
      bloomSeasons: ["yearRound"],
    },
  ],
};

describe("data helpers", () => {
  it("getContinent finds and misses", () => {
    expect(getContinent(fixture, "europe")?.nameEn).toBe("Europe");
    expect(getContinent(fixture, "asia")).toBeUndefined();
  });

  it("getCountry / getPlant", () => {
    expect(getCountry(fixture, "de")?.nameDe).toBe("Deutschland");
    expect(getPlant(fixture, "ginger")?.nameEn).toBe("Ginger");
    expect(getPlant(fixture, "nope")).toBeUndefined();
  });

  it("plantsForCountry and continent counts", () => {
    expect(plantsForCountry(fixture, "de")).toHaveLength(2);
    expect(countriesForContinent(fixture, "europe")).toHaveLength(1);
    expect(plantCountForContinent(fixture, "europe")).toBe(2);
  });

  it("sorts plants and countries alphabetically by language", () => {
    const deOrder = plantsForCountry(fixture, "de", "de").map((p) => p.nameDe);
    expect(deOrder).toEqual(["Ingwer", "Kamille"]);
    const enOrder = plantsForCountry(fixture, "de", "en").map((p) => p.nameEn);
    expect(enOrder).toEqual(["German Chamomile", "Ginger"]);
  });

  it("plantsWithCategories filters", () => {
    expect(plantsWithCategories(fixture.plants, [])).toHaveLength(2);
    expect(plantsWithCategories(fixture.plants, ["calming"])).toHaveLength(1);
  });

  it("searchPlants exact and fuzzy", () => {
    expect(searchPlants(fixture, "Kamille")[0]?.id).toBe("chamomile");
    expect(searchPlants(fixture, "gingr")[0]?.id).toBe("ginger");
    expect(searchPlants(fixture, "zzzzz")).toHaveLength(0);
    expect(searchPlants(fixture, "a")).toHaveLength(0);
  });
});
