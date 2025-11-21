# Google Sheets to GeneriCode Mapping

## Overview

This document explains how data from the three Google Sheets (Library, Documents, Signatures) maps to GeneriCode XML format. The transformation is primarily **structural** - converting tabular spreadsheet data to hierarchical XML - with minimal business logic applied.

---

## The Three Spreadsheets

### 1. Library Spreadsheet
- **URL**: https://docs.google.com/spreadsheets/d/18o1YqjHWUw0-s8mb3ja4i99obOUhs-4zpgso6RZrGaY
- **Contains**: Reusable library components (Address, Party, Amount, etc.)
- **Worksheets**: One per ABIE (e.g., "Address", "Party", "Invoice Line")
- **Rows**: ABIE definition + its BBIEs and ASBIEs

### 2. Documents Spreadsheet
- **URL**: https://docs.google.com/spreadsheets/d/1024Th-Uj8cqliNEJc-3pDOR7DxAAW7gCG4e-pbtarsg
- **Contains**: Document-level structures (Invoice, Order, etc.)
- **Worksheets**: One per document type
- **Rows**: Document definition (MA component type) + its children

### 3. Signatures Spreadsheet
- **URL**: https://docs.google.com/spreadsheets/d/1T6z2NZ4mc69YllZOXE5TnT5Ey-FlVtaXN1oQ4AIMp7g
- **Contains**: Digital signature extension components
- **Worksheets**: Signature-related ABIEs
- **Rows**: Similar structure to Library

---

## Spreadsheet Structure

### Worksheet Organization

Each **worksheet** represents one model (ABIE or Document):
- **Worksheet name** = ModelName in GeneriCode
- **First row** = Column headers (map to ColumnSet)
- **Subsequent rows** = Entity data (map to SimpleCodeList rows)
- **End marker**: Row containing only "END" terminates processing

### Column Layout (26+ columns)

The spreadsheets follow the **OASIS Business Document Naming and Design Rules** structure:

| Column | Label | Purpose |
|--------|-------|---------|
| A | ModelName | Usually blank (auto-populated from worksheet name) |
| B | ComponentType | ABIE, BBIE, ASBIE, or MA |
| C | DictionaryEntryName | Unique identifier (Primary Key) |
| D | UID | Numeric unique ID |
| E | ComponentName | Short name of the component |
| F | Definition | Human-readable description |
| G | Cardinality | 0..1, 1..1, 0..n, 1..n |
| H | ObjectClassTermQualifier | Qualifiers (e.g., "Buyer") |
| I | ObjectClassTerm | Object class (e.g., "Party") |
| J | PropertyTermQualifier | Property qualifiers |
| K | PropertyTerm | Property name (for BBIEs) |
| L | RepresentationTermQualifier | Representation qualifiers |
| M | RepresentationTerm | Code, Text, Identifier, Amount, etc. |
| N | DataTypeQualifier | Data type qualifiers |
| O | DataType | Referenced data type name |
| P | AssociatedObjectClassTermQualifier | For ASBIEs |
| Q | AssociatedObjectClassTerm | Associated class for ASBIEs |
| R | AlternativeBusinessTerms | Synonyms/aliases |
| S | Examples | Example values |
| T | PrimitiveTerm | XSD primitive (string, decimal, etc.) |
| U | UsageRule | Business rules and constraints |
| V | LanguageCode | ISO 639-1 language code |
| W | UBLVersionID | Version when introduced |
| X | UBLVersionReason | Reason for version change |
| Y | ComponentVersion | Component-specific version |
| Z | ModificationReason | Reason for modification |
| AA+ | (Additional columns as needed) |

---

## Transformation Process

### Current Pipeline

```
Google Sheets → Download as ODS → XSLT Transform → GeneriCode XML
```

### Transformation Steps

1. **Download**: Google Sheets exported as ODS (OpenDocument Spreadsheet) binary
2. **Parse**: XSLT reads ODS XML structure
3. **Extract Worksheets**: Each worksheet becomes part of the GeneriCode file
4. **Header Row → ColumnSet**: First row defines columns
5. **Data Rows → SimpleCodeList**: Remaining rows become `<Row>` elements
6. **Inject Metadata**: `Identification` section added from `ident-UBL.xml`
7. **Add Key**: `DictionaryEntryName` key constraint added
8. **Output**: Valid GeneriCode XML file

---

## Direct Mapping Rules

### Spreadsheet → GeneriCode Equivalence

| Spreadsheet Concept | GeneriCode Element |
|---------------------|-------------------|
| Workbook | Split into 2 files (main + signatures) |
| Worksheet | `ModelName` column value |
| Header Row (Row 1) | `<ColumnSet>` definitions |
| Column Header Text | `<Column><LongName>` |
| Column Header (normalized) | `<Column><ShortName>` and `@Id` |
| Data Row | `<Row>` |
| Cell Value | `<Value><SimpleValue>` |
| Column Letter | Position in row |
| Empty Cell | (Omitted - no `<Value>` element) |

### Example Mapping

**Spreadsheet:**

```
Worksheet: Address

| ModelName | ComponentType | DictionaryEntryName | Definition |
|-----------|---------------|---------------------|------------|
|           | ABIE          | Address. Details    | A class... |
|           | BBIE          | Address. City Name  | The name...|
```

**GeneriCode:**

```xml
<ColumnSet>
  <Column Id="model-name" Use="required">
    <ShortName>ModelName</ShortName>
    <LongName>Model Name</LongName>
    <Data Type="string"/>
  </Column>
  <!-- ... other columns ... -->
</ColumnSet>

<SimpleCodeList>
  <Row>
    <Value ColumnRef="model-name">
      <SimpleValue>Address</SimpleValue>
    </Value>
    <Value ColumnRef="component-type">
      <SimpleValue>ABIE</SimpleValue>
    </Value>
    <Value ColumnRef="dictionary-entry-name">
      <SimpleValue>Address. Details</SimpleValue>
    </Value>
    <Value ColumnRef="definition">
      <SimpleValue>A class...</SimpleValue>
    </Value>
  </Row>
  <Row>
    <Value ColumnRef="model-name">
      <SimpleValue>Address</SimpleValue>
    </Value>
    <Value ColumnRef="component-type">
      <SimpleValue>BBIE</SimpleValue>
    </Value>
    <Value ColumnRef="dictionary-entry-name">
      <SimpleValue>Address. City Name</SimpleValue>
    </Value>
    <Value ColumnRef="definition">
      <SimpleValue>The name...</SimpleValue>
    </Value>
  </Row>
</SimpleCodeList>
```

---

## Special Transformations

### 1. ModelName Auto-Population

**Spreadsheet Reality**: ModelName column (A) is typically **blank** in the sheets.

**XSLT Logic**: The transformation automatically populates `ModelName` from the worksheet name:

```
Worksheet "Address" → All rows get ModelName = "Address"
Worksheet "Invoice" → All rows get ModelName = "Invoice"
```

This is the **primary derived value** in the transformation.

### 2. Column ID Normalization

**Spreadsheet Headers**: "Dictionary Entry Name" (with spaces)

**GeneriCode Column ID**: `dictionary-entry-name` (kebab-case)

**Normalization Rules**:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep only alphanumeric and hyphens

### 3. Worksheet Name Truncation/Restoration

**Problem**: Google Sheets truncates worksheet names to 31 characters.

**Solution**: The XSLT parameter `name-massage-file` can map truncated names to full names:

```xml
<massageModelName>
  <from>Buyer Customer Party. Despat...</from>
  <to>Buyer Customer Party. Despatch. Line Reference. Line</to>
</massageModelName>
```

This restores full ModelName values during transformation.

### 4. Empty Cell Handling

**Spreadsheet**: Empty cells exist but have no content

**GeneriCode**: Empty cells are **omitted entirely** - no `<Value>` element created

This keeps the XML compact and avoids semantic issues with empty strings vs. nulls.

### 5. Whitespace Normalization

**XSLT Behavior**:
- Leading/trailing whitespace is trimmed
- Internal whitespace is preserved
- Line breaks within cells are maintained

---

## Three-Sheet Merge Strategy

### Current Approach: Two Output Files

The three spreadsheets combine into **two GeneriCode files**:

1. **UBL-Entities-{version}.gc**
   - Contains: Library sheet + Documents sheet
   - All library ABIEs and document MAs

2. **UBL-Signature-Entities-{version}.gc**
   - Contains: Signatures sheet only
   - Signature-specific components

### Why Two Files?

- **Modularity**: Signatures are optional in many UBL implementations
- **Separation of Concerns**: Base UBL vs. extensions
- **Backwards Compatibility**: UBL 2.x has always had separate signature schemas

### Merge Logic

**Within each file**:
- All worksheets are processed in sequence
- Rows from all sheets appear in one `<SimpleCodeList>`
- `ModelName` distinguishes which worksheet each row came from

**No deduplication**: If the same component appears in multiple sheets (rare), it appears multiple times.

---

## Validation During Transformation

The XSLT transformation enforces several rules:

### 1. DictionaryEntryName Required
Every row must have a `DictionaryEntryName` value (becomes the primary key).

### 2. Header Row Present
The first row of each worksheet must contain column headers.

### 3. Data Type Consistency
All values are treated as strings - no type validation at transformation time.

### 4. Worksheet Name Valid
Worksheet names must be valid XML string values (no control characters).

---

## Data That Doesn't Transform

### From Spreadsheets (Ignored)
- **Cell formatting**: Bold, colors, fonts → Lost
- **Comments/Notes**: Cell comments → Not transferred
- **Formulas**: Calculated cells → Only resulting values transferred
- **Conditional formatting**: Rules → Lost
- **Data validation rules**: Dropdowns, constraints → Lost
- **Protected cells**: Cell locking → Lost
- **Hidden rows/columns**: → Typically ignored (implementation-dependent)

### Generated in GeneriCode (Not in Sheets)
- **`<Identification>` section**: Injected from `ident-UBL.xml`
- **`<Key>` constraint**: Added by XSLT
- **Column IDs**: Derived from headers
- **XML structure**: The entire hierarchical format

---

## Round-Trip Considerations

### Can You Go Back? (GeneriCode → Spreadsheet)

**Technically yes**, with caveats:

**Lossless**:
- All data values can be restored
- Column structure can be rebuilt
- Worksheets can be recreated from `ModelName` grouping

**Lossy**:
- Formatting is gone
- Comments are gone
- Formulas must be rewritten
- Original column order may be lost

**The `Crane-gc2odsxml` utility** in the OASIS repo can convert GeneriCode back to ODS XML format.

---

## Example: Complete Transformation

### Input Spreadsheet (Worksheet: "Address")

```
| Model Name | Component Type | Dictionary Entry Name  | Definition                                      |
|------------|----------------|------------------------|-------------------------------------------------|
|            | ABIE           | Address. Details       | A class to define common information related... |
|            | BBIE           | Address. Postbox       | A post office box number.                       |
|            | ASBIE          | Address. Country       | The country in which this address is located.   |
```

### Output GeneriCode (Simplified)

```xml
<gc:CodeList>
  <Identification>
    <ShortName>UBL-2.5-CSD02</ShortName>
    <Version>2.5</Version>
    <!-- ... from ident-UBL.xml ... -->
  </Identification>

  <ColumnSet>
    <Column Id="model-name" Use="required">
      <ShortName>ModelName</ShortName>
      <LongName>Model Name</LongName>
      <Data Type="string"/>
    </Column>
    <Column Id="component-type" Use="required">
      <ShortName>ComponentType</ShortName>
      <LongName>Component Type</LongName>
      <Data Type="string"/>
    </Column>
    <Column Id="dictionary-entry-name" Use="required">
      <ShortName>DictionaryEntryName</ShortName>
      <LongName>Dictionary Entry Name</LongName>
      <Data Type="string"/>
    </Column>
    <Column Id="definition" Use="optional">
      <ShortName>Definition</ShortName>
      <LongName>Definition</LongName>
      <Data Type="string"/>
    </Column>
    <Key Id="dictionary-entry-name-key">
      <ColumnRef Ref="dictionary-entry-name"/>
    </Key>
  </ColumnSet>

  <SimpleCodeList>
    <Row>
      <Value ColumnRef="model-name">
        <SimpleValue>Address</SimpleValue>
      </Value>
      <Value ColumnRef="component-type">
        <SimpleValue>ABIE</SimpleValue>
      </Value>
      <Value ColumnRef="dictionary-entry-name">
        <SimpleValue>Address. Details</SimpleValue>
      </Value>
      <Value ColumnRef="definition">
        <SimpleValue>A class to define common information related...</SimpleValue>
      </Value>
    </Row>

    <Row>
      <Value ColumnRef="model-name">
        <SimpleValue>Address</SimpleValue>
      </Value>
      <Value ColumnRef="component-type">
        <SimpleValue>BBIE</SimpleValue>
      </Value>
      <Value ColumnRef="dictionary-entry-name">
        <SimpleValue>Address. Postbox</SimpleValue>
      </Value>
      <Value ColumnRef="definition">
        <SimpleValue>A post office box number.</SimpleValue>
      </Value>
    </Row>

    <Row>
      <Value ColumnRef="model-name">
        <SimpleValue>Address</SimpleValue>
      </Value>
      <Value ColumnRef="component-type">
        <SimpleValue>ASBIE</SimpleValue>
      </Value>
      <Value ColumnRef="dictionary-entry-name">
        <SimpleValue>Address. Country</SimpleValue>
      </Value>
      <Value ColumnRef="definition">
        <SimpleValue>The country in which this address is located.</SimpleValue>
      </Value>
    </Row>
  </SimpleCodeList>
</gc:CodeList>
```

---

## Implementation Implications

### For Website Development

When building a website to replace Google Sheets:

**You DO need**:
- Database/storage for all 26+ column values
- Ability to group entities by "model" (worksheet equivalent)
- Export logic that creates the XML structure
- Injection of metadata from configuration

**You DON'T need**:
- ODS file generation - go straight to GeneriCode
- Complex transformation logic - it's mostly structural
- Spreadsheet engine - you're not emulating Excel/Sheets

**Critical data requirements**:
- Preserve all 26+ columns exactly as defined
- Maintain `DictionaryEntryName` uniqueness
- Track which "model" each entity belongs to
- Handle empty/null values appropriately

---

## Key Takeaways

1. **Mostly Mechanical**: The transformation is primarily format conversion, not complex business logic

2. **ModelName is Derived**: The main "calculated" field - comes from worksheet names, not cell data

3. **Three Sheets → Two Files**: Library + Documents = main file, Signatures = separate file

4. **Direct Generation Viable**: No need to create ODS files; generate GeneriCode XML directly

5. **Column Order Flexible**: Order doesn't matter as long as `ColumnRef` attributes match `Column/@Id`

6. **Empty Cells Omitted**: Don't generate `<Value>` elements for empty cells

7. **All String Types**: No need for complex type handling - everything is a string

8. **Identification Injected**: The metadata section comes from config, not from the sheets themselves

---

## References

- **Transformation XSLT**: `utilities/Crane-ods2obdgc/Crane-ods2obdgc.xsl`
- **XSLT Documentation**: `utilities/Crane-ods2obdgc/readme-Crane-ods2obdgc.txt`
- **GeneriCode Schema**: `utilities/genericode/xsd/genericode.xsd`
- **Metadata Source**: `ident-UBL.xml` in UBL repository root
