import React, { useState } from 'react';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { Logo, LogoIcon } from './components/ui/Logo';
import { Button } from './components/ui/Button';
import { Input, RupiahInput } from './components/ui/Input';
import { Badge } from './components/ui/Badge';
import { Card, CardContent, CardFooter } from './components/ui/Card';
import { Modal } from './components/ui/Modal';
import { Alert } from './components/ui/Alert';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CreditCard,
  Truck,
} from 'lucide-react';

export const App: React.FC = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'sell' | 'preview'>('preview');

  // Interactive Rupiah Input state
  const [inputPrice, setInputPrice] = useState<number>(75000);
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [isFirstOrder, setIsFirstOrder] = useState(true);

  // Commission calculations (20% borne by seller)
  const commissionRate = 0.20;
  const commission = Math.max(1000, Math.round(inputPrice * commissionRate));
  const sellerPayout = Math.max(0, inputPrice - commission);
  const deliveryFee = deliveryMethod === 'DELIVERY' ? (isFirstOrder ? 0 : 3000) : 0;
  const buyerTotal = inputPrice + deliveryFee;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans text-brand-text-primary flex flex-col">
      {/* 1. Global Navigation Bar */}
      <Navbar
        onLoginClick={() => {
          setModalType('login');
          setIsModalOpen(true);
        }}
        onSellClick={() => {
          setModalType('sell');
          setIsModalOpen(true);
        }}
      />

      {/* Main Container (Desktop 1280px optimized) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-12">
        {/* Stage 1 Announcement Header */}
        <section className="bg-gradient-to-r from-brand-blue-600 via-brand-purple to-brand-blue-700 rounded-3xl p-8 text-white shadow-soft relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-brand-blue-100 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tahap 1: Setup Proyek, Desain Sistem &amp; Arsitektur</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Ocho Design System &amp; Component Showcase
            </h1>
            <p className="text-sm md:text-base text-brand-blue-100 leading-relaxed">
              Verifikasi token warna WCAG AA, tipografi Fredoka &amp; Public Sans, logo resmi dengan senyum kurva
              dan titik pupil, serta komponen UI atomik siap pakai untuk marketplace mahasiswa Unpad.
            </p>
          </div>
          <div className="absolute right-6 -bottom-8 opacity-10 pointer-events-none select-none hidden lg:block">
            <LogoIcon size={260} />
          </div>
        </section>

        {/* 2. Color Palette & Accessibility Contrast */}
        <section className="bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="font-display text-xl font-bold text-brand-text-primary flex items-center gap-2">
              <span className="w-2.5 h-6 bg-brand-blue-500 rounded-full"></span>
              Palette Warna &amp; Aksesibilitas (WCAG AA)
            </h2>
            <p className="text-xs text-brand-text-secondary mt-1">
              Diterjemahkan langsung dari token Figma di <code className="text-brand-purple font-mono">docs/design.md</code>.
              Tombol teks putih pada warna jingga menggunakan varian aman <span className="font-mono font-semibold">#D86213</span> (kontras &ge; 4.5:1).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {/* Brand Orange */}
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-brand-orange shadow-xs flex items-end p-2.5">
                <span className="text-[10px] font-bold text-gray-900 bg-white/90 px-1.5 py-0.5 rounded">Figma #FA8232</span>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text-primary">Brand Orange</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">#FA8232</p>
                <span className="text-[10px] text-amber-700 font-medium">Elemen visual / CTA</span>
              </div>
            </div>

            {/* Accessible Orange Button */}
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-[#D86213] shadow-xs flex items-end p-2.5">
                <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">AA Compliant</span>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text-primary">Accessible Orange</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">#D86213</p>
                <span className="text-[10px] text-emerald-700 font-medium">Teks Putih Kontras 4.6:1</span>
              </div>
            </div>

            {/* Brand Blue */}
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-brand-blue-500 shadow-xs flex items-end p-2.5">
                <span className="text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded">#5170FD</span>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text-primary">Brand Blue</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">#5170FD</p>
                <span className="text-[10px] text-blue-700 font-medium">Warna Utama &amp; Trust</span>
              </div>
            </div>

            {/* Brand Purple */}
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-brand-purple shadow-xs flex items-end p-2.5">
                <span className="text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded">#3A1FB0</span>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text-primary">Brand Purple</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">#3A1FB0</p>
                <span className="text-[10px] text-purple-700 font-medium">Aksen &amp; Hero Gradient</span>
              </div>
            </div>

            {/* Surface Gray */}
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-brand-surface border border-brand-border flex items-end p-2.5">
                <span className="text-[10px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded">#F2F4F5</span>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text-primary">Surface Gray</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">#F2F4F5</p>
                <span className="text-[10px] text-gray-600 font-medium">Latar Belakang</span>
              </div>
            </div>

            {/* Verified Green */}
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-brand-success-bg border border-emerald-200 flex items-end p-2.5">
                <span className="text-[10px] font-bold text-brand-success-text bg-white px-1.5 py-0.5 rounded">#E6F9F0</span>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text-primary">Verified Green</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">#0F7B46</p>
                <span className="text-[10px] text-emerald-700 font-medium">Status KTM Unpad</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Typography & Logo Showcase */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo Showcase */}
          <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <h2 className="font-display text-xl font-bold text-brand-text-primary">
                Anatomi Logo Ocho
              </h2>
              <p className="text-xs text-brand-text-secondary mt-1">
                Kedua huruf "o" memiliki titik pupil mata; garis senyum kurva melengkung tepat di bawah huruf "ch".
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 bg-brand-surface rounded-2xl border border-brand-border/60">
              <div className="text-center space-y-2">
                <Logo size="lg" />
                <p className="text-[11px] text-brand-text-secondary">Wordmark Lengkap (lg)</p>
              </div>
              <div className="text-center space-y-2">
                <LogoIcon size={56} />
                <p className="text-[11px] text-brand-text-secondary">Ikon Mandiri</p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-brand-purple rounded-xl">
                  <Logo size="md" />
                </div>
                <p className="text-[11px] text-brand-text-secondary">Varian Background Gelap</p>
              </div>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <h2 className="font-display text-xl font-bold text-brand-text-primary">
                Tipografi: Fredoka &amp; Public Sans
              </h2>
              <p className="text-xs text-brand-text-secondary mt-1">
                Fredoka untuk judul/display ramah mahasiswa; Public Sans untuk keterbacaan teks informasi tinggi.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Display Bold (Fredoka)</span>
                <p className="font-display text-2xl font-bold text-brand-text-primary">
                  Marketplace Preloved Mahasiswa Unpad
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue-600">Heading Semibold (Fredoka)</span>
                <p className="font-display text-lg font-semibold text-brand-text-primary">
                  Aman, Murah, Terverifikasi Antar Kosan Jatinangor
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">Body Regular (Public Sans)</span>
                <p className="font-sans text-sm text-brand-text-secondary leading-relaxed">
                  Semua transaksi diawasi sistem verifikasi identitas mahasiswa Unpad. Pembayaran QRIS instan dan opsi COD di titik temu kampus yang aman.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Base Components: Buttons & Badges */}
        <section className="bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-8">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="font-display text-xl font-bold text-brand-text-primary flex items-center gap-2">
              <span className="w-2.5 h-6 bg-brand-orange rounded-full"></span>
              Komponen Tombol (Buttons) &amp; Lencana (Badges)
            </h2>
            <p className="text-xs text-brand-text-secondary mt-1">
              Semua varian tombol mendukung status loading, disabled, dan ikon kiri/kanan.
            </p>
          </div>

          {/* Buttons Row */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">Varian Tombol</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md">
                Primary Button
              </Button>
              <Button variant="secondary" size="md">
                Secondary Button
              </Button>
              <Button variant="outline" size="md">
                Outline Button
              </Button>
              <Button variant="ghost" size="md">
                Ghost Button
              </Button>
              <Button variant="danger" size="md">
                Danger Action
              </Button>
              <Button variant="primary" size="md" isLoading>
                Memuat Data
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                Buka Dialog Modal
              </Button>
            </div>
          </div>

          {/* Badges Row */}
          <div className="space-y-4 pt-4 border-t border-brand-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">Varian Lencana (Badges)</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="verified">Mahasiswa Terverifikasi</Badge>
              <Badge variant="category">Perabot Kos</Badge>
              <Badge variant="category">Buku Kuliah</Badge>
              <Badge variant="warning">Stok Terbatas</Badge>
              <Badge variant="sold">Terjual</Badge>
              <Badge variant="coming-soon">Modul: Jasa (Segera Hadir)</Badge>
              <Badge variant="info">Titik COD Gerlam</Badge>
              <Badge variant="default">Default Gray</Badge>
            </div>
          </div>
        </section>

        {/* 5. Inputs & Interactive Rupiah Formatter */}
        <section className="bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-8">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="font-display text-xl font-bold text-brand-text-primary flex items-center gap-2">
              <span className="w-2.5 h-6 bg-brand-purple rounded-full"></span>
              Form Inputs &amp; Simulasi Hitung Uang Server
            </h2>
            <p className="text-xs text-brand-text-secondary mt-1">
              Format rupiah otomatis dengan komputasi komisi 20% ditanggung penjual dan tarif ongkir tetap Rp 3.000.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Input Components Column */}
            <div className="space-y-5">
              <Input
                label="Nama Barang Preloved"
                placeholder="Contoh: Kipas Angin Meja Cosmos 12 Inch"
                helperText="Wajib jelas dan mencantumkan kondisi fisik barang."
              />

              <Input
                label="Email Mahasiswa Unpad"
                placeholder="nama.kamu@mail.unpad.ac.id"
                helperText="Hanya menerima domain resmi @mail.unpad.ac.id atau @unpad.ac.id"
              />

              <RupiahInput
                label="Harga Jual Barang (Rupiah)"
                value={inputPrice}
                onChange={setInputPrice}
                helperText="Ketik nominal harga barang dalam kelipatan rupiah bulat."
              />

              <Input
                label="Input dengan Error Validasi"
                defaultValue="Vape Pod Caliburn G2"
                error="Barang ini dilarang di platform Ocho (vape/rokok/alkohol)."
              />
            </div>

            {/* Live Calculation Preview Card */}
            <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-brand-border/80 pb-3">
                <h3 className="font-display text-base font-bold text-brand-text-primary flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-blue-600" />
                  Simulasi Transaksi Sesuai Aturan Bisnis
                </h3>
                <span className="text-xs font-semibold text-brand-purple bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Komisi 20%
                </span>
              </div>

              {/* Delivery Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-text-primary">Metode Pengambilan:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('PICKUP')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      deliveryMethod === 'PICKUP'
                        ? 'bg-white border-brand-blue-500 text-brand-blue-600 shadow-xs'
                        : 'bg-transparent border-brand-border text-brand-text-secondary hover:bg-white/60'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Pickup Kampus (Gratis)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('DELIVERY')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      deliveryMethod === 'DELIVERY'
                        ? 'bg-white border-brand-blue-500 text-brand-blue-600 shadow-xs'
                        : 'bg-transparent border-brand-border text-brand-text-secondary hover:bg-white/60'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Antar Kosan (Rp 3.000)</span>
                  </button>
                </div>
              </div>

              {/* First Order Toggle */}
              {deliveryMethod === 'DELIVERY' && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-text-secondary">
                  <input
                    type="checkbox"
                    checked={isFirstOrder}
                    onChange={(e) => setIsFirstOrder(e.target.checked)}
                    className="rounded text-brand-blue-600 focus:ring-brand-blue-500"
                  />
                  <span>Pesanan Pertama Pembeli (Gratis Ongkir Rp 0)</span>
                </label>
              )}

              {/* Ledger Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-brand-text-secondary">
                  <span>Harga Barang (Ditentukan Penjual):</span>
                  <span className="font-semibold text-brand-text-primary">{formatRupiah(inputPrice)}</span>
                </div>
                <div className="flex justify-between text-brand-text-secondary">
                  <span>Komisi Platform Ocho (20% ditanggung Penjual):</span>
                  <span className="font-semibold text-red-600">- {formatRupiah(commission)}</span>
                </div>
                <div className="flex justify-between text-brand-text-secondary">
                  <span>Ongkos Kirim Tim Ocho (Ditanggung Pembeli):</span>
                  <span className="font-semibold text-brand-text-primary">
                    {deliveryFee === 0 ? 'Gratis (Rp 0)' : formatRupiah(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-brand-border/80 pt-3 space-y-2">
                  <div className="flex justify-between text-sm font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span>Penjual Menerima Bersih:</span>
                    <span>{formatRupiah(sellerPayout)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-brand-blue-dark bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span>Pembeli Membayar Total:</span>
                    <span>{formatRupiah(buyerTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Product Card & Alerts Preview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Card Component Preview */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-display text-lg font-bold text-brand-text-primary">
              Contoh Kartu Produk (Product Card)
            </h3>
            <Card hoverable className="group">
              {/* Product Image Placeholder with Badge */}
              <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
                  alt="Buku Kuliah"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="verified">Mahasiswa Fikom</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="category">Buku Kuliah</Badge>
                </div>
              </div>

              <CardContent className="space-y-2.5">
                <h4 className="font-display font-bold text-base text-brand-text-primary line-clamp-1 group-hover:text-brand-blue-600 transition-colors">
                  Buku Pengantar Ilmu Komunikasi
                </h4>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Kondisi: 90% Mulus</span>
                  <span>&bull;</span>
                  <span>Jatinangor</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-brand-text-secondary">Harga Pas</span>
                    <p className="font-display text-lg font-black text-brand-orange">
                      Rp 45.000
                    </p>
                  </div>
                  <span className="text-xs text-brand-text-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue-500" />
                    <span>COD Gerlam</span>
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                <span className="text-xs text-brand-text-secondary">Diunggah 2 jam lalu</span>
                <Button variant="outline" size="sm">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Alerts & System Notifications */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-display text-lg font-bold text-brand-text-primary">
              Notifikasi Sistem &amp; Peringatan (Alerts)
            </h3>
            <div className="space-y-3">
              <Alert
                type="success"
                title="Verifikasi Akun Mahasiswa Berhasil"
                message="Akun kamu telah terverifikasi dengan alamat email @mail.unpad.ac.id. Lencana terverifikasi kini aktif di profilmu."
              />
              <Alert
                type="warning"
                title="Batas Waktu Pembayaran QRIS"
                message="Barang ditahan (reserved) selama 30 menit. Jika QRIS belum dibayar dalam batas waktu, pesanan dibatalkan otomatis dan barang kembali tersedia untuk pembeli lain."
              />
              <Alert
                type="info"
                title="Panduan Titik Temu COD Aman"
                message="Selalu lakukan transaksi COD di tempat ramai di lingkungan kampus Unpad (Gerbang Lama/Gerlam, Perpustakaan Pusat CISRAL, atau Bale Santika)."
              />
              <Alert
                type="error"
                title="Barang Terlarang Terdeteksi"
                message="Kata kunci 'vape' terdeteksi. Sesuai aturan bisnis Ocho, rokok elektrik, vape, dan cairan liquid tidak boleh diperjualbelikan."
              />
            </div>
          </div>
        </section>
      </main>

      {/* 7. Interactive Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'login'
            ? 'Masuk dengan Akun Mahasiswa Unpad'
            : modalType === 'sell'
            ? 'Jual Barang Preloved Kamu'
            : 'Contoh Dialog Modal Sistem Desain'
        }
        description={
          modalType === 'login'
            ? 'Gunakan akun Google Kampus Unpad (@mail.unpad.ac.id) untuk login instan.'
            : modalType === 'sell'
            ? 'Isi formulir sederhana untuk memasang barang jualan di marketplace.'
            : 'Komponen modal ini memblokir scroll latar belakang dan dapat ditutup dengan tombol Escape atau klik luar.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Aksi berhasil dijalankan di modal!');
                setIsModalOpen(false);
              }}
            >
              Konfirmasi
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          {modalType === 'login' ? (
            <div className="space-y-3 text-center py-4">
              <Button
                variant="outline"
                className="w-full justify-center"
                leftIcon={<ShieldCheck className="w-4 h-4 text-brand-blue-600" />}
              >
                Masuk dengan Akun Kampus Unpad (@mail.unpad.ac.id)
              </Button>
              <p className="text-xs text-brand-text-secondary">
                Hanya mahasiswa dan civitas akademika aktif Universitas Padjadjaran yang dapat bertransaksi.
              </p>
            </div>
          ) : modalType === 'sell' ? (
            <div className="space-y-3">
              <Input label="Judul Barang" placeholder="Contoh: Meja Belajar Lipat Kayu" />
              <RupiahInput label="Harga Jual" value={50000} onChange={() => {}} />
            </div>
          ) : (
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Ini adalah representasi komponen modal dialog dengan backdrop blur, transisi mulus, dan pengelolaan fokus tombol. Siap digunakan untuk checkout, login, dan formulir unggah barang pada Tahap 2 &amp; 3.
            </p>
          )}
        </div>
      </Modal>

      {/* 8. Global Footer */}
      <Footer />
    </div>
  );
};
