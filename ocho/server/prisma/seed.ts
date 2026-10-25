import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';
import { createSvgPlaceholder } from '../src/utils/placeholderImage';
import { calculateOrderTotals } from '../src/config/business';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ocho database seeding...');

  // 1. Clear existing data
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.sellerBalanceEntry.deleteMany();
  await prisma.order.deleteMany();
  await prisma.itemPhoto.deleteMany();
  await prisma.report.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.user.deleteMany();
  await prisma.campus.deleteMany();

  // 2. Campus
  const campus = await prisma.campus.create({
    data: {
      name: 'Universitas Padjadjaran',
      code: 'UNPAD',
      emailDomains: 'mail.unpad.ac.id,unpad.ac.id',
      isActive: true,
    },
  });
  console.log(`✅ Campus created: ${campus.name} (${campus.code})`);

  // 3. Users (1 Admin + 5 Verified Students)
  const defaultPassword = hashPassword('Password123!');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mail.unpad.ac.id',
      passwordHash: defaultPassword,
      name: 'Admin Ocho Unpad',
      phone: '081234567890',
      role: 'ADMIN',
      isVerified: true,
      verificationMethod: 'CAMPUS_EMAIL',
      verifiedAt: new Date(),
      campusId: campus.id,
    },
  });

  const rian = await prisma.user.create({
    data: {
      email: 'rian.pratama@mail.unpad.ac.id',
      passwordHash: defaultPassword,
      name: 'Rian Pratama (FEB 22)',
      phone: '081298765432',
      role: 'STUDENT',
      isVerified: true,
      verificationMethod: 'CAMPUS_EMAIL',
      verifiedAt: new Date(),
      campusId: campus.id,
    },
  });

  const nadhira = await prisma.user.create({
    data: {
      email: 'nadhira.azzahra@mail.unpad.ac.id',
      passwordHash: defaultPassword,
      name: 'Nadhira Az-Zahra (Fikom 23)',
      phone: '081345678901',
      role: 'STUDENT',
      isVerified: true,
      verificationMethod: 'CAMPUS_EMAIL',
      verifiedAt: new Date(),
      campusId: campus.id,
    },
  });

  const fajar = await prisma.user.create({
    data: {
      email: 'fajar.hidayat@mail.unpad.ac.id',
      passwordHash: defaultPassword,
      name: 'Fajar Hidayat (FTIP 21)',
      phone: '081456789012',
      role: 'STUDENT',
      isVerified: true,
      verificationMethod: 'CAMPUS_EMAIL',
      verifiedAt: new Date(),
      campusId: campus.id,
    },
  });

  const syifa = await prisma.user.create({
    data: {
      email: 'syifa.rahmania@mail.unpad.ac.id',
      passwordHash: defaultPassword,
      name: 'Syifa Rahmania (FMIPA 23)',
      phone: '081567890123',
      role: 'STUDENT',
      isVerified: true,
      verificationMethod: 'CAMPUS_EMAIL',
      verifiedAt: new Date(),
      campusId: campus.id,
    },
  });

  const bima = await prisma.user.create({
    data: {
      email: 'bima.sakti@mail.unpad.ac.id',
      passwordHash: defaultPassword,
      name: 'Bima Sakti (FH 24)',
      phone: '081678901234',
      role: 'STUDENT',
      isVerified: true,
      verificationMethod: 'CAMPUS_EMAIL',
      verifiedAt: new Date(),
      campusId: campus.id,
    },
  });
  console.log(`✅ Users created: 1 Admin + 5 Verified Students`);

  // 4. Categories (6 core categories)
  const categoriesData = [
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Baju, kemeja, jaket, celana, sepatu, tas, aksesori kuliah',
      icon: 'Shirt',
      allowedDelivery: 'PICKUP_OR_DELIVERY',
      requiresSize: true,
      requiresCondition: true,
      displayOrder: 1,
    },
    {
      name: 'Perabot Kos',
      slug: 'perabot-kos',
      description: 'Kasur, lemari, meja belajar, rak sepatu (hanya pickup)',
      icon: 'Bed',
      allowedDelivery: 'PICKUP_ONLY',
      requiresSize: false,
      requiresCondition: true,
      displayOrder: 2,
    },
    {
      name: 'Elektronik & Peralatan Listrik',
      slug: 'elektronik',
      description: 'Kipas angin, setrika, rice cooker, lampu belajar (gadget dilarang)',
      icon: 'Zap',
      allowedDelivery: 'PICKUP_OR_DELIVERY',
      requiresSize: false,
      requiresCondition: true,
      displayOrder: 3,
    },
    {
      name: 'Dapur & Peralatan Rumah',
      slug: 'dapur-rumah',
      description: 'Dispenser, wajan, piring mangkok, alat masak anak kos',
      icon: 'Utensils',
      allowedDelivery: 'PICKUP_OR_DELIVERY',
      requiresSize: false,
      requiresCondition: true,
      displayOrder: 4,
    },
    {
      name: 'Buku & Perlengkapan Kuliah',
      slug: 'buku-kuliah',
      description: 'Buku teks, jas lab Unpad, kalkulator scientific, alat tulis',
      icon: 'BookOpen',
      allowedDelivery: 'PICKUP_OR_DELIVERY',
      requiresSize: false,
      requiresCondition: true,
      displayOrder: 5,
    },
    {
      name: 'Paket Pindahan',
      slug: 'paket-pindahan',
      description: 'Bundling hemat beberapa perabot kos sekaligus (hanya pickup)',
      icon: 'Package',
      allowedDelivery: 'PICKUP_ONLY',
      requiresSize: false,
      requiresCondition: true,
      displayOrder: 6,
    },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.create({ data: c });
    catMap[c.slug] = created.id;
  }
  console.log(`✅ 6 Categories created`);

  // 5. Items (24 realistic items)
  const itemsData = [
    // --- FASHION ---
    {
      sellerId: nadhira.id,
      categoryId: catMap['fashion'],
      title: 'Kemeja Flanel Uniqlo Kotak Hijau',
      description: 'Kemeja flanel lengan panjang Uniqlo size L original. Kondisi mulus jarang pakai, kain lembut cocok buat kuliah sehari-hari di Jatinangor yang adem.',
      priceRupiah: 75000,
      condition: 'BEKAS_BAIK',
      size: 'L',
      brand: 'Uniqlo',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Pondok Kusuma Jatinangor / Gerlam Unpad',
      bgColor: '#E6F4EA',
      textColor: '#137333',
    },
    {
      sellerId: rian.id,
      categoryId: catMap['fashion'],
      title: 'Jaket Hoodie H&M Abu-Abu Basic',
      description: 'Hoodie H&M abu-abu ukuran XL tebal dan nyaman. Tidak ada noda atau robek, resleting aman. Pas buat jalan malam ke Ciseke.',
      priceRupiah: 95000,
      condition: 'BEKAS_BAIK',
      size: 'XL',
      brand: 'H&M',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Kos Griya Hegarmanah Jatinangor',
      bgColor: '#F1F3F4',
      textColor: '#3C4043',
    },
    {
      sellerId: rian.id,
      categoryId: catMap['fashion'],
      title: 'Sepatu Compass Gazelle Low Black White',
      description: 'Sepatu Compass Gazelle size 42 original lengkap dengan box. Pemakaian wajar untuk ngampus di FEB, sol masih sangat tebal.',
      priceRupiah: 180000,
      condition: 'BEKAS_BAIK',
      size: '42',
      brand: 'Compass',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Kantin FEB Unpad / Pondok Sukawening',
      bgColor: '#E8EAED',
      textColor: '#202124',
    },
    {
      sellerId: nadhira.id,
      categoryId: catMap['fashion'],
      title: 'Totebag Kanvas Unpad Resmi Cokelat',
      description: 'Totebag kanvas resmi merchandise Unpad warna cokelat khaki. Muat laptop dan buku tebal, ada resleting dalam.',
      priceRupiah: 35000,
      condition: 'SEPERTI_BARU',
      size: 'One Size',
      brand: 'Merchandise Unpad',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Depan Rektorat Unpad / Gerlam',
      bgColor: '#FEF7E0',
      textColor: '#B06000',
    },

    // --- PERABOT KOS (PICKUP ONLY) ---
    {
      sellerId: fajar.id,
      categoryId: catMap['perabot-kos'],
      title: 'Kasur Busa Single Inoac 90x200x15cm',
      description: 'Kasur busa Inoac asli masih sangat kenyal tidak kempes. Sudah termasuk sprei katun motif kotak. Wajib pickup di kos karena sudah mau lulus.',
      priceRupiah: 220000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Kos Pondok Barokah Hegarmanah Jatinangor',
      bgColor: '#E8F0FE',
      textColor: '#1A73E8',
    },
    {
      sellerId: fajar.id,
      categoryId: catMap['perabot-kos'],
      title: 'Meja Belajar Lipat Kayu Minimalis',
      description: 'Meja lipat kayu kokoh ukuran 60x40cm dengan slot tablet/hp dan tempat gelas. Sangat praktis untuk kos kamar kecil.',
      priceRupiah: 65000,
      condition: 'SEPERTI_BARU',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Pondok Kusuma Sayang Jatinangor',
      bgColor: '#FCE8E6',
      textColor: '#C5221F',
    },
    {
      sellerId: syifa.id,
      categoryId: catMap['perabot-kos'],
      title: 'Rak Sepatu Plastik 4 Susun Kokoh',
      description: 'Rak sepatu plastik 4 tingkat warna abu-abu. Muat sampai 12 pasang sepatu/sandal. Mudah dibongkar pasang.',
      priceRupiah: 40000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Kos Putri Sukawening Jatinangor',
      bgColor: '#E6F4EA',
      textColor: '#137333',
    },
    {
      sellerId: fajar.id,
      categoryId: catMap['perabot-kos'],
      title: 'Cermin Berdiri Standing Mirror Kayu 150cm',
      description: 'Standing mirror full body frame kayu pinus natural tinggi 150cm lebar 35cm. Kaca bening jernih tanpa cacat.',
      priceRupiah: 110000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Apartemen Pinewood Tower B Jatinangor',
      bgColor: '#F3E8FD',
      textColor: '#8430CE',
    },

    // --- ELEKTRONIK & PERALATAN LISTRIK ---
    {
      sellerId: rian.id,
      categoryId: catMap['elektronik'],
      title: 'Kipas Angin Berdiri Miyako 16 Inch',
      description: 'Kipas angin berdiri Miyako KAS-1618B. 3 pilihan kecepatan, angin kencang dan suara mesin halus. Kabel dan baling-baling bersih.',
      priceRupiah: 140000,
      condition: 'BEKAS_BAIK',
      brand: 'Miyako',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Kos Griya Hegarmanah / Gerlam',
      bgColor: '#E1F5FE',
      textColor: '#0277BD',
    },
    {
      sellerId: syifa.id,
      categoryId: catMap['elektronik'],
      title: 'Rice Cooker Mini Miyako 0.6L PSG-607',
      description: 'Penanak nasi mini hemat listrik hanya 300W. Pas untuk masak 1-2 porsi anak kos. Panci teflon anti lengket masih mulus.',
      priceRupiah: 115000,
      condition: 'BEKAS_BAIK',
      brand: 'Miyako',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Pondok Melati Sayang Jatinangor',
      bgColor: '#FFF3E0',
      textColor: '#E65100',
    },
    {
      sellerId: nadhira.id,
      categoryId: catMap['elektronik'],
      title: 'Setrika Maspion Anti Lengket HA-110',
      description: 'Setrika kering Maspion daya 350W pengatur suhu normal. Panas cepat merata dan kabel putar 360 derajat.',
      priceRupiah: 60000,
      condition: 'BEKAS_BAIK',
      brand: 'Maspion',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Pondok Kusuma Jatinangor',
      bgColor: '#EFEBE9',
      textColor: '#4E342E',
    },
    {
      sellerId: syifa.id,
      categoryId: catMap['elektronik'],
      title: 'Lampu Meja Belajar LED USB Fleksibel',
      description: 'Lampu LED meja belajar leher angsa fleksibel, 3 tingkat kecerahan touch control, colokan USB hemat baterai.',
      priceRupiah: 30000,
      condition: 'SEPERTI_BARU',
      brand: 'Baseus',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'FMIPA Unpad / Caringin',
      bgColor: '#E8F5E9',
      textColor: '#2E7D32',
    },

    // --- DAPUR & PERALATAN RUMAH ---
    {
      sellerId: nadhira.id,
      categoryId: catMap['dapur-rumah'],
      title: 'Dispenser Air Miyako Mini Panas & Normal',
      description: 'Dispenser mini hemat tempat type WD-185H. Fungsi air panas masih sangat berfungsi bagus untuk bikin kopi dan mie instan malam hari.',
      priceRupiah: 85000,
      condition: 'BEKAS_BAIK',
      brand: 'Miyako',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Kos Putri Sukawening Jatinangor',
      bgColor: '#E0F2F1',
      textColor: '#00695C',
    },
    {
      sellerId: nadhira.id,
      categoryId: catMap['dapur-rumah'],
      title: 'Wajan Teflon Maxim 24cm + Spatula Kayu',
      description: 'Wajan penggorengan frypan Maxim anti lengket diameter 24cm bonus spatula kayu mahoni. Lapisan teflon masih mulus terawat.',
      priceRupiah: 55000,
      condition: 'BEKAS_BAIK',
      brand: 'Maxim',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Pondok Kusuma / Gerlam',
      bgColor: '#FBE9E7',
      textColor: '#D84315',
    },
    {
      sellerId: syifa.id,
      categoryId: catMap['dapur-rumah'],
      title: 'Set Piring & Mangkok Keramik Putih 6 Pcs',
      description: 'Set alat makan: 2 piring makan, 2 mangkok mie/sup, 2 sendok garpu stainless. Bersih kinclong tidak ada gompal.',
      priceRupiah: 45000,
      condition: 'SEPERTI_BARU',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Pondok Melati Sayang Jatinangor',
      bgColor: '#F9FBE7',
      textColor: '#827717',
    },
    {
      sellerId: rian.id,
      categoryId: catMap['dapur-rumah'],
      title: 'Blender Portable USB Deerma Juice Cup',
      description: 'Blender mini portable praktis dicas tipe-C. Mata pisau baja 4 bilah tajam, bisa buat bikin jus buah segar di kos.',
      priceRupiah: 45000,
      condition: 'SEPERTI_BARU',
      brand: 'Deerma',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Kos Griya Hegarmanah',
      bgColor: '#FFF8E1',
      textColor: '#F57F17',
    },

    // --- BUKU & PERLENGKAPAN KULIAH ---
    {
      sellerId: syifa.id,
      categoryId: catMap['buku-kuliah'],
      title: 'Buku Kalkulus Jilid 1 Edisi 9 - Purcell',
      description: 'Buku wajib kalkulus TPB Unpad edisi ke-9 bahasa Indonesia. Halaman lengkap, ada sedikit coretan pensil rapi catatan kuliah.',
      priceRupiah: 70000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Perpustakaan CISRAL Unpad Jatinangor',
      bgColor: '#EDE7F6',
      textColor: '#4527A0',
    },
    {
      sellerId: rian.id,
      categoryId: catMap['buku-kuliah'],
      title: 'Pengantar Teori Ekonomi Mikro - Sadono Sukirno',
      description: 'Buku referensi ekonomi mikro FEB Unpad. Edisi ketiga original Rajawali Pers. Kertas bersih tidak ada lipatan robek.',
      priceRupiah: 50000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Gedung C FEB Unpad Jatinangor',
      bgColor: '#E8EAF6',
      textColor: '#283593',
    },
    {
      sellerId: syifa.id,
      categoryId: catMap['buku-kuliah'],
      title: 'Jas Laboratorium Kimia/Farmasi Unpad Size L',
      description: 'Jas lab putih lengan panjang bahan drill tebal standar K3 laboratorium Unpad. Bersih wangi sudah dicuci laundry, kancing lengkap.',
      priceRupiah: 45000,
      condition: 'BEKAS_BAIK',
      size: 'L',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'FMIPA / Farmasi Unpad',
      bgColor: '#E0F7FA',
      textColor: '#006064',
    },
    {
      sellerId: fajar.id,
      categoryId: catMap['buku-kuliah'],
      title: 'Kalkulator Scientific Casio fx-991EX ClassWiz Original',
      description: 'Kalkulator ilmiah Casio 552 fungsi display resolusi tinggi. Sangat berguna untuk ujian Statistika dan Keteknikan. Baterai masih awet.',
      priceRupiah: 175000,
      condition: 'SEPERTI_BARU',
      brand: 'Casio',
      allowedDeliveryMethod: 'PICKUP_OR_DELIVERY',
      pickupLocation: 'Fakultas Teknologi Industri Pertanian (FTIP) Unpad',
      bgColor: '#ECEFF1',
      textColor: '#263238',
    },

    // --- PAKET PINDAHAN (PICKUP ONLY) ---
    {
      sellerId: fajar.id,
      categoryId: catMap['paket-pindahan'],
      title: 'Paket Kamar Kos Lengkap (Kasur + Bantal + Kipas + Meja)',
      description: 'Bundling alumni lulusan Unpad: Kasur busa 90x200 + Bantal dacron + Kipas angin Miyako + Meja belajar lipat. Ambil semua sekaligus lebih hemat!',
      priceRupiah: 350000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Kos Pondok Barokah Hegarmanah Jatinangor',
      bgColor: '#FFFDE7',
      textColor: '#F57F17',
    },
    {
      sellerId: fajar.id,
      categoryId: catMap['paket-pindahan'],
      title: 'Paket Masak Anak Kos (Wajan + Panci Mie + Teko + Spatula)',
      description: 'Paket starter masak hemat: Wajan teflon 20cm, panci mie rebus stainless, teko pemanas air, plus 2 pasang sendok makan.',
      priceRupiah: 95000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Pondok Kusuma Sayang Jatinangor',
      bgColor: '#FCE4EC',
      textColor: '#880E4F',
    },
    {
      sellerId: fajar.id,
      categoryId: catMap['paket-pindahan'],
      title: 'Paket Organisasi Belajar (Rak Buku 3 Tingkat + Lampu LED)',
      description: 'Bundling meja belajar rapi: Rak susun kayu partikel 3 tingkat + lampu meja LED fleksibel putih + papan memo gabus dinding.',
      priceRupiah: 85000,
      condition: 'SEPERTI_BARU',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Apartemen Taman Melati Tower A Jatinangor',
      bgColor: '#E8F5E9',
      textColor: '#1B5E20',
    },
    {
      sellerId: fajar.id,
      categoryId: catMap['paket-pindahan'],
      title: 'Paket Kebersihan Kos (Sapu Ijuk + Pel Lantai + Ember Lipat)',
      description: 'Satu set alat kebersihan kamar kos: sapu ijuk Dragon, pel lantai microfiber, ember silikon lipat hemat tempat, dan pengki plastik.',
      priceRupiah: 35000,
      condition: 'BEKAS_BAIK',
      allowedDeliveryMethod: 'PICKUP_ONLY',
      pickupLocation: 'Kos Griya Asri Hegarmanah',
      bgColor: '#F3E5F5',
      textColor: '#4A148C',
    },
  ];

  const createdItems = [];
  for (const item of itemsData) {
    const { bgColor, textColor, ...itemProps } = item;
    const catName = categoriesData.find((c) => c.slug === Object.keys(catMap).find((k) => catMap[k] === itemProps.categoryId))?.name || 'Preloved';

    const photoUrl = createSvgPlaceholder({
      title: itemProps.title,
      category: catName,
      bgColor,
      textColor,
    });

    const created = await prisma.item.create({
      data: {
        ...itemProps,
        status: 'ACTIVE',
        photos: {
          create: [
            {
              url: photoUrl,
              isPrimary: true,
              displayOrder: 0,
            },
          ],
        },
      },
    });
    createdItems.push(created);
  }
  console.log(`✅ ${createdItems.length} Preloved Items created with styled SVG photos`);

  // 6. Create 1 Completed Order & Ledger Entry (to verify financial math & reviews)
  // Let's create an order where Syifa bought an item from Rian
  const sampleSoldItem = createdItems[0]; // Kemeja Flanel Uniqlo (Rp 75.000)
  // Mark item as SOLD
  await prisma.item.update({
    where: { id: sampleSoldItem.id },
    data: { status: 'SOLD' },
  });

  const totals = calculateOrderTotals({
    itemPriceRupiah: sampleSoldItem.priceRupiah,
    deliveryMethod: 'DELIVERY',
    isFirstOrder: false,
  });

  const completedOrder = await prisma.order.create({
    data: {
      orderNumber: 'OCH-20261023-0001',
      buyerId: syifa.id,
      sellerId: sampleSoldItem.sellerId,
      itemId: sampleSoldItem.id,
      itemPriceRupiah: totals.itemPrice,
      commissionRupiah: totals.commission,
      sellerPayoutRupiah: totals.sellerPayout,
      deliveryFeeRupiah: totals.deliveryFee,
      buyerTotalRupiah: totals.buyerTotal,
      deliveryMethod: 'DELIVERY',
      deliveryAddress: 'Kos Pondok Melati Kamar 12, Jl. Sayang No. 45 Jatinangor',
      buyerPhone: syifa.phone || '081567890123',
      paymentMethod: 'QRIS',
      status: 'COMPLETED',
      notes: 'Tolong titip di ibu kos kalau belum sampai.',
      payment: {
        create: {
          gateway: 'MOCK_QRIS',
          paymentType: 'QRIS',
          transactionId: 'TRX-QRIS-20261023-0001',
          amountRupiah: totals.buyerTotal,
          qrString: '00020101021226580016ID.CO.QRIS.WWW01189360000000000000005204541153033605802ID5912OCHO UNPAD6010JATINANGOR6304A1B2',
          status: 'SETTLED',
          settledAt: new Date(Date.now() - 3600000 * 24),
        },
      },
      review: {
        create: {
          buyerId: syifa.id,
          sellerId: sampleSoldItem.sellerId,
          rating: 5,
          comment: 'Kemejanya masih wangi dan bagus banget! Pengantaran Ocho gercep banget ke kos Sayang.',
        },
      },
      balanceEntry: {
        create: {
          sellerId: sampleSoldItem.sellerId,
          type: 'CREDIT_SALE',
          amountRupiah: totals.sellerPayout,
          balanceAfterRupiah: totals.sellerPayout,
          description: `Penjualan ${sampleSoldItem.title} (#OCH-20261023-0001)`,
        },
      },
    },
  });
  console.log(`✅ 1 Completed Order created with settled payment, review, and seller balance ledger entry: ${completedOrder.orderNumber}`);

  // 7. Create 1 Active QRIS Order with holding period (30 min timeout)
  const sampleReservedItem = createdItems[1]; // Jaket Hoodie H&M (Rp 95.000)
  await prisma.item.update({
    where: { id: sampleReservedItem.id },
    data: { status: 'RESERVED' },
  });

  const reservedTotals = calculateOrderTotals({
    itemPriceRupiah: sampleReservedItem.priceRupiah,
    deliveryMethod: 'PICKUP',
    isFirstOrder: true,
  });

  const reservedOrder = await prisma.order.create({
    data: {
      orderNumber: 'OCH-20261023-0002',
      buyerId: bima.id,
      sellerId: sampleReservedItem.sellerId,
      itemId: sampleReservedItem.id,
      itemPriceRupiah: reservedTotals.itemPrice,
      commissionRupiah: reservedTotals.commission,
      sellerPayoutRupiah: reservedTotals.sellerPayout,
      deliveryFeeRupiah: reservedTotals.deliveryFee,
      buyerTotalRupiah: reservedTotals.buyerTotal,
      deliveryMethod: 'PICKUP',
      buyerPhone: bima.phone || '081678901234',
      paymentMethod: 'QRIS',
      status: 'PENDING_PAYMENT',
      reservedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes in future
      payment: {
        create: {
          gateway: 'MOCK_QRIS',
          paymentType: 'QRIS',
          amountRupiah: reservedTotals.buyerTotal,
          qrString: '00020101021226580016ID.CO.QRIS.WWW01189360000000000000005204541153033605802ID5912OCHO UNPAD6010JATINANGOR6304C3D4',
          status: 'PENDING',
        },
      },
    },
  });
  console.log(`✅ 1 Reserved QRIS Order created with 30-min holding timer: ${reservedOrder.orderNumber}`);

  console.log('🎉 Ocho database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
