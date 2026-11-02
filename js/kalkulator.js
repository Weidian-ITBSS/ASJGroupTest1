"use strict";
/* Kalkulator Kebutuhan Kemasan.
 * PENTING: alat ini TIDAK menghitung dosis/takaran aplikasi pestisida atau
 * pupuk per hektar. Itu wajib mengikuti label resmi produk yang sudah
 * teregistrasi Kementan, bukan angka yang dihasilkan situs ini.
 * Alat ini murni membantu menghitung kombinasi kemasan (mis. "4 L / 5 L")
 * yang paling pas dibeli dari TOTAL volume/berat yang sudah diketahui
 * pengguna sendiri, supaya tidak beli kurang atau kebanyakan sisa.
 */
(() => {
  /** Faktor ke satuan dasar: ml untuk cairan, g untuk padatan. */
  const UNITS = {
    l: { base: "ml", factor: 1000 },
    ml: { base: "ml", factor: 1 },
    kg: { base: "g", factor: 1000 },
    g: { base: "g", factor: 1 },
    gr: { base: "g", factor: 1 }, // penulisan umum di label kemasan
  };
  const PACK_SIZE_PATTERN = /^(\d+(?:[.,]\d+)?)\s*(l|ml|kg|gr|g)$/;
  const MAX_INPUT = 100000; // L atau kg
  const MAX_DP_STATES = 5_000_000; // batas memori/waktu perhitungan
  const UNREACHABLE = 0x7fffffff;

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  /** "1 L / 5 L" -> { sizes: [{label, value}], baseUnit } atau null bila tidak baku. */
  function parsePackSizes(text) {
    const sizes = [];
    let baseUnit = null;

    for (const part of String(text)
      .split("/")
      .map((p) => p.trim())) {
      const match = part.toLowerCase().match(PACK_SIZE_PATTERN);
      if (!match) return null;

      const amount = parseFloat(match[1].replace(",", "."));
      if (!Number.isFinite(amount) || amount <= 0) return null;

      const unit = UNITS[match[2]];
      if (baseUnit === null) baseUnit = unit.base;
      else if (baseUnit !== unit.base) return null; // campur cair & padat

      // Bulatkan ke satuan dasar utuh agar perhitungan bebas galat desimal
      const value = Math.round(amount * unit.factor);
      if (value <= 0) return null;
      sizes.push({ label: part, value });
    }
    return sizes.length ? { sizes, baseUnit } : null;
  }

  /** Ambil nama + kemasan dari data produk; cadangannya dari kartu .lot di halaman. */
  function readRawProducts() {
    if (Array.isArray(window.ASJ_PRODUCTS)) {
      return window.ASJ_PRODUCTS.filter((p) => p?.nama).map((p) => ({
        name: String(p.nama).trim(),
        pack: typeof p.kemasan === "string" ? p.kemasan.trim() : "",
      }));
    }

    return [...document.querySelectorAll(".lot")].flatMap((lot) => {
      const name = lot.querySelector(".lot-name")?.textContent.trim();
      const packSpec = [...lot.querySelectorAll(".lot-specs > div")].find(
        (spec) =>
          spec.querySelector("dt")?.textContent.trim().toLowerCase() ===
          "kemasan",
      );
      const pack = packSpec?.querySelector("dd")?.textContent.trim();
      return name && pack ? [{ name, pack }] : [];
    });
  }

  function buildCatalog() {
    return readRawProducts().flatMap(({ name, pack }) => {
      const parsed = parsePackSizes(pack);
      // Satuan bukan L/ml/kg/g baku -> dilewati
      return parsed
        ? [{ name, unit: parsed.baseUnit, sizes: parsed.sizes }]
        : [];
    });
  }

  /**
   * Cari kombinasi kemasan dengan total >= target, dengan SISA paling sedikit;
   * di antara opsi dengan sisa sama, pilih jumlah kemasan paling sedikit.
   * Ukuran dibagi FPB (gcd) dulu supaya tabel DP kecil walau target besar
   * (mis. 100.000 L dengan kemasan 1 L / 5 L = 100.000 langkah, bukan 100 juta).
   */
  function findBestCombo(sizes, targetBase) {
    if (!(targetBase > 0)) return null;

    const step = sizes.map((s) => s.value).reduce(gcd);
    const unitSizes = sizes.map((s) => s.value / step);
    const targetUnits = Math.ceil(Number((targetBase / step).toFixed(6)));
    const limit = targetUnits + Math.max(...unitSizes);
    if (limit > MAX_DP_STATES) return null;

    const minCount = new Int32Array(limit + 1).fill(UNREACHABLE);
    const lastChoice = new Int16Array(limit + 1).fill(-1);
    minCount[0] = 0;

    for (let v = 1; v <= limit; v++) {
      for (let i = 0; i < unitSizes.length; i++) {
        const prev = v - unitSizes[i];
        if (prev < 0 || minCount[prev] === UNREACHABLE) continue;
        if (minCount[prev] + 1 < minCount[v]) {
          minCount[v] = minCount[prev] + 1;
          lastChoice[v] = i;
        }
      }
    }

    let bestUnits = -1;
    for (let v = targetUnits; v <= limit; v++) {
      if (minCount[v] !== UNREACHABLE) {
        bestUnits = v;
        break;
      }
    }
    if (bestUnits === -1) return null;

    const counts = new Array(sizes.length).fill(0);
    for (let v = bestUnits; v > 0 && lastChoice[v] !== -1; ) {
      counts[lastChoice[v]]++;
      v -= unitSizes[lastChoice[v]];
    }

    const total = bestUnits * step;
    return {
      total,
      excess: Math.round((total - targetBase) * 1e6) / 1e6,
      items: sizes
        .map((size, i) => ({ size, count: counts[i] }))
        .filter((item) => item.count > 0),
    };
  }

  function formatAmount(value, baseUnit) {
    const isLiquid = baseUnit === "ml";
    const [bigUnit, smallUnit] = isLiquid ? ["L", "ml"] : ["kg", "g"];
    const format = (n) =>
      n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
    return value >= 1000
      ? `${format(value / 1000)} ${bigUnit}`
      : `${format(value)} ${smallUnit}`;
  }

  // Dibuka agar fungsi murni bisa diuji dari Console
  window.ASJ_PACK_CALC = { parsePackSizes, findBestCombo };

  function init() {
    const openButton = document.getElementById("openPackCalc");
    const dialog = document.getElementById("packCalcDialog");
    if (!openButton || !dialog) return; // halaman tanpa kalkulator

    const closeButton = document.getElementById("packCalcClose");
    const select = document.getElementById("packCalcProduct");
    const amountInput = document.getElementById("packCalcAmount");
    const unitLabel = document.getElementById("packCalcUnit");
    const submitButton = document.getElementById("packCalcSubmit");
    const resultBox = document.getElementById("packCalcResult");

    let catalog = null; // dibangun saat pertama kali dibuka

    function ensureCatalog() {
      if (catalog) return;
      catalog = buildCatalog();
      const fragment = document.createDocumentFragment();
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "— Pilih produk —";
      fragment.append(placeholder);
      catalog.forEach((product, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = product.name;
        fragment.append(option);
      });
      select.replaceChildren(fragment);
    }

    const selectedProduct = () =>
      select.value === "" ? null : catalog[Number(select.value)];

    function clearResult() {
      resultBox.hidden = true;
      resultBox.replaceChildren();
    }

    function showError(message) {
      const p = document.createElement("p");
      p.className = "pack-calc-error";
      p.textContent = message;
      resultBox.replaceChildren(p);
      resultBox.hidden = false;
    }

    function updateUnitLabel() {
      clearResult();
      const product = selectedProduct();
      unitLabel.textContent = product
        ? product.unit === "ml"
          ? "Liter"
          : "Kilogram"
        : "—";
    }

    function calculate() {
      clearResult();
      const product = selectedProduct();
      if (!product) return showError("Pilih produk terlebih dahulu.");

      const amount = parseFloat(String(amountInput.value).replace(",", "."));
      if (!Number.isFinite(amount) || amount <= 0) {
        return showError(
          "Masukkan jumlah kebutuhan yang valid (lebih dari 0).",
        );
      }
      if (amount > MAX_INPUT) {
        return showError(
          "Jumlah terlalu besar. Untuk kebutuhan skala ini, hubungi sales kami langsung via WhatsApp.",
        );
      }

      // 1 L = 1000 ml dan 1 kg = 1000 g: satu faktor untuk kedua jenis satuan.
      // toFixed menghindari galat floating point (mis. 1.1 * 1000 = 1100.0000000000002)
      const targetBase = Number((amount * 1000).toFixed(6));
      const combo = findBestCombo(product.sizes, targetBase);
      if (!combo) {
        return showError(
          "Tidak ditemukan kombinasi yang pas. Coba jumlah lain atau hubungi sales kami.",
        );
      }

      const rows = combo.items
        .map(
          ({ count, size }) =>
            `<li><strong>${count}×</strong> kemasan ${escapeHtml(size.label)}</li>`,
        )
        .join("");
      const excessText =
        combo.excess > 0
          ? `(kelebihan sekitar ${formatAmount(combo.excess, product.unit)})`
          : "(pas, tanpa sisa)";

      resultBox.innerHTML = `
        <p class="pack-calc-summary">Rekomendasi belanja untuk <strong>${escapeHtml(product.name)}</strong>:</p>
        <ul class="pack-calc-list">${rows}</ul>
        <p class="pack-calc-meta">Total kemasan: ${formatAmount(combo.total, product.unit)} ${excessText}</p>
        <p class="pack-calc-disclaimer">
          Ini bukan rekomendasi dosis aplikasi. Pastikan total kebutuhan Anda
          sudah sesuai anjuran label produk atau penyuluh pertanian sebelum
          menghitung kemasan di atas.
        </p>`;
      resultBox.hidden = false;
    }

    openButton.addEventListener("click", () => {
      ensureCatalog();
      updateUnitLabel();
      if (!dialog.open) dialog.showModal();
    });
    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;
      if (isOutside) dialog.close();
    });
    select.addEventListener("change", updateUnitLabel);
    submitButton.addEventListener("click", calculate);
    amountInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        calculate();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
