/* Tentang: section "Lini Produk".
   - Kartu masuk berurutan saat terlihat di layar
   - Angka kategori menghitung naik (nilainya tetap dari angka-katalog.js)
   - Jumlah total di kartu ajakan dihitung dari angka tiap kategori
   Tanpa JS, semua kartu tetap tampil normal. */
(function () {
  "use strict";
  if (window.__asjLini) return;
  window.__asjLini = true;

  var reduce = !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  function ready(fn) {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  ready(function () {
    var grid = document.getElementById("lineGrid");
    if (!grid) return;
    var counts = Array.prototype.slice.call(
      grid.querySelectorAll(".line-count"),
    );
    var total = document.getElementById("lineTotal");
    var visible = false;

    function target(el) {
      var n = parseInt(el.getAttribute("data-final") || el.textContent, 10);
      return isFinite(n) ? n : 0;
    }
    function sumTotal() {
      var s = 0;
      counts.forEach(function (c) {
        s += target(c);
      });
      return s;
    }
    function setTotal(v) {
      if (total) total.textContent = String(v);
    }

    /* hitung naik: tiap angka dari 0 ke nilai akhir */
    function animate(el, to) {
      if (reduce || to <= 0) {
        el.textContent = pad(to);
        return;
      }
      var t0 = 0,
        dur = 900 + Math.min(to, 30) * 12;
      el.setAttribute("data-final", String(to));
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = pad(Math.round(to * e));
        if (p < 1) requestAnimationFrame(step);
        else el.setAttribute("data-done", "1");
      }
      requestAnimationFrame(step);
    }
    function run() {
      counts.forEach(function (c) {
        if (c.getAttribute("data-done") || c.getAttribute("data-run")) return;
        var to = target(c);
        if (to <= 0) return; /* menunggu angka-katalog.js */
        c.setAttribute("data-run", "1");
        animate(c, to);
      });
      var s = sumTotal();
      if (s > 0) setTotal(s);
    }

    /* angka bisa diisi belakangan oleh angka-katalog.js */
    if (window.MutationObserver)
      counts.forEach(function (c) {
        new MutationObserver(function () {
          if (c.getAttribute("data-run")) return; /* perubahan dari animasi */
          if (visible) run();
          else {
            var s = sumTotal();
            if (s > 0) setTotal(s);
          }
        }).observe(c, { childList: true, characterData: true, subtree: true });
      });

    /* kartu masuk berurutan */
    Array.prototype.forEach.call(grid.children, function (el, i) {
      el.style.setProperty("--i", i);
    });
    function reveal() {
      grid.classList.add("is-in");
      visible = true;
      run();
    }
    if (reduce || !("IntersectionObserver" in window)) {
      reveal();
      return;
    }
    grid.classList.add("is-armed");
    var io = new IntersectionObserver(
      function (es) {
        if (es[0].isIntersecting) {
          io.disconnect();
          reveal();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(grid);
  });
})();