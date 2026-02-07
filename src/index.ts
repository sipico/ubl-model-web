import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createDb } from './db/client.js';
import { sessionMiddleware } from './middleware/session.js';
import { createAuthRoutes } from './routes/auth.js';
import { createApiRoutes } from './routes/api.js';

// Create database instance
const db = createDb();

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', sessionMiddleware(db));

// Health check route
app.get('/', (c) => {
  return c.text('Composito is running');
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.route('/auth', createAuthRoutes(db));
app.route('/api', createApiRoutes(db));

// Export for Bunny Edge Scripting
export default app;

// For local development with Node.js
// This code is only executed when running directly with tsx/node
// It's excluded from the edge bundle via esbuild's tree-shaking
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const { serve } = await import('@hono/node-server');
  const port = 3000;
  console.log(`Server running at http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
