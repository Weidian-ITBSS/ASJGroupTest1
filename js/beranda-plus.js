/* ============================================================
   BERANDA PLUS
   1. Pencari solusi (tanaman + masalah -> kategori produk)
   2. Chip wilayah di bagian Area Layanan (dari js/locations.js)
   3. Animasi muncul saat di-scroll + hitung naik angka
   Semua bagian aman: kalau elemennya tidak ada, dilewati.
   ============================================================ */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

  /* ---------- 1. Pencari solusi ---------- */
  const CATEGORIES = {
    herbisida: {
      label: "Herbisida",
      desc: "Untuk mengendalikan gulma di lahan atau di sekitar tanaman.",
      usesCrop: true,
    },
    insektisida: {
      label: "Insektisida",
      desc: "Untuk mengendalikan hama serangga yang merusak tanaman.",
      usesCrop: true,
    },
    fungisida: {
      label: "Fungisida",
      desc: "Untuk mengendalikan penyakit tanaman yang disebabkan jamur.",
      usesCrop: true,
    },
    pupuk: {
      label: "Pupuk",
      desc: "Untuk memenuhi kebutuhan hara agar tanaman tumbuh optimal.",
      usesCrop: true,
    },
    alat: {
      label: "Alat Semprot",
      desc: "Sprayer dan alat semprot untuk aplikasi di lahan.",
      usesCrop: false,
    },
    hayati: {
      label: "Hayati",
      desc: "Produk hayati untuk mendukung kesehatan tanah dan tanaman.",
      usesCrop: true,
    },
    perlengkapan: {
      label: "Perlengkapan",
      desc: "Plastik mulsa, tali rafia, dan perlengkapan pendukung lahan.",
      usesCrop: false,
    },
  };

  const EMPTY_RESULT_HTML =
    '<p class="fr-empty"><strong>Rekomendasi muncul di sini.</strong>' +
    "Pilih tanaman, lalu masalah yang sedang dihadapi di kebun Anda.</p>";

  /**
   * Cari contoh produk. Utamakan data ASJ_PRODUCTS (tersedia di semua halaman
   * yang memuat produk-data.js), cadangannya kartu .lot yang ada di halaman.
   */
  function findFeaturedProduct(category, crop, usesCrop) {
    const products = Array.isArray(window.ASJ_PRODUCTS)
      ? window.ASJ_PRODUCTS
      : [];
    const inCategory = products.filter((p) => p?.kategori === category);
    const cropMatch =
      usesCrop && crop !== "semua"
        ? inCategory.find(
            (p) => Array.isArray(p.tanaman) && p.tanaman.includes(crop),
          )
        : null;
    const product = cropMatch || inCategory[0];
    if (product) {
      return {
        src: product.foto || "",
        name: product.nama,
        sub: product.aktif || "",
      };
    }

    const lot = document.querySelector(`.lot[data-cat="${category}"]`);
    const name = lot?.querySelector(".lot-name");
    if (!name) return null;
    return {
      src: lot.querySelector(".lot-media img")?.getAttribute("src") || "",
      name: name.textContent.trim(),
      sub: lot.querySelector(".lot-active")?.textContent.trim() || "",
    };
  }

  function initSolutionFinder() {
    const finder = document.getElementById("cari-solusi");
    const output = document.getElementById("finderResult");
    if (!finder || !output) return;

    const cropButtons = [...finder.querySelectorAll("[data-crop]")];
    const problemButtons = [...finder.querySelectorAll("[data-problem]")];
    const state = { crop: "semua", problem: "" };

    const setPressed = (buttons, activeButton) =>
      buttons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === activeButton)),
      );

    function render() {
      const category = CATEGORIES[state.problem];
      if (!category) {
        output.innerHTML = EMPTY_RESULT_HTML;
        return;
      }

      const problemButton = problemButtons.find(
        (b) => b.dataset.problem === state.problem,
      );
      const cropButton = cropButtons.find((b) => b.dataset.crop === state.crop);
      const problemLabel = (
        problemButton?.querySelector("strong")?.textContent || category.label
      ).trim();
      const cropLabel = (cropButton?.textContent || "Semua").trim();

      const useCrop = category.usesCrop && state.crop !== "semua";
      const href =
        `produk.html?kategori=${encodeURIComponent(state.problem)}` +
        (useCrop ? `&komoditas=${encodeURIComponent(state.crop)}` : "");
      const product = findFeaturedProduct(
        state.problem,
        state.crop,
        category.usesCrop,
      );

      output.innerHTML =
        `<p class="fr-eyebrow">${escapeHtml(problemLabel)} · ${escapeHtml(cropLabel)}</p>` +
        `<h3 class="fr-title">${escapeHtml(category.label)}</h3>` +
        `<p class="fr-desc">${escapeHtml(category.desc)}</p>` +
        (product
          ? `<a class="fr-product" href="${escapeHtml(href)}">` +
            (product.src
              ? `<img alt="" loading="lazy" src="${escapeHtml(product.src)}" />`
              : "") +
            `<span><small>Contoh produk</small><strong>${escapeHtml(product.name)}</strong>` +
            (product.sub ? `<small>${escapeHtml(product.sub)}</small>` : "") +
            `</span></a>`
          : "") +
        `<div class="fr-actions">` +
        `<a class="fr-btn fr-btn-main" href="${escapeHtml(href)}">Lihat ${escapeHtml(category.label)}${useCrop ? " untuk " + escapeHtml(cropLabel) : ""}</a>` +
        `<a class="fr-btn fr-btn-ghost" href="kontak.html">Tanya sales</a>` +
        `</div>` +
        `<p class="fr-note">Gunakan sesuai label &amp; anjuran. Ragu soal dosis atau kecocokan? Tanyakan dulu ke tim kami.</p>`;

      if (!prefersReducedMotion) {
        output.classList.remove("is-updating");
        void output.offsetWidth; // paksa reflow agar animasi bisa diulang
        output.classList.add("is-updating");
      }
    }

    cropButtons.forEach((button) =>
      button.addEventListener("click", () => {
        state.crop = button.dataset.crop;
        setPressed(cropButtons, button);
        render();
      }),
    );
    problemButtons.forEach((button) =>
      button.addEventListener("click", () => {
        state.problem = button.dataset.problem;
        setPressed(problemButtons, button);
        render();
      }),
    );
    render();
  }

  /* ---------- 2. Chip wilayah (Area Layanan) ---------- */
  function initRegionChips() {
    const teaser = document.querySelector("#layanan .teaser-intro p");
    const branches = window.ASJ_LOCATIONS?.branches ?? [];
    const areas = branches.filter((r) => r.id !== "lainnya" && r.label);
    if (!teaser || !areas.length) return;

    const list = document.createElement("ul");
    list.className = "region-chips";
    list.setAttribute("aria-label", "Wilayah layanan");

    const fragment = document.createDocumentFragment();
    areas.forEach((region) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "layanan.html";
      link.textContent = region.label;
      item.appendChild(link);
      fragment.appendChild(item);
    });
    list.appendChild(fragment);
    teaser.insertAdjacentElement("afterend", list);
  }

  /** Isi jumlah wilayah layanan: <strong data-wilayah>12</strong> */
  function initRegionCount() {
    const branches = window.ASJ_LOCATIONS?.branches ?? [];
    const total = branches.filter((r) => r.id !== "lainnya" && r.label).length;
    if (!total) return;
    document.querySelectorAll("[data-wilayah]").forEach((el) => {
      el.textContent = total;
    });
  }

  /* ---------- 3. Animasi saat di-scroll ---------- */
  const REVEAL_SELECTOR = [
    "main .section-head",
    ".about-story > *",
    "#cari-solusi .finder-grid > *",
    "#cara-pesan .step",
    "#aman .safe-card",
    "#aman .safe-note",
    "#testimoni .testi-card",
    ".teaser-row",
    ".region-chips li",
    ".about-stat",
    ".aud-card",
    ".line-card",
    ".principle",
  ].join(",");
  const REVEAL_STAGGER_MS = 90;
  const REVEAL_MAX_STEPS = 5;
  const REVEAL_CLEANUP_MS = 1100;
  const COUNT_UP_MS = 900;

  function initReveal() {
    document.documentElement.classList.add("rv");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          target.classList.add("in");
          // Lepas kelas animasi supaya hover/transition bawaan elemen kembali normal
          setTimeout(
            () => target.classList.remove("reveal", "in"),
            REVEAL_CLEANUP_MS,
          );
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    // Urutan stagger dihitung per induk dalam satu putaran (bukan O(n²))
    const stepByParent = new Map();
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      const step = stepByParent.get(el.parentElement) ?? 0;
      stepByParent.set(el.parentElement, step + 1);
      el.style.setProperty(
        "--d",
        `${Math.min(step, REVEAL_MAX_STEPS) * REVEAL_STAGGER_MS}ms`,
      );
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /** Hitung naik: angka di strip hero dan kategori (mis. "05" atau "120+") */
  function initCountUp() {
    const counters = document.querySelectorAll(
      ".hero-stats strong, .cat-count",
    );
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);

          const match = target.textContent.trim().match(/^(\d+)(\+?)$/);
          if (!match) return;
          const [, digits, suffix] = match;
          const finalValue = parseInt(digits, 10);
          const startTime = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - startTime) / COUNT_UP_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            target.textContent =
              String(Math.round(finalValue * eased)).padStart(
                digits.length,
                "0",
              ) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => observer.observe(el));
  }

  initSolutionFinder();
  initRegionChips();
  initRegionCount();

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    initReveal();
    initCountUp();
  }
})();
