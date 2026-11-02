"use strict";
/* ==========================================================================
   PEMBUAT KATALOG — membaca js/produk-data.js lalu membuat:
   kartu produk, jumlah produk, dan data terstruktur (SEO).
   File ini TIDAK perlu diedit saat menambah atau mengubah produk.
   Harus dimuat SEBELUM main.js.
   ========================================================================== */
(() => {
  const grid = document.getElementById("lotGrid");
  if (!grid) return;

  const products = window.ASJ_PRODUCTS;
  if (!Array.isArray(products)) {
    console.error(
      "[ASJ] Daftar produk tidak ditemukan. Pastikan js/produk-data.js dimuat sebelum produk-render.js.",
    );
    grid.innerHTML =
      '<p class="catalog-error">Katalog belum dapat ditampilkan. Silakan muat ulang halaman atau hubungi kami.</p>';
    return;
  }

  const PLACEHOLDER_IMG = "images/Placeholder/product.svg";
  const IMG_SIZE = 480;

  const CATEGORIES = {
    herbisida: { label: "Herbisida", specLabel: "Klasifikasi" },
    insektisida: { label: "Insektisida", specLabel: "Klasifikasi" },
    fungisida: { label: "Fungisida", specLabel: "Klasifikasi" },
    pupuk: { label: "Pupuk", specLabel: "Klasifikasi" },
    hayati: { label: "Hayati", specLabel: "Jenis" },
    alat: { label: "Alat Semprot", specLabel: "Klasifikasi" },
    perlengkapan: { label: "Perlengkapan", specLabel: "Klasifikasi" },
  };

  const CROPS = {
    sawit: "Kelapa sawit",
    padi: "Padi",
    jagung: "Jagung",
    kopi: "Kopi",
    karet: "Karet",
    hortikultura: "Hortikultura",
  };

  const BADGES = { terlaris: "Terlaris", promo: "Promo" };

  const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

  const toText = (value) => (typeof value === "string" ? value.trim() : "");
  const toList = (value) =>
    Array.isArray(value) ? value.map(toText).filter(Boolean) : [];

  /* ---------- Validasi ringan: peringatan di Console, tidak menghentikan halaman ---------- */
  const seenIds = new Set();
  const seenNumbers = new Set();

  /** Hasil: [{ product, number }] — nomor dihitung sekali dari posisi aslinya. */
  const catalog = [];
  products.forEach((product, index) => {
    const label = product?.nama ? `"${product.nama}"` : `#${index + 1}`;

    // Baris template kosong (nama & kategori belum diisi) dilewati tanpa peringatan
    if (product && !toText(product.nama) && !toText(product.kategori)) return;

    if (
      !product ||
      !product.id ||
      !product.nama ||
      !CATEGORIES[product.kategori]
    ) {
      console.warn(
        `[ASJ] Produk ${label} dilewati: id, nama, dan kategori yang valid wajib diisi.`,
      );
      return;
    }

    if (seenIds.has(product.id)) {
      console.warn(
        `[ASJ] id "${product.id}" dipakai lebih dari satu produk (${label}).`,
      );
    }
    seenIds.add(product.id);

    const number = String(product.no || index + 1);
    const numberKey = number.toLowerCase();
    if (seenNumbers.has(numberKey)) {
      console.warn(
        `[ASJ] no "${number}" dipakai lebih dari satu produk (${label}).`,
      );
    }
    seenNumbers.add(numberKey);

    toList(product.tanaman).forEach((crop) => {
      if (!CROPS[crop]) {
        console.warn(
          `[ASJ] ${label}: kunci tanaman "${crop}" tidak dikenal. Pilihan: ${Object.keys(CROPS).join(", ")}.`,
        );
      }
    });

    catalog.push({ product, number });
  });

  /* ---------- Kartu produk ---------- */
  function buildCardHtml({ product: p, number }) {
    const category = CATEGORIES[p.kategori];
    const crops = toList(p.tanaman);
    const hasPhoto = Boolean(toText(p.foto));
    const pack = toText(p.kemasan) || "—";
    const keywords = Array.isArray(p.kataKunci) ? p.kataKunci : [p.kataKunci];
    const searchText = [
      p.nama,
      p.aktif,
      category.label,
      ...crops.map((c) => CROPS[c] || c),
      ...keywords,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const badge = BADGES[p.badge]
      ? `<span class="lot-badge badge-${escapeHtml(p.badge)}">${escapeHtml(BADGES[p.badge])}</span>`
      : "";

    return `
<article class="lot${p.baru ? " lot-new" : ""}" data-cat="${escapeHtml(p.kategori)}" data-search="${escapeHtml(searchText)}"${crops.length ? ` data-commodity="${escapeHtml(crops.join(" "))}"` : ""}>
  ${badge}
  <div class="lot-num">No. ${escapeHtml(number)}</div>
  <div aria-label="${hasPhoto ? "Perbesar gambar" : "Perbesar ilustrasi"} ${escapeHtml(p.nama)}" class="lot-media${hasPhoto ? "" : " lot-media-placeholder"}" role="button" tabindex="0">
    <img alt="${hasPhoto ? "" : "Ilustrasi sementara "}${escapeHtml(p.nama)}" decoding="async" height="${IMG_SIZE}" loading="lazy" src="${escapeHtml(hasPhoto ? p.foto : PLACEHOLDER_IMG)}" width="${IMG_SIZE}" />
  </div>
  <div class="lot-body">
    <span class="lot-tag tag-${escapeHtml(p.kategori)}">${escapeHtml(category.label)}</span>
    <h3 class="lot-name">${escapeHtml(p.nama)}</h3>
    <p class="lot-active">${escapeHtml(p.aktif)}</p>
    ${toText(p.noReg) ? `<p class="lot-reg">No. Reg. RI: ${escapeHtml(toText(p.noReg))}</p>` : ""}
    <dl class="lot-specs">
      <div><dt>${escapeHtml(category.specLabel)}</dt><dd>${escapeHtml(toText(p.klasifikasi) || "—")}</dd></div>
      <div><dt>Kemasan</dt><dd>${escapeHtml(pack)}</dd></div>
    </dl>
    <p class="lot-desc">${escapeHtml(p.ringkas)}</p>
    <button aria-haspopup="dialog" class="lot-info-btn" type="button">Lihat detail produk</button>
    <div class="lot-actions">
      <div class="qty-stepper">
        <button aria-label="Kurangi jumlah" class="qty-btn" data-step="-1" type="button">−</button>
        <span class="qty-val" data-qty="1">1</span>
        <button aria-label="Tambah jumlah" class="qty-btn" data-step="1" type="button">+</button>
      </div>
      <button class="lot-add" data-id="${escapeHtml(p.id)}" data-name="${escapeHtml(p.nama)}" data-pack="${escapeHtml(pack)}" type="button">Tambah ke Pesanan</button>
    </div>
  </div>
</article>`;
  }

  grid.innerHTML = catalog.length
    ? catalog.map(buildCardHtml).join("")
    : '<p class="catalog-error">Belum ada produk yang dapat ditampilkan. Silakan hubungi kami untuk informasi produk.</p>';

  /* ---------- Jumlah produk ---------- */
  ["lotCount", "lotTotal"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = catalog.length;
  });

  /* ---------- Data terstruktur (SEO) ---------- */
  try {
    const canonical = document.querySelector('link[rel="canonical"]');
    const pageUrl = canonical
      ? canonical.href
      : location.origin + location.pathname;

    const slugify = (s) =>
      String(s)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const productUrl = (number) => {
      const url = new URL(pageUrl);
      url.search = "";
      url.hash = "";
      url.searchParams.set("produk", number);
      return url.href;
    };

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Katalog Produk ASJ Group",
      itemListElement: catalog.map(({ product: p, number }, idx) => {
        const item = {
          "@type": "Product",
          name: p.nama,
          category: CATEGORIES[p.kategori].label,
          description: toText(p.ringkas),
          sku: slugify(p.nama),
          brand: { "@type": "Brand", name: "ASJ Group" },
          url: productUrl(number),
        };
        // new URL menangani path relatif maupun berawalan "/" tanpa "//" ganda
        if (toText(p.foto)) item.image = new URL(p.foto, pageUrl).href;
        return { "@type": "ListItem", position: idx + 1, item };
      }),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  } catch (err) {
    console.warn("[ASJ] Data terstruktur tidak dibuat:", err);
  }
})();
