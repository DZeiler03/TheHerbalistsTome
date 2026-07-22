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
import {
  getBoostStageIndex,
  getDiscoveryProgress,
  growFromIndex,
  isFertilized,
  isSunflowerBloomed,
  visualStage,
  visualStageIndex,
} from "./discovery";

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
    const validIds = data.plants.map((p) => p.id);
    const progress = getDiscoveryProgress(data.plants.length, validIds);
    const bloomed = isSunflowerBloomed();
    const fert = isFertilized();
    const boost = getBoostStageIndex();
    const stageIdx = visualStageIndex(progress.ratio, boost, bloomed);
    const stage = visualStage(progress.ratio, boost, bloomed);
    const grow = growFromIndex(stageIdx);
    return `
      <div class="page-ornament continent-right">
        <div class="tome-seal" aria-hidden="true">❧</div>
        <h3>${escapeHtml(L.rightTitle)}</h3>
        <p>${escapeHtml(L.rightBody)}</p>
        <section
          class="discovery-garden stage-${stage}${bloomed ? " is-bloomed" : ""}${fert ? " is-fertilized" : ""}"
          style="--grow: ${grow.toFixed(3)}"
          data-stage="${stage}"
          data-stage-index="${stageIdx}"
          aria-label="${escapeAttr(L.discoveryLabel)}"
        >
          <p class="discovery-label">${escapeHtml(L.discoveryLabel)}</p>
          <div class="discovery-scene">
            <button
              type="button"
              class="discovery-fertilizer${fert ? " is-ready" : ""}"
              data-discovery-fert="1"
              title="${escapeAttr(L.discoveryFertilizer)}"
              aria-label="${escapeAttr(L.discoveryFertilizer)}"
              ${bloomed ? "disabled" : ""}
            >
              <span class="fert-bag" aria-hidden="true"></span>
              <span class="fert-granules" aria-hidden="true"></span>
              <span class="fert-label">${escapeHtml(L.discoveryFertilizer)}</span>
            </button>
            <div class="discovery-plant-wrap" aria-hidden="true">
              <div class="discovery-plant">
                <div class="disc-seed"></div>
                <div class="disc-stem"></div>
                <div class="disc-leaf leaf-l"></div>
                <div class="disc-leaf leaf-r"></div>
                <div class="disc-leaf leaf-l2"></div>
                <div class="disc-leaf leaf-r2"></div>
                <div class="disc-leaf leaf-l3"></div>
                <div class="disc-leaf leaf-r3"></div>
                <div class="disc-bud"></div>
                <div class="disc-bloom">
                  <div class="disc-petals"></div>
                  <div class="disc-center"></div>
                </div>
              </div>
              <div class="discovery-pot">
                <div class="pot-rim"></div>
                <div class="pot-body"></div>
                <div class="pot-soil"></div>
              </div>
              <div class="discovery-water-layer" data-discovery-water-layer aria-hidden="true"></div>
            </div>
            <button
              type="button"
              class="discovery-can"
              data-discovery-water="1"
              title="${escapeAttr(L.discoveryWater)}"
              aria-label="${escapeAttr(L.discoveryWater)}"
              ${bloomed ? "disabled" : ""}
            >
              <span class="can-body" aria-hidden="true">
                <span class="can-stream" aria-hidden="true"></span>
              </span>
              <span class="can-label">${escapeHtml(L.discoveryWater)}</span>
            </button>
            <div class="discovery-confetti" data-discovery-confetti aria-hidden="true"></div>
          </div>
          <p class="discovery-count">${escapeHtml(L.discoveryCount(progress.visited, progress.total))}</p>
          <p class="discovery-caption">${escapeHtml(L.discoveryHint)}</p>
          <button
            type="button"
            class="discovery-reset"
            data-discovery-reset="1"
            title="${escapeAttr(L.discoveryReset)}"
          >${escapeHtml(L.discoveryReset)}</button>
          <p class="discovery-hint" data-discovery-hint hidden></p>
          <div class="discovery-congrats" data-discovery-congrats ${bloomed ? "" : "hidden"}>
            <strong>${escapeHtml(L.discoveryCongratsTitle)}</strong>
            <span>${escapeHtml(L.discoveryCongratsBody)}</span>
          </div>
        </section>
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
