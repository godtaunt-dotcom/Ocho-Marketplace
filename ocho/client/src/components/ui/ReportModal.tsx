import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import { submitReport } from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
}) => {
  const [reason, setReason] = useState<'PROHIBITED_ITEM' | 'MISLEADING' | 'SUSPECTED_FRAUD' | 'OTHER'>('PROHIBITED_ITEM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submitReport({
        itemId,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Laporkan Barang Ini"
      description={`Bantu jaga ekosistem jual-beli mahasiswa Unpad tetap aman dan tepercaya.`}
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <Icon name="CheckCircle" size={24} weight="fill" />
          </div>
          <h4 className="font-display font-bold text-sm text-brand-text-primary dark:text-slate-100">
            Laporan Berhasil Terkirim
          </h4>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400 max-w-xs mx-auto">
            Tim admin Ocho akan meninjau laporan ini dalam 1x24 jam kerja.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl flex items-start gap-2">
              <Icon name="WarningCircle" size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-brand-surface dark:bg-slate-800/60 p-3 rounded-xl border border-brand-border dark:border-slate-700 text-xs text-brand-text-primary dark:text-slate-100 font-medium">
            Barang: <span className="font-bold">{itemTitle}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text-primary dark:text-slate-200 mb-1">
              Alasan Pelaporan
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-brand-surface dark:bg-slate-800 text-brand-text-primary dark:text-slate-100 border border-brand-border dark:border-slate-700 rounded-xl focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
            >
              <option value="PROHIBITED_ITEM">Barang Terlarang (Vape, Rokok, Miras, Obat, Senjata)</option>
              <option value="MISLEADING">Informasi Palsu / Foto Menyesatkan</option>
              <option value="SUSPECTED_FRAUD">Indikasi Penipuan / Bukan Mahasiswa</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text-primary dark:text-slate-200 mb-1">
              Penjelasan Detail <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan alasan kecurigaan atau pelanggaran..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-brand-surface dark:bg-slate-800 text-brand-text-primary dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-brand-border dark:border-slate-700 rounded-xl focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={loading}
              isLoading={loading}
            >
              Kirim Laporan
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
