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

export const defaultBusinessConfig: BusinessConfig = {
  // 20% platform commission deducted from seller payout
  platformCommissionRate: 0.20,
  minCommissionRupiah: 1000,

  // Flat Rp 3.000 delivery fee around Jatinangor
  standardDeliveryFeeRupiah: 3000,
  minOrderForDeliveryRupiah: 30000,
  firstOrderFreeDelivery: true,

  // Reservation window for unpaid QRIS transactions
  qrisReservationTimeoutMinutes: 30,

  // Campus verification domains
  allowedEmailDomains: [
    'mail.unpad.ac.id',
    'unpad.ac.id',
  ],

  // Moderation blocklist (vape is strictly banned, tobacco, alcohol, drugs, weapons)
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
    'obat keras',
    'psikotropika',
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
 * All computations are in integer Rupiah.
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

  // Commission is 20% of item price, borne by seller
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
 */
export function isAllowedCampusEmail(
  email: string,
  allowedDomains: string[] = defaultBusinessConfig.allowedEmailDomains
): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase().trim();
  return allowedDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
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
