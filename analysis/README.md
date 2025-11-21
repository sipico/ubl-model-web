# UBL Model Web - Analysis & Research

This directory contains analyses and research conducted during the project planning and implementation phases. Each subdirectory represents a specific investigation topic with a **specialized AI persona**.

## AI Resources (AR) Manager Approach

This project uses an **AR Manager** pattern where each analysis is performed by a specialized AI persona with deep domain expertise. Like a distributed software team, each specialist:
- Focuses on their domain
- Works asynchronously with others
- Documents questions for other personas
- Produces high-quality, focused deliverables

**Read**: [`AR-MANAGER.md`](./AR-MANAGER.md) for the complete philosophy and guidelines.

## Purpose

Analysis work is kept separate from production code to:
- Maintain clear separation between exploration and implementation
- Enable reproducible research with specialized expertise
- Document decision-making processes
- Provide reference for future investigations
- Allow focused, expert-level analysis

## Structure

Each analysis subdirectory contains:
- **README.md**: Overview of the analysis and its purpose
- **prompt.md**: Specialized AI persona prompt for this analysis
- **scripts/**: Any code or tools developed (prefer Python)
- **data/**: Results, exports, or findings (may be gitignored)
- **findings.md**: Conclusions and recommendations

**Cross-persona questions** are handled in the shared `analysis/SHARED-QUESTIONS.md` document (not in individual subdirectories).

## Key Documents

- **[AR-MANAGER.md](./AR-MANAGER.md)**: Role philosophy and persona management
- **[_ROLE-BOUNDARIES.md](./_ROLE-BOUNDARIES.md)**: How personas collaborate
- **[SHARED-QUESTIONS.md](./SHARED-QUESTIONS.md)**: Single source of truth for all cross-persona questions
- **[_TEMPLATE_questions-for-other-personas.md](./_TEMPLATE_questions-for-other-personas.md)**: ⚠️ DEPRECATED - Use SHARED-QUESTIONS.md instead

## Analysis Guidelines

When conducting analyses (as an AI persona):

1. **Stay in Your Lane**: Focus on your domain expertise only
2. **Isolation**: Do not modify any code or documents outside your analysis directory
3. **Language**: Prefer Python for scripts - easier for others to understand
4. **Credentials**: Never commit credentials or secrets; request only when needed
5. **Cross-Persona Questions**: Add questions to `analysis/SHARED-QUESTIONS.md` (single source of truth)
6. **Reproducibility**: Document steps so analyses can be re-run
7. **Documentation**: Update README.md with status and findings

**Read** [`_ROLE-BOUNDARIES.md`](./_ROLE-BOUNDARIES.md) before starting any analysis.

## Analyses

### Technical Investigation (Pipeline Understanding)

These analyses help understand the current technical implementation:

- [google-sheets-history](./google-sheets-history/) - Analyzing edit patterns and change history in current Google Sheets
- [spreadsheet-formulas](./spreadsheet-formulas/) - Understanding formula logic in current spreadsheets
- [genericode-format](./genericode-format/) - Examining GeneriCode XML format and generation

### Requirements Gathering (Solution Design)

These analyses define what the new system should do and how it should work. Each has a specialized AI persona:

- [user-workflows](./user-workflows/) - **UX Researcher** analyzes workflows and designs intuitive experiences
- [functional-requirements](./functional-requirements/) - **Product Manager** defines complete feature set and priorities
- [data-model-design](./data-model-design/) - **Database Architect** designs the data model for CCTS representation

### Future Analyses

- Technology stack evaluation
- Deployment and hosting strategy
- Security and authentication design

---

**Note**: Analysis code is exploratory and may not follow production code standards. Use findings to inform production decisions, but don't merge analysis code into production without proper refactoring.
