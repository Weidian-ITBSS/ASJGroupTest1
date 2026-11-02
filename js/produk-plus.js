"use strict";
/* ==========================================================================
   PRODUK PLUS: membuat halaman katalog lebih mudah dijelajahi
   1. Produk Andalan: satu produk utama + empat pendamping (tanpa gerak otomatis)
   2. Rel kategori (menggantikan dropdown Kategori), tampil di header
   3. Bilah alat: filter Tanaman + jumlah produk + Urutkan dalam satu baris
   4. Judul kelompok per kategori di dalam grid + hitungan produk
   5. Kartu muncul bertahap saat di-scroll
   Semua memakai filter dan modal detail yang sudah ada di main.js, tanpa
   menggandakan logikanya. Dimuat SETELAH main.js.
   ========================================================================== */
(() => {
  const grid = document.getElementById("lotGrid");
  const products = window.ASJ_PRODUCTS;
  if (!grid || !Array.isArray(products)) return;
  const lots = [...grid.querySelectorAll(".lot")];
  if (!lots.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
  const make = (tag, className, html = "") => {
    const node = document.createElement(tag);
    node.className = className;
    node.innerHTML = html;
    return node;
  };

  const CATS = {
    herbisida: {
      label: "Herbisida",
      desc: "Mengendalikan gulma di kebun, sawah, dan lahan.",
    },
    insektisida: {
      label: "Insektisida",
      desc: "Melindungi tanaman dari hama serangga.",
    },
    fungisida: {
      label: "Fungisida",
      desc: "Mengendalikan penyakit tanaman akibat jamur.",
    },
    pupuk: {
      label: "Pupuk",
      desc: "Memenuhi kebutuhan hara agar tanaman tumbuh optimal.",
    },
    hayati: {
      label: "Hayati",
      desc: "Produk hayati pendukung kesehatan tanah dan tanaman.",
    },
    alat: { label: "Alat Semprot", desc: "Sprayer untuk aplikasi di lahan." },
    perlengkapan: {
      label: "Perlengkapan",
      desc: "Plastik mulsa, tali rafia, dan pendukung lahan.",
    },
  };

  const catBoxes = [
    ...document.querySelectorAll(
      '.filter-dropdown[data-dropdown="kategori"] input[type="checkbox"]',
    ),
  ];
  const cropBoxes = [
    ...document.querySelectorAll(
      '.filter-dropdown[data-dropdown="tanaman"] input[type="checkbox"]',
    ),
  ];
  const searchInput = document.getElementById("searchInput");
  let sortMode = "default";

  lots.forEach((lot, i) => {
    lot.dataset.pp = String(i);
  });

  /* ---------- 2. Rel kategori (di bawah kolom cari, di dalam header) ---------- */
  const counts = {};
  lots.forEach((lot) => {
    counts[lot.dataset.cat] = (counts[lot.dataset.cat] || 0) + 1;
  });
  const rail = make("div", "pp-rail");
  rail.setAttribute("role", "group");
  rail.setAttribute("aria-label", "Pilih kategori produk");
  [
    { value: "", label: "Semua produk", n: lots.length },
    ...Object.keys(CATS)
      .filter((key) => counts[key])
      .map((key) => ({ value: key, label: CATS[key].label, n: counts[key] })),
  ].forEach((item) => {
    const button = make(
      "button",
      "pp-cat",
      `${esc(item.label)} <small>${item.n}</small>`,
    );
    button.setAttribute("aria-label", `${item.label}, ${item.n} produk`);
    button.type = "button";
    button.dataset.value = item.value;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => pickCategory(item.value));
    rail.append(button);
  });
  const searchBox = document.querySelector(".search-box");
  (searchBox || grid).insertAdjacentElement(
    searchBox ? "afterend" : "beforebegin",
    rail,
  );
  const railButtons = [...rail.children];

  /** Memakai checkbox filter yang sudah ada, supaya state dan tag aktif ikut sinkron. */
  function pickCategory(value) {
    const on = catBoxes.filter((c) => c.checked);
    if (!value) return on.forEach((c) => c.click());
    if (on.length === 1 && on[0].value === value) return on[0].click();
    on.forEach((c) => c.value !== value && c.click());
    const target = catBoxes.find((c) => c.value === value);
    if (target && !target.checked) target.click();
  }

  /* ---------- 1. Produk Andalan ---------- */
  const band = document.getElementById("ppBand");
  let bandReady = false;

  const chipOf = (p) =>
    p.badge === "terlaris"
      ? ["Terlaris", ""]
      : p.badge === "promo"
        ? ["Promo", "is-promo"]
        : p.baru
          ? ["Baru", "is-baru"]
          : null;
  const photoHtml = (p) => {
    const chip = chipOf(p);
    return `<span class="pp-photo">${chip ? `<span class="pp-chip ${chip[1]}">${chip[0]}</span>` : ""}<img alt="" decoding="async" draggable="false" height="480" loading="lazy" src="${esc(p.foto)}" width="480" /></span>`;
  };

  function buildBand() {
    if (!band) return;
    const withPhoto = products.filter(
      (p) => p && p.nama && p.foto && CATS[p.kategori],
    );
    const picked = [];
    const add = (p) => p && !picked.includes(p) && picked.push(p);
    withPhoto.filter((p) => p.badge === "terlaris").forEach(add);
    withPhoto.filter((p) => p.badge).forEach(add);
    withPhoto.filter((p) => p.baru).forEach(add);
    Object.keys(CATS).forEach((key) =>
      add(withPhoto.find((p) => p.kategori === key)),
    );
    const items = picked.slice(0, 5);
    if (items.length < 3) return;
    const [lead, ...rest] = items;

    const leadHtml = `<button class="pp-feature" data-id="${esc(lead.id)}" type="button" aria-label="Lihat detail ${esc(lead.nama)}">
        ${photoHtml(lead)}
        <span class="pp-feature-body">
          <span class="lot-tag tag-${esc(lead.kategori)}">${esc(CATS[lead.kategori].label)}</span>
          <strong>${esc(lead.nama)}</strong>
          <span class="pp-active">${esc(lead.aktif || "")}</span>
          ${lead.ringkas ? `<span class="pp-desc">${esc(lead.ringkas)}</span>` : ""}
          <span class="pp-cta">Lihat detail <i aria-hidden="true">→</i></span>
        </span>
      </button>`;
    const miniHtml = rest
      .map(
        (
          p,
        ) => `<button class="pp-mini" data-id="${esc(p.id)}" type="button" aria-label="Lihat detail ${esc(p.nama)}">
        ${photoHtml(p)}
        <span class="pp-mini-body">
          <span class="lot-tag tag-${esc(p.kategori)}">${esc(CATS[p.kategori].label)}</span>
          <strong>${esc(p.nama)}</strong>
          <span class="pp-active">${esc(p.aktif || "")}</span>
          <span class="pp-cta">Lihat detail <i aria-hidden="true">→</i></span>
        </span>
      </button>`,
      )
      .join("");

    band.innerHTML = `<div class="wrap">
      <div class="pp-band-head">
        <div>
          <span class="section-kicker">Produk Andalan</span>
          <h2 id="ppBandTitle">Pilihan untuk memulai</h2>
          <p>Beberapa produk pilihan dari tiap kategori. Ketuk untuk melihat detail dan ukuran kemasan.</p>
        </div>
        <a class="pp-band-link" href="#katalog">Lihat semua ${lots.length} produk <span aria-hidden="true">↓</span></a>
      </div>
      <div class="pp-bento" role="group" aria-label="Produk andalan">${leadHtml}${miniHtml}</div>
    </div>`;

    // Klik kartu membuka modal detail yang sudah ada
    band.addEventListener("click", (event) => {
      const card = event.target.closest("[data-id]");
      if (!card) return;
      const lot = lots.find((l) =>
        l.querySelector(`.lot-add[data-id="${CSS.escape(card.dataset.id)}"]`),
      );
      lot?.querySelector(".lot-info-btn")?.click();
    });
    bandReady = true;
  }

  /* ---------- 4. Judul kelompok per kategori ---------- */
  function placeGroups() {
    grid.querySelectorAll(".pp-group").forEach((h) => h.remove());
    let last = "";
    [...grid.querySelectorAll(".lot")].forEach((lot) => {
      const cat = lot.dataset.cat;
      if (cat === last || !CATS[cat]) return;
      last = cat;
      const header = make(
        "div",
        "pp-group",
        `<span aria-hidden="true" class="pp-group-bar"></span><div><h2>${esc(CATS[cat].label)}</h2><p>${esc(CATS[cat].desc)}</p></div><span class="pp-group-count"></span>`,
      );
      header.dataset.group = cat;
      header.style.setProperty("--g", `var(--c-${cat}, var(--brand))`);
      lot.before(header);
    });
  }

  /* ---------- 3. Bilah alat: filter Tanaman + jumlah + urutkan ---------- */
  const toolbar = make(
    "div",
    "pp-toolbar",
    `<div class="pp-tools"></div>
     <div class="pp-meta">
       <p class="pp-count"><strong id="ppShown">${lots.length}</strong> produk ditampilkan</p>
       <label class="pp-sort"><span>Urutkan</span><select id="ppSort"><option value="default">Rekomendasi (per kategori)</option><option value="unggulan">Unggulan dulu</option><option value="az">Nama A–Z</option></select></label>
     </div>`,
  );
  const activeTags = document.getElementById("activeFilterTags");
  (activeTags || grid).insertAdjacentElement("beforebegin", toolbar);
  const saringBar = document.getElementById("saringBar");
  if (saringBar) toolbar.querySelector(".pp-tools").append(saringBar);

  const shownEl = toolbar.querySelector("#ppShown");
  const rank = (lot) =>
    lot.querySelector(".badge-terlaris")
      ? 0
      : lot.querySelector(".badge-promo")
        ? 1
        : lot.classList.contains("lot-new")
          ? 2
          : 3;
  const name = (lot) =>
    lot.querySelector(".lot-name")?.textContent.trim() || "";
  const byOrig = (a, b) => Number(a.dataset.pp) - Number(b.dataset.pp);
  const SORTERS = {
    default: byOrig,
    unggulan: (a, b) => rank(a) - rank(b) || byOrig(a, b),
    az: (a, b) => name(a).localeCompare(name(b), "id"),
  };
  toolbar.querySelector("#ppSort").addEventListener("change", (event) => {
    sortMode = event.target.value;
    grid.querySelectorAll(".pp-group").forEach((h) => h.remove());
    [...lots].sort(SORTERS[sortMode]).forEach((lot) => grid.appendChild(lot));
    if (sortMode === "default") placeGroups();
    refresh();
  });

  /* ---------- sinkron: dipanggil setiap filter berubah ---------- */
  let queued = false;
  function refresh() {
    queued = false;
    const visible = lots.filter((l) => !l.hidden);
    shownEl.textContent = visible.length;

    const perCat = {};
    visible.forEach((l) => {
      perCat[l.dataset.cat] = (perCat[l.dataset.cat] || 0) + 1;
    });
    grid.querySelectorAll(".pp-group").forEach((h) => {
      const n = perCat[h.dataset.group] || 0;
      const hide = sortMode !== "default" || n === 0;
      if (h.hidden !== hide) h.hidden = hide;
      h.querySelector(".pp-group-count").textContent = `${n} produk`;
    });

    const on = catBoxes.filter((c) => c.checked).map((c) => c.value);
    railButtons.forEach((b) => {
      const v = b.dataset.value;
      b.setAttribute(
        "aria-pressed",
        String(v === "" ? on.length === 0 : on.length === 1 && on[0] === v),
      );
    });

    if (band) {
      const filtering =
        on.length > 0 ||
        cropBoxes.some((c) => c.checked) ||
        Boolean(searchInput?.value.trim());
      const hide = filtering || !bandReady;
      if (band.hidden !== hide) band.hidden = hide;
    }
  }
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(refresh);
    }
  };
  new MutationObserver((records) => {
    if (records.some((r) => r.target.classList?.contains("lot"))) schedule();
  }).observe(grid, {
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"],
  });
  searchInput?.addEventListener("input", schedule);

  /* ---------- 5. Kartu muncul bertahap ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    document.documentElement.classList.add("pp-on");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          io.unobserve(target);
          target.classList.add("is-in");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );
    lots.forEach((lot) => io.observe(lot));
  }

  buildBand();
  placeGroups();
  refresh();
})();
