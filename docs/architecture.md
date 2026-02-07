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
- TypeScript/JS runtime at the edge
- Direct integration with Bunny Database
- No Docker, no server management
- Good enough for our workload (model editing is low-frequency)

### Limits to be aware of

- 30s CPU time per request (GeneriCode export must stay within this)
- 128MB memory per isolate
- 50 subrequests per script

## Architecture Overview

```
composito.eu
    │
    ├── Bunny DNS
    │
    ├── Bunny CDN (static assets, caching)
    │
    └── Edge Scripting (TypeScript)
        ├── Frontend routes (serves SPA/SSR)
        ├── API routes
        │   ├── /api/models/:id/entities   (CRUD for BIEs)
        │   ├── /api/models/:id/export/gc  (GeneriCode XML export)
        │   └── /api/auth/*                (authentication)
        │
        └── Bunny Database (SQLite)
            ├── BIE model data (ABIEs, BBIEs, ASBIEs)
            ├── Change history / audit log
            └── User accounts & permissions
```

## IaC Boundary

Infrastructure is provisioned via Terraform in a separate repository.

### Terraform (infra repo) manages:
- DNS zone and records
- CDN pull zone creation
- Storage zone creation
- SSL certificates
- Bunny Shield / WAF rules
- Account-level configuration

### This repo manages:
- Edge Script source code and deployment
- Frontend application source and build
- Database schema and migrations
- GeneriCode export logic
- Application configuration

The boundary: **Terraform creates the resources, this repo deploys the application onto them.**

## Technology Stack

### Frontend
TBD -- must compile to edge-compatible JS. Candidates:
- **Hono** (lightweight, edge-native, built for this)
- **SvelteKit** (good DX, edge adapter available)
- **Vite + React** (most familiar to contributors)

### Backend
- **TypeScript** on Edge Scripting runtime
- **Bunny Database** (libSQL/SQLite-compatible) via HTTP API or native SDK

### Build & Deploy
- GitHub Actions for CI/CD
- Build frontend → deploy Edge Script + static assets to CDN
- Database migrations as part of deploy pipeline

## Key Design Decisions

### GeneriCode Export at the Edge
The spreadsheet formulas analysis (`analysis/spreadsheet-formulas/findings.md`) shows derived column logic is pure string manipulation -- no heavy computation. GeneriCode XML generation should fit within the 30s CPU limit for any realistic model size.

### SQLite for the Data Model
The UBL model is relatively small (thousands of rows, not millions). SQLite is more than sufficient, and Bunny Database gives us:
- Global read replicas for low latency
- Spins down when idle (cheap)
- Familiar SQL interface
- No connection pooling complexity

### Authentication
TBD -- options within bunny.net constraints:
- OAuth with GitHub/Google (TC members likely have these)
- Edge Scripting handles session tokens
- Role-based: TC Member (edit), Subcommittee (workspace), Public (read-only)
