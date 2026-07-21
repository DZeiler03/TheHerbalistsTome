const cache = new Map<string, string>();
let packsLoaded: Promise<void> | null = null;

/** Load plant portraits (prefer b64 shards, then packs, then static PNG). */
export async function ensurePlantImages(): Promise<void> {
  if (!packsLoaded) {
    packsLoaded = (async () => {
      try {
        const idsRes = await fetch("/data/plants/ids.json");
        if (!idsRes.ok) throw new Error("ids");
        const ids = (await idsRes.json()) as string[];
        const loaded = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`/images/plants-b64/${id}.json`);
              if (!r.ok) return null;
              const j = (await r.json()) as { id: string; png: string };
              return [j.id, `data:image/png;base64,${j.png}`] as const;
            } catch {
              return null;
            }
          })
        );
        let n = 0;
        for (const row of loaded) {
          if (row) {
            cache.set(row[0], row[1]);
            n++;
          }
        }
        if (n > 0) return;
        // Fallback: 3 large packs
        const packs = await Promise.all(
          [0, 1, 2].map((i) =>
            fetch(`/images/plants-pack-${i}.json`).then((r) =>
              r.ok ? (r.json() as Promise<Record<string, string>>) : {}
            )
          )
        );
        for (const pack of packs) {
          for (const [id, b64] of Object.entries(pack)) {
            cache.set(id, `data:image/png;base64,${b64}`);
          }
        }
      } catch {
        // Fall through to /images/plants/{id}.png
      }
    })();
  }
  await packsLoaded;
}

export function plantImageSrc(id: string): string {
  return cache.get(id) ?? `/images/plants/${id}.png`;
}
