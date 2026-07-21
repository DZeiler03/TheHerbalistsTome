import type { AppData, Country, View } from "../types";
import type { Labels, Lang } from "./i18n";
import {
  countriesForContinent,
  getContinent,
  getCountry,
  getPlant,
  plantsForCountry,
} from "./data";
import { escapeHtml, FLAG_URL, tName } from "./dom";

function fact(title: string, body: string): string {
  return `
    <div class="fact-block">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body || "Unknown")}</p>
    </div>
  `;
}

function ornament(L: Labels, extra = ""): string {
  return `
    <div class="page-ornament">
      <div class="big-leaf">🌿</div>
      <h3>${L.rightTitle}</h3>
      <p>${L.rightBody}</p>
      ${extra}
      <p class="folio">${L.folio.toUpperCase()}</p>
    </div>
  `;
}

export function renderRightPage(
  data: AppData,
  view: View,
  lang: Lang,
  L: Labels
): string {
  if (view.type === "plant") {
    const plant = getPlant(data, view.plantId);
    if (!plant) return ornament(L);
    const regionNames = plant.countryIds
      .map((id) => getCountry(data, id))
      .filter((c): c is Country => !!c)
      .map((c) => tName(lang, c))
      .join(", ");
    return `
      <header class="page-header">
        <p class="page-eyebrow">${escapeHtml(tName(lang, plant))}</p>
        <h2 class="page-title">${L.further}</h2>
      </header>
      <div class="fact-grid">
        ${fact(L.preparation, plant.preparation)}
        ${fact(L.cautions, plant.cautions)}
        ${fact(L.flowering, plant.floweringSeason)}
        ${fact(L.history, plant.historicalNotes)}
        ${fact(L.regions, regionNames || "Unknown")}
        ${fact(L.nameBoth, `${plant.nameEn} / ${plant.nameDe}`)}
      </div>
    `;
  }

  if (view.type === "continents") {
    return ornament(L, `<p class="folio">XXI · SPECIMINA</p>`);
  }

  if (view.type === "countries") {
    const continent = getContinent(data, view.continentId);
    const countries = countriesForContinent(data, view.continentId);
    const plantIds = new Set<string>();
    countries.forEach((c) =>
      plantsForCountry(data, c.id).forEach((p) => plantIds.add(p.id))
    );
    return `
      <div class="page-ornament">
        <div class="big-leaf">📜</div>
        <h3>${continent ? escapeHtml(tName(lang, continent)) : ""}</h3>
        <p>${L.countryCount(countries.length)} · ${L.plantCount(plantIds.size)}</p>
        <p style="margin-top:1.25rem">${L.pickCountry}</p>
        <p class="folio">${L.countries.toUpperCase()}</p>
      </div>
    `;
  }

  if (view.type === "plants") {
    const country = getCountry(data, view.countryId);
    const plants = country ? plantsForCountry(data, country.id) : [];
    return `
      <div class="page-ornament">
        ${
          country
            ? `<img src="${FLAG_URL(country.flagCode)}" alt="" width="72" height="48" style="border:2px solid rgba(90,61,40,.25);margin-bottom:1rem;box-shadow:2px 2px 0 rgba(0,0,0,.1)" />`
            : `<div class="big-leaf">🌱</div>`
        }
        <h3>${country ? escapeHtml(tName(lang, country)) : ""}</h3>
        <p>${L.plantCount(plants.length)}</p>
        <p style="margin-top:1.25rem">${L.pickPlant}</p>
        <p class="folio">${L.plants.toUpperCase()}</p>
      </div>
    `;
  }

  if (view.type === "search") {
    return `
      <div class="page-ornament">
        <div class="big-leaf">⌕</div>
        <h3>${L.results}</h3>
        <p>${L.searchHint}</p>
        <p class="folio">INDEX</p>
      </div>
    `;
  }

  return ornament(L);
}
