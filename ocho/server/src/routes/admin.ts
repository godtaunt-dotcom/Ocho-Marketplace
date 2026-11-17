import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const adminRouter = Router();

// Middleware: restrict to ADMIN role
adminRouter.use(requireAuth, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Akses khusus administrator Ocho Unpad.',
    });
    return;
  }
  next();
});

/**
 * GET /api/admin/stats
 * Overview KPIs for Ocho Admin.
 */
adminRouter.get('/stats', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      activeItems,
      totalOrders,
      completedOrders,
      pendingReports,
      pendingPayouts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: 'COMPLETED' },
        select: { itemPriceRupiah: true, commissionRupiah: true, deliveryFeeRupiah: true },
      }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.payout.count({ where: { status: 'PENDING' } }),
    ]);

    const totalGmv = completedOrders.reduce((sum, o) => sum + o.itemPriceRupiah, 0);
    const totalCommission = completedOrders.reduce((sum, o) => sum + o.commissionRupiah, 0);

    res.json({
      data: {
        totalUsers,
        activeItems,
        totalOrders,
        completedOrdersCount: completedOrders.length,
        totalGmvRupiah: totalGmv,
        totalCommissionEarnedRupiah: totalCommission,
        pendingReportsCount: pendingReports,
        pendingPayoutsCount: pendingPayouts,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/orders
 * List all orders in the system with status and search filters.
 */
adminRouter.get('/orders', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        item: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, phone: true, email: true } },
        seller: { select: { id: true, name: true, phone: true, email: true } },
        payment: true,
      },
    });

    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Admin forces or assigns order status (e.g. mark COD collected, dispatch courier).
 */
adminRouter.patch('/orders/:id/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(notes && { notes }),
      },
    });

    res.json({ message: `Status pesanan diubah oleh admin menjadi ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 * List registered students and verification status.
 */
adminRouter.get('/users', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        verificationMethod: true,
        verifiedAt: true,
        campus: { select: { name: true, code: true } },
        createdAt: true,
        _count: {
          select: { sellingItems: true, buyerOrders: true, sellerOrders: true },
        },
      },
    });

    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id/verify
 * Approve or revoke verification badge for student.
 */
adminRouter.patch('/users/:id/verify', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { isVerified, verificationMethod } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isVerified: Boolean(isVerified),
        verificationMethod: verificationMethod || 'KTM_MANUAL',
        verifiedAt: isVerified ? new Date() : null,
      },
    });

    res.json({ message: 'Status verifikasi mahasiswa berhasil diperbarui.', data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/reports
 * Content moderation reports queue.
 */
adminRouter.get('/reports', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        item: {
          select: {
            id: true,
            title: true,
            priceRupiah: true,
            status: true,
            seller: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json({ data: reports });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Moderate report (RESOLVED or DISMISSED) and optionally take down item.
 */
adminRouter.patch('/reports/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, adminNotes, archiveItem } = req.body;

    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
    });

    if (!report) {
      res.status(404).json({ error: 'Not Found', message: 'Laporan tidak ditemukan.' });
      return;
    }

    if (archiveItem && report.itemId) {
      await prisma.item.update({
        where: { id: report.itemId },
        data: { status: 'ARCHIVED' },
      });
    }

    const updated = await prisma.report.update({
      where: { id: report.id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    });

    res.json({ message: 'Moderasi laporan berhasil disimpan.', data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/payouts
 * List seller withdrawal requests.
 */
adminRouter.get('/payouts', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const payouts = await prisma.payout.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    res.json({ data: payouts });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/payouts/:id
 * Approve or complete payout withdrawal request.
 */
adminRouter.patch('/payouts/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, adminNotes } = req.body;

    const updated = await prisma.payout.update({
      where: { id: req.params.id },
      data: {
        status, // APPROVED, REJECTED, COMPLETED
        adminNotes: adminNotes || null,
        processedAt: ['APPROVED', 'COMPLETED'].includes(status) ? new Date() : null,
      },
    });

    res.json({ message: `Pencairan dana diperbarui menjadi ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
});
