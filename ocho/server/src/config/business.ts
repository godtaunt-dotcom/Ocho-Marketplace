/**
 * Ocho Business Configuration
 * Central source of truth for all business rules, fee calculations, delivery fees,
 * timeout policies, and moderation keywords.
 * Reference: docs/business-rules.md
 */

export interface BusinessConfig {
  /** Platform commission rate on item price (borne by seller, not added to buyer) */
  platformCommissionRate: number;
  /** Minimum commission in Rupiah if rate yields less */
  minCommissionRupiah: number;
  /** Fixed delivery fee by Ocho team in Rupiah */
  standardDeliveryFeeRupiah: number;
  /** Minimum subtotal required for delivery service */
  minOrderForDeliveryRupiah: number;
  /** Whether the first order for a new buyer has free delivery */
  firstOrderFreeDelivery: boolean;
  /** QRIS payment reservation timeout in minutes */
  qrisReservationTimeoutMinutes: number;
  /** Allowed student email domains for campus verification */
  allowedEmailDomains: string[];
  /** Prohibited item keywords for content moderation */
  prohibitedKeywords: string[];
  /** Categories that only support campus pickup (no delivery) */
  pickupOnlyCategories: string[];
  /** Categories forbidden from marketplace */
  forbiddenCategories: string[];
}

/**
 * Resolves allowed campus email domains.
 * Default is strictly student domain 'mail.unpad.ac.id'.
 * Additional domains are optionally read from environment variables:
 * EXTRA_ALLOWED_EMAIL_DOMAINS or ALLOWED_EMAIL_DOMAINS (comma-separated).
 */
export function resolveAllowedEmailDomains(): string[] {
  const base = ['mail.unpad.ac.id'];
  const envExtra =
    process.env.EXTRA_ALLOWED_EMAIL_DOMAINS ||
    process.env.ALLOWED_EMAIL_DOMAINS;

  if (!envExtra) return base;

  const extras = envExtra
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...base, ...extras]));
}

export const defaultBusinessConfig: BusinessConfig = {
  // 20% platform commission deducted from seller payout
  platformCommissionRate: 0.20,
  minCommissionRupiah: 1000,

  // Flat Rp 3.000 delivery fee around Jatinangor
  standardDeliveryFeeRupiah: 3000,
  minOrderForDeliveryRupiah: 30000,
  firstOrderFreeDelivery: true,

  // Reservation window for unpaid QRIS transactions (30 menit)
  qrisReservationTimeoutMinutes: 30,

  // Campus verification domains (hanya domain mahasiswa Unpad by default)
  allowedEmailDomains: resolveAllowedEmailDomains(),

  // Moderation blocklist (rokok, vape, alkohol, obat, suplemen, senjata)
  prohibitedKeywords: [
    'vape',
    'liquid vape',
    'pod',
    'mod',
    'rokok',
    'cerutu',
    'alkohol',
    'miras',
    'ciu',
    'anggur merah',
    'ganja',
    'obat',
    'obat keras',
    'psikotropika',
    'suplemen',
    'senjata',
    'airsoft',
  ],

  // Categories restricted to pickup only due to bulk size
  pickupOnlyCategories: [
    'Perabot Kos',
    'Paket Pindahan',
  ],

  // Disallowed gadget categories in phase 1
  forbiddenCategories: [
    'HP',
    'Smartphone',
    'Laptop',
    'Tablet',
  ],
};

/**
 * Calculates financial amounts for an item order.
 * All computations are in integer Rupiah (bilangan bulat Rupiah).
 *
 * Aturan Pembulatan Komisi:
 * - Komisi platform adalah 20% dari harga barang (itemPrice * platformCommissionRate).
 * - Dibulatkan ke bilangan bulat terdekat menggunakan Math.round (half-up nearest integer).
 *   Contoh: 10.001 * 0.20 = 2000.2 -> dibulatkan menjadi Rp 2.000.
 *           10.003 * 0.20 = 2000.6 -> dibulatkan menjadi Rp 2.001.
 * - Minimum komisi adalah minCommissionRupiah (default: Rp 1.000).
 * - Penjual menerima = Math.max(0, itemPrice - commission).
 * - Komisi ditanggung PENJUAL (dipotong dari hasil penjualan, tidak ditambahkan ke pembeli).
 * - Pembeli membayar = itemPrice + deliveryFee.
 * - Tidak ada nilai pecahan desimal yang disimpan atau dikembalikan.
 */
export function calculateOrderTotals(params: {
  itemPriceRupiah: number;
  deliveryMethod: 'PICKUP' | 'DELIVERY';
  isFirstOrder?: boolean;
  config?: Partial<BusinessConfig>;
}): {
  itemPrice: number;
  commission: number;
  sellerPayout: number;
  deliveryFee: number;
  buyerTotal: number;
} {
  const cfg = { ...defaultBusinessConfig, ...params.config };
  const itemPrice = Math.round(params.itemPriceRupiah);

  // Commission is 20% of item price, borne by seller, rounded to nearest integer Rupiah
  const calculatedCommission = Math.round(itemPrice * cfg.platformCommissionRate);
  const commission = Math.max(calculatedCommission, cfg.minCommissionRupiah);
  const sellerPayout = Math.max(0, itemPrice - commission);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (params.deliveryMethod === 'DELIVERY') {
    if (params.isFirstOrder && cfg.firstOrderFreeDelivery) {
      deliveryFee = 0;
    } else {
      deliveryFee = cfg.standardDeliveryFeeRupiah;
    }
  }

  // Buyer pays item price + delivery fee
  const buyerTotal = itemPrice + deliveryFee;

  return {
    itemPrice,
    commission,
    sellerPayout,
    deliveryFee,
    buyerTotal,
  };
}

/**
 * Validates whether an email belongs to an allowed Unpad campus domain.
 * Enforces strict exact domain matching (no substring or suffix bypass).
 * e.g. "x@evil-unpad.ac.id" and "x@mail.unpad.ac.id.evil.com" are rejected.
 */
export function isAllowedCampusEmail(
  email: string,
  allowedDomains: string[] = defaultBusinessConfig.allowedEmailDomains
): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (!localPart || !domain) return false;

  // Exact matching against allowed domains list
  return allowedDomains.some((allowed) => domain === allowed.toLowerCase().trim());
}

/**
 * Checks if listing title or description contains prohibited keywords.
 */
export function checkProhibitedContent(
  text: string,
  blocklist: string[] = defaultBusinessConfig.prohibitedKeywords
): { prohibited: boolean; matchedKeyword?: string } {
  const lower = text.toLowerCase();
  for (const keyword of blocklist) {
    if (lower.includes(keyword.toLowerCase())) {
      return { prohibited: true, matchedKeyword: keyword };
    }
  }
  return { prohibited: false };
}
