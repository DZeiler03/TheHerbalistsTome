import type { AppData, Country, Plant, View } from "../types";
import type { Labels } from "./i18n";
import type { Lang } from "./i18n";
import {
  countriesForContinent,
  getContinent,
  getCountry,
  getPlant,
  plantCountForContinent,
  plantsForCountry,
} from "./data";
import { escapeAttr, escapeHtml, FLAG_URL, tDesc, tName } from "./dom";
import { plantImageSrc } from "./plant-images";

function fact(title: string, body: string): string {
  return `
    <div class="fact-block">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body || "Unknown")}</p>
    </div>
  `;
}

function breadcrumb(parts: { label: string; action?: string }[]): string {
  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      ${parts
        .map((p, i) => {
          const sep = i > 0 ? `<span class="sep">›</span>` : "";
          if (p.action) {
            return `${sep}<button type="button" data-nav="${p.action}">${escapeHtml(p.label)}</button>`;
          }
          return `${sep}<span>${escapeHtml(p.label)}</span>`;
        })
        .join("")}
    </nav>
  `;
}

export function renderLeftPage(
  data: AppData,
  view: View,
  lang: Lang,
  L: Labels
): string {
  if (view.type === "continents") {
    return `
      <header class="page-header">
        <p class="page-eyebrow">${L.folio}</p>
        <h2 class="page-title">${L.continents}</h2>
        <p class="page-desc">${L.contIntro}</p>
      </header>
      <div class="continent-grid">
        ${data.continents
          .map((c) => {
            const n = plantCountForContinent(data, c.id);
            return `
              <button type="button" class="continent-card" data-continent="${c.id}">
                <div class="name">${escapeHtml(tName(lang, c))}</div>
                <div class="desc">${escapeHtml(tDesc(lang, c))}</div>
                <span class="count" style="position:absolute;top:0.75rem;right:2.5rem">${L.plantCount(n)}</span>
                <span class="arrow">›</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  if (view.type === "countries") {
    const continent = getContinent(data, view.continentId);
    const countries = countriesForContinent(data, view.continentId);
    return `
      ${breadcrumb([
        { label: L.continents, action: "continents" },
        { label: continent ? tName(lang, continent) : view.continentId },
      ])}
      <header class="page-header">
        <p class="page-eyebrow">${L.countries}</p>
        <h2 class="page-title">${continent ? escapeHtml(tName(lang, continent)) : ""}</h2>
        <p class="page-desc">${continent ? escapeHtml(tDesc(lang, continent)) : ""}</p>
      </header>
      <div class="item-list">
        ${countries
          .map((c) => {
            const n = plantsForCountry(data, c.id).length;
            return `
              <button type="button" class="item-card" data-country="${c.id}">
                <img class="flag" src="${FLAG_URL(c.flagCode)}" alt="" loading="lazy" width="36" height="24" />
                <div class="meta">
                  <div class="name">${escapeHtml(tName(lang, c))}</div>
                  <div class="sub">${escapeHtml(lang === "de" ? c.nameEn : c.nameDe)}</div>
                </div>
                <span class="count">${L.plantCount(n)}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  if (view.type === "plants") {
    const country = getCountry(data, view.countryId);
    const continent = country
      ? getContinent(data, country.continentId)
      : undefined;
    const plants = plantsForCountry(data, view.countryId);
    return `
      ${breadcrumb([
        { label: L.continents, action: "continents" },
        {
          label: continent ? tName(lang, continent) : "",
          action: country ? `continent:${country.continentId}` : undefined,
        },
        { label: country ? tName(lang, country) : view.countryId },
      ])}
      <header class="page-header">
        <p class="page-eyebrow">${L.plants}</p>
        <h2 class="page-title" style="display:flex;align-items:center;gap:0.6rem">
          ${
            country
              ? `<img class="flag" src="${FLAG_URL(country.flagCode)}" alt="" width="40" height="28" style="border:1px solid rgba(0,0,0,.2)" />`
              : ""
          }
          ${country ? escapeHtml(tName(lang, country)) : ""}
        </h2>
      </header>
      ${
        plants.length === 0
          ? `<p class="empty-state">${L.noPlants}</p>`
          : `<div class="item-list">
              ${plants
                .map(
                  (p) => `
                <button type="button" class="item-card" data-plant="${p.id}">
                  <span class="icon-leaf">🌿</span>
                  <div class="meta">
                    <div class="name">${escapeHtml(tName(lang, p))}</div>
                    <div class="sub">${escapeHtml(p.scientificName)}</div>
                  </div>
                </button>
              `
                )
                .join("")}
            </div>`
      }
    `;
  }

  if (view.type === "plant") {
    const plant = getPlant(data, view.plantId);
    if (!plant) return `<p class="empty-state">Unknown</p>`;
    const countries = plant.countryIds
      .map((id) => getCountry(data, id))
      .filter((c): c is Country => !!c);
    const primary = countries[0];
    const continent = primary
      ? getContinent(data, primary.continentId)
      : undefined;
    const uses =
      lang === "de" ? plant.traditionalUsesDe : plant.traditionalUsesEn;

    return `
      ${breadcrumb([
        { label: L.continents, action: "continents" },
        primary && continent
          ? { label: tName(lang, continent), action: `continent:${continent.id}` }
          : { label: "—" },
        primary
          ? { label: tName(lang, primary), action: `country:${primary.id}` }
          : { label: "—" },
        { label: tName(lang, plant) },
      ])}
      <article class="plant-detail">
        <div class="plant-portrait">
          <img
            class="plant-pixel"
            src="${plantImageSrc(plant.id)}"
            alt="${escapeAttr(tName(lang, plant))}"
            width="180"
            height="180"
            loading="eager"
            onerror="this.closest('.plant-portrait')?.classList.add('missing')"
          />
        </div>
        <header class="page-header">
          <p class="page-eyebrow">${L.plants}</p>
          <h2 class="page-title">${escapeHtml(tName(lang, plant))}</h2>
          <p class="scientific">${escapeHtml(plant.scientificName)}</p>
          <p class="family">${escapeHtml(plant.family)}</p>
        </header>
        <div class="plant-flags">
          ${countries
            .map(
              (c) => `
            <span class="chip">
              <img src="${FLAG_URL(c.flagCode)}" alt="" width="22" height="15" />
              ${escapeHtml(tName(lang, c))}
            </span>
          `
            )
            .join("")}
        </div>
        <div class="fact-grid">
          ${fact(L.partsUsed, plant.partsUsed)}
          ${fact(L.habitat, plant.habitat)}
          ${fact(L.uses, uses)}
          ${fact(L.compounds, plant.activeCompounds)}
        </div>
      </article>
    `;
  }

  if (view.type === "search") {
    return `
      <header class="page-header">
        <p class="page-eyebrow">${L.results}</p>
        <h2 class="page-title">„${escapeHtml(view.query)}”</h2>
        <p class="page-desc">${L.plantCount(view.results.length)}</p>
      </header>
      ${
        view.results.length === 0
          ? `<p class="empty-state">${L.noResults}</p>`
          : `<div class="item-list">
              ${view.results
                .map(
                  (p: Plant) => `
                <button type="button" class="item-card" data-plant="${p.id}">
                  <span class="icon-leaf">🌿</span>
                  <div class="meta">
                    <div class="name">${escapeHtml(tName(lang, p))}</div>
                    <div class="sub">${escapeHtml(p.nameDe)} · ${escapeHtml(p.nameEn)} · <em>${escapeHtml(p.scientificName)}</em></div>
                  </div>
                </button>
              `
                )
                .join("")}
            </div>`
      }
    `;
  }

  return "";
}

