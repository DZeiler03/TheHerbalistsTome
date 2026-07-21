import Fuse from "fuse.js";
import type {
  AppData,
  BloomSeason,
  Continent,
  Country,
  Plant,
  UseCategory,
} from "../types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Load plant JSON files in small batches to avoid connection exhaustion. */
async function loadPlantsBatched(plantIds: string[]): Promise<Plant[]> {
  const batchSize = 8;
  const plants: Plant[] = [];
  for (let i = 0; i < plantIds.length; i += batchSize) {
    const slice = plantIds.slice(i, i + batchSize);
    const batch = await Promise.all(
      slice.map((id) => fetchJson<Plant>(`/data/plants/${id}.json`))
    );
    plants.push(...batch);
  }
  return plants;
}

function normalizePlant(p: Plant): Plant {
  return {
    ...p,
    useCategoryIds: p.useCategoryIds ?? [],
    bloomSeasons: p.bloomSeasons ?? [],
    kind: p.kind ?? "herb",
  };
}

export async function loadAppData(): Promise<AppData> {
  const [continents, countries, useCategories] = await Promise.all([
    fetchJson<Continent[]>("/data/continents.json"),
    fetchJson<Country[]>("/data/countries.json"),
    fetchJson<UseCategory[]>("/data/use-categories.json").catch(
      () => [] as UseCategory[]
    ),
  ]);

  try {
    const res = await fetch("/data/plants.json");
    if (res.ok) {
      const plants = (await res.json()) as Plant[];
      if (Array.isArray(plants) && plants.length > 0) {
        return {
          continents,
          countries,
          plants: plants.map(normalizePlant),
          useCategories,
        };
      }
    }
  } catch {
    // fall through
  }

  const plantIds = await fetchJson<string[]>("/data/plants/ids.json");
  const plants = (await loadPlantsBatched(plantIds)).map(normalizePlant);
  return { continents, countries, plants, useCategories };
}

export function plantsForCountry(data: AppData, countryId: string): Plant[] {
  return data.plants.filter((p) => p.countryIds.includes(countryId));
}

export function countriesForContinent(
  data: AppData,
  continentId: string
): Country[] {
  return data.countries.filter((c) => c.continentId === continentId);
}

export function plantCountForContinent(
  data: AppData,
  continentId: string
): number {
  const ids = new Set(
    countriesForContinent(data, continentId).map((c) => c.id)
  );
  return data.plants.filter((p) => p.countryIds.some((id) => ids.has(id)))
    .length;
}

export function getContinent(
  data: AppData,
  id: string
): Continent | undefined {
  return data.continents.find((c) => c.id === id);
}

export function getCountry(data: AppData, id: string): Country | undefined {
  return data.countries.find((c) => c.id === id);
}

export function getPlant(data: AppData, id: string): Plant | undefined {
  return data.plants.find((p) => p.id === id);
}

export function getUseCategory(
  data: AppData,
  id: string
): UseCategory | undefined {
  return data.useCategories.find((c) => c.id === id);
}

export function plantsWithCategories(
  plants: Plant[],
  categoryIds: string[]
): Plant[] {
  if (categoryIds.length === 0) return plants;
  return plants.filter((p) =>
    categoryIds.every((cid) => (p.useCategoryIds ?? []).includes(cid))
  );
}

/** Northern-hemisphere month → season (German/Austrian-first simplification). */
export function currentBloomSeason(date = new Date()): BloomSeason {
  const m = date.getMonth(); // 0–11
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

export function plantsBloomingNow(
  data: AppData,
  season: BloomSeason = currentBloomSeason()
): Plant[] {
  return data.plants.filter((p) => {
    const seasons = p.bloomSeasons ?? [];
    return seasons.includes(season) || seasons.includes("yearRound");
  });
}

/** Plants blooming now, grouped by continent id. */
export function bloomingByContinent(
  data: AppData,
  season: BloomSeason = currentBloomSeason()
): { continent: Continent; plants: Plant[] }[] {
  const blooming = plantsBloomingNow(data, season);
  return data.continents
    .map((continent) => {
      const countryIds = new Set(
        countriesForContinent(data, continent.id).map((c) => c.id)
      );
      const plants = blooming.filter((p) =>
        p.countryIds.some((id) => countryIds.has(id))
      );
      return { continent, plants };
    })
    .filter((row) => row.plants.length > 0);
}

type PlantSearchDoc = Plant & { _categorySearch: string };

let fuseCache: { plantsRef: Plant[]; fuse: Fuse<PlantSearchDoc> } | null =
  null;

function buildFuse(data: AppData): Fuse<PlantSearchDoc> {
  const categoryNamesById = new Map(
    data.useCategories.map((c) => [c.id, `${c.nameEn} ${c.nameDe}`])
  );
  const list: PlantSearchDoc[] = data.plants.map((p) => {
    const catText = (p.useCategoryIds ?? [])
      .map((id) => categoryNamesById.get(id) ?? id)
      .join(" ");
    return { ...p, _categorySearch: catText };
  });

  return new Fuse(list, {
    keys: [
      { name: "nameEn", weight: 0.35 },
      { name: "nameDe", weight: 0.35 },
      { name: "scientificName", weight: 0.2 },
      { name: "family", weight: 0.08 },
      { name: "activeCompounds", weight: 0.05 },
      { name: "_categorySearch", weight: 0.12 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}

export function searchPlants(data: AppData, query: string): Plant[] {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  if (!fuseCache || fuseCache.plantsRef !== data.plants) {
    fuseCache = { plantsRef: data.plants, fuse: buildFuse(data) };
  }

  return fuseCache.fuse.search(q).map((r) => {
    const { _categorySearch: _ignored, ...plant } = r.item;
    return plant;
  });
}
