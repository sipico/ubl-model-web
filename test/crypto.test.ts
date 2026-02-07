import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateToken } from '../src/lib/crypto.js';

describe('Password Hashing', () => {
  it('should hash a password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);

    expect(hash).toBeTruthy();
    expect(hash).toContain(':'); // Should contain salt:hash separator
    expect(hash.split(':').length).toBe(2);
  });

  it('should verify correct password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword('wrong', hash);

    expect(isValid).toBe(false);
  });

  it('should generate different hashes for same password', async () => {
    const password = 'test123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2); // Different salts
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });

  it('should handle invalid hash format', async () => {
    const isValid = await verifyPassword('test', 'invalid');
    expect(isValid).toBe(false);
  });
});

describe('Token Generation', () => {
  it('should generate a random token', () => {
    const token = generateToken();

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('should generate different tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();

    expect(token1).not.toBe(token2);
  });

  it('should respect length parameter', () => {
    const token16 = generateToken(16);
    const token32 = generateToken(32);

    expect(token16.length).toBeLessThan(token32.length);
  });
});
