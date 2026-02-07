import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { sessions, users, type User } from '../db/schema.js';

export interface SessionUser {
  id: number;
  email: string;
  role: 'tc_member' | 'subcommittee' | 'public';
}

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser | null;
  }
}

const SESSION_COOKIE_NAME = 'composito_session';

/**
 * Session middleware that validates session tokens and loads user data.
 * Sets `c.get('user')` if valid session exists.
 */
export function sessionMiddleware(db: Database) {
  return async (c: Context, next: Next) => {
    const token = getCookie(c, SESSION_COOKIE_NAME);

    if (!token) {
      c.set('user', null);
      return next();
    }

    try {
      // Fetch session with user
      const result = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.token, token))
        .limit(1);

      if (result.length === 0) {
        c.set('user', null);
        return next();
      }

      const { session, user } = result[0]!;

      // Check if session expired
      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await db.delete(sessions).where(eq(sessions.id, session.id));
        c.set('user', null);
        return next();
      }

      // Set user in context
      c.set('user', {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return next();
    } catch (error) {
      console.error('Session middleware error:', error);
      c.set('user', null);
      return next();
    }
  };
}

/**
 * Auth guard middleware - requires authenticated user.
 * Returns 401 if no valid session.
 */
export function requireAuth() {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return next();
  };
}

/**
 * Role guard middleware - requires specific role.
 */
export function requireRole(...roles: SessionUser['role'][]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return next();
  };
}
