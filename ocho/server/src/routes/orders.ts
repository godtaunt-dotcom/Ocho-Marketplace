import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { calculateOrderTotals, defaultBusinessConfig } from '../config/business';
import { defaultPaymentProvider, settleOrderPayment, releaseExpiredReservations } from '../services/payment';

export const ordersRouter = Router();

const createOrderSchema = z.object({
  itemId: z.string().uuid('ID barang tidak valid'),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY'], {
    errorMap: () => ({ message: 'Pilih metode pengantaran: PICKUP atau DELIVERY' }),
  }),
  paymentMethod: z.enum(['QRIS', 'COD'], {
    errorMap: () => ({ message: 'Pilih metode pembayaran: QRIS atau COD' }),
  }),
  deliveryAddress: z.string().max(300).optional().nullable(),
  buyerPhone: z.string().min(8, 'Nomor WhatsApp minimal 8 karakter').max(20),
  notes: z.string().max(200).optional().nullable(),
});

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `OCH-${dateStr}-${randomPart}`;
}

/**
 * POST /api/orders
 * Create an order for a preloved item.
 */
ordersRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const buyer = req.user!;
    const body = createOrderSchema.parse(req.body);

    // 1. Release any expired reservations first to ensure fresh inventory
    await releaseExpiredReservations();

    // 2. Fetch item with category and seller
    const item = await prisma.item.findUnique({
      where: { id: body.itemId },
      include: {
        category: true,
        seller: true,
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Not Found', message: 'Barang tidak ditemukan.' });
      return;
    }

    if (item.status !== 'ACTIVE') {
      res.status(400).json({
        error: 'Item Unavailable',
        message: item.status === 'RESERVED'
          ? 'Barang ini sedang di-reserve oleh pembeli lain. Silakan cek lagi nanti.'
          : 'Barang ini sudah terjual atau tidak tersedia lagi.',
      });
      return;
    }

    // 3. Rule: Cannot buy own item
    if (item.sellerId === buyer.id) {
      res.status(400).json({
        error: 'Invalid Action',
        message: 'Anda tidak dapat membeli barang milik sendiri.',
      });
      return;
    }

    // 4. Rule: Category allowed delivery
    if (item.allowedDeliveryMethod === 'PICKUP_ONLY' && body.deliveryMethod === 'DELIVERY') {
      res.status(400).json({
        error: 'Invalid Delivery Method',
        message: `Kategori ${item.category.name} hanya mendukung pengambilan mandiri (Pickup) karena ukuran/berat barang.`,
      });
      return;
    }

    // 5. Rule: COD is ONLY allowed if delivery method is DELIVERY
    if (body.paymentMethod === 'COD' && body.deliveryMethod !== 'DELIVERY') {
      res.status(400).json({
        error: 'Invalid Payment Method',
        message: 'Metode COD (Bayar di Tempat) hanya tersedia untuk pengantaran oleh Tim Ocho, bukan untuk Pickup.',
      });
      return;
    }

    // 6. Delivery address required for delivery
    if (body.deliveryMethod === 'DELIVERY' && (!body.deliveryAddress || !body.deliveryAddress.trim())) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Alamat pengantaran (nama kos / gedung) wajib diisi untuk opsi antar.',
      });
      return;
    }

    // 7. Check if buyer qualifies for first-order free delivery
    const priorCompletedOrdersCount = await prisma.order.count({
      where: {
        buyerId: buyer.id,
        status: { in: ['PAID', 'PROCESSING', 'READY_FOR_PICKUP', 'ON_DELIVERY', 'COMPLETED'] },
      },
    });
    const isFirstOrder = priorCompletedOrdersCount === 0;

    // 8. Financial calculation (100% integer Rupiah)
    const totals = calculateOrderTotals({
      itemPriceRupiah: item.priceRupiah,
      deliveryMethod: body.deliveryMethod,
      isFirstOrder,
    });

    // 9. Reserve expiration (30 minutes for QRIS)
    const reservedUntil = body.paymentMethod === 'QRIS'
      ? new Date(Date.now() + defaultBusinessConfig.qrisReservationTimeoutMinutes * 60 * 1000)
      : null;

    const orderNumber = generateOrderNumber();

    // 10. Generate payment details via Payment Provider adapter
    const paymentInfo = await defaultPaymentProvider.createPayment({
      orderId: '', // populated in transaction
      orderNumber,
      amountRupiah: totals.buyerTotal,
      paymentMethod: body.paymentMethod,
      customerName: buyer.name,
      customerEmail: buyer.email,
    });

    // 11. Atomic database transaction: Create Order + Payment and mark item RESERVED
    const initialStatus = body.paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING_PAYMENT';

    const order = await prisma.$transaction(async (tx) => {
      // Mark item RESERVED
      await tx.item.update({
        where: { id: item.id },
        data: { status: 'RESERVED' },
      });

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: buyer.id,
          sellerId: item.sellerId,
          itemId: item.id,
          itemPriceRupiah: totals.itemPrice,
          commissionRupiah: totals.commission,
          sellerPayoutRupiah: totals.sellerPayout,
          deliveryFeeRupiah: totals.deliveryFee,
          buyerTotalRupiah: totals.buyerTotal,
          deliveryMethod: body.deliveryMethod,
          deliveryAddress: body.deliveryAddress ? body.deliveryAddress.trim() : null,
          buyerPhone: body.buyerPhone.trim(),
          paymentMethod: body.paymentMethod,
          status: initialStatus,
          reservedUntil,
          notes: body.notes ? body.notes.trim() : null,
          payment: {
            create: {
              gateway: paymentInfo.gateway,
              paymentType: paymentInfo.paymentType,
              transactionId: paymentInfo.transactionId,
              amountRupiah: paymentInfo.amountRupiah,
              qrString: paymentInfo.qrString || null,
              status: paymentInfo.status,
            },
          },
        },
        include: {
          item: {
            include: { photos: true, category: true },
          },
          seller: {
            select: { id: true, name: true, phone: true, isVerified: true },
          },
          buyer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          payment: true,
        },
      });

      return createdOrder;
    });

    res.status(201).json({
      message: body.paymentMethod === 'QRIS'
        ? 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran QRIS dalam 30 menit.'
        : 'Pesanan COD berhasil dibuat. Tim kurir Ocho akan segera memproses pengantaran.',
      data: order,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: err.errors[0]?.message || 'Data pesanan tidak valid.',
        details: err.errors,
      });
      return;
    }
    next(err);
  }
});

/**
 * GET /api/orders
 * List orders for current user (as buyer or seller).
 */
ordersRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const role = (req.query.role as string) || 'all'; // 'buyer' | 'seller' | 'all'
    const status = req.query.status as string;

    // Release any expired reservations
    await releaseExpiredReservations();

    const where: Record<string, unknown> = {};

    if (role === 'buyer') {
      where.buyerId = user.id;
    } else if (role === 'seller') {
      where.sellerId = user.id;
    } else {
      where.OR = [{ buyerId: user.id }, { sellerId: user.id }];
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          include: {
            photos: { take: 1, select: { url: true } },
            category: { select: { name: true } },
          },
        },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        payment: true,
        review: true,
      },
    });

    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id
 * Get single order details with full relations.
 */
ordersRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        item: {
          include: { photos: true, category: true },
        },
        seller: {
          select: { id: true, name: true, phone: true, isVerified: true, email: true },
        },
        buyer: {
          select: { id: true, name: true, phone: true, isVerified: true, email: true },
        },
        payment: true,
        review: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Pesanan tidak ditemukan.' });
      return;
    }

    // Only buyer, seller, or admin can view order
    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden', message: 'Anda tidak memiliki akses ke pesanan ini.' });
      return;
    }

    res.json({ data: order });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/orders/:id/status
 * Transition order status (PROCESSING, READY_FOR_PICKUP, ON_DELIVERY, CANCELLED).
 */
ordersRouter.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { status } = req.body;

    const validStatuses = ['PROCESSING', 'READY_FOR_PICKUP', 'ON_DELIVERY', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Bad Request', message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { item: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Pesanan tidak ditemukan.' });
      return;
    }

    const isSeller = order.sellerId === user.id;
    const isBuyer = order.buyerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isSeller && !isBuyer && !isAdmin) {
      res.status(403).json({ error: 'Forbidden', message: 'Akses ditolak.' });
      return;
    }

    // Cancellation logic
    if (status === 'CANCELLED') {
      if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
        res.status(400).json({ error: 'Bad Request', message: 'Pesanan yang sudah selesai atau batal tidak dapat dibatalkan.' });
        return;
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        }),
        prisma.item.update({
          where: { id: order.itemId },
          data: { status: 'ACTIVE' },
        }),
      ]);

      res.json({ message: 'Pesanan dibatalkan dan barang telah dirilis kembali ke marketplace.' });
      return;
    }

    // Status advances
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
    });

    res.json({ message: `Status pesanan diperbarui menjadi ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders/:id/receive
 * Buyer confirms receipt of item. Marks order COMPLETED, item SOLD, and credits seller balance ledger.
 */
ordersRouter.post('/:id/receive', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { item: true, seller: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Pesanan tidak ditemukan.' });
      return;
    }

    // Only buyer or admin can confirm receipt
    if (order.buyerId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden', message: 'Hanya pembeli yang dapat mengonfirmasi penerimaan barang.' });
      return;
    }

    if (order.status === 'COMPLETED') {
      res.status(400).json({ error: 'Bad Request', message: 'Pesanan ini sudah berstatus selesai sebelumnya.' });
      return;
    }

    // Get current seller balance
    const lastBalanceEntry = await prisma.sellerBalanceEntry.findFirst({
      where: { sellerId: order.sellerId },
      orderBy: { createdAt: 'desc' },
    });
    const currentBalance = lastBalanceEntry ? lastBalanceEntry.balanceAfterRupiah : 0;
    const newBalance = currentBalance + order.sellerPayoutRupiah;

    // Transaction: Complete Order, Mark item SOLD, and Add Ledger Credit Entry
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });

      await tx.item.update({
        where: { id: order.itemId },
        data: { status: 'SOLD' },
      });

      const balanceEntry = await tx.sellerBalanceEntry.create({
        data: {
          sellerId: order.sellerId,
          orderId: order.id,
          type: 'CREDIT_SALE',
          amountRupiah: order.sellerPayoutRupiah,
          balanceAfterRupiah: newBalance,
          description: `Penjualan ${order.item.title} (#${order.orderNumber})`,
        },
      });

      return { order: updatedOrder, balanceEntry };
    });

    res.json({
      message: 'Barang berhasil dikonfirmasi diterima! Dana hasil penjualan telah masuk ke saldo penjual.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders/:id/pay-simulate
 * Sandbox QRIS payment simulation helper for testing.
 */
ordersRouter.post('/:id/pay-simulate', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const success = await settleOrderPayment(req.params.id);
    if (!success) {
      res.status(400).json({ error: 'Bad Request', message: 'Gagal menyelesaikan simulasi pembayaran.' });
      return;
    }

    res.json({
      message: 'Pembayaran QRIS berhasil diselesaikan (Mode Sandbox Ocho).',
      status: 'PAID',
    });
  } catch (err) {
    next(err);
  }
});
