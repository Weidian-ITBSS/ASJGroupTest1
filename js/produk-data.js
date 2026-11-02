/* ==========================================================================
   DATA PRODUK ASJ GROUP
   --------------------------------------------------------------------------
   Ini SATU-SATUNYA file yang perlu kamu edit untuk mengubah katalog.
   Kartu produk, halaman detail, pencarian, filter, dan data SEO
   semuanya dibuat otomatis dari daftar di bawah (oleh produk-render.js).

   ▸ MENAMBAH PRODUK
     Salin satu blok  { ... },  tempel di bawah blok terakhir (sebelum tanda ]),
     lalu ganti isinya. Pastikan tiap blok diakhiri koma.

   ▸ MENGHAPUS PRODUK
     Hapus satu blok utuh dari  {  sampai  },

   ▸ ARTI SETIAP KOLOM
     id           WAJIB. Unik, mis. "p43". Dipakai keranjang, jadi JANGAN
                  diubah untuk produk yang sudah ada.
     no           Nomor yang tampil di kartu ("No. 1A") dan di link produk
                  (produk.html?produk=1A). Tidak boleh kembar.
     kategori     WAJIB. Salah satu dari: herbisida, insektisida, fungisida,
                  pupuk, hayati, alat, perlengkapan.
     nama         WAJIB. Nama produk.
     aktif        Bahan aktif / jenis singkat (baris di bawah nama).
     klasifikasi  Golongan atau jenis produk (untuk hayati tampil "Jenis").
     kemasan      Ukuran dipisah " / "  → otomatis jadi tombol pilihan ukuran.
                  Contoh: "1 L / 5 L / 20 L"
     noReg        OPSIONAL. Nomor pendaftaran RI dari label kemasan; bila diisi tampil
                  di kartu produk. Salin persis dari label resmi, jangan ditebak.
     ringkas      Kalimat singkat di kartu produk dan di "Kegunaan".
     foto         Alamat gambar, mis. "images/A_Herbisida/1_nama.jpg".
                  Dihapus atau dikosongkan → otomatis pakai gambar sementara.
     tanaman      Kunci untuk filter "Cocok untuk tanaman". Pilihan:
                  "sawit", "padi", "jagung", "kopi", "karet", "hortikultura"
     cocokUntuk   Teks yang tampil di detail produk, mis.
                  ["Kelapa sawit", "Karet (TBM)"]
                  Dikosongkan → tampil otomatis dari kolom tanaman di atas.
     keunggulan   Daftar keunggulan di detail produk, satu kalimat per baris:
                  ["Bekerja cepat ...", "Aman untuk ..."]
                  Dikosongkan → bagian keunggulan tidak ditampilkan.
     badge        Opsional: "terlaris" atau "promo".
     baru         Opsional: true untuk produk baru.
     kataKunci    Opsional: kata tambahan agar produk mudah ditemukan lewat
                  pencarian (nama, bahan aktif, kategori, dan tanaman sudah
                  otomatis ikut dicari).

   ▸ KALAU KATALOG TIBA-TIBA KOSONG
     Hampir selalu karena ada koma atau tanda kutip (") yang terlewat.
     Tekan F12 → tab Console; pesan merahnya menunjuk baris yang salah.
   ========================================================================== */

window.ASJ_PRODUCTS = [
  /* ═══════════ HERBISIDA ═══════════ */

  // ───── 1A · Prima-Kuat 276 SL ─────
  {
    id: "p01",
    no: "1A",
    kategori: "herbisida",
    nama: "Prima-Kuat 276 SL",
    aktif: "Parakuat diklorida 276 g/l",
    klasifikasi: "Grup D",
    kemasan: "250 mL / 500 mL / 1 L / 5 L / 20 L",
    ringkas:
      "Kontak purna tumbuh untuk mengendalikan gulma pada tanaman kelapa sawit.",
    foto: "images/A_Herbisida/1_prima-kuat-276.jpg",
    tanaman: ["sawit"],
    badge: "terlaris",
    cocokUntuk: [
      "Gulma berdaun lebar (Ottochloa nodosa, Asystasia intrusa)",
      "Gulma berdaun sempit / rumput-rumputan",
      "Pakis-pakisan pada piringan kelapa sawit",
    ],
    keunggulan: [
      "Bekerja Secara Kontak Dengan Seluruh Bagian Tumbuhan Gulma Yang Ada Diatas Permukaan Tanah",
      "Dapat Menurunkan Biaya Penyiangan Dalam Jangka Panjang",
      "Dilakukan Dengan Penutupan Mulsa Pada Permukaan Tanah",
      "Reaksi kerja sangat cepat (efek terbakar terlihat dalam hitungan jam)",
    ],
  },

  // ───── 2A · Omni-Top 276 SL ─────
  {
    id: "p02",
    no: "2A",
    kategori: "herbisida",
    nama: "Omni-Top 276 SL",
    aktif: "Parakuat diklorida 276 g/l",
    klasifikasi: "Grup D",
    kemasan: "4 L / 5 L",
    ringkas:
      "Larutan kontak purna tumbuh untuk gulma pada tanaman kelapa sawit.",
    foto: "images/A_Herbisida/2_omni-top-276.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar (Borreria alata, Ageratum conyzoides)",
      "Rumput ilalang dan rumput pahitan pada piringan sawit",
    ],
    keunggulan: [
      "Formulasi konsentrasi tinggi ampuh membasmi gulma membandel",
      "Sangat tahan hujan, tidak mudah terbilas jika hujan turun setelah aplikasi",
      "Aman untuk tanah karena langsung terdeaktivasi begitu menyentuh partikel tanah",
    ],
  },

  // ───── 3A · Omni-Tron 150 SL ─────
  {
    id: "p03",
    no: "3A",
    kategori: "herbisida",
    nama: "Omni-Tron 150 SL",
    aktif: "Parakuat diklorida 150 g/l",
    klasifikasi: "Grup D",
    kemasan: "1 L / 5 L / 20 L",
    ringkas: "Diformulasikan untuk gulma sasaran pada tanaman kopi.",
    foto: "images/A_Herbisida/3_omni-tron-150.png",
    tanaman: ["kopi"],
    cocokUntuk: [
      "Gulma berdaun lebar di perkebunan kopi",
      "Rumput gulma di sekitar piringan tanaman kopi",
    ],
    keunggulan: [
      "Dosis pas dan ekonomis untuk perawatan rutin lahan perkebunan kopi",
      "Mengendalikan gulma tanpa merusak perakaran dangkal tanaman utama",
      "Mencegah perebutan unsur hara tanah pada area piringan kopi",
    ],
  },

  // ───── 4A · Omni-Xone 276 SL ─────
  {
    id: "p04",
    no: "4A",
    kategori: "herbisida",
    nama: "Omni-Xone 276 SL",
    aktif: "Parakuat diklorida 276 g/l",
    klasifikasi: "Grup D",
    kemasan: "1 L / 4 L",
    ringkas:
      "Kontak purna tumbuh, larutan berwarna cokelat, untuk gulma di kelapa sawit.",
    foto: "images/A_Herbisida/4_omni-xone-276.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar (Mikania micrantha)",
      "Gulma berdaun sempit / rumput belulang",
    ],
    keunggulan: [
      "Kecepatan penyerapan tinggi pada jaringan hijau gulma",
      "Efektif mematikan gulma tingkat kerapatan tinggi dalam waktu singkat",
      "Penggunaan efisien untuk pembersihan jalur panen (pasar pikul) sawit",
    ],
  },

  // ───── 5A · Prima-Tron 135 SL ─────
  {
    id: "p05",
    no: "5A",
    kategori: "herbisida",
    nama: "Prima-Tron 135 SL",
    aktif: "Parakuat diklorida 135 g/l",
    klasifikasi: "Grup D",
    kemasan: "4 L",
    ringkas:
      "Larutan hijau tua untuk mengendalikan gulma pada tanaman kelapa sawit.",
    foto: "images/A_Herbisida/5_prima-tron-135.png",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma rumput-rumputan muda pada piringan kelapa sawit",
      "Gulma berdaun lebar lunak",
    ],
    keunggulan: [
      "Formulasi sedang yang ramah untuk perawatan rutin piringan sawit TBM",
      "Ekonomis dan efektif mengendalikan gulma awal penyebaran",
      "Larutan pekat yang mudah larut dan tercampur merata dalam air",
    ],
  },

  // ───── 6A · Redzone 276 SL ─────
  {
    id: "p06",
    no: "6A",
    kategori: "herbisida",
    nama: "Redzone 276 SL",
    aktif: "Parakuat diklorida 276 g/l",
    klasifikasi: "Herbisida terbatas",
    kemasan: "4 L",
    ringkas:
      "Untuk gulma berdaun lebar & rumput pada karet (TBM) dan kelapa sawit (TBM).",
    foto: "images/A_Herbisida/6_redzone-276.jpg",
    tanaman: ["sawit", "karet"],
    cocokUntuk: [
      "Gulma berdaun lebar & sempit pada Karet TBM",
      "Gulma berdaun lebar & sempit pada Kelapa Sawit TBM",
    ],
    keunggulan: [
      "Efisien membersihkan gulma pesaing pada Tanaman Belum Menghasilkan (TBM)",
      "Daya berantas kuat hingga ke pangkal batang gulma",
      "Mengurangi frekuensi penyiangan lahan secara signifikan",
    ],
  },

  // ───── 7A · Draxone 150 SL ─────
  {
    id: "p07",
    no: "7A",
    kategori: "herbisida",
    nama: "Draxone 150 SL",
    aktif: "Parakuat diklorida 150 g/l",
    klasifikasi: "Herbisida terbatas",
    kemasan: "4 L",
    ringkas:
      "Herbisida kontak purna tumbuh untuk gulma berdaun lebar dan rumput di sawit.",
    foto: "images/A_Herbisida/7_draxone-150.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar pada gawangan dan piringan sawit",
      "Rumput gulma kelas sedang",
    ],
    keunggulan: [
      "Penetrasi cepat ke dalam sel stomata daun gulma",
      "Hasil semprot cepat terlihat bersih dalam kurun waktu 24 jam",
      "Cocok digunakan pada berbagai kondisi kelembapan lahan",
    ],
  },

  // ───── 8A · Deltaxone 280 SL ─────
  {
    id: "p08",
    no: "8A",
    kategori: "herbisida",
    nama: "Deltaxone 280 SL",
    aktif: "Parakuat diklorida 280 g/l",
    klasifikasi: "Herbisida",
    kemasan: "4 L",
    ringkas:
      "Kontak purna tumbuh untuk gulma berdaun lebar & sempit pada kelapa sawit.",
    foto: "images/A_Herbisida/8_deltaxone-280.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma rumput tebal dan gulma berdaun lebar keras",
      "Area piringan dan pasar pikul kelapa sawit TM (Tanam Menghasilkan)",
    ],
    keunggulan: [
      "Konsentrasi bahan aktif ekstra tinggi (280 g/l) untuk gulma resisten",
      "Daya basmi maksimal sampai gulma bagian bawah",
      "Irit penggunaan volume semprot per hektar",
    ],
  },

  // ───── 9A · Glist Up 480 SL ─────
  {
    id: "p09",
    no: "9A",
    kategori: "herbisida",
    nama: "Glist Up 480 SL",
    aktif: "Isopropilamina glifosat 480 g/l",
    klasifikasi: "Grup G",
    kemasan: "10 L",
    ringkas:
      "Sistemik purna tumbuh untuk gulma rumput & berdaun lebar di kelapa sawit.",
    foto: "images/A_Herbisida/9_glistup-480.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma alang-alang (Imperata cylindrica)",
      "Gulma berdaun lebar & rumput tua berakar dalam",
    ],
    keunggulan: [
      "Bekerja secara sistemik ditranslokasikan hingga membunuh akar dan rimpang gulma",
      "Mencegah gulma tumbuh kembali dalam jangka waktu yang relatif lama",
      "Sangat cocok untuk persiapan lahan baru maupun perawatan lahan tua",
    ],
  },

  // ───── 10A · Block Up 480 SL ─────
  {
    id: "p10",
    no: "10A",
    kategori: "herbisida",
    nama: "Block Up 480 SL",
    aktif: "Isopropil amina glifosat 480 g/l",
    klasifikasi: "Grup G",
    kemasan: "4 L",
    ringkas:
      "Sistemik purna tumbuh untuk gulma pada karet (TBM) dan kelapa sawit (TBM).",
    foto: "images/A_Herbisida/10_blockup-480.jpg",
    tanaman: ["sawit", "karet"],
    cocokUntuk: [
      "Alang-alang dan rumput pahitan pada lahan Karet & Sawit TBM",
      "Gulma kayu lunak pada area pembukaan lahan",
    ],
    keunggulan: [
      "Melindungi lahan dari invasi gulma keras lebih lama",
      "Tercampur sempurna dengan air tanpa mengendap",
      "Efisien untuk pengendalian gulma berakar dalam pada area TBM",
    ],
  },

  // ───── 11A · Penta So-Z 505 SL ─────
  {
    id: "p11",
    no: "11A",
    kategori: "herbisida",
    nama: "Penta So-Z 505 SL",
    aktif: "IPA Glifosat 505 g/l",
    klasifikasi: "Grup G",
    kemasan: "1 L / 4 L",
    ringkas:
      "Sistemik purna tumbuh, larutan kuning keemasan, untuk gulma di kelapa sawit.",
    foto: "images/A_Herbisida/11_pentasoz-505.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma rumpun tebal dan alang-alang",
      "Gulma berdaun lebar pada piringan dan gawangan sawit",
    ],
    keunggulan: [
      "Konsentrasi glifosat lebih tinggi (505 g/l) memberikan efek tuntas lebih cepat",
      "Mampu menembus lapisan lilin pada daun gulma keras",
      "Mati sampai ke akar hingga gulma tidak mudah muncul kembali",
    ],
  },

  // ───── 12A · Penta Up-Z 480 SL ─────
  {
    id: "p12",
    no: "12A",
    kategori: "herbisida",
    nama: "Penta Up-Z 480 SL",
    aktif: "IPA Glifosat 480 g/l",
    klasifikasi: "Grup G",
    kemasan: "1 L / 4 L",
    ringkas: "Untuk gulma pada tanaman kelapa sawit dan padi.",
    foto: "images/A_Herbisida/12_pentaupz-480.jpg",
    tanaman: ["sawit", "padi"],
    cocokUntuk: [
      "Gulma persiapan lahan Padi Tanpa Olah Tanah (TOT)",
      "Gulma rumput dan daun lebar pada piringan sawit",
    ],
    keunggulan: [
      "Sangat fleksibel dapat digunakan pada lahan tanaman pangan (padi) dan perkebunan (sawit)",
      "Translokasi cepat ke seluruh jaringan tanaman gulma",
      "Menghemat waktu dan biaya pengolahan tanah pada lahan padi",
    ],
  },

  // ───── 13A · Rindom 555 SL ─────
  {
    id: "p13",
    no: "13A",
    kategori: "herbisida",
    nama: "Rindom 555 SL",
    aktif: "Isopropil Amina Glifosat 555 g/l",
    klasifikasi: "Grup G",
    kemasan: "1 L / 4 L / 10 L",
    ringkas:
      "Sistemik purna tumbuh untuk gulma berdaun lebar & rumput pada sawit (TBM).",
    foto: "images/A_Herbisida/13_rindom-555.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar keras dan rumput padat di lahan Sawit TBM",
      "Spesies gulma berakar rimpang kuat",
    ],
    keunggulan: [
      "Kadar bahan aktif super pekat 555 g/l untuk hasil pembasmian ekstra kuat",
      "Hemat Dosis Pemakaian per Tangki Semprot",
      "Mati menyeluruh hingga jaringan akar terdalam",
    ],
  },

  // ───── 14A · Galakuat 276 SL ─────
  {
    id: "p14",
    no: "14A",
    kategori: "herbisida",
    nama: "Galakuat 276 SL",
    aktif: "Parakuat diklorida 276 g/l",
    klasifikasi: "Grup D",
    kemasan: "10 L",
    ringkas:
      "Kontak purna tumbuh untuk gulma berdaun lebar & rumput di sawit (TBM).",
    foto: "images/A_Herbisida/14_galakuat-276.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar cepat tumbuh pada lahan Sawit TBM",
      "Rumput-rumputan pada piringan dan jalan pikul",
    ],
    keunggulan: [
      "Kemasan besar 10 L sangat ekonomis untuk operasional perkebunan skala luas",
      "Bekerja cepat menghentikan kompetisi hara gulma terhadap tanaman utama",
      "Daya kerja tidak terpengaruh oleh kondisi tanah",
    ],
  },

  // ───── 15A · Tangkas 480 SL ─────
  {
    id: "p15",
    no: "15A",
    kategori: "herbisida",
    nama: "Tangkas 480 SL",
    aktif: "Isopropil amina glifosat 480 g/l",
    klasifikasi: "Sistemik purna tumbuh",
    kemasan: "10 L",
    ringkas:
      "Untuk gulma pada budidaya jagung (TOT), padi tanam benih (TOT), karet & kelapa sawit belum menghasilkan.",
    foto: "images/A_Herbisida/15_tangkas-480.jpg",
    tanaman: ["sawit", "padi", "jagung", "karet"],
    cocokUntuk: [
      "Persiapan lahan Tanpa Olah Tanah (TOT) Jagung & Padi",
      "Gulma umum di perkebunan Karet & Sawit TBM",
    ],
    keunggulan: [
      "Sangat multifungsi untuk tanaman pangan maupun tanaman perkebunan",
      "Membantu efisiensi metode Tanpa Olah Tanah (TOT) untuk mempercepat masa tanam",
      "Membunuh gulma sampai ke perakaran tanpa meninggalkan residu berbahaya di tanah",
    ],
  },

  // ───── 16A · Insta Max 240 SL ─────
  {
    id: "p16",
    no: "16A",
    kategori: "herbisida",
    nama: "Insta Max 240 SL",
    aktif: "Amonium glufosinat 240 g/l",
    klasifikasi: "Grup H",
    kemasan: "1 L",
    ringkas: "Cara instan dan maksimal memberantas gulma sampai akarnya.",
    foto: "images/A_Herbisida/16_instamax-240.jpg",
    tanaman: ["sawit", "jagung", "hortikultura"],
    badge: "promo",
    cocokUntuk: [
      "Gulma berdaun lebar dan rumput yang mulai kebal terhadap glifosat/parakuat",
      "Gulma pada sela-sela pertanaman hortikultura dan jagung",
    ],
    keunggulan: [
      "Herbisida kontak-sistemik lokal dengan spektrum pengendalian sangat luas",
      "Sangat aman bagi tanaman utama jika terkena percikan minim pada bagian berkayu",
      "Solusi efektif mengatasi masalah resistensi gulma",
    ],
  },

  // ───── 17A · Omni-Best 200 SL ─────
  {
    id: "p17",
    no: "17A",
    kategori: "herbisida",
    nama: "Omni-Best 200 SL",
    aktif: "Amonium Glufosinat 200 g/l",
    klasifikasi: "Grup H",
    kemasan: "1 L / 5 L / 20 L",
    ringkas: "Sistemik purna tumbuh untuk gulma pada tanaman kelapa sawit.",
    foto: "images/A_Herbisida/17_omnibest-200.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma pakis-pakisan dan gulma daun lebar berkayu lunak di piringan sawit",
      "Rumput melata pada gawangan sawit",
    ],
    keunggulan: [
      "Memberikan perlindungan hijau yang aman dan cepat mengendalikan gulma",
      "Bekerja menghentikan sintesis glutamin pada gulma sehingga mati secara bertahap tapi pasti",
      "Memiliki batas toleransi yang baik terhadap lingkungan sekitar",
    ],
  },

  // ───── 18A · Bufos 150 SL ─────
  {
    id: "p18",
    no: "18A",
    kategori: "herbisida",
    nama: "Bufos 150 SL",
    aktif: "Amonium glufosinat 150 g/l",
    klasifikasi: "Grup H",
    kemasan: "1 L",
    ringkas:
      "Herbisida sistemik purna kontak untuk gulma di sela tanaman & pekarangan.",
    foto: "images/A_Herbisida/18_bufos-150.jpg",
    tanaman: ["hortikultura", "sawit"],
    cocokUntuk: [
      "Gulma liar di pekarangan rumah, sela tanaman buah, dan sayuran",
      "Rumput teki lunak dan gulma daun lebar",
    ],
    keunggulan: [
      "Sangat praktis untuk pembersihan area kebun rumah maupun sela tanaman",
      "Tidak merusak kualitas nutrisi tanah",
      "Mengendalikan gulma tanpa mengganggu perakaran tanaman budidaya terdekat",
    ],
  },

  // ───── 19A · Prima-Guard 480 EC ─────
  {
    id: "p19",
    no: "19A",
    kategori: "herbisida",
    nama: "Prima-Guard 480 EC",
    aktif: "Triklopir 480 g/l",
    klasifikasi: "Grup O",
    kemasan: "100 ml",
    ringkas:
      "Sistemik selektif berbentuk pekatan untuk mengendalikan gulma di kelapa sawit.",
    foto: "images/A_Herbisida/19_primaguard-480.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar spesifik kayu-kayuan dan semak belukar (Melastoma malabathricum, Chromolaena odorata)",
      "Gulma tunggul kayu pada piringan sawit",
    ],
    keunggulan: [
      "Sangat selektif: Khusus mematikan gulma berdaun lebar dan semak tanpa merusak rumput penutup tanah yang menguntungkan",
      "Ampuh membunuh semak belukar hingga ke sistem perakarannya",
      "Dapat dicampur dengan herbisida glifosat untuk memperluas spektrum basmi",
    ],
  },

  // ───── 20A · Omni-Guard 670 EC ─────
  {
    id: "p20",
    no: "20A",
    kategori: "herbisida",
    nama: "Omni-Guard 670 EC",
    aktif: "Triklopir butoksi etil ester 670 g/l",
    klasifikasi: "Grup O",
    kemasan: "100 ml",
    ringkas:
      "Sistemik selektif pekatan warna cokelat tua untuk gulma di kelapa sawit.",
    foto: "images/A_Herbisida/20_omniguard-670.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Semak belukar tebal, tumbuhan merambat, dan gulma kayu keras di lahan sawit",
      "Tunggul kayu sisa pembersihan lahan",
    ],
    keunggulan: [
      "Bahan aktif konsentrasi super tinggi (670 g/l) untuk semak keras yang sulit dibasmi",
      "Penetrasi cepat menembus kulit batang dan daun berkayu",
      "Memberikan hasil mati tuntas sampai jaringan kayu terdalam",
    ],
  },

  // ───── 21A · Metalon 667 EC ─────
  {
    id: "p21",
    no: "21A",
    kategori: "herbisida",
    nama: "Metalon 667 EC",
    aktif: "Triklopir butiletil ester 667 g/l",
    klasifikasi: "Grup O",
    kemasan: "100 ml / 4 L",
    ringkas:
      "Sistemik selektif untuk gulma berdaun lebar pada budidaya kelapa sawit (TBM).",
    foto: "images/A_Herbisida/21_metalon-667.jpg",
    tanaman: ["sawit"],
    cocokUntuk: [
      "Gulma berdaun lebar keras dan semak pada lahan Sawit TBM",
      "Tumbuhan pengganggu berkayu di Jalur Tanaman",
    ],
    keunggulan: [
      "Efektif mematikan gulma berdaun lebar tanpa mengganggu pertumbuhan bibit kelapa sawit",
      "Memiliki konsentrasi pekat yang efisien untuk area piringan sawit TBM",
      "Efisien untuk pengolesan tunggul maupun penyemprotan foliar",
    ],
  },

  // ───── 22A · Yuta-Quat 138 SL ─────
  {
    id: "p22",
    no: "22A",
    kategori: "herbisida",
    nama: "Yuta-Quat 138 SL",
    aktif: "Parakuat diklorida 138 g/l",
    klasifikasi: "Grup D",
    kemasan: "4 L",
    ringkas:
      "Kontak purna tumbuh berbentuk larutan dalam air untuk gulma perkebunan.",
    foto: "images/A_Herbisida/22_yutaquat-138.jpg",
    tanaman: ["sawit", "karet"],
    cocokUntuk: [
      "Gulma rumput lunak dan daun lebar di area perkebunan",
      "Penyiangan cepat sela-sela tanaman perkebunan",
    ],
    keunggulan: [
      "Ekonomis dan pas untuk pemeliharaan rutin lahan perkebunan",
      "Efek kontak cepat menghentikan fotosintesis gulma",
      "Mudah diaplikasikan dengan berbagai jenis nozzle/sprayer",
    ],
  },

  // ───── 23A · Jayaris 240 SL ─────
  {
    id: "p23",
    no: "23A",
    kategori: "herbisida",
    nama: "Jayaris 240 SL",
    aktif: "IPA glifosat sekitar 178 g/l",
    klasifikasi: "Herbisida",
    kemasan: "4 L",
    ringkas:
      "Herbisida sistemik purna tumbuh untuk pengendalian gulma perkebunan.",
    foto: "images/A_Herbisida/23_jayaris-240.jpg",
    tanaman: ["sawit", "karet"],
    cocokUntuk: [
      "Gulma rumput-rumputan sedang pada area jalur tanam perkebunan",
      "Pengendalian gulma berkala dengan biaya terjangkau",
    ],
    keunggulan: [
      "Sistemik lembut yang mematikan gulma secara bertahap hingga akar",
      "Sangat efisien untuk penghematan biaya perawatan lahan skala menengah-besar",
      "Aman digunakan berkala tanpa merusak struktur biologis tanah",
    ],
  },

  // ───── 24A · Prima-Bro Plus 75/0,7/0,7 WP ─────
  {
    id: "p43",
    no: "24A",
    kategori: "herbisida", // Diubah ke huruf kecil agar cocok dengan filter
    nama: "Prima-Bro Plus 75/0,7/0,7 WP",
    aktif: "2,4-D Natrium 75% + Metil Metsulfuron 0,7% + Etil Klorimuron 0,7%",
    klasifikasi: "Herbisida Sistemik Selektif Pra dan Purna Tumbuh",
    kemasan: "40 gr",
    ringkas:
      "Herbisida sistemik selektif pra dan purna tumbuh berbentuk tepung berwarna putih yang ampuh mengendalikan gulma daun lebar dan teki pada tanaman padi sawah.",
    foto: "images/A_Herbisida/24_prima-bro-plus-40gr.png",
    tanaman: ["padi"], // Diselaraskan ke huruf kecil "padi"
    cocokUntuk: [
      "Gulma berdaun lebar (Alternanthera philoxeroides, Ludwigia octovalvis)",
      "Eceng/Genjer (Monochoria vaginalis)",
      "Semanggi air (Marsilea crenata)",
      "Tekian / Rumput teki",
    ],
    keunggulan: [
      "Praktis sebagai herbisida selektif pra-tumbuh dan purna-tumbuh",
      "Fleksibel dalam aplikasi, dapat disemprotkan maupun dicampur/ditabur bersama pupuk",
      "Efektif mengendalikan gulma yang sulit diberantas tanpa merusak tanaman padi",
      "Efisien dan menghemat biaya serta tenaga kerja untuk penyiangan manual",
    ],
  },

  /* ═══════════ INSEKTISIDA ═══════════ */

  // ───── 1B · Omni-Fur 3 GR ─────
  {
    id: "p24",
    no: "1B",
    kategori: "insektisida",
    nama: "Omni-Fur 3 GR",
    aktif: "Karbofuran 3%",
    klasifikasi: "Grup 1A",
    kemasan: "Butiran",
    ringkas:
      "Sistemik kontak & lambung, berbentuk butiran ungu, untuk hama pada tanaman padi.",
    foto: "images/B_Insektisida/1_omnifur-3gr.jpg",
    tanaman: ["padi"],
    cocokUntuk: [
      "Pengerek batang padi (Scirpophaga innotata)",
      "Uret dan penggerek akar tanah",
      "Hama penggerek pucuk dan oteng-oteng",
    ],
    keunggulan: [
      "Bentuk butiran siap pakai (Sistemik lewat penyerapan akar)",
      "Memberikan perlindungan dini sejak awal masa tanam/pembibitan",
      "Efektif membasmi hama perakaran dan hama yang bersembunyi di dalam batang",
    ],
  },

  // ───── 2B · Omni-Net 40 SP ─────
  {
    id: "p25",
    no: "2B",
    kategori: "insektisida",
    nama: "Omni-Net 40 SP",
    aktif: "Metomil 40%",
    klasifikasi: "Grup 1A",
    kemasan: "100 g",
    ringkas:
      "Kontak & lambung berbentuk tepung untuk hama pada tanaman bawang merah.",
    foto: "images/B_Insektisida/2_omninet-40sp.jpg",
    tanaman: ["hortikultura"],
    cocokUntuk: [
      "Ulat grayak (Spodoptera exigua / Spodoptera litura) pada bawang merah",
      "Ulat buah dan ulat kantung",
      "Kutu daun dan thrips",
    ],
    keunggulan: [
      "Daya racun tinggi (*knockdown effect*) sangat cepat melumpuhkan hama",
      "Mampu menembus jaringan telur dan larva hama secara langsung",
      "Sangat efektif untuk penanggulangan serangan ulat grayak skala masif",
    ],
  },

  // ───── 3B · Prima-Hipo 400 SL ─────
  {
    id: "p26",
    no: "3B",
    kategori: "insektisida",
    nama: "Prima-Hipo 400 SL",
    aktif: "Dimehipo 400 g/l",
    klasifikasi: "Grup 1A",
    kemasan: "500 ml",
    ringkas:
      "Sistemik kontak & lambung berwarna merah untuk hama pada tanaman padi.",
    foto: "images/B_Insektisida/3_primahipo-400.jpg",
    tanaman: ["padi"],
    cocokUntuk: [
      "Penggerek batang padi (sundep & beluk)",
      "Wereng batang cokelat (WBC)",
      "Hama pelipat daun (Cnaphalocrocis medinalis)",
    ],
    keunggulan: [
      "Bersifat sistemik ganda: bekerja meresap dan tersalurkan ke seluruh bagian tanaman",
      "Membasmi larva di dalam jaringan batang yang sulit dijangkau racun kontak biasa",
      "Dosis efisien dan tidak menimbulkan stres pada tanaman padi muda",
    ],
  },

  // ───── 4B · Prima-Pro 55 SC ─────
  {
    id: "p27",
    no: "4B",
    kategori: "insektisida",
    nama: "Prima-Pro 55 SC",
    aktif: "Fipronil 55 g/l",
    klasifikasi: "Grup 2B",
    kemasan: "100 ml",
    ringkas:
      "Racun kontak & lambung berbentuk pekatan untuk hama pada cabai dan padi.",
    foto: "images/B_Insektisida/4_primapro-55sc.jpg",
    tanaman: ["padi", "hortikultura"],
    cocokUntuk: [
      "Hama Thrips & Kutu Daun pada Cabai",
      "Penggerek batang padi dan Walang Sangit",
      "Hama orong-orong / ganjur",
    ],
    keunggulan: [
      "Bekerja mengendalikan hama pengisap sekaligus pengerat dengan efektif",
      "Memiliki *Fitotonik Effect* yang merangsang pertumbuhan perakaran dan menghijaukan daun",
      "Konsentrasi pekatan halus (SC) ramah terhadap alat penyemprotan dan tidak mengendap",
    ],
  },

  /* ═══════════ FUNGISIDA ═══════════ */

  // ───── 1C · Prima-Zol 250 EC ─────
  {
    id: "p28",
    no: "1C",
    kategori: "fungisida",
    nama: "Prima-Zol 250 EC",
    aktif: "Difenokonazol 250 g/l",
    klasifikasi: "Grup C — Fungisida + ZPT",
    kemasan: "100 ml",
    ringkas:
      "Sistemik berbentuk pekatan cokelat untuk mengendalikan penyakit pada tanaman padi.",
    foto: "images/C_Fungisida/1_primazol-250.jpg",
    tanaman: ["padi", "hortikultura"],
    cocokUntuk: [
      "Penyakit bercak daun (Cercospora janseana)",
      "Penyakit busuk batang dan Hawar Pelepah (Rhizoctonia solani)",
      "Penyakit bercak kering (Alternaria solani) pada hortikultura",
    ],
    keunggulan: [
      "Kombinasi Protektif-Kuratif ganda sekaligus berfungsi sebagai Zat Pengatur Tumbuh (ZPT)",
      "Meningkatkan bobot dan membuat bulir padi mengkilap bersih (padi bening)",
      "Diserap cepat oleh jaringan daun sehingga tidak gampang terbilas hujan",
    ],
  },

  // ───── 2C · Prima-Col 70 WP ─────
  {
    id: "p29",
    no: "2C",
    kategori: "fungisida",
    nama: "Prima-Col 70 WP",
    aktif: "Propineb 70%",
    klasifikasi: "Grup M03",
    kemasan: "200 g",
    ringkas:
      "Kontak protektif berbentuk tepung hijau untuk penyakit pada tanaman padi.",
    foto: "images/C_Fungisida/2_primacol-70wp.jpg",
    tanaman: ["padi", "hortikultura"],
    cocokUntuk: [
      "Penyakit cacar daun & Hawar daun pada tanaman Padi",
      "Penyakit Antraknosa (patek) pada cabai & hortikultura",
      "Busuk daun (Phytophthora infestans) pada kentang & tomat",
    ],
    keunggulan: [
      "Mengandung unsur mikro Seng (Zn++) yang penting untuk imunitas dan kesegaran daun",
      "Melindungi jaringan luar tanaman dari infeksi spora cendawan baru (Protektif)",
      "Formulasi tepung halus yang mudah terdispersi merata dalam air",
    ],
  },

  // ───── 3C · Primafos 400 SL ─────
  {
    id: "p30",
    no: "3C",
    kategori: "fungisida",
    nama: "Primafos 400 SL",
    aktif: "Asam fosfit 400 g/l",
    klasifikasi: "Fungisida",
    kemasan: "500 ml",
    ringkas: "Fungisida untuk perlindungan tanaman dari penyakit jamur.",
    foto: "images/C_Fungisida/3_primafos-400.jpg",
    tanaman: ["hortikultura", "padi"],
    cocokUntuk: [
      "Penyakit busuk akar & busuk pangkal batang (Phytophthora spp.)",
      "Penyakit embun bulu (Downy mildew) pada tanaman hortikultura/sayuran",
      "Penyakit bercak daun jamur pada padi",
    ],
    keunggulan: [
      "Sistemik sistemik dua arah (sistemik akropetal & basipetal) yang dapat bergerak naik-turun dalam pembuluh tanaman",
      "Menginduksi sistem pertahanan alami bawaan tanaman (*Systemic Acquired Resistance*)",
      "Aman untuk jaringan tanaman muda dan efektif menanggulangi jamur oomycetes",
    ],
  },

  /* ═══════════ PUPUK ═══════════ */

  // ───── 1D · Kanitrat NPK 12-0-44 ─────
  {
    id: "p31",
    no: "1D",
    kategori: "pupuk",
    nama: "Kanitrat NPK 12-0-44",
    aktif: "Pupuk majemuk KNO3",
    klasifikasi: "Nitrogen & Kalium",
    kemasan: "1 kg",
    ringkas:
      "Mudah larut dan diserap tanaman, aman diaplikasikan lewat penyemprotan.",
    foto: "images/D_Pupuk/1_kanitrat-npk.jpg",
    tanaman: ["padi", "hortikultura", "jagung"],
    cocokUntuk: [
      "Fase pembuahan / pembentukan bulir dan buah",
      "Tanaman hortikultura (cabai, tomat, melon, semangka)",
      "Tanaman pangan (padi, jagung) pada fase generatif",
    ],
    keunggulan: [
      "100% mudah larut dalam air tanpa meninggalkan endapan",
      "Tinggi kandungan Kalium (K2O 44%) untuk meningkatkan bobot dan manisnya buah",
      "Mencegah kerontokan bunga dan buah pada masa pembungaan",
    ],
  },

  // ───── 2D · Mekarmap N 12 — P₂O₅ 61 ─────
  {
    id: "p32",
    no: "2D",
    kategori: "pupuk",
    nama: "Mekarmap N 12 — P₂O₅ 61",
    aktif: "Pupuk makro majemuk MAP (Mono Ammonium Phosphate)",
    klasifikasi: "Hara makro",
    kemasan: "1 kg",
    ringkas:
      "Pupuk makro majemuk untuk mendukung pertumbuhan generatif tanaman.",
    foto: "images/D_Pupuk/2_Mekarmap-npk.jpg",
    tanaman: ["padi", "hortikultura", "jagung"],
    cocokUntuk: [
      "Fase perakaran awal dan pembentukan tunas baru",
      "Inisiasi pembungaan dan merangsang bakal buah",
      "Persiapan vegetatif akhir menuju fase generatif",
    ],
    keunggulan: [
      "Kandungan Fosfat (P2O5 61%) ekstra tinggi merangsang pertumbuhan akar dan bunga",
      "Sangat cocok untuk aplikasi kocor maupun foliar (semprot)",
      "Memperkuat batang tanaman agar tidak mudah roboh",
    ],
  },

  // ───── 3D · MaxxiGro-D NPK 30-6-6 ─────
  {
    id: "p33",
    no: "3D",
    kategori: "pupuk",
    nama: "MaxxiGro-D NPK 30-6-6",
    aktif: "Pupuk daun serbaguna",
    klasifikasi: "Hara mikro lengkap",
    kemasan: "1 kg",
    ringkas:
      "Pupuk daun untuk padi, jagung, kedelai, sayur-buah, dan tanaman hias.",
    foto: "images/D_Pupuk/3_maxxigro-npk.jpg",
    tanaman: ["padi", "jagung", "hortikultura"],
    cocokUntuk: [
      "Fase vegetatif (pertumbuhan awal daun dan tunas)",
      "Tanaman pangan (padi, jagung, kedelai)",
      "Sayuran daun, tanaman buah, dan tanaman hias",
    ],
    keunggulan: [
      "Tinggi kandungan Nitrogen (30%) untuk mempercepat pertumbuhan vegetatif",
      "Dilengkapi hara mikro lengkap untuk mencegah klorosis/daun kuning",
      "Membuat daun lebih hijau, tebal, dan memaksimalkan proses fotosintesis",
    ],
  },

  // ───── 4D · Wokozim Aktivator ─────
  {
    id: "p34",
    no: "4D",
    kategori: "pupuk",
    nama: "Wokozim Aktivator",
    aktif: "Pupuk organik cair + Ekstrak Rumput Laut",
    klasifikasi: "Aktivator",
    kemasan: "Botol",
    ringkas:
      "Pupuk organik cair sebagai aktivator pertumbuhan akar dan tanaman.",
    foto: "images/D_Pupuk/4_wokozim-poc.jpg",
    tanaman: ["padi", "hortikultura", "jagung"],
    cocokUntuk: [
      "Pemulihan tanaman pasca stres lingkungan atau serangan hama",
      "Stimulasi pertumbuhan akar serabut pada bibit baru",
      "Semua jenis tanaman budidaya pertanian dan perkebunan",
    ],
    keunggulan: [
      "Mengandalkan zat pengatur tumbuh organik alami dari ekstrak biostimulan",
      "Meningkatkan efisiensi penyerapan pupuk kimia utama di dalam tanah",
      "Mempercepat pembelahan sel sehingga tanaman tumbuh lebih cepat dan seragam",
    ],
  },

  /* ═══════════ ALAT SEMPROT ═══════════ */

  // ───── 35 · Jitu 16 Electric Sprayer ─────
  {
    id: "p35",
    no: "35",
    kategori: "alat",
    nama: "Jitu 16 Electric Sprayer",
    aktif: "Sprayer elektrik 2-in-1",
    klasifikasi: "Ber-SNI",
    kemasan: "16 L",
    ringkas:
      "Alarm baterai & stop kran otomatis, tekanan tinggi untuk kebun dan sawah.",
    foto: "images/Alat Semprot/jitu-16l-electric.jpg",
    tanaman: ["padi", "hortikultura", "sawit", "jagung"],
    cocokUntuk: [
      "Penyemprotan pestisida dan pupuk cair di sawah dan ladang",
      "Aplikasi cairan disinfektan dan perawatan kebun luas",
    ],
    keunggulan: [
      "Sistem pompa otomatis dengan tekanan tinggi dan stabil",
      "Dilengkapi indikator / alarm baterai agar siap dipakai kapan saja",
      "Desain ekonomis ber-SNI dengan tali gendong empuk anti-pegal",
    ],
  },

  // ───── 36 · Jitu Alat Kocor Manual ─────
  {
    id: "p36",
    no: "36",
    kategori: "alat",
    nama: "Jitu Alat Kocor Manual",
    aktif: "Sprayer manual punggung",
    klasifikasi: "—",
    kemasan: "20 L",
    ringkas:
      "Sprayer manual kapasitas besar, cocok untuk area tanam yang luas.",
    foto: "images/Alat Semprot/jitu-20l-manual.jpg",
    tanaman: ["padi", "hortikultura", "jagung", "sawit"],
    cocokUntuk: [
      "Pengocoran pupuk cair langsung ke lubang tanam/perakaran",
      "Penyemprotan pestisida skala sedang hingga luas",
    ],
    keunggulan: [
      "Kapasitas ekstra besar (20 Liter) mengurangi frekuensi pengisian ulang",
      "Bahan plastik tebal tahan benturan dan bahan kimia cair",
      "Tuas pompa ringan dan minim perawatan mekanis",
    ],
  },

  // ───── 37 · Hand Pressure Sprayer ─────
  {
    id: "p37",
    no: "37",
    kategori: "alat",
    nama: "Hand Pressure Sprayer",
    aktif: "Sprayer tekan tangan",
    klasifikasi: "Household & pertanian ringan",
    kemasan: "1.5–2 L",
    ringkas:
      "Praktis untuk penyemprotan skala kecil, kebun rumah, dan tanaman hias.",
    foto: "images/Alat Semprot/hand-sprayer.jpg",
    tanaman: ["hortikultura"],
    cocokUntuk: [
      "Perawatan tanaman hias, pot, dan nursery / persemaian",
      "Aplikasi pupuk daun atau insektisida skala kebun rumah",
    ],
    keunggulan: [
      "Ringkas, ringan, dan sangat mudah dioperasikan dengan satu tangan",
      "Nozzle kuningan dapat diatur dari mode embun (*mist*) hingga pancaran lurus",
      "Sangat praktis tanpa memerlukan daya listrik atau baterai",
    ],
  },

  /* ═══════════ PERLENGKAPAN ═══════════ */

  // ───── 38 · Plastik Mulsa Dewi Sri ─────
  {
    id: "p38",
    no: "38",
    kategori: "perlengkapan",
    nama: "Plastik Mulsa Dewi Sri",
    aktif: "Plastik hitam perak, kuat & elastis",
    klasifikasi: "Jaminan mutu",
    kemasan: "Roll 60×035",
    ringkas:
      "Menekan pertumbuhan gulma dan menjaga kelembapan tanah pada bedengan.",
    foto: "images/Perlengkapan/plastik-mulsa.jpg",
    tanaman: ["hortikultura"],
    cocokUntuk: [
      "Bedengan tanaman hortikultura (cabai, tomat, melon, semangka, terong)",
      "Menjaga kondisi kelembapan dan struktur tanah bedengan",
    ],
    keunggulan: [
      "Sisi perak memantulkan sinar matahari untuk mengusir hama pengisap (Thrips/Kutu)",
      "Sisi hitam efektif mencegah tumbuhnya gulma/rumput liar di bedengan",
      "Bahan elastis, tidak mudah robek, dan awet dipakai hingga beberapa musim tanam",
    ],
  },

  // ───── 39 · Tali Rafia Pertanian ─────
  {
    id: "p39",
    no: "39",
    kategori: "perlengkapan",
    nama: "Tali Rafia Pertanian",
    aktif: "Tali rafia serbaguna",
    klasifikasi: "No. 2600",
    kemasan: "1 kg / 1.4 kg",
    ringkas:
      "Tali rafia kualitas tinggi untuk ikat tanaman dan keperluan kebun.",
    foto: "images/Perlengkapan/tali-rafia.jpg",
    tanaman: ["hortikultura"],
    cocokUntuk: [
      "Pengikat batang tanaman ke lanjaran/lanjar (cabai, tomat, melon)",
      "Pengikat rambatan dan perlengkapan pengemasan hasil panen",
    ],
    keunggulan: [
      "Serat tali kuat dan tidak mudah putus saat terkena paparan cuaca/hujan",
      "Tekstur lentur sehingga tidak merusak batang tanaman muda",
      "Ekonomis dan tahan lama untuk pemakaian di area terbuka",
    ],
  },

  // ───── 40 · Polybag PE ─────
  {
    id: "p40",
    no: "40",
    kategori: "perlengkapan",
    nama: "Polybag PE",
    aktif: "Polybag semai",
    klasifikasi: "Berkualitas & ekonomis",
    kemasan: "0.12 × 25 cm",
    ringkas:
      "Polybag pembibitan untuk persemaian tanaman perkebunan dan hortikultura.",
    foto: "images/Perlengkapan/polybag-pe.jpg",
    tanaman: ["hortikultura", "sawit"],
    cocokUntuk: [
      "Persemaian bibit tanaman hortikultura dan buah-buahan",
      "Pembibitan kelapa sawit dan tanaman perkebunan",
    ],
    keunggulan: [
      "Bahan PE berkualitas tidak mudah rapuh atau terurai oleh terik matahari",
      "Sudah dilengkapi lubang drainase air untuk mencegah kebusukan akar",
      "Ketebalan presisi menjaga media tanam tetap stabil saat dipindahkan",
    ],
  },
  /* ═══════════ HAYATI (PRODUK BARU) ═══════════ */

  // ───── 41 · Trichoderma ─────
  {
    id: "p41",
    no: "41",
    kategori: "hayati",
    nama: "Trichoderma",
    aktif: "Agen hayati berbasis fungi",
    klasifikasi: "Agen hayati",
    kemasan: "Konfirmasi admin",
    ringkas:
      "Mendukung kesehatan media tanam dan pengelolaan penyakit tular tanah. Detail merek, formulasi, dan dosis akan dilengkapi setelah data produk diterima.",
    // foto: belum ada → otomatis memakai gambar sementara
    tanaman: [], // belum diisi → isi agar muncul di filter tanaman
    baru: true,
    kataKunci: "pupuk biologis",
    cocokUntuk: [],
    keunggulan: [],
  },

  // ───── 42 · Mikoriza ─────
  {
    id: "p42",
    no: "42",
    kategori: "hayati",
    nama: "Mikoriza",
    aktif: "Inokulan fungi perakaran",
    klasifikasi: "Agen hayati",
    kemasan: "Konfirmasi admin",
    ringkas:
      "Mendukung perkembangan perakaran dan penyerapan unsur hara. Detail merek, formulasi, dan dosis akan dilengkapi setelah data produk diterima.",
    // foto: belum ada → otomatis memakai gambar sementara
    tanaman: [], // belum diisi → isi agar muncul di filter tanaman
    baru: true,
    kataKunci: "pupuk biologis",
    cocokUntuk: [],
    keunggulan: [],
  },

  /* Cadangan blok kosong untuk produk berikutnya (hapus tanda komentar, lalu isi):
  {
    id: "p44",
    no: "44",
    kategori: "",
    nama: "",
    aktif: "",
    klasifikasi: "",
    kemasan: "",
    ringkas: "",
    foto: "images/",
    tanaman: [],
    cocokUntuk: [],
    keunggulan: [],
  },
  */
];
