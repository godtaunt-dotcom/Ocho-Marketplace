import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = process.env.HOST || '0.0.0.0';
const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`[Ocho Server] Berjalan di http://${HOST}:${PORT}`);
  console.log(`[Ocho Server] Dokumentasi API: http://${HOST}:${PORT}/api/docs`);
  console.log(`[Ocho Server] Healthcheck: http://${HOST}:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Ocho Server] Menerima sinyal SIGTERM, menutup koneksi...');
  server.close(() => {
    console.log('[Ocho Server] Server ditutup dengan aman.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Ocho Server] Menerima sinyal SIGINT (Ctrl+C), keluar...');
  server.close(() => {
    process.exit(0);
  });
});
