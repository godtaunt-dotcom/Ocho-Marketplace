import React, { useState } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { Search, PlusCircle, User, ShieldCheck } from 'lucide-react';

export interface NavbarProps {
  onLoginClick?: () => void;
  onSellClick?: () => void;
  activeModule?: 'jual-beli' | 'jasa' | 'sewa' | 'jastip';
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoginClick,
  onSellClick,
  activeModule = 'jual-beli',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltipModule, setTooltipModule] = useState<string | null>(null);

  const modules = [
    { id: 'jual-beli', label: 'Jual-Beli', active: true },
    { id: 'jasa', label: 'Jasa', active: false },
    { id: 'sewa', label: 'Sewa', active: false },
    { id: 'jastip', label: 'Jastip', active: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border shadow-xs select-none">
      {/* Top Banner Notice */}
      <div className="bg-brand-blue-600 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-blue-tint" />
        <span>Eksklusif Mahasiswa Unpad (Jatinangor) &bull; Semua Pengguna Terverifikasi</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
        {/* Left: Logo & Campus Tag */}
        <div className="flex items-center gap-4 shrink-0">
          <Logo size="md" />
          <span className="hidden xl:inline-block text-[11px] font-semibold text-brand-blue-dark bg-brand-blue-tint px-2.5 py-0.5 rounded-full border border-brand-blue-100">
            Unpad Edition
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kasur, kipas angin, buku kuliah, jaket..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-brand-surface rounded-xl border border-transparent focus:border-brand-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-100 transition-all text-brand-text-primary placeholder:text-brand-text-secondary/60"
            />
          </div>
        </div>

        {/* Module Tabs (Desktop) */}
        <nav className="flex items-center gap-1 shrink-0 bg-brand-surface p-1 rounded-xl border border-brand-border">
          {modules.map((m) => {
            const isCurrent = m.id === activeModule;
            return (
              <div
                key={m.id}
                className="relative"
                onMouseEnter={() => !m.active && setTooltipModule(m.id)}
                onMouseLeave={() => setTooltipModule(null)}
              >
                <button
                  type="button"
                  disabled={!m.active}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-white text-brand-blue-600 shadow-xs'
                      : m.active
                      ? 'text-brand-text-secondary hover:text-brand-text-primary'
                      : 'text-brand-text-secondary/60 cursor-not-allowed'
                  }`}
                >
                  <span>{m.label}</span>
                  {!m.active && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-medium">
                      Nanti
                    </span>
                  )}
                </button>

                {/* Tooltip for Inactive Modules */}
                {tooltipModule === m.id && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-brand-text-primary text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95">
                    Modul {m.label} segera hadir di fase berikutnya!
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions: Login & Sell */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="md"
            leftIcon={<User className="w-4 h-4" />}
            onClick={onLoginClick}
          >
            Masuk
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={onSellClick}
          >
            Jual Barang
          </Button>
        </div>
      </div>
    </header>
  );
};
