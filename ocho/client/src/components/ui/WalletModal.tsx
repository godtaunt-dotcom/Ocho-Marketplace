import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { RupiahInput } from './Input';
import { Icon } from './Icon';
import { BalanceData, fetchSellerBalance, requestPayout } from '../../services/api';
import { formatRupiah, formatDateTime } from '../../utils/format';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [amount, setAmount] = useState<number>(50000);
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBalance = async () => {
    setLoading(true);
    try {
      const b = await fetchSellerBalance();
      setData(b);
      if (b.availableToWithdrawRupiah > 0) {
        setAmount(b.availableToWithdrawRupiah);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBalance();
      setShowWithdrawForm(false);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await requestPayout({
        amountRupiah: amount,
        bankName,
        accountNumber,
        accountHolderName,
      });
      setSuccess('Permintaan penarikan berhasil diajukan! Admin Ocho akan mentransfer dana dalam 1x24 jam.');
      setShowWithdrawForm(false);
      await loadBalance();
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan penarikan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dompet & Saldo Penjual"
      description="Hasil bersih penjualan preloved kamu setelah dipotong komisi 20% platform."
    >
      <div className="space-y-4 py-2">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start gap-2">
            <Icon name="CheckCircle" size={16} weight="fill" className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
            <Icon name="WarningCircle" size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-blue-700 to-brand-purple text-white p-5 rounded-2xl shadow-card space-y-2">
          <div className="flex items-center justify-between text-brand-blue-100 text-xs">
            <span>Saldo Aktif Siap Ditarik</span>
            <Icon name="Wallet" size={16} />
          </div>
          <p className="font-display font-black text-3xl tabular-nums">
            {formatRupiah(data?.currentBalanceRupiah || 0)}
          </p>
          <div className="pt-2 flex justify-between items-center text-[11px] text-brand-blue-200 border-t border-white/20">
            <div>
              <span>Penarikan Tertunda: {formatRupiah(data?.pendingWithdrawalRupiah || 0)}</span>
              {(data?.currentBalanceRupiah || 0) < 10000 && (
                <span className="block text-[10px] text-brand-blue-100/80 mt-0.5">Min. penarikan Rp 10.000</span>
              )}
            </div>
            <button
              type="button"
              disabled={(data?.currentBalanceRupiah || 0) < 10000}
              onClick={() => setShowWithdrawForm(!showWithdrawForm)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm select-none ${
                (data?.currentBalanceRupiah || 0) < 10000
                  ? 'bg-white/25 border border-white/40 cursor-not-allowed shadow-inner'
                  : 'bg-white hover:bg-brand-blue-50 active:scale-95 cursor-pointer shadow-md'
              }`}
              title={(data?.currentBalanceRupiah || 0) < 10000 ? 'Saldo minimal penarikan adalah Rp 10.000' : 'Tarik saldo ke rekening atau e-wallet'}
            >
              <span className={(data?.currentBalanceRupiah || 0) < 10000 ? 'text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]' : 'text-brand-blue-900 font-bold'}>
                {showWithdrawForm ? 'Batal' : 'Tarik Saldo'}
              </span>
            </button>
          </div>
        </div>

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <form onSubmit={handleWithdraw} className="bg-brand-surface dark:bg-slate-800/60 p-4 rounded-2xl border border-brand-border dark:border-slate-700/60 space-y-3">
            <h4 className="font-display font-bold text-xs text-brand-text-primary dark:text-slate-100">
              Formulir Penarikan Dana
            </h4>

            <RupiahInput
              label="Nominal Penarikan"
              value={amount}
              onChange={setAmount}
              helperText={`Maksimal penarikan: ${formatRupiah(data?.currentBalanceRupiah || 0)}`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-brand-text-primary dark:text-slate-200 mb-1">
                  Bank / E-Wallet
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-brand-text-primary dark:text-slate-100 border border-brand-border dark:border-slate-700 rounded-xl focus:border-brand-blue-500 focus:outline-none"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">BSI</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="Dana">Dana</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-text-primary dark:text-slate-200 mb-1">
                  Nomor Rekening / No. HP
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-brand-text-primary dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-brand-border dark:border-slate-700 rounded-xl focus:border-brand-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-text-primary dark:text-slate-200 mb-1">
                Nama Lengkap Pemilik Rekening
              </label>
              <input
                type="text"
                required
                placeholder="Sesuai buku tabungan / KTP"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-brand-text-primary dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-brand-border dark:border-slate-700 rounded-xl focus:border-brand-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-1 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowWithdrawForm(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Mengajukan...' : 'Konfirmasi Tarik Dana'}
              </Button>
            </div>
          </form>
        )}

        {/* Ledger History */}
        <div className="space-y-2">
          <h4 className="font-display font-bold text-xs text-brand-text-primary dark:text-slate-200">
            Riwayat Mutasi Saldo
          </h4>
          {loading ? (
            <p className="text-xs text-brand-text-secondary dark:text-slate-400 text-center py-4">Memuat mutasi...</p>
          ) : data?.history.length === 0 ? (
            <p className="text-xs text-brand-text-secondary dark:text-slate-400 text-center py-4">
              Belum ada mutasi saldo. Selesaikan penjualan pertamamu untuk mulai menghasilkan!
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {data?.history.map((entry) => {
                const isCredit = entry.type === 'CREDIT_SALE';
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCredit ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isCredit ? <Icon name="ArrowDownRight" size={16} /> : <Icon name="ArrowUpRight" size={16} />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-brand-text-primary dark:text-slate-100 line-clamp-1">{entry.description}</p>
                        <p className="text-[10px] text-brand-text-secondary dark:text-slate-400">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold tabular-nums ${isCredit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isCredit ? '+' : '-'}{formatRupiah(entry.amountRupiah)}
                      </p>
                      <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 tabular-nums">
                        Sisa: {formatRupiah(entry.balanceAfterRupiah)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
