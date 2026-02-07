# Spreadsheet Formulas Analysis

**Status**: Not started

## Objective

Reverse-engineer the formulas in the UBL Google Sheets to understand how derived values are calculated. Critical for replicating the logic in the website's data model.

## Key Questions

1. How are derived columns A (Component Name), J (Dictionary Entry Name), P (Property Term), and S (Data Type) calculated?
2. What other columns use formulas?
3. What validation rules exist?
4. Are there cross-sheet references?

## Known Derived Columns (from UBL 2.5 Spec Section D.4)

- **Column A** (Component Name): Derived from other column values
- **Column J** (Dictionary Entry Name): Unique key using ISO/IEC 11179 naming
- **Column P** (Property Term): Derived from columns M, N, O
- **Column S** (Data Type): Derived from other column values
