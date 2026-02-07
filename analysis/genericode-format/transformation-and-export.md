# GeneriCode Transformation and Export

**Complete guide for implementing GeneriCode export functionality**

---

## Overview

This document explains:
- How to export full model GeneriCode
- How to export endorsed model GeneriCode  
- How to export signatures GeneriCode
- Complete transformation logic
- Testing and validation

**Key Principle**: Export directly from database to GeneriCode XML. No ODS intermediate format needed.

---

## Three Export Functions Required

### 1. Export Full Model

**Output**: `UBL-Entities-{version}.gc`
**Contains**: All library + document entities
**Cardinality**: Original values
**Endorsed columns**: Included in output

### 2. Export Endorsed Model

**Output**: `UBL-Endorsed-Entities-{version}.gc`
**Contains**: Non-deprecated library + document entities  
**Cardinality**: Endorsed values (when present)
**Endorsed columns**: Removed from output

### 3. Export Signatures

**Output**: `UBL-Signature-Entities-{version}.gc`
**Contains**: All signature entities
**Structure**: Different columns (32 vs 26)

---

## Export Full Model Logic

### Step 1: Fetch Entities

```sql
SELECT *
FROM entities
WHERE entity_type IN ('library', 'document')
ORDER BY model_name, 
         CASE component_type 
           WHEN 'ABIE' THEN 1
           WHEN 'MA' THEN 1
           WHEN 'BBIE' THEN 2
           WHEN 'ASBIE' THEN 3
         END,
         dictionary_entry_name;
```

### Step 2: Validate

Run pre-export validation:
- All required fields present
- DictionaryEntryName unique
- Valid component types
- Valid cardinalities
- Type-specific rules (ABIEs have ObjectClass, etc.)

### Step 3: Build XML Structure

```javascript
function buildFullModelXML(entities, metadata) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gc:CodeList xmlns:gc="..." xmlns:xsi="..." xsi:schemaLocation="...">',
    '',
    buildIdentification(metadata),
    '',
    buildColumnSet(FULL_MODEL_COLUMNS),
    '',
    '<SimpleCodeList>',
    ...entities.map(e => buildRow(e, FULL_MODEL_COLUMN_MAP)),
    '</SimpleCodeList>',
    '',
    '</gc:CodeList>'
  ].join('\n');
  
  return xml;
}
```

### Step 4: Column Mapping

Map database columns to GeneriCode columns:

```javascript
const FULL_MODEL_COLUMN_MAP = {
  // Added by transformation
  'model_name': 'ModelName',
  
  // Direct mappings
  'component_name': 'ComponentName',
  'subset_cardinality': 'Subset',  // Renamed!
  'cardinality': 'Cardinality',
  'definition': 'Definition',
  'alternative_business_terms': 'AlternativeBusinessTerms',
  'examples': 'Examples',
  'dictionary_entry_name': 'DictionaryEntryName',
  'object_class_qualifier': 'ObjectClassQualifier',
  'object_class': 'ObjectClass',
  'property_term_qualifier': 'PropertyTermQualifier',
  'property_term_possessive_noun': 'PropertyTermPossessiveNoun',
  'property_term_primary_noun': 'PropertyTermPrimaryNoun',
  'property_term': 'PropertyTerm',
  'representation_term': 'RepresentationTerm',
  'data_type_qualifier': 'DataTypeQualifier',
  'data_type': 'DataType',
  'associated_object_class_qualifier': 'AssociatedObjectClassQualifier',
  'associated_object_class': 'AssociatedObjectClass',
  'component_type': 'ComponentType',
  'un_tded_code': 'UNTDEDCode',
  'current_version': 'CurrentVersion',
  'editors_notes': 'EditorsNotes',
  
  // Endorsed columns (included in full model)
  'endorsed_cardinality': 'EndorsedCardinality',
  'endorsed_cardinality_rationale': 'EndorsedCardinalityRationale',
  
  // DROPPED - do not include
  // 'deprecated_definition' - always dropped
  // 'last_changed' - always dropped
};
```

### Step 5: Build Row

```javascript
function buildRow(entity, columnMap) {
  const values = Object.entries(columnMap)
    .map(([dbCol, gcCol]) => {
      const value = entity[dbCol];
      // Skip null/undefined/empty values
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return `    <Value ColumnRef="${gcCol}">
      <SimpleValue>${escapeXML(value)}</SimpleValue>
    </Value>`;
    })
    .filter(v => v !== null);
  
  return `  <Row>
${values.join('\n')}
  </Row>`;
}
```

---

## Export Endorsed Model Logic

### Step 1: Fetch and Filter

```sql
-- First, get all entities
SELECT *
FROM entities  
WHERE entity_type IN ('library', 'document')
ORDER BY model_name, component_type, dictionary_entry_name;
```

### Step 2: Filter Deprecated Entities

```javascript
function filterDeprecated(entities) {
  // Step 1: Remove entities with EndorsedCardinality = 0 or 0..0
  const active = entities.filter(e =>
    !['0', '0..0'].includes(e.endorsed_cardinality)
  );
  
  // Step 2: Find deprecated ABIEs (for cascade delete)
  const deprecatedABIEs = entities
    .filter(e => 
      e.component_type === 'ABIE' &&
      ['0', '0..0'].includes(e.endorsed_cardinality)
    )
    .map(e => e.object_class);
  
  // Step 3: Remove children of deprecated ABIEs
  const filtered = active.filter(e => {
    // If it's an ABIE itself, keep it (already filtered in step 1)
    if (e.component_type === 'ABIE') return true;
    
    // If it's a child (BBIE/ASBIE), check if parent ABIE is deprecated
    return !deprecatedABIEs.includes(e.object_class);
  });
  
  return filtered;
}
```

### Step 3: Replace Cardinality Values

```javascript
function applyEndorsedCardinalities(entities) {
  return entities.map(e => ({
    ...e,
    // Replace cardinality with endorsed_cardinality (if present and not zero)
    cardinality: (e.endorsed_cardinality && 
                  !['0', '0..0'].includes(e.endorsed_cardinality))
                  ? e.endorsed_cardinality
                  : e.cardinality
  }));
}
```

### Step 4: Remove Endorsed Columns

```javascript
const ENDORSED_MODEL_COLUMN_MAP = {
  // Same as full model but WITHOUT endorsed columns
  'model_name': 'ModelName',
  'component_name': 'ComponentName',
  // ... all the same ...
  'editors_notes': 'EditorsNotes',
  
  // REMOVE these from mapping:
  // 'endorsed_cardinality' - removed in endorsed model
  // 'endorsed_cardinality_rationale' - removed in endorsed model
};
```

### Step 5: Build XML

Same as full model, but use `ENDORSED_MODEL_COLUMN_MAP` and different metadata.

### Complete Endorsed Export Function

```javascript
async function exportEndorsedModel(version) {
  // 1. Fetch
  const entities = await fetchEntities('library', 'document', version);
  
  // 2. Validate
  validateEntities(entities);
  
  // 3. Filter deprecated
  const filtered = filterDeprecated(entities);
  
  // 4. Apply endorsed cardinalities
  const endorsed = applyEndorsedCardinalities(filtered);
  
  // 5. Get metadata
  const metadata = await getEndorsedMetadata(version);
  
  // 6. Build XML (without endorsed columns)
  return buildGeneriCodeXML(endorsed, ENDORSED_MODEL_COLUMN_MAP, metadata);
}
```

---

## Export Signatures Logic

**Note**: Signatures have a different column structure (32 columns vs 26).

### Step 1: Fetch

```sql
SELECT *
FROM signature_entities
ORDER BY dictionary_entry_name;
```

### Step 2: Column Mapping

```javascript
const SIGNATURE_COLUMN_MAP = {
  'ubl_name': 'UBLName',  // Different from ComponentName!
  'dictionary_entry_name': 'DictionaryEntryName',
  'object_class_qualifier': 'ObjectClassQualifier',
  'object_class': 'ObjectClass',
  'property_term_qualifier': 'PropertyTermQualifier',
  'property_term_possessive_noun': 'PropertyTermPossessiveNoun',
  'property_term_primary_noun': 'PropertyTermPrimaryNoun',
  'property_term': 'PropertyTerm',
  'representation_term': 'RepresentationTerm',
  'data_type_qualifier': 'DataTypeQualifier',
  'data_type': 'DataType',
  'associated_object_class_qualifier': 'AssociatedObjectClassQualifier',
  'associated_object_class': 'AssociatedObjectClass',
  'alternative_business_terms': 'AlternativeBusinessTerms',
  'cardinality': 'Cardinality',
  'component_type': 'ComponentType',
  'definition': 'Definition',
  'examples': 'Examples',
  'un_tded_code': 'UNTDEDCode',
  'current_version': 'CurrentVersion',
  
  // Unique to signatures
  'analyst_notes': 'AnalystNotes',
  'ccl_dictionary_entry_name': 'CCLDictionaryEntryName',
  'context_business_process': 'ContextBusinessProcess',
  'context_region': 'ContextRegion',
  'context_official_constraints': 'ContextOfficialConstraints',
  'context_product': 'ContextProduct',
  'context_industry': 'ContextIndustry',
  'context_role': 'ContextRole',
  'context_supporting_role': 'ContextSupportingRole',
  'context_system_constraint': 'ContextSystemConstraint',
  'editors_notes': 'EditorsNotes',
  'changes_from_previous_version': 'ChangesFromPreviousVersion',
};
```

### Step 3: Build XML

Same process as full model, use signature column map and signature metadata.

---

## Metadata Management

### Metadata Sources

Store in configuration (JSON, database, environment variables):

**Full Model Metadata** (`ident-UBL.xml` equivalent):
```json
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

**Endorsed Model Metadata** (`ident-UBL-Endorsed.xml` equivalent):
```json
{
  "shortName": "UBL-Endorsed-2.5-CSD02",
  "longName": "UBL 2.5 CSD02 Endorsed Business Entity Summary",
  // ... rest same as full model but with "Endorsed" in names
}
```

**Signature Metadata** (`ident-UBL-Signature.xml` equivalent):
```json
{
  "shortName": "UBL-Signature-2.5-CSD02",
  "longName": "UBL 2.5 CSD02 Signature Entity Summary",
  // ... signature-specific metadata
}
```

---

## Validation

### Pre-Export Validation

```javascript
function validateEntities(entities) {
  for (const entity of entities) {
    // Required fields
    assert(entity.component_name, 'Component Name required');
    assert(entity.dictionary_entry_name, 'Dictionary Entry Name required');
    assert(entity.component_type, 'Component Type required');
    assert(entity.cardinality, 'Cardinality required');
    assert(entity.definition, 'Definition required');
    
    // Component type validation
    assert(['ABIE', 'BBIE', 'ASBIE', 'MA'].includes(entity.component_type),
      'Invalid component type');
    
    // Cardinality validation
    assert(['0..1', '1..1', '0..n', '1..n'].includes(entity.cardinality),
      'Invalid cardinality');
    
    // Type-specific validation
    switch (entity.component_type) {
      case 'ABIE':
      case 'MA':
        assert(entity.object_class, 'ABIE must have Object Class');
        break;
      case 'BBIE':
        assert(entity.property_term, 'BBIE must have Property Term');
        assert(entity.representation_term, 'BBIE must have Representation Term');
        break;
      case 'ASBIE':
        assert(entity.associated_object_class, 'ASBIE must have Associated Object Class');
        break;
    }
  }
  
  // Uniqueness validation
  validateUniqueness(entities);
}

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
    throw new Error(`Duplicate DictionaryEntryNames: ${duplicates.join(', ')}`);
  }
}
```

### Post-Export Validation

```bash
# Validate against GeneriCode XSD
xmllint --noout --schema utilities/genericode/xsd/genericode.xsd \
  UBL-Entities-2.5.gc
```

---

## Testing Strategy

### Unit Tests

Test individual functions:
```javascript
describe('filterDeprecated', () => {
  it('removes entities with EndorsedCardinality = 0', () => {
    const entities = [
      { component_type: 'BBIE', endorsed_cardinality: '0', ... },
      { component_type: 'BBIE', endorsed_cardinality: '1..1', ... }
    ];
    const result = filterDeprecated(entities);
    expect(result).toHaveLength(1);
  });
});
```

### Integration Tests

Test full export:
```javascript
describe('exportEndorsedModel', () => {
  it('generates valid XML', async () => {
    const xml = await exportEndorsedModel('2.5');
    
    // Validate against schema
    expect(await validateXMLSchema(xml)).toBe(true);
    
    // Check structure
    expect(xml).toContain('<gc:CodeList');
    expect(xml).toContain('<Identification>');
    expect(xml).not.toContain('EndorsedCardinality');  // Should be removed
  });
});
```

### Regression Tests

Compare with known-good files:
```javascript
it('matches OASIS UBL 2.4 output', async () => {
  const generated = await exportFullModel('2.4');
  const expected = await readFile('test-data/UBL-Entities-2.4-os.gc');
  
  // Normalize for comparison
  expect(normalize(generated)).toEqual(normalize(expected));
});
```

---

## Performance Optimization

### For Large Exports (3,500+ entities)

1. **Stream XML generation**:
```javascript
async function streamExport(res, entities, metadata) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', 'attachment; filename="UBL-Entities.gc"');
  
  res.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  res.write('<gc:CodeList ...>\n');
  res.write(buildIdentification(metadata));
  res.write(buildColumnSet());
  res.write('<SimpleCodeList>\n');
  
  for (const entity of entities) {
    res.write(buildRow(entity));
  }
  
  res.write('</SimpleCodeList>\n');
  res.write('</gc:CodeList>');
  res.end();
}
```

2. **Optimize database query**:
- Fetch all needed data in single query
- Use appropriate indexes
- Order by relevant columns

3. **Cache metadata**:
```javascript
const metadataCache = new Map();
async function getMetadata(version) {
  if (!metadataCache.has(version)) {
    metadataCache.set(version, await fetchMetadata(version));
  }
  return metadataCache.get(version);
}
```

---

## API Endpoints

### GET /api/export/genericode/full

**Query Parameters**:
- `version`: UBL version (e.g., "2.5")
- `format`: Response format ("xml" or "download")

**Response**:
- Content-Type: `application/xml`
- File: `UBL-Entities-{version}.gc`

### GET /api/export/genericode/endorsed

**Query Parameters**:
- `version`: UBL version

**Response**:
- Content-Type: `application/xml`
- File: `UBL-Endorsed-Entities-{version}.gc`

### GET /api/export/genericode/signatures

**Query Parameters**:
- `version`: UBL version

**Response**:
- Content-Type: `application/xml`
- File: `UBL-Signature-Entities-{version}.gc`

---

## Key Takeaways

1. **Three separate export functions** - Full, endorsed, signatures
2. **Endorsed model requires filtering** - Remove deprecated, cascade delete
3. **Replace cardinalities** in endorsed model
4. **Remove endorsed columns** from endorsed output
5. **Signatures have different structure** - 32 columns, different names
6. **Validate before and after** export
7. **Stream large exports** for performance
8. **Cache metadata** for efficiency

---

## Reference

- **Column details**: See `columns-and-structure.md`
- **Code examples**: See `implementation-guide.md`
- **Validation**: GeneriCode XSD in OASIS repo
