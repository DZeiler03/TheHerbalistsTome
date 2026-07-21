/** Pixel-art continent map assets for the atlas pages. */

const MAP_BASE = "/images/maps";

const CONTINENT_MAPS: Record<string, string> = {
  europe: `${MAP_BASE}/europe.png`,
  asia: `${MAP_BASE}/asia.png`,
  "north-america": `${MAP_BASE}/north-america.png`,
  "south-america": `${MAP_BASE}/south-america.png`,
  africa: `${MAP_BASE}/africa.png`,
  oceania: `${MAP_BASE}/oceania.png`,
};

export function continentMapSrc(continentId: string): string | undefined {
  return CONTINENT_MAPS[continentId];
}

export function continentMapHtml(
  continentId: string,
  alt: string,
  className = "continent-map"
): string {
  const src = continentMapSrc(continentId);
  if (!src) return "";
  return `
    <figure class="continent-map-wrap">
      <div class="continent-map-frame">
        <img
          class="${className}"
          src="${src}"
          alt="${alt}"
          width="360"
          height="280"
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  `;
}
