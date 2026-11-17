import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  isAllowedCampusEmail,
  checkProhibitedContent,
} from './business';

test('calculateOrderTotals: standard prices (50000 -> 10000 -> 40000, 45000 -> 9000 -> 36000)', () => {
  // Test case 1: Harga Rp50.000 -> komisi Rp10.000 -> penjual menerima Rp40.000
  const order50k = calculateOrderTotals({
    itemPriceRupiah: 50000,
    deliveryMethod: 'PICKUP',
  });
  assert.equal(order50k.itemPrice, 50000);
  assert.equal(order50k.commission, 10000);
  assert.equal(order50k.sellerPayout, 40000);
  assert.equal(order50k.buyerTotal, 50000);
  assert.equal(Number.isInteger(order50k.commission), true);
  assert.equal(Number.isInteger(order50k.sellerPayout), true);

  // Test case 2: Harga Rp45.000 -> komisi Rp9.000 -> penjual menerima Rp36.000
  const order45k = calculateOrderTotals({
    itemPriceRupiah: 45000,
    deliveryMethod: 'PICKUP',
  });
  assert.equal(order45k.itemPrice, 45000);
  assert.equal(order45k.commission, 9000);
  assert.equal(order45k.sellerPayout, 36000);
  assert.equal(order45k.buyerTotal, 45000);
  assert.equal(Number.isInteger(order45k.commission), true);
  assert.equal(Number.isInteger(order45k.sellerPayout), true);
});

test('calculateOrderTotals: handles fractional prices with round-to-nearest integer Rupiah', () => {
  // Test case 3: Harga Rp10.001 -> 10.001 * 0.20 = 2000.2 -> komisi dibulatkan ke Rp2.000
  const orderFraction = calculateOrderTotals({
    itemPriceRupiah: 10001,
    deliveryMethod: 'PICKUP',
  });
  assert.equal(orderFraction.itemPrice, 10001);
  assert.equal(orderFraction.commission, 2000);
  assert.equal(orderFraction.sellerPayout, 8001);
  assert.equal(orderFraction.commission + orderFraction.sellerPayout, 10001);
  assert.equal(Number.isInteger(orderFraction.commission), true);
  assert.equal(Number.isInteger(orderFraction.sellerPayout), true);

  // Test case 3b: Harga Rp10.003 -> 10.003 * 0.20 = 2000.6 -> komisi dibulatkan ke Rp2.001
  const orderFractionUp = calculateOrderTotals({
    itemPriceRupiah: 10003,
    deliveryMethod: 'PICKUP',
  });
  assert.equal(orderFractionUp.commission, 2001);
  assert.equal(orderFractionUp.sellerPayout, 8002);
  assert.equal(orderFractionUp.commission + orderFractionUp.sellerPayout, 10003);
});

test('calculateOrderTotals: delivery fee added to buyer total', () => {
  const resultDelivery = calculateOrderTotals({
    itemPriceRupiah: 50000,
    deliveryMethod: 'DELIVERY',
    isFirstOrder: false,
  });

  assert.equal(resultDelivery.itemPrice, 50000);
  assert.equal(resultDelivery.commission, 10000);
  assert.equal(resultDelivery.sellerPayout, 40000);
  assert.equal(resultDelivery.deliveryFee, 3000);
  assert.equal(resultDelivery.buyerTotal, 53000);
});

test('calculateOrderTotals: first order has free delivery', () => {
  const resultFirstOrder = calculateOrderTotals({
    itemPriceRupiah: 50000,
    deliveryMethod: 'DELIVERY',
    isFirstOrder: true,
  });

  assert.equal(resultFirstOrder.deliveryFee, 0);
  assert.equal(resultFirstOrder.buyerTotal, 50000);
});

test('isAllowedCampusEmail: verifies exact student domain and rejects malicious lookalikes', () => {
  // Valid student domain
  assert.equal(isAllowedCampusEmail('student@mail.unpad.ac.id'), true);
  assert.equal(isAllowedCampusEmail('RIAN.2023@MAIL.UNPAD.AC.ID'), true);

  // Exact matching tests explicitly requested by user
  assert.equal(isAllowedCampusEmail('x@evil-unpad.ac.id'), false);
  assert.equal(isAllowedCampusEmail('x@mail.unpad.ac.id.evil.com'), false);

  // Default excludes unpad.ac.id (only mail.unpad.ac.id is default for students)
  assert.equal(isAllowedCampusEmail('dosen@unpad.ac.id'), false);
  assert.equal(isAllowedCampusEmail('random@gmail.com'), false);

  // Optional domain via configuration / env
  const withStaffDomain = ['mail.unpad.ac.id', 'unpad.ac.id'];
  assert.equal(isAllowedCampusEmail('dosen@unpad.ac.id', withStaffDomain), true);
  assert.equal(isAllowedCampusEmail('x@evil-unpad.ac.id', withStaffDomain), false);
  assert.equal(isAllowedCampusEmail('x@mail.unpad.ac.id.evil.com', withStaffDomain), false);
});

test('checkProhibitedContent: detects rokok, vape, alkohol, obat, and suplemen', () => {
  assert.equal(checkProhibitedContent('Jual vape second pod').prohibited, true);
  assert.equal(checkProhibitedContent('Sisa rokok filter').prohibited, true);
  assert.equal(checkProhibitedContent('Minuman alkohol impor').prohibited, true);
  assert.equal(checkProhibitedContent('Jual sisa obat flu resep dokter').prohibited, true);
  assert.equal(checkProhibitedContent('Suplemen gym protein').prohibited, true);
  assert.equal(checkProhibitedContent('Buku kalkulus edisi 9 original').prohibited, false);
});
