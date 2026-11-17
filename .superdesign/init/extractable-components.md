# Extractable Components

Catalog of reusable candidate components identified across Ocho for modular canvas drafting.

## 1. ProductCard (`ocho/client/src/components/ui/ProductCard.tsx`)
- **Props**: `item: ItemSummary`, `onClick?: () => void`
- **Elements**: 4:3 photo ratio, sold overlay, category pill, condition badge, fashion size indicator, integer Rupiah price format, seller verification status, pickup location.
- **Potential Extractions**:
  - `ProductPrice`: Currency integer formatter with discount or commission styling.
  - `VerificationBadge`: Student identity pill.
  - `DeliveryTag`: Pickup vs Antar Kosan badge indicator.

## 2. ProductCardSkeleton (`ocho/client/src/components/ui/ProductCardSkeleton.tsx`)
- **Props**: None
- **Elements**: Shimmering pulse placeholder matching `ProductCard` aspect ratios and text rows.

## 3. CategoryPillBar
- **Current Location**: Inline in `HomePage.tsx`
- **Features**: Horizontal scrollable bar with active selection state and live count badges (`Semua`, `Fashion (8)`, `Perabot Kos (4)`).
- **Extraction Value**: Highly reusable across future catalog search views and module tabs.

## 4. CatalogFilterBar
- **Current Location**: Inline in `HomePage.tsx`
- **Features**: Clean toolbar with condition filter dropdown (`Semua`, `Baru`, `Seperti Baru`, `Bekas Layak`), delivery method toggles, and sorting options.

## 5. SellerTrustCard
- **Current Location**: Inline right-column in `ItemDetailPage.tsx`
- **Features**: Student avatar, campus email domain badge, rating stars, item sales count, and join duration.
- **Extraction Value**: Usable in seller profiles, chat views, and order confirmations.

## 6. CommissionBreakdownCard
- **Current Location**: Inline in `ItemDetailPage.tsx`
- **Features**: Transparent display of buyer price, 20% platform commission, and net seller payout in integer Rupiah.
- **Extraction Value**: Critical for seller listing creation flow (`Tahap 5`).
