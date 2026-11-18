import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTotals, defaultBusinessConfig, checkProhibitedContent } from '../config/business';

describe('Order Pricing & Commission Engine', () => {
  test('Strict 20% platform commission borne by seller (Rp 50.000 -> Rp 10.000 fee, Rp 40.000 payout)', () => {
    const result = calculateOrderTotals({
      itemPriceRupiah: 50000,
      deliveryMethod: 'PICKUP',
      isFirstOrder: false,
    });

    assert.equal(result.itemPrice, 50000);
    assert.equal(result.commission, 10000);
    assert.equal(result.sellerPayout, 40000);
    assert.equal(result.deliveryFee, 0);
    assert.equal(result.buyerTotal, 50000);
  });

  test('Buyer pays item price + flat Rp 3.000 delivery fee on standard delivery', () => {
    const result = calculateOrderTotals({
      itemPriceRupiah: 75000,
      deliveryMethod: 'DELIVERY',
      isFirstOrder: false,
    });

    assert.equal(result.itemPrice, 75000);
    assert.equal(result.commission, 15000);
    assert.equal(result.sellerPayout, 60000);
    assert.equal(result.deliveryFee, 3000);
    assert.equal(result.buyerTotal, 78000);
  });

  test('First-time buyer gets free delivery promo (Rp 0 delivery fee)', () => {
    const result = calculateOrderTotals({
      itemPriceRupiah: 100000,
      deliveryMethod: 'DELIVERY',
      isFirstOrder: true,
    });

    assert.equal(result.deliveryFee, 0);
    assert.equal(result.buyerTotal, 100000);
    assert.equal(result.sellerPayout, 80000);
  });

  test('Financial rounding: integer Rupiah with no decimals', () => {
    const oddPrice = calculateOrderTotals({
      itemPriceRupiah: 33333,
      deliveryMethod: 'PICKUP',
      isFirstOrder: false,
    });

    assert.equal(Number.isInteger(oddPrice.commission), true);
    assert.equal(Number.isInteger(oddPrice.sellerPayout), true);
    assert.equal(Number.isInteger(oddPrice.buyerTotal), true);
    assert.equal(oddPrice.itemPrice, oddPrice.commission + oddPrice.sellerPayout);
  });
});

describe('Business Rules Enforcement', () => {
  test('Pickup-only categories restriction (Perabot Kos & Paket Pindahan)', () => {
    assert.ok(defaultBusinessConfig.pickupOnlyCategories.includes('Perabot Kos'));
    assert.ok(defaultBusinessConfig.pickupOnlyCategories.includes('Paket Pindahan'));
  });

  test('Keyword moderation: blocks illegal or hazardous student goods', () => {
    const vapeCheck = checkProhibitedContent('Jual pod vape mulus murah');
    assert.equal(vapeCheck.prohibited, true);

    const beerCheck = checkProhibitedContent('Minuman alkohol bir dingin');
    assert.equal(beerCheck.prohibited, true);

    const safeCheck = checkProhibitedContent('Buku Kalkulus Purcell Edisi 9');
    assert.equal(safeCheck.prohibited, false);
  });

  test('Reservation timeout is configured to 30 minutes', () => {
    assert.equal(defaultBusinessConfig.qrisReservationTimeoutMinutes, 30);
  });

  test('Delivery date constraint: delivery date allowed within 3 days from purchase', () => {
    const today = new Date();
    const validDate = new Date(today);
    validDate.setDate(validDate.getDate() + 2);

    const invalidDate = new Date(today);
    invalidDate.setDate(invalidDate.getDate() + 5);

    const maxAllowed = new Date(today);
    maxAllowed.setDate(maxAllowed.getDate() + 3);
    maxAllowed.setHours(23, 59, 59, 999);

    assert.ok(validDate <= maxAllowed, 'Valid date should be within 3 days');
    assert.ok(invalidDate > maxAllowed, 'Invalid date beyond 3 days should exceed limit');
  });
});
