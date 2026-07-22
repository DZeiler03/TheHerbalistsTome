const DISCOVERED_KEY = "herbalists-tome:discovered";
const FERT_KEY = "herbalists-tome:discovery-fertilized";
const BLOOM_KEY = "herbalists-tome:sunflower-bloomed";
const BOOST_KEY = "herbalists-tome:sunflower-boost";

export type GrowthStage =
  | "seed"
  | "sprout"
  | "seedling"
  | "growing"
  | "bud"
  | "bloom";

const STAGES: GrowthStage[] = [
  "seed",
  "sprout",
  "seedling",
  "growing",
  "bud",
  "bloom",
];

/** Visual height factor per stage index 0..5 */
export const GROW_BY_INDEX: readonly number[] = [
  0, 0.12, 0.32, 0.55, 0.78, 1,
];

const MAX_STAGE = STAGES.length - 1;

let memDiscovered: string[] = [];
let memFert = false;
let memBloomed = false;
let memBoost = 0;

function readJsonArray(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return null;
  }
}

function writeJsonArray(key: string, ids: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* memory only */
  }
}

function readFlag(key: string): boolean | null {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return null;
  }
}

function writeFlag(key: string, on: boolean): void {
  try {
    if (on) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    /* memory only */
  }
}

function readInt(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return 0;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return 0;
    return n;
  } catch {
    return null;
  }
}

function writeInt(key: string, n: number): void {
  try {
    localStorage.setItem(key, String(n));
  } catch {
    /* memory only */
  }
}

export function getDiscoveredIds(): string[] {
  const fromStore = readJsonArray(DISCOVERED_KEY);
  if (fromStore === null) return [...memDiscovered];
  memDiscovered = fromStore;
  return [...fromStore];
}

export function markDiscovered(id: string): string[] {
  const current = getDiscoveredIds();
  if (current.includes(id)) return current;
  const next = [...current, id];
  writeJsonArray(DISCOVERED_KEY, next);
  memDiscovered = next;
  return [...next];
}

export function getDiscoveryProgress(
  totalPlants: number,
  validIds?: ReadonlySet<string> | string[]
): { visited: number; total: number; ratio: number } {
  const total = Math.max(0, totalPlants);
  let ids = getDiscoveredIds();
  if (validIds) {
    const set =
      validIds instanceof Set ? validIds : new Set(validIds);
    ids = ids.filter((id) => set.has(id));
  }
  const visited = ids.length;
  const ratio = total === 0 ? 0 : Math.min(1, visited / total);
  return { visited, total, ratio };
}

export function isFertilized(): boolean {
  const f = readFlag(FERT_KEY);
  if (f === null) return memFert;
  memFert = f;
  return f;
}

export function setFertilized(on: boolean): void {
  memFert = on;
  writeFlag(FERT_KEY, on);
}

export function isSunflowerBloomed(): boolean {
  const f = readFlag(BLOOM_KEY);
  if (f === null) return memBloomed;
  memBloomed = f;
  return f;
}

export function setSunflowerBloomed(on: boolean): void {
  memBloomed = on;
  writeFlag(BLOOM_KEY, on);
  if (on) {
    setFertilized(false);
    setBoostStageIndex(MAX_STAGE);
  }
}

export function getBoostStageIndex(): number {
  const n = readInt(BOOST_KEY);
  if (n === null) return memBoost;
  memBoost = Math.max(0, Math.min(MAX_STAGE, n));
  return memBoost;
}

export function setBoostStageIndex(i: number): void {
  memBoost = Math.max(0, Math.min(MAX_STAGE, Math.floor(i)));
  writeInt(BOOST_KEY, memBoost);
  if (memBoost >= MAX_STAGE) {
    memBloomed = true;
    writeFlag(BLOOM_KEY, true);
  } else if (memBloomed && memBoost < MAX_STAGE) {
    memBloomed = false;
    writeFlag(BLOOM_KEY, false);
  }
}

/**
 * Advance ritual one visual stage from the higher of discovery/boost.
 * Pass current discovery ratio so growth never stalls behind open pages.
 * Returns the new stage name. No-op at max.
 */
export function advanceBoostStage(discoveryRatio = 0): GrowthStage {
  const cur = visualStageIndex(discoveryRatio, getBoostStageIndex(), false);
  if (cur >= MAX_STAGE) {
    setSunflowerBloomed(true);
    return "bloom";
  }
  const next = cur + 1;
  setBoostStageIndex(next);
  setFertilized(false);
  if (next >= MAX_STAGE) setSunflowerBloomed(true);
  return stageFromIndex(next);
}

/** Clear ritual only — discovery visits stay. */
export function resetGardenRitual(): void {
  memBoost = 0;
  memBloomed = false;
  memFert = false;
  writeInt(BOOST_KEY, 0);
  writeFlag(BLOOM_KEY, false);
  writeFlag(FERT_KEY, false);
}

/** Map discovery ratio → growth stage index 0..5 */
export function stageIndexFromRatio(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.65) return 3;
  if (ratio < 0.9) return 4;
  return 5;
}

export function stageFromIndex(i: number): GrowthStage {
  return STAGES[Math.max(0, Math.min(MAX_STAGE, i))]!;
}

export function stageFromRatio(ratio: number): GrowthStage {
  return stageFromIndex(stageIndexFromRatio(ratio));
}

/**
 * Visual stage = max(discovery progress, ritual boost).
 * `bloomed` forces full bloom for backward compatibility.
 */
export function visualStage(
  ratio: number,
  boostIndex: number,
  bloomed = false
): GrowthStage {
  if (bloomed) return "bloom";
  const disc = stageIndexFromRatio(ratio);
  const boost = Math.max(0, Math.min(MAX_STAGE, Math.floor(boostIndex)));
  return stageFromIndex(Math.max(disc, boost));
}

export function visualStageIndex(
  ratio: number,
  boostIndex: number,
  bloomed = false
): number {
  if (bloomed) return MAX_STAGE;
  const disc = stageIndexFromRatio(ratio);
  const boost = Math.max(0, Math.min(MAX_STAGE, Math.floor(boostIndex)));
  return Math.max(disc, boost);
}

export function growFromIndex(i: number): number {
  return GROW_BY_INDEX[Math.max(0, Math.min(MAX_STAGE, i))] ?? 0;
}

export function allGrowthStages(): GrowthStage[] {
  return [...STAGES];
}
