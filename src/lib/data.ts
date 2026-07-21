import type { AppData, Continent, Country, Plant } from "../types";

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

export async function loadAppData(): Promise<AppData> {
  const [continents, countries] = await Promise.all([
    fetchJson<Continent[]>("/data/continents.json"),
    fetchJson<Country[]>("/data/countries.json"),
  ]);

  // Prefer one aggregate file (3 total requests) when available
  try {
    const res = await fetch("/data/plants.json");
    if (res.ok) {
      const plants = (await res.json()) as Plant[];
      if (Array.isArray(plants) && plants.length > 0) {
        return { continents, countries, plants };
      }
    }
  } catch {
    // fall through to batched individual files
  }

  // Fallback: ids + individual monographs, batched (no 100+ parallel fetches)
  const plantIds = await fetchJson<string[]>("/data/plants/ids.json");
  const plants = await loadPlantsBatched(plantIds);
  return { continents, countries, plants };
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

export function searchPlants(data: AppData, query: string): Plant[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return data.plants.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(q) ||
      p.nameDe.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.family.toLowerCase().includes(q) ||
      p.activeCompounds.toLowerCase().includes(q)
  );
}
