"use strict";
/* CARA PESAN: langkah yang bisa diklik + layar ponsel yang berganti.
   - Klik langkah (atau tombol panah) untuk berpindah.
   - Berganti otomatis tiap beberapa detik selama bagian ini terlihat.
   - Berhenti saat kursor/fokus berada di dalamnya.
   - Tidak ada otomatis bila pengunjung memilih "reduced motion". */
(() => {
  const root = document.getElementById("cara-pesan");
  const layout = root?.querySelector(".order-layout");
  if (!layout) return;

  const tabs = [...layout.querySelectorAll('[role="tab"]')];
  const items = tabs.map((tab) => tab.closest(".order-step"));
  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute("aria-controls")),
  );
  if (tabs.length < 2 || panels.some((p) => !p)) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0;

  function show(index, { focus = false } = {}) {
    if (index === current && !focus) return;
    current = index;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      items[i]?.classList.toggle("is-done", i < index);
      panels[i].classList.toggle("is-active", active);
      panels[i].setAttribute("aria-hidden", String(!active));
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => show(i)));
  layout.addEventListener("keydown", (event) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      show(event.key === "Home" ? 0 : tabs.length - 1, { focus: true });
    } else if (keys[event.key] && tabs.includes(document.activeElement)) {
      event.preventDefault();
      show((current + keys[event.key] + tabs.length) % tabs.length, {
        focus: true,
      });
    }
  });

  if (reduced) return; // tanpa pergantian otomatis

  // Pindah otomatis saat bar progres langkah aktif selesai terisi
  layout.addEventListener("animationend", (event) => {
    if (event.animationName === "orderFill") {
      show((current + 1) % tabs.length);
    }
  });

  const pause = (on) => layout.classList.toggle("is-paused", on);
  layout.addEventListener("mouseenter", () => pause(true));
  layout.addEventListener("mouseleave", () => pause(false));
  layout.addEventListener("focusin", () => pause(true));
  layout.addEventListener("focusout", () => pause(false));

  // Hanya berjalan saat bagian ini terlihat di layar
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => layout.classList.toggle("is-playing", entry.isIntersecting),
      { threshold: 0.4 },
    ).observe(layout);
  } else {
    layout.classList.add("is-playing");
  }
})();
