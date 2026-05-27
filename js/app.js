/* LUCKYPLAY — main app logic */
(function () {
  "use strict";

  const STORAGE_KEY = "lp_lang";
  const DEFAULT_LANG = "ru";
  const SUPPORTED = ["uz", "ru"];

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    applyLang(lang);
    updateLangPill(lang);
  }

  function applyLang(lang) {
    const dict = window.LP_DICT[lang];
    if (!dict) return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
  }

  function updateLangPill(lang) {
    document.querySelectorAll(".lang-pill button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
  }

  const OFFER_URL = "https://like-official.appleuzlike.site/?fbp=&ttp=&bgp=&sub1=&sub2=&sub3=";

  /* ---------- Render games grid ---------- */
  function renderGames() {
    const grid = document.querySelector("[data-games-grid]");
    if (!grid || !window.LP_GAMES) return;
    grid.innerHTML = window.LP_GAMES.map((g) => `
      <a class="game-card" href="${OFFER_URL}">
        <img class="game-card__img" src="${g.img}" alt="${g.name}" loading="lazy" />
        <span class="game-card__badge badge--${g.badge}" data-i18n="games.b.${g.badge}">${g.badge}</span>
        <div class="game-card__info">
          <h3 class="game-card__title">${g.name}</h3>
          <p class="game-card__provider" data-i18n="${g.providerKey}"></p>
        </div>
      </a>
    `).join("");
  }

  /* ---------- Countdown timer ---------- */
  function initTimer() {
    const root = document.querySelector("[data-timer]");
    if (!root) return;
    const dEl = root.querySelector('[data-t="d"]');
    const hEl = root.querySelector('[data-t="h"]');
    const mEl = root.querySelector('[data-t="m"]');
    const sEl = root.querySelector('[data-t="s"]');

    // Seed: ~2d 14h 32m 09s from now; persist to localStorage so it doesn't reset every reload
    const KEY = "lp_timer_end";
    let end = parseInt(localStorage.getItem(KEY), 10);
    if (!end || end < Date.now()) {
      end = Date.now() + (2 * 24 * 60 * 60 + 14 * 60 * 60 + 32 * 60 + 9) * 1000;
      localStorage.setItem(KEY, String(end));
    }

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff %= 1000 * 60 * 60 * 24;
      const h = Math.floor(diff / (1000 * 60 * 60));
      diff %= 1000 * 60 * 60;
      const m = Math.floor(diff / (1000 * 60));
      diff %= 1000 * 60;
      const s = Math.floor(diff / 1000);
      if (dEl) dEl.textContent = pad(d);
      if (hEl) hEl.textContent = pad(h);
      if (mEl) mEl.textContent = pad(m);
      if (sEl) sEl.textContent = pad(s);
      if (end - Date.now() <= 0) {
        end = Date.now() + (2 * 24 * 60 * 60 + 14 * 60 * 60 + 32 * 60 + 9) * 1000;
        localStorage.setItem(KEY, String(end));
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- FAQ accordion (single-open) ---------- */
  function initFaq() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((it, idx) => {
      const q = it.querySelector(".faq-item__q");
      if (!q) return;
      q.addEventListener("click", () => {
        const wasOpen = it.classList.contains("is-open");
        items.forEach((x) => x.classList.remove("is-open"));
        if (!wasOpen) it.classList.add("is-open");
      });
      if (idx === 0) it.classList.add("is-open");
    });
  }

  /* CTA links navigate directly via href to OFFER_URL — no JS interception. */

  /* ---------- Lang pill ---------- */
  function initLang() {
    document.querySelectorAll(".lang-pill button").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderGames();
    initLang();
    initFaq();
    initTimer();
    setLang(getLang());
  });
})();
