/* ============================================================
   REFINEMENTS
   1. Empty state katalog (saat filter tidak menemukan produk)
   2. Aksesibilitas semua panel: role dialog, fokus, Esc, focus trap,
      kunci scroll body
   ============================================================ */
(() => {
  "use strict";

  const onReady = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  /* ---------- 1. Empty state katalog ---------- */
  function initCatalogEmptyState() {
    const grid = document.getElementById("lotGrid");
    const empty = document.getElementById("catalogEmpty");
    if (!grid || !empty) return;

    let queued = false;
    const update = () => {
      queued = false;
      empty.hidden = Boolean(grid.querySelector(".lot:not([hidden])"));
    };
    // Filter mengubah banyak atribut sekaligus; cukup cek sekali per frame
    const scheduleUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    new MutationObserver(scheduleUpdate).observe(grid, {
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });
    update();

    document.getElementById("resetCatalog")?.addEventListener("click", () => {
      const search = document.getElementById("searchInput");
      if (search) search.value = "";
      document.querySelector(".saring-reset")?.click();
      search?.focus();
    });
  }

  /* ---------- 2. Panel (modal, keranjang, drawer, lightbox) ---------- */
  const PANELS = [
    {
      id: "productModal",
      labelledBy: "productModalName",
      closeId: "productModalClose",
    },
    { id: "cartPanel", label: "Pesanan Anda", closeId: "cartCloseBtn" },
    { id: "mobileDrawer", label: "Menu navigasi", closeId: "drawerClose" },
    { id: "lightbox", label: "Pratinjau gambar", closeId: "lightboxClose" },
  ];
  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
  const DESKTOP_QUERY = "(min-width: 981px)";

  function initPanels() {
    const panels = PANELS.map((config) => {
      const el = document.getElementById(config.id);
      if (!el) return null;
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("tabindex", "-1");
      if (config.labelledBy)
        el.setAttribute("aria-labelledby", config.labelledBy);
      else el.setAttribute("aria-label", config.label);
      return { el, closeId: config.closeId };
    }).filter(Boolean);

    const drawer = document.getElementById("mobileDrawer");
    const menuToggle = document.getElementById("menuToggle");
    const isOpen = (el) => el?.classList.contains("open");

    let backdrop = null;
    if (drawer) {
      backdrop = document.createElement("div");
      backdrop.className = "menu-backdrop";
      backdrop.hidden = true;
      document.body.append(backdrop);
    }

    const closePanel = ({ el, closeId }) => {
      const closeButton = document.getElementById(closeId);
      if (closeButton) closeButton.click();
      else el.classList.remove("open");
    };
    const topOpenPanel = () => panels.findLast((p) => isOpen(p.el));

    const syncPageState = () => {
      document.body.classList.toggle(
        "no-scroll",
        panels.some((p) => isOpen(p.el)),
      );
      menuToggle?.setAttribute("aria-expanded", String(isOpen(drawer)));
      if (backdrop) backdrop.hidden = !isOpen(drawer);
    };

    panels.forEach(({ el }) => {
      let wasOpen = isOpen(el);
      let previousFocus = null;

      el.inert = !wasOpen;
      el.setAttribute("aria-hidden", String(!wasOpen));

      new MutationObserver(() => {
        const open = isOpen(el);
        if (open === wasOpen) return;
        wasOpen = open;

        el.inert = !open;
        el.setAttribute("aria-hidden", String(!open));

        if (open) {
          previousFocus = document.activeElement;
          requestAnimationFrame(() => {
            (
              el.querySelector("button,a[href],input,select,textarea") || el
            ).focus({ preventScroll: true });
          });
        } else if (previousFocus && document.contains(previousFocus)) {
          previousFocus.focus({ preventScroll: true });
        }
        syncPageState();
      }).observe(el, { attributes: true, attributeFilter: ["class"] });
    });

    const drawerPanel = panels.find((p) => p.el === drawer);
    backdrop?.addEventListener(
      "click",
      () => drawerPanel && closePanel(drawerPanel),
    );
    drawer
      ?.querySelectorAll("a")
      .forEach((a) =>
        a.addEventListener(
          "click",
          () => drawerPanel && closePanel(drawerPanel),
        ),
      );

    document.addEventListener("keydown", (event) => {
      const panel = topOpenPanel();
      if (!panel) return;

      if (event.key === "Escape") {
        closePanel(panel);
        return;
      }
      if (event.key !== "Tab") return;

      // Focus trap: Tab berputar di dalam panel yang sedang terbuka
      const focusable = [...panel.el.querySelectorAll(FOCUSABLE)].filter(
        (n) => n.getClientRects().length,
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) {
        event.preventDefault();
        panel.el.focus();
        return;
      }
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === panel.el)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // matchMedia hanya memicu saat melewati breakpoint (bukan di setiap resize)
    window.matchMedia(DESKTOP_QUERY).addEventListener("change", (e) => {
      if (e.matches && isOpen(drawer) && drawerPanel) closePanel(drawerPanel);
    });

    syncPageState();
  }

  onReady(() => {
    initCatalogEmptyState();
    initPanels();
  });
})();
