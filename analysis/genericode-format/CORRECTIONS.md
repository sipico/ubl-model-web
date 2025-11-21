# GeneriCode Format Analysis - CORRECTIONS

## Date: 2025-11-21
## Reason: Downloaded and examined actual ODS spreadsheets

## Critical Discovery

After downloading and examining the **actual Google Sheets in ODS format**, I discovered significant discrepancies between my original analysis (based on documentation) and the **actual data structure**.

---

## Actual Column Count

**My original claim**: "26+ columns"
**ACTUAL REALITY**:
- **GeneriCode output**: **23 columns**
- **Library/Documents spreadsheets**: 26 columns (input)
- **Signatures spreadsheet**: 32 columns (different structure!)

---

## ACTUAL Spreadsheet Columns (Library & Documents)

These 26 columns exist in the **SOURCE** Google Sheets:

1. Component Name
2. **Subset Cardinality** ⚠️
3. Cardinality
4. **Endorsed Cardinality** ⚠️
5. **Endorsed Cardinality Rationale** ⚠️
6. Definition
7. **Deprecated Definition** ⚠️
8. Alternative Business Terms
9. Examples
10. Dictionary Entry Name
11. Object Class Qualifier
12. Object Class
13. Property Term Qualifier
14. Property Term Possessive Noun
15. Property Term Primary Noun
16. Property Term
17. Representation Term
18. Data Type Qualifier
19. Data Type
20. Associated Object Class Qualifier
21. Associated Object Class
22. Component Type
23. UN/TDED Code
24. Current Version
25. **Last Changed** ⚠️
26. Editor's Notes

⚠️ = **DROPPED** during transformation to GeneriCode

---

## ACTUAL GeneriCode Output Columns

These 23 columns appear in the **OUTPUT** GeneriCode XML:

1. **ModelName** ✨ (ADDED - from worksheet name)
2. ComponentName
3. **Subset** (renamed from "Subset Cardinality")
4. Cardinality
5. Definition
6. AlternativeBusinessTerms (space removed)
7. Examples
8. DictionaryEntryName (space removed)
9. ObjectClassQualifier (space removed)
10. ObjectClass (space removed)
11. PropertyTermQualifier (space removed)
12. PropertyTermPossessiveNoun (space removed)
13. PropertyTermPrimaryNoun (space removed)
14. PropertyTerm (space removed)
15. RepresentationTerm (space removed)
16. DataTypeQualifier (space removed)
17. DataType (space removed)
18. AssociatedObjectClassQualifier (space removed)
19. AssociatedObjectClass (space removed)
20. ComponentType (space removed)
21. UNTDEDCode (renamed from "UN/TDED Code")
22. CurrentVersion (renamed from "Current Version")
23. EditorsNotes (renamed from "Editor's Notes")

✨ = **ADDED** by transformation

---

## Transformation Logic

The `Crane-ods2obdgc.xsl` transformation:

### Adds:
- **ModelName** - Derived from worksheet name (e.g., "Address", "Party", "Invoice")

### Drops (5 columns):
- **Subset Cardinality** (column 2)
- **Endorsed Cardinality** (column 4)
- **Endorsed Cardinality Rationale** (column 5)
- **Deprecated Definition** (column 7)
- **Last Changed** (column 25)

### Renames (removes spaces, camelCase):
- "Component Name" → "ComponentName"
- "Subset Cardinality" → "Subset"
- "Alternative Business Terms" → "AlternativeBusinessTerms"
- "Dictionary Entry Name" → "DictionaryEntryName"
- "Object Class Qualifier" → "ObjectClassQualifier"
- "Object Class" → "ObjectClass"
- "Property Term Qualifier" → "PropertyTermQualifier"
- "Property Term Possessive Noun" → "PropertyTermPossessiveNoun"
- "Property Term Primary Noun" → "PropertyTermPrimaryNoun"
- "Property Term" → "PropertyTerm"
- "Representation Term" → "RepresentationTerm"
- "Data Type Qualifier" → "DataTypeQualifier"
- "Data Type" → "DataType"
- "Associated Object Class Qualifier" → "AssociatedObjectClassQualifier"
- "Associated Object Class" → "AssociatedObjectClass"
- "Component Type" → "ComponentType"
- "UN/TDED Code" → "UNTDEDCode"
- "Current Version" → "CurrentVersion"
- "Editor's Notes" → "EditorsNotes"

---

## Signatures Spreadsheet - Different Structure!

**Critical finding**: The Signatures spreadsheet has **32 columns** and a **different structure**:

1. **UBL Name** (unique to Signatures)
2. Dictionary Entry Name
3. Object Class Qualifier
4. Object Class
5. Property Term Qualifier
6. Property Term Possessive Noun
7. Property Term Primary Noun
8. Property Term
9. Representation Term
10. Data Type Qualifier
11. Data Type
12. Associated Object Class Qualifier
13. Associated Object Class
14. Alternative Business Terms
15. Cardinality
16. Component Type
17. Definition
18. Examples
19. UN/TDED Code
20. Current Version
21. **Analyst Notes** (unique to Signatures)
22. **CCL Dictionary Entry Name** (unique to Signatures)
23. **Context: Business Process** (unique to Signatures)
24. **Context: Region (Geopolitical)** (unique to Signatures)
25. **Context: Official Constraints** (unique to Signatures)
26. **Context: Product** (unique to Signatures)
27. **Context: Industry** (unique to Signatures)
28. **Context: Role** (unique to Signatures)
29. **Context: Supporting Role** (unique to Signatures)
30. **Context: System Constraint** (unique to Signatures)
31. Editor's Notes
32. **Changes from Previous Version** (unique to Signatures)

The Signatures spreadsheet has:
- **Different column order**
- **6 additional "Context" columns**
- **UBL Name** instead of "Component Name"
- Additional metadata fields

---

## Columns I Incorrectly Documented

In my original analysis, I claimed these columns existed but **they DO NOT**:

❌ **UID** - Does not exist
❌ **RepresentationTermQualifier** - Does not exist
❌ **PrimitiveTerm** - Does not exist
❌ **UsageRule** - Does not exist
❌ **LanguageCode** - Does not exist
❌ **UBLVersionID** - Does not exist
❌ **UBLVersionReason** - Does not exist
❌ **ComponentVersion** - Incorrect name (actual: "CurrentVersion")
❌ **ModificationReason** - Does not exist

These were assumptions based on CCTS standards or other documentation, **NOT actual examination of the files**.

---

## Impact on Website Development

### Data Model Implications

The website database needs to store the **26 spreadsheet columns** (or 32 for Signatures), not 26+ GeneriCode columns:

**Library/Documents entities need**:
- All 26 spreadsheet columns
- Even the 5 that get dropped (Endorsed Cardinality, etc.) should be stored for editing purposes

**Signature entities need**:
- All 32 columns including context fields
- Different structure from main entities

### Export Logic

The export must:
1. **Add ModelName** from the model/ABIE name
2. **Drop** the 5 columns that don't appear in GeneriCode
3. **Rename** columns (remove spaces, apply camelCase)
4. **Handle Signatures differently** - different column set and order

### Validation

Update validation to use **actual column names**:
- "Component Name" not "ComponentName" (in database)
- "Dictionary Entry Name" not "DictionaryEntryName"
- etc.

---

## Corrected File Locations

**Downloaded ODS files**:
- `analysis/genericode-format/data/source-sheets/library.ods` (626 KB)
- `analysis/genericode-format/data/source-sheets/documents.ods` (910 KB)
- `analysis/genericode-format/data/source-sheets/signatures.ods` (17 KB)

**Extracted content available in**:
- `library_extracted/content.xml`
- `documents_extracted/content.xml`
- `signatures_extracted/content.xml`

---

## What I Should Have Done

**What I did**:
- ❌ Read XSLT code and documentation
- ❌ Examined GeneriCode schema
- ❌ Made assumptions about columns

**What I should have done**:
- ✅ Download the actual ODS files
- ✅ Extract and examine the real data
- ✅ Compare source (spreadsheets) vs. output (GeneriCode)
- ✅ Verify every column name and count

---

## Apology & Lesson Learned

I apologize for the inaccurate documentation. I made assumptions without examining the source data. This is a critical lesson: **always examine the actual data files, not just documentation**.

The user was right to question whether I had "actually downloaded the spreadsheets and had a good look at the actual contents" - I had not, and it shows in my analysis.

---

## Next Steps

1. ✅ **DONE**: Downloaded and examined actual ODS files
2. ⏳ **TODO**: Update all documentation with correct column names and counts
3. ⏳ **TODO**: Create accurate mapping between spreadsheet and GeneriCode columns
4. ⏳ **TODO**: Document the Signatures differences explicitly
5. ⏳ **TODO**: Update code examples with correct column names

---

**Analysis Quality**: Initially incomplete, now corrected with actual data
**Lesson**: Always examine source files, not just documentation
**Status**: Corrections in progress
