import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, v);
  },
  removeItem: (k: string) => {
    store.delete(k);
  },
  clear: () => store.clear(),
});

import {
  advanceBoostStage,
  getBoostStageIndex,
  getDiscoveredIds,
  getDiscoveryProgress,
  isFertilized,
  isSunflowerBloomed,
  markDiscovered,
  resetGardenRitual,
  setFertilized,
  setSunflowerBloomed,
  stageFromRatio,
  visualStage,
  visualStageIndex,
} from "./discovery";

describe("discovery", () => {
  beforeEach(() => {
    store.clear();
    resetGardenRitual();
  });

  it("marks unique plants only once", () => {
    expect(getDiscoveredIds()).toEqual([]);
    markDiscovered("chamomile");
    markDiscovered("chamomile");
    markDiscovered("ginger");
    expect(getDiscoveredIds().sort()).toEqual(["chamomile", "ginger"]);
  });

  it("computes progress and filters invalid ids", () => {
    markDiscovered("a");
    markDiscovered("gone");
    const p = getDiscoveryProgress(10, new Set(["a", "b"]));
    expect(p.visited).toBe(1);
    expect(p.total).toBe(10);
    expect(p.ratio).toBeCloseTo(0.1);
  });

  it("maps ratio to stages", () => {
    expect(stageFromRatio(0)).toBe("seed");
    expect(stageFromRatio(0.1)).toBe("sprout");
    expect(stageFromRatio(0.3)).toBe("seedling");
    expect(stageFromRatio(0.5)).toBe("growing");
    expect(stageFromRatio(0.7)).toBe("bud");
    expect(stageFromRatio(0.95)).toBe("bloom");
  });

  it("visual stage takes max of discovery and boost", () => {
    expect(visualStage(0, 0)).toBe("seed");
    expect(visualStage(0.05, 0)).toBe("sprout");
    expect(visualStage(0, 3)).toBe("growing");
    expect(visualStage(0.5, 1)).toBe("growing");
    expect(visualStage(0, 0, true)).toBe("bloom");
  });

  it("advances boost one stage at a time and clears fertilizer", () => {
    setFertilized(true);
    expect(advanceBoostStage(0)).toBe("sprout");
    expect(getBoostStageIndex()).toBe(1);
    expect(isFertilized()).toBe(false);

    setFertilized(true);
    expect(advanceBoostStage(0)).toBe("seedling");
    expect(getBoostStageIndex()).toBe(2);
  });

  it("advances from discovery floor when ratio is ahead of boost", () => {
    // ratio 0.5 → growing (index 3); next step is bud
    expect(advanceBoostStage(0.5)).toBe("bud");
    expect(getBoostStageIndex()).toBe(4);
  });

  it("reaches bloom after five advances and sets bloom flag", () => {
    for (let i = 0; i < 5; i++) {
      setFertilized(true);
      advanceBoostStage(0);
    }
    expect(getBoostStageIndex()).toBe(5);
    expect(isSunflowerBloomed()).toBe(true);
    expect(visualStageIndex(0, getBoostStageIndex())).toBe(5);
  });

  it("reset clears ritual but keeps discoveries", () => {
    markDiscovered("chamomile");
    setFertilized(true);
    advanceBoostStage();
    advanceBoostStage();
    setSunflowerBloomed(true);

    resetGardenRitual();

    expect(getBoostStageIndex()).toBe(0);
    expect(isFertilized()).toBe(false);
    expect(isSunflowerBloomed()).toBe(false);
    expect(getDiscoveredIds()).toEqual(["chamomile"]);
  });

  it("fertilizer and bloom flags persist", () => {
    setFertilized(true);
    expect(isFertilized()).toBe(true);
    setSunflowerBloomed(true);
    expect(isSunflowerBloomed()).toBe(true);
    expect(isFertilized()).toBe(false);
    expect(getBoostStageIndex()).toBe(5);
  });
});
