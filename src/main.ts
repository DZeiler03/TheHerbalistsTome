import "./styles/start.css";
import "./styles/book-a.css";
import "./styles/book-b.css";
import type { AppData, View } from "./types";
import { loadAppData, searchPlants } from "./lib/data";
import { labels, type Lang } from "./lib/i18n";
import { escapeAttr } from "./lib/dom";
import { renderLeftPage } from "./lib/pages-left";
import { renderRightPage } from "./lib/pages-right";

let data: AppData = { continents: [], countries: [], plants: [] };
let view: View = { type: "start" };
let lang: Lang = "en";
let searchQuery = "";
let isTurning = false;
let historyStack: View[] = [];

const app = document.querySelector<HTMLDivElement>("#app")!;

function navigate(next: View, pushHistory = true): void {
  if (isTurning) return;
  if (view.type === "start" && next.type !== "start") {
    view = next;
    render();
    return;
  }
  if (next.type === "start") {
    historyStack = [];
    view = next;
    render();
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

function render(): void {
  const L = labels(lang);

  if (view.type === "start") {
    app.innerHTML = `
      <div class="mobile-gate"><h1>${L.mobileTitle}</h1><p>${L.mobileBody}</p></div>
      <div class="start-page leather-bg desktop-only">
        <div class="start-content">
          <div class="start-ornament"></div>
          <h1 class="start-title">The Herbalists Tome</h1>
          <p class="start-subtitle">${L.subtitle}</p>
          <p class="start-author"><span>${L.authorBy}</span>Dominik Zeiler</p>
          <button type="button" class="btn-enter" id="btn-enter">${L.enter}</button>
          <p class="start-hint">${L.hint}</p>
        </div>
      </div>`;
    document.getElementById("btn-enter")?.addEventListener("click", () =>
      navigate({ type: "continents" })
    );
    return;
  }

  const canBack = historyStack.length > 0 || view.type !== "continents";

  app.innerHTML = `
    <div class="mobile-gate"><h1>${L.mobileTitle}</h1><p>${L.mobileBody}</p></div>
    <div class="book-view leather-bg desktop-only">
      <div class="book-toolbar">
        <button type="button" class="btn-icon" id="btn-back" ${canBack ? "" : "disabled"}>${L.back}</button>
        <button type="button" class="btn-icon" id="btn-home">${L.home}</button>
        <div class="search-wrap">
          <span class="search-icon">⌕</span>
          <input type="search" id="search-input" placeholder="${L.search}" value="${escapeAttr(searchQuery)}" autocomplete="off" />
        </div>
        <button type="button" class="lang-toggle" id="btn-lang" title="Language">${lang.toUpperCase()}</button>
      </div>
      <div class="book">
        <div class="book-cover">
          <span class="corner-stud tl"></span><span class="corner-stud tr"></span>
          <span class="corner-stud bl"></span><span class="corner-stud br"></span>
          <div class="book-inner">
            <div class="page page-left"><div class="page-content">${renderLeftPage(data, view, lang, L)}</div></div>
            <div class="page page-right"><div class="page-content">${renderRightPage(data, view, lang, L)}</div></div>
            <div class="page-flip" aria-hidden="true"></div>
          </div>
        </div>
      </div>
      <div class="book-footer">
        <span class="brand">The Herbalists Tome</span>
        <span>Dominik Zeiler · ${data.plants.length} specimens</span>
      </div>
    </div>`;

  bindEvents();
}

function bindEvents(): void {
  document.getElementById("btn-back")?.addEventListener("click", goBack);
  document.getElementById("btn-home")?.addEventListener("click", goHome);
  document.getElementById("btn-lang")?.addEventListener("click", () => {
    lang = lang === "en" ? "de" : "en";
    render();
  });

  const input = document.getElementById(
    "search-input"
  ) as HTMLInputElement | null;
  let debounce: number | undefined;
  input?.addEventListener("input", () => {
    searchQuery = input.value;
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      const q = searchQuery.trim();
      if (!q) {
        if (view.type === "search") navigate({ type: "continents" }, false);
        return;
      }
      navigate(
        { type: "search", query: q, results: searchPlants(data, q) },
        view.type !== "search"
      );
    }, 220);
  });
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchQuery = "";
      input.value = "";
      if (view.type === "search") navigate({ type: "continents" }, false);
    }
  });

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
    el.addEventListener("click", () =>
      navigate({ type: "plant", plantId: el.dataset.plant! })
    )
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
  app.innerHTML = `<div class="loading leather-bg">${labels(lang).loading}</div>`;
  try {
    data = await loadAppData();
    render();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="loading leather-bg" style="flex-direction:column;gap:1rem;color:#e8c96a">
      <p>Failed to load tome data.</p>
      <p style="font-size:0.85rem;opacity:0.7">${String(err)}</p>
    </div>`;
  }
}

boot();
