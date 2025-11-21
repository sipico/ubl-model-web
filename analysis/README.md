# UBL Model Web - Analysis & Research

This directory contains analyses and research conducted during the project planning and implementation phases. Each subdirectory represents a specific investigation topic.

## Purpose

Analysis work is kept separate from production code to:
- Maintain clear separation between exploration and implementation
- Enable reproducible research
- Document decision-making processes
- Provide reference for future investigations

## Structure

Each analysis subdirectory contains:
- **README.md**: Overview of the analysis and its purpose
- **prompt.md**: Claude Code session prompt to start/continue the analysis
- **scripts/**: Any code or tools developed for the analysis (prefer Python)
- **data/**: Results, exports, or findings (may be gitignored)
- **findings.md**: Conclusions and recommendations

## Analysis Guidelines

When conducting analyses:

1. **Isolation**: Do not modify any code or documents outside the analysis directory
2. **Language**: Prefer Python for scripts - easier for others to understand
3. **Credentials**: Never commit credentials or secrets; request only when needed
4. **Reproducibility**: Document steps so analyses can be re-run
5. **Documentation**: Update README.md with status and findings

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
