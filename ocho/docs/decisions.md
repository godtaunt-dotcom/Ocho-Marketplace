# Keputusan yang sudah diambil

## Keputusan Produk & Bisnis
- Nama produk: Ocho.
- Tahap 1 hanya mahasiswa Unpad; hanya mahasiswa (belum umum); satu aplikasi multi-kampus.
- Modul pertama: jual-beli. Jasa, Sewa, Jastip "Segera hadir".
- Komisi 20% dari harga barang, ditanggung penjual (dipotong dari dana penjual, tidak ditambahkan ke harga pembeli). Minimum komisi Rp 1.000.
- Pengambilan: pickup atau antar tim Ocho. COD hanya untuk opsi antar.
- Ongkos kirim tim Ocho: flat Rp 3.000 (bisa diatur), gratis untuk pesanan pertama pembeli baru. Nilai pesanan minimum untuk antar: Rp 30.000 (placeholder).
- Pembayaran: QRIS lewat payment gateway (sandbox) dengan batas waktu reservasi (holding period) 30 menit, dan COD untuk opsi antar.
- Barang terlarang: Vape/rokok elektrik, rokok, alkohol/miras, obat-obatan terlarang, psikotropika, dan senjata tidak diizinkan. Gadget (HP/laptop/tablet) ditangguhkan di tahap 1.
- Akses & Privasi: Browse tanpa login, verifikasi mahasiswa (email domain `@mail.unpad.ac.id` / `@unpad.ac.id` atau KTM) saat beli atau unggah barang.
- Backend sebagai REST API terpisah (decoupled), semua hitungan uang wajib di server sebagai bilangan bulat Rupiah.

## Keputusan Arsitektur & Teknologi (Tahap 1)

### 1. Struktur Monorepo (Workspace)
- **Tooling**: npm workspaces (`ocho/package.json` mengelola workspace `server` dan `client`).
- **Orkestrasi Dev**: `concurrently` untuk menjalankan backend API (port 4000) dan frontend web (port 5173) secara paralel dengan satu perintah `npm run dev`.
- **Root Delegation**: Root `package.json` mendelegasikan perintah (`npm run dev`, `build`, `test`) ke subfolder `ocho` sehingga pengembang dapat menjalankannya langsung dari root maupun direktori `ocho`.

### 2. Backend Stack
- **Runtime & Bahasa**: Node.js dengan TypeScript (strict mode, target ES2022).
- **Framework**: Express.js untuk decoupled REST API.
- **Validasi Schema**: Zod untuk validasi payload request dan query parameter.
- **Dokumentasi API**: OpenAPI 3.0 / Swagger UI terintegrasi di route `/api/docs`.
- **ORM & Database**: Prisma ORM dengan SQLite (`file:./dev.db`) untuk tahap pengembangan lokal tanpa konfigurasi Docker/server database eksternal, dengan skema yang 100% kompatibel dan siap dialihkan ke PostgreSQL saat produksi.
- **Konfigurasi Bisnis Terpusat**: Seluruh aturan finansial dan operasional ditempatkan dalam satu berkas tunggal (`server/src/config/business.ts`) sebagai Single Source of Truth.

### 3. Frontend Stack
- **Framework & Bundler**: React 18, TypeScript, dan Vite untuk performa build cepat dan Hot Module Replacement (HMR).
- **Styling**: Tailwind CSS v3 dengan konfigurasi token desain dari `docs/design.md`.
- **Ikonografi**: Lucide React.
- **Strategi Tampilan**: Desktop-first (container standar 1280px, fungsional dari viewport 1024px+). Desain mobile dipertahankan di `design/` untuk fase lanjutan.
- **Proxy Dev**: Vite dikonfigurasi dengan reverse proxy `/api` mengarah ke `http://localhost:4000` untuk menghindari friksi CORS pada lingkungan pengembangan lokal.

### 4. Sistem Desain & Aksesibilitas (WCAG AA)
- **Tipografi**:
  - `Fredoka`: Font display dan brand/heading ramah mahasiswa.
  - `Public Sans`: Font body dan antarmuka dengan legibilitas tinggi.
- **Logo Brand**: Wordmark dengan dua titik pupil di huruf "o" dan senyum kurva gradien khas di bawah huruf "ch".
- **Aksesibilitas Kontras Warna (WCAG AA)**:
  - Warna jingga utama Figma (`#FA8232`) memiliki rasio kontras 2.4:1 terhadap teks putih (tidak memenuhi WCAG AA).
  - Untuk tombol dan teks berlatar belakang jingga, diimplementasikan varian jingga aksesibel (`#D86213`) yang menghasilkan kontras 4.6:1 (memenuhi standar WCAG AA &ge; 4.5:1).
- **Komponen Inti**: `Button` (5 varian + status loading/disabled), `Input` (termasuk formatter Rupiah otomatis), `Badge` (verified mahasiswa, kategori, status), `Card`, `Modal` (focus management + keyboard escape), `Alert`, `Navbar` (dengan modul tab aktif/segera hadir), dan `Footer` (dengan disclaimer resmi inisiatif mahasiswa Unpad).

## Keputusan Data & Model Relasional (Tahap 2)

### 1. Desain Skema Database (Prisma ORM & SQLite)
- **11 Entitas Inti**: `Campus`, `User`, `Category`, `Item`, `ItemPhoto`, `Order`, `Payment`, `Review`, `SellerBalanceEntry`, `Payout`, `Report`.
- **Portabilitas Enum**: Prisma enum tidak didukung natively di SQLite; seluruh status/enum (`role`, `status`, `condition`, `deliveryMethod`, dll.) didefinisikan sebagai `String` dengan validasi ketat di level Zod/Express dan Prisma seed. Ini menjamin kompatibilitas 100% saat migrasi ke PostgreSQL di lingkungan produksi.
- **Relasi & Integritas**:
  - `ItemPhoto` memiliki relasi `onDelete: Cascade` terhadap `Item`.
  - `Payment` dan `Review` berelasi 1-to-1 dengan `Order`.
  - Double-entry balance entry mencatat mutasi kredit/debit saldo penjual per pesanan yang selesai.
- **Enkripsi Password**: Menggunakan implementasi bawaan Node.js `crypto.scryptSync` dengan salt 16-byte acak dan format `salt:hexHash`, tanpa ketergantungan library pihak ketiga (`bcrypt`).

### 2. Data Seed & Konsistensi Finansial
- 1 Admin (`admin@mail.unpad.ac.id`), 5 Mahasiswa terverifikasi Unpad.
- 6 Kategori inti (Fashion, Perabot Kos, Elektronik, Dapur, Buku, Paket Pindahan) dengan restriksi pengiriman: Perabot Kos & Paket Pindahan wajib `PICKUP_ONLY`.
- 24 Barang preloved realistis dengan placeholder SVG data URL beresolusi tinggi, bebas latency jaringan eksternal.
- 2 Pesanan contoh:
  - 1 pesanan selesai (`OCH-20261023-0001`) membuktikan formula komisi 20% pemotongan saldo penjual dan pembayaran QRIS settled.
  - 1 pesanan ditahan (`OCH-20261023-0002`) membuktikan reservasi stok 30 menit.

## Keputusan Halaman Publik & Marketplace Frontend (Tahap 3)

### 1. Zero-Dependency Hash Router
- **Pendekatan**: Menggunakan routing berbasis hash peramban bawaan (`window.location.hash` dan event `hashchange`) tanpa dependensi eksternal (`react-router-dom`).
- **Alasan**: Menghindari beban ukuran bundle, menjamin deep-linking bekerja seketika (`#/` untuk Beranda/Katalog, `#/items/:id` untuk Detail Barang, `#/showcase` untuk Component Showcase), dan kebal terhadap kendala 404 fallback pada server statis.

### 2. Halaman Beranda & Penelusuran Katalog (Beranda)
- **Hero & Identity**: Banner eksklusif mahasiswa Unpad dengan visual kartu verifikasi 3 langkah ("Verifikasi sekali, langsung jalan").
- **Kategori Interaktif**: Bar kategori horizontal dengan kalkulasi live count jumlah barang per kategori.
- **Multi-Filter Toolbar**: Filter pencarian teks bebas (sinkron dengan search bar Navbar), filter kondisi barang (Semua, Baru, Seperti Baru, Bekas Layak), filter opsi pengiriman (Semua, Pickup Kampus, Bisa Diantar), dan pengurutan (Terbaru, Harga Terendah, Harga Tertinggi).
- **Responsive Product Grid**: Desain grid responsif (1 kolom mobile, 2 kolom tablet, 3-4 kolom desktop) dengan kartu barang memuat foto, tag kategori, spesifikasi ukuran (wajib fashion), lokasi pickup terdekat, badge verified penjual, dan badge metode antar.
- **UX States**: Dilengkapi skeleton loading card teranimasi (`ProductCardSkeleton`), empty state informatif dengan tombol reset filter, pagination, serta banner edukasi keamanan transaksi kampus (rekomendasi titik temu Gerlam, Bale Santika, dan Gedung Rektorat).

### 3. Halaman Detail Barang (Item Detail Page)
- **Tata Letak Desktop Dua Kolom (Two-Column Layout)**:
  - **Kolom Kiri**: Galeri foto interaktif dengan selector thumbnail, badge kategori & kondisi, atribut wajib fashion (Ukuran dan Brand), deskripsi lengkap barang, rekomendasi titik temu kampus Jatinangor, panduan keamanan COD, dan tombol modal laporan barang ("Laporkan barang").
  - **Kolom Kanan (Sticky Card)**: Kartu profil penjual mahasiswa terverifikasi dengan rating bintang & jumlah review, pemilih metode pengiriman (Pickup Gratis vs Antar Kosan Tim Ocho), pemilih metode pembayaran (QRIS Instan vs COD), transparansi rincian komisi platform 20% (ditanggung penjual), dan sticky action button "Beli Sekarang".
- **Modal Alur Pembelian & Reservasi 30 Menit**:
  - Mengonfirmasi pembelian langsung dengan simulasi reservasi stok selama 30 menit dan penerbitan kode bayar QRIS instan sesuai aturan bisnis Ocho.

## Keputusan Autentikasi & Verifikasi Mahasiswa (Tahap 4)

### 1. Zero-Dependency HMAC-SHA256 Bearer Token
- **Implementasi**: Menggunakan modul bawaan `node:crypto` (`createHmac('sha256')`) tanpa dependensi pustaka eksternal (`jsonwebtoken`).
- **Format**: `base64url(payload).base64url(signature)`.
- **Mitigasi Serangan Timing & Buffer Exception**: Verifikasi signature dilakukan dengan `crypto.timingSafeEqual` yang diawali pemeriksaan kesamaan panjang buffer (`sigBuf.length === expectedBuf.length`) untuk mencegah lemparan pengecualian ukuran buffer dan mencegah timing attacks.
- **Payload Token**: Menyimpan `userId`, `email`, `role`, status `isVerified`, dan waktu kedaluwarsa (`exp` 7 hari).

### 2. Validasi Domain Kampus Eksklusif (@mail.unpad.ac.id)
- **Domain Matching**: Pencocokan domain persis (`domain === allowed.toLowerCase().trim()`) berbasis Single Source of Truth `server/src/config/business.ts` (`ALLOWED_EMAIL_DOMAINS` default `mail.unpad.ac.id`).
- **Keamanan Anti-Spoofing**: Mencegah subdomain lookalike (`evil-unpad.ac.id`, `mail.unpad.ac.id.evil.com`) melalui tes otomatis.

### 3. Middleware Autentikasi & Role Enforcement
- `requireAuth`: Memverifikasi header `Authorization: Bearer <token>` dan melampirkan payload pengguna ke `req.user`.
- `requireVerifiedStudent`: Memastikan pengguna telah terverifikasi kampus sebelum mengizinkan aksi penjualan barang dan pembuatan pesanan.
- `optionalAuth`: Mendeteksi identitas pengguna tanpa memblokir pengunjung anonim untuk menjaga akses browsing publik.

### 4. Manajemen Sesi Client-Side
- Token dan metadata pengguna disimpan di browser `localStorage`.
- Komponen `Navbar` secara dinamis menampilkan avatar, nama mahasiswa, dan badge verified Unpad saat sesi aktif, serta menyediakan kontrol keluar akun (`logout`).
- Modal login dan registrasi terintegrasi dengan validasi langsung domain kampus.



