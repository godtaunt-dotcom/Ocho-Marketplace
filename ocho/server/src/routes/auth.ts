import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../utils/auth';
import { createToken } from '../utils/token';
import { isAllowedCampusEmail, resolveAllowedEmailDomains } from '../config/business';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateUsername } from '../utils/username';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase().trim(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  username: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase().trim(),
  password: z.string().min(1, 'Password wajib diisi'),
});

const verifyEmailSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase().trim(),
  verificationCode: z.string().optional().default('123456'), // Simulates email verification code / link
});

/**
 * POST /api/auth/register
 * Register a student account with strict campus domain validation.
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // Validate email domain strictly against allowed campus domains (default mail.unpad.ac.id)
    const allowedDomains = resolveAllowedEmailDomains();
    if (!isAllowedCampusEmail(data.email, allowedDomains)) {
      res.status(400).json({
        error: 'Bad Request',
        message: `Pendaftaran Ocho hanya untuk mahasiswa Unpad dengan domain: ${allowedDomains.join(', ')}.`,
      });
      return;
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Email kampus ini sudah terdaftar. Silakan masuk.',
      });
      return;
    }

    // Find default Unpad campus
    const unpad = await prisma.campus.findUnique({
      where: { code: 'UNPAD' },
    });

    // Hash password using native scrypt
    const passwordHash = hashPassword(data.password);

    // Validate or auto-generate unique campus username
    let finalUsername: string | null = null;
    if (data.username && data.username.trim()) {
      const v = validateUsername(data.username);
      if (!v.valid) {
        res.status(400).json({ error: 'Bad Request', message: v.message });
        return;
      }
      const taken = await prisma.user.findUnique({ where: { username: v.normalizedUsername } });
      if (taken) {
        res.status(409).json({ error: 'Conflict', message: 'Username sudah digunakan oleh mahasiswa lain. Silakan pilih username lain.' });
        return;
      }
      finalUsername = v.normalizedUsername!;
    } else {
      const base = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      let candidate = base.length >= 3 ? base.slice(0, 20) : `mhs_${base}`;
      const exists = await prisma.user.findUnique({ where: { username: candidate } });
      if (exists) {
        candidate = `${candidate.slice(0, 16)}_${Math.floor(10 + Math.random() * 89)}`;
      }
      finalUsername = candidate;
    }

    // Strategy A: Automatically mark as verified via campus email link, or pending verification
    // Default: Created as verified since campus email ownership is verified via link
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: finalUsername,
        passwordHash,
        name: data.name,
        phone: data.phone || null,
        role: 'STUDENT',
        isVerified: true, // Strategy A auto-verification on campus email registration
        verificationMethod: 'CAMPUS_EMAIL',
        verifiedAt: new Date(),
        campusId: unpad ? unpad.id : null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        verificationMethod: true,
        createdAt: true,
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });

    res.status(201).json({
      message: 'Pendaftaran berhasil. Akun mahasiswa Unpad terverifikasi.',
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: err.errors[0]?.message || 'Data pendaftaran tidak valid.',
        details: err.errors,
      });
      return;
    }
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Log in with email and password.
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        campus: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Email atau password salah.',
      });
      return;
    }

    const isValidPassword = verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Email atau password salah.',
      });
      return;
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });

    res.json({
      message: 'Login berhasil.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          verificationMethod: user.verificationMethod,
          campus: user.campus,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: err.errors[0]?.message || 'Input login tidak valid.',
      });
      return;
    }
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Sesi tidak ditemukan.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        campus: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            sellingItems: true,
            buyerOrders: true,
            sellerOrders: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'Pengguna tidak ditemukan.' });
      return;
    }

    res.json({
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
        verificationMethod: user.verificationMethod,
        verifiedAt: user.verifiedAt,
        campus: user.campus,
        createdAt: user.createdAt,
        stats: {
          itemsCount: user._count.sellingItems,
          boughtOrdersCount: user._count.buyerOrders,
          soldOrdersCount: user._count.sellerOrders,
          reviewsCount: user._count.reviewsReceived,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/auth/username
 * Set or change custom username with anti-SARA / anti-racism moderation.
 */
authRouter.patch('/username', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rawUsername = req.body?.username;
    const v = validateUsername(rawUsername);
    if (!v.valid) {
      res.status(400).json({ error: 'Bad Request', message: v.message });
      return;
    }

    const normalized = v.normalizedUsername!;

    // Check if taken by another user
    const taken = await prisma.user.findFirst({
      where: {
        username: normalized,
        id: { not: req.user!.id },
      },
    });

    if (taken) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Username ini sudah digunakan oleh mahasiswa lain. Silakan pilih username lain.',
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { username: normalized },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    res.json({
      message: 'Username berhasil diperbarui!',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify-email
 * Verifies email address with verification token/link simulation.
 */
authRouter.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = verifyEmailSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'Pengguna tidak ditemukan.' });
      return;
    }

    if (user.isVerified) {
      res.json({ message: 'Email sudah terverifikasi sebelumnya.', data: { isVerified: true } });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationMethod: 'CAMPUS_EMAIL',
        verifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        verificationMethod: true,
      },
    });

    res.json({
      message: 'Email kampus berhasil diverifikasi. Lencana terverifikasi aktif.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});
