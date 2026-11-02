/* SATU SUMBER DATA SALES — ubah file ini, semua halaman ikut berubah.
 * Semua entri di bawah adalah CONTOH pemetaan sales, bukan klaim cabang resmi.
 * wa: format internasional tanpa +/spasi (62...), verified: true HANYA setelah dikonfirmasi.
 * x/y: posisi pada peta ilustratif, bukan koordinat GPS. Jangan digunakan untuk rute kantor.
 * Nomor placeholder 6200000000000 (62 + angka nol) mudah dicari dengan keyword 00000000000.
 * Nomor dengan verified: false, atau yang diawali 620, otomatis diblokir. Tidak ada pengiriman otomatis.
 *
 * Cara menambah wilayah: tambahkan satu baris branch(...) di bawah.
 * Cara mengonfirmasi nomor: ganti wa dengan nomor asli dan beri verified = true.
 */
(() => {
  "use strict";

  const PLACEHOLDER_WA = "6200000000000";
  const PLACEHOLDER_ADDRESS = "Alamat cabang belum diisi.";

  const branch = (id, label, x, y, wa = PLACEHOLDER_WA, verified = false) => ({
    id,
    label,
    sales: `Sales ${label}`,
    wa,
    verified,
    address: PLACEHOLDER_ADDRESS,
    x,
    y,
  });

  const branches = [
    branch("pontianak", "Pontianak", 32, 50, "6285792951129", true),
    branch("singkawang", "Singkawang", 25, 31, "6285754365803", true),
    branch("kuburaya", "Kubu Raya", 39, 60, "000000000000", true),
    branch("mempawah", "Mempawah", 28, 41, "000000000000", true),
    branch("sambas", "Sambas", 32, 20, "000000000000", true),
    branch("bengkayang", "Bengkayang", 41, 33, "6285754365803", true),
    branch("landak", "Landak", 51, 43, "6285754365803", true),
    branch("sanggau", "Sanggau", 65, 47, "6285754365803", true),
    branch("sekadau", "Sekadau", 73, 38, "6285754365803", true),
    branch("sintang", "Sintang", 82, 29, "6285754365803", true),
    branch("kayongutara", "Kayong Utara", 43, 75, "6285754365803", true),
    branch("ketapang", "Ketapang", 57, 88, "6285754365803", true),
    // Opsi cadangan (tanpa posisi peta) — selalu terakhir
    {
      id: "lainnya",
      label: "Daerah lain / belum tahu",
      sales: "Admin penentuan wilayah",
      wa: PLACEHOLDER_WA,
      verified: false,
      address: "Sebutkan alamat tujuan lengkap.",
    },
  ];

  window.ASJ_LOCATIONS = {
    branches,
    regions: branches, // alias lama, merujuk ke array yang sama
    adminWhatsApp: PLACEHOLDER_WA,
  };
})();
