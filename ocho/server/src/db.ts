import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string {
  // If running in Vercel or AWS Lambda serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const possibleSources = [
        path.join(process.cwd(), 'ocho/server/prisma/seed.db'),
        path.join(process.cwd(), 'prisma/seed.db'),
        path.join(__dirname, '../../prisma/seed.db'),
        path.join(__dirname, '../prisma/seed.db'),
        path.join(__dirname, './prisma/seed.db'),
        path.join(process.cwd(), 'ocho/server/prisma/dev.db'),
      ];

      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDb);
            console.log(`[DB] Successfully initialized serverless database from ${src} to ${tmpDb}`);
            break;
          } catch (e) {
            console.warn(`[DB] Failed to copy database from ${src}:`, e);
          }
        }
      }
    }

    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  }

  return process.env.DATABASE_URL || 'file:./dev.db';
}

const dbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
