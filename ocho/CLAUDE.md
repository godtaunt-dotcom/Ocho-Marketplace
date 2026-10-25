# Ocho

Marketplace barang preloved khusus mahasiswa Unpad (Jatinangor), dengan verifikasi
mahasiswa, pembayaran QRIS, dan pickup atau antar oleh tim Ocho.
Bahasa antarmuka: Indonesia. Kode, nama variabel, dan komentar: Inggris.

## Aturan yang tidak boleh dilanggar
@docs/business-rules.md

## Tahap sekarang
- Hanya modul jual-beli. Jasa, Sewa, dan Jastip tampil "Segera hadir" (tidak berfungsi).
- Desktop dulu. Desain mobile sudah ada di `design/` dan dibangun setelah desktop.
- Backend dibangun sebagai REST API terpisah dari tampilan, supaya nanti bisa dipakai aplikasi HP.

## Cara bekerja
- Semua perhitungan uang (harga, komisi, ongkir) dilakukan di server, bukan di klien.
  Uang disimpan sebagai bilangan bulat rupiah.
- Jangan menebak hal yang belum diputuskan. Lihat `docs/open-questions.md`, lalu
  jadikan konfigurasi atau feature flag.
- Setiap keputusan baru dicatat di `docs/decisions.md` dan dihapus dari open-questions.
- Jangan menyimpan kunci rahasia di kode. Pakai environment variable dan `.env.example`.
- Pembayaran QRIS lewat payment gateway, mode sandbox saja.
- Detail produk: `docs/product.md`. Desain dan token warna: `docs/design.md`.
- Prompt pembangunan lengkap: `prompts/build-prompt.md`.

## Perintah
- Install dependensi: `npm install` (di root atau di folder `ocho/`)
- Jalankan server & klien bersamaan: `npm run dev`
- Jalankan backend saja: `npm run dev:server` (http://localhost:4000)
- Jalankan frontend saja: `npm run dev:client` (http://localhost:5173)
- Build kedua workspace: `npm run build`
- Jalankan tes: `npm run test`
