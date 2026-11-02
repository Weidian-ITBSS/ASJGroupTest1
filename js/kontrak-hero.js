/* Kontak: tombol "Salin" di kartu Hubungi langsung.
   Dibuat lewat JS (progressive enhancement): tanpa JS, tautan telepon dan
   email tetap bisa diklik. Teks yang disalin diambil dari data-copy. */
(function () {
  "use strict";
  if (window.__asjKontakHero) return;
  window.__asjKontakHero = true;

  function ready(fn) {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          done(true);
        },
        function () {
          legacy();
        },
      );
      return;
    }
    legacy();
    function legacy() {
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
  }

  ready(function () {
    var live = document.createElement("span");
    live.className = "sr-only";
    live.setAttribute("role", "status");
    live.style.cssText =
      "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
    document.body.appendChild(live);

    Array.prototype.forEach.call(
      document.querySelectorAll(".contact-facts dd[data-copy]"),
      function (dd) {
        var row = dd.parentNode;
        var label = row.querySelector("dt");
        var b = document.createElement("button");
        b.type = "button";
        b.className = "fact-copy";
        b.textContent = "Salin";
        b.setAttribute(
          "aria-label",
          "Salin " + (label ? label.textContent.trim().toLowerCase() : "data"),
        );
        var timer = 0;
        b.addEventListener("click", function () {
          copyText(dd.getAttribute("data-copy"), function (ok) {
            b.textContent = ok ? "Tersalin ✓" : "Gagal";
            b.classList.toggle("is-done", ok);
            live.textContent = ok ? "Tersalin ke papan klip" : "Gagal menyalin";
            clearTimeout(timer);
            timer = setTimeout(function () {
              b.textContent = "Salin";
              b.classList.remove("is-done");
              live.textContent = "";
            }, 1800);
          });
        });
        row.appendChild(b);
      },
    );
  });
})();