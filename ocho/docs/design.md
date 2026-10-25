# Desain

File Figma: https://www.figma.com/design/iQswgt70UQP8iA93U31xBI
Ekspor gambar tiap layar ke folder `design/` (lihat `design/README.md`).

## Merek
Nama: Ocho (huruf kecil "ocho" di logo). Dua huruf "o" seperti dua mata dengan pupil,
senyum melengkung (gradasi biru ke ungu) di bawah "ch". Logo versi putih dipakai di
atas latar biru. Karakter: ramah dan akrab seperti teman sebaya, tapi ada tanda
"Terverifikasi" yang jelas supaya terasa aman.

## Token (nilai terbaru dari Figma)
- Biru utama: #5170FD (header, panel merek)
- Biru gelap untuk teks dan tautan: #3B4FD6
- Oranye tombol utama: #FA8232
- Latar halaman: #F2F4F5
- Teks utama: #191C1F
- Teks sekunder: #5F6C72
- Garis dan batas: #E4E7E9, garis kolom isian #929FA5
- Tint biru muda (pilihan terpilih): #E8ECFF
- Kuning peringatan: latar #FFF1D0, teks #6B4A00
- Huruf antarmuka: Public Sans (Regular, Medium, SemiBold, Bold)
- Wordmark logo: huruf tebal membulat (seperti Fredoka Bold)

Catatan aksesibilitas: teks putih di atas oranye #FA8232 kontrasnya rendah (sekitar 2,8:1).
Pakai teks gelap atau oranye lebih tua untuk tombol. Teks isi minimal kontras 4,5:1.

## Layar desktop (1920 px)
- 00 Login: panel biru (logo, judul) + kartu masuk (Email Unpad, kata sandi).
- 01 Home Page: navbar, hero, grid barang, banner "Jasa untuk Mahasiswa" (coming soon), footer.
- Detail barang + checkout: foto, info barang, pilihan pengambilan, pembayaran, ringkasan.
- Pembayaran QRIS: kartu dengan kode QR, timer, total.

## Layar mobile (390 x 844)
M00 Login, M01 Beranda (header biru, pencarian, chip modul, chip kategori, grid 2 kolom,
tab bar dengan tombol Jual), M02 Detail barang + checkout, M03 Pembayaran QRIS,
M04 Jual barang (unggah foto, judul, kategori, kondisi, ukuran untuk Fashion, deskripsi,
harga dengan rincian komisi, pengambilan, peringatan barang terlarang).

## Alur klik
Login -> Beranda -> klik kartu -> Detail -> Beli sekarang -> QRIS -> Kembali ke beranda.
Mobile: tombol Jual di tab bar -> M04 Jual barang -> Pasang barang -> Beranda.

## Aturan perilaku yang tidak terlihat di desain statis
- Kolom Ukuran hanya muncul untuk kategori Fashion.
- Opsi pengambilan terkunci ke pickup untuk Perabot Kos dan Paket Pindahan.
- Bar bawah (total dan tombol beli) menempel di bawah layar di mobile.
- Keadaan error, kosong, dan memuat harus dirancang untuk tiap layar.
