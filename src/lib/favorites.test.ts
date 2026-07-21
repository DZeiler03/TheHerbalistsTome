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
  getFavoriteIds,
  isFavorite,
  toggleFavorite,
} from "./favorites";

describe("favorites", () => {
  beforeEach(() => {
    store.clear();
  });

  it("toggles add and remove", () => {
    expect(getFavoriteIds()).toEqual([]);
    expect(toggleFavorite("chamomile")).toEqual(["chamomile"]);
    expect(isFavorite("chamomile")).toBe(true);
    expect(toggleFavorite("chamomile")).toEqual([]);
    expect(isFavorite("chamomile")).toBe(false);
  });

  it("persists across getFavoriteIds", () => {
    toggleFavorite("ginger");
    toggleFavorite("tea");
    expect(getFavoriteIds().sort()).toEqual(["ginger", "tea"]);
  });
});
