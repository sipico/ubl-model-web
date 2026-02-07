/**
 * Password hashing utilities using Web Crypto API (PBKDF2).
 * Compatible with edge runtimes (no Node.js crypto).
 */

const ITERATIONS = 100000;
const HASH_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

/**
 * Hashes a password using PBKDF2.
 * Returns a string in format: salt:hash (both base64-encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive hash using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8 // bits
  );

  // Encode to base64
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return `${saltB64}:${hashB64}`;
}

/**
 * Verifies a password against a hash.
 * @param password - Plain text password
 * @param storedHash - Hash in format: salt:hash (base64-encoded)
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltB64, expectedHashB64] = storedHash.split(':');
  if (!saltB64 || !expectedHashB64) {
    return false;
  }

  // Decode salt from base64
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive hash using same parameters
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  // Constant-time comparison
  return timingSafeEqual(hashB64, expectedHashB64);
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generates a cryptographically secure random token.
 * Returns base64-encoded string.
 */
export function generateToken(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...bytes));
}
