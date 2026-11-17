import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token';
import { prisma } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    name: string;
  };
}

/**
 * Extracts bearer token from Authorization header.
 * Formats supported: "Bearer <token>" or raw "<token>".
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return authHeader.trim();
}

/**
 * Middleware: Requires a valid bearer token.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Akses ditolak. Silakan login terlebih dahulu.',
    });
    return;
  }

  const payload: TokenPayload | null = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.',
    });
    return;
  }

  // Fetch current user from DB to ensure still active & current verification status
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  });

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Pengguna tidak ditemukan.',
    });
    return;
  }

  req.user = user;
  next();
}

/**
 * Middleware: Requires verified student or admin.
 */
export async function requireVerifiedStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Silakan login terlebih dahulu.',
    });
    return;
  }

  if (!req.user.isVerified && req.user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Akun Anda belum terverifikasi sebagai mahasiswa Unpad. Selesaikan verifikasi email atau KTM terlebih dahulu.',
    });
    return;
  }

  next();
}

/**
 * Middleware: Optional authentication (attaches user if token present, proceeds if guest).
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    return next();
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  });

  if (user) {
    req.user = user;
  }

  next();
}
