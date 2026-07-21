const cache = new Map<string, string>();
let packsLoaded: Promise<void> | null = null;

/** Load base64 plant packs (used when individual PNGs are not on the host). */
export async function ensurePlantImages(): Promise<void> {
  if (!packsLoaded) {
    packsLoaded = (async () => {
      try {
        const packs = await Promise.all(
          [0, 1, 2].map(
            (i) =>
              fetch(`/images/plants-pack-${i}.json`).then((r) => {
                if (!r.ok) throw new Error(String(r.status));
                return r.json() as Promise<Record<string, string>>;
              })
          )
        );
        for (const pack of packs) {
          for (const [id, b64] of Object.entries(pack)) {
            cache.set(id, `data:image/png;base64,${b64}`);
          }
        }
      } catch {
        // Fallback: serve static PNGs from /images/plants/{id}.png
      }
    })();
  }
  await packsLoaded;
}

export function plantImageSrc(id: string): string {
  return cache.get(id) ?? `/images/plants/${id}.png`;
}
