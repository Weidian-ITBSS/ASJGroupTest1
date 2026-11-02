document.addEventListener("DOMContentLoaded", () => {
  const SALES_REGIONS = window.ASJ_LOCATIONS?.branches || [];

  function getRegionById(id) {
    return SALES_REGIONS.find((r) => r.id === id) || null;
  }

  /** Acak merata (Fisher-Yates), tidak mengubah array asli. */
  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* ---------- 0. SHIMMER LOADING GAMBAR PRODUK ---------- */
  document.querySelectorAll(".lot-media img").forEach((img) => {
    const media = img.closest(".lot-media");
    if (!media) return;
    const markLoaded = () => media.classList.add("is-loaded");
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });

  /* ---------- 1. FILTERS & SEARCH KATALOG ---------- */
  /* Dropdown "Saring berdasarkan: Kategori / Tanaman" — checkbox, boleh
     pilih lebih dari satu. Cocok kategori: ATAU antar kategori yang
     dicentang. Cocok tanaman: ATAU antar tanaman yang dicentang. Antara
     kategori & tanaman & kata kunci pencarian: DAN (semua harus cocok). */
  const dropdowns = document.querySelectorAll(".filter-dropdown");
  const lots = document.querySelectorAll(".lot");
  const countEl = document.getElementById("lotCount");
  const searchInput = document.getElementById("searchInput");
  const resetBtn = document.querySelector(".saring-reset");
  const tagsBox = document.getElementById("activeFilterTags");

  const selected = { kategori: new Set(), tanaman: new Set() };

  const LABELS = {
    kategori: {
      herbisida: "Herbisida",
      insektisida: "Insektisida",
      fungisida: "Fungisida",
      pupuk: "Pupuk",
      hayati: "Hayati",
      alat: "Alat Semprot",
      perlengkapan: "Perlengkapan",
    },
    tanaman: {
      sawit: "Sawit",
      padi: "Padi",
      jagung: "Jagung",
      kopi: "Kopi",
      karet: "Karet",
      hortikultura: "Hortikultura",
    },
  };

  // Data filter tiap kartu dibaca & di-lowercase sekali, bukan di setiap ketikan
  const lotFilterData = new Map();
  function getLotFilterData(lot) {
    let data = lotFilterData.get(lot);
    if (!data) {
      data = {
        cat: (lot.dataset.cat || "").toLowerCase(),
        searchData: (lot.dataset.search || "").toLowerCase(),
        commodities: (lot.dataset.commodity || "")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean),
      };
      lotFilterData.set(lot, data);
    }
    return data;
  }

  function runFilter() {
    const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    let visibleCount = 0;

    lots.forEach((lot) => {
      const { cat, searchData, commodities } = getLotFilterData(lot);

      const matchCat =
        selected.kategori.size === 0 || selected.kategori.has(cat);
      const matchSearch = !q || searchData.includes(q);
      const matchCommodity =
        selected.tanaman.size === 0 ||
        commodities.some((k) => selected.tanaman.has(k));
      const isVisible = matchCat && matchSearch && matchCommodity;

      if (isVisible) {
        lot.removeAttribute("hidden");
        lot.style.display = "";
        visibleCount++;
      } else {
        lot.setAttribute("hidden", "");
        lot.style.setProperty("display", "none", "important");
      }
    });

    if (countEl) {
      countEl.textContent = visibleCount;
    }
  }

  function closeDropdown(dd) {
    const btn = dd.querySelector(".filter-dropdown-btn");
    const panel = dd.querySelector(".filter-dropdown-panel");
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  }

  function openDropdown(dd) {
    dropdowns.forEach((other) => {
      if (other !== dd) closeDropdown(other);
    });
    const btn = dd.querySelector(".filter-dropdown-btn");
    const panel = dd.querySelector(".filter-dropdown-panel");
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", "true");
    panel.hidden = false;
  }

  function syncDropdownUI(dd, key) {
    const btn = dd.querySelector(".filter-dropdown-btn");
    const badge = dd.querySelector(".filter-dropdown-count");
    const n = selected[key].size;
    if (btn) btn.classList.toggle("has-value", n > 0);
    if (badge) {
      badge.hidden = n === 0;
      badge.textContent = String(n);
    }
  }

  function syncActiveTags() {
    if (!tagsBox) return;
    const tags = [];
    ["kategori", "tanaman"].forEach((key) => {
      selected[key].forEach((v) => {
        tags.push({ key, value: v, label: LABELS[key][v] || v });
      });
    });
    tagsBox.hidden = tags.length === 0;
    tagsBox.innerHTML = tags
      .map(
        (t) =>
          `<button class="active-filter-tag" data-key="${t.key}" data-value="${t.value}" type="button">${t.label}<span aria-hidden="true">&times;</span></button>`,
      )
      .join("");
    if (resetBtn) resetBtn.hidden = tags.length === 0;
  }

  function afterSelectionChange() {
    dropdowns.forEach((dd) => {
      const key = dd.dataset.dropdown;
      if (key) syncDropdownUI(dd, key);
    });
    syncActiveTags();
    runFilter();
  }

  function setChecked(key, value, checked) {
    if (checked) selected[key].add(value);
    else selected[key].delete(value);
    document
      .querySelectorAll(
        `.filter-dropdown[data-dropdown="${key}"] input[type="checkbox"][value="${value}"]`,
      )
      .forEach((cb) => (cb.checked = checked));
  }

  dropdowns.forEach((dd) => {
    const key = dd.dataset.dropdown;
    const btn = dd.querySelector(".filter-dropdown-btn");
    const panel = dd.querySelector(".filter-dropdown-panel");
    if (!key || !btn || !panel) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) closeDropdown(dd);
      else openDropdown(dd);
    });

    panel.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        setChecked(key, cb.value, cb.checked);
        afterSelectionChange();
      });
    });

    const clearBtn = panel.querySelector(".filter-dropdown-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        [...selected[key]].forEach((v) => setChecked(key, v, false));
        afterSelectionChange();
      });
    }

    const applyBtn = panel.querySelector(".filter-dropdown-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => closeDropdown(dd));
    }
  });

  document.addEventListener("click", (e) => {
    dropdowns.forEach((dd) => {
      if (!dd.contains(e.target)) closeDropdown(dd);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dropdowns.forEach(closeDropdown);
  });

  if (tagsBox) {
    tagsBox.addEventListener("click", (e) => {
      const tag = e.target.closest(".active-filter-tag");
      if (!tag) return;
      setChecked(tag.dataset.key, tag.dataset.value, false);
      afterSelectionChange();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      ["kategori", "tanaman"].forEach((key) => {
        [...selected[key]].forEach((v) => setChecked(key, v, false));
      });
      afterSelectionChange();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", runFilter);
  }

  if (dropdowns.length) {
    /* Tautan dari luar, mis. produk.html?kategori=herbisida&komoditas=sawit
       (dipakai pencari solusi di beranda), pra-centang checkbox terkait. */
    const params = new URLSearchParams(window.location.search);
    (params.get("kategori") || "")
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v && LABELS.kategori[v])
      .forEach((v) => setChecked("kategori", v, true));
    (params.get("komoditas") || "")
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v && LABELS.tanaman[v])
      .forEach((v) => setChecked("tanaman", v, true));
    afterSelectionChange();
  } else {
    runFilter();
  }

  /* ---------- 2. SMOOTH SCROLL DENGAN ANIMASI HALUS ---------- */
  const navLinks = document.querySelectorAll(
    "nav.main-nav a, .mobile-drawer nav a",
  );
  const mobileDrawer = document.getElementById("mobileDrawer");
  let activeScrollAnimation = null;

  function cancelScrollAnimation() {
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }
  }

  window.addEventListener("wheel", cancelScrollAnimation, { passive: true });
  window.addEventListener("touchstart", cancelScrollAnimation, {
    passive: true,
  });

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  function smoothScrollTo(targetPosition, duration) {
    cancelScrollAnimation();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetPosition);
      return;
    }
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(
        timeElapsed,
        startPosition,
        distance,
        duration,
      );
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        activeScrollAnimation = requestAnimationFrame(animation);
      } else {
        activeScrollAnimation = null;
      }
    }

    activeScrollAnimation = requestAnimationFrame(animation);
  }

  const anchorLinks = document.querySelectorAll('a[href*="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const path = href.substring(0, hashIndex);
      const targetId = href.substring(hashIndex);
      const isCurrentPage =
        !path ||
        path === "index.html" ||
        window.location.pathname.endsWith(path) ||
        (window.location.pathname === "/" && path === "index.html");

      if (isCurrentPage && targetId !== "#") {
        const targetSection = document.getElementById(targetId.slice(1));
        if (targetSection) {
          e.preventDefault();

          const header = document.querySelector(".site-header");
          const headerHeight = header ? header.offsetHeight : 70;
          const targetPosition =
            targetSection.getBoundingClientRect().top +
            window.pageYOffset -
            (headerHeight + 12);

          smoothScrollTo(targetPosition, 750);

          navLinks.forEach((l) => {
            const lHref = l.getAttribute("href") || "";
            l.classList.toggle("active", lHref.includes(targetId));
          });

          if (mobileDrawer && mobileDrawer.classList.contains("open")) {
            mobileDrawer.classList.remove("open");
          }
        }
      }
    });
  });

  // ScrollSpy — dibatasi sekali per frame agar tidak memaksa layout berulang-ulang
  const spySections = document.querySelectorAll("section[id]");
  if (spySections.length) {
    let spyQueued = false;
    const updateScrollSpy = () => {
      spyQueued = false;
      const scrollY = window.pageYOffset;
      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 70;

      spySections.forEach((current) => {
        const sectionTop = current.offsetTop - (headerHeight + 35);
        const sectionId = current.getAttribute("id");
        if (
          scrollY > sectionTop &&
          scrollY <= sectionTop + current.offsetHeight
        ) {
          navLinks.forEach((link) => {
            const linkHref = link.getAttribute("href") || "";
            link.classList.toggle("active", linkHref.includes(`#${sectionId}`));
          });
        }
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (spyQueued) return;
        spyQueued = true;
        requestAnimationFrame(updateScrollSpy);
      },
      { passive: true },
    );
  }

  /* ---------- 3. MOBILE DRAWER ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const drawerClose = document.getElementById("drawerClose");

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener("click", () => {
      mobileDrawer.classList.add("open");
    });
  }

  if (drawerClose && mobileDrawer) {
    drawerClose.addEventListener("click", () => {
      mobileDrawer.classList.remove("open");
    });
  }

  /* ---------- 4. SLIDER KATALOG DENGAN DRAG MOUSE ---------- */
  const lotGrid = document.getElementById("lotGrid");
  const btnPrev = document.getElementById("slidePrev");
  const btnNext = document.getElementById("slideNext");

  if (lotGrid && btnPrev && btnNext) {
    btnNext.addEventListener("click", () => {
      lotGrid.scrollBy({ left: 370, behavior: "smooth" });
    });
    btnPrev.addEventListener("click", () => {
      lotGrid.scrollBy({ left: -370, behavior: "smooth" });
    });
  }

  if (lotGrid) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDraggingMotion = false;

    lotGrid.addEventListener("mousedown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      isDown = true;
      isDraggingMotion = false;
      lotGrid.classList.add("is-dragging");
      startX = e.pageX - lotGrid.offsetLeft;
      scrollLeft = lotGrid.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      lotGrid.classList.remove("is-dragging");
    });

    lotGrid.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - lotGrid.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) {
        isDraggingMotion = true;
      }
      lotGrid.scrollLeft = scrollLeft - walk;
    });

    lotGrid.addEventListener(
      "click",
      (e) => {
        if (isDraggingMotion) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
  }

  /* ---------- 5. QTY STEPPER ---------- */
  document.querySelectorAll(".lot .qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".qty-stepper");
      const val = wrap.querySelector(".qty-val");
      const step = parseInt(btn.dataset.step, 10);
      const next = Math.max(1, (parseInt(val.dataset.qty, 10) || 1) + step);
      val.dataset.qty = next;
      val.textContent = next;
    });
  });

  /* ---------- 6. ORDER CART & LOCALSTORAGE ---------- */
  const CART_KEY = "asj_cart_v1";
  let cart = {};

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      cart = Object.fromEntries(
        Object.entries(
          parsed && typeof parsed === "object" ? parsed : {},
        ).filter(
          ([id, item]) =>
            id !== "undefined" &&
            item &&
            typeof item.name === "string" &&
            typeof item.pack === "string" &&
            Number.isInteger(item.qty) &&
            item.qty > 0,
        ),
      );
    } catch (e) {
      cart = {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  function cartCount() {
    let n = 0;
    Object.keys(cart).forEach((k) => {
      n += cart[k].qty;
    });
    return n;
  }

  function buildWaLink() {
    const sendBtn = document.getElementById("cartSendBtn");
    if (!sendBtn) return;
    const region = getRegionById(
      document.getElementById("cartRegionSelect")?.value,
    );
    const ids = Object.keys(cart);
    const lines = ["Halo ASJ Group, saya ingin memesan:", ""];
    ids.forEach((id, idx) => {
      const i = cart[id];
      lines.push(`${idx + 1}. ${i.name} (${i.pack}) × ${i.qty}`);
    });
    if (region)
      lines.push(
        "",
        `Wilayah pengiriman: ${region.label}`,
        `Ditujukan kepada: ${region.sales}`,
      );
    lines.push(
      "",
      "Mohon konfirmasi harga, stok, ongkir, dan estimasi pengiriman. Terima kasih.",
    );
    sendBtn.href = "#";
    sendBtn.removeAttribute("target");
    sendBtn.textContent = "Tinjau & lanjutkan";
    sendBtn.setAttribute("aria-disabled", String(!region || !ids.length));
    const hint = document.getElementById("cartRegionHint");
    if (hint) {
      hint.textContent = !ids.length
        ? "Tambahkan produk terlebih dahulu."
        : !region
          ? "Pilih daerah agar pesanan sampai ke sales yang tepat."
          : `${region.sales} · ${region.wa}${region.verified ? "" : " — placeholder, belum aktif"}`;
      hint.classList.toggle("is-warning", !region || !region.verified);
    }
    sendBtn.onclick = (e) => {
      e.preventDefault();
      if (!ids.length) {
        if (hint)
          hint.textContent =
            "Keranjang masih kosong. Tambahkan produk terlebih dahulu.";
        return;
      }
      if (!region) {
        document.getElementById("cartRegionSelect")?.focus();
        return;
      }
      window.ASJ_SALES.open(region.id, lines.join("\n"));
    };
  }

  function renderCart() {
    const itemsEl = document.getElementById("cartItems");
    const emptyEl = document.getElementById("cartEmpty");
    const badgeEl = document.getElementById("cartBadge");
    const barEl = document.getElementById("cartBar");

    if (!itemsEl || !badgeEl || !barEl) return;

    const ids = Object.keys(cart);
    itemsEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = ids.length === 0 ? "block" : "none";

    const escapeHtml = (value) =>
      String(value).replace(
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
    ids.forEach((id) => {
      const item = cart[id];
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-info">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.pack)} &middot; Jumlah: ${item.qty}</span>
        </div>
        <div class="cart-item-actions">
          <button type="button" class="cart-item-remove" data-remove="${escapeHtml(id)}">Hapus</button>
        </div>
      `;
      itemsEl.appendChild(row);
    });

    const count = cartCount();
    badgeEl.textContent = count;
    barEl.hidden = count === 0;
    buildWaLink();
  }

  /* ---------- 6a. TOAST NOTIFIKASI "BERHASIL DITAMBAHKAN" ---------- */
  const TOAST_CSS = `
    .asj-toast-popup{position:fixed;top:50%;left:50%;z-index:9999999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;box-sizing:border-box;width:min(350px,calc(100vw - 32px));padding:28px 32px;border-radius:18px;background:rgba(0,0,0,.7);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;text-align:center;box-shadow:0 15px 35px rgba(0,0,0,.35);opacity:0;transform:translate(-50%,-50%) scale(.85);transition:opacity .3s,transform .3s cubic-bezier(.175,.885,.32,1.275);pointer-events:none}
    .asj-toast-popup.is-visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
    .asj-toast-icon{display:flex;align-items:center;justify-content:center;padding:12px;border-radius:50%;background:#0f9447;color:#fff;box-shadow:0 4px 10px rgba(15,148,71,.4);animation:asjCheckSlideUp .5s cubic-bezier(.175,.885,.32,1.275) forwards}
    .asj-toast-text{display:flex;flex-direction:column;gap:5px;color:rgba(255,255,255,.95)}
    .asj-toast-text strong{font-size:16px;font-weight:600;color:#fff}
    .asj-toast-text span{font-size:14px}
    .asj-pulse{animation:asjPulse .2s ease-out}
    @keyframes asjCheckSlideUp{0%{opacity:0;transform:translateY(20px) scale(.4)}60%{opacity:1;transform:translateY(-4px) scale(1.1)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes asjPulse{50%{transform:scale(1.2)}}
    @media (prefers-reduced-motion:reduce){.asj-toast-popup,.asj-toast-icon,.asj-pulse{animation:none;transition:none}}
  `;
  const TOAST_HTML = `
    <div class="asj-toast-icon">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <div class="asj-toast-text">
      <strong>Berhasil Ditambahkan!</strong>
      <span>Produk masuk ke keranjang</span>
    </div>`;

  function showCartToast() {
    document.querySelector(".asj-toast-popup")?.remove();

    if (!document.getElementById("toastCheckStyle")) {
      const styleTag = document.createElement("style");
      styleTag.id = "toastCheckStyle";
      styleTag.textContent = TOAST_CSS;
      document.head.appendChild(styleTag);
    }

    const toast = document.createElement("div");
    toast.className = "asj-toast-popup";
    toast.setAttribute("role", "status");
    toast.innerHTML = TOAST_HTML;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }, 2000);

    // Efek denyut pada tombol keranjang
    const cartTarget =
      document.getElementById("cartOpenBtn") ||
      document.getElementById("cartBadge");
    if (cartTarget) {
      cartTarget.classList.remove("asj-pulse");
      void cartTarget.offsetWidth; // ulangi animasi
      cartTarget.classList.add("asj-pulse");
      setTimeout(() => cartTarget.classList.remove("asj-pulse"), 250);
    }
  }

  /* ---------- 6b. PILIH UKURAN KEMASAN (kartu produk) ---------- */
  // Field "Kemasan" (mis. "250 mL / 500 mL / 1 L") diubah jadi pilihan
  // interaktif. Ukuran yang dipilih disimpan di lot.dataset.selectedSize
  // dan dipakai baik oleh tombol tambah di kartu maupun di modal detail.
  function getKemasanSizes(lot) {
    const rows = lot.querySelectorAll(".lot-specs > div");
    for (const row of rows) {
      const dt = row.querySelector("dt");
      const dd = row.querySelector("dd");
      if (dt && dd && dt.textContent.trim().toLowerCase() === "kemasan") {
        return dd.textContent
          .split("/")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  }

  // Ambil path gambar khusus untuk satu ukuran, dari atribut opsional
  // data-size-images (format JSON) di elemen .lot. Kalau tidak ada
  // datanya untuk ukuran tsb, return null (fallback ke gambar default).
  function getSizeImage(lot, size) {
    const raw = lot.dataset.sizeImages;
    if (!raw) return null;
    try {
      const map = JSON.parse(raw);
      return map[size] || null;
    } catch {
      return null;
    }
  }

  function selectLotSize(lot, size) {
    lot.dataset.selectedSize = size;
    // Sinkronkan status aktif di kartu
    lot.querySelectorAll(".size-picker .size-pill").forEach((pill) => {
      pill.classList.toggle("is-active", pill.dataset.size === size);
      pill.setAttribute("aria-pressed", String(pill.dataset.size === size));
    });
    // Sinkronkan status aktif di modal, kalau modal sedang menampilkan lot ini
    const modalPicker = document.getElementById("productModalSizePicker");
    const modalShowingThisLot =
      modalPicker && modalPicker.dataset.forLot === lot.dataset.id;
    if (modalShowingThisLot) {
      modalPicker.querySelectorAll(".size-pill").forEach((pill) => {
        pill.classList.toggle("is-active", pill.dataset.size === size);
        pill.setAttribute("aria-pressed", String(pill.dataset.size === size));
      });
    }

    // Ganti foto produk sesuai ukuran yang dipilih (kalau datanya tersedia)
    const sizeImg = getSizeImage(lot, size);
    if (sizeImg) {
      const cardImg = lot.querySelector(".lot-media img");
      if (cardImg) cardImg.src = sizeImg;
      if (modalShowingThisLot) {
        const modalImgEl = document.getElementById("productModalImg");
        if (modalImgEl) modalImgEl.src = sizeImg;
      }
    }
  }

  function buildSizePills(container, sizes, lot, onPick) {
    container.innerHTML = "";
    sizes.forEach((size) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "size-pill";
      pill.dataset.size = size;
      pill.textContent = size;
      pill.setAttribute(
        "aria-pressed",
        String(size === lot.dataset.selectedSize),
      );
      pill.classList.toggle("is-active", size === lot.dataset.selectedSize);
      pill.addEventListener("click", () => onPick(size));
      container.appendChild(pill);
    });
  }

  document.querySelectorAll(".lot").forEach((lot) => {
    const sizes = getKemasanSizes(lot);
    if (sizes.length < 2) return; // satu opsi saja atau tidak ada: tidak perlu picker
    lot.dataset.selectedSize = sizes[0];
    // Elemen .lot sendiri tidak punya data-id; salin dari tombol lot-add
    // di dalamnya supaya kartu & modal bisa saling dicocokkan.
    const addBtnForId = lot.querySelector(".lot-add");
    if (addBtnForId && addBtnForId.dataset.id) {
      lot.dataset.id = addBtnForId.dataset.id;
    }

    const specsList = lot.querySelector(".lot-specs");
    if (!specsList) return;
    const group = document.createElement("div");
    group.className = "size-picker-group";
    group.innerHTML =
      '<span class="size-picker-label">Pilih ukuran kemasan</span>';
    const picker = document.createElement("div");
    picker.className = "size-picker";
    group.appendChild(picker);
    specsList.insertAdjacentElement("afterend", group);

    buildSizePills(picker, sizes, lot, (size) => selectLotSize(lot, size));
  });

  /* ---------- 6c. ADD TO CART (dipakai tombol katalog & modal info produk) ---------- */
  function addItemToCart(id, name, pack, qty) {
    const safeQty = qty && qty > 0 ? qty : 1;
    if (cart[id]) {
      cart[id].qty += safeQty;
    } else {
      cart[id] = { name: name, pack: pack, qty: safeQty };
    }
    saveCart();
    renderCart();
  }

  document.querySelectorAll(".lot-add[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lot = btn.closest(".lot");
      const qtyVal = lot ? lot.querySelector(".qty-val") : null;
      const qty = qtyVal ? parseInt(qtyVal.dataset.qty, 10) || 1 : 1;
      const baseId = btn.dataset.id;
      const pack = (lot && lot.dataset.selectedSize) || btn.dataset.pack;
      // Ukuran berbeda dari produk yang sama jadi baris keranjang terpisah.
      const id =
        lot && lot.dataset.selectedSize ? baseId + "::" + pack : baseId;

      addItemToCart(id, btn.dataset.name, pack, qty);

      // Panggil Pop-up Notifikasi Keranjang
      showCartToast();

      const originalText = "Tambah ke Pesanan";
      btn.textContent = "Ditambahkan \u2713";
      btn.classList.add("is-added");
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("is-added");
      }, 1200);

      if (qtyVal) {
        qtyVal.dataset.qty = 1;
        qtyVal.textContent = 1;
      }
    });
  });

  /* ---------- 6c. MODAL DETAIL PRODUK (sebelum tambah ke pesanan) ---------- */
  const productOverlay = document.getElementById("productOverlay");
  const productModal = document.getElementById("productModal");

  if (productOverlay && productModal) {
    const productModalImg = document.getElementById("productModalImg");
    const productModalTag = document.getElementById("productModalTag");
    const productModalName = document.getElementById("productModalName");
    const productModalActive = document.getElementById("productModalActive");
    const productModalSpecs = document.getElementById("productModalSpecs");
    const productModalDesc = document.getElementById("productModalDesc");
    const productModalClose = document.getElementById("productModalClose");
    const productModalAdd = document.getElementById("productModalAdd");
    const productModalStepper = document.getElementById("productModalStepper");
    const productModalRelated = document.getElementById("productModalRelated");
    const productModalRelatedGrid = document.getElementById(
      "productModalRelatedGrid",
    );
    const productModalSizeGroup = document.getElementById(
      "productModalSizeGroup",
    );
    const productModalSizePicker = document.getElementById(
      "productModalSizePicker",
    );
    const productModalCropsGroup = document.getElementById(
      "productModalCropsGroup",
    );
    const productModalCrops = document.getElementById("productModalCrops");
    const productModalBenefitsGroup = document.getElementById(
      "productModalBenefitsGroup",
    );
    const productModalBenefits = document.getElementById(
      "productModalBenefits",
    );
    const productModalAsk = document.getElementById("productModalAsk");
    const productModalRegion = document.getElementById("productModalRegion");
    const productModalRegionHint = document.getElementById(
      "productModalRegionHint",
    );
    let activeProduct = null;

    /* ---------- RIWAYAT "BARU DILIHAT" ---------- */
    const RECENT_KEY = "asj_recently_viewed";
    const recentlyViewedBox = document.getElementById("recentlyViewed");
    const recentlyViewedList = document.getElementById("recentlyViewedList");

    function loadRecentIds() {
      try {
        const raw = localStorage.getItem(RECENT_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr)
          ? arr.filter((x) => typeof x === "string")
          : [];
      } catch {
        return [];
      }
    }

    function saveRecentIds(ids) {
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 6)));
      } catch {}
    }

    function trackRecentlyViewed(lot) {
      const addBtn = lot.querySelector(".lot-add");
      const id = addBtn && addBtn.dataset.id;
      if (!id) return;
      let ids = loadRecentIds().filter((x) => x !== id);
      ids.unshift(id);
      saveRecentIds(ids);
    }

    function renderRecentlyViewedList() {
      if (!recentlyViewedBox || !recentlyViewedList) return;
      const ids = loadRecentIds();
      recentlyViewedList.innerHTML = "";
      let shown = 0;
      ids.forEach((id) => {
        if (shown >= 6) return;
        const addBtn = document.querySelector(
          `.lot-add[data-id="${CSS.escape(id)}"]`,
        );
        const lot = addBtn ? addBtn.closest(".lot") : null;
        if (!lot) return; // produk sudah tidak ada di katalog saat ini
        const name = lot.querySelector(".lot-name");
        const img = lot.querySelector(".lot-media img");
        if (!name) return;
        const item = document.createElement("button");
        item.type = "button";
        item.className = "recently-viewed-item";
        item.setAttribute("aria-label", "Buka lagi " + name.textContent);
        if (img) {
          const thumb = document.createElement("img");
          thumb.src = img.src;
          thumb.alt = "";
          thumb.loading = "lazy";
          item.appendChild(thumb);
        }
        const label = document.createElement("span");
        label.textContent = name.textContent;
        item.appendChild(label);
        item.addEventListener("click", () => openProductModal(lot));
        recentlyViewedList.appendChild(item);
        shown++;
      });
      recentlyViewedBox.hidden = shown === 0;
    }

    function renderRelatedProducts(lot) {
      if (!productModalRelated || !productModalRelatedGrid) return;
      const category = lot.dataset.cat;
      const grid =
        lot.closest("#lotGrid") || document.getElementById("lotGrid");
      if (!category || !grid) {
        productModalRelated.hidden = true;
        return;
      }
      const candidates = [...grid.querySelectorAll(".lot")].filter(
        (other) => other !== lot && other.dataset.cat === category,
      );
      if (!candidates.length) {
        productModalRelated.hidden = true;
        return;
      }
      // Ambil sampai 3 produk lain di kategori yang sama, urutan diacak
      // ringan supaya tidak selalu menampilkan 3 produk pertama yang sama.
      const picks = shuffle(candidates).slice(0, 3);

      productModalRelatedGrid.innerHTML = "";
      picks.forEach((other) => {
        const name = other.querySelector(".lot-name");
        const img = other.querySelector(".lot-media img");
        if (!name) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "related-item";
        btn.setAttribute("aria-label", "Lihat detail " + name.textContent);
        if (img) {
          const thumb = document.createElement("img");
          thumb.src = img.src;
          thumb.alt = "";
          thumb.loading = "lazy";
          btn.appendChild(thumb);
        }
        const label = document.createElement("span");
        label.textContent = name.textContent;
        btn.appendChild(label);
        btn.addEventListener("click", () => openProductModal(other));
        productModalRelatedGrid.appendChild(btn);
      });
      productModalRelated.hidden = false;
    }

    /* ---------- DETAIL PRODUK: TANAMAN & KEUNGGULAN ----------
       Data diambil dari js/produk-data.js (kolom cocokUntuk & keunggulan).
       Kolom yang kosong tidak ditampilkan. */
    const CROP_LABELS = {
      sawit: "Kelapa sawit",
      padi: "Padi",
      jagung: "Jagung",
      kopi: "Kopi",
      karet: "Karet",
      hortikultura: "Hortikultura",
    };

    function getProductData(lot) {
      const id = lot.querySelector(".lot-add")?.dataset.id;
      const all = Array.isArray(window.ASJ_PRODUCTS) ? window.ASJ_PRODUCTS : [];
      return all.find((p) => p.id === id) || null;
    }

    function readProductExtras(lot) {
      const data = getProductData(lot);
      const clean = (arr) =>
        Array.isArray(arr)
          ? arr.map((t) => String(t).trim()).filter(Boolean)
          : [];
      let crops = clean(data && data.cocokUntuk);
      const benefits = clean(data && data.keunggulan);

      // Cadangan: kalau cocokUntuk kosong, pakai kolom tanaman (kunci filter).
      if (!crops.length && lot.dataset.commodity) {
        crops = lot.dataset.commodity
          .split(/\s+/)
          .map((key) => CROP_LABELS[key.toLowerCase()])
          .filter(Boolean);
      }
      return { crops, benefits };
    }

    function fillList(group, list, items) {
      if (!group || !list) return;
      list.innerHTML = "";
      items.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
      });
      group.hidden = items.length === 0;
    }

    function renderProductExtras(lot) {
      const { crops, benefits } = readProductExtras(lot);
      fillList(productModalCropsGroup, productModalCrops, crops);
      fillList(productModalBenefitsGroup, productModalBenefits, benefits);
    }

    /* ---------- LINK LANGSUNG KE PRODUK (?produk=1A) ---------- */
    const lotNumber = (lot) =>
      (lot.querySelector(".lot-num")?.textContent || "")
        .replace(/^\s*No\.\s*/i, "")
        .trim();

    function findLotByRef(ref) {
      const key = String(ref || "")
        .trim()
        .toLowerCase();
      if (!key) return null;
      return (
        [...document.querySelectorAll("#lotGrid .lot")].find(
          (lot) =>
            lotNumber(lot).toLowerCase() === key ||
            (lot.querySelector(".lot-add")?.dataset.id || "").toLowerCase() ===
              key,
        ) || null
      );
    }

    function productShareUrl(lot) {
      const canonical = document.querySelector('link[rel="canonical"]');
      const base = canonical
        ? canonical.href
        : window.location.origin + window.location.pathname;
      return base + "?produk=" + encodeURIComponent(lotNumber(lot));
    }

    // Alamat di browser ikut berubah saat detail dibuka, supaya bisa disalin.
    function setProductUrl(lot) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("produk", lotNumber(lot));
        history.replaceState(null, "", url);
      } catch (e) {}
    }

    function clearProductUrl() {
      try {
        const url = new URL(window.location.href);
        if (!url.searchParams.has("produk")) return;
        url.searchParams.delete("produk");
        history.replaceState(null, "", url);
      } catch (e) {}
    }

    function openProductModal(lot) {
      if (!lot) return;
      setProductUrl(lot);
      trackRecentlyViewed(lot);
      const img = lot.querySelector(".lot-media img");
      const tag = lot.querySelector(".lot-tag");
      const name = lot.querySelector(".lot-name");
      const active = lot.querySelector(".lot-active");
      const desc = lot.querySelector(".lot-desc");
      const addBtn = lot.querySelector(".lot-add");
      const specs = lot.querySelectorAll(".lot-specs > div");
      const sizes = getKemasanSizes(lot);
      const hasSizePicker = sizes.length >= 2;

      if (productModalImg && img) {
        productModalImg.src = img.src;
        productModalImg.alt = img.alt || "";
      }
      if (productModalTag && tag) {
        productModalTag.textContent = tag.textContent;
        productModalTag.className =
          "lot-tag " + tag.className.replace("lot-tag", "").trim();
      }
      if (productModalName && name)
        productModalName.textContent = name.textContent;
      if (productModalActive && active)
        productModalActive.textContent = active.textContent;
      if (productModalDesc && desc)
        productModalDesc.textContent = desc.textContent.trim();

      if (productModalSpecs) {
        productModalSpecs.innerHTML = "";
        specs.forEach((spec) => {
          const dt = spec.querySelector("dt");
          const dd = spec.querySelector("dd");
          if (!dt || !dd) return;
          // Baris "Kemasan" digantikan tampilan pilihan interaktif di
          // bawah, jadi tidak perlu ditampilkan dua kali sebagai teks.
          if (
            hasSizePicker &&
            dt.textContent.trim().toLowerCase() === "kemasan"
          )
            return;
          const wrap = document.createElement("div");
          const term = document.createElement("dt");
          const detail = document.createElement("dd");
          term.textContent = dt.textContent;
          detail.textContent = dd.textContent;
          wrap.append(term, detail);
          productModalSpecs.appendChild(wrap);
        });
      }

      renderRelatedProducts(lot);
      renderProductExtras(lot);

      if (productModalSizeGroup && productModalSizePicker) {
        if (hasSizePicker && lot.dataset.id) {
          if (!lot.dataset.selectedSize) lot.dataset.selectedSize = sizes[0];
          productModalSizePicker.dataset.forLot = lot.dataset.id;
          buildSizePills(productModalSizePicker, sizes, lot, (size) =>
            selectLotSize(lot, size),
          );
          productModalSizeGroup.hidden = false;
        } else {
          productModalSizeGroup.hidden = true;
          productModalSizePicker.innerHTML = "";
          delete productModalSizePicker.dataset.forLot;
        }
      }

      activeProduct = addBtn
        ? {
            id: addBtn.dataset.id,
            name: addBtn.dataset.name,
            pack: addBtn.dataset.pack,
            lot: lot,
          }
        : null;

      const modalQtyVal = productModalStepper
        ? productModalStepper.querySelector(".qty-val")
        : null;
      if (modalQtyVal) {
        modalQtyVal.dataset.qty = 1;
        modalQtyVal.textContent = 1;
      }

      // Selalu mulai dari atas (penting saat pindah produk lewat "Produk terkait")
      const modalScroller = productModal.querySelector(".product-modal-scroll");
      if (modalScroller) modalScroller.scrollTop = 0;

      productOverlay.classList.add("open");
      productModal.classList.add("open");
      document.body.classList.add("no-scroll");
    }

    function closeProductModal() {
      clearProductUrl();
      productOverlay.classList.remove("open");
      productModal.classList.remove("open");
      document.body.classList.remove("no-scroll");
      renderRecentlyViewedList();
    }

    // Tampilkan riwayat dari kunjungan sebelumnya saat halaman dibuka
    renderRecentlyViewedList();

    document.querySelectorAll(".lot-info-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        openProductModal(btn.closest(".lot"));
      });
    });

    /* Tanya produk ini via WhatsApp — lewat pratinjau sales.js yang sama
       dengan keranjang, jadi tetap harus ditinjau & dikirim sendiri.
       Wilayah tujuan sekarang dipilih EKSPLISIT lewat dropdown di modal,
       bukan lagi diam-diam mengikuti localStorage saja — supaya tidak ada
       lagi kejadian teks "Daerah saya" diubah tapi nomor WA tujuannya
       tetap ke wilayah yang lama. */
    function populateModalRegionSelect() {
      if (!productModalRegion || productModalRegion.dataset.filled) return;
      SALES_REGIONS.forEach((region) => {
        const opt = document.createElement("option");
        opt.value = region.id;
        opt.textContent = region.label;
        productModalRegion.appendChild(opt);
      });
      productModalRegion.dataset.filled = "true";
      let saved = "";
      try {
        saved = localStorage.getItem("asj_cart_region") || "";
      } catch (e) {}
      if (getRegionById(saved)) productModalRegion.value = saved;
    }

    function syncAskButtonState() {
      if (!productModalAsk || !productModalRegion) return;
      const hasRegion = !!productModalRegion.value;
      productModalAsk.setAttribute("aria-disabled", String(!hasRegion));
      if (productModalRegionHint) productModalRegionHint.hidden = hasRegion;
    }

    if (productModalRegion) {
      populateModalRegionSelect();
      productModalRegion.addEventListener("change", () => {
        try {
          if (productModalRegion.value)
            localStorage.setItem("asj_cart_region", productModalRegion.value);
        } catch (e) {}
        syncAskButtonState();
      });
      syncAskButtonState();
    }

    if (productModalAsk) {
      productModalAsk.addEventListener("click", () => {
        if (!activeProduct || !window.ASJ_SALES) return;
        const regionId = productModalRegion ? productModalRegion.value : "";
        const region = getRegionById(regionId);
        if (!region) {
          syncAskButtonState();
          return;
        }
        const active = activeProduct.lot.querySelector(".lot-active");
        const lines = [
          "Halo ASJ Group, saya ingin bertanya tentang produk:",
          "",
          activeProduct.name +
            (active && active.textContent.trim()
              ? " (" + active.textContent.trim() + ")"
              : ""),
          productShareUrl(activeProduct.lot),
          "",
          "Daerah saya: " + region.label,
          "Pertanyaan saya: ",
        ];
        window.ASJ_SALES.open(region.id, lines.join("\n"));
      });
    }

    // Buka detail otomatis kalau alamat berisi ?produk=1A
    const produkParam = new URLSearchParams(window.location.search).get(
      "produk",
    );
    if (produkParam) {
      const target = findLotByRef(produkParam);
      if (target) openProductModal(target);
    }

    if (productModalClose)
      productModalClose.addEventListener("click", closeProductModal);
    productOverlay.addEventListener("click", closeProductModal);
    document.addEventListener("keydown", (e) => {
      // Hanya jika modal produk memang terbuka; jika tidak, Esc milik panel lain
      // (keranjang/menu) ikut membuka kunci scroll halaman secara keliru.
      if (e.key === "Escape" && productModal.classList.contains("open"))
        closeProductModal();
    });

    if (productModalStepper) {
      productModalStepper.querySelectorAll(".qty-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = productModalStepper.querySelector(".qty-val");
          const step = parseInt(btn.dataset.step, 10);
          const next = Math.max(1, (parseInt(val.dataset.qty, 10) || 1) + step);
          val.dataset.qty = next;
          val.textContent = next;
        });
      });
    }

    if (productModalAdd) {
      productModalAdd.addEventListener("click", () => {
        if (!activeProduct) return;
        const modalQtyVal = productModalStepper
          ? productModalStepper.querySelector(".qty-val")
          : null;
        const qty = modalQtyVal
          ? parseInt(modalQtyVal.dataset.qty, 10) || 1
          : 1;
        const currentPack =
          (activeProduct.lot && activeProduct.lot.dataset.selectedSize) ||
          activeProduct.pack;
        const cartId =
          activeProduct.lot && activeProduct.lot.dataset.selectedSize
            ? activeProduct.id + "::" + currentPack
            : activeProduct.id;
        addItemToCart(cartId, activeProduct.name, currentPack, qty);

        // Panggil Pop-up Notifikasi dari Modal
        showCartToast();

        const originalText = "Tambah ke Pesanan";
        productModalAdd.textContent = "Ditambahkan \u2713";
        productModalAdd.classList.add("is-added");
        setTimeout(() => {
          productModalAdd.textContent = originalText;
          productModalAdd.classList.remove("is-added");
          closeProductModal();
        }, 700);
      });
    }
  }

  /* ---------- 6e. PILIH WILAYAH DI KERANJANG ---------- */
  const CART_REGION_KEY = "asj_cart_region";

  function populateCartRegionSelect() {
    const select = document.getElementById("cartRegionSelect");
    if (!select || select.dataset.populated) return;
    SALES_REGIONS.forEach((region) => {
      const opt = document.createElement("option");
      opt.value = region.id;
      opt.textContent = region.label;
      select.appendChild(opt);
    });
    select.dataset.populated = "1";

    let savedRegion = "";
    try {
      savedRegion = localStorage.getItem(CART_REGION_KEY) || "";
    } catch (e) {}
    if (savedRegion) select.value = savedRegion;

    select.addEventListener("change", () => {
      try {
        localStorage.setItem(CART_REGION_KEY, select.value);
      } catch (e) {}
      buildWaLink();
    });
  }

  function initCartRegion() {
    populateCartRegionSelect();
  }

  const cartOpenBtn = document.getElementById("cartOpenBtn");
  const cartPanel = document.getElementById("cartPanel");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartCloseBtn = document.getElementById("cartCloseBtn");

  function openCart() {
    if (cartPanel) cartPanel.classList.add("open");
    if (cartOverlay) cartOverlay.classList.add("open");
  }

  function closeCart() {
    if (cartPanel) cartPanel.classList.remove("open");
    if (cartOverlay) cartOverlay.classList.remove("open");
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener("click", openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  const cartItemsEl = document.getElementById("cartItems");
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", (e) => {
      const removeTarget = e.target.closest("[data-remove]");
      if (removeTarget) {
        const id = removeTarget.getAttribute("data-remove");
        if (id && cart[id]) {
          delete cart[id];
          saveCart();
          renderCart();
        }
      }
    });
  }

  const cartClearBtn = document.getElementById("cartClearBtn");
  if (cartClearBtn) {
    cartClearBtn.addEventListener("click", () => {
      cart = {};
      saveCart();
      renderCart();
    });
  }

  loadCart();
  initCartRegion();
  renderCart();

  /* ---------- 7. LIGHTBOX GAMBAR ---------- */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.getElementById("lightboxClose");

    function openLightbox(media) {
      const img = media.querySelector("img");
      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.textContent = img.alt || "";
        lightbox.classList.add("open");
      }
    }

    document.querySelectorAll(".lot-media").forEach((media) => {
      media.setAttribute("tabindex", "0");
      media.setAttribute("role", "button");
      media.addEventListener("click", () => openLightbox(media));
      media.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(media);
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", () => {
        lightbox.classList.remove("open");
      });
    }

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) {
        lightbox.classList.remove("open");
      }
    });
  }

  /* ---------- 8. FAQ ACCORDION ---------- */
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => {
        i.classList.remove("open");
      });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- 9. BACK TO TOP BUTTON (SMOOTH & RELIABLE) ---------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => backToTop.classList.toggle("show", window.pageYOffset > 400),
      { passive: true },
    );

    backToTop.addEventListener("click", (e) => {
      e.preventDefault();

      // Hormati pengaturan "kurangi gerakan": langsung ke atas tanpa animasi
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, 0);
        return;
      }

      const startPosition = window.pageYOffset;
      const duration = 600; // Durasi dalam milidetik (semakin besar semakin lambat/halus)
      let startTime = null;

      function animationStep(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = currentTime - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Rumus pelambatan halus di awal dan akhir (easeInOut)
        const ease = 0.5 - Math.cos(percentage * Math.PI) / 2;

        window.scrollTo(0, startPosition * (1 - ease));

        if (progress < duration) {
          requestAnimationFrame(animationStep);
        }
      }

      requestAnimationFrame(animationStep);
    });
  }

  /* Contact form routes through the shared region-aware preview. */
  const contactForm = document.getElementById("contactForm");
  if (contactForm)
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!window.ASJ_SALES) {
        // Skrip pesan gagal dimuat: beri tahu pengunjung, jangan diam saja
        let note = document.getElementById("contactFormError");
        if (!note) {
          note = document.createElement("p");
          note.id = "contactFormError";
          note.setAttribute("role", "alert");
          note.className = "copy-status";
          contactForm.append(note);
        }
        note.textContent =
          "Formulir belum dapat dikirim. Muat ulang halaman, atau hubungi kami lewat telepon atau email di bagian atas halaman ini.";
        return;
      }
      const region = document.getElementById("contactRegion").value;
      const name = document.getElementById("nm").value.trim();
      const phone = document.getElementById("hp").value.trim();
      const message = document.getElementById("ms").value.trim();
      const label = getRegionById(region)?.label || "";
      window.ASJ_SALES.open(
        region,
        `Halo ASJ Group, saya ${name}.\nWilayah: ${label}\n${phone ? "Nomor WhatsApp saya: " + phone + "\n" : ""}Pesan: ${message}`,
      );
    });

  /* ---------- 12. NAVBAR SEARCH ---------- */
  const navSearch = document.getElementById("navSearch");
  const navSearchInput = document.getElementById("navSearchInput");
  const navSearchBtn = document.getElementById("navSearchBtn");

  function closeNavSearch() {
    if (!navSearch) return;
    navSearch.classList.remove("open");
    if (navSearchInput) {
      navSearchInput.value = "";
      navSearchInput.blur();
    }
  }

  function goSearch() {
    if (!navSearchInput) return;
    const q = navSearchInput.value.trim();

    if (!q) {
      closeNavSearch();
      return;
    }

    // searchInput hanya ada di halaman katalog (aman untuk URL tanpa ".html")
    if (searchInput) {
      searchInput.value = q;
      runFilter();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      closeNavSearch();
    } else {
      window.location.href = "produk.html?cari=" + encodeURIComponent(q);
    }
  }

  if (navSearch && navSearchInput && navSearchBtn) {
    navSearchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = navSearch.classList.contains("open");

      if (!isOpen) {
        navSearch.classList.add("open");
        setTimeout(() => {
          navSearchInput.focus();
        }, 50);
      } else {
        closeNavSearch();
      }
    });

    navSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goSearch();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeNavSearch();
      }
    });

    document.addEventListener("click", (e) => {
      if (!navSearch.contains(e.target)) {
        closeNavSearch();
      }
    });
  }

  if (searchInput) {
    const cariParam = new URLSearchParams(window.location.search).get("cari");
    if (cariParam) {
      searchInput.value = cariParam;
      runFilter();
    }
  }

  /* ---------- 13. POPUP PROMO ---------- */
  const promoModal = document.getElementById("promoModal");
  const promoOverlay = document.getElementById("promoOverlay");
  const promoClose = document.getElementById("promoClose");

  if (promoModal && promoOverlay && !promoModal.hidden) {
    const PROMO_KEY = "asj_promo_dismissed";
    let alreadyDismissed = false;
    try {
      alreadyDismissed = sessionStorage.getItem(PROMO_KEY) === "1";
    } catch (e) {}

    if (!alreadyDismissed) {
      setTimeout(() => {
        promoModal.classList.add("open");
        promoOverlay.classList.add("open");
      }, 900);
    }

    function dismissPromo() {
      promoModal.classList.remove("open");
      promoOverlay.classList.remove("open");
      try {
        sessionStorage.setItem(PROMO_KEY, "1");
      } catch (e) {}
    }

    if (promoClose) promoClose.addEventListener("click", dismissPromo);
    promoOverlay.addEventListener("click", dismissPromo);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dismissPromo();
    });
  }
});
