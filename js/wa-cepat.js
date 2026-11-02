"use strict";
/* WhatsApp CEPAT + pelacakan.
   1. Tombol WhatsApp (mengambang, footer, menu seluler) membuka pop-up kecil berisi
      sales yang nomornya sudah terverifikasi. Pesan terisi otomatis dengan halaman
      yang sedang dibuka. Tanpa JS atau tanpa sales aktif, tautan tetap ke kontak.html.
   2. Setiap pembukaan pratinjau WhatsApp dicatat ke Google Analytics (event
      "whatsapp_open") bila GA aktif. Tidak ada data pribadi yang dikirim.
   Dimuat SETELAH locations.js, sales.js, dan main.js. */
(() => {
  const sales = window.ASJ_SALES;
  const branches = window.ASJ_LOCATIONS?.branches;
  if (!sales || !Array.isArray(branches)) return;

  const track = (name, params) => {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params);
    } catch {
      /* pelacakan tidak boleh mengganggu halaman */
    }
  };

  const originalOpen = sales.open;
  sales.open = (id, message) => {
    track("whatsapp_open", { region: id, page: location.pathname });
    return originalOpen(id, message);
  };

  const active = branches.filter((b) => b.id !== "lainnya" && sales.valid(b));
  if (!active.length) return; // tanpa sales aktif, biarkan tautan ke kontak.html

  const pageName = document.title.replace(/\s+—\s+ASJ Group$/, "");
  const defaultMessage = (b) =>
    `Halo ${b.sales}, saya melihat halaman "${pageName}" di situs ASJ Group.\n` +
    "Saya ingin bertanya tentang produk dan ketersediaan stok.\nDaerah saya: ";

  const pop = document.createElement("div");
  pop.className = "wa-pop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "Pilih sales WhatsApp");
  pop.innerHTML =
    "<h2>Chat langsung dengan sales</h2>" +
    "<p>Pilih sales terdekat. Anda bisa memeriksa pesan dulu sebelum dikirim.</p>" +
    '<ul class="wa-pop-list"></ul>' +
    '<a class="wa-pop-more" href="kontak.html">Daerah lain? Buka halaman Kontak</a>';
  const list = pop.querySelector(".wa-pop-list");
  active.forEach((b) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "wa-pop-btn";
    btn.textContent = b.label;
    btn.addEventListener("click", () => {
      close(false);
      sales.open(b.id, defaultMessage(b));
    });
    li.append(btn);
    list.append(li);
  });
  document.body.append(pop);

  let trigger = null;
  function close(restoreFocus = true) {
    if (pop.hidden) return;
    pop.hidden = true;
    if (restoreFocus) trigger?.focus({ preventScroll: true });
  }
  function openPop(from) {
    trigger = from;
    pop.hidden = false;
    pop.querySelector("button")?.focus({ preventScroll: true });
    track("whatsapp_popup", { page: location.pathname });
  }

  document.addEventListener("click", (e) => {
    const link = e.target instanceof Element ? e.target.closest("[data-wa-quick]") : null;
    if (link) {
      e.preventDefault();
      if (!pop.hidden) return close();
      // Menu seluler bersifat modal: tutup dulu agar pop-up bisa dijangkau keyboard
      if (link.closest("#mobileDrawer")) document.getElementById("drawerClose")?.click();
      return openPop(link);
    }
    if (!pop.hidden && !pop.contains(e.target)) close(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
