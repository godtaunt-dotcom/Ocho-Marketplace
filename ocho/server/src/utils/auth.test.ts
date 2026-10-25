import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from './auth';

test('auth: hashPassword and verifyPassword work correctly', () => {
  const password = 'unpadPassword123!';
  const hashed = hashPassword(password);

  assert.notEqual(hashed, password);
  assert.equal(verifyPassword(password, hashed), true);
  assert.equal(verifyPassword('wrongPassword', hashed), false);
});
