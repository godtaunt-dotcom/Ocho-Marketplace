import { prisma } from '../db';
import crypto from 'crypto';

export interface PaymentCreationResult {
  gateway: string;
  paymentType: 'QRIS' | 'COD';
  transactionId: string;
  amountRupiah: number;
  qrString?: string;
  status: 'PENDING' | 'SETTLED';
}

/**
 * Payment Provider Adapter Interface.
 * Allows seamless switching between Mock QRIS Sandbox, Midtrans, or Xendit.
 */
export interface PaymentProvider {
  name: string;
  createPayment(params: {
    orderId: string;
    orderNumber: string;
    amountRupiah: number;
    paymentMethod: 'QRIS' | 'COD';
    customerName: string;
    customerEmail: string;
  }): Promise<PaymentCreationResult>;

  verifyWebhookSignature(payload: unknown, signature?: string): boolean;
}

/**
 * Mock QRIS Sandbox Provider for Ocho Unpad Marketplace.
 * Generates standard-compliant EMVCo QR strings and sandbox transactions.
 */
export class MockQrisPaymentProvider implements PaymentProvider {
  name = 'MOCK_QRIS';

  async createPayment(params: {
    orderId: string;
    orderNumber: string;
    amountRupiah: number;
    paymentMethod: 'QRIS' | 'COD';
    customerName?: string;
    customerEmail?: string;
  }): Promise<PaymentCreationResult> {
    const transactionId = `TRX-${params.paymentMethod}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (params.paymentMethod === 'COD') {
      return {
        gateway: 'COD_CASH',
        paymentType: 'COD',
        transactionId,
        amountRupiah: params.amountRupiah,
        status: 'PENDING',
      };
    }

    // Realistic QRIS EMVCo QR String format
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const qrString = `00020101021226580016ID.CO.QRIS.WWW01189360000000000000005204541153033605802ID5912OCHO UNPAD6010JATINANGOR6304${randomHex}`;

    return {
      gateway: 'MOCK_QRIS',
      paymentType: 'QRIS',
      transactionId,
      amountRupiah: params.amountRupiah,
      qrString,
      status: 'PENDING',
    };
  }

  verifyWebhookSignature(_payload: unknown, _signature?: string): boolean {
    // In sandbox, accept verified webhooks
    return true;
  }
}

export const defaultPaymentProvider = new MockQrisPaymentProvider();

/**
 * Sweeper: Checks for unpaid QRIS orders whose 30-minute reservation has expired.
 * Automatically marks order CANCELLED, payment EXPIRED, and releases item back to ACTIVE.
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      paymentMethod: 'QRIS',
      reservedUntil: { lt: now },
    },
    include: { item: true },
  });

  for (const order of expiredOrders) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.payment.updateMany({
        where: { orderId: order.id, status: 'PENDING' },
        data: { status: 'EXPIRED' },
      }),
      prisma.item.update({
        where: { id: order.itemId },
        data: { status: 'ACTIVE' },
      }),
    ]);
  }

  return expiredOrders.length;
}

/**
 * Simulates settlement of an order payment (used by testing UI and sandbox webhook).
 */
export async function settleOrderPayment(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, item: true },
  });

  if (!order || !order.payment) return false;
  if (order.payment.status === 'SETTLED') return true; // Idempotent

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: 'SETTLED',
        settledAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
      },
    }),
  ]);

  return true;
}
