# GeneriCode Generation Requirements

## Overview

This document specifies what data must be available and what validation must occur to generate valid GeneriCode XML files from the website. It serves as a blueprint for developers implementing the export functionality.

---

## Data Requirements

### Core Entity Data

To generate GeneriCode files, the website must store and provide all **26+ standard UBL columns** for each entity:

#### Required Fields (Cannot be NULL)

| Field | Description | Validation |
|-------|-------------|------------|
| `model_name` | Model/ABIE name (worksheet equivalent) | Non-empty string |
| `component_type` | ABIE, BBIE, ASBIE, or MA | Enum: ABIE\|BBIE\|ASBIE\|MA |
| `dictionary_entry_name` | Unique identifier (primary key) | Unique, non-empty, CCTS format |
| `component_name` | Short name of component | Non-empty string |
| `definition` | Human-readable description | Non-empty string |
| `cardinality` | Multiplicity | Enum: 0..1\|1..1\|0..n\|1..n |

#### Conditionally Required Fields

Based on `component_type`:

**For ABIEs**:
- `object_class_term` (required)
- `property_term` must be NULL
- `representation_term` must be NULL

**For BBIEs**:
- `property_term` (required)
- `representation_term` (required)
- `object_class_term` (inherited from parent ABIE)

**For ASBIEs**:
- `associated_object_class_term` (required)
- `property_term` (required)
- `object_class_term` (inherited from parent ABIE)

**For Documents (MA)**:
- `object_class_term` (required)
- Structure similar to ABIEs

#### Optional Fields

All other fields are optional but should be supported:

| Field | Purpose |
|-------|---------|
| `uid` | Numeric unique ID |
| `object_class_term_qualifier` | Qualifiers like "Buyer", "Seller" |
| `property_term_qualifier` | Property qualifiers |
| `representation_term_qualifier` | Representation qualifiers |
| `data_type_qualifier` | Data type qualifiers |
| `data_type` | Associated data type name |
| `associated_object_class_term_qualifier` | ASBIE qualifiers |
| `alternative_business_terms` | Synonyms/aliases |
| `examples` | Example values |
| `primitive_term` | XSD primitive (string, decimal, etc.) |
| `usage_rule` | Business rules and constraints |
| `language_code` | ISO 639-1 code (e.g., "en") |
| `ubl_version_id` | Version when introduced |
| `ubl_version_reason` | Reason for change |
| `component_version` | Component-specific version |
| `modification_reason` | Reason for modification |

---

## Metadata Requirements

### Configuration Data (From ident-UBL.xml equivalent)

The website must maintain configuration for GeneriCode metadata:

```javascript
{
  "shortName": "UBL-2.5-CSD02",
  "longName": "UBL 2.5 CSD02 Business Entity Summary",
  "version": "2.5",
  "stage": "CSD02",
  "canonicalUri": "urn:oasis:names:specification:ubl:BIE",
  "canonicalVersionUri": "urn:oasis:names:specification:ubl:BIE:2.5",
  "locationUri": "https://docs.oasis-open.org/ubl/csd02-UBL-2.5/gc/UBL-Entities-2.5-CSD02.gc",
  "agency": {
    "longName": "OASIS Universal Business Language TC",
    "identifier": "UBL"
  }
}
```

**Storage Options**:
- Configuration file (JSON/YAML)
- Database table
- Environment variables
- Admin interface for editing

**Update Frequency**:
- Only when UBL version or stage changes
- Rarely (once per major release cycle)

---

## Data Model Relationships

### Entity Hierarchy

```
Model (e.g., "Address")
  └─ ABIE: Address. Details
       ├─ BBIE: Address. Street Name
       ├─ BBIE: Address. City Name
       ├─ BBIE: Address. Postal Zone
       └─ ASBIE: Address. Country
```

**Database representation**:
- Flat table with `model_name` grouping
- Parent-child relationships implicit (not enforced in GeneriCode)
- All entities in single table or separate tables per type

### File Grouping

**Three logical groups** (corresponds to original spreadsheets):

1. **Library**: `type = 'library'`
   - Reusable components (Address, Party, Amount, etc.)
   - Goes into: `UBL-Entities-{version}.gc`

2. **Documents**: `type = 'document'`
   - Document types (Invoice, Order, etc.)
   - `component_type = 'MA'`
   - Goes into: `UBL-Entities-{version}.gc` (same file as Library)

3. **Signatures**: `type = 'signature'`
   - Digital signature components
   - Goes into: `UBL-Signature-Entities-{version}.gc` (separate file)

**Query strategy**:
```sql
-- Main entities file
SELECT * FROM entities
WHERE type IN ('library', 'document')
ORDER BY model_name, component_type;

-- Signature entities file
SELECT * FROM entities
WHERE type = 'signature'
ORDER BY model_name, component_type;
```

---

## Validation Rules

### Pre-Export Validation

Before generating GeneriCode, validate:

#### 1. Required Field Validation

```javascript
function validateRequiredFields(entity) {
  const required = [
    'model_name',
    'component_type',
    'dictionary_entry_name',
    'component_name',
    'definition',
    'cardinality'
  ];

  for (const field of required) {
    if (!entity[field] || entity[field].trim() === '') {
      throw new Error(`Required field ${field} is missing for entity ${entity.id}`);
    }
  }
}
```

#### 2. Component Type Validation

```javascript
function validateComponentType(entity) {
  const validTypes = ['ABIE', 'BBIE', 'ASBIE', 'MA'];
  if (!validTypes.includes(entity.component_type)) {
    throw new Error(`Invalid component_type: ${entity.component_type}`);
  }
}
```

#### 3. Type-Specific Validation

```javascript
function validateTypeSpecificFields(entity) {
  switch (entity.component_type) {
    case 'ABIE':
      if (!entity.object_class_term) {
        throw new Error('ABIEs must have object_class_term');
      }
      if (entity.property_term) {
        throw new Error('ABIEs must not have property_term');
      }
      break;

    case 'BBIE':
      if (!entity.property_term || !entity.representation_term) {
        throw new Error('BBIEs must have property_term and representation_term');
      }
      break;

    case 'ASBIE':
      if (!entity.associated_object_class_term) {
        throw new Error('ASBIEs must have associated_object_class_term');
      }
      break;

    case 'MA':
      if (!entity.object_class_term) {
        throw new Error('Documents (MA) must have object_class_term');
      }
      break;
  }
}
```

#### 4. Uniqueness Validation

```javascript
function validateUniqueness(entities) {
  const denSet = new Set();
  const duplicates = [];

  for (const entity of entities) {
    const den = entity.dictionary_entry_name;
    if (denSet.has(den)) {
      duplicates.push(den);
    } else {
      denSet.add(den);
    }
  }

  if (duplicates.length > 0) {
    throw new Error(`Duplicate DictionaryEntryNames found: ${duplicates.join(', ')}`);
  }
}
```

#### 5. Cardinality Validation

```javascript
function validateCardinality(entity) {
  const validCardinalities = ['0..1', '1..1', '0..n', '1..n'];
  if (!validCardinalities.includes(entity.cardinality)) {
    throw new Error(`Invalid cardinality: ${entity.cardinality}`);
  }
}
```

#### 6. DictionaryEntryName Format Validation

```javascript
function validateDENFormat(entity) {
  // CCTS format: ObjectClass. PropertyTerm. Representation
  // Examples:
  //   "Address. Details" (ABIE)
  //   "Address. City Name. Text" (BBIE)
  //   "Address. Country" (ASBIE)

  const den = entity.dictionary_entry_name;

  // Must contain at least one period
  if (!den.includes('. ')) {
    throw new Error(`Invalid DEN format: ${den} (must contain '. ')`);
  }

  // Must not start or end with period
  if (den.startsWith('.') || den.endsWith('.')) {
    throw new Error(`Invalid DEN format: ${den} (cannot start/end with period)`);
  }
}
```

---

## Generation Algorithm

### High-Level Process

```
1. Fetch entity data from database
2. Validate all entities
3. Group into Library+Documents vs. Signatures
4. Sort entities appropriately
5. Generate XML structure
6. Validate XML against schema
7. Return or save file
```

### Detailed Algorithm

```javascript
async function generateGeneriCodeFile(options) {
  // Step 1: Fetch data
  const entities = await fetchEntities({
    version: options.version,
    types: options.types // ['library', 'document'] or ['signature']
  });

  // Step 2: Validate entities
  for (const entity of entities) {
    validateRequiredFields(entity);
    validateComponentType(entity);
    validateTypeSpecificFields(entity);
    validateCardinality(entity);
    validateDENFormat(entity);
  }
  validateUniqueness(entities);

  // Step 3: Sort entities
  entities.sort((a, b) => {
    // Primary: model_name
    if (a.model_name !== b.model_name) {
      return a.model_name.localeCompare(b.model_name);
    }
    // Secondary: component_type (ABIE, BBIE, ASBIE, MA)
    const typeOrder = { 'ABIE': 1, 'MA': 1, 'BBIE': 2, 'ASBIE': 3 };
    if (typeOrder[a.component_type] !== typeOrder[b.component_type]) {
      return typeOrder[a.component_type] - typeOrder[b.component_type];
    }
    // Tertiary: dictionary_entry_name
    return a.dictionary_entry_name.localeCompare(b.dictionary_entry_name);
  });

  // Step 4: Fetch metadata
  const metadata = await fetchMetadata(options.version);

  // Step 5: Generate XML
  const xml = buildGeneriCodeXML({
    metadata,
    entities,
    columns: getColumnDefinitions()
  });

  // Step 6: Validate XML
  await validateXMLSchema(xml);

  // Step 7: Return
  return xml;
}
```

---

## XML Generation

### Building the Identification Section

```javascript
function buildIdentification(metadata) {
  return `
    <Identification>
      <ShortName>${escapeXML(metadata.shortName)}</ShortName>
      <LongName xml:lang="en">${escapeXML(metadata.longName)}</LongName>
      <Version>${escapeXML(metadata.version)}</Version>
      <CanonicalUri>${escapeXML(metadata.canonicalUri)}</CanonicalUri>
      <CanonicalVersionUri>${escapeXML(metadata.canonicalVersionUri)}</CanonicalVersionUri>
      <LocationUri>${escapeXML(metadata.locationUri)}</LocationUri>
      <Agency>
        <LongName xml:lang="en">${escapeXML(metadata.agency.longName)}</LongName>
        <Identifier>${escapeXML(metadata.agency.identifier)}</Identifier>
      </Agency>
    </Identification>
  `;
}
```

### Building the ColumnSet Section

```javascript
function buildColumnSet() {
  const columns = [
    { id: 'model-name', shortName: 'ModelName', longName: 'Model Name', use: 'required' },
    { id: 'component-type', shortName: 'ComponentType', longName: 'Component Type', use: 'required' },
    { id: 'dictionary-entry-name', shortName: 'DictionaryEntryName', longName: 'Dictionary Entry Name', use: 'required' },
    // ... all 26+ columns ...
  ];

  let xml = '<ColumnSet>\n';

  for (const col of columns) {
    xml += `  <Column Id="${col.id}" Use="${col.use}">
    <ShortName>${col.shortName}</ShortName>
    <LongName>${col.longName}</LongName>
    <Data Type="string"/>
  </Column>
`;
  }

  xml += `  <Key Id="dictionary-entry-name-key">
    <ShortName>DictionaryEntryNameKey</ShortName>
    <LongName>The unique name for a dictionary entry</LongName>
    <ColumnRef Ref="dictionary-entry-name"/>
  </Key>
</ColumnSet>
`;

  return xml;
}
```

### Building the SimpleCodeList Section

```javascript
function buildSimpleCodeList(entities) {
  let xml = '<SimpleCodeList>\n';

  for (const entity of entities) {
    xml += '  <Row>\n';

    // Map database fields to GeneriCode columns
    const fieldMappings = {
      'model-name': entity.model_name,
      'component-type': entity.component_type,
      'dictionary-entry-name': entity.dictionary_entry_name,
      'uid': entity.uid,
      'component-name': entity.component_name,
      'definition': entity.definition,
      'cardinality': entity.cardinality,
      // ... all fields ...
    };

    for (const [columnId, value] of Object.entries(fieldMappings)) {
      // Only include non-null, non-empty values
      if (value !== null && value !== undefined && value !== '') {
        xml += `    <Value ColumnRef="${columnId}">
      <SimpleValue>${escapeXML(value)}</SimpleValue>
    </Value>
`;
      }
    }

    xml += '  </Row>\n';
  }

  xml += '</SimpleCodeList>\n';
  return xml;
}
```

### Complete XML Assembly

```javascript
function buildGeneriCodeXML({ metadata, entities, columns }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<gc:CodeList
  xmlns:gc="http://docs.oasis-open.org/codelist/ns/genericode/1.0/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://docs.oasis-open.org/codelist/ns/genericode/1.0/ genericode.xsd">

${buildIdentification(metadata)}

${buildColumnSet()}

${buildSimpleCodeList(entities)}

</gc:CodeList>
`;
}
```

---

## Edge Cases and Error Handling

### Empty Models

**Scenario**: A model has no BBIEs or ASBIEs (only ABIE definition)

**Handling**: Valid - include the ABIE row, may happen for placeholder models

**Example**:
```xml
<Row>
  <Value ColumnRef="model-name"><SimpleValue>FutureModel</SimpleValue></Value>
  <Value ColumnRef="component-type"><SimpleValue>ABIE</SimpleValue></Value>
  <Value ColumnRef="dictionary-entry-name"><SimpleValue>FutureModel. Details</SimpleValue></Value>
  <Value ColumnRef="definition"><SimpleValue>Reserved for future use.</SimpleValue></Value>
</Row>
```

### Missing Optional Fields

**Scenario**: Entity has NULL values for optional columns

**Handling**: Omit the `<Value>` element entirely (don't create empty tags)

**Correct**:
```xml
<Row>
  <Value ColumnRef="component-name"><SimpleValue>Address</SimpleValue></Value>
  <!-- object_class_term_qualifier is NULL, so omitted -->
  <Value ColumnRef="object-class-term"><SimpleValue>Address</SimpleValue></Value>
</Row>
```

**Incorrect**:
```xml
<Row>
  <Value ColumnRef="component-name"><SimpleValue>Address</SimpleValue></Value>
  <Value ColumnRef="object-class-term-qualifier"><SimpleValue></SimpleValue></Value>
  <Value ColumnRef="object-class-term"><SimpleValue>Address</SimpleValue></Value>
</Row>
```

### Special Characters in Values

**Scenario**: Definition contains `<`, `>`, `&`, quotes

**Handling**: XML-escape all values

```javascript
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### Multi-line Definitions

**Scenario**: Definition contains line breaks

**Handling**: Preserve line breaks (valid in XML)

```xml
<Value ColumnRef="definition">
  <SimpleValue>Line 1.
Line 2.
Line 3.</SimpleValue>
</Value>
```

### Large Exports

**Scenario**: Exporting 3,500+ entities (2+ MB file)

**Handling**:
- Stream XML generation (don't build entire string in memory)
- Use XML generator library with streaming support
- Provide download link rather than inline response
- Consider background job for very large exports

```javascript
// Streaming approach (Node.js example)
const { Readable } = require('stream');

async function streamGeneriCodeXML(res, entities, metadata) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', 'attachment; filename="UBL-Entities.gc"');

  // Write header
  res.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  res.write('<gc:CodeList ...>\n');

  res.write(buildIdentification(metadata));
  res.write(buildColumnSet());
  res.write('<SimpleCodeList>\n');

  // Stream rows
  for (const entity of entities) {
    res.write(buildRow(entity));
  }

  res.write('</SimpleCodeList>\n');
  res.write('</gc:CodeList>');
  res.end();
}
```

---

## Performance Considerations

### Query Optimization

**Fetch all needed data in single query**:
```sql
SELECT
  model_name,
  component_type,
  dictionary_entry_name,
  -- all 26+ columns --
FROM entities
WHERE type IN ('library', 'document')
  AND version = '2.5'
ORDER BY model_name, component_type;
```

**Avoid N+1 queries**: Don't fetch each entity individually

### Caching Strategy

**Cache metadata** (rarely changes):
```javascript
const metadataCache = new Map();

async function getMetadata(version) {
  if (!metadataCache.has(version)) {
    metadataCache.set(version, await fetchMetadata(version));
  }
  return metadataCache.get(version);
}
```

**Cache column definitions** (never change):
```javascript
const COLUMN_DEFINITIONS = [ /* ... */ ]; // Global constant
```

### Validation Caching

**Validate on save, not on export**:
- Run validation when entities are created/updated
- Store validation status in database
- Only re-validate changed entities on export

---

## Testing Strategy

### Unit Tests

Test individual validation functions:
```javascript
describe('validateRequiredFields', () => {
  it('should throw error for missing model_name', () => {
    const entity = { component_type: 'ABIE', /* ... */ };
    expect(() => validateRequiredFields(entity)).toThrow('model_name is missing');
  });
});
```

### Integration Tests

Test full generation process:
```javascript
describe('generateGeneriCodeFile', () => {
  it('should generate valid XML for sample data', async () => {
    const xml = await generateGeneriCodeFile({
      version: '2.5',
      types: ['library']
    });

    // Validate against schema
    expect(await validateXMLSchema(xml)).toBe(true);

    // Check structure
    expect(xml).toContain('<gc:CodeList');
    expect(xml).toContain('<Identification>');
  });
});
```

### Validation Tests

Test against actual GeneriCode schema:
```javascript
const libxmljs = require('libxmljs');

async function validateXMLSchema(xml) {
  const xsdDoc = libxmljs.parseXml(await readFile('genericode.xsd'));
  const xmlDoc = libxmljs.parseXml(xml);
  return xmlDoc.validate(xsdDoc);
}
```

### Regression Tests

Compare generated output with known-good files:
```javascript
it('should match known-good UBL 2.4 output', async () => {
  const generated = await generateGeneriCodeFile({ version: '2.4' });
  const expected = await readFile('test-data/UBL-Entities-2.4.gc');

  // Normalize for comparison (whitespace, order, etc.)
  expect(normalize(generated)).toEqual(normalize(expected));
});
```

---

## Minimum Viable Product (MVP)

### MVP Scope

For initial implementation, focus on:

**Required**:
- ✅ Export library entities to GeneriCode
- ✅ Include all 26+ standard columns
- ✅ Validate required fields and uniqueness
- ✅ Generate valid XML structure
- ✅ Schema validation

**Optional (can defer)**:
- ⏸️ Documents export (if focusing on library first)
- ⏸️ Signatures export (less commonly used)
- ⏸️ Historical version exports
- ⏸️ Incremental/delta exports
- ⏸️ Round-trip import

### MVP Data Requirements

**Minimum columns**:
- model_name
- component_type
- dictionary_entry_name
- component_name
- definition
- cardinality
- object_class_term
- property_term
- representation_term

**Other columns**: Can be NULL for MVP

### MVP Validation

**Critical validations**:
- Required fields present
- DictionaryEntryName unique
- Component type valid (ABIE, BBIE, ASBIE)
- XML well-formed

**Defer**:
- CCTS naming rules validation
- Cross-reference validation
- Completeness checks

---

## Key Takeaways for Developers

1. **Store all 26+ columns**: Don't try to compute fields on the fly during export

2. **Validate on save**: Run validation when entities are created/updated, not just on export

3. **DictionaryEntryName is sacred**: Enforce uniqueness at database level

4. **Omit empty values**: Don't create `<Value>` elements for NULL/empty fields

5. **XML escape everything**: User input can contain special characters

6. **Stream large exports**: Don't load 3,500 entities into memory at once

7. **Test against real schema**: Use `xmllint` or equivalent to validate output

8. **Sort for diffing**: Consistent ordering helps with version control

9. **Metadata from config**: Don't hard-code version info in the code

10. **Start simple**: MVP doesn't need all features - focus on core export first

---

## References

- **Format Specification**: `format-specification.md`
- **Sheet Mapping**: `sheet-to-gc-mapping.md`
- **Pipeline Integration**: `pipeline-integration.md`
- **GeneriCode XSD**: `utilities/genericode/xsd/genericode.xsd` in OASIS UBL repository
