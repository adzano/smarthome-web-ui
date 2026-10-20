# Steering — Smart Home Web UI

Tanggal acuan: 20 Oktober 2026. Dokumen ini memberi konteks untuk agent atau kontributor yang membuka repository Web UI ini.

## Tujuan

Repository public ini berisi dashboard Smart Home untuk mengendalikan ESP32 pengirim IR AC Sharp melalui backend. Versi saat ini adalah dashboard statis dengan login session, status perangkat, dan empat preset AC.

Jangan simpan password, API key, token MQTT, alamat IP privat, atau file `config.js` produksi di repository public ini.

## Status saat ini

- UI vanilla HTML/CSS/JavaScript memakai login, logout, serta status session dari backend.
- Keempat tombol preset mengirim perintah melalui session cookie dan tidak menyimpan API key di browser.
- Production menggunakan URL relatif dan dapat dilayani Nginx pada origin yang sama dengan API.
- Manifest dan service worker dasar tersedia. Service worker hanya menyimpan shell UI dan tidak pernah mengantre command AC.

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

1. Menampilkan command history.
2. Menambahkan ikon PWA dan prompt install yang ramah pengguna.
3. Migrasi bertahap ke React/Vite bila fitur bertambah.
4. Deploy static files ke VPS pada `smarthome.elang.my.id`.
