import React, { useState, useEffect } from 'react';
import {
  OrderItem,
  fetchOrders,
  confirmOrderReceived,
  simulateOrderPayment,
  updateOrderStatus,
  submitReview,
} from '../services/api';
import { formatRupiah, formatDateTime } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Icon } from '../components/ui/Icon';

interface OrdersPageProps {
  onBackToHome: () => void;
  onViewItem: (itemId: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onBackToHome, onViewItem }) => {
  const [roleTab, setRoleTab] = useState<'buyer' | 'seller'>('buyer');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QRIS Payment Modal State
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<OrderItem | null>(null);
  const [simulatingPay, setSimulatingPay] = useState(false);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(roleTab);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [roleTab]);

  const handleSimulatePayment = async (orderId: string) => {
    setSimulatingPay(true);
    try {
      await simulateOrderPayment(orderId);
      setSelectedPaymentOrder(null);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan pembayaran');
    } finally {
      setSimulatingPay(false);
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    if (!confirm('Pastikan barang sudah Anda terima dan periksa kondisinya. Lanjutkan?')) return;
    try {
      await confirmOrderReceived(orderId);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal mengonfirmasi');
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        orderId: reviewOrder.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewOrder(null);
      setReviewComment('');
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Badge variant="warning" size="sm">Menunggu Bayar</Badge>;
      case 'PAID':
        return <Badge variant="info" size="sm">Sudah Dibayar</Badge>;
      case 'PROCESSING':
        return <Badge variant="default" size="sm">Sedang Diproses</Badge>;
      case 'READY_FOR_PICKUP':
        return <Badge variant="info" size="sm">Siap Diambil</Badge>;
      case 'ON_DELIVERY':
        return <Badge variant="info" size="sm">Sedang Diantar</Badge>;
      case 'COMPLETED':
        return <Badge variant="verified" size="sm">Selesai</Badge>;
      case 'CANCELLED':
        return <Badge variant="default" size="sm">Dibatalkan</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-brand-blue-600 hover:underline mb-1 inline-block"
          >
            &larr; Kembali ke Beranda
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-text-primary">
            Riwayat Pesanan Ocho
          </h1>
          <p className="text-xs text-brand-text-secondary mt-1">
            Pantau status transaksi jual-beli preloved kamu di kampus Unpad Jatinangor.
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex bg-brand-surface p-1 rounded-2xl border border-brand-border">
          <button
            onClick={() => setRoleTab('buyer')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              roleTab === 'buyer'
                ? 'bg-white shadow-xs text-brand-blue-600'
                : 'text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            Belanjaan Saya (Pembeli)
          </button>
          <button
            onClick={() => setRoleTab('seller')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              roleTab === 'seller'
                ? 'bg-white shadow-xs text-brand-blue-600'
                : 'text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            Penjualan Saya (Penjual)
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-brand-border animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-16 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-2">
          <Icon name="WarningCircle" size={24} className="mx-auto text-red-500" />
          <p className="text-sm font-bold">{error}</p>
          <Button variant="outline" size="sm" onClick={loadOrders}>
            Coba Lagi
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center space-y-3 shadow-card">
          <div className="w-16 h-16 rounded-full bg-brand-surface text-brand-text-secondary flex items-center justify-center mx-auto border border-brand-border">
            <Icon name="Package" size={24} />
          </div>
          <h3 className="font-display font-bold text-base text-brand-text-primary">
            Belum Ada Pesanan {roleTab === 'buyer' ? 'Pembelian' : 'Penjualan'}
          </h3>
          <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
            {roleTab === 'buyer'
              ? 'Temukan barang preloved kos, buku, atau fashion favoritmu di marketplace Ocho.'
              : 'Barang yang kamu iklankan belum ada yang memesan. Pastikan hargamu bersaing!'}
          </p>
          {roleTab === 'buyer' && (
            <Button variant="primary" size="sm" onClick={onBackToHome}>
              Mulai Cari Barang
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-brand-border p-5 shadow-card hover:border-gray-300 transition-all space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/60 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-text-primary">
                    {order.orderNumber}
                  </span>
                  <span className="text-brand-text-secondary">&bull;</span>
                  <span className="text-brand-text-secondary">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-text-secondary">
                    Metode: <strong className="text-brand-text-primary">{order.paymentMethod}</strong> ({order.deliveryMethod})
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Item Info */}
              <div className="flex items-start gap-4">
                <img
                  src={order.item.photos[0]?.url}
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-brand-border shrink-0 cursor-pointer"
                  onClick={() => onViewItem(order.itemId)}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4
                    className="font-display font-bold text-sm sm:text-base text-brand-text-primary hover:text-brand-blue-600 cursor-pointer truncate"
                    onClick={() => onViewItem(order.itemId)}
                  >
                    {order.item.title}
                  </h4>
                  <p className="text-xs text-brand-text-secondary">
                    {roleTab === 'buyer' ? (
                      <>Penjual: <strong>{order.seller.name}</strong></>
                    ) : (
                      <>Pembeli: <strong>{order.buyer.name}</strong> ({order.buyerPhone})</>
                    )}
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-xs text-brand-text-secondary flex items-center gap-1">
                      <Icon name="Truck" size={16} className="text-brand-blue-600 shrink-0" />
                      <span className="truncate">Antar ke: {order.deliveryAddress}</span>
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] text-brand-text-secondary">Total Transaksi</p>
                  <p className="font-display font-black text-brand-orange text-sm sm:text-base tabular-nums">
                    {formatRupiah(roleTab === 'buyer' ? order.buyerTotalRupiah : order.sellerPayoutRupiah)}
                  </p>
                  {roleTab === 'seller' && (
                    <p className="text-[10px] text-emerald-700">
                      Setelah potong komisi 20%
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons based on status & role */}
              <div className="pt-2 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-brand-text-secondary">
                  {order.status === 'PENDING_PAYMENT' && order.reservedUntil && (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Icon name="Clock" size={16} className="text-amber-600" />
                      <span>Selesaikan bayar sebelum {new Date(order.reservedUntil).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  )}
                  {order.status === 'COMPLETED' && order.review && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <Icon name="Star" size={16} weight="fill" className="text-amber-400" />
                      <span>Ulasan {order.review.rating}/5: &ldquo;{order.review.comment}&rdquo;</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Buyer: Pay QRIS */}
                  {roleTab === 'buyer' && order.status === 'PENDING_PAYMENT' && order.paymentMethod === 'QRIS' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedPaymentOrder(order)}
                    >
                      <Icon name="QrCode" size={16} className="mr-1" />
                      Bayar QRIS
                    </Button>
                  )}

                  {/* Buyer: Confirm Received */}
                  {roleTab === 'buyer' && ['ON_DELIVERY', 'READY_FOR_PICKUP', 'PROCESSING', 'PAID'].includes(order.status) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConfirmReceived(order.id)}
                    >
                      <Icon name="CheckCircle" size={16} weight="fill" className="mr-1" />
                      Barang Sudah Diterima
                    </Button>
                  )}

                  {/* Buyer: Write Review */}
                  {roleTab === 'buyer' && order.status === 'COMPLETED' && !order.review && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReviewOrder(order);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                    >
                      <Icon name="Star" size={16} className="mr-1" />
                      Beri Ulasan Penjual
                    </Button>
                  )}

                  {/* Seller: Update Status Progression */}
                  {roleTab === 'seller' && (
                    <>
                      {order.status === 'PAID' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                        >
                          Mulai Kemas Barang
                        </Button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(
                              order.id,
                              order.deliveryMethod === 'PICKUP' ? 'READY_FOR_PICKUP' : 'ON_DELIVERY'
                            )
                          }
                        >
                          {order.deliveryMethod === 'PICKUP' ? 'Tandai Siap Diambil' : 'Kirim dengan Kurir'}
                        </Button>
                      )}
                    </>
                  )}

                  {/* Cancel Order */}
                  {['PENDING_PAYMENT', 'PROCESSING'].includes(order.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                    >
                      Batalkan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QRIS Payment Modal */}
      {selectedPaymentOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPaymentOrder(null)}
          title="Pembayaran QRIS Ocho"
          description={`Scan QRIS untuk pesanan #${selectedPaymentOrder.orderNumber}`}
        >
          <div className="py-4 text-center space-y-4">
            <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border inline-block mx-auto text-center space-y-2">
              <Icon name="QrCode" size={192} className="mx-auto text-brand-text-primary" />
              <p className="text-xs font-mono font-bold text-brand-blue-700">
                NMID: ID1020261023OCHO
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-brand-text-secondary">Total Tagihan:</p>
              <p className="font-display font-black text-2xl text-brand-orange tabular-nums">
                {formatRupiah(selectedPaymentOrder.buyerTotalRupiah)}
              </p>
              <p className="text-[11px] text-brand-text-secondary">
                Bisa di-scan menggunakan GoPay, OVO, Dana, ShopeePay, atau BCA Mobile.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl flex items-start gap-2">
              <Icon name="Clock" size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Mode Sandbox Testing: Klik tombol di bawah untuk menyimulasikan notifikasi sukses dari payment gateway secara instan.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPaymentOrder(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={simulatingPay}
                onClick={() => handleSimulatePayment(selectedPaymentOrder.id)}
              >
                {simulatingPay ? 'Memproses...' : 'Simulasikan Pembayaran Sukses'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <Modal
          isOpen={true}
          onClose={() => setReviewOrder(null)}
          title="Beri Ulasan Penjual"
          description={`Bagikan pengalaman belanjamu dari ${reviewOrder.seller.name}`}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-2 text-center">
                Bintang Kepuasan (1 - 5)
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Icon
                      name="Star"
                      size={24}
                      weight={star <= reviewRating ? 'fill' : 'regular'}
                      className={
                        star <= reviewRating
                          ? 'text-amber-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text-primary mb-1">
                Komentar Ulasan
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Barangnya bersih dan berfungsi normal, penjual ramah dan tepat waktu saat COD..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReviewOrder(null)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={submittingReview}
                onClick={handleSubmitReview}
              >
                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
