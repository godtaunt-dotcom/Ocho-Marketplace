import React, { useState } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { Icon } from './Icon';
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
  onEditUsernameClick?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
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
  onEditUsernameClick,
  isDarkMode = false,
  onToggleDarkMode,
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-brand-border dark:border-slate-800 transition-colors">
      {/* Top Banner (Campus Verified Info) */}
      <div className="bg-[#191c1f] dark:bg-black text-white text-[11px] font-medium py-1 px-4 text-center select-none flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Eksklusif Mahasiswa Unpad &bull; Jatinangor & Dipati Ukur</span>
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
          <span className="hidden xl:inline-block text-[11px] font-semibold text-[#86868b] dark:text-slate-400 bg-[#f5f5f7] dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-brand-border dark:border-slate-700">
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
            <Icon name="MagnifyingGlass" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400" />
            <input
              type="text"
              value={queryValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Cari kasur, kipas angin, buku kuliah, jaket..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#f5f5f7] dark:bg-slate-800 rounded-full border border-transparent focus:border-brand-border dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-100 dark:focus:ring-brand-blue-900 transition-all text-brand-text-primary dark:text-slate-100 placeholder:text-brand-text-secondary dark:placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Module Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0 bg-[#f5f5f7] dark:bg-slate-800 p-1 rounded-full border border-brand-border dark:border-slate-700">
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
                      ? 'bg-white dark:bg-slate-900 text-brand-text-primary dark:text-slate-100 shadow-xs border border-brand-border/40 dark:border-slate-700'
                      : m.active
                      ? 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-200'
                      : 'text-brand-text-secondary/60 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>{m.label}</span>
                  {!m.active && (
                    <span className="text-[10px] bg-brand-border/60 dark:bg-slate-700 text-brand-text-secondary dark:text-slate-400 px-1.5 py-0.2 rounded-full font-medium">
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
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-full text-brand-text-secondary dark:text-slate-300 hover:text-brand-text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            aria-label={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            <Icon
              name={isDarkMode ? 'Sun' : 'Moon'}
              size={18}
              className={isDarkMode ? 'text-amber-400' : 'text-slate-600 dark:text-slate-300'}
            />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Admin Portal Button (Only visible if ADMIN) */}
              {currentUser.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAdminClick}
                  className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs px-2.5 py-1"
                >
                  <Icon name="ShieldWarning" size={16} className="mr-1" />
                  Admin
                </Button>
              )}

              {/* My Orders Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOrdersClick}
                className="text-brand-text-secondary dark:text-slate-300 hover:text-brand-text-primary dark:hover:text-white text-xs px-2.5 py-1"
                title="Pesanan Saya"
              >
                <Icon name="Package" size={16} className="mr-1 text-brand-blue-600 dark:text-brand-blue-400" />
                <span className="hidden sm:inline">Pesanan</span>
              </Button>

              {/* Wallet Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onWalletClick}
                className="text-brand-text-secondary dark:text-slate-300 hover:text-brand-text-primary dark:hover:text-white text-xs px-2.5 py-1"
                title="Dompet & Saldo"
              >
                <Icon name="Wallet" size={16} className="mr-1 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Dompet</span>
              </Button>

              {/* User Profile Badge (Clickable for Username customizer) */}
              <button
                type="button"
                onClick={onEditUsernameClick}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f5f7] dark:bg-slate-800 hover:bg-brand-blue-50 dark:hover:bg-slate-700 rounded-full border border-brand-border dark:border-slate-700 hover:border-brand-blue-300 transition-colors cursor-pointer group"
                title="Klik untuk ubah username toko"
              >
                <div className="w-5 h-5 rounded-full bg-brand-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {(currentUser.username || currentUser.name).charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-brand-text-primary dark:text-slate-200 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 hidden md:inline truncate max-w-[120px]">
                  {currentUser.username ? `@${currentUser.username}` : `@${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                </span>
              </button>

              <Button
                variant="ghost"
                size="sm"
                title="Keluar"
                onClick={onLogoutClick}
                className="text-brand-text-secondary dark:text-slate-400 hover:text-red-600 p-1.5 rounded-full"
              >
                <Icon name="SignOut" size={16} ariaLabel="Keluar" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="md"
              leftIcon={<Icon name="User" size={16} />}
              onClick={onLoginClick}
            >
              Masuk
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            leftIcon={<Icon name="PlusCircle" size={16} />}
            onClick={onSellClick}
          >
            Jual Barang
          </Button>
        </div>
      </div>
    </header>
  );
};
