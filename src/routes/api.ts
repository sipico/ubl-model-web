import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { requireAuth } from '../middleware/session.js';

/**
 * API routes (placeholder for future implementation)
 */
export function createApiRoutes(db: Database) {
  const app = new Hono();

  // Example protected route
  app.get('/models', requireAuth(), (c) => {
    return c.json({ models: [] });
  });

  return app;
}
