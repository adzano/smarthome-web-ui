# Smart Home Web UI

Dashboard statis untuk Smart Home yang memakai login session dan cookie
`HttpOnly`; tidak ada API key di browser. Production menggunakan satu origin
`https://smarthome.elang.my.id`, dengan API relatif pada path `/api/v1`.

Untuk pengembangan lokal, salin `config.example.js` menjadi `config.js`,
lalu jalankan backend dan static server:

```sh
python3 -m http.server 5500
```

Buka `http://127.0.0.1:5500` dari browser Mac. Halaman production dapat
dipasang sebagai PWA dasar setelah dilayani melalui HTTPS.
