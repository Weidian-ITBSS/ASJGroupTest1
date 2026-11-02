"use strict";
/* Pratinjau WhatsApp bersama (shared) yang dijaga ketat.
 * Situs ini TIDAK mengirim atau memproses pesanan/pembayaran.
 * API publik: window.ASJ_SALES = { find(id), valid(branch), open(id, message) }
 */
(() => {
  const locations = window.ASJ_LOCATIONS;
  if (!Array.isArray(locations?.branches)) {
    console.error(
      "[ASJ] Data wilayah tidak ditemukan. Pastikan js/locations.js dimuat sebelum sales.js.",
    );
    return;
  }

  const { branches } = locations;
  const WA_PATTERN = /^62[1-9]\d{7,12}$/;
  const REGION_STORAGE_KEY = "asj_cart_region";

  const findBranch = (id) => branches.find((b) => b.id === id);
  const isActive = (branch) =>
    Boolean(branch) && branch.verified === true && WA_PATTERN.test(branch.wa);

  const DIALOG_HTML = `
    <button type="button" class="preview-close" aria-label="Tutup pratinjau">×</button>
    <span class="section-kicker">Periksa sebelum mengirim</span>
    <h2 id="previewTitle">Sales yang tepat.<br>Pesanan yang jelas.</h2>
    <div class="preview-recipient"><span id="previewRegion"></span><strong id="previewPhone"></strong></div>
    <p id="previewNotice" class="preview-notice"></p>
    <label for="previewText">Pesan untuk sales <small>Anda dapat menambahkan alamat lengkap.</small></label>
    <textarea id="previewText" rows="7"></textarea>
    <div class="preview-actions">
      <button type="button" class="btn btn-outline" id="copyOrder">Salin pesan</button>
      <a class="btn btn-solid" id="sendOrder" target="_blank" rel="noopener noreferrer">Buka WhatsApp</a>
    </div>
    <p id="copyStatus" class="copy-status" role="status"></p>
    <small>Belum ada pesanan dikirim atau pembayaran diproses. Anda menekan kirim sendiri di WhatsApp.</small>`;

  let dialog = null;
  let ui = null; // referensi elemen, diisi saat dialog dibuat
  let selectedBranch = null;
  let returnFocusTo = null;

  function isClickOutside(event, element) {
    const rect = element.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  }

  function updateSendLink() {
    if (isActive(selectedBranch)) {
      ui.send.href = `https://wa.me/${selectedBranch.wa}?text=${encodeURIComponent(ui.text.value)}`;
    } else {
      ui.send.removeAttribute("href");
    }
  }

  async function copyMessage() {
    const done = (message) => (ui.status.textContent = message);
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API tidak tersedia");
      await navigator.clipboard.writeText(ui.text.value);
      done(
        isActive(selectedBranch)
          ? "Pesan berhasil disalin."
          : "Pesan disalin. Tempelkan saat nomor resmi sudah tersedia.",
      );
    } catch {
      // Cadangan untuk browser lama / konteks non-HTTPS
      ui.text.focus();
      ui.text.select();
      try {
        if (!document.execCommand("copy")) throw new Error("copy ditolak");
        done("Pesan berhasil disalin.");
      } catch {
        done("Pilih dan salin teks di atas secara manual (Ctrl/Cmd+C).");
      }
    }
  }

  function buildDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "sales-dialog";
    dialog.id = "salesPreview";
    dialog.setAttribute("aria-labelledby", "previewTitle");
    dialog.innerHTML = DIALOG_HTML;
    document.body.append(dialog);

    ui = {
      close: dialog.querySelector(".preview-close"),
      region: dialog.querySelector("#previewRegion"),
      phone: dialog.querySelector("#previewPhone"),
      notice: dialog.querySelector("#previewNotice"),
      text: dialog.querySelector("#previewText"),
      copy: dialog.querySelector("#copyOrder"),
      send: dialog.querySelector("#sendOrder"),
      status: dialog.querySelector("#copyStatus"),
    };

    // Cegah Esc/Tab milik dialog bocor ke handler panel lain di halaman
    dialog.addEventListener("keydown", (e) => e.stopPropagation());
    ui.close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog && isClickOutside(e, dialog)) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("preview-open");
      returnFocusTo?.focus({ preventScroll: true });
    });

    ui.copy.addEventListener("click", copyMessage);
    ui.text.addEventListener("input", updateSendLink);
    ui.send.addEventListener("click", (e) => {
      if (!isActive(selectedBranch)) {
        e.preventDefault();
        ui.status.textContent =
          "Nomor ini belum aktif. Tidak ada tautan WhatsApp yang dibuka.";
      } else {
        updateSendLink();
      }
    });
  }

  /** Isi dropdown wilayah di halaman kontak (jika ada). */
  function populateContactRegions() {
    const select = document.getElementById("contactRegion");
    if (!select) return;

    const fragment = document.createDocumentFragment();
    branches.forEach((branch) => {
      const option = document.createElement("option");
      option.value = branch.id;
      option.textContent = branch.label;
      fragment.append(option);
    });
    select.append(fragment);

    try {
      const savedId = localStorage.getItem(REGION_STORAGE_KEY);
      if (findBranch(savedId)) select.value = savedId;
    } catch {
      /* localStorage diblokir (mis. mode privat) — abaikan */
    }
  }

  function openPreview(branchId, message = "") {
    const branch = findBranch(branchId);
    if (!branch) return;
    selectedBranch = branch;

    if (!dialog) buildDialog(); // dibuat saat pertama kali dibutuhkan
    returnFocusTo = document.activeElement;

    const active = isActive(branch);
    ui.region.textContent = `${branch.sales} · ${branch.label}`;
    ui.phone.textContent = branch.wa;
    ui.notice.textContent = active
      ? "Periksa penerima dan isi pesan. WhatsApp akan dibuka setelah Anda melanjutkan."
      : "Mode contoh: nomor belum aktif. Anda dapat meninjau atau menyalin pesan; pengiriman WhatsApp dinonaktifkan.";
    ui.text.value = message;
    ui.status.textContent = "";
    ui.send.setAttribute("aria-disabled", String(!active));
    ui.send.textContent = active ? "Buka WhatsApp" : "WhatsApp belum aktif";
    ui.send.tabIndex = active ? 0 : -1;
    updateSendLink();

    if (!dialog.open) dialog.showModal();
    document.body.classList.add("preview-open");
    ui.close.focus();
  }

  window.ASJ_SALES = { find: findBranch, valid: isActive, open: openPreview };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", populateContactRegions, {
      once: true,
    });
  } else {
    populateContactRegions();
  }
})();
