export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Ocho API - Marketplace Mahasiswa Unpad',
    version: '1.0.0',
    description:
      'Dokumentasi REST API decoupled untuk platform Ocho (Marketplace Preloved Mahasiswa Unpad Jatinangor). Seluruh perhitungan keuangan dilakukan di server dengan format bilangan bulat rupiah.',
    contact: {
      name: 'Tim Pengembang Ocho',
      email: 'dev@ocho.id',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development Server',
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Pemeriksaan Kesehatan Server (Healthcheck)',
        description: 'Mengembalikan status operasional server, waktu aktif, dan versi sistem.',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Server aktif dan sehat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', example: '2026-10-23T10:00:00.000Z' },
                    uptime: { type: 'number', example: 124.5 },
                    service: { type: 'string', example: 'ocho-server' },
                    version: { type: 'string', example: '0.1.0' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/config': {
      get: {
        summary: 'Konfigurasi Publik Bisnis',
        description: 'Mendapatkan aturan tarif ongkir, komisi platform, dan domain email kampus yang valid.',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Konfigurasi bisnis berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    platformCommissionRate: { type: 'number', example: 0.2 },
                    standardDeliveryFeeRupiah: { type: 'integer', example: 3000 },
                    minOrderForDeliveryRupiah: { type: 'integer', example: 30000 },
                    firstOrderFreeDelivery: { type: 'boolean', example: true },
                    allowedEmailDomains: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['mail.unpad.ac.id', 'unpad.ac.id'],
                    },
                    pickupOnlyCategories: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['Perabot Kos', 'Paket Pindahan'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/categories': {
      get: {
        summary: 'Daftar Kategori Produk',
        description: 'Mendapatkan semua kategori produk aktif beserta jumlah barang yang tersedia.',
        tags: ['Catalog'],
        responses: {
          '200': {
            description: 'Daftar kategori berhasil diambil',
          },
        },
      },
    },
    '/api/items': {
      get: {
        summary: 'Daftar Barang Preloved',
        description: 'Mendapatkan daftar barang aktif dengan filter kategori, pencarian, dan pagination.',
        tags: ['Catalog'],
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'condition', in: 'query', schema: { type: 'string' } },
          { name: 'deliveryMethod', in: 'query', schema: { type: 'string', enum: ['ALL', 'PICKUP', 'DELIVERY'] } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['latest', 'price_asc', 'price_desc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 24 } },
        ],
        responses: {
          '200': {
            description: 'Daftar barang berhasil diambil',
          },
        },
      },
    },
    '/api/items/{id}': {
      get: {
        summary: 'Detail Barang Preloved',
        description: 'Mendapatkan informasi lengkap satu barang beserta profil penjual dan rating.',
        tags: ['Catalog'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Detail barang ditemukan',
          },
          '404': {
            description: 'Barang tidak ditemukan',
          },
        },
      },
    },
    '/api/campuses': {
      get: {
        summary: 'Daftar Kampus',
        description: 'Mendapatkan daftar kampus yang aktif dan domain email yang didukung.',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Daftar kampus berhasil diambil',
          },
        },
      },
    },
  },
};
