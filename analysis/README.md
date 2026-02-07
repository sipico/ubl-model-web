# Analysis

Research and analysis to inform the UBL Model Web design and implementation.

## Completed

### [genericode-format/](./genericode-format/)
GeneriCode XML format analysis -- column mappings, transformation logic, export implementation guide, and annotated examples. **Key finding**: direct GC generation from a database is feasible, no ODS intermediate needed.

### [spreadsheet-formulas/](./spreadsheet-formulas/)
Reverse-engineered all formulas for derived columns (A, J, P, S) with exact logic per component type (ABIE, BBIE, ASBIE), abbreviation rules, cross-reference with build config, and TypeScript implementation guide. **Key finding**: 6 formula columns total, no validation rules in the spreadsheets, no cross-sheet references.

## Not Started

### [google-sheets-history/](./google-sheets-history/)
Analyze edit patterns, change frequency, and user behavior in the current Google Sheets to inform UI/UX design, feature priorities, and testing scenarios.

### [user-workflows/](./user-workflows/)
Design editing, review/approval, and navigation workflows for non-IT TC members. Covers adding/modifying BIEs, deprecation, subcommittee review, and TC approval.

### [functional-requirements/](./functional-requirements/)
Define MVP features, priorities, and acceptance criteria. Depends on user workflows analysis.

### [data-model-design/](./data-model-design/)
Database schema for CCTS representation, version control, change history, and efficient GC export. Depends on spreadsheet formulas and user workflows.

## Google Sheets Sources

- **Library**: https://docs.google.com/spreadsheets/d/18o1YqjHWUw0-s8mb3ja4i99obOUhs-4zpgso6RZrGaY
- **Documents**: https://docs.google.com/spreadsheets/d/1024Th-Uj8cqliNEJc-3pDOR7DxAAW7gCG4e-pbtarsg
- **Signatures**: https://docs.google.com/spreadsheets/d/1T6z2NZ4mc69YllZOXE5TnT5Ey-FlVtaXN1oQ4AIMp7g
