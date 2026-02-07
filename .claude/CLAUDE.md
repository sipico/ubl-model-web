# 🧩 Composito

## What This Project Is

**Composito** ([composito.eu](https://composito.eu)) is a website to visualize, maintain, and serve as the authoritative source for CCTS-based semantic models. The first model supported is **UBL (Universal Business Language)** -- an OASIS XML standard for business document exchange ("HTML for business documents").

The platform is designed to expand to other semantic models based on CCTS.

The website will:
1. **Visualize** data models and relationships between entities
2. **Maintain/edit** models with change tracking and approval workflows
3. **Export GeneriCode (GC) XML files** for existing publishing pipelines

## Current Status

Analysis phase -- no implementation code yet. Two analyses complete (GeneriCode format, spreadsheet formulas), three remaining.

## Domain: UBL and CCTS

UBL is based on UN/CEFACT CCTS 2.01 (Core Components Technical Specification) with ISO/IEC 11179 naming conventions. Currently at version 2.4, working towards 2.5.

### Business Information Entities (BIEs)
- **ABIE** (Aggregate BIE): Complex objects -- Address, Party, Invoice
- **BBIE** (Basic BIE): Simple elements -- StreetName, Amount
- **ASBIE** (Association BIE): Relationships between ABIEs

### Current Source of Truth
Three Google Sheets maintained by the TC:
- **Library**: Reusable components -- https://docs.google.com/spreadsheets/d/18o1YqjHWUw0-s8mb3ja4i99obOUhs-4zpgso6RZrGaY
- **Documents**: Document types -- https://docs.google.com/spreadsheets/d/1024Th-Uj8cqliNEJc-3pDOR7DxAAW7gCG4e-pbtarsg
- **Signatures**: Digital signature extensions -- https://docs.google.com/spreadsheets/d/1T6z2NZ4mc69YllZOXE5TnT5Ey-FlVtaXN1oQ4AIMp7g

### Spreadsheet Columns (26 per sheet, Library/Documents)
A: Component Name (derived), B: Subset Cardinality, C: Cardinality, D: Endorsed Cardinality, E: Endorsed Cardinality Rationale, F: Definition, G: Deprecated Definition, H: Alternative Business Terms, I: Examples, J: Dictionary Entry Name (derived, primary key, ISO/IEC 11179), K: Object Class Qualifier, L: Object Class, M: Property Term Qualifier, N: Property Term Possessive Noun, O: Property Term Primary Noun, P: Property Term (derived), Q: Representation Term, R: Data Type Qualifier, S: Data Type (derived), T: Associated Object Class Qualifier, U: Associated Object Class, V: Component Type (ABIE/BBIE/ASBIE/MA), W: UN/TDED Code, X: Current Version, Y: Last Changed, Z: Editor's Notes

Derived columns A, J, P, S are algorithmically generated from other column values. See `analysis/spreadsheet-formulas/findings.md` for the complete formula documentation.

### Publishing Pipeline
Google Sheets → ODS → GeneriCode (GC) XML → XSD/JSON Schemas → Documentation
- Automated via GitHub Actions: https://github.com/oasis-tcs/ubl/blob/ubl-2.5/README.md
- Uses `ident-UBL.xml` and `config-UBL.xml` for transformations
- Build repo (forked): https://github.com/kduvekot/ubl (branch: ubl-2.5-python)

### The Problem
- Difficult to track changes in Google Sheets
- Hard to coordinate among TC editors
- No formal approval workflow
- No visualization of model structure
- TC members are non-IT business experts who need a simple interface

### Users
1. **TC Members** -- all can make changes (not just designated editors)
2. **Subcommittees** -- need workspace for internal review before TC submission
3. **Public** -- read-only access to view and explore the model

## Completed Analysis

### GeneriCode Format (Complete)
Full analysis in `analysis/genericode-format/`:
- `columns-and-structure.md` -- all column mappings and GC XML structure
- `transformation-and-export.md` -- export logic for full, endorsed, and signature models
- `implementation-guide.md` -- TypeScript/Node.js code examples
- `data/minimal-example.gc.xml` -- annotated example

Key finding: Direct GC generation from a website database is feasible -- ODS intermediate format can be bypassed.

### Spreadsheet Formulas (Complete)
Full analysis in `analysis/spreadsheet-formulas/findings.md`:
- Exact formulas for all derived columns (A, J, P, S) with pseudocode
- Formula variants by component type (ABIE, BBIE, ASBIE)
- Abbreviation and suppression rules from config-UBL.xml
- TypeScript implementation guide
- Validation rule inventory

## Remaining Analysis Tasks

Run these as focused research sessions (use subagents for deep investigation):

1. **Google Sheets History** -- analyze edit patterns, change frequency, user behavior
2. **User Workflows** -- design editing, review/approval, and navigation workflows
3. **Functional Requirements** -- define MVP features and priorities
4. **Data Model Design** -- database schema for CCTS representation, versioning, and GC export

## Architecture

Edge Scripting + Bunny Database on bunny.net. See `docs/architecture.md` for full details and IaC boundary.

## Open Decisions

- Review/approval workflow design

## Key References

- [UBL TC Homepage](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=ubl)
- [UBL 2.5 Specification](https://docs.oasis-open.org/ubl/csd01-UBL-2.5/UBL-2.5.html)
- [Section D.4 - CCTS](https://docs.oasis-open.org/ubl/csd01-UBL-2.5/UBL-2.5.html#D-4-THE-CCTS-SPECIFICATION-OF-UBL-BUSINESS-INFORMATION-ENTITIES)
- [Publishing Repository](https://github.com/oasis-tcs/ubl/blob/ubl-2.5/README.md)

## GitHub CLI

`gh` is auto-installed via SessionStart hook. The local git remote is a proxy, so always use `--repo`:

```bash
gh pr create --repo sipico/ubl-model-web --title "..."
gh pr list --repo sipico/ubl-model-web
gh issue list --repo sipico/ubl-model-web
gh api repos/sipico/ubl-model-web/pulls
```

## Session History

Conversation logs are in `.claude/sessions/`. External reviews of methodology are in `.claude/second-opinion/`.
