> Catatan: jika palet warna atau huruf di bawah berbeda dari `docs/design.md`, ikuti `docs/design.md`
> (nilai terbaru dari Figma). Bangun backend sebagai REST API terpisah dari tampilan, dengan dokumentasi
> OpenAPI, autentikasi berbasis token yang bisa dipakai website maupun aplikasi mobile, dan semua
> perhitungan uang di server.

# Prompt untuk Claude Code: Website Ocho (versi desktop)

Salin semua isi di bawah garis ini ke Claude Code, di folder proyek yang masih kosong.

---

Kamu adalah engineer full-stack senior. Tugasmu membangun website bernama **Ocho** dari nol, lengkap dan bisa dijalankan. Kamu belum punya konteks apa pun tentang proyek ini, jadi baca seluruh brief ini sampai habis sebelum menulis kode.

## 1. Tentang produk

Ocho adalah marketplace barang preloved khusus mahasiswa. Awalnya hanya untuk mahasiswa Universitas Padjadjaran (Unpad) di Jatinangor, Jawa Barat, Indonesia.

Masalah yang diselesaikan: mahasiswa yang punya barang tidak terpakai (kasur, kipas, baju, buku, dll) biasanya menjualnya lewat X (menfess) dan grup WhatsApp. Mereka harus upload satu per satu, mengecek komentar tiap hari, dan mengatur janji temu sendiri. Ocho menggantinya dengan satu tempat: penjual upload sekali, pembeli membayar lewat QRIS, dan barang diambil sendiri (pickup) atau diantar oleh tim Ocho.

Pembeda utama: semua pengguna adalah mahasiswa yang terverifikasi, sehingga transaksi terasa lebih aman dibanding marketplace umum.

Bahasa antarmuka: **Bahasa Indonesia** (santai tapi sopan). Kode, nama variabel, dan komentar kode: bahasa Inggris.

## 2. Ruang lingkup tahap ini

**Termasuk:**
- Hanya **versi desktop** (desain untuk lebar 1280 px, harus rapi di 1024 px ke atas). Tidak perlu layout mobile.
- Hanya modul **jual-beli**. Di navigasi ada tab modul: Jual-beli (aktif), dan **Jasa, Sewa, Jastip** yang tampil dengan label "Segera hadir" (tidak bisa diklik, ada tooltip atau halaman singkat "Segera hadir").
- Fitur lengkap: autentikasi dan verifikasi mahasiswa, menelusuri dan mencari barang, unggah barang oleh penjual, checkout, pembayaran QRIS dan COD, pesanan, ulasan, dan dashboard admin.

**Tidak termasuk (jangan dibangun):**
- Layout mobile/responsif untuk layar kecil.
- Modul Jasa, Sewa, dan Jastip.
- Chat internal, notifikasi push, dan multi-bahasa.
- Alur refund otomatis (hanya sediakan status "sengketa" dan catatan admin sebagai titik kait).

## 3. Pilihan teknologi

Kamu yang memilih stack. Pilih yang paling umum, sederhana, dan mudah dirawat oleh developer pemula-menengah. Ketentuan:
- Gunakan **TypeScript**.
- Database relasional (PostgreSQL untuk produksi, boleh SQLite untuk development) dengan ORM dan migrasi.
- Penyimpanan gambar lewat abstraksi (lokal saat development, bisa diganti penyimpanan berbasis S3 nanti).
- Semua konfigurasi dan rahasia lewat environment variable. Sediakan `.env.example`. Jangan pernah meng-commit rahasia.
- Siap deploy (jelaskan di README cara menjalankannya).
- Tulis keputusan teknologi dan alasannya singkat di `docs/DECISIONS.md`.

## 4. Cara bekerja

1. Sebelum mulai, kalau ada **maksimal 5** ambiguitas penting yang benar-benar menghalangi, tanyakan sekaligus di awal. Untuk hal kecil, ambil asumsi yang masuk akal dan catat di `docs/DECISIONS.md`. Jangan berhenti untuk meminta izin hal sepele.
2. Kerjakan bertahap dan commit tiap tahap selesai dengan pesan commit yang jelas:
   1. Setup proyek, desain sistem (warna, huruf, komponen dasar), dan `docs/DECISIONS.md`.
   2. Model data, seed data contoh, dan konfigurasi bisnis.
   3. Halaman publik: beranda, daftar barang, detail barang.
   4. Autentikasi dan verifikasi mahasiswa.
   5. Alur penjual: unggah dan kelola barang.
   6. Checkout dan pesanan.
   7. Pembayaran QRIS (mode sandbox) dan COD.
   8. Dashboard admin.
   9. Tes, perapian, dan README.
3. Jalankan aplikasinya, cek benar-benar berfungsi (jangan hanya menulis kode), dan perbaiki error sebelum lanjut.
4. Di akhir, beri ringkasan: apa yang selesai, apa yang belum, asumsi yang kamu ambil, dan cara menjalankannya.

## 5. Desain dan tampilan

**Karakter merek:** ramah, segar, dan akrab seperti teman sebaya, tapi tetap terasa aman dan tepercaya (ada tanda "Terverifikasi" yang jelas). Bukan korporat.

**Logo:** wordmark huruf kecil "ocho" dengan huruf tebal dan membulat. Dua huruf "o" memiliki pupil kecil sehingga terbaca seperti dua mata, dan ada garis senyum melengkung (gradasi biru ke ungu) di bawah bagian "ch" saja (tidak membentang selebar kata). Buat komponen `Logo` berbentuk SVG sebagai pengganti sementara, mudah diganti dengan file logo asli nanti. Sediakan juga versi ikon kecil (hanya dua lingkaran dan senyum) untuk favicon.

**Palet warna** (perkiraan, jadikan CSS variables/design tokens supaya mudah diubah):
- Primer: biru terang, sekitar `#5B73FF`
- Aksen: ungu tua, sekitar `#3A1FB0` (untuk gradasi senyum dan elemen penekanan)
- Latar: krem lembut, sekitar `#FBF8F2`
- Teks utama: hampir hitam kebiruan, sekitar `#14182B`
- Kartu: putih dengan batas tipis
- Tag/penekanan hangat (opsional): kuning lembut
- **Penting:** biru primer pada latar terang kontrasnya kurang untuk teks kecil. Pakai versi biru yang lebih gelap untuk teks dan tombol dengan teks kecil, dan pastikan teks isi memenuhi kontras WCAG AA (minimal 4.5:1).

**Huruf:** judul memakai huruf membulat yang ramah (misalnya Fredoka atau Baloo 2). Isi memakai huruf sans yang bersih (misalnya Plus Jakarta Sans). Gunakan Google Fonts atau paket lokal. Beri fallback yang jelas.

**Layout halaman utama (desktop):**
- Navbar: logo, kolom pencarian, tab modul (Jual-beli aktif, Jasa/Sewa/Jastip "Segera hadir"), tautan Masuk, tombol "Jual barang".
- Hero: lencana kecil "Khusus mahasiswa Unpad Jatinangor", judul besar "Jual, beli, sewa, dan titip. Sesama mahasiswa.", paragraf singkat, dan panel "Verifikasi sekali, langsung jalan" (3 langkah).
- Baris chip kategori: Semua, Fashion, Perabot Kos, Elektronik, Dapur & Rumah, Buku & Kuliah, Paket Pindahan.
- Grid kartu barang: foto, tag kategori, judul, harga, info pengambilan, dan lencana penjual terverifikasi.
- Footer sederhana.

**Halaman detail barang + checkout (dua kolom):** kiri berisi foto utama dan thumbnail, judul, harga, kondisi, ukuran, brand, deskripsi. Kanan (kartu menempel saat scroll): info penjual dengan lencana terverifikasi, pilihan pengambilan, pilihan pembayaran, ringkasan harga, dan tombol "Beli sekarang".

Gunakan gaya yang konsisten, sudut membulat, bayangan halus, dan ruang yang lega. Setiap halaman perlu keadaan kosong (empty), memuat (loading), dan error yang dirancang dengan baik. Jangan memakai teks lorem ipsum. Foto barang saat seed boleh berupa placeholder bergaya (blok warna dengan label), bukan gambar acak dari internet.

## 6. Fitur dan aturan bisnis

### 6.1 Kategori
Fashion (baju, kemeja, jaket, celana, sepatu, tas, aksesori), Perabot Kos, Elektronik & Peralatan Listrik, Dapur & Peralatan Rumah, Buku & Perlengkapan Kuliah, Paket Pindahan (beberapa barang dalam satu paket).

Aturan per kategori:
- **Fashion:** kolom **ukuran** dan **kondisi** wajib, brand opsional.
- **Perabot Kos dan Paket Pindahan:** hanya **pickup** (tidak bisa diantar).
- Kategori lain: pickup atau antar.
- HP, laptop, dan gadget **tidak** diizinkan di tahap ini.

### 6.2 Barang terlarang
Rokok dan vape, alkohol, obat-obatan dan suplemen, serta barang yang kepemilikannya tidak jelas. Terapkan: validasi kata kunci saat unggah (blocklist yang bisa diatur), tombol "Laporkan" di halaman barang, dan antrean moderasi di admin. Daftar ini harus mudah diubah lewat konfigurasi.

### 6.3 Autentikasi dan verifikasi mahasiswa
- Pengunjung boleh menelusuri barang **tanpa login**. Login dan verifikasi baru diminta saat membeli atau mengunggah barang.
- **Metode verifikasi belum diputuskan** (email kampus atau KTM). Karena itu, rancang verifikasi sebagai strategi yang bisa diganti lewat konfigurasi:
  - Strategi A (default): verifikasi lewat email kampus. Daftar domain email yang diizinkan diatur lewat konfigurasi (`ALLOWED_EMAIL_DOMAINS`), **jangan di-hardcode**. Kirim tautan verifikasi ke email tersebut. Domain email resmi Unpad harus dipastikan oleh pemilik produk, jadi sediakan nilai contoh yang jelas ditandai sebagai placeholder.
  - Strategi B (feature flag, default mati): unggah foto KTM lalu disetujui manual oleh admin. Jika diaktifkan, simpan gambar KTM di penyimpanan **privat** (tidak bisa diakses publik), batasi akses hanya untuk admin, tampilkan catatan privasi yang jelas, dan sediakan penghapusan otomatis setelah verifikasi selesai atau dalam jangka waktu yang bisa diatur. Ini data pribadi (di Indonesia diatur UU Pelindungan Data Pribadi), jadi simpan seminimal mungkin.
- Rancang model data agar nanti bisa mendukung beberapa kampus (tabel `campuses` dengan domain email), walau sekarang hanya Unpad.
- Pengguna terverifikasi mendapat lencana "Terverifikasi".

### 6.4 Unggah barang oleh penjual
Formulir: foto (maksimal 6, validasi tipe dan ukuran), judul, deskripsi, kategori, kondisi, ukuran (wajib untuk Fashion), harga, dan opsi pengambilan sesuai aturan kategori. Setiap barang berjumlah **satu** (preloved), jadi setelah terjual statusnya "Terjual" dan tidak bisa dipesan lagi.

Di formulir, tampilkan langsung uang yang akan diterima penjual setelah komisi (lihat 6.6).

### 6.5 Checkout
- **Pengambilan:** Pickup (gratis, titik temu dekat kampus) atau Diantar tim Ocho.
- **Ongkir antar:** tarif tetap yang bisa diatur (default **Rp3.000**, rentang rencana Rp2.000-5.000). **Gratis untuk pesanan pertama pembeli baru.** Ada **nilai pesanan minimum untuk antar** yang bisa diatur (default placeholder Rp30.000, tandai jelas bahwa angka ini perlu dikonfirmasi pemilik produk).
- **Pembayaran:** QRIS (bayar sekarang) atau COD. **COD hanya tersedia jika dipilih antar**, tidak untuk pickup.
- Alamat antar: teks lokasi (misalnya nama kos atau gedung) dan nomor telepon untuk kurir.
- Ringkasan: harga barang, ongkir, total.

### 6.6 Harga dan komisi (aturan inti, wajib diuji)
- Semua uang disimpan sebagai **bilangan bulat rupiah** (tanpa pecahan desimal).
- **Komisi platform: 20% dari harga barang** (tidak termasuk ongkir), **ditanggung penjual** (dipotong dari uang penjual, bukan ditambahkan ke harga pembeli).
- Penjual menerima: harga barang dikurangi komisi. Contoh: harga Rp50.000 berarti komisi Rp10.000 dan penjual menerima Rp40.000.
- Pembeli membayar: harga barang ditambah ongkir (jika antar).
- Pembulatan harus konsisten dan terdokumentasi.
- Semua angka (komisi, ongkir, minimum, durasi penahanan) disimpan di **satu berkas konfigurasi** yang mudah diubah.

### 6.7 Pesanan dan status
Alur status: menunggu pembayaran, dibayar, diproses, siap diambil atau sedang diantar, selesai, dibatalkan, sengketa. Untuk QRIS, barang **ditahan (reserved)** selama jangka waktu tertentu (default 30 menit); jika belum dibayar, pesanan kedaluwarsa dan barang dilepas lagi. Pembeli dan penjual punya halaman daftar dan detail pesanan. Pembeli menekan "Barang sudah diterima" untuk menyelesaikan pesanan.

### 6.8 Saldo penjual
Catat pendapatan penjual per pesanan sebagai ledger (buku besar sederhana). Jangan membangun penahanan dana atau escrow otomatis. Penjual bisa mengajukan pencairan, dan **admin menandai pencairan secara manual**. Mekanisme escrow dan cara pencairan resmi belum diputuskan, jadi buat kode yang mudah diubah.

### 6.9 Ulasan
Setelah pesanan selesai, pembeli memberi rating 1-5 dan komentar singkat untuk penjual. Tampilkan rating rata-rata di profil penjual.

### 6.10 Dashboard admin
Halaman terpisah dengan peran admin: daftar pengguna dan persetujuan verifikasi (jika Strategi B aktif), moderasi barang dan laporan, daftar pesanan (ubah status, tugaskan pengantaran, tandai COD sudah diterima), daftar pencairan penjual, dan pengaturan konfigurasi.

## 7. Pembayaran QRIS

- Jangan membuat implementasi QRIS sendiri. Gunakan **payment gateway yang menyediakan QRIS** (misalnya Midtrans, Xendit, atau DOKU). Kamu pilih satu, baca dokumentasi resmi terbarunya, dan gunakan SDK atau API resminya.
- Bungkus integrasi di balik **antarmuka adapter** (`PaymentProvider`) supaya gateway mudah diganti.
- Gunakan **mode sandbox/testing saja**. Jangan memakai kunci produksi. Kunci diambil dari environment variable.
- Implementasi: buat pembayaran saat checkout, tampilkan kode QR (atau tautan pembayaran), tangani **webhook** dari gateway dengan verifikasi tanda tangan, buat penanganan **idempoten** (webhook yang sama bisa datang berkali-kali), dan perbarui status pesanan dengan aman.
- Sediakan halaman status pembayaran yang memperbarui otomatis (polling sederhana boleh).
- Catat di `docs/DECISIONS.md` gateway yang dipilih dan alasannya. Beri tahu di ringkasan akhir apa yang masih perlu diatur manual (akun merchant, kunci produksi) sebelum dipakai sungguhan.

## 8. Model data (acuan, boleh disesuaikan)

Pengguna, Kampus, Kategori, Barang, FotoBarang, Pesanan, Pembayaran, Ulasan, EntriSaldoPenjual, Pencairan, Laporan. Gunakan indeks yang wajar, relasi yang jelas, dan migrasi. Sediakan **seed data**: satu admin, beberapa pengguna terverifikasi, dan 20-30 barang contoh yang realistis di keenam kategori (judul dan harga masuk akal untuk barang kos mahasiswa).

## 9. Kualitas dan keamanan

- Validasi semua input di server. Lindungi dari CSRF, XSS, dan SQL injection. Batasi laju (rate limit) untuk login dan unggah.
- Validasi unggahan gambar (tipe, ukuran, nama file aman).
- Cek otorisasi di setiap aksi (penjual hanya mengubah barangnya, pembeli hanya melihat pesanannya, admin hanya untuk peran admin).
- Aksesibilitas dasar: HTML semantik, label formulir, fokus yang terlihat, kontras yang cukup, teks alternatif gambar.
- **Tes otomatis** minimal untuk logika yang paling berisiko: perhitungan harga dan komisi, aturan ongkir (gratis pesanan pertama, nilai minimum), aturan pengambilan per kategori, penahanan dan kedaluwarsa pesanan, dan penanganan webhook yang idempoten.
- Tulis `README.md`: cara menjalankan secara lokal, daftar environment variable, cara menjalankan tes, dan cara mengganti konfigurasi bisnis.

## 10. Hal yang belum diputuskan pemilik produk

Jangan mengarang jawabannya. Buat sebagai konfigurasi atau feature flag yang mudah diubah, dan tandai di README:
- Metode verifikasi akhir (email kampus atau KTM) dan domain email resmi.
- Mekanisme escrow dan cara pencairan dana penjual.
- Kebijakan refund dan penanganan barang rusak atau tidak sesuai.
- Zona dan jadwal pengantaran, serta nilai pesanan minimum untuk antar.
- Logo asli, warna final, dan teks final.

Mulailah sekarang dengan membaca ulang brief ini, menuliskan rencana singkatnya di `docs/DECISIONS.md`, lalu kerjakan tahap 1.
