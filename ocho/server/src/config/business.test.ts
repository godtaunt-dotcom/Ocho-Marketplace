import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  isAllowedCampusEmail,
  checkProhibitedContent,
} from './business';

test('calculateOrderTotals: 20% commission borne by seller, correct payout', () => {
  // Test case from docs/business-rules.md:
  // Harga Rp50.000, komisi Rp10.000, penjual menerima Rp40.000
  const resultPickup = calculateOrderTotals({
    itemPriceRupiah: 50000,
    deliveryMethod: 'PICKUP',
  });

  assert.equal(resultPickup.itemPrice, 50000);
  assert.equal(resultPickup.commission, 10000);
  assert.equal(resultPickup.sellerPayout, 40000);
  assert.equal(resultPickup.deliveryFee, 0);
  assert.equal(resultPickup.buyerTotal, 50000);
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

test('isAllowedCampusEmail: correctly verifies unpad domains', () => {
  assert.equal(isAllowedCampusEmail('student@mail.unpad.ac.id'), true);
  assert.equal(isAllowedCampusEmail('dosen@unpad.ac.id'), true);
  assert.equal(isAllowedCampusEmail('random@gmail.com'), false);
  assert.equal(isAllowedCampusEmail('fraud@unpad.fake.com'), false);
});

test('checkProhibitedContent: detects vape and prohibited keywords', () => {
  assert.equal(checkProhibitedContent('Jual vape second pod').prohibited, true);
  assert.equal(checkProhibitedContent('Buku kalkulus edisi 9').prohibited, false);
});
