import React from 'react';
import { ItemSummary } from '../../services/api';
import { formatRupiah, formatRelativeTime } from '../../utils/format';
import { Badge } from './Badge';
import { Card, CardContent } from './Card';
import { Icon } from './Icon';

export interface ProductCardProps {
  item: ItemSummary;
  onClick?: (item: ItemSummary) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick }) => {
  const primaryPhoto =
    item.photos.find((p) => p.isPrimary)?.url ||
    item.photos[0]?.url ||
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f2f4f5"/><text x="200" y="150" fill="%23888" font-size="14" text-anchor="middle">Foto Tidak Tersedia</text></svg>';

  const isPickupOnly = item.allowedDeliveryMethod === 'PICKUP_ONLY';
  const isSold = item.status === 'SOLD';
  const isReserved = item.status === 'RESERVED';

  return (
    <Card
      hoverable={!isSold}
      onClick={() => onClick && onClick(item)}
      className={`group flex flex-col h-full bg-white border border-brand-border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
        isSold ? 'opacity-70 bg-gray-50' : 'hover:border-brand-blue-300 hover:shadow-card'
      }`}
    >
      {/* Photo Container */}
      <div className="relative aspect-4/3 w-full bg-brand-surface overflow-hidden">
        <img
          src={primaryPhoto}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <Badge variant="category">{item.category.name}</Badge>
          {item.size && (
            <span className="text-[11px] font-bold bg-white/90 text-brand-text-primary px-2 py-0.5 rounded-md shadow-xs border border-brand-border/60">
              Size {item.size}
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          {isPickupOnly ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/90 text-white px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
              <Icon name="Package" size={16} />
              <span>Khusus Pickup</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-blue-600/90 text-white px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
              <Icon name="Truck" size={16} />
              <span>Bisa Antar</span>
            </span>
          )}
        </div>

        {/* Sold / Reserved Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-20">
            <span className="bg-red-600 text-white font-display text-sm font-bold tracking-wider uppercase px-4 py-1.5 rounded-lg shadow-md">
              Terjual
            </span>
          </div>
        )}

        {isReserved && (
          <div className="absolute inset-0 bg-brand-blue-900/40 backdrop-blur-2xs flex items-center justify-center z-20">
            <span className="bg-amber-500 text-white font-display text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-lg shadow-md">
              Sedang Dipesan
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Condition & Upload Time */}
          <div className="flex items-center justify-between text-[11px] text-brand-text-secondary">
            <span className="font-semibold text-brand-blue-dark bg-brand-blue-50 px-2 py-0.5 rounded">
              {item.condition}
            </span>
            <span>{formatRelativeTime(item.createdAt)}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-sm text-brand-text-primary line-clamp-2 leading-snug group-hover:text-brand-blue-600 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Pricing & Location */}
        <div className="pt-2 border-t border-brand-border/60 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-brand-text-secondary block">Harga Pas</span>
              <p className="font-display text-lg font-black text-brand-orange leading-none tabular-nums">
                {formatRupiah(item.priceRupiah)}
              </p>
            </div>

            {item.pickupLocation && (
              <span
                className="text-[11px] text-brand-text-secondary flex items-center gap-1 max-w-[130px] truncate"
                title={item.pickupLocation}
              >
                <Icon name="MapPin" size={16} className="text-brand-blue-500 shrink-0" />
                <span className="truncate">{item.pickupLocation}</span>
              </span>
            )}
          </div>

          {/* Verified Seller Tag */}
          <div className="flex items-center justify-between text-[11px] text-brand-text-secondary pt-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-5 h-5 rounded-full bg-brand-blue-100 text-brand-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                {item.seller.name.charAt(0)}
              </span>
              <span className="truncate font-medium">{item.seller.name}</span>
            </div>

            {item.seller.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 border border-emerald-200">
                <Icon name="ShieldCheck" size={16} className="text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
