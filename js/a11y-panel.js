"use strict";
/* ==========================================================================
   LAPISAN AKSESIBILITAS — panel, dialog, dan tombol melayang
   Berdiri sendiri: tidak mengubah main.js. Dimuat SETELAH main.js.

   Untuk menu seluler, keranjang, detail produk, lightbox, dan promo
   (semuanya dibuka lewat class "open"):
     1. Fokus pindah ke dalam panel saat dibuka, dan kembali ke tombol
        pemicu saat ditutup.
     2. Tab berputar di dalam panel yang sedang terbuka (focus trap).
     3. Tombol Esc menutup panel teratas.
     4. role="dialog", aria-modal, dan nama panel dilengkapi bila belum ada.
     5. aria-expanded pada tombol menu, keranjang, dan pencarian ikut berubah.
   Tambahan: tombol WhatsApp melayang disembunyikan saat footer terlihat,
   supaya tidak menutupi teks.
   ========================================================================== */
(() => {
  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),' +
    'select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

  /* Panel yang dibuka lewat class "open". close = tombol tutup, toggle = pemicu. */
  const PANELS = [
    {
      id: "mobileDrawer",
      close: "#drawerClose",
      toggle: "#menuToggle",
      label: "Menu navigasi seluler",
    },
    {
      id: "cartPanel",
      close: "#cartCloseBtn",
      toggle: "#cartOpenBtn",
      label: "Daftar pesanan",
    },
    { id: "productModal", close: "#productModalClose", label: "Detail produk" },
    { id: "lightbox", close: "#lightboxClose", label: "Pratinjau gambar" },
    { id: "promoModal", close: "#promoClose", label: "Promo" },
  ];

  const isVisible = (el) =>
    el.getClientRects().length > 0 &&
    getComputedStyle(el).visibility !== "hidden";
  const focusables = (root) =>
    [...root.querySelectorAll(FOCUSABLE)].filter(isVisible);

  const openStack = []; // panel yang sedang terbuka, urut dari yang pertama dibuka

  function onOpen(state) {
    const { el, toggle } = state;
    const active = document.activeElement;
    state.opener =
      active && active !== document.body && !el.contains(active)
        ? active
        : toggle;
    toggle?.setAttribute("aria-expanded", "true");
    openStack.push(state);
    // Beri jeda singkat: panel baru berubah dari visibility:hidden ke terlihat
    setTimeout(() => {
      if (!state.open) return;
      const target = focusables(el)[0];
      if (target) target.focus({ preventScroll: true });
      else {
        el.tabIndex = -1;
        el.focus({ preventScroll: true });
      }
    }, 60);
  }

  function onClose(state) {
    const { el, toggle } = state;
    toggle?.setAttribute("aria-expanded", "false");
    const i = openStack.indexOf(state);
    if (i !== -1) openStack.splice(i, 1);
    const back =
      state.opener && document.contains(state.opener) ? state.opener : toggle;
    const active = document.activeElement;
    if (back && (!active || active === document.body || el.contains(active))) {
      back.focus({ preventScroll: true });
    }
    state.opener = null;
  }

  PANELS.forEach((cfg) => {
    const el = document.getElementById(cfg.id);
    if (!el) return;
    const state = {
      el,
      closeBtn: cfg.close ? document.querySelector(cfg.close) : null,
      toggle: cfg.toggle ? document.querySelector(cfg.toggle) : null,
      opener: null,
      open: false,
    };
    if (!el.hasAttribute("role")) el.setAttribute("role", "dialog");
    if (!el.hasAttribute("aria-modal")) el.setAttribute("aria-modal", "true");
    if (!el.hasAttribute("aria-label") && !el.hasAttribute("aria-labelledby")) {
      el.setAttribute("aria-label", cfg.label);
    }
    state.toggle?.setAttribute("aria-expanded", "false");

    const sync = () => {
      const nowOpen = el.classList.contains("open");
      if (nowOpen === state.open) return;
      state.open = nowOpen;
      if (nowOpen) onOpen(state);
      else onClose(state);
    };
    new MutationObserver(sync).observe(el, {
      attributes: true,
      attributeFilter: ["class"],
    });
    sync();
  });

  document.addEventListener("keydown", (e) => {
    const top = openStack[openStack.length - 1];
    if (!top) return;

    if (e.key === "Escape") {
      // Tutup lewat tombol resminya supaya semua logika bawaan ikut jalan
      if (top.closeBtn) top.closeBtn.click();
      else top.el.classList.remove("open");
      return;
    }

    if (e.key === "Tab") {
      const items = focusables(top.el);
      if (!items.length) {
        e.preventDefault();
        top.el.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !top.el.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* Pencarian di header: buka/tutup dilaporkan ke pembaca layar */
  const navSearch = document.getElementById("navSearch");
  const navSearchBtn = document.getElementById("navSearchBtn");
  if (navSearch && navSearchBtn) {
    navSearchBtn.setAttribute(
      "aria-expanded",
      String(navSearch.classList.contains("open")),
    );
    navSearchBtn.setAttribute("aria-controls", "navSearchInput");
    new MutationObserver(() =>
      navSearchBtn.setAttribute(
        "aria-expanded",
        String(navSearch.classList.contains("open")),
      ),
    ).observe(navSearch, { attributes: true, attributeFilter: ["class"] });
  }

  /* Tombol WhatsApp melayang: sembunyikan saat footer terlihat */
  const wa = document.querySelector(".wa-float");
  const footer = document.querySelector("footer");
  if (wa && footer && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => wa.classList.toggle("is-tucked", entry.isIntersecting),
      { threshold: 0 },
    ).observe(footer);
  }
})();
