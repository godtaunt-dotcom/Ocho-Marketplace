/**
 * Ocho API Client Service
 * Typed fetch wrappers communicating with the decoupled Express backend.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  allowedDelivery: 'PICKUP_ONLY' | 'PICKUP_OR_DELIVERY';
  requiresSize: boolean;
  requiresCondition: boolean;
  isForbidden: boolean;
  displayOrder: number;
  activeItemCount: number;
}

export interface ItemPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder?: number;
}

export interface ItemSummary {
  id: string;
  title: string;
  description: string;
  priceRupiah: number;
  condition: string;
  size: string | null;
  brand: string | null;
  allowedDeliveryMethod: 'PICKUP_ONLY' | 'PICKUP_OR_DELIVERY';
  pickupLocation: string | null;
  status: 'ACTIVE' | 'RESERVED' | 'SOLD';
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    allowedDelivery: 'PICKUP_ONLY' | 'PICKUP_OR_DELIVERY';
  };
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
    campus?: {
      name: string;
      code: string;
    } | null;
  };
  photos: ItemPhoto[];
}

export interface ReviewItem {
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ItemDetail extends ItemSummary {
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
    verifiedAt: string | null;
    createdAt: string;
    campus?: {
      id: string;
      name: string;
      code: string;
    } | null;
    averageRating: number | null;
    reviewCount: number;
    reviewsReceived?: ReviewItem[];
  };
}

export interface ItemListResponse {
  data: ItemSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BusinessConfig {
  platformCommissionRate: number;
  standardDeliveryFeeRupiah: number;
  minOrderForDeliveryRupiah: number;
  firstOrderFreeDelivery: boolean;
  allowedEmailDomains: string[];
  pickupOnlyCategories: string[];
}

export interface FetchItemsParams {
  category?: string;
  search?: string;
  condition?: string;
  deliveryMethod?: 'ALL' | 'PICKUP' | 'DELIVERY';
  sort?: 'latest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error(`Gagal memuat kategori (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchItems(params: FetchItemsParams = {}): Promise<ItemListResponse> {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== 'semua') {
    searchParams.set('category', params.category);
  }
  if (params.search && params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params.condition && params.condition !== 'ALL') {
    searchParams.set('condition', params.condition);
  }
  if (params.deliveryMethod && params.deliveryMethod !== 'ALL') {
    searchParams.set('deliveryMethod', params.deliveryMethod);
  }
  if (params.sort) {
    searchParams.set('sort', params.sort);
  }
  if (params.page) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const queryStr = searchParams.toString();
  const url = `${API_BASE}/items${queryStr ? `?${queryStr}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar barang (${res.status})`);
  }
  return res.json();
}

export async function fetchItemById(id: string): Promise<ItemDetail> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Barang tidak ditemukan atau sudah dihapus.');
    }
    throw new Error(`Gagal memuat detail barang (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchBusinessConfig(): Promise<BusinessConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) {
    throw new Error(`Gagal memuat konfigurasi bisnis (${res.status})`);
  }
  return res.json();
}
