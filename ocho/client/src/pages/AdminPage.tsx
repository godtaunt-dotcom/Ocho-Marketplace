import React, { useState, useEffect } from 'react';
import {
  AdminStats,
  OrderItem,
  fetchAdminStats,
  fetchAdminOrders,
  fetchAdminUsers,
  verifyAdminUser,
  fetchAdminReports,
  resolveAdminReport,
  fetchAdminPayouts,
  updateAdminPayout,
  deleteAdminUser,
} from '../services/api';
import { formatRupiah, formatDateTime } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Icon } from '../components/ui/Icon';

interface AdminPageProps {
  onBackToHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'orders' | 'reports' | 'payouts' | 'users'>('kpi');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [adminViewingProofUrl, setAdminViewingProofUrl] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [s, o, r, p, u] = await Promise.all([
        fetchAdminStats(),
        fetchAdminOrders(),
        fetchAdminReports(),
        fetchAdminPayouts(),
        fetchAdminUsers(),
      ]);
      setStats(s);
      setOrders(o);
      setReports(r);
      setPayouts(p);
      setUsers(u);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleResolveReport = async (reportId: string, archiveItem: boolean) => {
    try {
      await resolveAdminReport(reportId, archiveItem, 'Dimoderasi oleh Admin Ocho Unpad');
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Gagal memoderasi laporan');
    }
  };

  const handleUpdatePayout = async (payoutId: string, status: string) => {
    try {
      await updateAdminPayout(payoutId, status, 'Transfer manual via BCA Virtual Account selesai');
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pencairan');
    }
  };

  const handleToggleVerification = async (userId: string, current: boolean) => {
    try {
      await verifyAdminUser(userId, !current);
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah verifikasi');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Peringatan: Apakah Anda yakin ingin menghapus akun mahasiswa "${userName}"? Seluruh listing barang, pesanan, dan ulasan terkait akun ini akan dihapus secara permanen.`)) {
      return;
    }
    try {
      await deleteAdminUser(userId);
      alert(`Akun "${userName}" berhasil dihapus.`);
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus akun pengguna');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-brand-blue-600 dark:text-brand-blue-400 hover:underline mb-1 inline-block"
          >
            &larr; Kembali ke Marketplace
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-text-primary dark:text-slate-100">
              Dashboard Admin Ocho
            </h1>
            <Badge variant="verified">Portal Unpad Jatinangor</Badge>
          </div>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">
            Pusat kendali moderasi barang, audit keuangan komisi, dan persetujuan pencairan dana penjual.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap bg-brand-surface dark:bg-slate-800 p-1 rounded-2xl border border-brand-border dark:border-slate-700 gap-1">
          {[
            { id: 'kpi', label: 'Ringkasan KPI' },
            { id: 'orders', label: `Pesanan (${orders.length})` },
            { id: 'reports', label: `Laporan (${reports.filter((r) => r.status === 'PENDING').length})` },
            { id: 'payouts', label: `Pencairan Saldo (${payouts.filter((p) => p.status === 'PENDING').length})` },
            { id: 'users', label: `Mahasiswa (${users.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-brand-blue-600 dark:text-brand-blue-400'
                  : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-brand-text-secondary animate-pulse">
          Memuat data dashboard admin...
        </div>
      ) : (
        <>
          {/* TAB 1: KPI STATS OVERVIEW */}
          {activeTab === 'kpi' && stats && (
            <div className="space-y-6">
              {/* Row 1: Core Financial Performance */}
              <div>
                <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-3">
                  Performa Finansial &amp; Monetisasi Platform
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Total GMV Penjualan</span>
                      <Icon name="CurrencyDollar" size={20} className="text-emerald-600" />
                    </div>
                    <p className="font-display font-black text-2xl text-emerald-800 tabular-nums">
                      {formatRupiah(stats.totalGmvRupiah)}
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      Dari {stats.completedOrdersCount} transaksi sukses
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Komisi Ocho (20% Net)</span>
                      <Icon name="CreditCard" size={20} className="text-brand-blue-600" />
                    </div>
                    <p className="font-display font-black text-2xl text-brand-blue-600 tabular-nums">
                      {formatRupiah(stats.totalCommissionEarnedRupiah)}
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      Pendapatan bersih middleman
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Rata-rata Keranjang (AOV)</span>
                      <Icon name="Money" size={20} className="text-brand-orange" />
                    </div>
                    <p className="font-display font-black text-2xl text-brand-text-primary tabular-nums">
                      {formatRupiah(stats.averageOrderValueRupiah || 0)}
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      Daya beli rata-rata per transaksi
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Liabilitas Pencairan (Payout)</span>
                      <Icon name="Wallet" size={20} className="text-amber-500" />
                    </div>
                    <p className="font-display font-black text-2xl text-amber-600 tabular-nums">
                      {formatRupiah(stats.pendingPayoutAmountRupiah || 0)}
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      {stats.pendingPayoutsCount} antrean perlu ditransfer
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Operational & Trust Metrics */}
              <div>
                <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-3">
                  Efisiensi Operasional, Logistik &amp; Konversi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Tingkat Sukses (Fulfillment)</span>
                      <Icon name="CheckCircle" size={20} className="text-emerald-600" />
                    </div>
                    <p className="font-display font-black text-2xl text-brand-text-primary tabular-nums">
                      {stats.completionRatePercent || 0}%
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      {stats.completedOrdersCount} selesai dari {stats.totalOrders} dibuat
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Distribusi Pengiriman</span>
                      <Icon name="Truck" size={20} className="text-brand-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-xl text-brand-text-primary tabular-nums">
                        {stats.pickupOrdersCount || 0}
                      </span>
                      <span className="text-xs text-brand-text-secondary">Pickup</span>
                      <span className="text-xs text-brand-text-secondary">&bull;</span>
                      <span className="font-display font-black text-xl text-brand-text-primary tabular-nums">
                        {stats.deliveryOrdersCount || 0}
                      </span>
                      <span className="text-xs text-brand-text-secondary">Delivery</span>
                    </div>
                    <p className="text-[11px] text-brand-text-secondary">
                      Beban operasional kurir kampus
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Metode Bayar (QRIS vs COD)</span>
                      <Icon name="QrCode" size={20} className="text-purple-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-xl text-brand-text-primary tabular-nums">
                        {stats.qrisOrdersCount || 0}
                      </span>
                      <span className="text-xs text-brand-text-secondary">QRIS</span>
                      <span className="text-xs text-brand-text-secondary">&bull;</span>
                      <span className="font-display font-black text-xl text-brand-text-primary tabular-nums">
                        {stats.codOrdersCount || 0}
                      </span>
                      <span className="text-xs text-brand-text-secondary">COD</span>
                    </div>
                    <p className="text-[11px] text-brand-text-secondary">
                      Preferensi pembayaran mahasiswa
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-brand-text-secondary">
                      <span className="text-xs font-semibold">Verifikasi Akun Kampus</span>
                      <Icon name="ShieldCheck" size={20} className="text-emerald-600" />
                    </div>
                    <p className="font-display font-black text-2xl text-brand-text-primary tabular-nums">
                      {stats.verificationRatePercent || 0}%
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      {stats.verifiedUsersCount || 0} dari {stats.totalUsers} akun terverifikasi
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Top Categories */}
              {stats.topCategories && stats.topCategories.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">
                      Kategori Paling Diminati (Berdasarkan Jumlah Listing Aktif)
                    </h4>
                    <span className="text-[11px] text-brand-text-secondary font-medium">
                      Total {stats.activeItems} barang aktif
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {stats.topCategories.map((c, idx) => (
                      <div
                        key={c.name}
                        className="bg-brand-surface p-3 rounded-xl border border-brand-border space-y-1"
                      >
                        <span className="text-[10px] font-bold text-brand-blue-600 bg-brand-blue-50 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <p className="font-bold text-xs text-brand-text-primary truncate">{c.name}</p>
                        <p className="text-[11px] text-brand-text-secondary">{c.itemCount} barang</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT & PAYMENT TRACKING */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden space-y-4">
              <div className="p-4 sm:p-5 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-brand-text-primary">
                    Monitoring & Tracking Semua Pesanan
                  </h3>
                  <p className="text-xs text-brand-text-secondary">
                    Pantau status pembayaran QRIS, screenshot bukti transfer, jadwal pengantaran, dan komisi platform.
                  </p>
                </div>

                {/* Filter Status Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-brand-surface p-1 rounded-xl border border-brand-border text-xs">
                  {[
                    { id: 'ALL', label: `Semua (${orders.length})` },
                    { id: 'PENDING_PAYMENT', label: `Belum Bayar (${orders.filter(o => o.status === 'PENDING_PAYMENT').length})` },
                    { id: 'PAID', label: `Sudah Bayar (${orders.filter(o => o.status === 'PAID').length})` },
                    { id: 'PROCESSING', label: `Diproses (${orders.filter(o => ['PROCESSING', 'READY_FOR_PICKUP', 'ON_DELIVERY'].includes(o.status)).length})` },
                    { id: 'COMPLETED', label: `Selesai (${orders.filter(o => o.status === 'COMPLETED').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        orderFilter === tab.id
                          ? 'bg-white shadow-xs text-brand-blue-600'
                          : 'text-brand-text-secondary hover:text-brand-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface border-b border-brand-border text-brand-text-secondary">
                    <tr>
                      <th className="p-3.5">No. Pesanan</th>
                      <th className="p-3.5">Barang</th>
                      <th className="p-3.5">Pembeli</th>
                      <th className="p-3.5">Penjual</th>
                      <th className="p-3.5">Metode &amp; Pengiriman</th>
                      <th className="p-3.5">Bukti Transfer (SS)</th>
                      <th className="p-3.5">Total &amp; Komisi 20%</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {orders
                      .filter((o) => {
                        if (orderFilter === 'ALL') return true;
                        if (orderFilter === 'PROCESSING') return ['PROCESSING', 'READY_FOR_PICKUP', 'ON_DELIVERY'].includes(o.status);
                        return o.status === orderFilter;
                      })
                      .map((o) => {
                        const buyerPhoneClean = (o.buyerPhone || o.buyer?.phone || '').replace(/^0/, '62').replace(/\D/g, '');
                        const sellerPhoneClean = (o.seller?.phone || '').replace(/^0/, '62').replace(/\D/g, '');

                        return (
                          <tr key={o.id} className="hover:bg-brand-surface/50">
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-brand-blue-700 block">
                                {o.orderNumber}
                              </span>
                              <span className="text-[10px] text-brand-text-secondary">
                                {formatDateTime(o.createdAt)}
                              </span>
                            </td>
                            <td className="p-3.5 font-semibold max-w-xs">
                              <span className="truncate block" title={o.item?.title}>
                                {o.item?.title}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-brand-text-primary block">{o.buyer?.name}</span>
                              {buyerPhoneClean && (
                                <a
                                  href={`https://wa.me/${buyerPhoneClean}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  <Icon name="WhatsappLogo" size={13} weight="fill" />
                                  <span>{o.buyerPhone || o.buyer?.phone}</span>
                                </a>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-brand-text-primary block">{o.seller?.name}</span>
                              {sellerPhoneClean && (
                                <a
                                  href={`https://wa.me/${sellerPhoneClean}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  <Icon name="WhatsappLogo" size={13} weight="fill" />
                                  <span>{o.seller?.phone}</span>
                                </a>
                              )}
                            </td>
                            <td className="p-3.5 space-y-0.5">
                              <div className="font-semibold text-brand-text-primary">
                                {o.paymentMethod} &bull; {o.deliveryMethod}
                              </div>
                              {o.deliveryAddress && (
                                <div className="text-[11px] text-brand-text-secondary truncate max-w-xs" title={o.deliveryAddress}>
                                  Alamat: {o.deliveryAddress}
                                </div>
                              )}
                              {o.deliveryDate && (
                                <div className="text-[11px] text-brand-blue-700 font-medium">
                                  Tgl Antar: {new Date(o.deliveryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              {o.paymentProofUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setAdminViewingProofUrl(o.paymentProofUrl!)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-brand-blue-50 text-brand-blue-700 hover:bg-brand-blue-100 border border-brand-blue-200 shadow-2xs transition-colors"
                                >
                                  <Icon name="FileText" size={14} />
                                  <span>Lihat Bukti SS</span>
                                </button>
                              ) : o.paymentMethod === 'QRIS' && o.status === 'PENDING_PAYMENT' ? (
                                <span className="inline-flex items-center text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Belum Unggah
                                </span>
                              ) : (
                                <span className="text-brand-text-secondary text-xs">-</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-brand-text-primary">
                                {formatRupiah(o.buyerTotalRupiah)}
                              </div>
                              <div className="text-[11px] text-emerald-700 font-medium">
                                Komisi: +{formatRupiah(o.commissionRupiah)}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-[11px] bg-brand-surface px-2 py-1 rounded-md border border-brand-border">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT MODERATION REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center text-xs text-brand-text-secondary border border-brand-border">
                  Tidak ada laporan konten masuk. Semua listing aman dan mematuhi etika kampus.
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-5 rounded-2xl border border-brand-border shadow-card flex flex-col sm:flex-row items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">{r.reason}</Badge>
                        <span className="text-xs text-brand-text-secondary">
                          Pelapor: <strong>{r.reporter?.name}</strong> &bull; {formatDateTime(r.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-brand-text-primary">
                        Barang Dilaporkan: {r.item ? r.item.title : '(Barang sudah dihapus)'}
                      </p>
                      <p className="text-xs text-brand-text-secondary bg-brand-surface p-2.5 rounded-xl border border-brand-border">
                        &ldquo;{r.description}&rdquo;
                      </p>
                    </div>

                    {r.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveReport(r.id, false)}
                        >
                          Abaikan (Listing Aman)
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleResolveReport(r.id, true)}
                        >
                          Hapus Barang Terlarang
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Selesai Dimoderasi
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: PAYOUTS APPROVAL */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payouts.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center text-xs text-brand-text-secondary border border-brand-border">
                  Belum ada permintaan pencairan dana dari penjual.
                </div>
              ) : (
                payouts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-5 rounded-2xl border border-brand-border shadow-card flex flex-col sm:flex-row items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="font-display font-black text-lg text-emerald-800">
                        {formatRupiah(p.amountRupiah)}
                      </p>
                      <p className="text-xs text-brand-text-primary">
                        Penjual: <strong>{p.seller?.name}</strong> ({p.seller?.email})
                      </p>
                      <p className="text-xs text-brand-text-secondary font-mono">
                        Transfer ke: {p.bankName} - {p.accountNumber} a/n {p.accountHolderName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {p.status === 'PENDING' ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdatePayout(p.id, 'COMPLETED')}
                          >
                            Tandai Sudah Ditransfer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdatePayout(p.id, 'REJECTED')}
                          >
                            Tolak
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {p.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: STUDENTS DIRECTORY & VERIFICATION BADGES */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface border-b border-brand-border text-brand-text-secondary">
                    <tr>
                      <th className="p-3.5">Nama Mahasiswa</th>
                      <th className="p-3.5">Email Kampus</th>
                      <th className="p-3.5">Kampus</th>
                      <th className="p-3.5">Status Terverifikasi</th>
                      <th className="p-3.5">Peran</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-brand-surface/50">
                        <td className="p-3.5 font-bold">{u.name}</td>
                        <td className="p-3.5 font-mono">{u.email}</td>
                        <td className="p-3.5">{u.campus?.name || 'Unpad'}</td>
                        <td className="p-3.5">
                          {u.isVerified ? (
                            <Badge variant="verified">Terverifikasi</Badge>
                          ) : (
                            <Badge variant="warning">Belum Terverifikasi</Badge>
                          )}
                        </td>
                        <td className="p-3.5 font-bold">{u.role}</td>
                        <td className="p-3.5 text-right flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVerification(u.id, u.isVerified)}
                          >
                            {u.isVerified ? 'Cabut Verifikasi' : 'Beri Lencana'}
                          </Button>
                          {u.role !== 'ADMIN' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                            >
                              Hapus Akun
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Payment Proof Viewer Modal */}
      {adminViewingProofUrl && (
        <Modal
          isOpen={true}
          onClose={() => setAdminViewingProofUrl(null)}
          title="Verifikasi Bukti Transfer QRIS"
          description="Screenshot struk transfer yang dikirim oleh pembeli."
        >
          <div className="py-2 space-y-4 text-center">
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-2 overflow-hidden max-h-[70vh] flex items-center justify-center">
              <img
                src={adminViewingProofUrl}
                alt="Bukti Transfer QRIS"
                className="max-h-[65vh] w-auto mx-auto object-contain rounded-xl shadow-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="primary" size="sm" onClick={() => setAdminViewingProofUrl(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
