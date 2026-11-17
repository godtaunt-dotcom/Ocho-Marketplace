import React, { useState, useEffect } from 'react';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { HomePage } from './pages/HomePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { RupiahInput } from './components/ui/Input';
import { Badge } from './components/ui/Badge';
import { LogoIcon } from './components/ui/Logo';
import { ItemDetail } from './services/api';
import { formatRupiah } from './utils/format';
import {
  AuthUser,
  getStoredUser,
  getStoredToken,
  loginStudent,
  registerStudent,
  fetchCurrentProfile,
  clearAuthSession,
} from './services/auth';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  AlertCircle,
} from 'lucide-react';

type RouteState =
  | { name: 'home' }
  | { name: 'item-detail'; itemId: string }
  | { name: 'showcase' };

export const App: React.FC = () => {
  // Hash-based routing state
  const [route, setRoute] = useState<RouteState>({ name: 'home' });
  const [navbarSearch, setNavbarSearch] = useState<string>('');

  // Authentication session state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [checkoutModalItem, setCheckoutModalItem] = useState<{
    item: ItemDetail;
    deliveryMethod: 'PICKUP' | 'DELIVERY';
    paymentMethod: 'QRIS' | 'COD';
  } | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Showcase state from Tahap 1
  const [inputPrice, setInputPrice] = useState<number>(75000);
  const [showcaseDelivery, setShowcaseDelivery] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [showcaseFirstOrder, setShowcaseFirstOrder] = useState(true);

  // Parse hash URL into route state
  const parseHash = () => {
    const hash = window.location.hash || '#/';
    if (hash.startsWith('#/items/')) {
      const id = hash.replace('#/items/', '').trim();
      if (id) {
        setRoute({ name: 'item-detail', itemId: id });
        return;
      }
    }
    if (hash === '#/showcase') {
      setRoute({ name: 'showcase' });
      return;
    }
    setRoute({ name: 'home' });
  };

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Sync current user on load if token present
  useEffect(() => {
    if (getStoredToken()) {
      fetchCurrentProfile().then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const handleSearchSubmit = () => {
    if (route.name !== 'home') {
      navigateTo('#/');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const res = await loginStudent({
          email: authEmail,
          password: authPassword,
        });
        setCurrentUser(res.data.user);
        setIsLoginModalOpen(false);
      } else {
        const res = await registerStudent({
          email: authEmail,
          password: authPassword,
          name: authName,
          phone: authPhone,
        });
        setCurrentUser(res.data.user);
        setIsLoginModalOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Terjadi kesalahan autentikasi');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
  };

  const handleCheckoutConfirm = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCheckoutModalItem(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans text-brand-text-primary flex flex-col">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onLoginClick={() => {
          setAuthError(null);
          setIsLoginModalOpen(true);
        }}
        onLogoutClick={handleLogout}
        onSellClick={() => {
          if (!currentUser) {
            setAuthError('Silakan masuk terlebih dahulu untuk menjual barang.');
            setIsLoginModalOpen(true);
          } else {
            setIsSellModalOpen(true);
          }
        }}
        onLogoClick={() => navigateTo('#/')}
        searchQuery={navbarSearch}
        onSearchChange={setNavbarSearch}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* 2. Main Content Routing */}
      <main className="flex-1">
        {route.name === 'home' && (
          <HomePage
            onSelectItem={(itemId) => navigateTo(`#/items/${itemId}`)}
            initialSearch={navbarSearch}
            onSearchChange={setNavbarSearch}
          />
        )}

        {route.name === 'item-detail' && (
          <ItemDetailPage
            itemId={route.itemId}
            onBack={() => navigateTo('#/')}
            onCheckoutClick={(item, deliveryMethod, paymentMethod) => {
              if (!currentUser) {
                setAuthError('Silakan masuk dengan akun mahasiswa Unpad untuk membeli barang.');
                setIsLoginModalOpen(true);
                return;
              }
              setCheckoutModalItem({ item, deliveryMethod, paymentMethod });
            }}
          />
        )}

        {route.name === 'showcase' && (
          <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo('#/')}
              >
                &larr; Kembali ke Marketplace
              </Button>
              <Badge variant="info">Tahap 1 Component Showcase</Badge>
            </div>

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

            {/* Color Palette & Accessibility Contrast */}
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
                <div className="space-y-2">
                  <div className="h-20 rounded-2xl bg-brand-orange shadow-xs flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-gray-900 bg-white/90 px-1.5 py-0.5 rounded">Figma #FA8232</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Brand Orange</p>
                    <p className="text-[11px] text-brand-text-secondary font-mono">#FA8232</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-20 rounded-2xl bg-[#D86213] shadow-xs flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">AA Compliant</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Accessible Orange</p>
                    <p className="text-[11px] text-brand-text-secondary font-mono">#D86213</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-20 rounded-2xl bg-brand-blue-500 shadow-xs flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded">#5170FD</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Brand Blue</p>
                    <p className="text-[11px] text-brand-text-secondary font-mono">#5170FD</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-20 rounded-2xl bg-brand-purple shadow-xs flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded">#3A1FB0</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Brand Purple</p>
                    <p className="text-[11px] text-brand-text-secondary font-mono">#3A1FB0</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-20 rounded-2xl bg-brand-surface shadow-xs border border-brand-border flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-brand-text-primary bg-white px-1.5 py-0.5 rounded border border-brand-border">#F8FAFC</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Brand Surface</p>
                    <p className="text-[11px] text-brand-text-secondary font-mono">#F8FAFC</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-20 rounded-2xl bg-brand-text-primary shadow-xs flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">#0F172A</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Text Primary</p>
                    <p className="text-[11px] text-brand-text-secondary font-mono">#0F172A</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Calculator Demonstration */}
            <section className="bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
              <div className="border-b border-brand-border/60 pb-4">
                <h2 className="font-display text-xl font-bold text-brand-text-primary flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-emerald-500 rounded-full"></span>
                  Kalkulator Finansial Transparan Ocho
                </h2>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Membuktikan aturan bisnis komisi 20% ditanggung penjual (dipotong dari hasil) dan ongkos kirim flat Rp 3.000.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <RupiahInput
                    label="Harga Barang Preloved"
                    value={inputPrice}
                    onChange={(val) => setInputPrice(val)}
                    helperText="Ubah angka untuk menguji simulasi pembagian dana secara live."
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-text-primary">Metode Pengiriman:</label>
                    <div className="flex gap-2">
                      <Button
                        variant={showcaseDelivery === 'PICKUP' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setShowcaseDelivery('PICKUP')}
                      >
                        Pickup Gratis
                      </Button>
                      <Button
                        variant={showcaseDelivery === 'DELIVERY' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setShowcaseDelivery('DELIVERY')}
                      >
                        Antar Tim Ocho (Rp 3.000)
                      </Button>
                    </div>
                  </div>

                  {showcaseDelivery === 'DELIVERY' && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-text-primary">
                      <input
                        type="checkbox"
                        checked={showcaseFirstOrder}
                        onChange={(e) => setShowcaseFirstOrder(e.target.checked)}
                        className="rounded text-brand-blue-600 focus:ring-brand-blue-500"
                      />
                      <span>Simulasikan Pesanan Pertama Pembeli (Gratis Ongkir)</span>
                    </label>
                  )}
                </div>

                <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border space-y-3 text-xs">
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Harga Barang:</span>
                    <span className="font-bold text-brand-text-primary">{formatRupiah(inputPrice)}</span>
                  </div>
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Komisi 20% (Ditanggung Penjual):</span>
                    <span className="font-bold text-red-600">- {formatRupiah(Math.round(inputPrice * 0.20))}</span>
                  </div>
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Ongkir Tim Ocho (Ditanggung Pembeli):</span>
                    <span className="font-bold text-brand-text-primary">
                      {showcaseDelivery === 'PICKUP' ? 'Rp 0' : showcaseFirstOrder ? 'Gratis (Rp 0)' : 'Rp 3.000'}
                    </span>
                  </div>
                  <div className="border-t border-brand-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <span>Penjual Menerima:</span>
                      <span>{formatRupiah(Math.max(0, inputPrice - Math.round(inputPrice * 0.20)))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-brand-blue-dark bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                      <span>Pembeli Membayar:</span>
                      <span>
                        {formatRupiah(inputPrice + (showcaseDelivery === 'DELIVERY' && !showcaseFirstOrder ? 3000 : 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 3. Global Footer with Component Showcase Shortcut */}
      <Footer onShowcaseClick={() => navigateTo('#/showcase')} />

      {/* 4. Login & Register Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={authMode === 'LOGIN' ? 'Masuk Akun Mahasiswa Unpad' : 'Daftar Akun Mahasiswa Baru'}
        description="Gunakan email resmi @mail.unpad.ac.id untuk akses jual-beli eksklusif kampus."
      >
        <div className="space-y-4 py-2">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'LOGIN' ? 'bg-white shadow-xs text-brand-blue-600' : 'text-brand-text-secondary'
              }`}
              onClick={() => {
                setAuthMode('LOGIN');
                setAuthError(null);
              }}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'REGISTER' ? 'bg-white shadow-xs text-brand-blue-600' : 'text-brand-text-secondary'
              }`}
              onClick={() => {
                setAuthMode('REGISTER');
                setAuthError(null);
              }}
            >
              Daftar Baru
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {authMode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  Nama Lengkap Mahasiswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-1">
                Email Kampus Unpad
              </label>
              <input
                type="email"
                required
                placeholder="nama@mail.unpad.ac.id"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none"
              />
              <p className="text-[10px] text-brand-text-secondary mt-1">
                Wajib domain <strong className="text-brand-blue-600 font-semibold">@mail.unpad.ac.id</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {authMode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-brand-text-primary mb-1">
                  Nomor WhatsApp (Opsional, untuk COD)
                </label>
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={authLoading}
                className="w-full justify-center text-xs py-2.5"
              >
                {authLoading
                  ? 'Memproses...'
                  : authMode === 'LOGIN'
                  ? 'Masuk ke Ocho'
                  : 'Daftar & Verifikasi Mahasiswa'}
              </Button>
            </div>
          </form>

          <div className="bg-brand-surface p-3 rounded-xl border border-brand-border text-[11px] text-brand-text-secondary text-center space-y-1">
            <p className="font-semibold text-brand-text-primary flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue-600" />
              <span>Verifikasi Mahasiswa Otomatis (Strategi A)</span>
            </p>
            <p>
              Akun yang mendaftar dengan domain resmi Unpad langsung mendapatkan status terverifikasi.
            </p>
          </div>
        </div>
      </Modal>

      {/* 5. Sell Modal */}
      <Modal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        title="Jual Barang Preloved Kamu"
        description="Jual kasur, buku, kipas angin, atau baju ke sesama mahasiswa Unpad Jatinangor."
      >
        <div className="space-y-4 py-2">
          <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-brand-text-primary">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Status Penjual:</span>
            </div>
            <p className="text-brand-text-secondary">
              Masuk sebagai <strong className="text-brand-text-primary">{currentUser?.name}</strong> ({currentUser?.email}) &bull; <Badge variant="verified" size="sm">Terverifikasi</Badge>
            </p>
            <ul className="list-disc list-inside text-brand-text-secondary space-y-1 pt-1">
              <li>Barang milik pribadi, bukan barang terlarang (vape, rokok, alkohol, obat).</li>
              <li>Komisi 20% otomatis dipotong dari hasil penjualan saat barang laku.</li>
              <li>Barang Fashion wajib mengisi ukuran dan kondisi.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSellModalOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert('Formulir input barang interaktif akan siap di Tahap berikutnya.');
                setIsSellModalOpen(false);
              }}
            >
              Lanjutkan Unggah
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. Checkout Flow Modal */}
      {checkoutModalItem && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!checkoutSuccess) setCheckoutModalItem(null);
          }}
          title={checkoutSuccess ? 'Pesanan Berhasil Dibuat!' : 'Konfirmasi Pesanan'}
          description={
            checkoutSuccess
              ? 'Barang berhasil di-reserve selama 30 menit.'
              : `Beli preloved dari mahasiswa Unpad terverifikasi.`
          }
        >
          {checkoutSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-lg text-brand-text-primary">
                  Kode Bayar QRIS Telah Terbit
                </h4>
                <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
                  Selesaikan pembayaran dalam waktu <strong className="text-brand-orange font-bold">30 menit</strong>. Jika tidak dibayar, barang akan otomatis dilepas kembali ke katalog.
                </p>
              </div>

              <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border inline-block mx-auto text-center space-y-2">
                <QrCode className="w-32 h-32 mx-auto text-brand-text-primary" />
                <span className="text-[11px] font-mono text-brand-text-secondary block">
                  Simulasi QRIS Sandbox Ocho
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-brand-surface rounded-xl border border-brand-border">
                <img
                  src={checkoutModalItem.item.photos[0]?.url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-display font-bold text-sm text-brand-text-primary truncate">
                    {checkoutModalItem.item.title}
                  </h4>
                  <p className="text-xs text-brand-text-secondary">
                    Penjual: {checkoutModalItem.item.seller.name}
                  </p>
                  <p className="text-xs font-black text-brand-orange">
                    {formatRupiah(checkoutModalItem.item.priceRupiah)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-brand-border/60">
                <div className="flex justify-between text-brand-text-secondary">
                  <span>Metode Pengambilan:</span>
                  <span className="font-bold text-brand-text-primary">
                    {checkoutModalItem.deliveryMethod === 'PICKUP' ? 'Pickup Kampus (Gratis)' : 'Diantar Tim Ocho (Gratis #1)'}
                  </span>
                </div>
                <div className="flex justify-between text-brand-text-secondary">
                  <span>Metode Pembayaran:</span>
                  <span className="font-bold text-brand-text-primary">
                    {checkoutModalItem.paymentMethod === 'QRIS' ? 'QRIS Instan' : 'COD (Tunai saat kurir tiba)'}
                  </span>
                </div>
                <div className="border-t border-brand-border/60 pt-2 flex justify-between text-sm font-bold text-brand-text-primary">
                  <span>Total yang Harus Dibayar:</span>
                  <span className="text-brand-orange font-black text-base">
                    {formatRupiah(checkoutModalItem.item.priceRupiah)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2.5 rounded-xl flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Barang akan di-reserve 30 menit. Tidak ada biaya admin tersembunyi bagi pembeli.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setCheckoutModalItem(null)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" onClick={handleCheckoutConfirm}>
                  Konfirmasi Beli &bull; {formatRupiah(checkoutModalItem.item.priceRupiah)}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
