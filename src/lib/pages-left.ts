import type { AppData, Country, Plant, View } from "../types";
import type { Labels, Lang } from "./i18n";
import {
  bloomingByContinent,
  compareByDisplayName,
  countriesForContinent,
  currentBloomSeason,
  getContinent,
  getCountry,
  getPlant,
  getUseCategory,
  plantCountForContinent,
  plantsForCountry,
  plantsWithCategories,
  sortByDisplayName,
} from "./data";
import { escapeAttr, escapeHtml, FLAG_URL, tDesc, tName } from "./dom";
import { plantImageSrc } from "./plant-images";
import { kindLabel, plantText, plantUses } from "./plant-text";
import { getFavoriteIds, isFavorite } from "./favorites";

export interface LeftPageOpts {
  activeCategoryIds: string[];
}

function plantIcon(p: Plant): string {
  const k = p.kind ?? "herb";
  if (k === "tree") return "🌳";
  if (k === "shrub") return "🪴";
  if (k === "vine") return "🌿";
  return "🌿";
}

function fact(title: string, body: string, unknown: string): string {
  return `
    <div class="fact-block">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body || unknown)}</p>
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

function favBtn(id: string, L: Labels): string {
  const on = isFavorite(id);
  return `<button type="button" class="fav-btn${on ? " on" : ""}" data-fav="${id}" title="${escapeAttr(on ? L.removeFavorite : L.addFavorite)}">${on ? "★" : "☆"}</button>`;
}

function plantRow(p: Plant, lang: Lang, L: Labels, sub?: string): string {
  return `
    <div class="item-card plant-row" data-plant="${p.id}">
      <span class="icon-leaf">${plantIcon(p)}</span>
      <div class="meta">
        <div class="name">${escapeHtml(tName(lang, p))}</div>
        <div class="sub">${escapeHtml(sub ?? p.scientificName)}</div>
      </div>
      ${favBtn(p.id, L)}
    </div>
  `;
}

function categoryChips(
  data: AppData,
  lang: Lang,
  L: Labels,
  active: string[]
): string {
  if (!data.useCategories.length) return "";
  const chips = sortByDisplayName(data.useCategories, lang)
    .map((c) => {
      const name = lang === "de" ? c.nameDe : c.nameEn;
      const on = active.includes(c.id);
      return `<button type="button" class="chip chip-link category-chip${on ? " active" : ""}" data-category="${c.id}" aria-pressed="${on ? "true" : "false"}">${on ? "✓ " : ""}${escapeHtml(name)}</button>`;
    })
    .join("");
  const clear = active.length
    ? `<button type="button" class="chip chip-link category-clear active" data-category-clear="1">${escapeHtml(L.clearFilter)}</button>`
    : "";
  const status = active.length
    ? `<span class="filter-status">${escapeHtml(L.filterActive)} · ${active.length}</span>`
    : "";
  return `<div class="category-filter${active.length ? " has-active" : ""}"><div class="category-filter-head"><span class="category-filter-label">${escapeHtml(L.categoryFilter)}</span>${status}</div><div class="plant-flags">${chips}${clear}</div></div>`;
}

const CONTINENT_EMOJI: Record<string, string> = {
  europe: "🏰",
  asia: "🏯",
  "north-america": "🌲",
  "south-america": "🌿",
  africa: "🌍",
  oceania: "🌺",
};

export function renderLeftPage(
  data: AppData,
  view: View,
  lang: Lang,
  L: Labels,
  opts: LeftPageOpts = { activeCategoryIds: [] }
): string {
  const active = opts.activeCategoryIds;

  if (view.type === "continents") {
    const total = data.plants.length;
    return `
      <header class="page-header">
        <p class="page-eyebrow">${L.folio}</p>
        <h2 class="page-title">${L.continents}</h2>
        <p class="page-desc">${L.contIntro}</p>
        <div class="tome-counter" role="status">
          <span class="tome-counter-num">${total}</span>
          <span class="tome-counter-label">${escapeHtml(L.tomeCountLabel)}</span>
          <span class="tome-counter-meta">${L.countryCount(data.countries.length)} · 6 ${escapeHtml(L.continents)}</span>
        </div>
      </header>
      ${categoryChips(data, lang, L, active)}
      <div class="continent-grid">
        ${sortByDisplayName(data.continents, lang)
          .map((c) => {
            const n = plantCountForContinent(data, c.id);
            const emoji = CONTINENT_EMOJI[c.id] ?? "🌿";
            return `
              <button type="button" class="continent-card continent-${c.id}" data-continent="${c.id}">
                <span class="continent-emoji" aria-hidden="true">${emoji}</span>
                <div class="continent-card-body">
                  <div class="name">${escapeHtml(tName(lang, c))}</div>
                  <div class="desc">${escapeHtml(tDesc(lang, c))}</div>
                  <div class="continent-card-meta">
                    <span class="count badge-count">${L.plantCount(n)}</span>
                    <span class="explore-label">${escapeHtml(L.continentExplore)} ›</span>
                  </div>
                </div>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  if (view.type === "countries") {
    const continent = getContinent(data, view.continentId);
    const countries = countriesForContinent(data, view.continentId, lang);
    const contName = continent ? tName(lang, continent) : view.continentId;
    return `
      ${breadcrumb([
        { label: L.continents, action: "continents" },
        { label: contName },
      ])}
      <header class="page-header">
        <p class="page-eyebrow">${L.countries}</p>
        <h2 class="page-title">${continent ? escapeHtml(tName(lang, continent)) : ""}</h2>
        <p class="page-desc">${continent ? escapeHtml(tDesc(lang, continent)) : ""}</p>
      </header>
      ${categoryChips(data, lang, L, active)}
      <div class="item-list">
        ${countries
          .map((c) => {
            let plants = plantsForCountry(data, c.id, lang);
            plants = plantsWithCategories(plants, active);
            return `
              <button type="button" class="item-card" data-country="${c.id}">
                <img class="flag" src="${FLAG_URL(c.flagCode)}" alt="" loading="lazy" width="36" height="24" />
                <div class="meta">
                  <div class="name">${escapeHtml(tName(lang, c))}</div>
                  <div class="sub">${escapeHtml(lang === "de" ? c.nameEn : c.nameDe)}</div>
                </div>
                <span class="count">${L.plantCount(plants.length)}</span>
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
    let plants = plantsForCountry(data, view.countryId, lang);
    plants = plantsWithCategories(plants, active);
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
      ${categoryChips(data, lang, L, active)}
      ${
        plants.length === 0
          ? `<p class="empty-state">${active.length ? L.noCategoryMatch : L.noPlants}</p>`
          : `<div class="item-list">${plants.map((p) => plantRow(p, lang, L)).join("")}</div>`
      }
    `;
  }

  if (view.type === "plant") {
    const plant = getPlant(data, view.plantId);
    if (!plant) return `<p class="empty-state">${L.unknown}</p>`;
    const countries = sortByDisplayName(
      plant.countryIds
        .map((id) => getCountry(data, id))
        .filter((c): c is Country => !!c),
      lang
    );
    // Primary for breadcrumb: first associated country in data order, else first A–Z
    const primary =
      plant.countryIds
        .map((id) => getCountry(data, id))
        .find((c): c is Country => !!c) ?? countries[0];
    const continent = primary
      ? getContinent(data, primary.continentId)
      : undefined;
    const kind = kindLabel(plant, L);
    const cats = (plant.useCategoryIds ?? [])
      .map((id) => getUseCategory(data, id))
      .filter((c): c is NonNullable<typeof c> => !!c);

    // Prev/next within list context (country, search, favorites, season…)
    let navIds = view.navIds?.filter((id) => data.plants.some((p) => p.id === id)) ?? [];
    if (navIds.length < 2 && primary) {
      navIds = plantsWithCategories(
        plantsForCountry(data, primary.id, lang),
        active
      ).map((p) => p.id);
    }
    if (navIds.length < 2) {
      navIds = sortByDisplayName(data.plants, lang).map((p) => p.id);
    }
    const idx = Math.max(0, navIds.indexOf(plant.id));
    const prevId = navIds[(idx - 1 + navIds.length) % navIds.length];
    const nextId = navIds[(idx + 1) % navIds.length];
    const canCycle = navIds.length > 1;

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
        <div class="plant-portrait-nav">
          <button type="button" class="plant-nav-btn" data-plant-nav="prev" data-target="${prevId}" ${canCycle ? "" : "disabled"} title="${escapeAttr(L.prevPlant)}" aria-label="${escapeAttr(L.prevPlant)}">‹</button>
          <div class="plant-portrait">
            <img
              class="plant-pixel"
              src="${plantImageSrc(plant.id)}"
              alt="${escapeAttr(tName(lang, plant))}"
              width="180"
              height="180"
              loading="eager"
              onerror="this.style.display='none'; const p=this.closest('.plant-portrait'); if(p){ p.classList.add('fallback'); p.querySelector('.plant-fallback')?.classList.add('show'); }"
            />
            <div class="plant-fallback" aria-hidden="true">${plantIcon(plant)}</div>
          </div>
          <button type="button" class="plant-nav-btn" data-plant-nav="next" data-target="${nextId}" ${canCycle ? "" : "disabled"} title="${escapeAttr(L.nextPlant)}" aria-label="${escapeAttr(L.nextPlant)}">›</button>
        </div>
        ${canCycle ? `<p class="plant-nav-pos">${escapeHtml(L.plantOf(idx + 1, navIds.length))}</p>` : ""}
        <header class="page-header plant-detail-header">
          <div class="title-row">
            <div>
              <p class="page-eyebrow">${plantIcon(plant)} ${L.plants} · ${kind}</p>
              <h2 class="page-title">${escapeHtml(tName(lang, plant))}</h2>
            </div>
            ${favBtn(plant.id, L)}
          </div>
          <p class="scientific">${escapeHtml(plant.scientificName)}</p>
          <p class="family">${escapeHtml(plant.family)}</p>
          <div class="detail-actions">
            <button type="button" class="btn-icon" data-print="1">${escapeHtml(L.printPage)}</button>
          </div>
        </header>
        ${
          cats.length
            ? `<div class="plant-flags">${cats
                .map(
                  (c) =>
                    `<span class="chip">${escapeHtml(lang === "de" ? c.nameDe : c.nameEn)}</span>`
                )
                .join("")}</div>`
            : ""
        }
        <div class="plant-flags">
          <p class="plant-flags-label">${escapeHtml(L.regionsHint)}</p>
          ${countries
            .map(
              (c) => `
            <button type="button" class="chip chip-link" data-country="${c.id}" title="${escapeAttr(L.openCountry)}">
              <img src="${FLAG_URL(c.flagCode)}" alt="" width="22" height="15" />
              <span>${escapeHtml(tName(lang, c))}</span>
              <span class="chip-go" aria-hidden="true">›</span>
            </button>
          `
            )
            .join("")}
        </div>
        <div class="fact-grid print-facts">
          ${fact(L.partsUsed, plantText(plant, "partsUsed", lang, L.unknown), L.unknown)}
          ${fact(L.habitat, plantText(plant, "habitat", lang, L.unknown), L.unknown)}
          ${fact(L.uses, plantUses(plant, lang), L.unknown)}
          ${fact(L.compounds, plantText(plant, "activeCompounds", lang, L.unknown), L.unknown)}
        </div>
      </article>
    `;
  }

  if (view.type === "search") {
    let results = view.results;
    results = plantsWithCategories(results, active);
    return `
      <header class="page-header">
        <p class="page-eyebrow">${L.results}</p>
        <h2 class="page-title">„${escapeHtml(view.query)}”</h2>
        <p class="page-desc">${L.plantCount(results.length)}</p>
      </header>
      ${categoryChips(data, lang, L, active)}
      ${
        results.length === 0
          ? `<p class="empty-state">${active.length ? L.noCategoryMatch : L.noResults}</p>`
          : `<div class="item-list">${results
              .map((p) =>
                plantRow(
                  p,
                  lang,
                  L,
                  `${p.nameDe} · ${p.nameEn} · ${p.scientificName}`
                )
              )
              .join("")}</div>`
      }
    `;
  }

  if (view.type === "favorites") {
    const favIds = new Set(getFavoriteIds());
    const plants = sortByDisplayName(
      data.plants.filter((p) => favIds.has(p.id)),
      lang
    );
    return `
      <header class="page-header">
        <p class="page-eyebrow">${L.favorites}</p>
        <h2 class="page-title">${L.favorites}</h2>
        <p class="page-desc">${L.favoritesIntro}</p>
      </header>
      ${
        plants.length === 0
          ? `<p class="empty-state">${L.noFavorites}</p>`
          : `<div class="item-list">${plants.map((p) => plantRow(p, lang, L)).join("")}</div>`
      }
    `;
  }

  if (view.type === "season") {
    const now = currentBloomSeason();
    const season =
      view.season && view.season !== "yearRound" ? view.season : now;
    const seasonLabel =
      season === "spring"
        ? L.seasonSpring
        : season === "summer"
          ? L.seasonSummer
          : season === "autumn"
            ? L.seasonAutumn
            : L.seasonWinter;
    const groups = bloomingByContinent(data, season)
      .map((g) => ({
        ...g,
        plants: sortByDisplayName(g.plants, lang),
      }))
      .sort((a, b) => compareByDisplayName(lang, a.continent, b.continent));
    const seasonBtns: { id: "spring" | "summer" | "autumn" | "winter"; label: string }[] =
      [
        { id: "spring", label: L.seasonSpring },
        { id: "summer", label: L.seasonSummer },
        { id: "autumn", label: L.seasonAutumn },
        { id: "winter", label: L.seasonWinter },
      ];
    return `
      <header class="page-header">
        <p class="page-eyebrow">${L.seasonal}</p>
        <h2 class="page-title">${escapeHtml(seasonLabel)}</h2>
        <p class="page-desc">${L.seasonalIntro}</p>
        <div class="season-picker" role="group" aria-label="${escapeAttr(L.seasonPick)}">
          ${seasonBtns
            .map((s) => {
              const on = s.id === season;
              const isNow = s.id === now;
              return `<button type="button" class="season-btn${on ? " active" : ""}" data-season="${s.id}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(s.label)}${isNow ? ` <span class="season-now-tag">${escapeHtml(L.seasonNow)}</span>` : ""}</button>`;
            })
            .join("")}
        </div>
      </header>
      ${
        groups.length === 0
          ? `<p class="empty-state">${L.noSeasonal}</p>`
          : groups
              .map(
                (g) => `
          <section class="season-group">
            <h3 class="season-continent">${escapeHtml(tName(lang, g.continent))} <span class="count badge-count">${L.plantCount(g.plants.length)}</span></h3>
            <div class="item-list">${g.plants.map((p) => plantRow(p, lang, L)).join("")}</div>
          </section>`
              )
              .join("")
      }
    `;
  }

  return "";
}
