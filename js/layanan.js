/* Area Layanan v3 — satu file utuh (menggantikan layanan.js + layanan-ui.js).

   Yang dikerjakan file ini:
   - Membangun chip daerah, titik peta, dan isi tiket sales
   - Peta hidup: tingkat ketinggian, sungai Kapuas mengalir, jalur distribusi
     dari Pontianak ke daerah terpilih, sorot cahaya mengikuti kursor
   - Tautan langsung ?daerah=..., tombol salin tautan
   - Pencarian (Enter / Esc / panah), keyboard di chip dan titik peta
   - Pratinjau pesan ke sales, "Pakai daerah ini untuk pesanan"
   - Pil "Lihat sales" di HP

   Data daerah dibaca dari js/locations.js bila ada (lihat readData);
   bila tidak terbaca, dipakai data contoh di FALLBACK. */
(function () {
  "use strict";
  if (window.__asjLayananV3) return;
  window.__asjLayananV3 = true;

  var started = false;
  function go() {
    if (started) return;
    started = true;
    try {
      init();
    } catch (err) {
      if (window.console) console.error("[layanan] gagal memuat:", err);
      var c = document.getElementById("regionCount");
      if (c) c.textContent = "Daftar daerah gagal dimuat. Muat ulang halaman.";
    }
  }
  if (document.readyState === "complete") go();
  else {
    document.addEventListener("DOMContentLoaded", go);
    window.addEventListener("load", go);
  }

  /* ================= data ================= */
  var NS = "http://www.w3.org/2000/svg";
  var SAFE = /^[a-z0-9_-]+$/i;

  var LAND_FALLBACK =
    "M182 273 C177 253 154 222 155 203 C156 184 177 134 192 118 C207 102 261 78 278 78 C295 78 314 113 328 119 C342 125 378 118 393 123 C408 128 437 156 451 156 C465 156 490 124 507 123 C524 122 563 151 584 149 C605 147 652 110 677 106 C702 102 763 106 784 117 C805 128 841 178 845 197 C849 216 816 251 814 266 C812 281 836 301 832 314 C828 327 795 350 785 367 C775 384 765 434 753 447 C741 460 701 453 686 467 C671 481 641 534 631 557 C621 580 614 630 608 648 C602 666 583 689 586 701 C589 713 631 723 629 745 C627 767 588 854 571 876 C554 898 512 921 492 922 C472 923 427 899 414 885 C401 871 397 823 390 808 C383 793 362 781 355 765 C348 749 344 698 337 681 C330 664 313 641 302 625 C291 609 255 566 249 550 C243 534 260 508 255 497 C250 486 218 472 210 463 C202 454 189 436 187 423 C185 410 195 381 194 362 C193 343 187 293 182 273Z";

  /* x, y = persen dari area peta persegi (sama dengan viewBox 1000x1000) */
  var FALLBACK = [
    { id: "pontianak", name: "Pontianak", x: 25.5, y: 43, hq: true },
    { id: "kubu-raya", name: "Kubu Raya", x: 33, y: 50 },
    { id: "mempawah", name: "Mempawah", x: 24, y: 33.5 },
    { id: "singkawang", name: "Singkawang", x: 24.5, y: 24 },
    { id: "sambas", name: "Sambas", x: 26, y: 15 },
    { id: "bengkayang", name: "Bengkayang", x: 34, y: 23 },
    { id: "landak", name: "Landak", x: 42, y: 31 },
    { id: "sanggau", name: "Sanggau", x: 50, y: 37 },
    { id: "sekadau", name: "Sekadau", x: 57, y: 43 },
    { id: "sintang", name: "Sintang", x: 66.5, y: 34 },
    { id: "melawi", name: "Melawi", x: 60.5, y: 52 },
    { id: "kapuas-hulu", name: "Kapuas Hulu", x: 77, y: 21 },
    { id: "kayong-utara", name: "Kayong Utara", x: 40, y: 69 },
    { id: "ketapang", name: "Ketapang", x: 48, y: 80 },
  ];

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) ? n : null;
  }
  function slug(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  function digits(s) {
    return String(s == null ? "" : s).replace(/\D/g, "");
  }
  function normItem(o, key, noxy) {
    if (!o || typeof o !== "object") return null;
    var id = o.id || o.slug || o.key || o.value || key;
    var name = o.name || o.label || o.nama || o.title || o.region;
    var x = num(o.x != null ? o.x : o.left != null ? o.left : o.px);
    var y = num(o.y != null ? o.y : o.top != null ? o.top : o.py);
    if (!id || !name) return null;
    if (!noxy && (x == null || y == null)) return null;
    var s = o.sales;
    var salesName =
      (s && typeof s === "object" && s.name) ||
      o.salesName ||
      o.sales_name ||
      (typeof s === "string" ? s : "") ||
      "Sales " + name;
    var phone =
      (s && typeof s === "object" && (s.phone || s.whatsapp)) ||
      o.phone ||
      o.whatsapp ||
      o.wa ||
      o.nomor ||
      "6200000000000";
    return {
      id: slug(id),
      name: String(name),
      x: x,
      y: y,
      sales: String(salesName),
      phone: digits(phone),
      address: String(o.address || o.alamat || ""),
      verified: o.verified === true,
      raw: o,
      aliases: o.aliases instanceof Array ? o.aliases.join(" ") : "",
      hq: !!o.hq,
    };
  }
  function normList(v) {
    var out = [];
    if (v instanceof Array) {
      v.forEach(function (o) {
        var n = normItem(o);
        if (n) out.push(n);
      });
    } else if (v && typeof v === "object") {
      Object.keys(v).forEach(function (k) {
        var n = normItem(v[k], k);
        if (n) out.push(n);
      });
    }
    return out.length >= 2 ? out : null;
  }
  var OTHER = null;
  function readData() {
    var names = [
      "ASJ_LOCATIONS",
      "LOCATIONS",
      "locations",
      "ASJ_REGIONS",
      "REGIONS",
      "regions",
      "BRANCH_LOCATIONS",
      "branchLocations",
      "ASJ_AREAS",
    ];
    var list = null,
      i;
    try {
      var L = window.ASJ_LOCATIONS;
      var raw = L && (L.branches || L.regions);
      if (raw instanceof Array) {
        list = [];
        raw.forEach(function (o) {
          var n = normItem(o, null, true);
          if (!n) return;
          if (n.id === "lainnya") OTHER = n;
          else if (n.x != null && n.y != null) list.push(n);
        });
        if (list.length < 2) list = null;
      }
    } catch (e) {}
    for (i = 0; !list && i < names.length; i++) {
      try {
        list = normList(window[names[i]]);
      } catch (e) {}
    }
    if (!list) {
      try {
        var box = window.ASJ || window.asj;
        if (box) list = normList(box.locations || box.regions);
      } catch (e) {}
    }
    if (!list) {
      var keys = [];
      try {
        keys = Object.keys(window);
      } catch (e) {}
      for (i = 0; i < keys.length && !list; i++) {
        try {
          var v = window[keys[i]];
          if (v instanceof Array && v.length >= 2) list = normList(v);
        } catch (e) {}
      }
    }
    if (!list) list = normList(FALLBACK);
    var big = list.some(function (l) {
      return l.x > 100 || l.y > 100;
    });
    if (big)
      list.forEach(function (l) {
        l.x /= 10;
        l.y /= 10;
      });
    var seen = {};
    return list.filter(function (l) {
      if (!SAFE.test(l.id) || seen[l.id]) return false;
      seen[l.id] = 1;
      return true;
    });
  }
  function isActive(d) {
    try {
      if (window.ASJ_SALES && window.ASJ_SALES.valid && d && d.raw)
        return !!window.ASJ_SALES.valid(d.raw);
    } catch (e) {}
    return !!d && d.verified && /^62[1-9]\d{7,12}$/.test(d.phone);
  }
  function plain(s) {
    var t = String(s).toLowerCase();
    return t.normalize ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : t;
  }

  /* ================= util DOM ================= */
  function $(id) {
    return document.getElementById(id);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs)
      for (var k in attrs)
        if (Object.prototype.hasOwnProperty.call(attrs, k))
          e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ================= init ================= */
  function init() {
    var card = document.querySelector(".sales-card");
    var title = $("selectedRegion");
    var list = $("locationList");
    var pins = $("mapPins");
    var stage = $("branchMap");
    var search = $("regionSearch");
    var other = $("otherRegion");
    var countEl = $("regionCount");
    var emptyEl = $("regionEmpty");
    if (!card || !title || !list || !pins || !stage || !search) return;
    var svg = stage.querySelector("svg");

    var reduce = !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    var smooth = reduce ? "auto" : "smooth";

    var DATA = readData();
    var BY = {};
    DATA.forEach(function (l) {
      BY[l.id] = l;
    });
    if (OTHER) BY.lainnya = OTHER;
    var HQ = null; /* jalur dari pusat ke daerah dimatikan */

    var current = ""; /* id daerah, "lainnya", atau "" */

    /* ---------- peta ---------- */
    var landD = LAND_FALLBACK;
    var oldLand = svg && svg.querySelector(".map-land");
    if (oldLand && oldLand.getAttribute("d")) landD = oldLand.getAttribute("d");
    var routeLayer = null;
    if (svg) routeLayer = drawMap(svg, landD, HQ);
    decorateStage(stage);
    /* titik yang jatuh di luar daratan digeser sedikit ke dalam (hanya tampilan) */
    var landEl = svg && svg.querySelector(".map-land");
    if (landEl && landEl.isPointInFill && svg.createSVGPoint) {
      var probe = svg.createSVGPoint();
      var inside = function (x, y) {
        var o = [
          [0, 0],
          [14, 0],
          [-14, 0],
          [0, 14],
          [0, -14],
        ];
        return o.every(function (d) {
          probe.x = x * 10 + d[0];
          probe.y = y * 10 + d[1];
          return landEl.isPointInFill(probe);
        });
      };
      DATA.forEach(function (l) {
        for (var n = 0; n < 60 && !inside(l.x, l.y); n++) {
          l.x += (50 - l.x) * 0.03;
          l.y += (50 - l.y) * 0.03;
        }
      });
      if (HQ && routeLayer && routeLayer.moveHq) routeLayer.moveHq(HQ);
    }

    /* ---------- chip & titik ---------- */
    DATA.forEach(function (l, i) {
      var chip = el("button", "location-option", l.name);
      chip.type = "button";
      chip.setAttribute("data-location", l.id);
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", function () {
        select(l.id, "chip");
      });
      list.appendChild(chip);

      var pin = el("button", "branch-pin");
      pin.type = "button";
      pin.setAttribute("data-location", l.id);
      pin.setAttribute("aria-pressed", "false");
      pin.setAttribute("aria-label", l.name);
      pin.style.left = l.x + "%";
      pin.style.top = l.y + "%";
      pin.style.setProperty("--i", i);
      if (l === HQ) pin.classList.add("is-hq");
      pin.appendChild(el("span", "pin-dot"));
      pin.appendChild(el("span", "pin-label", l.name));
      pin.addEventListener("click", function () {
        select(l.id, "pin");
      });
      pins.appendChild(pin);
    });
    if (other) {
      other.addEventListener("click", function () {
        select("lainnya", "other");
      });
      list.appendChild(other); /* satu baris rapi bersama chip lain */
    }

    function chips() {
      return Array.prototype.slice.call(
        list.querySelectorAll("[data-location]"),
      );
    }
    function visibleChips() {
      return chips().filter(function (c) {
        return !c.hidden;
      });
    }
    function byLoc(root, id) {
      return SAFE.test(id)
        ? root.querySelector('[data-location="' + id + '"]')
        : null;
    }

    /* ---------- tiket ---------- */
    var salesName = $("salesName");
    var salesPhone = $("salesPhone");
    var salesStatus = $("salesStatus");
    var salesAddress = $("salesAddress");
    var salesBadge = $("salesBadge");
    var openMaps = $("openMaps");
    var btnContact = $("regionContact");
    var btnOrder = $("selectForOrder");
    var saved = $("regionSaved");
    var preview = null;

    function describe(id) {
      if (id === "lainnya")
        return (
          OTHER || {
            id: id,
            name: "Daerah lain",
            sales: "Admin penentuan wilayah",
            phone: "6200000000000",
            address: "Sebutkan alamat tujuan lengkap.",
            verified: false,
          }
        );
      return BY[id];
    }
    function messageFor(d) {
      if (d.id === "lainnya")
        return "Halo ASJ Group, saya belum tahu sales untuk daerah saya. Mohon diarahkan ke sales yang melayani wilayah saya. Terima kasih.";
      return (
        "Halo " +
        d.sales +
        ", saya ingin menanyakan produk ASJ Group untuk wilayah " +
        d.name +
        ". Mohon info stok, harga, dan estimasi pengiriman. Terima kasih."
      );
    }
    function fillTicket(d) {
      title.textContent = d.id === "lainnya" ? "Daerah lain" : d.name;
      if (salesName) salesName.textContent = d.sales;
      var on = isActive(d);
      if (salesPhone) salesPhone.textContent = d.phone || "—";
      if (salesStatus)
        salesStatus.textContent = on
          ? "Nomor terverifikasi"
          : "Placeholder · belum aktif";
      if (salesAddress)
        salesAddress.textContent = d.address || "Alamat cabang belum diisi.";
      if (salesBadge)
        salesBadge.textContent = on ? "Terverifikasi" : "Data contoh";
      if (openMaps && d.id !== "lainnya")
        openMaps.href =
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(d.name + ", Kalimantan Barat, Indonesia");
      if (openMaps && d.id === "lainnya")
        openMaps.href =
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("Kalimantan Barat, Indonesia");
      if (saved) saved.textContent = "";
      closePreview();
    }

    function closePreview() {
      if (preview && preview.parentNode)
        preview.parentNode.removeChild(preview);
      preview = null;
      if (btnContact) btnContact.setAttribute("aria-expanded", "false");
    }
    function openPreview(d) {
      closePreview();
      var on = isActive(d);
      var msg = messageFor(d);
      preview = el("div", "msg-preview");
      preview.appendChild(el("p", "msg-label", "Pesan untuk " + d.sales));
      var body = el("p", "msg-body", msg);
      preview.appendChild(body);
      var row = el("div", "msg-actions");
      var cp = el("button", "msg-btn", "Salin pesan");
      cp.type = "button";
      cp.addEventListener("click", function () {
        copyText(msg, function (ok) {
          cp.textContent = ok ? "Pesan disalin ✓" : "Salin manual dari kotak";
          setTimeout(function () {
            cp.textContent = "Salin pesan";
          }, 2200);
        });
      });
      row.appendChild(cp);
      if (on) {
        var wa = el("a", "msg-btn is-primary", "Buka WhatsApp ↗");
        wa.href =
          "https://wa.me/" + d.phone + "?text=" + encodeURIComponent(msg);
        wa.target = "_blank";
        wa.rel = "noopener noreferrer";
        row.appendChild(wa);
      } else {
        var kn = el("a", "msg-btn is-primary", "Hubungi admin pusat ↗");
        kn.href = "kontak.html";
        row.appendChild(kn);
      }
      preview.appendChild(row);
      if (!on)
        preview.appendChild(
          el(
            "p",
            "msg-note",
            "Nomor sales daerah ini belum aktif, jadi pesan diteruskan lewat admin pusat.",
          ),
        );
      var anchor = card.querySelector(".ticket-actions");
      if (anchor && anchor.parentNode)
        anchor.parentNode.insertBefore(preview, anchor.nextSibling);
      if (btnContact) btnContact.setAttribute("aria-expanded", "true");
    }
    if (btnContact)
      btnContact.addEventListener("click", function () {
        var d = describe(current);
        if (!d) return;
        if (window.ASJ_SALES && window.ASJ_SALES.open) {
          window.ASJ_SALES.open(d.id, messageFor(d));
          return;
        }
        if (preview) closePreview();
        else openPreview(d);
      });

    var cartSel = $("cartRegionSelect");
    function applyToCart(d) {
      if (!cartSel) return false;
      var opts = Array.prototype.slice.call(cartSel.options);
      var hit = opts.filter(function (o) {
        return (
          o.value === d.id ||
          plain(o.textContent).trim() === plain(d.name).trim()
        );
      })[0];
      if (!hit) return false;
      cartSel.value = hit.value;
      try {
        localStorage.setItem("asj_cart_region", hit.value);
      } catch (e) {}
      cartSel.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    if (btnOrder)
      btnOrder.addEventListener("click", function () {
        var d = describe(current);
        if (!d) return;
        applyToCart(d);
        try {
          window.dispatchEvent(
            new CustomEvent("asj:region", {
              detail: { id: d.id, name: d.name },
            }),
          );
        } catch (e) {}
        if (saved) saved.textContent = "Daerah pesanan: " + d.name + " ✓";
        btnOrder.classList.remove("is-done");
        void btnOrder.offsetWidth;
        btnOrder.classList.add("is-done");
      });

    /* ---------- pilih daerah ---------- */
    var interacted = false;
    var ready = false;
    function select(id, source) {
      var d = describe(id);
      if (!d) return false;
      current = id;
      chips().forEach(function (c) {
        c.setAttribute(
          "aria-pressed",
          c.getAttribute("data-location") === id ? "true" : "false",
        );
      });
      Array.prototype.forEach.call(
        pins.querySelectorAll("[data-location]"),
        function (p) {
          p.setAttribute(
            "aria-pressed",
            p.getAttribute("data-location") === id ? "true" : "false",
          );
        },
      );
      if (other) other.classList.toggle("is-active", id === "lainnya");
      fillTicket(d);
      card.classList.remove("is-fresh");
      void card.offsetWidth;
      card.classList.add("is-fresh");
      stage.classList.toggle("has-pick", id !== "lainnya");
      placeLabels();
      reveal();
      if (ready) {
        interacted = true;
        syncUrl();
      }
      syncPeek();
      return true;
    }

    /* ---------- tautan langsung & salin ---------- */
    function baseUrl() {
      return location.href.split(/[?#]/)[0];
    }
    function regionUrl(id) {
      return (
        baseUrl() +
        (id ? "?daerah=" + encodeURIComponent(id) : "") +
        "#peta-layanan"
      );
    }
    function syncUrl() {
      if (!current || !window.history || !history.replaceState) return;
      try {
        history.replaceState(
          null,
          "",
          location.pathname +
            "?daerah=" +
            encodeURIComponent(current) +
            location.hash,
        );
      } catch (e) {}
    }
    function copyText(text, done) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            done(true);
          },
          function () {
            done(false);
          },
        );
        return;
      }
      var t = document.createElement("textarea");
      t.value = text;
      t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(t);
      done(ok);
    }
    var links = card.querySelector(".ticket-links");
    if (links) {
      var copy = el(
        "button",
        "text-link ticket-copy",
        "Salin tautan daerah ini",
      );
      copy.type = "button";
      links.appendChild(copy);
      var copyTimer = 0;
      copy.addEventListener("click", function () {
        var url = regionUrl(current);
        copyText(url, function (ok) {
          copy.textContent = ok ? "Tautan disalin ✓" : "Salin manual: " + url;
          clearTimeout(copyTimer);
          copyTimer = setTimeout(function () {
            copy.textContent = "Salin tautan daerah ini";
          }, 2400);
        });
      });
    }

    /* ---------- pencarian ---------- */
    function applyFilter() {
      var q = plain(search.value.trim());
      var shown = 0;
      chips().forEach(function (c) {
        var d = BY[c.getAttribute("data-location")];
        var hay = plain(d.name + " " + d.aliases);
        var ok = !q || hay.indexOf(q) > -1;
        c.hidden = !ok;
        if (ok) shown++;
        var p = byLoc(pins, d.id);
        if (p) p.classList.toggle("is-dim", !ok);
      });
      if (countEl)
        countEl.textContent = q
          ? "Menampilkan " + shown + " dari " + DATA.length + " daerah"
          : DATA.length + " daerah · ketik untuk menyaring";
      if (emptyEl) emptyEl.hidden = !(q && !shown);
      placeLabels();
    }
    search.addEventListener("input", applyFilter);
    search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = visibleChips()[0];
        if (first) {
          e.preventDefault();
          first.click();
        }
      } else if (e.key === "Escape" && search.value) {
        search.value = "";
        applyFilter();
      } else if (e.key === "ArrowDown") {
        var f = visibleChips()[0];
        if (f) {
          e.preventDefault();
          f.focus();
        }
      }
    });

    /* ---------- keyboard ---------- */
    list.addEventListener("keydown", function (e) {
      var all = visibleChips(),
        i = all.indexOf(document.activeElement),
        n = all.length;
      if (i < 0 || !n) return;
      var to = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % n;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        to = (i - 1 + n) % n;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = n - 1;
      if (to < 0) return;
      e.preventDefault();
      all[to].focus();
    });
    var DIRS = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    pins.addEventListener("keydown", function (e) {
      var d = DIRS[e.key];
      var cur = e.target.closest && e.target.closest(".branch-pin");
      if (!d || !cur) return;
      var cx = parseFloat(cur.style.left),
        cy = parseFloat(cur.style.top);
      var best = null,
        bestScore = Infinity;
      Array.prototype.forEach.call(
        pins.querySelectorAll(".branch-pin"),
        function (p) {
          if (p === cur || p.classList.contains("is-dim")) return;
          var dx = parseFloat(p.style.left) - cx,
            dy = parseFloat(p.style.top) - cy;
          var along = dx * d[0] + dy * d[1];
          if (along <= 0.5) return;
          var across = Math.abs(dx * d[1] - dy * d[0]);
          var score = along + across * 1.6;
          if (score < bestScore) {
            bestScore = score;
            best = p;
          }
        },
      );
      if (best) {
        e.preventDefault();
        best.focus();
      }
    });

    /* ---------- sorot dua arah ---------- */
    function hint(id, on) {
      [pins, list].forEach(function (root) {
        var e = byLoc(root, id);
        if (e) e.classList.toggle("is-hint", on);
      });
    }
    [pins, list].forEach(function (root) {
      function ev(type, on) {
        root.addEventListener(type, function (e) {
          var b = e.target.closest && e.target.closest("[data-location]");
          if (b) hint(b.getAttribute("data-location"), on);
        });
      }
      ev("mouseover", true);
      ev("mouseout", false);
      ev("focusin", true);
      ev("focusout", false);
    });

    /* ---------- label titik tanpa tabrakan ---------- */
    var labTimer = 0;
    function placeLabels() {
      cancelAnimationFrame(labTimer);
      labTimer = requestAnimationFrame(layoutLabels);
    }
    function layoutLabels() {
      var r = stage.getBoundingClientRect();
      var W = r.width,
        H = r.height;
      if (!W || !H) return;
      var side = H,
        ox = (W - H) / 2;
      var all = Array.prototype.slice.call(
        pins.querySelectorAll(".branch-pin"),
      );
      var placed = [];
      function hit(a, b) {
        return !(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b);
      }
      all.forEach(function (p) {
        var cx = ox + (parseFloat(p.style.left) / 100) * side;
        var cy = (parseFloat(p.style.top) / 100) * side;
        placed.push({
          l: cx - 11,
          r: cx + 11,
          t: cy - 11,
          b: cy + 11,
          pin: p,
          dot: true,
        });
      });
      var order = all.slice().sort(function (a, b) {
        var pa = a.getAttribute("aria-pressed") === "true" ? 0 : 1;
        var pb = b.getAttribute("aria-pressed") === "true" ? 0 : 1;
        return pa - pb;
      });
      order.forEach(function (p) {
        var lab = p.querySelector(".pin-label");
        if (!lab) return;
        lab.className = "pin-label";
        if (p.classList.contains("is-dim")) {
          lab.classList.add("lab-off");
          return;
        }
        var w = lab.offsetWidth + 6,
          h = lab.offsetHeight + 4;
        var cx = ox + (parseFloat(p.style.left) / 100) * side;
        var cy = (parseFloat(p.style.top) / 100) * side;
        var sel = p.getAttribute("aria-pressed") === "true";
        var cands = sel
          ? [["t", cx - w / 2, cy - 18 - h]]
          : [
              ["r", cx + 13, cy - h / 2],
              ["l", cx - 13 - w, cy - h / 2],
              ["t", cx - w / 2, cy - 15 - h],
              ["b", cx - w / 2, cy + 15],
            ];
        var chosen = null;
        for (var i = 0; i < cands.length && !chosen; i++) {
          var c = cands[i];
          var box = { l: c[1], r: c[1] + w, t: c[2], b: c[2] + h };
          if (box.l < 4 || box.r > W - 4 || box.t < 4 || box.b > H - 28)
            continue;
          var clash = placed.some(function (o) {
            return o.pin !== p && hit(box, o);
          });
          if (!clash) {
            chosen = c;
            placed.push({ l: box.l, r: box.r, t: box.t, b: box.b, pin: p });
          }
        }
        if (sel && !chosen) chosen = cands[0];
        if (chosen) lab.classList.add("lab-" + chosen[0], "lab-on");
        else lab.classList.add("lab-off");
      });
    }
    if (window.ResizeObserver) new ResizeObserver(placeLabels).observe(stage);
    else window.addEventListener("resize", placeLabels);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(placeLabels);

    /* ---------- pil "Lihat sales" (HP) ---------- */
    var peek = el("button", "region-peek");
    peek.type = "button";
    peek.setAttribute("aria-hidden", "true");
    peek.tabIndex = -1;
    var peekName = el("span");
    peek.appendChild(peekName);
    peek.appendChild(el("span", null, "Lihat sales ↓"));
    document.body.appendChild(peek);
    var ticketBelow = false;
    var mq = window.matchMedia
      ? window.matchMedia("(max-width: 1000px)")
      : null;
    function syncPeek() {
      var on = interacted && ticketBelow && !!(mq && mq.matches);
      peekName.textContent = title.textContent;
      peek.classList.toggle("is-on", on);
      peek.setAttribute("aria-hidden", on ? "false" : "true");
      peek.tabIndex = on ? 0 : -1;
    }
    peek.addEventListener("click", function () {
      card.scrollIntoView({ behavior: smooth, block: "start" });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          var e = entries[entries.length - 1];
          ticketBelow = !e.isIntersecting && e.boundingClientRect.top > 0;
          syncPeek();
        },
        { threshold: 0.15 },
      ).observe(card);
    }
    if (mq && mq.addEventListener) mq.addEventListener("change", syncPeek);

    /* ---------- gulir chip ke daerah terpilih ---------- */
    var raf = 0;
    function reveal() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var on = list.querySelector('[aria-pressed="true"]');
        if (!on || !list.scrollTo) return;
        var horizontal =
          list.scrollWidth > list.clientWidth + 4 &&
          getComputedStyle(list).flexWrap === "nowrap";
        if (horizontal)
          list.scrollTo({
            left: on.offsetLeft - (list.clientWidth - on.offsetWidth) / 2,
            behavior: smooth,
          });
      });
    }

    /* ---------- mulai ---------- */
    applyFilter();
    var wanted = "";
    try {
      wanted = new URLSearchParams(location.search).get("daerah") || "";
    } catch (e) {}
    var start =
      SAFE.test(wanted) && (BY[wanted] || wanted === "lainnya") ? wanted : "";
    if (!start) {
      var ket = BY.ketapang ? "ketapang" : DATA[0] && DATA[0].id;
      start = ket;
    }
    select(start, "init");
    setTimeout(function () {
      ready = true;
    }, 0);
    stage.classList.add("is-ready");
  }

  /* ================= gambar peta ================= */
  function drawMap(svg, landD, hq) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("aria-hidden", "true");

    var defs = sv("defs", null, svg);
    var cp = sv("clipPath", { id: "mapLandClip" }, defs);
    sv("path", { d: landD }, cp);

    var gLand = sv(
      "linearGradient",
      { id: "lvLand", x1: "0", y1: "0", x2: "1", y2: "1" },
      defs,
    );
    sv("stop", { offset: "0", "stop-color": "#f6f5ee" }, gLand);
    sv("stop", { offset: "0.55", "stop-color": "#eeeee3" }, gLand);
    sv("stop", { offset: "1", "stop-color": "#e1e8d9" }, gLand);

    var gSea = sv(
      "radialGradient",
      { id: "lvSea", cx: "0.35", cy: "0.4", r: "0.8" },
      defs,
    );
    sv(
      "stop",
      { offset: "0", "stop-color": "#1f4d3b", "stop-opacity": "0.55" },
      gSea,
    );
    sv(
      "stop",
      { offset: "1", "stop-color": "#12372a", "stop-opacity": "0" },
      gSea,
    );

    var blur = sv(
      "filter",
      { id: "lvBlur", x: "-20%", y: "-20%", width: "140%", height: "140%" },
      defs,
    );
    sv("feGaussianBlur", { stdDeviation: "14" }, blur);

    var grat = sv(
      "pattern",
      {
        id: "lvGrat",
        width: "100",
        height: "100",
        patternUnits: "userSpaceOnUse",
      },
      defs,
    );
    sv(
      "path",
      {
        d: "M100 0H0V100",
        fill: "none",
        stroke: "#fff",
        "stroke-opacity": "0.07",
        "stroke-width": "1",
      },
      grat,
    );

    /* --- laut --- */
    var sea = sv("g", { class: "map-sea-layer" }, svg);
    sv("rect", { width: "1000", height: "1000", fill: "url(#lvSea)" }, sea);
    sv("rect", { width: "1000", height: "1000", fill: "url(#lvGrat)" }, sea);
    [
      [84, "map-halo h3"],
      [52, "map-halo h2"],
      [26, "map-halo h1"],
    ].forEach(function (h) {
      sv("path", { d: landD, class: h[1], "stroke-width": h[0] }, sea);
    });
    var waves = sv("g", { class: "map-waves" }, sea);
    [
      [70, 560],
      [110, 640],
      [60, 760],
      [120, 840],
      [90, 130],
      [60, 300],
    ].forEach(function (w, i) {
      var x = w[0],
        y = w[1];
      sv(
        "path",
        {
          d: "M" + x + " " + y + " q 18 -14 36 0 t 36 0 t 36 0 t 36 0",
          class: "map-wave",
          style: "animation-delay:" + -i * 1.3 + "s",
        },
        waves,
      );
    });

    /* --- daratan --- */
    sv(
      "path",
      {
        d: landD,
        class: "map-shadow",
        transform: "translate(8 18)",
        filter: "url(#lvBlur)",
      },
      svg,
    );
    sv("path", { d: landD, class: "map-land", fill: "url(#lvLand)" }, svg);
    var tiers = sv(
      "g",
      { "clip-path": "url(#mapLandClip)", class: "map-tiers" },
      svg,
    );
    [
      [0.93, -1.5],
      [0.82, 2],
      [0.7, -2.5],
      [0.58, 3],
      [0.46, -3],
      [0.34, 2],
    ].forEach(function (t, i) {
      sv(
        "path",
        {
          d: landD,
          class: "map-tier",
          style: "animation-delay:" + (0.25 + i * 0.12) + "s",
          transform:
            "translate(720 300) rotate(" +
            t[1] +
            ") scale(" +
            t[0] +
            ") translate(-720 -300)",
        },
        tiers,
      );
    });
    var rivers = sv(
      "g",
      { "clip-path": "url(#mapLandClip)", class: "map-rivers" },
      svg,
    );
    [
      "M860 250 C820 300 780 350 735 380 S690 450 650 470 S570 470 515 485 S400 520 322 500",
      "M420 330 C410 380 380 440 330 495",
      "M560 880 C540 800 500 740 450 700 S380 620 335 520",
      "M800 200 C790 240 780 270 745 300",
    ].forEach(function (d, i) {
      sv(
        "path",
        { d: d, class: "map-river r" + (i === 0 ? "0" : "1"), pathLength: "1" },
        rivers,
      );
    });
    sv("path", { d: landD, class: "map-coast" }, svg);

    /* --- pusat distribusi & jalur --- */
    var route = sv("g", { class: "map-route" }, svg);
    var base = sv("path", { class: "route-base", d: "M0 0" }, route);
    var draw = sv(
      "path",
      { class: "route-draw", d: "M0 0", pathLength: "1" },
      route,
    );
    var dots = sv("g", { class: "route-dots" }, route);
    var target = sv("g", { class: "route-target" }, route);
    sv("circle", { r: "30", class: "tg-ring" }, target);
    var hqg = null;
    if (hq) {
      hqg = sv(
        "g",
        {
          class: "map-hq",
          transform: "translate(" + hq.x * 10 + " " + hq.y * 10 + ")",
        },
        svg,
      );
      sv("circle", { r: "26", class: "hq-ring" }, hqg);
      sv("circle", { r: "40", class: "hq-ring hq-ring2" }, hqg);
    }
    var reduce = !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    function show(to, from) {
      while (dots.firstChild) dots.removeChild(dots.firstChild);
      route.classList.remove("on");
      if (!to || !from || to === from) {
        target.setAttribute("opacity", "0");
        return;
      }
      var x1 = from.x * 10,
        y1 = from.y * 10,
        x2 = to.x * 10,
        y2 = to.y * 10;
      var mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2;
      var dx = x2 - x1,
        dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var bend = Math.min(140, len * 0.28) * (dx >= 0 ? -1 : 1);
      var cx = mx + (-dy / len) * bend,
        cy = my + (dx / len) * bend;
      var d = "M" + x1 + " " + y1 + " Q" + cx + " " + cy + " " + x2 + " " + y2;
      base.setAttribute("d", d);
      draw.setAttribute("d", d);
      target.setAttribute("transform", "translate(" + x2 + " " + y2 + ")");
      target.setAttribute("opacity", "1");
      void route.getBoundingClientRect();
      route.classList.add("on");
      if (!reduce) {
        for (var i = 0; i < 2; i++) {
          var c = sv(
            "circle",
            { r: i ? "3.5" : "5", class: "route-dot" },
            dots,
          );
          var m = sv(
            "animateMotion",
            {
              dur: Math.max(2.4, len / 150) + "s",
              repeatCount: "indefinite",
              begin: i * 1.1 + "s",
              path: d,
            },
            c,
          );
        }
      }
    }
    function moveHq(h) {
      if (hqg)
        hqg.setAttribute(
          "transform",
          "translate(" + h.x * 10 + " " + h.y * 10 + ")",
        );
    }
    return { show: show, moveHq: moveHq };
  }

  /* ================= hiasan panggung ================= */
  function decorateStage(stage) {
    var glow = el("div", "map-glow");
    glow.setAttribute("aria-hidden", "true");
    stage.insertBefore(glow, stage.firstChild);

    var north = stage.querySelector(".map-north");
    if (north) {
      north.textContent = "";
      north.setAttribute("aria-hidden", "true");
      north.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3l4 9h-8z" fill="currentColor"/><path d="M12 21l-4-8h8z" fill="currentColor" opacity=".35"/></svg><b>U</b>';
    }
    if (!stage.querySelector(".map-sea-2")) {
      var s2 = el("span", "map-sea map-sea-2", "Selat Karimata");
      s2.setAttribute("aria-hidden", "true");
      stage.appendChild(s2);
    }

    var coarse =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    var reduce = !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    if (coarse) return;
    var tick = 0,
      px = 0,
      py = 0;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (tick) return;
      tick = requestAnimationFrame(function () {
        tick = 0;
        stage.style.setProperty("--gx", px + "px");
        stage.style.setProperty("--gy", py + "px");
        if (!reduce) {
          stage.style.setProperty(
            "--sx",
            ((px / r.width - 0.5) * -14).toFixed(1) + "px",
          );
          stage.style.setProperty(
            "--sy",
            ((py / r.height - 0.5) * -14).toFixed(1) + "px",
          );
        }
      });
    });
    stage.addEventListener("pointerenter", function () {
      stage.classList.add("is-lit");
    });
    stage.addEventListener("pointerleave", function () {
      stage.classList.remove("is-lit");
      stage.style.setProperty("--sx", "0px");
      stage.style.setProperty("--sy", "0px");
    });
  }
})();
