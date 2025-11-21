# GeneriCode XML Format Specification

## Overview

GeneriCode is an OASIS standard XML format (version 1.0) designed for representing code lists and structured data vocabularies. In the UBL publishing pipeline, GeneriCode files serve as the intermediate representation of UBL Business Information Entities (BIEs) between the source data (Google Sheets) and the schema generation stage.

**Standard**: OASIS GeneriCode 1.0
**Namespace**: `http://docs.oasis-open.org/codelist/ns/genericode/1.0/`
**Schema Location**: `utilities/genericode/xsd/genericode.xsd` in the OASIS UBL repository

## Core Purpose in UBL Pipeline

GeneriCode files in the UBL context represent:
- **Library components**: Reusable ABIEs, BBIEs, and ASBIEs
- **Document structures**: Invoice, Order, and other document types
- **Signature extensions**: Digital signature-related components

Each GeneriCode file acts as a structured table with:
- **Rows** = Individual BIE definitions (one per component)
- **Columns** = Component attributes (ComponentName, Definition, Cardinality, etc.)

---

## XML Structure

### Root Element: `<gc:CodeList>`

All GeneriCode files use `CodeList` as the root element with these namespaces:

```xml
<gc:CodeList
  xmlns:gc="http://docs.oasis-open.org/codelist/ns/genericode/1.0/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://docs.oasis-open.org/codelist/ns/genericode/1.0/ genericode.xsd">
```

### Primary Child Elements

1. **`<Identification>`** - Metadata about the code list
2. **`<ColumnSet>`** - Column definitions (table schema)
3. **`<SimpleCodeList>`** - Data rows
4. **`<Key>`** - Primary key constraint

---

## 1. Identification Section

Contains metadata identifying the GeneriCode file and its version.

### Required Elements

```xml
<Identification>
  <ShortName>UBL-2.5-CSD02</ShortName>
  <LongName xml:lang="en">UBL 2.5 CSD02 Business Entity Summary</LongName>
  <Version>2.5</Version>
  <CanonicalUri>urn:oasis:names:specification:ubl:BIE</CanonicalUri>
  <CanonicalVersionUri>urn:oasis:names:specification:ubl:BIE:2.5</CanonicalVersionUri>
  <LocationUri>https://docs.oasis-open.org/ubl/csd02-UBL-2.5/gc/UBL-Entities-2.5-CSD02.gc</LocationUri>
  <Agency>
    <LongName xml:lang="en">OASIS Universal Business Language TC</LongName>
    <Identifier>UBL</Identifier>
  </Agency>
</Identification>
```

### Field Descriptions

| Element | Purpose | Source |
|---------|---------|--------|
| `ShortName` | Brief identifier (e.g., "UBL-2.5-CSD02") | From `ident-UBL.xml` |
| `LongName` | Human-readable description | From `ident-UBL.xml` |
| `Version` | Version number (e.g., "2.5") | From `ident-UBL.xml` |
| `CanonicalUri` | Permanent URN for the specification | From `ident-UBL.xml` |
| `CanonicalVersionUri` | Version-specific URN | From `ident-UBL.xml` |
| `LocationUri` | Public download URL for the file | From `ident-UBL.xml` |
| `Agency` | Standards organization info | From `ident-UBL.xml` |

**Note**: The entire `<Identification>` section is injected by the ODS-to-GeneriCode transformation process using metadata from `ident-UBL.xml`.

---

## 2. ColumnSet Section

Defines the structure of the data table - equivalent to a database table schema.

### Structure

```xml
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
  <!-- Additional columns... -->
  <Key Id="dictionary-entry-name-key">
    <ShortName>DictionaryEntryNameKey</ShortName>
    <LongName>The unique name for a dictionary entry</LongName>
    <ColumnRef Ref="dictionary-entry-name"/>
  </Key>
</ColumnSet>
```

### Column Attributes

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `Id` | kebab-case string | Unique column identifier |
| `Use` | "required" or "optional" | Whether column must have values |

### Column Child Elements

- **`<ShortName>`**: Normalized identifier (e.g., "ComponentType")
- **`<LongName>`**: Human-readable label (e.g., "Component Type")
- **`<Data Type="...">`**: Data type (typically "string")

### UBL-Specific Columns

The UBL GeneriCode files define **26+ columns** corresponding to the spreadsheet structure:

1. **ModelName** - Worksheet name (ABIE name, Document name, etc.)
2. **ComponentType** - ABIE, BBIE, ASBIE, MA (Document)
3. **DictionaryEntryName** - Unique identifier (primary key)
4. **UID** - Unique ID number
5. **ComponentName** - Name of the component
6. **Definition** - Textual definition
7. **Cardinality** - Multiplicity (0..1, 1..1, 0..n, 1..n)
8. **ObjectClassTermQualifier** - Qualifiers for object class
9. **ObjectClassTerm** - Object class name
10. **PropertyTermQualifier** - Property qualifiers
11. **PropertyTerm** - Property name
12. **RepresentationTermQualifier** - Representation qualifiers
13. **RepresentationTerm** - Representation type (Text, Identifier, Code, etc.)
14. **DataTypeQualifier** - Data type qualifiers
15. **DataType** - Associated data type
16. **AssociatedObjectClassTermQualifier** - For ASBIEs
17. **AssociatedObjectClassTerm** - For ASBIEs
18. **AlternativeBusinessTerms** - Synonyms
19. **Examples** - Example values
20. **PrimitiveTerm** - For BBIE primitives
21. **UsageRule** - Constraints and rules
22. **LanguageCode** - ISO language code
23. **UBLVersionID** - Version introduced
24. **UBLVersionReason** - Reason for change
25. **ComponentVersion** - Component-specific version
26. **ModificationReason** - Reason for modification

**All columns are of type "string"** - no complex types or enumerations.

### Key Constraint

The `<Key>` element enforces uniqueness on `DictionaryEntryName`:

```xml
<Key Id="dictionary-entry-name-key">
  <ShortName>DictionaryEntryNameKey</ShortName>
  <LongName>The unique name for a dictionary entry</LongName>
  <ColumnRef Ref="dictionary-entry-name"/>
</Key>
```

---

## 3. SimpleCodeList Section

Contains the actual data rows - one per BIE entity.

### Structure

```xml
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
      <SimpleValue>A class to define common information related to an address.</SimpleValue>
    </Value>
    <!-- Additional values for remaining columns... -->
  </Row>
  <!-- Additional rows... -->
</SimpleCodeList>
```

### Row Structure

- Each `<Row>` represents one entity (ABIE, BBIE, ASBIE, or Document)
- Each `<Value>` maps to a column via `ColumnRef`
- The `<SimpleValue>` contains the actual string data
- Empty/missing columns are omitted (no empty `<Value>` elements)

### Data Conventions

1. **No empty values**: If a column has no data, the entire `<Value>` element is omitted
2. **String content**: All values are plain text (no rich formatting)
3. **Whitespace**: Leading/trailing whitespace is trimmed
4. **Special characters**: Standard XML escaping applies (`&lt;`, `&gt;`, `&amp;`, etc.)

---

## Validation Rules

### Schema Validation

GeneriCode files must validate against the `genericode.xsd` schema, which enforces:

- Proper namespace declarations
- Required elements present (`Identification`, `ColumnSet`, `SimpleCodeList`)
- `ColumnRef` attributes reference defined columns
- Key constraints are satisfied (uniqueness)

### Business Rules

1. **Primary Key**: `DictionaryEntryName` must be unique across all rows
2. **Column Consistency**: All `ColumnRef` values must match `Column/@Id` values
3. **ModelName Required**: Every row must have a `ModelName` value
4. **ComponentType Required**: Every row must have a valid component type

### UBL-Specific Rules

1. **ABIEs**: Must have `ObjectClassTerm` but no `PropertyTerm`
2. **BBIEs**: Must have both `PropertyTerm` and `RepresentationTerm`
3. **ASBIEs**: Must have `AssociatedObjectClassTerm`
4. **Documents (MA)**: Follow ABIE structure but represent documents

---

## File Naming Conventions

GeneriCode files in the UBL pipeline follow these patterns:

- **Main entities**: `UBL-Entities-{version}-{stage}.gc`
  - Example: `UBL-Entities-2.5-CSD02.gc`

- **Signature entities**: `UBL-Signature-Entities-{version}-{stage}.gc`
  - Example: `UBL-Signature-Entities-2.5-CSD02.gc`

Where:
- `{version}` = UBL version (e.g., "2.5")
- `{stage}` = Publication stage (e.g., "CSD02", "OS")

---

## Ordering Requirements

### Column Order
Columns can be defined in any order within `<ColumnSet>`. The XSLT transformation typically preserves the spreadsheet column order.

### Row Order
Rows within `<SimpleCodeList>` should be ordered for optimal downstream processing:

1. **By ModelName** (alphabetically)
2. **Within each model, by ComponentType**:
   - ABIE (the aggregate itself)
   - BBIE (basic properties)
   - ASBIE (associations)

This ordering is not technically required by the schema but facilitates:
- Human readability
- Consistent diffs in version control
- Predictable schema generation

---

## Size Considerations

- **UBL 2.4 Library**: ~3,500 rows, ~2.5 MB
- **UBL 2.4 Documents**: ~1,800 rows, ~1.2 MB
- **UBL 2.4 Signatures**: ~150 rows, ~100 KB

Files are human-readable but not intended for manual editing due to size.

---

## Example: Minimal GeneriCode File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gc:CodeList
  xmlns:gc="http://docs.oasis-open.org/codelist/ns/genericode/1.0/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://docs.oasis-open.org/codelist/ns/genericode/1.0/ genericode.xsd">

  <Identification>
    <ShortName>UBL-Example</ShortName>
    <LongName xml:lang="en">Example GeneriCode File</LongName>
    <Version>1.0</Version>
    <CanonicalUri>urn:example:gc</CanonicalUri>
    <CanonicalVersionUri>urn:example:gc:1.0</CanonicalVersionUri>
  </Identification>

  <ColumnSet>
    <Column Id="model-name" Use="required">
      <ShortName>ModelName</ShortName>
      <Data Type="string"/>
    </Column>
    <Column Id="dictionary-entry-name" Use="required">
      <ShortName>DictionaryEntryName</ShortName>
      <Data Type="string"/>
    </Column>
    <Key Id="den-key">
      <ColumnRef Ref="dictionary-entry-name"/>
    </Key>
  </ColumnSet>

  <SimpleCodeList>
    <Row>
      <Value ColumnRef="model-name">
        <SimpleValue>ExampleModel</SimpleValue>
      </Value>
      <Value ColumnRef="dictionary-entry-name">
        <SimpleValue>Example. Entry</SimpleValue>
      </Value>
    </Row>
  </SimpleCodeList>

</gc:CodeList>
```

---

## References

- **OASIS GeneriCode 1.0 Specification**: [OASIS Standard](http://docs.oasis-open.org/codelist/cs01-genericode-1.0/)
- **GeneriCode XSD**: `utilities/genericode/xsd/genericode.xsd` in OASIS UBL repository
- **UBL Repository**: https://github.com/oasis-tcs/ubl/tree/ubl-2.5
- **Transformation Tool**: `utilities/Crane-ods2obdgc/Crane-ods2obdgc.xsl`

---

## Key Takeaways for Developers

1. **GeneriCode = Table Format**: Think of it as XML representation of a spreadsheet
2. **Identification = Metadata**: Comes from `ident-UBL.xml`, not from data
3. **ColumnSet = Schema**: Defines 26+ string columns for UBL entities
4. **SimpleCodeList = Data**: One row per BIE, values reference columns
5. **Key Constraint**: `DictionaryEntryName` must be unique
6. **All String Types**: No enums, no complex types - just strings
7. **Direct Generation is Feasible**: No need for ODS intermediate format
