# UBL Model Web - Claude Reference

**Project**: UBL Model Website
**Repository**: sipico/ubl-model-web
**Branch**: claude/ubl-model-website-01K4cNV8XJiShKAHQTWreiBr

## Project Vision

A comprehensive website to:
- Visualize the UBL (Universal Business Language) model
- Maintain and edit the UBL model
- Serve as the authoritative source for GC files that form the basis for UBL release packages

## Current Status

🚧 **Discovery Phase** - Analyzing requirements and documenting desired solution before implementation

## Project Approach

1. **Analysis First** - Understanding the domain, current state, and requirements
2. **Document the Vision** - Define what the ideal solution should be
3. **Design Architecture** - Work backwards from requirements to implementation
4. **Implement** - Build the solution based on documented decisions

## Key Documentation

### Session Logs
All conversation history is maintained in `.claude/sessions/` with timestamps and key decisions.

### Decision Records
Architectural and technical decisions are documented in `.claude/decisions/` with rationale.

## Important Conventions

- **No Code Yet**: Currently in analysis phase - no implementation code until requirements are fully documented
- **Session Documentation**: Conversations are logged after major topics or decisions
- **Naming Convention**: Lowercase for general files, UPPERCASE for this CLAUDE.md
- **AR Manager Approach**: Analysis work uses specialized AI personas - see `analysis/AR-MANAGER.md`

## Quick References

### Analysis Work
- **AR Manager**: `analysis/AR-MANAGER.md` - Framework for specialized AI personas
- **Role Boundaries**: `analysis/_ROLE-BOUNDARIES.md` - How personas collaborate
- **Available Personas**: See `analysis/README.md` for complete list

### Starting an Analysis Session
```
Read `analysis/[directory]/prompt.md` and adopt that persona to complete the analysis.
Remember to stay in your domain and use questions-for-other-personas.md for dependencies.
```

## Domain Understanding

### What is UBL?
Universal Business Language (OASIS standard) - "HTML for business documents"
- Royalty-free XML standard for business document exchange
- Based on UN/CEFACT CCTS 2.01 (Core Components Technical Specification)
- Uses ISO/IEC 11179 naming conventions
- Currently at version 2.4, working towards 2.5

### Current Source of Truth
Three Google Sheets maintained by TC:
- **Library**: https://docs.google.com/spreadsheets/d/18o1YqjHWUw0-s8mb3ja4i99obOUhs-4zpgso6RZrGaY
- **Documents**: https://docs.google.com/spreadsheets/d/1024Th-Uj8cqliNEJc-3pDOR7DxAAW7gCG4e-pbtarsg
- **Signatures**: https://docs.google.com/spreadsheets/d/1T6z2NZ4mc69YllZOXE5TnT5Ey-FlVtaXN1oQ4AIMp7g

### Publishing Pipeline
Google Sheets → ODS → GeneriCode (GC) XML → XSD/JSON Schemas → Documentation
- Automated via GitHub Actions: https://github.com/oasis-tcs/ubl/blob/ubl-2.5/README.md
- Uses `ident-UBL.xml` and `config-UBL.xml` for transformations

### The Problem
- Difficult to track changes in Google Sheets
- Hard to coordinate among multiple TC editors
- No visualization of model structure
- No formal approval workflow

### The Solution Vision
Website that:
1. Replaces Google Sheets as authoritative source
2. Provides change tracking and version control
3. Visualizes model structure and relationships
4. Helps TC members edit and maintain the model
5. Exports GeneriCode (GC) files for existing publishing pipeline

## Open Questions

- Who are all the intended users (editors, viewers, implementers)?
- What technology stack should be used?
- How to handle authentication and permissions?
- Deployment strategy and hosting?

---
*Last Updated: 2025-11-21*
