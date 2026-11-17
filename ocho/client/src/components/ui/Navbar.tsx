import React, { useState } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { Search, PlusCircle, User, ShieldCheck, LogOut, Package, Wallet, ShieldAlert } from 'lucide-react';
import { AuthUser } from '../../services/auth';

export interface NavbarProps {
  currentUser?: AuthUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onSellClick?: () => void;
  onOrdersClick?: () => void;
  onWalletClick?: () => void;
  onAdminClick?: () => void;
  onLogoClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  activeModule?: 'jual-beli' | 'jasa' | 'sewa' | 'jastip';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  onSellClick,
  onOrdersClick,
  onWalletClick,
  onAdminClick,
  onLogoClick,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  activeModule = 'jual-beli',
}) => {
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [tooltipModule, setTooltipModule] = useState<string | null>(null);

  const queryValue = onSearchChange ? searchQuery : internalQuery;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  const modules = [
    { id: 'jual-beli', label: 'Jual-Beli', active: true },
    { id: 'jasa', label: 'Jasa', active: false },
    { id: 'sewa', label: 'Sewa', active: false },
    { id: 'jastip', label: 'Jastip', active: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-brand-border select-none transition-all">
      {/* Top Banner Notice */}
      <div className="bg-[#f5f5f7] border-b border-brand-border/60 text-[#86868b] text-[11px] py-1.5 px-4 font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-blue-600" />
        <span>Eksklusif Mahasiswa Unpad (Jatinangor) &bull; Semua Pengguna Terverifikasi</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Left: Logo & Campus Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#/"
            onClick={(e) => {
              if (onLogoClick) {
                e.preventDefault();
                onLogoClick();
              }
            }}
            className="cursor-pointer inline-block"
            title="Ocho - Beranda"
          >
            <Logo size="md" />
          </a>
          <span className="hidden xl:inline-block text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full border border-brand-border">
            Unpad Edition
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onSearchSubmit) onSearchSubmit();
            }}
            className="relative"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="text"
              value={queryValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Cari kasur, kipas angin, buku kuliah, jaket..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#f5f5f7] rounded-full border border-transparent focus:border-brand-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-100 transition-all text-brand-text-primary placeholder:text-brand-text-secondary"
            />
          </form>
        </div>

        {/* Module Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0 bg-[#f5f5f7] p-1 rounded-full border border-brand-border">
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
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-white text-brand-text-primary shadow-xs border border-brand-border/40'
                      : m.active
                      ? 'text-brand-text-secondary hover:text-brand-text-primary'
                      : 'text-brand-text-secondary/60 cursor-not-allowed'
                  }`}
                >
                  <span>{m.label}</span>
                  {!m.active && (
                    <span className="text-[10px] bg-brand-border/60 text-brand-text-secondary px-1.5 py-0.2 rounded-full font-medium">
                      Segera hadir
                    </span>
                  )}
                </button>

                {tooltipModule === m.id && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[#000000] text-white text-[11px] py-1.5 px-3 rounded-xl shadow-lg whitespace-nowrap">
                    Modul {m.label} segera hadir di fase berikutnya!
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Admin Portal Button (Only visible if ADMIN) */}
              {currentUser.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAdminClick}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-2.5 py-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  Admin
                </Button>
              )}

              {/* My Orders Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOrdersClick}
                className="text-brand-text-secondary hover:text-brand-text-primary text-xs px-2.5 py-1"
                title="Pesanan Saya"
              >
                <Package className="w-4 h-4 mr-1 text-brand-blue-600" />
                <span className="hidden sm:inline">Pesanan</span>
              </Button>

              {/* Wallet Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onWalletClick}
                className="text-brand-text-secondary hover:text-brand-text-primary text-xs px-2.5 py-1"
                title="Dompet & Saldo"
              >
                <Wallet className="w-4 h-4 mr-1 text-emerald-600" />
                <span className="hidden sm:inline">Dompet</span>
              </Button>

              {/* User Profile Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f5f7] rounded-full border border-brand-border">
                <div className="w-5 h-5 rounded-full bg-brand-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-brand-text-primary hidden md:inline truncate max-w-[100px]">
                  {currentUser.name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                title="Keluar"
                onClick={onLogoutClick}
                className="text-brand-text-secondary hover:text-red-600 p-1.5 rounded-full"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="md"
              leftIcon={<User className="w-4 h-4" />}
              onClick={onLoginClick}
            >
              Masuk
            </Button>
          )}

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
