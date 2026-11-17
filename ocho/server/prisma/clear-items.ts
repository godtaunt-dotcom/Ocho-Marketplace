import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Menghapus semua data barang fiktif...');

  const reviews = await prisma.review.deleteMany();
  console.log(`✓ Review dihapus: ${reviews.count}`);

  const payments = await prisma.payment.deleteMany();
  console.log(`✓ Payment dihapus: ${payments.count}`);

  const ledger = await prisma.sellerBalanceEntry.deleteMany();
  console.log(`✓ SellerBalanceEntry dihapus: ${ledger.count}`);

  const orders = await prisma.order.deleteMany();
  console.log(`✓ Order dihapus: ${orders.count}`);

  const photos = await prisma.itemPhoto.deleteMany();
  console.log(`✓ ItemPhoto dihapus: ${photos.count}`);

  const reports = await prisma.report.deleteMany();
  console.log(`✓ Report dihapus: ${reports.count}`);

  const items = await prisma.item.deleteMany();
  console.log(`✓ Item dihapus: ${items.count}`);

  console.log('\n✅ Semua barang fiktif berhasil dihapus!');
  console.log('Database sekarang bersih — siap untuk barang asli.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
