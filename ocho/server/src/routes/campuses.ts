import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

export const campusesRouter = Router();

campusesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campuses = await prisma.campus.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        emailDomains: true,
      },
    });

    res.json({
      data: campuses.map((c) => ({
        ...c,
        emailDomains: c.emailDomains.split(',').map((d) => d.trim()),
      })),
    });
  } catch (err) {
    next(err);
  }
});
