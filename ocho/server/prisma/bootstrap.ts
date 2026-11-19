/**
 * Idempotent production bootstrap: creates the campus, core categories and the admin
 * account if they do not exist yet. Never deletes or overwrites existing data
 * and never creates dummy items.
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

const categories = [
  { name: 'Fashion', slug: 'fashion', description: 'Baju, kemeja, jaket, celana, sepatu, tas, aksesori kuliah', icon: 'Shirt', allowedDelivery: 'PICKUP_OR_DELIVERY', requiresSize: true, requiresCondition: true, displayOrder: 1 },
  { name: 'Perabot Kos', slug: 'perabot-kos', description: 'Kasur, lemari, meja belajar, rak sepatu (hanya pickup)', icon: 'Bed', allowedDelivery: 'PICKUP_ONLY', requiresSize: false, requiresCondition: true, displayOrder: 2 },
  { name: 'Elektronik & Peralatan Listrik', slug: 'elektronik', description: 'Kipas angin, setrika, rice cooker, lampu belajar (gadget dilarang)', icon: 'Zap', allowedDelivery: 'PICKUP_OR_DELIVERY', requiresSize: false, requiresCondition: true, displayOrder: 3 },
  { name: 'Dapur & Peralatan Rumah', slug: 'dapur-rumah', description: 'Dispenser, wajan, piring mangkok, alat masak anak kos', icon: 'Utensils', allowedDelivery: 'PICKUP_OR_DELIVERY', requiresSize: false, requiresCondition: true, displayOrder: 4 },
  { name: 'Buku & Perlengkapan Kuliah', slug: 'buku-kuliah', description: 'Buku teks, jas lab Unpad, kalkulator scientific, alat tulis', icon: 'BookOpen', allowedDelivery: 'PICKUP_OR_DELIVERY', requiresSize: false, requiresCondition: true, displayOrder: 5 },
  { name: 'Paket Pindahan', slug: 'paket-pindahan', description: 'Bundling hemat beberapa perabot kos sekaligus (hanya pickup)', icon: 'Package', allowedDelivery: 'PICKUP_ONLY', requiresSize: false, requiresCondition: true, displayOrder: 6 },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('[bootstrap] DATABASE_URL tidak diatur, dilewati.');
    return;
  }

  let campus = await prisma.campus.findUnique({ where: { code: 'UNPAD' } });
  if (!campus) {
    campus = await prisma.campus.create({
      data: { name: 'Universitas Padjadjaran', code: 'UNPAD', emailDomains: 'mail.unpad.ac.id,unpad.ac.id', isActive: true },
    });
    console.log('[bootstrap] Campus UNPAD dibuat');
  }

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log('[bootstrap] Kategori siap');

  const adminEmail = 'admin@mail.unpad.ac.id';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const password = process.env.ADMIN_PASSWORD;

  if (!admin) {
    if (!password || password.length < 8) {
      console.warn('[bootstrap] ADMIN_PASSWORD belum diatur (min. 8 karakter), akun admin dilewati.');
      return;
    }
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashPassword(password),
        name: 'Admin Ocho Unpad',
        phone: '081234567890',
        role: 'ADMIN',
        isVerified: true,
        verificationMethod: 'CAMPUS_EMAIL',
        verifiedAt: new Date(),
        campusId: campus.id,
      },
    });
    console.log('[bootstrap] Akun admin dibuat');
  } else if (password && password.length >= 8) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash: hashPassword(password),
      },
    });
    console.log('[bootstrap] Password akun admin diselaraskan dengan ADMIN_PASSWORD');
  }
  }
}

main()
  .catch((e) => {
    console.error('[bootstrap] Gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
