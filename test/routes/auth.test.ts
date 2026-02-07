import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createTestDb } from '../setup.js';
import { createAuthRoutes } from '../../src/routes/auth.js';
import { sessionMiddleware } from '../../src/middleware/session.js';
import { users } from '../../src/db/schema.js';
import { hashPassword } from '../../src/lib/crypto.js';

describe('Auth Routes', () => {
  let app: Hono;
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
    app = new Hono();
    app.use('*', sessionMiddleware(db));
    app.route('/auth', createAuthRoutes(db));
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const passwordHash = await hashPassword('password123');
      await db.insert(users).values({
        email: 'test@example.com',
        passwordHash,
        role: 'tc_member',
      });

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user).toBeDefined();
      expect(json.user.email).toBe('test@example.com');
      expect(json.user.role).toBe('tc_member');

      // Check cookie was set
      const cookies = res.headers.get('set-cookie');
      expect(cookies).toContain('composito_session');
    });

    it('should reject invalid email', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const passwordHash = await hashPassword('password123');
      await db.insert(users).values({
        email: 'test@example.com',
        passwordHash,
        role: 'public',
      });

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Invalid credentials');
    });

    it('should require email and password', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Email and password required');
    });

    it('should normalize email case', async () => {
      const passwordHash = await hashPassword('password123');
      await db.insert(users).values({
        email: 'test@example.com',
        passwordHash,
        role: 'public',
      });

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        }),
      });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout and clear session', async () => {
      // Create user and login first
      const passwordHash = await hashPassword('password123');
      await db.insert(users).values({
        email: 'test@example.com',
        passwordHash,
        role: 'public',
      });

      const loginRes = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const cookies = loginRes.headers.get('set-cookie');
      expect(cookies).toBeTruthy();

      // Logout
      const logoutRes = await app.request('/auth/logout', {
        method: 'POST',
        headers: { Cookie: cookies! },
      });

      expect(logoutRes.status).toBe(200);
      const json = await logoutRes.json();
      expect(json.success).toBe(true);

      // Check cookie was cleared
      const logoutCookies = logoutRes.headers.get('set-cookie');
      expect(logoutCookies).toContain('composito_session=;');
    });

    it('should handle logout without session', async () => {
      const res = await app.request('/auth/logout', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      // Create user and login
      const passwordHash = await hashPassword('password123');
      await db.insert(users).values({
        email: 'test@example.com',
        passwordHash,
        role: 'tc_member',
      });

      const loginRes = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const cookies = loginRes.headers.get('set-cookie');

      // Get current user
      const meRes = await app.request('/auth/me', {
        headers: { Cookie: cookies! },
      });

      expect(meRes.status).toBe(200);
      const json = await meRes.json();
      expect(json.user).toBeDefined();
      expect(json.user.email).toBe('test@example.com');
      expect(json.user.role).toBe('tc_member');
    });

    it('should return null when not authenticated', async () => {
      const res = await app.request('/auth/me');

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.user).toBeNull();
    });
  });
});
