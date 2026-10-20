# Steering — Smart Home Web UI

Tanggal acuan: 20 Oktober 2026. Dokumen ini memberi konteks untuk agent atau kontributor yang membuka repository Web UI ini.

## Tujuan

Repository public ini berisi dashboard Smart Home untuk mengendalikan ESP32 pengirim IR AC Sharp melalui backend. Versi saat ini adalah proof of concept statis dengan empat preset AC.

Jangan simpan password, API key, token MQTT, alamat IP privat, atau file `config.js` produksi di repository public ini.

## Status saat ini

- UI vanilla HTML/CSS/JavaScript berjalan lokal dengan static server.
- Keempat tombol preset memanggil backend dan telah memicu LED transmitter ESP32 melalui MQTT.
- API lokal saat ini dikonfigurasi melalui `config.js`, yang diabaikan Git.
- Web UI belum memiliki halaman login dan belum merupakan PWA.

Keberhasilan respons API hanya menunjukkan perintah diterima backend. Respons fisik AC tetap bergantung pada pancaran IR dan posisi transmitter.

## Kontrak backend

Device: `ac-sharp-1`

| Operasi | Endpoint |
| --- | --- |
| Health | `GET /health` |
| Perangkat | `GET /api/v1/devices` |
| Riwayat | `GET /api/v1/commands` |
| Kirim preset | `POST /api/v1/devices/ac-sharp-1/commands` |

Payload command: `{"preset":"cool_20"}`. Preset valid adalah `cool_19`, `cool_20`, `cool_20_fan_auto`, dan `cool_20_fan_high`.

Backend production akan memakai session login cookie. Jangan mencoba menyelesaikannya dengan menaruh `X-API-Key` pada `config.js`, source code, atau browser storage.

## Arah teknis

Saat dashboard mulai berkembang, migrasikan ke **React + TypeScript + Vite** dan tambahkan PWA menggunakan `vite-plugin-pwa`. Hasil build tetap file statis yang dilayani Nginx; tidak perlu proses Node.js permanen di VPS.

Target produksi adalah satu origin `https://smarthome.elang.my.id`, dengan API pada path `/api`. Gunakan URL relatif agar cookie login bekerja tanpa CORS.

Fase PWA pertama harus mencakup manifest, ikon, install prompt, dan tampilan status offline. Jangan mengantre atau mengulang command AC otomatis ketika offline karena perintah IR dapat menjadi tidak relevan saat koneksi kembali.

## Cara kerja lokal

Salin `config.example.js` menjadi `config.js`, lalu jalankan static server:

```sh
python3 -m http.server 5500
```

Backend lokal secara default berada di `http://127.0.0.1:8000`.

## Pekerjaan berikutnya

1. Menambahkan halaman login, logout, dan status session.
2. Menampilkan status perangkat serta command history.
3. Migrasi bertahap ke React/Vite dan mengaktifkan PWA.
4. Deploy static build ke VPS setelah DNS `smarthome.elang.my.id` siap.
