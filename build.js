#!/usr/bin/env node
/**
 * Build script for Bunny Edge Scripting deployment.
 *
 * Bundles the Hono app using esbuild, targeting modern edge runtime (Deno-based).
 */

import { build } from 'esbuild';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

try {
  await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.bundle.js',
    format: 'esm',
    target: 'es2022',
    platform: 'neutral', // Edge runtime (not node/browser)
    minify: true,
    sourcemap: true,
    treeShaking: true,
    banner: {
      js: `// Composito v${packageJson.version} - Built ${new Date().toISOString()}`,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production'
      ),
    },
    external: [
      // Dev dependencies not needed in edge runtime
      'better-sqlite3',
      '@hono/node-server',
      'node:*', // All Node.js built-in modules
      'libsql', // Native libsql - we use @libsql/client/web instead
      '@neon-rs/load',
      'detect-libc',
    ],
    logLevel: 'info',
  });

  console.log('✓ Bundle created: dist/index.bundle.js');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
