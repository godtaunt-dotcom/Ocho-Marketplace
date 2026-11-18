import serverless from 'serverless-http';
import { createApp } from '../../ocho/server/src/app';

const app = createApp();
const serverlessHandler = serverless(app, { binary: ['image/*'] });

export const handler = async (event: any, context: any) => {
  // Normalize path if Netlify strips or includes function prefix
  if (event.path) {
    let cleanPath = event.path.replace(/^\/\.netlify\/functions\/api/, '');
    if (!cleanPath.startsWith('/api')) {
      cleanPath = `/api${cleanPath}`;
    }
    event.path = cleanPath;
  }
  return serverlessHandler(event, context);
};
