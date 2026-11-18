import { PrismaClient } from '@prisma/client';

// Persistent PostgreSQL (Neon / Supabase). Connection string comes from DATABASE_URL.
if (!process.env.DATABASE_URL) {
  console.error('[DB] DATABASE_URL belum diatur. Isi di ocho/server/.env (lokal) atau Environment variables Netlify.');
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalForPrisma.prisma = prisma;
