# 🧩 Composito

A website to visualize, maintain, and serve as the authoritative source for [CCTS](https://docs.oasis-open.org/ubl/csd01-UBL-2.5/UBL-2.5.html#D-4-THE-CCTS-SPECIFICATION-OF-UBL-BUSINESS-INFORMATION-ENTITIES)-based semantic models, starting with [UBL (Universal Business Language)](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=ubl), replacing the current Google Sheets workflow.

**Website**: [composito.eu](https://composito.eu)

## Goals

- **Visualize** data models and entity relationships
- **Edit** with change tracking and approval workflows for non-technical users
- **Export** GeneriCode (GC) XML files for existing publishing pipelines

## Status

Initial scaffolding complete. See [.claude/CLAUDE.md](.claude/CLAUDE.md) for full project context and [analysis/](analysis/) for research progress.

## Tech Stack

- **Framework**: [Hono](https://hono.dev) - Lightweight edge-native TypeScript web framework
- **Database**: Bunny Database (SQLite-compatible, libSQL)
- **ORM**: [Drizzle](https://orm.drizzle.team) with type-safe schema
- **Runtime**: Bunny Edge Scripting (Deno-based isolates)
- **Auth**: Email/password with Web Crypto API (PBKDF2)
- **Testing**: Vitest with in-memory SQLite
- **Bundling**: esbuild

See [docs/architecture.md](docs/architecture.md) for full architecture details.

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for edge deployment
npm run build

# Local development server
npm run dev
```

### Project Structure

```
src/
  index.ts              # Hono app entry point
  routes/
    auth.ts             # Login/logout/session routes
    api.ts              # API routes (placeholder)
  db/
    schema.ts           # Drizzle schema (users + sessions)
    client.ts           # Database client (env-based driver switching)
  middleware/
    session.ts          # Session middleware
  lib/
    crypto.ts           # Password hashing (Web Crypto PBKDF2)
test/                   # Vitest tests
scripts/                # Migration and utility scripts
```

### API Routes

- `GET /` - Health check
- `GET /health` - Health status JSON
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout and clear session
- `GET /auth/me` - Get current user

## Deployment

Deployment to staging.composito.eu is configured via GitHub Actions CI (`.github/workflows/ci.yml`). Manual deployment to Bunny Edge Scripting requires:

1. Bunny.net resources provisioned via Terraform (separate IaC repo)
2. Environment variables:
   - `DATABASE_URL` - Bunny Database connection URL
   - `DATABASE_AUTH_TOKEN` - Bunny Database auth token
3. Upload `dist/index.bundle.js` to Bunny Edge Scripting

## Next Steps

- [ ] Implement BIE data model (ABIEs, BBIEs, ASBIEs)
- [ ] Build visualization UI
- [ ] Add GeneriCode XML export
- [ ] Deploy to staging.composito.eu
- [ ] Set up E2E tests with Playwright
