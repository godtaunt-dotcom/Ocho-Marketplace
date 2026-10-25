# Aturan bisnis

## Kategori
Fashion (baju, kemeja, jaket, celana, sepatu, tas, aksesori), Perabot Kos,
Elektronik & Peralatan Listrik, Dapur & Peralatan Rumah, Buku & Perlengkapan Kuliah,
Paket Pindahan (beberapa barang dalam satu paket).

- Fashion: kolom ukuran dan kondisi WAJIB. Brand opsional.
- Perabot Kos dan Paket Pindahan: hanya pickup, tidak bisa diantar.
- Kategori lain: pickup atau antar.
- HP, laptop, dan gadget TIDAK diizinkan di tahap ini.
- Setiap barang berjumlah satu. Setelah terjual statusnya "Terjual".

## Barang terlarang
- Sudah diputuskan: vape tidak boleh.
- Usulan (belum final): rokok, alkohol, obat-obatan dan suplemen, barang tanpa
  kejelasan kepemilikan.
- Terapkan blocklist kata kunci yang bisa diatur, tombol "Laporkan", dan antrean
  moderasi admin.

## Uang
- Semua uang bilangan bulat rupiah.
- Komisi platform 20% dari HARGA BARANG (tidak termasuk ongkir), ditanggung PENJUAL
  (dipotong dari uang penjual, tidak ditambahkan ke harga pembeli).
- Penjual menerima = harga barang - komisi.
  Contoh: harga Rp50.000, komisi Rp10.000, penjual menerima Rp40.000.
- Pembeli membayar = harga barang + ongkir (jika diantar).
- Pembulatan harus konsisten dan terdokumentasi.
- Semua angka (komisi, ongkir, minimum, durasi tahan) di SATU berkas konfigurasi.

## Pengambilan dan ongkir
- Pickup: gratis, titik temu dekat kampus.
- Antar oleh tim Ocho: tarif tetap yang bisa diatur. Rencana Rp2.000-5.000;
  nilai bawaan Rp3.000. Gratis untuk pesanan pertama pembeli baru.
- Nilai pesanan minimum untuk antar: bisa diatur. Nilai bawaan Rp30.000 hanya
  placeholder, belum dikonfirmasi pemilik produk.

## Pembayaran
- QRIS (bayar sekarang) atau COD. COD hanya jika dipilih antar.
- QRIS lewat payment gateway, mode sandbox saja, adapter yang bisa diganti.
  Webhook wajib diverifikasi tanda tangannya dan idempoten.

## Pesanan
- Status: menunggu pembayaran, dibayar, diproses, siap diambil atau sedang diantar,
  selesai, dibatalkan, sengketa.
- Saat pesanan QRIS dibuat, barang ditahan (reserved) 30 menit (bisa diatur). Jika tidak
  dibayar, pesanan kedaluwarsa dan barang dilepas.
- Pembeli menekan "Barang sudah diterima" untuk menyelesaikan pesanan.
- Setelah selesai: rating 1-5 dan komentar singkat untuk penjual.

## Saldo penjual
- Catat pendapatan sebagai ledger sederhana per pesanan.
- Jangan membangun penahanan dana (escrow) otomatis. Penjual mengajukan pencairan,
  admin menandai pencairan secara manual.

## Akses dan verifikasi
- Pengunjung boleh menelusuri tanpa login. Login dan verifikasi diminta saat membeli
  atau mengunggah barang.
- Metode verifikasi belum diputuskan (email kampus atau KTM). Rancang sebagai strategi
  yang bisa diganti lewat konfigurasi. Domain email diizinkan lewat konfigurasi
  (ALLOWED_EMAIL_DOMAINS), jangan di-hardcode. Domain email mahasiswa Unpad kemungkinan
  mail.unpad.ac.id, perlu dikonfirmasi.
- Bila KTM dipakai: simpan di penyimpanan privat, akses hanya admin, hapus setelah
  verifikasi atau dalam jangka yang bisa diatur, dan tampilkan catatan privasi.
  Ini data pribadi (UU Pelindungan Data Pribadi), simpan seminimal mungkin.
