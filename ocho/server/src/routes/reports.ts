import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const reportsRouter = Router();

const createReportSchema = z.object({
  itemId: z.string().uuid('ID barang tidak valid').optional().nullable(),
  reason: z.enum(['PROHIBITED_ITEM', 'MISLEADING', 'SUSPECTED_FRAUD', 'OTHER'], {
    errorMap: () => ({ message: 'Pilih alasan pelaporan yang valid' }),
  }),
  description: z.string().min(5, 'Deskripsi laporan minimal 5 karakter').max(1000),
});

/**
 * POST /api/reports
 * Submit a report against an item or prohibited listing.
 */
reportsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const body = createReportSchema.parse(req.body);

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        itemId: body.itemId || null,
        reason: body.reason,
        description: body.description.trim(),
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Laporan Anda telah diterima. Tim admin Ocho akan meninjau dalam 1x24 jam untuk menjaga kenyamanan sesama mahasiswa.',
      data: report,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: err.errors[0]?.message || 'Input laporan tidak valid.',
        details: err.errors,
      });
      return;
    }
    next(err);
  }
});
