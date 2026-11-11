"use strict";

/* ---------- Verbinding met de SlimBord-server (Apps Script) ---------- */
const API_URL = window.SLIMBORD_API || "";
const codeStore = {
  get() { try { return localStorage.getItem("slimbord-code") || ""; } catch (e) { return ""; } },
  set(v) { try { if (v) localStorage.setItem("slimbord-code", v); else localStorage.removeItem("slimbord-code"); } catch (e) { /* geen opslag */ } }
};

// Stuurt een vraag naar Apps Script (doPost). Platte tekst als body, zodat de browser geen extra CORS-controle doet.
async function run(actie, extra) {
  let res;
  try {
    res = await fetch(API_URL, { method: "POST", body: JSON.stringify(Object.assign({ actie, code: codeStore.get() }, extra || {})) });
  } catch (e) {
    throw new Error("Geen verbinding met de SlimBord-server. Heb je internet, en staat de toegang van de implementatie op 'Iedereen'?");
  }
  if (!res.ok) throw new Error(`De SlimBord-server gaf een fout (${res.status}).`);
  let j;
  try { j = await res.json(); } catch (e) { throw new Error("Onverwacht antwoord van de SlimBord-server. Staat de toegang van de implementatie op 'Iedereen'?"); }
  if (!j.ok) {
    const err = new Error(j.error === "CODE_ONJUIST" ? "Deze code klopt niet." : j.error);
    err.wrongCode = j.error === "CODE_ONJUIST";
    throw err;
  }
  return j.data;
}

/* ---------- Hulpjes ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const euroFmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const euro = c => euroFmt.format((c || 0) / 100);
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const local = {
  get(key, fallback) { try { const v = localStorage.getItem("slimbord-" + key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(key, value) { try { localStorage.setItem("slimbord-" + key, JSON.stringify(value)); } catch (e) { /* geen opslag */ } }
};

const ICONS = {
  moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5h-5"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11.5h13V9"/><path d="M10 20.5v-6h4v6"/>',
  bag: '<path d="M5.5 8h13l-1 12.5h-11z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  x: '<path d="M7 7l10 10M17 7 7 17"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"/>',
  external: '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/><path d="M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18.3 14.6A6.5 6.5 0 0 1 21.5 20"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  tag: '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>'
};
const icon = (name, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const LOGO = '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg></span>';
const dot = id => `<span class="dot" data-c="${esc(id)}"></span>`;
const dots = chains => `<span class="dots" aria-hidden="true">${chains.map(c => dot(c.id)).join("")}</span>`;
const TONES = { vis: 3, vega: 2, kip: 4, gehakt: 1, stamppot: 4, pasta: 1, rijst: 2, oven: 1, ei: 4 };
const tone = tags => TONES[(tags || []).find(t => TONES[t])] || 1;
const QUICK_HOME = ["olie", "ui", "knoflook", "rijst", "pasta", "aardappelen", "eieren", "melk", "raspkaas", "tomatenblik", "mie", "wraps"];
const FOCUS = [["price", "Voordeligst"], ["quick", "Snelst"], ["fewest-stores", "Minste winkels"]];

const dayFmt = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
function untilLabel(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return "t/m " + dayFmt.format(new Date(y, m - 1, d)).replace(/\./g, "");
}
function whenLabel(iso) {
  if (!iso) return "nog niet";
  const d = new Date(iso), now = new Date();
  const time = d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const days = Math.round((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
  if (days === 0) return `vandaag ${time}`;
  if (days === 1) return `gisteren ${time}`;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

/* ---------- Toestand ---------- */
const S = {
  booting: true, bootError: null, loadingMessage: null, refreshing: false, needCode: false, codeError: null,
  servings: 2, focus: "price", chains: new Set(), home: ["olie"],
  ingredients: [], ingById: {}, supermarkets: [], status: null,
  suggestions: null, suggestionsKey: null, sugLoading: false, sugError: null, sugSeq: 0,
  quotes: new Map(), quoteErrors: new Map(), pending: new Set(), planChoice: {}, inApp: false
};

const opts = () => ({ servings: S.servings, chains: [...S.chains], home: [...S.home] });

// Instellingen: direct lokaal, en (iets later) op de server zodat telefoon en pc gelijk lopen.
let saveTimer = null;
function saveSettings() {
  const s = { ...opts(), focus: S.focus };
  local.set("settings", s);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => run("instellingen", { instellingen: s }).catch(() => {}), 800);
}

function applySettings(s) {
  if (!s) return false;
  S.servings = Math.min(12, Math.max(1, Number(s.servings) || 2));
  S.focus = FOCUS.some(f => f[0] === s.focus) ? s.focus : "price";
  S.chains = new Set(s.chains || []);
  S.home = (s.home || []).filter(id => S.ingById[id]);
  return true;
}

function invalidate() {
  S.quotes.clear();
  S.quoteErrors.clear();
  S.suggestionsKey = null;
}

// Klopt de code ineens niet meer (bijv. vervangen)? Dan terug naar het code-scherm.
function askCodeAgain(message) {
  codeStore.set("");
  S.needCode = true;
  S.codeError = message || null;
  S.booting = true;
  render();
}

/* ---------- Routes ---------- */
function route() {
  const [page, arg] = location.hash.replace(/^#\/?/, "").split("/");
  if (page === "recept" && arg) return { page: "recipe", id: decodeURIComponent(arg) };
  if (page === "inhuis") return { page: "home" };
  if (page === "winkels") return { page: "stores" };
  return { page: "discover" };
}

/* ---------- Bovenbalk en onderbalk ---------- */
const isDark = () => document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);

function syncThemeColor() {
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = isDark() ? "#121110" : "#f5f3ee";
}

function renderTopbar(r) {
  const dark = isDark();
  const refreshing = S.refreshing || (S.status && S.status.refreshing);
  const q = r.page === "recipe" ? S.quotes.get(quoteKey(r.id)) : null;
  const left = r.page === "recipe" && !S.needCode
    ? `<button class="icon-btn" data-action="back" aria-label="Terug" title="Terug">${icon("back")}</button><span class="topbar-title">${esc(q ? q.recipe.title : "")}</span>`
    : `<a class="brand" href="#/">${LOGO}<span>SlimBord</span></a>`;
  const refreshBtn = S.needCode || S.booting ? "" : `<button class="icon-btn ${refreshing ? "spin" : ""}" data-action="refresh" aria-label="Aanbiedingen verversen" title="Aanbiedingen verversen">${icon("refresh")}</button>`;
  $("#topbar").innerHTML = `${left}
    <div class="actions">
      ${refreshBtn}
      <button class="icon-btn" data-action="theme" aria-label="${dark ? "Lichte modus" : "Donkere modus"}" title="${dark ? "Lichte modus" : "Donkere modus"}">${icon(dark ? "sun" : "moon")}</button>
    </div>`;
}

function renderTabbar(r) {
  if (S.needCode || S.booting || S.bootError) { $("#tabbar").innerHTML = ""; $("#tabbar").hidden = true; return; }
  $("#tabbar").hidden = false;
  const tab = (href, page, ico, label, count) => `<a class="tab" href="${href}" ${r.page === page || (page === "discover" && r.page === "recipe") ? 'aria-current="page"' : ""}>${icon(ico)}<span>${label}</span>${count ? `<b class="count">${count}</b>` : ""}</a>`;
  $("#tabbar").innerHTML = `<div class="inner">
    ${tab("#/", "discover", "compass", "Ontdek")}
    ${tab("#/inhuis", "home", "home", "In huis", S.home.length)}
    ${tab("#/winkels", "stores", "bag", "Winkels")}
  </div>`;
}

const sourceNote = () => `<p class="source">Aanbiedingen via <a href="https://www.prijsprofeet.nl" target="_blank" rel="noopener">PrijsProfeet</a> · prijzen zijn indicatief, check ze in de winkel. Een aanbieding zegt niets over voorraad.</p>`;

function servingsStepper() {
  return `<div class="stepper" role="group" aria-label="Aantal personen">
    <button data-action="servings" data-step="-1" aria-label="Minder personen" ${S.servings <= 1 ? "disabled" : ""}>${icon("minus")}</button>
    <output aria-live="polite">${icon("users")}${plural(S.servings, "persoon", "personen")}</output>
    <button data-action="servings" data-step="1" aria-label="Meer personen" ${S.servings >= 12 ? "disabled" : ""}>${icon("plus")}</button>
  </div>`;
}

/* ---------- Code-scherm ---------- */
function viewCode() {
  return `
    <section class="hero">
      <p class="eyebrow">Welkom bij SlimBord</p>
      <h1>Voer je code in</h1>
      <p class="lede">De code staat in het logboek van Apps Script, nadat je de functie <b>codeInstellen</b> hebt uitgevoerd. Per apparaat hoef je hem maar één keer in te voeren.</p>
    </section>
    <form class="combo" id="codeForm" autocomplete="off">
      <input id="codeInput" class="code" type="text" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="Je code" aria-label="SlimBord-code">
      <button class="icon-btn accent" type="submit" aria-label="Doorgaan" title="Doorgaan">${icon("check")}</button>
    </form>
    ${S.codeError ? `<p class="form-error">${esc(S.codeError)}</p>` : ""}`;
}

/* ---------- Ontdek ---------- */
function viewDiscover() {
  const sug = S.suggestions;
  const usable = S.supermarkets.filter(s => S.chains.has(s.id)).reduce((n, s) => n + s.usableOffers, 0);
  let headline = "Even rekenen…";
  if (sug) headline = sug.items.length ? `<em>${sug.items.length}</em> ${sug.items.length === 1 ? "maaltijd" : "maaltijden"} uit de aanbiedingen` : "Nog geen complete maaltijd";
  const homeNames = S.home.map(id => (S.ingById[id] && S.ingById[id].name) || id);

  let list;
  if (!S.chains.size) list = `<div class="notice warn"><h3>Geen winkels gekozen</h3><p>Zet minstens één winkel aan, dan zoekt SlimBord daar naar aanbiedingen.</p><a class="chip-btn" href="#/winkels">${icon("bag")}Winkels kiezen</a></div>`;
  else if (S.sugError) list = `<div class="notice warn"><h3>Dat lukte niet</h3><p>${esc(S.sugError)}</p><button class="chip-btn" data-action="retry">${icon("refresh")}Opnieuw</button></div>`;
  else if (!sug) list = `<div class="cards"><div class="skeleton tall"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>`;
  else if (!sug.items.length) list = `<div class="notice"><h3>Deze week past er nog niets helemaal</h3><p>Niet elk ingrediënt van een recept is nu in de aanbieding bij jouw winkels. Zet ingrediënten die je al hebt op <a href="#/inhuis">In huis</a>, of kies <a href="#/winkels">meer winkels</a>.</p></div>`;
  else list = `<div class="cards ${S.sugLoading ? "busy" : ""}">${sug.items.map((s, i) => suggestionCard(s, i)).join("")}</div>`;

  const almost = sug && sug.almost && sug.almost.length && S.chains.size ? `
    <h2 class="section-title">Bijna mogelijk <small>mist 1 of 2 ingrediënten</small></h2>
    <div class="almost">${sug.almost.map(a => `
      <div class="almost-card">
        <div class="tile" aria-hidden="true">${esc(a.emoji)}</div>
        <div><h4>${esc(a.title)}</h4><p>Niet in de aanbieding: <b>${esc(a.missing.map(m => m.name).join(", "))}</b></p></div>
        <button class="mini-btn" data-action="add-home" data-ids="${esc(a.missing.map(m => m.id).join(","))}" title="Zet op In huis">Heb ik</button>
      </div>`).join("")}</div>` : "";

  return `
    <section class="hero">
      <p class="eyebrow">Deze week</p>
      <h1>${headline}</h1>
      <p class="lede">${usable ? `${usable} passende acties` : "Aanbiedingen"} · ${plural(S.chains.size, "winkel", "winkels")} · bijgewerkt ${esc(whenLabel(S.status && S.status.fetchedAt))}</p>
    </section>
    <div class="toolbar">
      ${servingsStepper()}
      <div class="segmented" role="group" aria-label="Sorteren">${FOCUS.map(([v, l]) => `<button data-action="focus" data-value="${v}" aria-pressed="${S.focus === v}">${l}</button>`).join("")}</div>
    </div>
    <a class="home-strip" href="#/inhuis">
      <span class="home-ico">${icon("home")}</span>
      <span class="value"><span class="label">In huis</span><br>${homeNames.length ? esc(homeNames.join(", ")) : "Niets ingevuld, tik om toe te voegen"}</span>
      ${icon("chevron")}
    </a>
    <h2 class="section-title">Suggesties ${sug && sug.items && sug.items.length ? `<button class="chip-btn" data-action="surprise">${icon("dice")}Verras me</button>` : ""}</h2>
    ${list}
    ${almost}
    ${sourceNote()}`;
}

function suggestionCard(s, i) {
  const fewest = S.focus === "fewest-stores";
  const cost = fewest ? s.fewest.checkoutCents : s.checkoutCents;
  const chains = fewest ? s.fewest.chains : s.chains;
  const stores = `<span>${dots(chains)} ${plural(chains.length, "winkel", "winkels")}</span>`;
  const save = s.savedCents >= 50 && !fewest ? `<span class="save">${euro(s.savedCents)} voordeel</span>` : "";
  const href = `#/recept/${encodeURIComponent(s.id)}`;
  if (i === 0) {
    const flag = { price: "Voordeligst deze week", quick: "Snelst klaar", "fewest-stores": "Minste winkels" }[S.focus];
    return `<a class="card featured" href="${href}">
      <div class="top">
        <div class="tile" data-tone="${tone(s.tags)}" aria-hidden="true">${esc(s.emoji)}</div>
        <div><span class="flag">${flag}</span><h3>${esc(s.title)}</h3><div class="meta"><span>${icon("clock")}${s.minutes} min</span>${stores}</div></div>
      </div>
      <div class="bottom">
        <div class="price"><strong>${euro(cost)}</strong><small>aan de kassa voor ${plural(S.servings, "persoon", "personen")}</small></div>
        ${save}
      </div>
    </a>`;
  }
  return `<a class="card" href="${href}">
    <div class="tile" data-tone="${tone(s.tags)}" aria-hidden="true">${esc(s.emoji)}</div>
    <div><h3>${esc(s.title)}</h3><div class="meta"><span>${icon("clock")}${s.minutes} min</span>${stores}</div></div>
    <div class="price"><strong>${euro(cost)}</strong><small>kassa</small></div>
  </a>`;
}

async function loadSuggestions() {
  if (S.needCode || S.booting) return;
  if (!S.chains.size) { S.suggestions = { items: [], almost: [], total: 0, recipeErrors: [] }; S.suggestionsKey = null; render(); return; }
  const o = { ...opts(), focus: S.focus };
  const key = JSON.stringify(o);
  if (S.suggestionsKey === key && S.suggestions) return;
  const seq = ++S.sugSeq;
  S.sugLoading = true; S.sugError = null;
  if (route().page === "discover") render();
  try {
    const data = await run("suggesties", { opties: o });
    if (seq !== S.sugSeq) return;
    S.suggestions = data; S.suggestionsKey = key; S.status = data.status;
  } catch (e) {
    if (seq !== S.sugSeq) return;
    if (e.wrongCode) { S.sugLoading = false; askCodeAgain("De code is gewijzigd. Voer de nieuwe code in."); return; }
    S.sugError = e.message;
  } finally {
    if (seq === S.sugSeq && !S.needCode) { S.sugLoading = false; render(); }
  }
}

/* ---------- Recept ---------- */
const quoteKey = id => id + "|" + JSON.stringify(opts());

async function loadQuote(id) {
  const key = quoteKey(id);
  if (S.quotes.has(key) || S.quoteErrors.has(key) || S.pending.has(key)) return;
  S.pending.add(key);
  try { S.quotes.set(key, await run("recept", { id, opties: opts() })); }
  catch (e) {
    if (e.wrongCode) { S.pending.delete(key); askCodeAgain("De code is gewijzigd. Voer de nieuwe code in."); return; }
    S.quoteErrors.set(key, e.message);
  }
  finally { S.pending.delete(key); }
  const r = route();
  if (r.page === "recipe" && r.id === id) render();
}

function viewRecipe(id) {
  const key = quoteKey(id);
  const q = S.quotes.get(key);
  if (S.quoteErrors.has(key)) return `<div class="notice warn"><h3>Recept niet geladen</h3><p>${esc(S.quoteErrors.get(key))}</p><a class="chip-btn" href="#/">${icon("back")}Terug</a></div>`;
  if (!q) { loadQuote(id); return `<div class="cards"><div class="skeleton tall"></div><div class="skeleton"></div><div class="skeleton tall"></div></div>`; }
  const r = q.recipe;

  const hero = `
    <section class="detail-hero">
      <div class="tile" data-tone="${tone(r.tags)}" aria-hidden="true">${esc(r.emoji)}</div>
      <div><h1>${esc(r.title)}</h1><div class="meta"><span>${icon("clock")}${r.minutes} min</span></div></div>
    </section>
    <div class="detail-meta">${servingsStepper()}</div>`;

  if (!q.eligible) {
    return `${hero}
      <div class="notice warn spaced"><h3>Nu niet helemaal uit de aanbiedingen</h3>
        <p>Dit ingrediënt is nu niet in de aanbieding bij jouw winkels. Heb je het al in huis? Dan kan het wel.</p>
        <div class="missing-list">${q.missing.map(m => `<div class="missing-row"><strong>${esc(m.label)}</strong><button class="mini-btn" data-action="add-home" data-ids="${esc(m.id)}">Heb ik in huis</button></div>`).join("")}</div>
      </div>
      ${stepsBlock(r)}${sourceNote()}`;
  }

  let choice = S.planChoice[r.id];
  if (choice == null || !q.plans[choice]) choice = S.focus === "fewest-stores" ? Math.max(0, q.plans.findIndex(p => p.kind === "fewest")) : 0;
  const plan = q.plans[choice];
  const leftover = plan.checkoutCents - plan.consumedCents;

  const plans = q.plans.length > 1 ? `<div class="plans" role="group" aria-label="Waar koop je het?">${q.plans.map((p, i) => `
      <button class="plan" data-action="plan" data-recipe="${esc(r.id)}" data-index="${i}" aria-pressed="${i === choice}">
        <span>${esc(p.label)}</span><strong>${euro(p.checkoutCents)}</strong><em class="plan-stores">${dots(p.chains)} ${plural(p.chains.length, "winkel", "winkels")}</em>
      </button>`).join("")}</div>` : "";

  const totals = `
    <div class="totals">
      <div class="total primary"><span>Aan de kassa</span><strong>${euro(plan.checkoutCents)}</strong><small>hele verpakkingen</small></div>
      <div class="total"><span>In je gerecht</span><strong>${euro(plan.consumedCents)}</strong><small>wat je echt gebruikt</small></div>
    </div>
    <div class="total-note">
      ${leftover > 0 ? `<span>${euro(leftover)} blijft over voor een volgende keer</span>` : ""}
      ${plan.savedCents > 0 ? `<span class="save">${euro(plan.savedCents)} voordeel t.o.v. normale prijs</span>` : ""}
    </div>`;

  const groups = plan.chains.map(c => {
    const picks = plan.picks.filter(p => p.offer.chain === c.id);
    const sub = picks.reduce((n, p) => n + p.checkoutCents, 0);
    return `<section class="store-group">
      <div class="store-head">${dot(c.id)}${esc(c.name)}<span class="sub">${euro(sub)}</span></div>
      ${picks.map(itemRow).join("")}
    </section>`;
  }).join("");

  const home = q.home.length ? `<h2 class="section-title">Heb je al</h2><div class="have">${q.home.map(h => `<span>${icon("check")}${esc(h.label)}</span>`).join("")}</div>` : "";

  return `${hero}${plans}${totals}
    <h2 class="section-title">Boodschappen <small>${plural(plan.picks.length, "product", "producten")}</small></h2>
    ${groups}
    ${home}
    ${stepsBlock(r)}
    ${sourceNote()}`;
}

function itemRow(p) {
  const o = p.offer;
  const thumb = o.image ? `<div class="thumb"><img src="${esc(o.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"></div>` : `<div class="thumb empty">${icon("tag")}</div>`;
  const name = o.url ? `<a class="name" href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.name)}${icon("external")}</a>` : `<span class="name">${esc(o.name)}</span>`;
  const deal = p.dealApplied ? `<span class="deal">${esc(o.deal)}</span>` : `<span class="deal off" title="De actie geldt pas vanaf ${p.dealMinQty} stuks">${esc(o.deal)} · vanaf ${p.dealMinQty}</span>`;
  const regular = o.originalCents && p.savedCents > 0 ? `<s>${euro(p.checkoutCents + p.savedCents)}</s>` : "";
  return `<div class="item">
    ${thumb}
    <div>
      <div class="for">voor ${esc(p.label)}</div>
      ${name}
      <div class="info"><span>${p.packs}× ${esc(o.packLabel)}${o.approx ? " (ca.)" : ""}</span>${deal}<span class="tiny">${esc(untilLabel(o.validUntil))}${o.validUntilEstimated ? " (geschat)" : ""}</span></div>
    </div>
    <div class="cost">${euro(p.checkoutCents)}${regular}</div>
  </div>`;
}

function stepsBlock(r) {
  return `<h2 class="section-title">Bereiding</h2>
    <ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
    ${r.extras ? `<p class="extras">Niet meegerekend: ${esc(r.extras)}.</p>` : ""}`;
}

/* ---------- In huis ---------- */
function viewHome() {
  return `
    <section class="hero">
      <p class="eyebrow">Je keuken</p>
      <h1>In huis</h1>
      <p class="lede">Wat je al hebt, hoeft niet in de aanbieding te zijn. SlimBord rekent het niet mee.</p>
    </section>
    <div class="combo">
      <input id="homeInput" type="text" inputmode="search" autocomplete="off" placeholder="Bijv. rijst, uien, eieren" aria-label="Ingrediënt toevoegen" role="combobox" aria-expanded="false" aria-controls="homeList" aria-autocomplete="list">
      <button class="icon-btn accent" data-action="add-typed" aria-label="Toevoegen" title="Toevoegen">${icon("plus")}</button>
      <ul id="homeList" class="combo-list" role="listbox" hidden></ul>
    </div>
    <h2 class="section-title">Heb ik al <small id="homeCount">${S.home.length || ""}</small></h2>
    <div class="chips" id="homeChips">${homeChips()}</div>
    <h2 class="section-title">Snel toevoegen</h2>
    <div class="chips" id="quickChips">${quickChips()}</div>
    ${sourceNote()}`;
}

const ingName = id => (S.ingById[id] && S.ingById[id].name) || id;

const homeChips = () => S.home.length
  ? S.home.map(id => `<span class="chip">${esc(ingName(id))}<button data-action="remove-home" data-id="${esc(id)}" aria-label="Verwijder ${esc(ingName(id))}">${icon("x")}</button></span>`).join("")
  : `<p class="empty-line">Nog niets. Voeg toe wat je in de kast of koelkast hebt.</p>`;

const quickChips = () => {
  const items = QUICK_HOME.filter(id => S.ingById[id] && !S.home.includes(id));
  return items.length ? items.map(id => `<button class="chip add" data-action="add-home" data-ids="${id}">${icon("plus")}${esc(ingName(id))}</button>`).join("") : `<p class="empty-line">Alles uit deze lijst staat er al op.</p>`;
};

function refreshHomeParts() {
  const chips = $("#homeChips"), quick = $("#quickChips"), count = $("#homeCount");
  if (chips) chips.innerHTML = homeChips();
  if (quick) quick.innerHTML = quickChips();
  if (count) count.textContent = S.home.length || "";
  renderTabbar(route());
}

function setHome(next) {
  S.home = [...new Set(next)].filter(id => S.ingById[id]);
  saveSettings();
  invalidate();
  if (route().page === "home") refreshHomeParts(); else render();
  loadSuggestions();
}

let comboIndex = 0;
function comboMatches(q) {
  const t = norm(q);
  if (!t) return [];
  const score = i => Math.min(...[i.name, i.id, ...(i.aliases || [])].map(norm).map(w => (w.includes(t) ? w.indexOf(t) : 99)));
  return S.ingredients.filter(i => !S.home.includes(i.id) && score(i) < 99).sort((a, b) => score(a) - score(b)).slice(0, 8);
}
function renderCombo() {
  const input = $("#homeInput"), list = $("#homeList");
  if (!input || !list) return;
  const matches = comboMatches(input.value);
  if (!input.value.trim()) { list.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
  comboIndex = Math.min(comboIndex, Math.max(0, matches.length - 1));
  list.innerHTML = matches.length
    ? matches.map((m, i) => `<li role="option" id="opt-${esc(m.id)}" data-id="${esc(m.id)}" aria-selected="${i === comboIndex}">${esc(m.name)}</li>`).join("")
    : `<li class="none">Niet in de lijst. Probeer een ander woord.</li>`;
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
}
function addTyped() {
  const input = $("#homeInput");
  if (!input) return;
  const matches = comboMatches(input.value);
  const m = matches[comboIndex] || matches[0];
  if (!m) { renderCombo(); return; }
  input.value = ""; comboIndex = 0; renderCombo();
  setHome([...S.home, m.id]);
  input.focus();
}

/* ---------- Winkels ---------- */
function viewStores() {
  const row = s => `<label class="row">
      ${dot(s.id)}
      <span class="txt"><strong>${esc(s.name)}</strong><small>${s.usableOffers ? plural(s.usableOffers, "passende aanbieding", "passende aanbiedingen") : "nu geen passende aanbiedingen"}</small></span>
      <span class="switch"><input type="checkbox" data-chain="${esc(s.id)}" ${S.chains.has(s.id) ? "checked" : ""} aria-label="${esc(s.name)}"><span></span></span>
    </label>`;
  const big = S.supermarkets.filter(s => s.isDefault);
  const other = S.supermarkets.filter(s => !s.isDefault).sort((a, b) => a.name.localeCompare(b.name, "nl"));
  const st = S.status;
  const sug = S.suggestions;
  const errors = sug && sug.recipeErrors && sug.recipeErrors.length
    ? `<div class="notice warn spaced"><h3>${plural(sug.recipeErrors.length, "recept", "recepten")} overgeslagen</h3>${sug.recipeErrors.map(e => `<p>${esc(e)}</p>`).join("")}<p>De namen die SlimBord kent staan in het tabblad Ingrediënten van je Sheet.</p></div>` : "";
  return `
    <section class="hero">
      <p class="eyebrow">Waar je winkelt</p>
      <h1>Winkels</h1>
      <p class="lede">SlimBord zoekt alleen aanbiedingen bij de winkels die aan staan, en combineert ze tot de goedkoopste boodschappen.</p>
    </section>
    <h2 class="section-title">Grote ketens</h2>
    <div class="list">${big.map(row).join("")}</div>
    <h2 class="section-title">Overige ketens</h2>
    <div class="list">${other.map(row).join("")}</div>
    <div class="status-card">
      ${icon("info")}
      <div><strong>Bijgewerkt ${esc(whenLabel(st && st.fetchedAt))}</strong><br>${st ? `${st.totalOffers} acties opgehaald, ${st.usableOffers} bruikbaar als ingrediënt.` : ""}${sug && sug.total ? `<br>${plural(sug.total, "recept", "recepten")} in je Sheet.` : ""}${st && st.error ? `<br>Laatste poging mislukt: ${esc(st.error)}` : ""}</div>
    </div>
    ${errors}
    <button class="link-btn" data-action="change-code">Andere code invoeren op dit apparaat</button>
    ${sourceNote()}`;
}

/* ---------- Laden en fouten bij opstarten ---------- */
function viewBoot() {
  if (S.bootError) return `<section class="hero"><h1>SlimBord start niet</h1></section><div class="notice warn"><h3>Er ging iets mis</h3><p>${esc(S.bootError)}</p><button class="chip-btn" data-action="reboot">${icon("refresh")}Opnieuw proberen</button></div>`;
  return `<section class="hero"><p class="eyebrow">Even geduld</p><h1>${S.loadingMessage ? "Aanbiedingen van deze week ophalen…" : "SlimBord laden…"}</h1><p class="lede">${esc(S.loadingMessage || "")}</p></section>
    <div class="cards spaced"><div class="skeleton tall"></div><div class="skeleton"></div><div class="skeleton"></div></div>`;
}

/* ---------- Tekenen ---------- */
function render() {
  const r = route();
  renderTopbar(r);
  renderTabbar(r);
  const main = $("#main");
  if (S.needCode) { main.innerHTML = viewCode(); const input = $("#codeInput"); if (input) input.focus(); return; }
  if (S.booting || S.bootError) { main.innerHTML = viewBoot(); return; }
  if (r.page === "recipe") main.innerHTML = viewRecipe(r.id);
  else if (r.page === "home") main.innerHTML = viewHome();
  else if (r.page === "stores") main.innerHTML = viewStores();
  else main.innerHTML = viewDiscover();
}

/* ---------- Gebeurtenissen ---------- */
document.addEventListener("click", e => {
  const li = e.target.closest("#homeList li[data-id]");
  if (li) { $("#homeInput").value = ""; renderCombo(); setHome([...S.home, li.dataset.id]); $("#homeInput").focus(); return; }
  if (!e.target.closest(".combo")) { const list = $("#homeList"); if (list) list.hidden = true; }

  const t = e.target.closest("[data-action]");
  if (!t) return;
  const a = t.dataset.action;
  if (a === "back") { if (S.inApp && history.length > 1) history.back(); else location.hash = "#/"; }
  else if (a === "theme") {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("slimbord-theme", next); } catch (err) { /* geen opslag */ }
    syncThemeColor();
    renderTopbar(route());
  }
  else if (a === "refresh") startRefresh();
  else if (a === "servings") {
    S.servings = Math.min(12, Math.max(1, S.servings + Number(t.dataset.step)));
    saveSettings(); invalidate(); render(); loadSuggestions();
  }
  else if (a === "focus") { S.focus = t.dataset.value; saveSettings(); S.suggestionsKey = null; render(); loadSuggestions(); }
  else if (a === "surprise") {
    const items = (S.suggestions && S.suggestions.items) || [];
    if (items.length) location.hash = `#/recept/${encodeURIComponent(items[Math.floor(Math.random() * items.length)].id)}`;
  }
  else if (a === "add-home") setHome([...S.home, ...t.dataset.ids.split(",")]);
  else if (a === "remove-home") setHome(S.home.filter(id => id !== t.dataset.id));
  else if (a === "add-typed") addTyped();
  else if (a === "plan") { S.planChoice[t.dataset.recipe] = Number(t.dataset.index); render(); }
  else if (a === "retry") { S.suggestionsKey = null; loadSuggestions(); }
  else if (a === "reboot") { S.bootError = null; S.booting = true; boot(); }
  else if (a === "change-code") askCodeAgain(null);
});

document.addEventListener("submit", e => {
  if (e.target.id !== "codeForm") return;
  e.preventDefault();
  const value = $("#codeInput").value.trim().toUpperCase();
  if (!value) return;
  codeStore.set(value);
  S.needCode = false;
  S.codeError = null;
  boot();
});

document.addEventListener("input", e => { if (e.target.id === "homeInput") { comboIndex = 0; renderCombo(); } });
document.addEventListener("keydown", e => {
  if (e.target.id !== "homeInput") return;
  const n = comboMatches(e.target.value).length;
  if (e.key === "ArrowDown" && n) { e.preventDefault(); comboIndex = (comboIndex + 1) % n; renderCombo(); }
  else if (e.key === "ArrowUp" && n) { e.preventDefault(); comboIndex = (comboIndex - 1 + n) % n; renderCombo(); }
  else if (e.key === "Enter") { e.preventDefault(); addTyped(); }
  else if (e.key === "Escape") { $("#homeList").hidden = true; }
});
document.addEventListener("change", e => {
  const id = e.target.dataset && e.target.dataset.chain;
  if (!id) return;
  if (e.target.checked) S.chains.add(id); else S.chains.delete(id);
  saveSettings();
  invalidate();
  loadSuggestions();
});
window.addEventListener("hashchange", () => { S.inApp = true; render(); window.scrollTo(0, 0); if (route().page === "discover") loadSuggestions(); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { syncThemeColor(); renderTopbar(route()); });

async function startRefresh() {
  if (S.refreshing) return;
  S.refreshing = true;
  renderTopbar(route());
  try {
    const r = await run("verversen");
    S.status = r.status;
    S.supermarkets = r.supermarkets;
    invalidate();
    render();
    loadSuggestions();
  } catch (e) {
    if (e.wrongCode) { askCodeAgain("De code is gewijzigd. Voer de nieuwe code in."); return; }
    S.sugError = e.message;
    render();
  } finally {
    S.refreshing = false;
    renderTopbar(route());
  }
}

async function boot() {
  syncThemeColor();
  if (!API_URL) { S.booting = false; S.bootError = "Het adres van de SlimBord-server ontbreekt nog in config.js."; render(); return; }
  if (!codeStore.get()) { S.needCode = true; render(); return; }
  S.needCode = false;
  S.booting = true;
  S.bootError = null;
  render();
  try {
    const start = await run("start");
    S.ingredients = start.ingredients;
    S.ingById = Object.fromEntries(start.ingredients.map(i => [i.id, i]));
    S.supermarkets = start.supermarkets;
    S.status = start.status;
    if (!applySettings(start.settings) && !applySettings(local.get("settings", null))) {
      S.chains = new Set(S.supermarkets.filter(s => s.isDefault).map(s => s.id));
      S.home = ["olie"];
    }
    if (!S.status.fetchedAt) {
      S.loadingMessage = "De eerste keer worden de aanbiedingen van deze week opgehaald. Dat duurt 1 à 2 minuten.";
      render();
      const r = await run("verversen");
      S.status = r.status;
      S.supermarkets = r.supermarkets;
      if (!S.status.fetchedAt) throw new Error(S.status.error || "Het ophalen van de aanbiedingen is niet gelukt.");
    }
    S.booting = false;
    render();
    loadSuggestions();
  } catch (e) {
    if (e.wrongCode) { askCodeAgain(e.message); return; }
    S.bootError = e.message;
    render();
  }
}

boot();
