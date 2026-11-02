"use strict";
/* ==========================================================================
   ANGKA KATALOG OTOMATIS
   Mengisi jumlah produk dan kategori dari js/produk-data.js, jadi angka di
   beranda dan halaman Tentang tidak perlu diedit manual saat produk berubah.

   Cara pakai di HTML (isi di dalamnya hanya cadangan bila JS mati):
     <span data-katalog="produk">43</span>        -> jumlah semua produk
     <span data-katalog="kategori">7</span>       -> jumlah kategori
     <span data-katalog-kategori="herbisida">24</span> -> jumlah per kategori
   Harus dimuat SETELAH js/produk-data.js.
   ========================================================================== */
(() => {
  const list = window.ASJ_PRODUCTS;
  if (!Array.isArray(list)) return;

  // Sama dengan aturan produk-render.js: baris template kosong tidak dihitung
  const valid = list.filter(
    (p) =>
      p &&
      typeof p.nama === "string" &&
      p.nama.trim() &&
      typeof p.kategori === "string" &&
      p.kategori.trim(),
  );

  const perCategory = {};
  valid.forEach((p) => {
    perCategory[p.kategori] = (perCategory[p.kategori] || 0) + 1;
  });

  const fill = (selector, text) =>
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = text;
    });

  fill('[data-katalog="produk"]', valid.length);
  fill('[data-katalog="kategori"]', Object.keys(perCategory).length);

  document.querySelectorAll("[data-katalog-kategori]").forEach((el) => {
    const count = perCategory[el.dataset.katalogKategori] || 0;
    el.textContent = String(count).padStart(2, "0");
  });
})();