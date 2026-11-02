/* ASJ Group — lapisan interaksi (pasangan css/interaksi.css).
   Hanya peningkat: bila skrip ini gagal, situs tetap utuh.
   1. Panah di ujung tombol/tautan dibungkus agar bisa bergeser saat hover
   2. Header diberi bayangan tipis setelah halaman di-scroll
   3. Angka keranjang "memantul" saat berubah
   4. Elemen terpilih muncul halus saat masuk layar */
(function () {
  "use strict";
  try {
    init();
  } catch (e) {
    /* abaikan: ini hanya hiasan */
  }

  function init() {
    var reduce = !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    /* ---------- 1. Panah ---------- */
    var ARROWS = {
      "→": "right",
      "←": "left",
      "↑": "up",
      "↓": "down",
      "↗": "up-right",
      "↖": "up-left",
      "↙": "down-left",
      "↘": "down-right",
    };
    var TAIL = /\s*([→←↑↓↗↖↙↘])\s*$/;
    function wrapArrows(root) {
      var els = (root || document).querySelectorAll("a, button");
      Array.prototype.forEach.call(els, function (el) {
        if (el.querySelector(":scope > .arr")) return;
        var last = el.lastChild;
        while (last && last.nodeType === 3 && !last.nodeValue.trim())
          last = last.previousSibling;
        if (!last || last.nodeType !== 3) return;
        var m = TAIL.exec(last.nodeValue);
        if (!m) return;
        var head = last.nodeValue.slice(0, m.index);
        var span = document.createElement("span");
        span.className = "arr";
        span.setAttribute("aria-hidden", "true");
        span.setAttribute("data-dir", ARROWS[m[1]] || "right");
        span.textContent = m[1];
        last.nodeValue = head + " ";
        el.insertBefore(span, last.nextSibling);
      });
    }
    wrapArrows();
    /* konten yang dirender belakangan (kartu produk, keranjang, dll.) */
    if ("MutationObserver" in window) {
      var t = 0;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () {
          wrapArrows();
        }, 250);
      }).observe(document.body, { childList: true, subtree: true });
    }

    /* ---------- 2. Header ---------- */
    var header = document.querySelector(".site-header");
    if (header) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          header.classList.toggle("is-scrolled", window.scrollY > 6);
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ---------- 3. Angka keranjang ---------- */
    if ("MutationObserver" in window && !reduce) {
      var seen = typeof WeakSet === "function" ? new WeakSet() : null;
      var watchBadge = function (b) {
        if (seen) {
          if (seen.has(b)) return;
          seen.add(b);
        }
        var last = b.textContent;
        new MutationObserver(function () {
          var now = b.textContent;
          if (now === last) return;
          last = now;
          b.classList.remove("is-bump");
          void b.offsetWidth;
          b.classList.add("is-bump");
        }).observe(b, { childList: true, characterData: true, subtree: true });
        b.addEventListener("animationend", function () {
          b.classList.remove("is-bump");
        });
      };
      var scan = function () {
        Array.prototype.forEach.call(
          document.querySelectorAll(".cart-badge"),
          watchBadge,
        );
      };
      scan();
      window.addEventListener("load", scan);
    }

    /* ---------- 4. Muncul saat di-scroll ---------- */
    if (reduce || !("IntersectionObserver" in window)) return;
    var SELECTOR = ".section-head, .value-card, .help-item, .asj-points li";
    var SKIP =
      ".hero, #cara-pesan, .product-modal, .cart-panel, [data-no-reveal]";
    var targets = Array.prototype.filter.call(
      document.querySelectorAll(SELECTOR),
      function (el) {
        return !el.closest(SKIP);
      },
    );
    if (!targets.length) return;

    /* jeda berurutan untuk saudara dalam satu induk (maks. 5 langkah) */
    var count = new Map();
    targets.forEach(function (el) {
      var n = count.get(el.parentNode) || 0;
      count.set(el.parentNode, n + 1);
      el.style.setProperty("--rv-d", Math.min(n, 5) * 70 + "ms");
      el.classList.add("rv");
    });
    document.documentElement.classList.add("js-rv");

    /* setelah muncul, lepas kelas agar transisi hover milik elemen itu kembali normal */
    function settle(el) {
      el.classList.remove("rv", "rv-in");
      el.style.removeProperty("--rv-d");
    }
    function reveal(el) {
      el.classList.add("rv-in");
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        settle(el);
      };
      el.addEventListener("transitionend", function (ev) {
        if (ev.target === el && ev.propertyName === "transform") finish();
      });
      setTimeout(finish, 1500); /* jaring pengaman */
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          reveal(e.target);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach(function (el) {
      io.observe(el);
    });

    /* jaring pengaman: bila setelah 4 detik ada yang belum tampil padahal sudah terlewati */
    setTimeout(function () {
      targets.forEach(function (el) {
        if (
          el.classList.contains("rv") &&
          !el.classList.contains("rv-in") &&
          el.getBoundingClientRect().top < window.innerHeight
        ) {
          reveal(el);
        }
      });
    }, 4000);
    window.addEventListener("beforeprint", function () {
      targets.forEach(function (el) {
        settle(el);
      });
    });
  }
})();
