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
} from '../services/api';
import { formatRupiah, formatDateTime } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-brand-blue-600 hover:underline mb-1 inline-block"
          >
            &larr; Kembali ke Marketplace
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-text-primary">
              Dashboard Admin Ocho
            </h1>
            <Badge variant="verified">Portal Unpad Jatinangor</Badge>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Pusat kendali moderasi barang, audit keuangan komisi, dan persetujuan pencairan dana penjual.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap bg-brand-surface p-1 rounded-2xl border border-brand-border gap-1">
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
                  ? 'bg-white shadow-xs text-brand-blue-600'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
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
                    Dari {stats.completedOrdersCount} pesanan selesai
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-brand-text-secondary">
                    <span className="text-xs font-semibold">Komisi Platform Ocho (20%)</span>
                    <Icon name="CreditCard" size={20} className="text-brand-blue-600" />
                  </div>
                  <p className="font-display font-black text-2xl text-brand-blue-600 tabular-nums">
                    {formatRupiah(stats.totalCommissionEarnedRupiah)}
                  </p>
                  <p className="text-[11px] text-brand-text-secondary">
                    Pendapatan operasional platform
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-brand-text-secondary">
                    <span className="text-xs font-semibold">Mahasiswa Terdaftar</span>
                    <Icon name="Users" size={20} className="text-purple-600" />
                  </div>
                  <p className="font-display font-black text-2xl text-purple-900 tabular-nums">
                    {stats.totalUsers}
                  </p>
                  <p className="text-[11px] text-brand-text-secondary">
                    {stats.activeItems} barang aktif tayang
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-brand-text-secondary">
                    <span className="text-xs font-semibold">Perlu Tindakan Admin</span>
                    <Icon name="Warning" size={20} className="text-amber-500" />
                  </div>
                  <p className="font-display font-black text-2xl text-amber-600 tabular-nums">
                    {stats.pendingReportsCount + stats.pendingPayoutsCount}
                  </p>
                  <p className="text-[11px] text-brand-text-secondary">
                    {stats.pendingReportsCount} laporan, {stats.pendingPayoutsCount} pencairan
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-brand-border flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-brand-text-primary">
                  Semua Pesanan Jual-Beli
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface border-b border-brand-border text-brand-text-secondary">
                    <tr>
                      <th className="p-3.5">No. Pesanan</th>
                      <th className="p-3.5">Barang</th>
                      <th className="p-3.5">Pembeli</th>
                      <th className="p-3.5">Penjual</th>
                      <th className="p-3.5">Total Bayar</th>
                      <th className="p-3.5">Komisi</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-brand-surface/50">
                        <td className="p-3.5 font-mono font-bold text-brand-blue-700">{o.orderNumber}</td>
                        <td className="p-3.5 font-semibold max-w-xs truncate">{o.item?.title}</td>
                        <td className="p-3.5">{o.buyer?.name}</td>
                        <td className="p-3.5">{o.seller?.name}</td>
                        <td className="p-3.5 font-bold">{formatRupiah(o.buyerTotalRupiah)}</td>
                        <td className="p-3.5 font-bold text-red-600">{formatRupiah(o.commissionRupiah)}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-[11px]">{o.status}</span>
                        </td>
                      </tr>
                    ))}
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
                        <td className="p-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVerification(u.id, u.isVerified)}
                          >
                            {u.isVerified ? 'Cabut Verifikasi' : 'Beri Lencana'}
                          </Button>
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
    </div>
  );
};
