import React, { useEffect, useState } from 'react';
import { fetchItemById, ItemDetail, BusinessConfig, fetchBusinessConfig } from '../services/api';
import { formatRupiah, formatRelativeTime } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Truck,
  Package,
  QrCode,
  Banknote,
  Star,
  AlertTriangle,
  Flag,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';

export interface ItemDetailPageProps {
  itemId: string;
  onBack: () => void;
  onCheckoutClick?: (item: ItemDetail, deliveryMethod: 'PICKUP' | 'DELIVERY', paymentMethod: 'QRIS' | 'COD') => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  itemId,
  onBack,
  onCheckoutClick,
}) => {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Business config
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  // Delivery & Payment selection state for checkout preview
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'COD'>('QRIS');

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('PROHIBITED_ITEM');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  // Load item and config
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([fetchItemById(itemId), fetchBusinessConfig().catch(() => null)])
      .then(([itemData, configData]) => {
        if (!isMounted) return;
        setItem(itemData);
        if (configData) setConfig(configData);

        // Auto-select allowed delivery method
        if (itemData.allowedDeliveryMethod === 'PICKUP_ONLY') {
          setDeliveryMethod('PICKUP');
          setPaymentMethod('QRIS');
        }

        // Set initial photo index to primary photo if available
        const primaryIdx = itemData.photos.findIndex((p) => p.isPrimary);
        if (primaryIdx >= 0) setSelectedPhotoIndex(primaryIdx);

        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat barang.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [itemId]);

  // Handle switching delivery method
  const handleDeliveryChange = (method: 'PICKUP' | 'DELIVERY') => {
    setDeliveryMethod(method);
    // COD is only allowed for delivery
    if (method === 'PICKUP' && paymentMethod === 'COD') {
      setPaymentMethod('QRIS');
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSubmitted(false);
      setReportNotes('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-pulse">
        <div className="w-32 h-6 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-4/3 w-full bg-gray-200 rounded-2xl" />
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-xl" />
              <div className="w-20 h-20 bg-gray-200 rounded-xl" />
              <div className="w-20 h-20 bg-gray-200 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl text-brand-text-primary">
            Barang Tidak Ditemukan
          </h2>
          <p className="text-sm text-brand-text-secondary">
            {error || 'Barang yang Anda cari mungkin telah dihapus atau tidak tersedia.'}
          </p>
        </div>
        <Button variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  // Delivery calculation for preview
  const standardDeliveryFee = config?.standardDeliveryFeeRupiah ?? 3000;
  const isFirstOrder = true; // Default preview for unpad student buyer
  const deliveryFee = deliveryMethod === 'DELIVERY' ? (isFirstOrder ? 0 : standardDeliveryFee) : 0;
  const buyerTotal = item.priceRupiah + deliveryFee;

  // Platform commission (20% borne by seller)
  const commissionRate = config?.platformCommissionRate ?? 0.20;
  const commissionRupiah = Math.round(item.priceRupiah * commissionRate);
  const sellerPayoutRupiah = Math.max(0, item.priceRupiah - commissionRupiah);

  const isPickupOnly = item.allowedDeliveryMethod === 'PICKUP_ONLY';
  const isAvailable = item.status === 'ACTIVE';

  const photos = item.photos.length > 0 ? item.photos : [{ id: 'default', url: '', isPrimary: true }];
  const currentPhoto = photos[selectedPhotoIndex]?.url;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-brand-text-secondary">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-semibold text-brand-blue-600 hover:text-brand-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <span>/</span>
        <span className="text-brand-text-secondary">{item.category.name}</span>
        <span>/</span>
        <span className="text-brand-text-primary font-medium truncate max-w-xs">{item.title}</span>
      </nav>

      {/* Main 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ================= LEFT COLUMN: Photos & Item Details (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full bg-brand-surface rounded-3xl overflow-hidden border border-brand-border shadow-xs">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-text-secondary text-sm">
                  Foto Tidak Tersedia
                </div>
              )}

              {/* Status Overlay */}
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                  <span className="bg-red-600 text-white font-display text-lg font-black tracking-widest uppercase px-6 py-2 rounded-xl shadow-lg">
                    {item.status === 'SOLD' ? 'Sudah Terjual' : 'Sedang Dipesan'}
                  </span>
                </div>
              )}

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="category">{item.category.name}</Badge>
                <span className="text-xs font-semibold bg-white/95 text-brand-blue-dark px-2.5 py-1 rounded-lg border border-brand-border/60 shadow-xs">
                  Kondisi: {item.condition}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {photos.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedPhotoIndex === idx
                        ? 'border-brand-blue-600 ring-2 ring-brand-blue-100 scale-102'
                        : 'border-brand-border hover:border-brand-blue-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Key Attributes (Mandatory Fashion Size & Brand) */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-base text-brand-text-primary">
              Spesifikasi Barang
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-brand-surface p-3 rounded-xl border border-brand-border/60">
                <span className="text-brand-text-secondary block mb-1">Kondisi</span>
                <span className="font-bold text-brand-text-primary text-sm">{item.condition}</span>
              </div>

              {item.size && (
                <div className="bg-brand-surface p-3 rounded-xl border border-brand-border/60">
                  <span className="text-brand-text-secondary block mb-1">Ukuran (Size)</span>
                  <span className="font-bold text-brand-blue-600 text-sm">{item.size}</span>
                </div>
              )}

              {item.brand && (
                <div className="bg-brand-surface p-3 rounded-xl border border-brand-border/60">
                  <span className="text-brand-text-secondary block mb-1">Merek / Brand</span>
                  <span className="font-bold text-brand-text-primary text-sm">{item.brand}</span>
                </div>
              )}

              <div className="bg-brand-surface p-3 rounded-xl border border-brand-border/60">
                <span className="text-brand-text-secondary block mb-1">Opsi Pengambilan</span>
                <span className="font-bold text-brand-text-primary text-sm">
                  {isPickupOnly ? 'Hanya Pickup' : 'Pickup & Antar'}
                </span>
              </div>

              <div className="bg-brand-surface p-3 rounded-xl border border-brand-border/60">
                <span className="text-brand-text-secondary block mb-1">Jumlah Unit</span>
                <span className="font-bold text-brand-text-primary text-sm">1 Unit (Preloved)</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-xl border border-brand-border/60">
                <span className="text-brand-text-secondary block mb-1">Waktu Unggah</span>
                <span className="font-bold text-brand-text-primary text-sm">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Full Description */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-3">
            <h2 className="font-display font-bold text-base text-brand-text-primary">
              Deskripsi Lengkap
            </h2>
            <div className="text-sm text-brand-text-primary leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </div>

          {/* 4. Pickup Location */}
          {item.pickupLocation && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-blue-600 shrink-0 shadow-2xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-brand-text-primary">
                  Titik Temu Rekomendasi Penjual
                </h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  {item.pickupLocation}
                </p>
                <p className="text-[11px] text-brand-blue-700 font-medium">
                  Disarankan bertemu di area publik kampus (Gerlam, Bale Santika, atau Perpustakaan CISRAL).
                </p>
              </div>
            </div>
          )}

          {/* 5. Safe Trading Notice & Report Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Semua akun penjual terverifikasi mahasiswa Unpad.</span>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Laporkan Barang</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Sticky Seller & Checkout Card (5 Cols) ================= */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <Card className="bg-white border border-brand-border rounded-3xl p-6 shadow-card space-y-6">
            {/* Header: Title & Price */}
            <div className="space-y-2 pb-4 border-b border-brand-border/60">
              <h1 className="font-display font-black text-2xl text-brand-text-primary leading-snug">
                {item.title}
              </h1>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-display font-black text-3xl text-brand-orange">
                  {formatRupiah(item.priceRupiah)}
                </span>
                <span className="text-xs font-semibold text-brand-text-secondary">
                  (Harga pas, tanpa biaya admin pembeli)
                </span>
              </div>
            </div>

            {/* Seller Profile Card */}
            <div className="bg-brand-surface rounded-2xl p-4 border border-brand-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-brand-blue-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                    {item.seller.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-brand-text-primary">
                        {item.seller.name}
                      </span>
                      {item.seller.isVerified && (
                        <span title="Mahasiswa Terverifikasi">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-brand-text-secondary block">
                      {item.seller.campus?.name || 'Universitas Padjadjaran'}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Terverifikasi
                </span>
              </div>

              {/* Rating & Reviews summary */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-border/40 text-brand-text-secondary">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-brand-text-primary">
                    {item.seller.averageRating ? item.seller.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span>({item.seller.reviewCount || 1} ulasan selesai)</span>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-brand-blue-500" />
                  <span>Respon Cepat</span>
                </div>
              </div>
            </div>

            {/* Delivery Method Options */}
            <div className="space-y-2.5">
              <label className="font-display font-bold text-xs text-brand-text-primary uppercase tracking-wider block">
                Metode Pengambilan
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Pickup Option */}
                <button
                  type="button"
                  onClick={() => handleDeliveryChange('PICKUP')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-brand-blue-600 bg-brand-blue-50/50 ring-2 ring-brand-blue-100'
                      : 'border-brand-border hover:border-brand-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Package className="w-4 h-4 text-brand-blue-600" />
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Gratis
                    </span>
                  </div>
                  <div>
                    <span className="font-display font-bold text-xs text-brand-text-primary block">
                      Pickup Kampus
                    </span>
                    <span className="text-[10px] text-brand-text-secondary">
                      Temu di Gerlam / Rektorat
                    </span>
                  </div>
                </button>

                {/* Delivery Option */}
                <button
                  type="button"
                  disabled={isPickupOnly}
                  onClick={() => handleDeliveryChange('DELIVERY')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isPickupOnly
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                      : deliveryMethod === 'DELIVERY'
                      ? 'border-brand-blue-600 bg-brand-blue-50/50 ring-2 ring-brand-blue-100 cursor-pointer'
                      : 'border-brand-border hover:border-brand-blue-300 bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Truck className="w-4 h-4 text-brand-blue-600" />
                    <span className="text-[10px] font-bold text-brand-orange-dark bg-brand-orange-light px-1.5 py-0.2 rounded">
                      {isFirstOrder ? 'Free Order #1' : formatRupiah(standardDeliveryFee)}
                    </span>
                  </div>
                  <div>
                    <span className="font-display font-bold text-xs text-brand-text-primary block">
                      Antar Tim Ocho
                    </span>
                    <span className="text-[10px] text-brand-text-secondary">
                      {isPickupOnly ? 'Barang besar: hanya pickup' : 'Langsung ke depan kos'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="space-y-2.5">
              <label className="font-display font-bold text-xs text-brand-text-primary uppercase tracking-wider block">
                Metode Pembayaran
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* QRIS Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'QRIS'
                      ? 'border-brand-blue-600 bg-brand-blue-50/50 ring-2 ring-brand-blue-100'
                      : 'border-brand-border hover:border-brand-blue-300 bg-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-brand-blue-600 shrink-0" />
                  <div>
                    <span className="font-display font-bold text-xs text-brand-text-primary block">
                      QRIS Instan
                    </span>
                    <span className="text-[10px] text-brand-text-secondary">
                      BCA, Gopay, Dana, dll
                    </span>
                  </div>
                </button>

                {/* COD Option */}
                <button
                  type="button"
                  disabled={deliveryMethod === 'PICKUP'}
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                      : paymentMethod === 'COD'
                      ? 'border-brand-blue-600 bg-brand-blue-50/50 ring-2 ring-brand-blue-100 cursor-pointer'
                      : 'border-brand-border hover:border-brand-blue-300 bg-white cursor-pointer'
                  }`}
                  title={deliveryMethod === 'PICKUP' ? 'COD hanya tersedia jika diantar tim Ocho' : ''}
                >
                  <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-display font-bold text-xs text-brand-text-primary block">
                      COD (Tunai)
                    </span>
                    <span className="text-[10px] text-brand-text-secondary">
                      Bayar saat kurir tiba
                    </span>
                  </div>
                </button>
              </div>

              {deliveryMethod === 'PICKUP' && (
                <p className="text-[11px] text-brand-text-secondary italic">
                  * Catatan: COD hanya tersedia untuk pengantaran oleh tim Ocho.
                </p>
              )}
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-brand-surface rounded-2xl p-4 border border-brand-border/60 space-y-2.5">
              <h3 className="font-display font-bold text-xs text-brand-text-primary uppercase tracking-wider">
                Rincian Pembayaran
              </h3>

              <div className="flex justify-between text-xs text-brand-text-secondary">
                <span>Harga Barang</span>
                <span className="font-medium text-brand-text-primary">{formatRupiah(item.priceRupiah)}</span>
              </div>

              <div className="flex justify-between text-xs text-brand-text-secondary">
                <span>Ongkos Kirim ({deliveryMethod === 'PICKUP' ? 'Pickup' : 'Antar'})</span>
                <span className="font-medium text-brand-text-primary">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">Gratis</span>
                  ) : (
                    formatRupiah(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-brand-border/60 flex justify-between items-baseline">
                <div>
                  <span className="font-display font-bold text-sm text-brand-text-primary block">
                    Total Pembayaran
                  </span>
                  <span className="text-[10px] text-brand-text-secondary">
                    Sudah termasuk jaminan barang preloved
                  </span>
                </div>
                <span className="font-display font-black text-xl text-brand-orange">
                  {formatRupiah(buyerTotal)}
                </span>
              </div>
            </div>

            {/* Transparent Commission Notice (20% borne by seller) */}
            <div className="bg-brand-blue-50/70 border border-brand-blue-100 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-brand-blue-900 leading-snug">
                <span className="font-bold">Transparansi Ocho:</span> Komisi platform 20% ({formatRupiah(commissionRupiah)}) sepenuhnya ditanggung penjual dari hasil penjualan. Penjual menerima {formatRupiah(sellerPayoutRupiah)}. Pembeli tidak dibebani biaya admin tambahan!
              </div>
            </div>

            {/* Sticky CTA Button */}
            <div>
              {isAvailable ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-base py-3.5 rounded-2xl shadow-md"
                  onClick={() => {
                    if (onCheckoutClick) {
                      onCheckoutClick(item, deliveryMethod, paymentMethod);
                    } else {
                      alert(`Melanjutkan checkout untuk ${item.title} dengan metode ${deliveryMethod} dan pembayaran ${paymentMethod}.`);
                    }
                  }}
                >
                  Beli Sekarang &bull; {formatRupiah(buyerTotal)}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  disabled
                  className="w-full justify-center text-base py-3.5 rounded-2xl opacity-60 cursor-not-allowed"
                >
                  {item.status === 'SOLD' ? 'Barang Sudah Terjual' : 'Barang Sedang Dipesan'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Laporkan Barang Ini"
      >
        {reportSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-display font-bold text-base text-brand-text-primary">
              Laporan Berhasil Dikirim
            </h4>
            <p className="text-xs text-brand-text-secondary">
              Tim moderasi Ocho akan meninjau barang ini dalam waktu 1x24 jam untuk menjaga kenyamanan komunitas Unpad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Bantu tim Ocho menjaga ekosistem preloved kampus tetap aman, bersih dari barang terlarang (vape, rokok, alkohol, obat keras), atau konten yang melanggar aturan.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text-primary block">
                Alasan Pelaporan
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs font-medium bg-brand-surface border border-brand-border rounded-xl p-2.5 text-brand-text-primary focus:outline-none focus:border-brand-blue-500"
              >
                <option value="PROHIBITED_ITEM">Barang Terlarang (Vape, Rokok, Obat, Alkohol)</option>
                <option value="SUSPECTED_FRAUD">Dugaan Penipuan / Harga Tidak Wajar</option>
                <option value="INAPPROPRIATE_CONTENT">Foto / Deskripsi Tidak Pantas</option>
                <option value="NOT_STUDENT">Bukan Mahasiswa / Akun Mencurigakan</option>
                <option value="OTHER">Alasan Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text-primary block">
                Keterangan Tambahan
              </label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Jelaskan secara singkat apa yang mencurigakan..."
                rows={3}
                required
                className="w-full text-xs bg-brand-surface border border-brand-border rounded-xl p-2.5 text-brand-text-primary focus:outline-none focus:border-brand-blue-500 placeholder:text-brand-text-secondary/60"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Kirim Laporan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
