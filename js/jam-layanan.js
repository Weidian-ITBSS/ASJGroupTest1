"use strict";
/* ==========================================================================
   STATUS JAM LAYANAN (halaman Kontak)
   Menampilkan apakah saat ini masih dalam jam layanan 08.00–17.00 WIB,
   supaya pengunjung tahu kapan pesannya akan dibalas. Memakai zona waktu
   WIB walaupun perangkat pengunjung berada di zona waktu lain.
   Tanpa JavaScript, baris status tetap tersembunyi (tidak ada info salah).
   ========================================================================== */
(() => {
  const box = document.getElementById("serviceStatus");
  const text = document.getElementById("serviceStatusText");
  if (!box || !text) return;

  const OPEN_HOUR = 8;
  const CLOSE_HOUR = 17;

  const minutesNowWIB = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (type) => Number(parts.find((p) => p.type === type).value);
    return (get("hour") % 24) * 60 + get("minute");
  };

  function render() {
    const now = minutesNowWIB();
    const open = now >= OPEN_HOUR * 60 && now < CLOSE_HOUR * 60;
    box.dataset.state = open ? "open" : "closed";
    text.textContent = open
      ? "Sekarang dalam jam layanan (sampai 17.00 WIB)"
      : "Di luar jam layanan. Pesan tetap bisa dikirim dan dibalas mulai 08.00 WIB";
    box.hidden = false;
  }

  render();
  setInterval(render, 60000);
})();
