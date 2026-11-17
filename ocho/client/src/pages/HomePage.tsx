import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchCategories,
  fetchItems,
  Category,
  ItemListResponse,
} from '../services/api';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/ProductCardSkeleton';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck,
  Search,
  ArrowUpDown,
  Sparkles,
  Package,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Truck,
} from 'lucide-react';

export interface HomePageProps {
  onSelectItem: (itemId: string) => void;
  initialSearch?: string;
  onSearchChange?: (val: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectItem,
  initialSearch = '',
  onSearchChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState<'ALL' | 'PICKUP' | 'DELIVERY'>('ALL');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'price_asc' | 'price_desc'>('latest');

  const [page, setPage] = useState<number>(1);
  const limit = 12;

  const [itemsData, setItemsData] = useState<ItemListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync external search change
  useEffect(() => {
    if (initialSearch !== searchQuery) {
      setSearchQuery(initialSearch);
      setPage(1);
    }
  }, [initialSearch]);

  // Load categories once
  useEffect(() => {
    let isMounted = true;
    fetchCategories()
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch items whenever filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchItems({
      category: selectedCategory,
      search: searchQuery,
      condition: selectedCondition,
      deliveryMethod: selectedDelivery,
      sort: selectedSort,
      page,
      limit,
    })
      .then((res) => {
        if (isMounted) {
          setItemsData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Terjadi kesalahan saat memuat barang.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, selectedCondition, selectedDelivery, selectedSort, page]);

  const handleResetFilters = () => {
    setSelectedCategory('semua');
    setSearchQuery('');
    if (onSearchChange) onSearchChange('');
    setSelectedCondition('ALL');
    setSelectedDelivery('ALL');
    setSelectedSort('latest');
    setPage(1);
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  const conditionsList = [
    { value: 'ALL', label: 'Semua Kondisi' },
    { value: 'BARU', label: 'Baru' },
    { value: 'SEPERTI_BARU', label: 'Seperti Baru' },
    { value: 'SANGAT_BAIK', label: 'Sangat Baik' },
    { value: 'BAIK', label: 'Baik' },
    { value: 'CUKUP', label: 'Cukup' },
  ];

  const deliveryMethodsList: { value: 'ALL' | 'PICKUP' | 'DELIVERY'; label: string }[] = [
    { value: 'ALL', label: 'Semua Metode' },
    { value: 'PICKUP', label: 'Bisa Pickup' },
    { value: 'DELIVERY', label: 'Bisa Diantar Ocho' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Paling Baru' },
    { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
    { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  ];

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'semua') count++;
    if (searchQuery.trim()) count++;
    if (selectedCondition !== 'ALL') count++;
    if (selectedDelivery !== 'ALL') count++;
    if (selectedSort !== 'latest') count++;
    return count;
  }, [selectedCategory, searchQuery, selectedCondition, selectedDelivery, selectedSort]);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-brand-surface via-brand-surface to-white border-b border-brand-border pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Header Title */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange-light text-brand-orange-dark border border-brand-orange/20 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              <span>Khusus Mahasiswa Unpad Jatinangor</span>
            </div>

            <h1 className="font-display font-black text-4xl lg:text-5xl text-brand-text-primary tracking-tight leading-tight">
              Jual, beli, sewa, dan titip.{' '}
              <span className="text-brand-blue-600 block mt-1">Sesama mahasiswa.</span>
            </h1>

            <p className="text-base text-brand-text-secondary leading-relaxed">
              Platform barang preloved aman dan transparan di sekitar kampus Unpad Jatinangor.
              Beli perlengkapan kos, buku kuliah, dan fashion tanpa was-was penipuan.
            </p>
          </div>

          {/* 3-Step Verification Panel */}
          <div className="bg-white rounded-2xl border border-brand-border shadow-xs p-6 lg:p-7">
            <div className="flex items-center justify-between pb-5 border-b border-brand-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-blue-50 text-brand-blue-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-brand-text-primary">
                    Verifikasi sekali, langsung jalan
                  </h2>
                  <p className="text-xs text-brand-text-secondary">
                    Hanya butuh 1 menit untuk membuka akses transaksi aman di Ocho.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                100% Komunitas Kampus
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-brand-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-brand-text-primary">
                    Verifikasi Mahasiswa
                  </h3>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Daftar pakai email <span className="font-mono text-brand-blue-dark">@mail.unpad.ac.id</span> atau unggah KTM. Hanya mahasiswa aktif yang dapat bertransaksi.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-brand-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-brand-text-primary">
                    Pilih & Nego Wajar
                  </h3>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Temukan barang preloved berkualitas harga pas. Setiap barang hanya ada 1 unit asli anak kos.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-brand-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-brand-text-primary">
                    Ambil Langsung atau Diantar
                  </h3>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Pickup gratis di titik temu kampus (Gerlam, Rektorat, Bale Santika) atau diantar kurir Ocho sampai depan kos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CHIPS BAR */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryClick('semua')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'semua'
                ? 'bg-brand-blue-600 text-white shadow-xs'
                : 'bg-white text-brand-text-secondary border border-brand-border hover:border-brand-blue-300 hover:text-brand-text-primary'
            }`}
          >
            Semua Kategori
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-blue-600 text-white shadow-xs'
                    : 'bg-white text-brand-text-secondary border border-brand-border hover:border-brand-blue-300 hover:text-brand-text-primary'
                }`}
              >
                <span>{cat.name}</span>
                {cat.activeItemCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-surface text-brand-text-secondary'
                    }`}
                  >
                    {cat.activeItemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MULTI-FILTER TOOLBAR */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Left filters: Search + Condition + Delivery Method */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Quick search input within toolbar */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari dalam katalog..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-brand-surface rounded-lg border border-brand-border focus:outline-none focus:border-brand-blue-500 focus:bg-white text-brand-text-primary placeholder:text-brand-text-secondary/70"
              />
            </div>

            {/* Condition Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-brand-text-secondary font-medium shrink-0">Kondisi:</span>
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  setPage(1);
                }}
                className="text-xs font-semibold bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 text-brand-text-primary focus:outline-none focus:border-brand-blue-500 cursor-pointer"
              >
                {conditionsList.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Method Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-brand-text-secondary font-medium shrink-0">Pengiriman:</span>
              <select
                value={selectedDelivery}
                onChange={(e) => {
                  setSelectedDelivery(e.target.value as any);
                  setPage(1);
                }}
                className="text-xs font-semibold bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 text-brand-text-primary focus:outline-none focus:border-brand-blue-500 cursor-pointer"
              >
                {deliveryMethodsList.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-800 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-brand-blue-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Right Sort: Sort Order */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-brand-text-secondary font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Urutkan:</span>
            </span>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value as any);
                setPage(1);
              }}
              className="text-xs font-semibold bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-brand-text-primary focus:outline-none focus:border-brand-blue-500 cursor-pointer"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT GRID & RESULTS SECTION */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Results Meta */}
        <div className="flex items-center justify-between text-xs text-brand-text-secondary font-medium">
          <div>
            {itemsData ? (
              <span>
                Menampilkan <strong className="text-brand-text-primary">{itemsData.data.length}</strong> dari{' '}
                <strong className="text-brand-text-primary">{itemsData.meta.total}</strong> barang preloved
              </span>
            ) : (
              <span>Memuat barang...</span>
            )}
          </div>

          {selectedCategory !== 'semua' && (
            <div className="text-xs font-semibold text-brand-blue-dark bg-brand-blue-50 px-2.5 py-1 rounded-md">
              Kategori: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
            <p className="font-semibold text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => setPage(1)}>
              Coba Muat Ulang
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && itemsData && itemsData.data.length === 0 && (
          <div className="bg-white border border-brand-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-surface text-brand-text-secondary flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 opacity-40" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-brand-text-primary">
                Barang tidak ditemukan
              </h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Tidak ada barang yang cocok dengan kriteria pencarian atau filter yang dipilih. Coba cari kata kunci lain atau reset filter.
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={handleResetFilters}>
              Reset Semua Filter
            </Button>
          </div>
        )}

        {/* Live Grid */}
        {!loading && !error && itemsData && itemsData.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {itemsData.data.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onClick={() => onSelectItem(item.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && itemsData && itemsData.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-brand-border">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Sebelumnya
            </Button>

            <span className="text-xs font-semibold text-brand-text-secondary px-3 py-1 bg-brand-surface rounded-lg">
              Halaman {page} dari {itemsData.meta.totalPages}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={page >= itemsData.meta.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </section>

      {/* 5. CAMPUS SAFETY & PICKUP NOTICE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border flex items-center justify-center text-brand-blue-600 shadow-xs shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-sm text-brand-text-primary">
                Titik Temu Aman di Jatinangor
              </h4>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Rekomendasi titik serah terima barang: Gerbang Lama (Gerlam), Rektorat Unpad, Bale Santika, atau Perpustakaan Pusat CISRAL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue-700 bg-brand-blue-50 px-3 py-1.5 rounded-xl border border-brand-blue-200">
              <Truck className="w-4 h-4" />
              <span>Ongkir Flat Rp 3.000 via Tim Ocho</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
