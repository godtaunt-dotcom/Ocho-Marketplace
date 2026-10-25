import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { z } from 'zod';

export const itemsRouter = Router();

const listItemsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  condition: z.string().optional(),
  deliveryMethod: z.enum(['ALL', 'PICKUP', 'DELIVERY']).optional(),
  sort: z.enum(['latest', 'price_asc', 'price_desc']).optional().default('latest'),
  limit: z.coerce.number().min(1).max(100).optional().default(24),
  page: z.coerce.number().min(1).optional().default(1),
});

itemsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listItemsQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (query.category && query.category !== 'semua') {
      where.category = {
        slug: query.category,
      };
    }

    if (query.search && query.search.trim()) {
      where.OR = [
        { title: { contains: query.search.trim() } },
        { description: { contains: query.search.trim() } },
      ];
    }

    if (query.condition) {
      where.condition = query.condition;
    }

    if (query.deliveryMethod === 'DELIVERY') {
      where.allowedDeliveryMethod = 'PICKUP_OR_DELIVERY';
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { priceRupiah: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { priceRupiah: 'desc' };
    }

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true, allowedDelivery: true },
          },
          seller: {
            select: { id: true, name: true, isVerified: true, campus: { select: { name: true, code: true } } },
          },
          photos: {
            orderBy: { displayOrder: 'asc' },
            take: 2,
            select: { id: true, url: true, isPrimary: true },
          },
        },
      }),
    ]);

    res.json({
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

itemsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            verifiedAt: true,
            createdAt: true,
            campus: { select: { id: true, name: true, code: true } },
            reviewsReceived: {
              select: { rating: true, comment: true, createdAt: true },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Not Found', message: 'Barang tidak ditemukan.' });
      return;
    }

    // Calculate seller review average
    const sellerRatings = item.seller.reviewsReceived.map((r) => r.rating);
    const avgRating = sellerRatings.length
      ? Number((sellerRatings.reduce((a, b) => a + b, 0) / sellerRatings.length).toFixed(1))
      : null;

    res.json({
      data: {
        ...item,
        seller: {
          ...item.seller,
          averageRating: avgRating,
          reviewCount: sellerRatings.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});
