"use strict";
/* Kontak: tombol "contoh pesan" mengisi kolom Pesan.
 * - Kolom kosong: diisi contoh. Sudah ada isi: contoh ditambahkan di bawahnya.
 * - Bagian dalam [kurung] langsung terseleksi supaya tinggal diketik.
 * - Tautan dari halaman lain: kontak.html?jenis=kebun | kios | kendala
 *   mengisi contoh yang sesuai begitu halaman dibuka.
 * Tidak mengubah logika pengiriman formulir. */
(() => {
  // urutan = urutan tombol di HTML
  const JENIS = ["kebun", "kios", "kendala"];

  function init() {
    const buttons = [...document.querySelectorAll(".quick-start-btn")];
    const textarea = document.getElementById("ms");
    if (!buttons.length || !textarea) return;
    const status = document.getElementById("quickStartStatus");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function apply(button, { fromLink = false } = {}) {
      const template = button.dataset.template || "";
      const existing = textarea.value.trim();
      const insertAt = existing ? existing.length + 2 : 0;

      textarea.value = existing ? `${existing}\n\n${template}` : template;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      if (!fromLink) {
        textarea.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
        textarea.focus({ preventScroll: true });
        const open = textarea.value.indexOf("[", insertAt);
        const close = open > -1 ? textarea.value.indexOf("]", open) : -1;
        if (open > -1 && close > open) {
          textarea.setSelectionRange(open, close + 1);
        } else {
          const end = textarea.value.length;
          textarea.setSelectionRange(end, end);
        }
      }
      if (status) {
        status.textContent = existing
          ? "Contoh pesan ditambahkan di bawah isi sebelumnya."
          : "Contoh pesan dimasukkan. Ganti bagian di dalam kurung.";
      }
    }

    buttons.forEach((button) =>
      button.addEventListener("click", () => apply(button)),
    );

    // Datang dari tautan di halaman lain (mis. Tentang Kami)
    const jenis = new URLSearchParams(window.location.search).get("jenis");
    const index = JENIS.indexOf(jenis);
    if (index > -1 && buttons[index] && !textarea.value.trim()) {
      apply(buttons[index], { fromLink: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();