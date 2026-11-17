import test from 'node:test';
import assert from 'node:assert/strict';
import { createToken, verifyToken } from './token';
import { hashPassword, verifyPassword } from './auth';

test('scrypt password hash & verification', () => {
  const pwd = 'RahasiaMahasiswa123!';
  const hashed = hashPassword(pwd);

  assert.equal(typeof hashed, 'string');
  assert.equal(hashed.includes(':'), true);
  assert.equal(verifyPassword(pwd, hashed), true);
  assert.equal(verifyPassword('WrongPassword!', hashed), false);
});

test('bearer token creation, verification, and tamper rejection', () => {
  const token = createToken({
    userId: 'user-unpad-1',
    email: 'rian@mail.unpad.ac.id',
    role: 'STUDENT',
    isVerified: true,
  });

  assert.equal(typeof token, 'string');
  assert.equal(token.split('.').length, 2);

  const payload = verifyToken(token);
  assert.ok(payload);
  assert.equal(payload.userId, 'user-unpad-1');
  assert.equal(payload.email, 'rian@mail.unpad.ac.id');
  assert.equal(payload.role, 'STUDENT');
  assert.equal(payload.isVerified, true);
  assert.ok(payload.exp > Date.now());

  // Tampered payload rejection
  const [pB64, sig] = token.split('.');
  const rawPayload = JSON.parse(Buffer.from(pB64, 'base64url').toString('utf-8'));
  rawPayload.userId = 'evil-admin';
  const tamperedPayloadB64 = Buffer.from(JSON.stringify(rawPayload)).toString('base64url');
  const tampered = `${tamperedPayloadB64}.${sig}`;
  assert.equal(verifyToken(tampered), null);

  // Expired token rejection
  const expiredToken = createToken(
    {
      userId: 'user-old',
      email: 'old@mail.unpad.ac.id',
      role: 'STUDENT',
      isVerified: true,
    },
    -1000 // Expired 1 second ago
  );
  assert.equal(verifyToken(expiredToken), null);
});
