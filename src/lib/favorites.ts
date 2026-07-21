const STORAGE_KEY = "herbalists-tome:favorites";

let memoryFallback: string[] = [];

function readStorage(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return null;
  }
}

function writeStorage(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    memoryFallback = ids;
  }
}

export function getFavoriteIds(): string[] {
  const fromStore = readStorage();
  if (fromStore === null) return [...memoryFallback];
  memoryFallback = fromStore;
  return [...fromStore];
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavorite(id: string): string[] {
  const current = getFavoriteIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  writeStorage(next);
  memoryFallback = next;
  return [...next];
}
