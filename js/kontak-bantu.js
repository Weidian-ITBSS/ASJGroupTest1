"use strict";
/* ==========================================================================
   DAFTAR "SIAPKAN INFO INI" (halaman Kontak)
   Mengetuk tombol menambahkan satu baris isian (mis. "Luas lahan: ") ke
   kolom Pesan di formulir. Tulisan yang sudah diketik pengunjung tidak
   ditimpa, dan baris yang sama tidak ditambahkan dua kali. Bila kolom Pesan
   diubah manual, status tombol ikut menyesuaikan.
   ========================================================================== */
(() => {
  const ta = document.getElementById("ms");
  const status = document.getElementById("prepStatus");
  const buttons = [...document.querySelectorAll(".prep-add")];
  const preview = document.getElementById("prepPreview"); // opsional
  if (!ta || !status || !buttons.length) {
    console.warn(
      "[ASJ] kontak-bantu.js: kolom Pesan (#ms), status (#prepStatus), atau tombol .prep-add tidak ditemukan.",
    );
    return;
  }

  // Baris kosong bawaan dari pilihan produk; digantikan oleh isian yang lebih rinci
  const DEFAULT_TAIL = "komoditas & luas lahan:";

  const labelOf = (btn) => btn.dataset.line.trim();
  const lines = () => ta.value.split("\n");
  const hasLine = (label) =>
    lines().some((l) => l.trim().toLowerCase().startsWith(label.toLowerCase()));

  function refresh() {
    if (preview) {
      const filled = ta.value.trim() !== "";
      preview.textContent = filled ? ta.value : "Masih kosong";
      preview.dataset.empty = String(!filled);
    }
    buttons.forEach((btn) => {
      const done = hasLine(labelOf(btn));
      btn.dataset.done = String(done);
      btn.textContent = done ? "Sudah ditambahkan ✓" : "Tambahkan";
    });
  }

  function add(btn) {
    const label = labelOf(btn);
    if (!hasLine(label)) {
      const kept = lines().filter(
        (l) => l.trim().toLowerCase() !== DEFAULT_TAIL,
      );
      const base = kept.join("\n").replace(/\n+$/, ""); // pertahankan spasi setelah titik dua
      ta.value = (base ? base + "\n" : "") + btn.dataset.line;
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
    refresh();
    status.textContent = "";
    status.append(`“${label.replace(/:$/, "")}” sudah ada di kolom Pesan. `);
    const link = document.createElement("a");
    link.href = "#ms";
    link.textContent = "Isi sekarang";
    status.append(link);
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => add(btn)));
  ta.addEventListener("input", refresh);
  refresh();
})();
