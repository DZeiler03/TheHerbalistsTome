import "./styles/start.css";
import "./styles/book-a.css";
import "./styles/book-b.css";
import "./styles/print.css";
import type { AppData, View } from "./types";
import { loadAppData, searchPlants } from "./lib/data";
import { ensurePlantImages } from "./lib/plant-images";
import { labels, type Lang } from "./lib/i18n";
import { escapeAttr } from "./lib/dom";
import { renderLeftPage } from "./lib/pages-left";
import { renderRightPage } from "./lib/pages-right";
import { toggleFavorite } from "./lib/favorites";

let data: AppData = {
  continents: [],
  countries: [],
  plants: [],
  useCategories: [],
};
let view: View = { type: "start" };
let lang: Lang = "de";
/** Last committed search (results page). */
let searchQuery = "";
/** Draft text while the expandable search field is open. */
let searchDraft = "";
/** Magnifying glass expanded into a horizontal input. */
let searchOpen = false;
let isTurning = false;
let historyStack: View[] = [];
let activeCategoryIds: string[] = [];

const app = document.querySelector<HTMLDivElement>("#app")!;

/** Keyboard ←/→ on plant detail (single global listener). */
function onPlantKeyNav(ev: KeyboardEvent): void {
  if (view.type !== "plant") return;
  if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
  const tag = (ev.target as HTMLElement | null)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  const sel =
    ev.key === "ArrowLeft" ? '[data-plant-nav="prev"]' : '[data-plant-nav="next"]';
  const btn = app.querySelector<HTMLElement>(sel);
  if (!btn || btn.hasAttribute("disabled")) return;
  ev.preventDefault();
  const target = btn.dataset.target;
  if (!target) return;
  const ids =
    view.type === "plant" && view.navIds && view.navIds.length > 1
      ? view.navIds
      : undefined;
  navigate({ type: "plant", plantId: target, navIds: ids }, false);
}
window.addEventListener("keydown", onPlantKeyNav);

function navigate(next: View, pushHistory = true): void {
  if (isTurning) return;
  if (view.type === "start" && next.type !== "start") {
    // Opening flourish
    isTurning = true;
    view = next;
    render();
    const book = document.querySelector(".book");
    book?.classList.add("book-opening");
    window.setTimeout(() => {
      book?.classList.remove("book-opening");
      isTurning = false;
    }, 600);
    return;
  }
  if (next.type === "start") {
    closeBookAnimated();
    return;
  }
  if (pushHistory && view.type !== "start") historyStack.push(view);

  isTurning = true;
  document.querySelector(".book")?.classList.add("turning");
  document.querySelector(".page-flip")?.classList.add("flipping");
  window.setTimeout(() => {
    view = next;
    isTurning = false;
    render();
  }, 320);
}

function goBack(): void {
  const prev = historyStack.pop();
  navigate(prev ?? { type: "continents" }, false);
}

function goHome(): void {
  historyStack = [];
  navigate({ type: "continents" }, false);
}

function closeBookAnimated(): void {
  if (isTurning) return;
  if (view.type === "start") return;
  isTurning = true;
  const book = document.querySelector(".book");
  book?.classList.add("book-closing");
  window.setTimeout(() => {
    historyStack = [];
    searchQuery = "";
    searchDraft = "";
    searchOpen = false;
    activeCategoryIds = [];
    view = { type: "start" };
    isTurning = false;
    render();
  }, 650);
}

function commitSearch(): void {
  const q = searchDraft.trim();
  searchQuery = q;
  if (!q) {
    if (view.type === "search") {
      navigate({ type: "continents" }, false);
    }
    return;
  }
  // Stay on the search results view when refining; only push history once.
  navigate(
    { type: "search", query: q, results: searchPlants(data, q) },
    view.type !== "search"
  );
}

function openSearch(): void {
  if (searchOpen) return;
  searchOpen = true;
  if (!searchDraft && searchQuery) searchDraft = searchQuery;
  render();
  // Focus after DOM paint so the expanded field receives keystrokes.
  window.requestAnimationFrame(() => {
    const input = document.getElementById(
      "search-input"
    ) as HTMLInputElement | null;
    input?.focus();
    const len = input?.value.length ?? 0;
    input?.setSelectionRange(len, len);
  });
}

function closeSearch(clearDraft = false): void {
  searchOpen = false;
  if (clearDraft) {
    searchDraft = "";
    searchQuery = "";
  }
  render();
}

function render(): void {
  const L = labels(lang);

  if (view.type === "start") {
    app.innerHTML = `
      <div class="mobile-gate"><h1>${L.mobileTitle}</h1><p>${L.mobileBody}</p></div>
      <div class="start-page leather-bg desktop-app">
        <div class="start-atmosphere" aria-hidden="true">
          <span class="float-leaf l1">🌿</span>
          <span class="float-leaf l2">🍃</span>
          <span class="float-leaf l3">✦</span>
          <span class="gold-glow"></span>
        </div>
        <div class="start-content">
          <div class="start-frame-corner tl"></div>
          <div class="start-frame-corner tr"></div>
          <div class="start-frame-corner bl"></div>
          <div class="start-frame-corner br"></div>
          <div class="start-seal" aria-hidden="true">❧</div>
          <div class="start-ornament"></div>
          <h1 class="start-title">The Herbalists Tome</h1>
          <p class="start-subtitle">${L.subtitle}</p>
          <div class="start-divider" aria-hidden="true"><span></span><span class="gem"></span><span></span></div>
          <p class="start-author"><span>${L.authorBy}</span>Dominik Zeiler</p>
          <button type="button" class="btn-enter" id="btn-enter">${L.enter}</button>
        </div>
      </div>`;
    document.getElementById("btn-enter")?.addEventListener("click", () =>
      navigate({ type: "continents" })
    );
    return;
  }

  const canBack = historyStack.length > 0 || view.type !== "continents";

  app.innerHTML = `
    <div class="mobile-gate extreme"><h1>${L.mobileTitle}</h1><p>${L.mobileBody}</p></div>
    <div class="book-view leather-bg desktop-app">
      <div class="book-toolbar">
        <button type="button" class="btn-icon" id="btn-back" ${canBack ? "" : "disabled"}>${L.back}</button>
        <button type="button" class="btn-icon" id="btn-home">${L.home}</button>
        <button type="button" class="btn-icon" id="btn-favorites" title="${L.favorites}">★ ${L.favorites}</button>
        <button type="button" class="btn-icon" id="btn-season" title="${L.seasonal}">❀</button>
        <button type="button" class="btn-icon btn-close-book" id="btn-close" title="${L.closeBook}">${L.closeBook}</button>
        <div class="search-wrap${searchOpen ? " is-open" : ""}" id="search-wrap">
          <button
            type="button"
            class="search-toggle"
            id="btn-search-toggle"
            title="${escapeAttr(L.search)}"
            aria-label="${escapeAttr(L.search)}"
            aria-expanded="${searchOpen ? "true" : "false"}"
            aria-controls="search-input"
          >⌕</button>
          <input
            type="search"
            id="search-input"
            class="search-input"
            placeholder="${escapeAttr(L.search)}"
            value="${escapeAttr(searchDraft)}"
            autocomplete="off"
            enterkeyhint="search"
            aria-label="${escapeAttr(L.search)}"
            ${searchOpen ? "" : "tabindex=\"-1\" aria-hidden=\"true\""}
          />
        </div>
        <button type="button" class="lang-toggle" id="btn-lang">${lang.toUpperCase()}</button>
      </div>
      <div class="book">
        <div class="book-cover">
          <span class="corner-stud tl"></span><span class="corner-stud tr"></span>
          <span class="corner-stud bl"></span><span class="corner-stud br"></span>
          <span class="corner-wear tl" aria-hidden="true"></span>
          <span class="corner-wear tr" aria-hidden="true"></span>
          <span class="corner-wear bl" aria-hidden="true"></span>
          <span class="corner-wear br" aria-hidden="true"></span>
          <div class="book-inner">
            <div class="page page-left"><div class="page-content" id="page-left-root">${renderLeftPage(data, view, lang, L, { activeCategoryIds })}</div></div>
            <div class="page page-right"><div class="page-content">${renderRightPage(data, view, lang, L)}</div></div>
            <div class="page-flip" aria-hidden="true"></div>
          </div>
        </div>
      </div>
      <div class="book-footer">
        <span class="brand">The Herbalists Tome</span>
        <span class="footer-count" title="${escapeAttr(L.tomeCountLabel)}"><strong>${data.plants.length}</strong> ${lang === "de" ? "Exemplare" : "specimens"} · ${data.countries.length} ${lang === "de" ? "Länder" : "lands"}</span>
      </div>
    </div>`;

  bindEvents();
}

function bindEvents(): void {
  document.getElementById("btn-back")?.addEventListener("click", goBack);
  document.getElementById("btn-home")?.addEventListener("click", goHome);
  document.getElementById("btn-close")?.addEventListener("click", () =>
    closeBookAnimated()
  );
  document.getElementById("btn-favorites")?.addEventListener("click", () =>
    navigate({ type: "favorites" })
  );
  document.getElementById("btn-season")?.addEventListener("click", () =>
    navigate({ type: "season", season: undefined })
  );
  document.getElementById("btn-lang")?.addEventListener("click", () => {
    lang = lang === "en" ? "de" : "en";
    render();
  });

  const searchWrap = document.getElementById("search-wrap");
  const searchToggle = document.getElementById("btn-search-toggle");
  const input = document.getElementById(
    "search-input"
  ) as HTMLInputElement | null;

  searchToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (searchOpen) {
      // Already expanded: keep focus in the field (do not navigate).
      input?.focus();
      return;
    }
    openSearch();
  });

  // Typing only updates the draft — never navigates mid-keystroke.
  input?.addEventListener("input", () => {
    searchDraft = input.value;
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitSearch();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeSearch(false);
    }
  });

  // Keep focus inside the expanded field while open (don't collapse on blur
  // immediately — user may click a result; only Escape / empty toggle closes).
  input?.addEventListener("blur", () => {
    // If still open and empty after a short delay, collapse the field.
    window.setTimeout(() => {
      if (!searchOpen) return;
      const active = document.activeElement;
      if (active === input || searchWrap?.contains(active)) return;
      if (!searchDraft.trim() && view.type !== "search") {
        searchOpen = false;
        render();
      }
    }, 180);
  });

  if (searchOpen && input) {
    // Restore caret after any re-render while the panel is open.
    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
    });
  }

  app.querySelectorAll<HTMLElement>("[data-continent]").forEach((el) =>
    el.addEventListener("click", () =>
      navigate({ type: "countries", continentId: el.dataset.continent! })
    )
  );
  app.querySelectorAll<HTMLElement>("[data-country]").forEach((el) =>
    el.addEventListener("click", () =>
      navigate({ type: "plants", countryId: el.dataset.country! })
    )
  );
  app.querySelectorAll<HTMLElement>("[data-plant]").forEach((el) =>
    el.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("[data-fav]")) return;
      // Sibling plants currently listed → prev/next context
      const navIds = Array.from(
        app.querySelectorAll<HTMLElement>("#page-left-root [data-plant]")
      )
        .map((node) => node.dataset.plant)
        .filter((id): id is string => !!id);
      navigate({
        type: "plant",
        plantId: el.dataset.plant!,
        navIds: navIds.length > 1 ? navIds : undefined,
      });
    })
  );
  const goPlantNav = (target: string | undefined): void => {
    if (!target) return;
    const ids =
      view.type === "plant" && view.navIds && view.navIds.length > 1
        ? view.navIds
        : undefined;
    navigate({ type: "plant", plantId: target, navIds: ids }, false);
  };
  app.querySelectorAll<HTMLElement>("[data-plant-nav]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (el.hasAttribute("disabled")) return;
      goPlantNav(el.dataset.target);
    })
  );
  app.querySelectorAll<HTMLElement>("[data-season]").forEach((el) =>
    el.addEventListener("click", () => {
      const season = el.dataset.season as
        | "spring"
        | "summer"
        | "autumn"
        | "winter"
        | undefined;
      if (!season) return;
      navigate({ type: "season", season }, view.type !== "season");
    })
  );
  app.querySelectorAll<HTMLElement>("[data-fav]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.fav!;
      toggleFavorite(id);
      render();
    })
  );
  app.querySelectorAll<HTMLElement>("[data-category]").forEach((el) =>
    el.addEventListener("click", () => {
      const id = el.dataset.category!;
      if (activeCategoryIds.includes(id)) {
        activeCategoryIds = activeCategoryIds.filter((x) => x !== id);
      } else {
        activeCategoryIds = [...activeCategoryIds, id];
      }
      render();
    })
  );
  app.querySelectorAll<HTMLElement>("[data-category-clear]").forEach((el) =>
    el.addEventListener("click", () => {
      activeCategoryIds = [];
      render();
    })
  );
  app.querySelectorAll<HTMLElement>("[data-print]").forEach((el) =>
    el.addEventListener("click", () => {
      document.body.classList.add("printing-plant");
      window.print();
      window.setTimeout(() => document.body.classList.remove("printing-plant"), 500);
    })
  );
  app.querySelectorAll<HTMLElement>("[data-nav]").forEach((el) =>
    el.addEventListener("click", () => {
      const nav = el.dataset.nav!;
      if (nav === "continents") {
        historyStack = [];
        navigate({ type: "continents" }, false);
      } else if (nav.startsWith("continent:")) {
        navigate({ type: "countries", continentId: nav.slice(10) });
      } else if (nav.startsWith("country:")) {
        navigate({ type: "plants", countryId: nav.slice(8) });
      }
    })
  );
}

async function boot(): Promise<void> {
  const L = labels(lang);
  app.innerHTML = `<div class="loading leather-bg">${L.loading}</div>`;
  try {
    data = await loadAppData();
    void ensurePlantImages();
    render();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="loading leather-bg" style="flex-direction:column;gap:1rem;color:#e8c96a">
      <p>${L.failedLoad}</p>
      <p style="font-size:0.85rem;opacity:0.7">${String(err)}</p>
      <button type="button" class="btn-enter" id="btn-retry" style="margin-top:1rem">${L.retry}</button>
    </div>`;
    document.getElementById("btn-retry")?.addEventListener("click", () => boot());
  }
}

boot();
