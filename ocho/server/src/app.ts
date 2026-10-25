import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './routes/health';
import { configRouter } from './routes/config';
import { categoriesRouter } from './routes/categories';
import { itemsRouter } from './routes/items';
import { campusesRouter } from './routes/campuses';
import { openApiSpec } from './docs/openapi';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger API Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Routes
  app.use('/api/health', healthRouter);
  app.use('/api/config', configRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/items', itemsRouter);
  app.use('/api/campuses', campusesRouter);

  // Root welcome
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Ocho API',
      description: 'Marketplace Mahasiswa Unpad - REST API Engine',
      docs: '/api/docs',
      health: '/api/health',
    });
  });

  // 404 Not Found
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'Endpoint tidak ditemukan.',
    });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada server.' : err.message,
    });
  });

  return app;
}
