import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { users, sessions } from '../db/schema.js';
import { verifyPassword, generateToken } from '../lib/crypto.js';

const SESSION_COOKIE_NAME = 'composito_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export function createAuthRoutes(db: Database) {
  const app = new Hono();

  /**
   * POST /auth/login
   * Body: { email: string, password: string }
   */
  app.post('/login', async (c) => {
    try {
      const body = await c.req.json<{ email?: string; password?: string }>();

      if (!body.email || !body.password) {
        return c.json({ error: 'Email and password required' }, 400);
      }

      // Find user by email
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email.toLowerCase().trim()))
        .limit(1);

      if (userResults.length === 0) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const user = userResults[0]!;

      // Verify password
      const isValid = await verifyPassword(body.password, user.passwordHash);

      if (!isValid) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

      await db.insert(sessions).values({
        token,
        userId: user.id,
        expiresAt,
      });

      // Set cookie
      setCookie(c, SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      return c.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  /**
   * POST /auth/logout
   */
  app.post('/logout', async (c) => {
    try {
      const token = getCookie(c, SESSION_COOKIE_NAME);

      if (token) {
        // Delete session from database
        await db.delete(sessions).where(eq(sessions.token, token));
      }

      // Clear cookie
      deleteCookie(c, SESSION_COOKIE_NAME, {
        path: '/',
      });

      return c.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  /**
   * GET /auth/me
   * Returns current user if authenticated
   */
  app.get('/me', (c) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ user: null });
    }

    return c.json({ user });
  });

  return app;
}
