import crypto from 'node:crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  isVerified: boolean;
  exp: number; // unix timestamp in ms
}

const DEFAULT_SECRET = 'ocho-campus-dev-secret-key-change-in-prod-min-32-chars';

function getSecretKey(): Buffer {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || DEFAULT_SECRET;
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Creates an HMAC-SHA256 signed bearer token without external dependencies.
 * Format: base64url(payload).base64url(signature)
 */
export function createToken(
  payload: Omit<TokenPayload, 'exp'>,
  expiresInMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + expiresInMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and parses an HMAC-SHA256 signed bearer token.
 * Returns null if token is tampered, invalid format, or expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadB64)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(signature, 'base64url');
    const expectedBuf = Buffer.from(expectedSignature, 'base64url');
    if (sigBuf.length !== expectedBuf.length) return null;

    const isSignatureValid = crypto.timingSafeEqual(sigBuf, expectedBuf);
    if (!isSignatureValid) return null;

    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as any;

    if (!decoded || (!decoded.userId && !decoded.id)) {
      return null;
    }

    if (!decoded.userId && decoded.id) {
      decoded.userId = decoded.id;
    }

    if (!decoded.exp || Date.now() > decoded.exp) {
      return null; // Expired
    }

    return decoded as TokenPayload;
  } catch {
    return null;
  }
}
