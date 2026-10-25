import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Heart, MapPin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-border text-brand-text-secondary text-xs select-none">
      {/* Upper Footer: Links & Info */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <Logo size="md" />
          <p className="text-sm leading-relaxed text-brand-text-secondary max-w-md">
            Marketplace terkurasi dan aman khusus mahasiswa Universitas Padjadjaran (Unpad)
            di kawasan Jatinangor dan sekitarnya. Transaksi mudah dengan verifikasi identitas mahasiswa.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-brand-blue-dark">
            <MapPin className="w-4 h-4 text-brand-blue-500" />
            <span>Jatinangor, Sumedang &bull; Dipati Ukur, Bandung</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-semibold text-brand-text-primary text-sm mb-3">Modul Layanan</h4>
          <ul className="space-y-2">
            <li>
              <span className="text-brand-text-primary font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Jual-Beli Barang Bekas (Aktif)
              </span>
            </li>
            <li>
              <span className="text-brand-text-secondary/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                Jasa Mahasiswa (Segera hadir)
              </span>
            </li>
            <li>
              <span className="text-brand-text-secondary/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                Sewa Barang &amp; Kost (Segera hadir)
              </span>
            </li>
            <li>
              <span className="text-brand-text-secondary/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                Jastip Jatinangor (Segera hadir)
              </span>
            </li>
          </ul>
        </div>

        {/* Safety & Contact */}
        <div>
          <h4 className="font-semibold text-brand-text-primary text-sm mb-3">Keamanan &amp; Bantuan</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-1.5 text-brand-success-text font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-success" />
              <span>Verifikasi KTM &amp; Email Unpad</span>
            </li>
            <li>
              <a href="#tips-cod" className="hover:text-brand-blue-600 transition-colors">
                Panduan Titik COD Aman Kampus
              </a>
            </li>
            <li>
              <a href="#syarat" className="hover:text-brand-blue-600 transition-colors">
                Syarat &amp; Ketentuan Layanan
              </a>
            </li>
            <li>
              <a href="mailto:support@ocho.id" className="hover:text-brand-blue-600 transition-colors flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>support@ocho.id</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Mandatory Disclaimer & Copyright */}
      <div className="border-t border-brand-border/60 bg-brand-surface py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs text-brand-text-secondary">
          <p>
            &copy; {new Date().getFullYear()} Ocho Indonesia. Dibuat dengan{' '}
            <Heart className="w-3 h-3 inline text-red-500 fill-red-500 mx-0.5" /> untuk mahasiswa Unpad.
          </p>
          <p className="text-[11px] text-brand-text-secondary/80 max-w-xl">
            <strong className="text-brand-text-primary">Disclaimer:</strong> Ocho adalah platform inisiatif
            mahasiswa dan <span className="underline decoration-amber-400 font-medium">bukan bagian resmi</span> dari Universitas Padjadjaran.
            Semua merek dagang dan hak cipta milik entitas masing-masing.
          </p>
        </div>
      </div>
    </footer>
  );
};
