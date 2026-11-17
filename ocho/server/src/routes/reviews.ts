import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const reviewsRouter = Router();

const createReviewSchema = z.object({
  orderId: z.string().uuid('ID pesanan tidak valid'),
  rating: z.coerce.number().int().min(1, 'Rating minimal 1 bintang').max(5, 'Rating maksimal 5 bintang'),
  comment: z.string().max(500, 'Komentar maksimal 500 karakter').optional().nullable(),
});

/**
 * POST /api/reviews
 * Buyer writes a review for a completed order.
 */
reviewsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const body = createReviewSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { review: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Pesanan tidak ditemukan.' });
      return;
    }

    if (order.buyerId !== user.id) {
      res.status(403).json({ error: 'Forbidden', message: 'Hanya pembeli yang dapat memberikan ulasan.' });
      return;
    }

    if (order.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Bad Request', message: 'Ulasan hanya dapat diberikan setelah pesanan berstatus Selesai.' });
      return;
    }

    if (order.review) {
      res.status(409).json({ error: 'Conflict', message: 'Anda sudah memberikan ulasan untuk pesanan ini.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        buyerId: user.id,
        sellerId: order.sellerId,
        rating: body.rating,
        comment: body.comment ? body.comment.trim() : null,
      },
    });

    res.status(201).json({
      message: 'Ulasan berhasil dikirim. Terima kasih telah membantu sesama mahasiswa Unpad!',
      data: review,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: err.errors[0]?.message || 'Input ulasan tidak valid.',
        details: err.errors,
      });
      return;
    }
    next(err);
  }
});
