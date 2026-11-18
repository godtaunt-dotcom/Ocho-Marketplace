import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string {
  // If running in Vercel, Netlify, or AWS Lambda serverless environment
  if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = '/tmp/dev.db';
    let isTmpValid = false;
    try {
      if (fs.existsSync(tmpDb) && fs.statSync(tmpDb).size > 10000) {
        isTmpValid = true;
      }
    } catch {
      isTmpValid = false;
    }

    if (!isTmpValid) {
      const possibleSources = [
        path.join(process.cwd(), 'api/seed.db'),
        path.join(process.cwd(), 'ocho/server/prisma/seed.db'),
        path.join(process.cwd(), 'prisma/seed.db'),
        path.join(__dirname, '../../api/seed.db'),
        path.join(__dirname, '../seed.db'),
        path.join(__dirname, '../../prisma/seed.db'),
        path.join(__dirname, '../prisma/seed.db'),
        path.join(__dirname, './prisma/seed.db'),
        path.join(process.cwd(), 'ocho/server/prisma/dev.db'),
      ];

      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            const stat = fs.statSync(src);
            if (stat.size > 10000) {
              fs.copyFileSync(src, tmpDb);
              console.log(`[DB] Successfully initialized serverless database from ${src} (${stat.size} bytes) to ${tmpDb}`);
              isTmpValid = true;
              break;
            }
          } catch (e) {
            console.warn(`[DB] Failed to copy database from ${src}:`, e);
          }
        }
      }
    }

    if (isTmpValid && fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  }

  // Non-serverless environment: resolve absolute path to avoid empty db in wrong cwd
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'file:./dev.db') {
    const localDbSources = [
      path.resolve(process.cwd(), 'ocho/server/prisma/dev.db'),
      path.resolve(process.cwd(), 'prisma/dev.db'),
      path.resolve(__dirname, '../../prisma/dev.db'),
      path.resolve(__dirname, '../prisma/dev.db'),
    ];

    for (const src of localDbSources) {
      if (fs.existsSync(src)) {
        return `file:${src}`;
      }
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
