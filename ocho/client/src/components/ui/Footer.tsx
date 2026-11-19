import React from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';

export interface FooterProps {
  onShowcaseClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowcaseClick }) => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-brand-border dark:border-slate-800 text-brand-text-secondary dark:text-slate-400 text-xs select-none transition-colors">
      {/* Upper Footer: Links & Info */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <Logo size="md" />
          <p className="text-sm leading-relaxed text-brand-text-secondary dark:text-slate-400 max-w-md">
            Marketplace terkurasi dan aman khusus mahasiswa Universitas Padjadjaran (Unpad)
            di kawasan Jatinangor dan sekitarnya. Transaksi mudah dengan verifikasi identitas mahasiswa.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-brand-blue-dark dark:text-brand-blue-400">
            <Icon name="MapPin" size={16} className="text-brand-blue-500" />
            <span>Jatinangor, Sumedang &bull; Dipati Ukur, Bandung</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-semibold text-brand-text-primary dark:text-slate-100 text-sm mb-3">Modul Layanan</h4>
          <ul className="space-y-2">
            <li>
              <span className="text-brand-text-primary dark:text-slate-200 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Jual-Beli Barang Bekas (Aktif)
              </span>
            </li>
            <li>
              <span className="text-brand-text-secondary/60 dark:text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                Jasa Mahasiswa (Segera hadir)
              </span>
            </li>
            <li>
              <span className="text-brand-text-secondary/60 dark:text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                Sewa Barang &amp; Kost (Segera hadir)
              </span>
            </li>
            <li>
              <span className="text-brand-text-secondary/60 dark:text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                Jastip Jatinangor (Segera hadir)
              </span>
            </li>
            {onShowcaseClick && (
              <li className="pt-2">
                <button
                  type="button"
                  onClick={onShowcaseClick}
                  className="text-brand-purple dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Icon name="Stack" size={16} />
                  <span>Lihat Desain Sistem &amp; Showcase</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Safety & Contact */}
        <div>
          <h4 className="font-semibold text-brand-text-primary dark:text-slate-100 text-sm mb-3">Keamanan &amp; Bantuan</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-1.5 text-brand-success-text dark:text-emerald-400 font-medium">
              <Icon name="ShieldCheck" size={16} className="text-brand-success" />
              <span>Verifikasi KTM &amp; Email Unpad</span>
            </li>
            <li>
              <a href="#tips-cod" className="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors">
                Panduan Titik COD Aman Kampus
              </a>
            </li>
            <li>
              <a href="#syarat" className="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors">
                Syarat &amp; Ketentuan Layanan
              </a>
            </li>
            <li>
              <a href="mailto:support@ocho.id" className="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors flex items-center gap-1">
                <Icon name="EnvelopeSimple" size={16} />
                <span>support@ocho.id</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Mandatory Disclaimer & Copyright */}
      <div className="border-t border-brand-border/60 dark:border-slate-800 bg-brand-surface dark:bg-slate-900 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs text-brand-text-secondary dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Ocho Indonesia. Dibuat dengan{' '}
            <Icon name="Heart" size={16} weight="fill" className="inline text-red-500 mx-0.5" /> untuk mahasiswa Unpad.
          </p>
          <p className="text-[11px] text-brand-text-secondary/80 dark:text-slate-400 max-w-xl">
            <strong className="text-brand-text-primary dark:text-slate-200">Disclaimer:</strong> Ocho adalah platform inisiatif
            mahasiswa dan <span className="underline decoration-amber-400 font-medium">bukan bagian resmi</span> dari Universitas Padjadjaran.
            Semua merek dagang dan hak cipta milik entitas masing-masing.
          </p>
        </div>
      </div>
    </footer>
  );
};
