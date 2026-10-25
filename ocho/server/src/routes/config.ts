import { Router, Request, Response } from 'express';
import { defaultBusinessConfig } from '../config/business';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  // Expose safe public configuration to clients
  res.json({
    platformCommissionRate: defaultBusinessConfig.platformCommissionRate,
    standardDeliveryFeeRupiah: defaultBusinessConfig.standardDeliveryFeeRupiah,
    minOrderForDeliveryRupiah: defaultBusinessConfig.minOrderForDeliveryRupiah,
    firstOrderFreeDelivery: defaultBusinessConfig.firstOrderFreeDelivery,
    allowedEmailDomains: defaultBusinessConfig.allowedEmailDomains,
    pickupOnlyCategories: defaultBusinessConfig.pickupOnlyCategories,
    forbiddenCategories: defaultBusinessConfig.forbiddenCategories,
  });
});
