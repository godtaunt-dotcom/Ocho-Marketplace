import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const payoutsRouter = Router();

const createPayoutSchema = z.object({
  amountRupiah: z.coerce.number().int().min(10000, 'Minimal penarikan saldo adalah Rp 10.000'),
  bankName: z.string().min(2, 'Nama bank atau e-wallet wajib diisi').max(50),
  accountNumber: z.string().min(5, 'Nomor rekening wajib diisi').max(30),
  accountHolderName: z.string().min(2, 'Nama pemilik rekening wajib diisi').max(100),
});

/**
 * GET /api/payouts/balance
 * Get seller's current wallet balance and full ledger history.
 */
payoutsRouter.get('/balance', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const entries = await prisma.sellerBalanceEntry.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const currentBalance = entries.length > 0 ? entries[0].balanceAfterRupiah : 0;

    const pendingPayouts = await prisma.payout.aggregate({
      where: { sellerId: user.id, status: 'PENDING' },
      _sum: { amountRupiah: true },
    });
    const pendingWithdrawalRupiah = pendingPayouts._sum.amountRupiah || 0;

    res.json({
      data: {
        currentBalanceRupiah: currentBalance,
        pendingWithdrawalRupiah,
        availableToWithdrawRupiah: Math.max(0, currentBalance),
        history: entries,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payouts
 * Request a payout withdrawal from seller balance.
 */
payoutsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const body = createPayoutSchema.parse(req.body);

    // Get current balance
    const lastEntry = await prisma.sellerBalanceEntry.findFirst({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    const currentBalance = lastEntry ? lastEntry.balanceAfterRupiah : 0;

    if (body.amountRupiah > currentBalance) {
      res.status(400).json({
        error: 'Insufficient Balance',
        message: `Saldo tidak mencukupi. Saldo Anda saat ini: Rp ${currentBalance.toLocaleString('id-ID')}.`,
      });
      return;
    }

    const newBalance = currentBalance - body.amountRupiah;

    const payout = await prisma.$transaction(async (tx) => {
      // 1. Create Payout Request
      const createdPayout = await tx.payout.create({
        data: {
          sellerId: user.id,
          amountRupiah: body.amountRupiah,
          bankName: body.bankName.trim(),
          accountNumber: body.accountNumber.trim(),
          accountHolderName: body.accountHolderName.trim(),
          status: 'PENDING',
        },
      });

      // 2. Record Debit Ledger Entry
      await tx.sellerBalanceEntry.create({
        data: {
          sellerId: user.id,
          type: 'DEBIT_WITHDRAWAL',
          amountRupiah: body.amountRupiah,
          balanceAfterRupiah: newBalance,
          description: `Penarikan saldo ke ${body.bankName} (${body.accountNumber})`,
        },
      });

      return createdPayout;
    });

    res.status(201).json({
      message: 'Permintaan pencairan dana berhasil diajukan. Admin akan memproses transfer dalam 1x24 jam kerja.',
      data: payout,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: err.errors[0]?.message || 'Data pencairan tidak valid.',
        details: err.errors,
      });
      return;
    }
    next(err);
  }
});

/**
 * GET /api/payouts
 * List withdrawal requests of current seller.
 */
payoutsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const payouts = await prisma.payout.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: payouts });
  } catch (err) {
    next(err);
  }
});
