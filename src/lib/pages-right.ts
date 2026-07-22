import type { AppData, View } from "../types";
import type { Labels, Lang } from "./i18n";
import {
  countriesForContinent,
  currentBloomSeason,
  getContinent,
  getCountry,
  getPlant,
  plantsForCountry,
} from "./data";
import { escapeAttr, escapeHtml, FLAG_URL, tName } from "./dom";
import { plantText } from "./plant-text";
import { getFavoriteIds } from "./favorites";
import { continentMapHtml } from "./continent-maps";

function fact(title: string, body: string, unknown: string): string {
  return `
    <div class="fact-block">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body || unknown)}</p>
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
    return `
      <header class="page-header">
        <p class="page-eyebrow">${escapeHtml(tName(lang, plant))}</p>
        <h2 class="page-title">${L.further}</h2>
      </header>
      <div class="fact-grid print-facts">
        ${fact(L.compounds, plantText(plant, "activeCompounds", lang, L.unknown), L.unknown)}
        ${fact(L.preparation, plantText(plant, "preparation", lang, L.unknown), L.unknown)}
        ${fact(L.cautions, plantText(plant, "cautions", lang, L.unknown), L.unknown)}
        ${fact(L.flowering, plantText(plant, "floweringSeason", lang, L.unknown), L.unknown)}
        ${fact(L.history, plantText(plant, "historicalNotes", lang, L.unknown), L.unknown)}
        ${fact(L.nameBoth, `${plant.nameEn} / ${plant.nameDe}`, L.unknown)}
      </div>
    `;
  }

  if (view.type === "continents") {
    return `
      <div class="page-ornament continent-right">
        <div class="tome-seal" aria-hidden="true">❧</div>
        <div class="big-leaf">🌿</div>
        <h3>${escapeHtml(L.rightTitle)}</h3>
        <p>${escapeHtml(L.rightBody)}</p>
        <div class="tome-counter tome-counter-right" role="status">
          <span class="tome-counter-num">${data.plants.length}</span>
          <span class="tome-counter-label">${escapeHtml(L.tomeCountLabel)}</span>
          <span class="tome-counter-meta">${L.countryCount(data.countries.length)}</span>
        </div>
        <p class="folio">${L.folio.toUpperCase()}</p>
      </div>
    `;
  }

  if (view.type === "countries") {
    const continent = getContinent(data, view.continentId);
    const countries = countriesForContinent(data, view.continentId, lang);
    const plantIds = new Set<string>();
    countries.forEach((c) =>
      plantsForCountry(data, c.id, lang).forEach((p) => plantIds.add(p.id))
    );
    const contName = continent ? tName(lang, continent) : view.continentId;
    return `
      <div class="page-ornament continent-map-page">
        ${continentMapHtml(
          view.continentId,
          escapeAttr(`${L.continentMap}: ${contName}`),
          "continent-map continent-map-right"
        )}
        <h3>${continent ? escapeHtml(tName(lang, continent)) : ""}</h3>
        <p>${L.countryCount(countries.length)} · ${L.plantCount(plantIds.size)}</p>
        <p style="margin-top:1rem">${L.pickCountry}</p>
        <p class="folio">${L.countries.toUpperCase()}</p>
      </div>
    `;
  }

  if (view.type === "plants") {
    const country = getCountry(data, view.countryId);
    const plants = country ? plantsForCountry(data, country.id, lang) : [];
    return `
      <div class="page-ornament">
        ${
          country
            ? `<img src="${FLAG_URL(country.flagCode)}" alt="" width="72" height="48" style="border:2px solid rgba(90,61,40,.25);margin-bottom:1rem" />`
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

  if (view.type === "favorites") {
    const n = getFavoriteIds().length;
    return ornament(L, `<p class="total-plants">${L.plantCount(n)}</p>`);
  }

  if (view.type === "season") {
    const now = currentBloomSeason();
    const s =
      view.season && view.season !== "yearRound" ? view.season : now;
    const label =
      s === "spring"
        ? L.seasonSpring
        : s === "summer"
          ? L.seasonSummer
          : s === "autumn"
            ? L.seasonAutumn
            : L.seasonWinter;
    return ornament(
      L,
      `<p class="total-plants">${escapeHtml(label)}${s === now ? ` · ${escapeHtml(L.seasonNow)}` : ""} · ${escapeHtml(L.seasonYearRound)}</p>`
    );
  }

  return ornament(L);
}
