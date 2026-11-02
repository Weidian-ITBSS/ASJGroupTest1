"use strict";
/* ==========================================================================
   PRODUK STAY: layar TIDAK berpindah saat memakai filter (Tanaman, Kategori,
   rel kategori, cari, urutkan, hapus filter).
   Cara kerja: saat kamu menyentuh kontrol filter, posisi kontrol itu di layar
   dicatat. Selama 1,2 detik berikutnya, apa pun yang menggeser layar (scrollIntoView,
   scrollTo, fokus, lompat #katalog, atau tinggi halaman berubah) dibatalkan,
   dan posisi kontrol dikembalikan ke tempat semula. Begitu kamu scroll sendiri
   (roda, sentuh, tombol keyboard), penahan langsung dilepas.
   Muat SETELAH main.js dan produk-plus.js.
   ========================================================================== */
(() => {
  const grid = document.getElementById("lotGrid");
  if (!grid) return;


  /* ---- teks chip kategori (Herbisida, Insektisida, ...) rata tengah ---- */
  const css = document.createElement("style");
  css.textContent =
    "body .pp-rail .pp-cat{display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;gap:6px}" +
    "body .pp-rail .pp-cat small{display:inline-block;text-align:center;line-height:1}";
  document.head.appendChild(css);

  const SELECTOR = [
    ".filter-dropdown",
    "#saringBar",
    ".pp-rail",
    ".pp-toolbar",
    "#activeFilterTags",
    ".search-box",
    "#searchInput",
    "[data-filter]",
    "[data-clear-filters]",
    "#clearFilters",
  ].join(",");
  const HOLD_MS = 1200;

  let until = 0;
  let anchor = null; // { el, top }
  let raf = 0;

  const active = () => performance.now() < until;

  /* ---- blokir scroll terprogram selama penahan aktif ---- */
  const nativeScrollTo = window.scrollTo.bind(window);
  const nativeScrollBy = window.scrollBy.bind(window);
  const nativeIntoView = Element.prototype.scrollIntoView;
  let internal = false;

  window.scrollTo = function (...args) {
    if (active() && !internal) return;
    return nativeScrollTo(...args);
  };
  window.scrollBy = function (...args) {
    if (active() && !internal) return;
    return nativeScrollBy(...args);
  };
  Element.prototype.scrollIntoView = function (...args) {
    if (active() && !internal) return;
    return nativeIntoView.apply(this, args);
  };

  /* ---- kembalikan posisi kontrol ke titik semula ---- */
  function restore() {
    if (!anchor || !active()) return;
    const el = anchor.el.isConnected ? anchor.el : anchor.fallback;
    if (!el || !el.isConnected) return;
    const top = el.getBoundingClientRect().top;
    const diff = top - anchor.top;
    if (Math.abs(diff) > 0.5) {
      internal = true;
      nativeScrollBy({ top: diff, left: 0, behavior: "instant" });
      internal = false;
    }
  }
  function loop() {
    restore();
    if (active()) raf = requestAnimationFrame(loop);
    else {
      raf = 0;
      anchor = null;
    }
  }

  function hold(target) {
    const control =
      target.closest("button, label, input, select, summary, a") || target;
    const fallback = document.querySelector(".pp-toolbar") || grid;
    // Kontrol yang ada di dalam dropdown bisa tertutup; pakai pembungkusnya
    const stable = control.closest(".filter-dropdown, .pp-rail, .pp-toolbar") || control;
    anchor = {
      el: stable,
      top: stable.getBoundingClientRect().top,
      fallback,
    };
    until = performance.now() + HOLD_MS;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  /* ---- mulai menahan saat kontrol filter disentuh ---- */
  const start = (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (t.closest(SELECTOR)) hold(t);
  };
  ["pointerdown", "click", "change", "input", "keydown"].forEach((type) =>
    document.addEventListener(type, start, true),
  );

  /* ---- lepas penahan bila PENGGUNA sendiri yang scroll ---- */
  const release = () => {
    until = 0;
  };
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchmove", release, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (
      [" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"].includes(
        e.key,
      ) &&
      !e.target.closest?.("input, select, textarea")
    )
      release();
  });

  /* ---- lompat hash (#katalog) saat filter dipakai juga ditahan ---- */
  window.addEventListener("hashchange", () => {
    if (active()) restore();
  });
})();