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
                      example: ['mail.unpad.ac.id'],
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
    '/api/auth/register': {
      post: {
        summary: 'Pendaftaran Mahasiswa',
        description: 'Daftar akun mahasiswa dengan validasi domain email kampus Unpad strictly (mail.unpad.ac.id).',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'mahasiswa@mail.unpad.ac.id' },
                  password: { type: 'string', minLength: 8, example: 'Rahasia123!' },
                  name: { type: 'string', example: 'Dinda Kirana' },
                  phone: { type: 'string', example: '08123456789' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Pendaftaran berhasil dan terverifikasi' },
          '400': { description: 'Domain email tidak diizinkan atau input tidak valid' },
          '409': { description: 'Email sudah terdaftar' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login Akun Mahasiswa',
        description: 'Masuk dengan kredensial email kampus dan password, mengembalikan bearer token.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'mahasiswa@mail.unpad.ac.id' },
                  password: { type: 'string', example: 'Rahasia123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login berhasil, token dikembalikan' },
          '401': { description: 'Email atau password salah' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Profil Pengguna Aktif',
        description: 'Mengambil data profil mahasiswa dan statistik transaksi berdasarkan token bearer.',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Profil berhasil diambil' },
          '401': { description: 'Sesi tidak valid atau belum login' },
        },
      },
    },
    '/api/auth/verify-email': {
      post: {
        summary: 'Verifikasi Email Kampus',
        description: 'Konfirmasi link/kode verifikasi email mahasiswa (Strategi A).',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'mahasiswa@mail.unpad.ac.id' },
                  verificationCode: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Verifikasi email berhasil' },
          '404': { description: 'Pengguna tidak ditemukan' },
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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
