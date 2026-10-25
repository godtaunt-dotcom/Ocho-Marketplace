import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            items: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    res.json({
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        allowedDelivery: cat.allowedDelivery,
        requiresSize: cat.requiresSize,
        requiresCondition: cat.requiresCondition,
        isForbidden: cat.isForbidden,
        displayOrder: cat.displayOrder,
        activeItemCount: cat._count.items,
      })),
    });
  } catch (err) {
    next(err);
  }
});
