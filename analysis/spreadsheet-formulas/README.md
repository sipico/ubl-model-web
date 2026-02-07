# Spreadsheet Formulas Analysis

**Status**: Complete

## Objective

Reverse-engineer the formulas in the UBL Google Sheets to understand how derived values are calculated. Critical for replicating the logic in the website's data model.

## Findings

See [findings.md](./findings.md) for the complete analysis, including:

- Exact formulas for all 4 derived columns (A, J, P, S) with pseudocode
- Formula variants by component type (ABIE, BBIE, ASBIE)
- Column Q auto-population for ASBIEs
- Abbreviation and suppression rules (Identifier→ID, Text suppression, URI/UUID/OID equivalences)
- Signatures spreadsheet column mapping and formula differences
- Cross-reference with config-UBL.xml abbreviation rules
- TypeScript implementation guide
- Validation rule inventory

## Key Findings

1. **6 formula columns**: A, J, P, S are fully derived; Q is derived for ASBIEs only
2. **3 formula variants**: Each derived column has a different formula per component type
3. **No validation rules** in the spreadsheets — constraints are implicit
4. **No cross-sheet references** — each sheet is self-contained
5. **Identical formulas** across Library and Documents; Signatures uses same logic with different column letters
6. **Object Class Qualifier (K) and Associated Object Class Qualifier (T)** are never populated but formulas support them
