import type { AppData, Continent, Country, Plant } from "../types";

export async function loadAppData(): Promise<AppData> {
  const [continents, countries, plantIds] = await Promise.all([
    fetch("/data/continents.json").then((r) => r.json()) as Promise<Continent[]>,
    fetch("/data/countries.json").then((r) => r.json()) as Promise<Country[]>,
    fetch("/data/plants/ids.json").then((r) => r.json()) as Promise<string[]>,
  ]);

  const plants = await Promise.all(
    plantIds.map((id) =>
      fetch(`/data/plants/${id}.json`).then((r) => r.json()) as Promise<Plant>
    )
  );

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
