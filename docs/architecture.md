# Architecture

## Platform: bunny.net

All hosting runs on [bunny.net](https://bunny.net) services. Chosen for simplicity, low cost, and global edge performance.

### Services Used

| Service | Purpose | Pricing |
|---------|---------|---------|
| **Edge Scripting** | App backend + serves frontend (TypeScript) | $0.20/M requests + $0.02/1000s CPU |
| **Bunny Database** | SQLite-compatible database for UBL model | $0.30/B rows read, $0.30/M rows written, $0.10/GB/region |
| **Bunny CDN** | Static assets (JS/CSS bundles) | $0.01/GB (EU/NA) |
| **Bunny DNS** | composito.eu DNS | Included with CDN |

**Estimated cost at low traffic**: ~$1-3/month. Bunny Database is free during public preview.

### Why Edge Scripting (not Magic Containers)

- Scales to zero -- no cost when idle
- TypeScript/JS runtime at the edge (Deno-based isolate)
- Direct integration with Bunny Database
- No Docker, no server management
- Good enough for our workload (model editing is low-frequency)

### Limits to be aware of

- 30s CPU time per request (GeneriCode export must stay within this)
- 128MB memory per isolate
- 50 subrequests per script

## Architecture Overview

```
composito.eu / staging.composito.eu
    │
    ├── Bunny DNS
    │
    ├── Bunny CDN (static assets, caching)
    │
    └── Edge Scripting (TypeScript)
        ├── Hono framework (routing, middleware, session management)
        ├── Frontend routes (serves SPA/SSR)
        ├── API routes
        │   ├── /api/models/:id/entities   (CRUD for BIEs)
        │   ├── /api/models/:id/export/gc  (GeneriCode XML export)
        │   └── /api/auth/*                (authentication)
        │
        └── Bunny Database (SQLite via Drizzle ORM)
            ├── BIE model data (ABIEs, BBIEs, ASBIEs)
            ├── Change history / audit log
            └── User accounts & permissions
```

## IaC Boundary

Infrastructure is provisioned via Terraform in a separate repository.

### Terraform (infra repo) manages:
- DNS zone and records (including staging.composito.eu)
- CDN pull zone creation (production + staging)
- Storage zone creation
- SSL certificates
- Bunny Shield / WAF rules
- Account-level configuration
- Database instance creation (production + staging)

### This repo manages:
- Edge Script source code and deployment
- Frontend application source and build
- Database schema and migrations (via Drizzle ORM)
- GeneriCode export logic
- Application configuration
- Backup scripts

The boundary: **Terraform creates the resources, this repo deploys the application onto them.**

## Technology Stack

### Framework: Hono
Lightweight TypeScript web framework built for edge runtimes. Uses only Web Standard APIs (fetch, Request, Response) -- no Node.js dependencies. ~14KB bundled. Provides routing, middleware (CORS, cookies, CSRF, caching), and a built-in test client.

### ORM: Drizzle
TypeScript ORM with first-class libSQL support. ~7KB bundled, zero dependencies, tree-shakeable. Schema defined in TypeScript, auto-generates SQL migration files. Uses `drizzle-orm/libsql/web` (HTTP-only) in production and `drizzle-orm/better-sqlite3` (in-memory SQLite) for tests.

### Database: Bunny Database
Globally distributed SQLite-compatible database built on libSQL. Single-writer architecture with async read replicas in up to 41 regions. Scales to zero when idle. Connected via `@libsql/client/web` SDK (HTTP).

### Authentication: Email/Password (self-contained)
No external auth provider. All auth handled within Edge Scripting + Bunny Database:
- Password hashing via Web Crypto API (PBKDF2)
- Session tokens stored in database, delivered as HTTP-only secure cookies
- Brute-force protection via Bunny Shield (WAF rate limiting)
- MVP: Admin creates accounts manually (small, known user base)
- Later: Password reset via European email service (Brevo or Mailjet)

Roles:
- **TC Member** -- edit model
- **Subcommittee** -- workspace for internal review
- **Public** -- read-only access

## Testing

### Test Pyramid

```
Unit tests (Vitest)
├── Derived column logic (pure functions)
├── GeneriCode XML generation
└── Auth helpers, validation

Integration tests (Vitest + Hono test client)
├── API routes against in-memory SQLite
├── Auth flows
└── No network, no deployment needed

E2E tests (Playwright)
└── Real browser against staging.composito.eu
```

### Local/CI Database for Tests

Drizzle uses the same TypeScript schema with different drivers:

| Environment | Driver | Database |
|-------------|--------|----------|
| **Production** | `drizzle-orm/libsql/web` | Bunny Database (HTTP) |
| **Tests** | `drizzle-orm/better-sqlite3` | In-memory SQLite (`:memory:`) |
| **Local dev** | `@libsql/client` | Local file (`file:local.db`) |

Drizzle's `pushSchema()` creates all tables from TypeScript schema in tests -- no migration files needed, always matches production schema.

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | composito.eu | Live site |
| **Staging** | staging.composito.eu | Pre-release testing |

Each has its own Edge Script deployment and Bunny Database instance. Both provisioned by Terraform, near-zero cost when idle.

### Deployment Flow

```
git push
    │
    └── GitHub Actions CI
        ├── Run unit + integration tests (Vitest)
        ├── Build frontend
        ├── Run database migrations against staging DB (Drizzle)
        ├── Deploy to staging.composito.eu
        ├── Run E2E tests (Playwright) against staging
        │
        └── Manual approval gate (GitHub Environment protection)
            │
            ├── Run database migrations against production DB
            └── Deploy to composito.eu
```

### Copying Production Data to Staging

For testing against real data (with user credentials stripped):

1. CI script queries production DB via `@libsql/client/web`
2. Dumps all model tables (excluding users/sessions)
3. Loads into staging DB
4. Staging DB gets its own test user accounts

The UBL model is small (thousands of rows) -- this takes seconds.

## Database Migrations

### Workflow

1. **Define schema** in TypeScript (`src/db/schema.ts`)
2. **Generate migrations**: `npx drizzle-kit generate` (auto-diffs schema changes → SQL files)
3. **Review SQL** (always review -- SQLite table recreation can cause issues)
4. **Apply in CI**: Migration runner executes in GitHub Actions (Node.js), not in Edge Script

Migration files are stored in `drizzle/` and committed to git:
```
drizzle/
  0000_initial_schema.sql
  0001_add_change_history.sql
  0002_add_user_roles.sql
  meta/
    _journal.json
    0000_snapshot.json
```

### SQLite Gotchas

- Limited `ALTER TABLE` (no drop column before 3.35, no rename constraints)
- Drizzle handles this via table recreation (create new → copy data → drop old → rename)
- **Always review generated SQL** -- table recreation can trigger CASCADE DELETE data loss
- libSQL extends SQLite with additional ALTER support, mitigating some limitations

## Backups

Bunny Database has no built-in backups yet (on roadmap). We handle it ourselves:

### Strategy

1. **Scheduled backup** (GitHub Actions cron, e.g. daily):
   - Query all tables via `@libsql/client/web`
   - Serialize to SQL INSERT statements
   - Store in Bunny Storage zone (or git)

2. **Pre-migration backup**:
   - Automatic dump before every migration in the deploy pipeline
   - Stored as artifacts in GitHub Actions

3. **Embedded replica** (optional):
   - `@libsql/client` supports syncing a local SQLite file from remote
   - Could run on a schedule as an additional offline backup

### Data Portability

Everything is SQLite/libSQL compatible. If we need to move away from Bunny:
- Dump via SDK → load into Turso, self-hosted sqld, or plain SQLite
- Drizzle schema + migrations are vendor-agnostic
- Edge Script TypeScript code works on any isolate runtime (Cloudflare Workers, Deno Deploy)

## Key Design Decisions

### GeneriCode Export at the Edge
The spreadsheet formulas analysis (`analysis/spreadsheet-formulas/findings.md`) shows derived column logic is pure string manipulation -- no heavy computation. GeneriCode XML generation should fit within the 30s CPU limit for any realistic model size.

### SQLite for the Data Model
The UBL model is relatively small (thousands of rows, not millions). SQLite is more than sufficient, and Bunny Database gives us:
- Global read replicas for low latency
- Spins down when idle (cheap)
- Familiar SQL interface
- No connection pooling complexity

### Vendor Risk Mitigation
Bunny Database is new (public preview). The Hacker News community noted bunny.net's non-CDN products have a mixed execution track record. Mitigations:
- All data is SQLite-compatible (portable)
- Drizzle ORM is vendor-agnostic
- Backup strategy ensures we always have our data
- If needed, migrate to Turso (same libSQL protocol) or self-hosted sqld
