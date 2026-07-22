import { describe, expect, it } from "vitest";
import type { AppData, View } from "../types";
import {
  countryVariantIndex,
  pageThemeClass,
  pageThemeForView,
} from "./page-theme";

const fixture: AppData = {
  continents: [
    {
      id: "europe",
      nameEn: "Europe",
      nameDe: "Europa",
      descriptionEn: "",
      descriptionDe: "",
    },
    {
      id: "asia",
      nameEn: "Asia",
      nameDe: "Asien",
      descriptionEn: "",
      descriptionDe: "",
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
    {
      id: "jp",
      continentId: "asia",
      nameEn: "Japan",
      nameDe: "Japan",
      flagCode: "jp",
    },
  ],
  plants: [
    {
      id: "chamomile",
      nameEn: "Chamomile",
      nameDe: "Kamille",
      scientificName: "Matricaria chamomilla",
      family: "Asteraceae",
      countryIds: ["de"],
      partsUsed: "Flowers",
      habitat: "Meadows",
      traditionalUsesEn: "Tea",
      traditionalUsesDe: "Tee",
      activeCompounds: "oils",
      preparation: "Infusion",
      cautions: "Allergy",
      floweringSeason: "Summer",
      historicalNotes: "Old",
    },
  ],
  useCategories: [],
};

describe("pageThemeForView", () => {
  it("uses atlas on continents overview", () => {
    const t = pageThemeForView(fixture, { type: "continents" });
    expect(t.continent).toBe("atlas");
    expect(pageThemeClass(t)).toContain("theme-atlas");
  });

  it("uses continent on countries list", () => {
    const t = pageThemeForView(fixture, {
      type: "countries",
      continentId: "asia",
    });
    expect(t.continent).toBe("asia");
    expect(pageThemeClass(t)).toBe("theme-asia theme-var-0");
  });

  it("uses continent + country variant on plants list", () => {
    const t = pageThemeForView(fixture, { type: "plants", countryId: "de" });
    expect(t.continent).toBe("europe");
    expect(t.countryId).toBe("de");
    expect(t.countryVariant).toBe(countryVariantIndex("de"));
    expect(pageThemeClass(t)).toContain("theme-europe");
    expect(pageThemeClass(t)).toContain("theme-country-de");
  });

  it("uses primary plant country for plant detail", () => {
    const t = pageThemeForView(fixture, {
      type: "plant",
      plantId: "chamomile",
    });
    expect(t.continent).toBe("europe");
    expect(t.countryId).toBe("de");
  });

  it("stable country variants differ for different ids", () => {
    expect(countryVariantIndex("de")).not.toBe(countryVariantIndex("jp"));
  });

  it("atlas for search/favorites", () => {
    const search: View = { type: "search", query: "x", results: [] };
    expect(pageThemeForView(fixture, search).continent).toBe("atlas");
    expect(pageThemeForView(fixture, { type: "favorites" }).continent).toBe(
      "atlas"
    );
  });
});
