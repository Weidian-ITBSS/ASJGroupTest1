"use strict";
/* FAQ: pencarian + filter topik + pintasan tombol "/" */
(() => {
  const ALL_TOPICS = "semua";
  const LOCALE = "id";
  const TEXT_INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

  function init() {
    const searchInput = document.getElementById("faqSearch");
    const countLabel = document.getElementById("faqCount");
    const emptyState = document.getElementById("faqEmpty");
    const resetButton = document.getElementById("faqReset");
    const topicButtons = [...document.querySelectorAll("[data-topic]")];
    if (!searchInput) return; // bukan halaman FAQ

    // Teks huruf kecil di-cache sekali, bukan dihitung ulang tiap ketikan
    const entries = [...document.querySelectorAll(".help-item")].map((el) => ({
      el,
      category: el.dataset.category,
      text: el.textContent.toLocaleLowerCase(LOCALE),
    }));

    let activeTopic = ALL_TOPICS;

    const matchesTopic = (entry, topic) =>
      topic === ALL_TOPICS || entry.category === topic;

    function update() {
      const query = searchInput.value.trim().toLocaleLowerCase(LOCALE);
      let visibleCount = 0;

      entries.forEach((entry) => {
        const visible =
          matchesTopic(entry, activeTopic) && entry.text.includes(query);
        entry.el.hidden = !visible;
        if (visible) visibleCount++;
        else entry.el.open = false;
      });

      if (countLabel) countLabel.textContent = `${visibleCount} pertanyaan`;
      if (emptyState) emptyState.hidden = visibleCount > 0;
      topicButtons.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.topic === activeTopic),
        ),
      );
    }

    topicButtons.forEach((button) => {
      const badge = button.querySelector("span");
      if (badge) {
        badge.textContent = entries.filter((e) =>
          matchesTopic(e, button.dataset.topic),
        ).length;
      }
      button.addEventListener("click", () => {
        activeTopic = button.dataset.topic;
        update();
      });
    });

    searchInput.addEventListener("input", update);

    resetButton?.addEventListener("click", () => {
      searchInput.value = "";
      activeTopic = ALL_TOPICS;
      update();
      searchInput.focus();
    });

    // Tekan "/" untuk langsung fokus ke kolom pencarian
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      if (TEXT_INPUT_TAGS.has(target.tagName) || target.isContentEditable)
        return;
      e.preventDefault();
      searchInput.focus();
    });

    update();

    /* Tautan langsung: faq.html#pertanyaan-7 membuka jawabannya otomatis */
    function openFromHash() {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = id && document.getElementById(id);
      if (!target || !target.classList.contains("help-item")) return;
      if (target.hidden) {
        searchInput.value = "";
        activeTopic = ALL_TOPICS;
        update();
      }
      target.open = true;
      target.scrollIntoView({ block: "center" });
    }
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
