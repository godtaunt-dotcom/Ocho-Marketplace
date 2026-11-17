# Layout Components

Full source code of shared layout components (Navbar, Footer, Logo).

## Navbar (`ocho/client/src/components/ui/Navbar.tsx`)
```tsx
import React, { useState } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { Badge } from './Badge';
import { Search, PlusCircle, User, ShieldCheck, LogOut } from 'lucide-react';
import { AuthUser } from '../../services/auth';

export interface NavbarProps {
  currentUser?: AuthUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onSellClick?: () => void;
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
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border shadow-xs select-none">
      {/* Top Banner Notice */}
      <div className="bg-brand-blue-600 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-blue-tint" />
        <span>Eksklusif Mahasiswa Unpad (Jatinangor) &bull; Semua Pengguna Terverifikasi</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
        {/* Left: Logo & Campus Tag */}
        <div className="flex items-center gap-4 shrink-0">
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
          <span className="hidden xl:inline-block text-[11px] font-semibold text-brand-blue-dark bg-brand-blue-tint px-2.5 py-0.5 rounded-full border border-brand-blue-100">
            Unpad Edition
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg relative">
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
              className="w-full pl-10 pr-4 py-2 text-sm bg-brand-surface rounded-xl border border-transparent focus:border-brand-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-100 transition-all text-brand-text-primary placeholder:text-brand-text-secondary/60"
            />
          </form>
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
                      Segera hadir
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

        {/* Right Actions: Auth Status & Sell */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-surface rounded-xl border border-brand-border">
                <div className="w-7 h-7 rounded-full bg-brand-blue-100 text-brand-blue-600 font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-brand-text-primary line-clamp-1 max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-brand-text-secondary flex items-center gap-1">
                    <Badge variant="verified" size="sm">Unpad</Badge>
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                title="Keluar"
                onClick={onLogoutClick}
                className="text-brand-text-secondary hover:text-red-600 p-2"
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
```

## Footer (`ocho/client/src/components/ui/Footer.tsx`)
```tsx
import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Heart, MapPin, Mail, Layers } from 'lucide-react';

export interface FooterProps {
  onShowcaseClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowcaseClick }) => {
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
            {onShowcaseClick && (
              <li className="pt-2">
                <button
                  type="button"
                  onClick={onShowcaseClick}
                  className="text-brand-purple hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Lihat Desain Sistem &amp; Showcase</span>
                </button>
              </li>
            )}
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
```

## Logo (`ocho/client/src/components/ui/Logo.tsx`)
```tsx
import React from 'react';

export interface LogoProps {
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg' | number;
  iconOnly?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'color',
  size = 'md',
  iconOnly = false,
  className = '',
}) => {
  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : '#191C1F';
  const oColor = isWhite ? '#FFFFFF' : '#5170FD';
  const pupilColor = isWhite ? '#3B4FD6' : '#191C1F';
  const gradientStart = isWhite ? '#FFFFFF' : '#5170FD';
  const gradientEnd = isWhite ? '#E8ECFF' : '#3A1FB0';

  const sizeClasses = typeof size === 'number'
    ? ''
    : {
        sm: iconOnly ? 'h-6 w-6' : 'h-7',
        md: iconOnly ? 'h-8 w-8' : 'h-9',
        lg: iconOnly ? 'h-12 w-12' : 'h-12',
      }[size];

  const customStyle = typeof size === 'number'
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} ${className}`}
        style={customStyle}
        aria-label="Ocho Icon"
      >
        <defs>
          <linearGradient id="smileGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        <circle cx="10" cy="15" r="7" fill={oColor} />
        <circle cx="10" cy="15" r="3" fill={pupilColor} />
        <circle cx="26" cy="15" r="7" fill={oColor} />
        <circle cx="26" cy="15" r="3" fill={pupilColor} />
        <path
          d="M13 25C15 28 21 28 23 25"
          stroke="url(#smileGradIcon)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 130 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} w-auto`}
        style={customStyle}
        aria-label="Ocho Logo"
      >
        <defs>
          <linearGradient id="smileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        <g transform="translate(4, 8)">
          <circle cx="13" cy="13" r="12" fill={oColor} />
          <circle cx="13" cy="13" r="5" fill={isWhite ? '#5170FD' : '#FFFFFF'} />
          <circle cx="13.5" cy="13.5" r="2.8" fill={pupilColor} />
        </g>
        <text
          x="35"
          y="29"
          fill={textColor}
          fontFamily="'Fredoka', 'Baloo 2', sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.5"
        >
          c
        </text>
        <text
          x="53"
          y="29"
          fill={textColor}
          fontFamily="'Fredoka', 'Baloo 2', sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.5"
        >
          h
        </text>
        <path
          d="M40 34C48 40 64 40 70 34"
          stroke="url(#smileGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <g transform="translate(76, 8)">
          <circle cx="13" cy="13" r="12" fill={oColor} />
          <circle cx="13" cy="13" r="5" fill={isWhite ? '#5170FD' : '#FFFFFF'} />
          <circle cx="13.5" cy="13.5" r="2.8" fill={pupilColor} />
        </g>
      </svg>
    </div>
  );
};

export const LogoIcon: React.FC<Omit<LogoProps, 'iconOnly'>> = (props) => (
  <Logo {...props} iconOnly />
);
```
