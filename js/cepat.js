"use strict";
/* ==========================================================================
   MUAT HALAMAN LEBIH CEPAT
   Saat kursor berhenti di atas tautan (atau jari menyentuhnya), halaman
   tujuan diunduh lebih dulu di latar belakang. Ketika tautan benar-benar
   ditekan, halaman terasa langsung terbuka.

   - Hanya untuk halaman di situs sendiri (bukan tautan keluar / WhatsApp).
   - Berhenti otomatis bila pengguna menyalakan Penghemat Data atau
     sedang di jaringan 2G, supaya kuota tidak terbuang.
   ========================================================================== */
(() => {
  const connection = navigator.connection;
  if (
    connection &&
    (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ""))
  ) {
    return;
  }

  const HOVER_DELAY = 80; // ms; menghindari unduhan saat kursor hanya lewat
  const requested = new Set();
  let timer = 0;

  function prefetch(anchor) {
    if (!anchor || !anchor.href) return;
    if (anchor.target && anchor.target !== "_self") return;
    if (anchor.hasAttribute("download")) return;

    let url;
    try {
      url = new URL(anchor.href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    if (!/(\.html?|\/)$/.test(url.pathname)) return; // hanya halaman, bukan berkas
    url.hash = "";
    if (url.pathname === location.pathname && url.search === location.search) {
      return; // halaman yang sedang dibuka
    }
    if (requested.has(url.href)) return;
    requested.add(url.href);

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "document";
    link.href = url.href;
    document.head.appendChild(link);
  }

  const anchorOf = (event) =>
    event.target instanceof Element ? event.target.closest("a[href]") : null;

  document.addEventListener("mouseover", (event) => {
    const anchor = anchorOf(event);
    if (!anchor) return;
    clearTimeout(timer);
    timer = setTimeout(() => prefetch(anchor), HOVER_DELAY);
  });
  document.addEventListener("mouseout", () => clearTimeout(timer));
  document.addEventListener("focusin", (event) => prefetch(anchorOf(event)));
  document.addEventListener(
    "touchstart",
    (event) => prefetch(anchorOf(event)),
    { passive: true },
  );
})();
