# GeneriCode Columns and Structure

**Complete reference for spreadsheet columns and GeneriCode XML structure**

---

## Overview

This document provides the authoritative reference for:
- Spreadsheet column structure (what's in Google Sheets)
- GeneriCode XML structure (what's in the output)
- Column mappings and transformations
- The endorsed column system

---

## Spreadsheet Columns

### Library and Documents Sheets (26 columns)

Both the Library and Documents spreadsheets have **identical column structure**:

| # | Column Name | In GC? | GC Column Name | Notes |
|---|-------------|--------|----------------|-------|
| 1 | Component Name | ✅ | ComponentName | |
| 2 | Subset Cardinality | ✅ | Subset | Renamed |
| 3 | Cardinality | ✅ | Cardinality | |
| 4 | Endorsed Cardinality | ⚠️ | EndorsedCardinality | Used for endorsed model |
| 5 | Endorsed Cardinality Rationale | ⚠️ | EndorsedCardinalityRationale | Used for endorsed model |
| 6 | Definition | ✅ | Definition | |
| 7 | Deprecated Definition | ❌ | - | DROPPED |
| 8 | Alternative Business Terms | ✅ | AlternativeBusinessTerms | |
| 9 | Examples | ✅ | Examples | |
| 10 | Dictionary Entry Name | ✅ | DictionaryEntryName | PRIMARY KEY |
| 11 | Object Class Qualifier | ✅ | ObjectClassQualifier | |
| 12 | Object Class | ✅ | ObjectClass | |
| 13 | Property Term Qualifier | ✅ | PropertyTermQualifier | |
| 14 | Property Term Possessive Noun | ✅ | PropertyTermPossessiveNoun | |
| 15 | Property Term Primary Noun | ✅ | PropertyTermPrimaryNoun | |
| 16 | Property Term | ✅ | PropertyTerm | |
| 17 | Representation Term | ✅ | RepresentationTerm | |
| 18 | Data Type Qualifier | ✅ | DataTypeQualifier | |
| 19 | Data Type | ✅ | DataType | |
| 20 | Associated Object Class Qualifier | ✅ | AssociatedObjectClassQualifier | |
| 21 | Associated Object Class | ✅ | AssociatedObjectClass | |
| 22 | Component Type | ✅ | ComponentType | ABIE, BBIE, ASBIE, MA |
| 23 | UN/TDED Code | ✅ | UNTDEDCode | |
| 24 | Current Version | ✅ | CurrentVersion | |
| 25 | Last Changed | ❌ | - | DROPPED |
| 26 | Editor's Notes | ✅ | EditorsNotes | |

**Legend**:
- ✅ = Included in GeneriCode output
- ⚠️ = Included in full model, removed in endorsed model
- ❌ = Dropped during transformation

### Signatures Sheet (32 columns - DIFFERENT STRUCTURE!)

The Signatures spreadsheet has a **completely different structure**:

| # | Column Name | Notes |
|---|-------------|-------|
| 1 | UBL Name | Different from "Component Name" |
| 2 | Dictionary Entry Name | |
| 3 | Object Class Qualifier | |
| 4 | Object Class | |
| 5 | Property Term Qualifier | |
| 6 | Property Term Possessive Noun | |
| 7 | Property Term Primary Noun | |
| 8 | Property Term | |
| 9 | Representation Term | |
| 10 | Data Type Qualifier | |
| 11 | Data Type | |
| 12 | Associated Object Class Qualifier | |
| 13 | Associated Object Class | |
| 14 | Alternative Business Terms | |
| 15 | Cardinality | |
| 16 | Component Type | |
| 17 | Definition | |
| 18 | Examples | |
| 19 | UN/TDED Code | |
| 20 | Current Version | |
| 21 | Analyst Notes | Unique to Signatures |
| 22 | CCL Dictionary Entry Name | Unique to Signatures |
| 23 | Context: Business Process | Unique to Signatures |
| 24 | Context: Region (Geopolitical) | Unique to Signatures |
| 25 | Context: Official Constraints | Unique to Signatures |
| 26 | Context: Product | Unique to Signatures |
| 27 | Context: Industry | Unique to Signatures |
| 28 | Context: Role | Unique to Signatures |
| 29 | Context: Supporting Role | Unique to Signatures |
| 30 | Context: System Constraint | Unique to Signatures |
| 31 | Editor's Notes | |
| 32 | Changes from Previous Version | Unique to Signatures |

**Note**: Different column order, 8 context columns, and different metadata fields.

---

## GeneriCode XML Structure

### Root Element

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gc:CodeList
  xmlns:gc="http://docs.oasis-open.org/codelist/ns/genericode/1.0/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://docs.oasis-open.org/codelist/ns/genericode/1.0/ genericode.xsd">
```

### Three Main Sections

1. **`<Identification>`** - Metadata about the file
2. **`<ColumnSet>`** - Column definitions
3. **`<SimpleCodeList>`** - Data rows

---

## 1. Identification Section

Injected from `ident-UBL.xml` (or `ident-UBL-Endorsed.xml` for endorsed model):

```xml
<Identification>
  <ShortName>UBL-2.5-CSD02</ShortName>
  <LongName xml:lang="en">UBL 2.5 CSD02 Business Entity Summary</LongName>
  <Version>2.5</Version>
  <CanonicalUri>urn:oasis:names:specification:ubl:BIE</CanonicalUri>
  <CanonicalVersionUri>urn:oasis:names:specification:ubl:BIE:2.5</CanonicalVersionUri>
  <LocationUri>https://docs.oasis-open.org/ubl/.../UBL-Entities-2.5.gc</LocationUri>
  <Agency>
    <LongName xml:lang="en">OASIS Universal Business Language TC</LongName>
    <Identifier>UBL</Identifier>
  </Agency>
</Identification>
```

**Source**: Configuration file, NOT from spreadsheet data

---

## 2. ColumnSet Section

Defines the columns (23 for full model):

```xml
<ColumnSet>
  <Column Id="ModelName" Use="required">
    <ShortName>ModelName</ShortName>
    <LongName>Model Name</LongName>
    <Data Type="string"/>
  </Column>
  <Column Id="ComponentName" Use="optional">
    <ShortName>ComponentName</ShortName>
    <LongName>Component Name</LongName>
    <Data Type="string"/>
  </Column>
  <!-- ... 21 more columns ... -->
  
  <Key Id="dictionary-entry-name-key">
    <ShortName>DictionaryEntryNameKey</ShortName>
    <LongName>The unique name for a dictionary entry</LongName>
    <ColumnRef Ref="DictionaryEntryName"/>
  </Key>
</ColumnSet>
```

**All columns are type "string"** - no complex types.

---

## 3. SimpleCodeList Section

Data rows - one per entity:

```xml
<SimpleCodeList>
  <Row>
    <Value ColumnRef="ModelName">
      <SimpleValue>Address</SimpleValue>
    </Value>
    <Value ColumnRef="ComponentName">
      <SimpleValue>Address</SimpleValue>
    </Value>
    <Value ColumnRef="ComponentType">
      <SimpleValue>ABIE</SimpleValue>
    </Value>
    <Value ColumnRef="DictionaryEntryName">
      <SimpleValue>Address. Details</SimpleValue>
    </Value>
    <Value ColumnRef="Definition">
      <SimpleValue>A class to define common information related to an address.</SimpleValue>
    </Value>
    <!-- More values... empty fields omitted -->
  </Row>
  <!-- More rows... -->
</SimpleCodeList>
```

**Important**: Empty values are omitted - no `<Value>` element for null/empty fields.

---

## Column Transformation Rules

### Added by Transformation

**ModelName** - Derived from worksheet name:
- Worksheet "Address" → ModelName = "Address"
- Worksheet "Invoice" → ModelName = "Invoice"

### Dropped by Transformation

Five columns are NOT included in GeneriCode output:
1. **Subset Cardinality** (column 2) - kept in spreadsheet, renamed to "Subset"
2. **Endorsed Cardinality** (column 4) - dropped in endorsed model only
3. **Endorsed Cardinality Rationale** (column 5) - dropped in endorsed model only
4. **Deprecated Definition** (column 7) - always dropped
5. **Last Changed** (column 25) - always dropped

### Renamed by Transformation

All column names normalized:
- Spaces removed
- PascalCase applied
- Example: "Component Name" → "ComponentName"
- Example: "UN/TDED Code" → "UNTDEDCode"

---

## The Endorsed Column System

### Purpose

The "Endorsed Cardinality" columns enable creating **TWO models from ONE source**:

1. **Full Model** - All entities, original cardinalities
2. **Endorsed Model** - Deprecated removed, updated cardinalities

### Endorsed Cardinality Column

**Values**:
- Standard cardinalities: `0..1`, `1..1`, `0..n`, `1..n`
- Deprecation markers: `0`, `0..0`
- Empty: Use standard Cardinality

**Meaning**:
- If present and not zero: Recommended cardinality for new implementations
- If `0` or `0..0`: Entity is deprecated and should be removed from endorsed model
- If empty: No change from standard Cardinality

### Endorsed Cardinality Rationale

Text explanation for why the cardinality changed.

### Example Scenarios

**Scenario 1: Field becomes mandatory**
```
| Component Name | Cardinality | Endorsed Cardinality | Rationale |
| InvoiceNumber  | 0..1        | 1..1                 | Now required |
```
- Full model: Optional (0..1)
- Endorsed model: Mandatory (1..1)

**Scenario 2: Field deprecated**
```
| Component Name | Cardinality | Endorsed Cardinality | Rationale |
| ObsoleteField  | 0..1        | 0..0                 | Superseded |
```
- Full model: Present, optional (0..1)
- Endorsed model: REMOVED entirely

**Scenario 3: Multiplicity restricted**
```
| Component Name | Cardinality | Endorsed Cardinality | Rationale |
| ContactPoint   | 0..n        | 0..1                 | Limit to single |
```
- Full model: Multiple allowed (0..n)
- Endorsed model: Single only (0..1)

---

## Database Schema Requirements

### For Library/Documents Entities

```sql
CREATE TABLE library_document_entities (
  id SERIAL PRIMARY KEY,
  
  -- Core identity
  component_name VARCHAR NOT NULL,
  dictionary_entry_name VARCHAR UNIQUE NOT NULL,
  component_type VARCHAR CHECK (component_type IN ('ABIE', 'BBIE', 'ASBIE', 'MA')),
  model_name VARCHAR NOT NULL,  -- Which ABIE this belongs to
  entity_type VARCHAR CHECK (entity_type IN ('library', 'document')),
  
  -- Cardinality (keep both!)
  subset_cardinality VARCHAR,
  cardinality VARCHAR NOT NULL,
  endorsed_cardinality VARCHAR,
  endorsed_cardinality_rationale TEXT,
  
  -- Definitions
  definition TEXT NOT NULL,
  deprecated_definition TEXT,  -- Keep even though dropped from GC
  
  -- Business terms
  alternative_business_terms TEXT,
  examples TEXT,
  
  -- Object class
  object_class_qualifier VARCHAR,
  object_class VARCHAR,
  
  -- Property term (3-part structure!)
  property_term_qualifier VARCHAR,
  property_term_possessive_noun VARCHAR,
  property_term_primary_noun VARCHAR,
  property_term VARCHAR,
  
  -- Representation
  representation_term VARCHAR,
  
  -- Data type
  data_type_qualifier VARCHAR,
  data_type VARCHAR,
  
  -- Association
  associated_object_class_qualifier VARCHAR,
  associated_object_class VARCHAR,
  
  -- Metadata
  un_tded_code VARCHAR,
  current_version VARCHAR,
  last_changed TIMESTAMP,  -- Keep even though dropped from GC
  editors_notes TEXT
);
```

### For Signature Entities

```sql
CREATE TABLE signature_entities (
  id SERIAL PRIMARY KEY,
  
  -- Different structure!
  ubl_name VARCHAR NOT NULL,  -- Not "component_name"
  dictionary_entry_name VARCHAR UNIQUE NOT NULL,
  
  -- ... similar middle columns ...
  
  -- Unique signature fields
  analyst_notes TEXT,
  ccl_dictionary_entry_name VARCHAR,
  context_business_process VARCHAR,
  context_region VARCHAR,
  context_official_constraints VARCHAR,
  context_product VARCHAR,
  context_industry VARCHAR,
  context_role VARCHAR,
  context_supporting_role VARCHAR,
  context_system_constraint VARCHAR,
  changes_from_previous_version TEXT
);
```

---

## Component Type Rules

### ABIE (Aggregate Business Information Entity)

**Required fields**:
- `component_name`
- `dictionary_entry_name`
- `object_class`
- `definition`

**Must NOT have**:
- `property_term`
- `representation_term`

**Example**: Address. Details

### BBIE (Basic Business Information Entity)

**Required fields**:
- `component_name`
- `dictionary_entry_name`
- `object_class` (inherited from parent ABIE)
- `property_term`
- `representation_term`
- `definition`

**Example**: Address. City Name. Text

### ASBIE (Association Business Information Entity)

**Required fields**:
- `component_name`
- `dictionary_entry_name`
- `object_class` (inherited from parent ABIE)
- `property_term`
- `associated_object_class`
- `definition`

**Must NOT have**:
- `representation_term`

**Example**: Address. Country

### MA (Document/Main Aggregate)

**Same as ABIE** but represents a document type (Invoice, Order, etc.)

---

## Validation Rules

### Required Fields (All Types)

- `component_name`
- `dictionary_entry_name` (must be unique)
- `component_type`
- `cardinality`
- `definition`

### Valid Cardinalities

Standard:
- `0..1` - Optional, single
- `1..1` - Mandatory, single
- `0..n` - Optional, multiple
- `1..n` - Mandatory, multiple

For Endorsed Cardinality only:
- `0` - Deprecated (short form)
- `0..0` - Deprecated (explicit form)

### DictionaryEntryName Format

Must follow CCTS convention:
- ABIE: `{ObjectClass}. Details`
- BBIE: `{ObjectClass}. {PropertyTerm}. {RepresentationTerm}`
- ASBIE: `{ObjectClass}. {PropertyTerm}`
- Must contain `. ` (period space)
- Cannot start or end with period

---

## Key Takeaways

1. **Store spreadsheet columns, not GeneriCode columns** - Database should match spreadsheet structure
2. **26 columns for Library/Documents** - Not "26+" but exactly 26
3. **32 columns for Signatures** - Completely different structure
4. **Property Term is 3-part** - Qualifier, PossessiveNoun, PrimaryNoun
5. **Endorsed columns enable two models** - Full and endorsed from same source
6. **Five columns dropped** - But still store them in database for editing
7. **ModelName is derived** - From worksheet name, not stored in spreadsheet
8. **All GeneriCode columns are strings** - No complex types
9. **Empty values omitted** - Don't generate `<Value>` for nulls

---

## Reference

- **Sample**: See `data/minimal-example.gc.xml`
- **Schema**: `utilities/genericode/xsd/genericode.xsd` in OASIS UBL repo
- **Transformation**: `utilities/Crane-ods2obdgc/Crane-ods2obdgc.xsl`
