# GeneriCode Format Analysis

**Analysis of the GeneriCode XML format for UBL model export**

**Status**: ✅ Complete (with corrections based on actual ODS examination)
**Date**: 2025-11-21
**Priority**: High - Required for website export functionality

---

## Purpose

Understand the GeneriCode (GC) XML format that the website must export to integrate with the existing OASIS UBL publishing pipeline.

**Key Finding**: Direct GeneriCode generation from the website database is **feasible and recommended**. The website should bypass ODS files entirely.

---

## Documentation Structure

This analysis provides everything needed to implement GeneriCode export:

### 1. **columns-and-structure.md**
Complete reference for all spreadsheet columns and GeneriCode structure:
- Actual 26 spreadsheet columns (Library/Documents)
- 32 signature columns (different structure)
- 23 GeneriCode output columns
- Column mappings and transformations
- Endorsed column system explained

### 2. **transformation-and-export.md**
How to export GeneriCode files from the website:
- Full model export (UBL-Entities)
- Endorsed model export (UBL-Endorsed-Entities)
- Signature export
- Complete transformation logic
- Database schema requirements

### 3. **implementation-guide.md**
Practical code examples and implementation:
- Technology recommendations
- Complete TypeScript/Node.js examples
- Validation service
- Export API endpoints
- Testing approaches

### 4. **data/** directory
Sample files and source data:
- minimal-example.gc.xml (annotated example)
- Links to actual OASIS GeneriCode files
- Downloaded ODS files for reference

---

## Quick Start

**For understanding the format:**
→ Read `columns-and-structure.md`

**For implementing export:**
→ Read `transformation-and-export.md` then `implementation-guide.md`

**For reference:**
→ Check `data/minimal-example.gc.xml`

---

## Key Findings

### Structure
- **Source**: 3 Google Sheets (Library, Documents, Signatures)
- **Output**: 2 GeneriCode files (main entities + signatures)
- **Columns**: 26 spreadsheet → 23 GeneriCode (with transformations)

### Endorsed System
The "Endorsed Cardinality" columns create **TWO models** from the same source:

1. **Full Model** (`UBL-Entities-{version}.gc`)
   - All entities included
   - Original cardinalities
   - Backward compatibility

2. **Endorsed Model** (`UBL-Endorsed-Entities-{version}.gc`)
   - Deprecated entities removed
   - Updated cardinalities
   - Recommended for new implementations

### Transformation
- ODS → GeneriCode is **mechanical** (format conversion)
- ModelName **added** from worksheet names
- 5 columns **dropped** (Deprecated Definition, Last Changed, etc.)
- Column names **normalized** (spaces removed, PascalCase)
- Empty values **omitted**

### Feasibility
✅ **Direct generation is viable**
- No need for ODS intermediate format
- Straightforward XML generation
- Clear validation rules
- Complexity: Medium
- Timeline: 2 weeks MVP, 4-6 weeks full implementation

---

## Technical Stack

**Recommended**: Node.js/TypeScript or Python

**Required Libraries**:
- XML generation (xmlbuilder2 for Node, lxml for Python)
- XML validation (libxmljs for Node, xmlschema for Python)
- Schema validation (zod/pydantic)

**Optional**: Stream support for large exports (3,500+ entities)

---

## Database Requirements

The website must store:

**For Library/Documents**:
- All 26 spreadsheet columns
- Including endorsed columns (Endorsed Cardinality, Endorsed Cardinality Rationale)
- Including columns dropped from GC (Last Changed, Deprecated Definition)
- Entity type flag (library/document/signature)
- Model name (which ABIE the entity belongs to)

**For Signatures**:
- All 32 columns (different structure)
- Includes 8 context columns
- Different column names and order

---

## Export Functions Needed

The website must implement **THREE export functions**:

1. **Export Full Model** → `UBL-Entities-{version}.gc`
   - All library + document entities
   - Keep endorsed columns in output
   - Original cardinalities

2. **Export Endorsed Model** → `UBL-Endorsed-Entities-{version}.gc`
   - Filter out deprecated entities
   - Replace cardinalities with endorsed values
   - Remove endorsed columns from output

3. **Export Signatures** → `UBL-Signature-Entities-{version}.gc`
   - All signature entities
   - Different column structure

---

## Validation Requirements

**Pre-export validation**:
- DictionaryEntryName uniqueness
- Required fields present
- Valid component types (ABIE, BBIE, ASBIE, MA)
- Valid cardinalities (0..1, 1..1, 0..n, 1..n)
- Type-specific rules (ABIEs have ObjectClass, BBIEs have PropertyTerm, etc.)

**Post-export validation**:
- GeneriCode XSD schema validation
- Well-formed XML
- ColumnRef integrity

---

## Integration with OASIS Pipeline

**GeneriCode is the interface** between:
- **Upstream**: Website (data entry/maintenance)
- **Downstream**: OASIS schema generation (XSD, JSON, documentation)

The website replaces only the **ODS generation** part. Everything downstream (GeneriCode → XSD → JSON → Docs) remains unchanged.

**Configuration**:
- `ident-UBL.xml` - Metadata for full model
- `ident-UBL-Endorsed.xml` - Metadata for endorsed model
- `config-UBL.xml` - Downstream schema generation (unchanged)

---

## Resources

**OASIS UBL Repository**:
- https://github.com/oasis-tcs/ubl/tree/ubl-2.5
- GeneriCode schema: `utilities/genericode/xsd/genericode.xsd`
- Transformation: `utilities/Crane-ods2obdgc/Crane-ods2obdgc.xsl`
- Endorsed filter: `gc2endorsed.xsl`

**Sample Files**:
- Full model: https://raw.githubusercontent.com/oasis-tcs/ubl/ubl-2.5/UBL-Entities-2.4-os.gc
- Endorsed: https://raw.githubusercontent.com/oasis-tcs/ubl/ubl-2.5/UBL-Endorsed-Entities-2.4-os.gc
- Signatures: https://raw.githubusercontent.com/oasis-tcs/ubl/ubl-2.5/UBL-Signature-Entities-2.4-os.gc

**Standards**:
- OASIS GeneriCode 1.0: http://docs.oasis-open.org/codelist/cs01-genericode-1.0/
- UBL Specification: https://docs.oasis-open.org/ubl/csd01-UBL-2.5/UBL-2.5.html

---

## Methodology Note

This analysis is based on:
✅ Actual ODS files downloaded from Google Sheets
✅ Examination of real spreadsheet structure
✅ Complete OASIS build process tracing (build.xml, gc2endorsed.xsl)
✅ Sample GeneriCode file analysis

**Lesson learned**: Always examine actual source data files, not just documentation.

---

## Next Steps for Implementation

1. **Review** `columns-and-structure.md` to understand the data model
2. **Design** database schema with all 26/32 columns
3. **Implement** validation service (refer to `implementation-guide.md`)
4. **Build** export functions for full and endorsed models
5. **Test** against GeneriCode XSD schema
6. **Integrate** with OASIS pipeline for validation

---

**Analysis Completed**: 2025-11-21
**Quality**: Production-ready, based on actual file examination
**Maintainer**: GeneriCode Format Specialist
