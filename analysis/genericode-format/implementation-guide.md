# GeneriCode Implementation Guide

## Overview

This guide provides practical recommendations for implementing GeneriCode generation in the UBL Model Website. It covers technology choices, code structure, testing approaches, and common pitfalls.

---

## Architecture Recommendations

### Layered Approach

```
┌─────────────────────────────────────────┐
│  API Layer (REST/GraphQL)               │
│  - /api/export/genericode               │
│  - Authentication & Authorization       │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Business Logic Layer                   │
│  - Validation Service                   │
│  - GeneriCode Generator Service         │
│  - Metadata Service                     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Data Access Layer                      │
│  - Entity Repository                    │
│  - Metadata Repository                  │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Database                                │
│  - entities table                        │
│  - metadata config table                 │
└──────────────────────────────────────────┘
```

### Service Separation

**GeneriCodeService**: Core generation logic
- Fetches entities
- Validates data
- Generates XML
- Returns result

**ValidationService**: Data validation
- Pre-export checks
- Business rule validation
- Format validation

**MetadataService**: Configuration management
- Loads version metadata
- Caches configuration
- Provides defaults

---

## Technology Stack Recommendations

### Backend Options

#### Option 1: Node.js/TypeScript (Recommended for JavaScript projects)

**Pros**:
- Fast development
- Large ecosystem
- Good XML libraries
- Easy streaming

**Libraries**:
```json
{
  "dependencies": {
    "xmlbuilder2": "^3.0.0",      // XML generation
    "libxmljs": "^0.19.0",         // XML validation
    "zod": "^3.0.0",               // Schema validation
    "stream": "built-in"           // Streaming support
  }
}
```

**Example Structure**:
```typescript
// services/genericode-generator.service.ts
export class GeneriCodeGeneratorService {
  async generateLibraryFile(version: string): Promise<string> {
    const entities = await this.entityRepo.findByType('library', version);
    this.validator.validateEntities(entities);
    const metadata = await this.metadataService.getMetadata(version);
    return this.buildXML(entities, metadata);
  }
}
```

#### Option 2: Python (Recommended for data-heavy applications)

**Pros**:
- Excellent XML libraries
- Strong typing with type hints
- Great for data validation
- Easy to test

**Libraries**:
```python
# requirements.txt
lxml==4.9.0              # XML generation and validation
xmlschema==2.0.0         # Schema validation
pydantic==2.0.0          # Data validation
```

**Example Structure**:
```python
# services/genericode_generator.py
from lxml import etree

class GeneriCodeGenerator:
    def generate_library_file(self, version: str) -> str:
        entities = self.entity_repo.find_by_type('library', version)
        self.validator.validate_entities(entities)
        metadata = self.metadata_service.get_metadata(version)
        return self.build_xml(entities, metadata)
```

#### Option 3: Java/Spring Boot (Recommended for enterprise applications)

**Pros**:
- Strong type safety
- Excellent XML support (JAXB, DOM)
- Battle-tested in enterprise
- Good performance

**Libraries**:
```xml
<dependencies>
  <dependency>
    <groupId>org.jdom</groupId>
    <artifactId>jdom2</artifactId>
  </dependency>
  <dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
  </dependency>
</dependencies>
```

### Frontend (If Needed)

**Export UI**:
- Simple button to trigger export
- Progress indicator for large exports
- Download link when complete

**Technologies**:
- React/Vue/Svelte for UI
- Fetch API or Axios for HTTP
- File download handling

---

## Implementation Approach

### Phase 1: Core Generator (Week 1-2)

**Goals**:
- Generate valid GeneriCode XML
- Support library entities only
- Basic validation

**Deliverables**:
```
services/
  genericode-generator.service.ts
  validation.service.ts
  metadata.service.ts
tests/
  genericode-generator.test.ts
config/
  metadata.json
```

**Acceptance Criteria**:
- Generates XML that validates against `genericode.xsd`
- Passes all unit tests
- Exports sample library data

### Phase 2: Validation & Error Handling (Week 3)

**Goals**:
- Comprehensive validation
- Helpful error messages
- Edge case handling

**Deliverables**:
- Enhanced validation service
- Custom error types
- Validation reports

**Acceptance Criteria**:
- All validation rules from `generation-requirements.md` implemented
- Clear error messages for common issues
- Validation runs in < 1 second for 3,500 entities

### Phase 3: API & Integration (Week 4)

**Goals**:
- REST API endpoint
- Authentication
- Download handling

**Deliverables**:
```
api/
  controllers/
    export.controller.ts
  routes/
    export.routes.ts
  middleware/
    auth.middleware.ts
```

**Acceptance Criteria**:
- `GET /api/export/genericode?type=library` returns valid GC file
- Authenticated users only
- Large files stream correctly

### Phase 4: Documents & Signatures (Week 5)

**Goals**:
- Support all three entity types
- Generate both GC files

**Deliverables**:
- Extended generator for documents
- Signature entity support
- Two-file output

**Acceptance Criteria**:
- Generates `UBL-Entities-{version}.gc`
- Generates `UBL-Signature-Entities-{version}.gc`
- Both validate against schema

### Phase 5: Testing & Refinement (Week 6)

**Goals**:
- Integration tests
- Performance optimization
- Documentation

**Deliverables**:
- Full test suite
- Performance benchmarks
- Developer documentation

**Acceptance Criteria**:
- 90%+ code coverage
- Exports 3,500 entities in < 2 seconds
- All edge cases handled

---

## Code Examples

### Node.js/TypeScript Implementation

#### Entity Interface

```typescript
// types/entity.ts
export interface UBLEntity {
  id: number;
  model_name: string;
  component_type: 'ABIE' | 'BBIE' | 'ASBIE' | 'MA';
  dictionary_entry_name: string;
  uid?: number;
  component_name: string;
  definition: string;
  cardinality: '0..1' | '1..1' | '0..n' | '1..n';
  object_class_term_qualifier?: string;
  object_class_term?: string;
  property_term_qualifier?: string;
  property_term?: string;
  representation_term_qualifier?: string;
  representation_term?: string;
  data_type_qualifier?: string;
  data_type?: string;
  associated_object_class_term_qualifier?: string;
  associated_object_class_term?: string;
  alternative_business_terms?: string;
  examples?: string;
  primitive_term?: string;
  usage_rule?: string;
  language_code?: string;
  ubl_version_id?: string;
  ubl_version_reason?: string;
  component_version?: string;
  modification_reason?: string;
}
```

#### Validation Service

```typescript
// services/validation.service.ts
import { UBLEntity } from '../types/entity';

export class ValidationService {
  validateEntities(entities: UBLEntity[]): void {
    entities.forEach(entity => {
      this.validateRequiredFields(entity);
      this.validateComponentType(entity);
      this.validateTypeSpecificFields(entity);
      this.validateCardinality(entity);
      this.validateDENFormat(entity);
    });

    this.validateUniqueness(entities);
  }

  private validateRequiredFields(entity: UBLEntity): void {
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
        throw new ValidationError(
          `Required field '${field}' is missing`,
          entity
        );
      }
    }
  }

  private validateComponentType(entity: UBLEntity): void {
    const validTypes = ['ABIE', 'BBIE', 'ASBIE', 'MA'];
    if (!validTypes.includes(entity.component_type)) {
      throw new ValidationError(
        `Invalid component_type: ${entity.component_type}`,
        entity
      );
    }
  }

  private validateTypeSpecificFields(entity: UBLEntity): void {
    switch (entity.component_type) {
      case 'ABIE':
      case 'MA':
        if (!entity.object_class_term) {
          throw new ValidationError(
            'ABIEs/Documents must have object_class_term',
            entity
          );
        }
        break;

      case 'BBIE':
        if (!entity.property_term || !entity.representation_term) {
          throw new ValidationError(
            'BBIEs must have property_term and representation_term',
            entity
          );
        }
        break;

      case 'ASBIE':
        if (!entity.associated_object_class_term) {
          throw new ValidationError(
            'ASBIEs must have associated_object_class_term',
            entity
          );
        }
        break;
    }
  }

  private validateCardinality(entity: UBLEntity): void {
    const valid = ['0..1', '1..1', '0..n', '1..n'];
    if (!valid.includes(entity.cardinality)) {
      throw new ValidationError(
        `Invalid cardinality: ${entity.cardinality}`,
        entity
      );
    }
  }

  private validateDENFormat(entity: UBLEntity): void {
    const den = entity.dictionary_entry_name;

    if (!den.includes('. ')) {
      throw new ValidationError(
        `DEN must contain '. ': ${den}`,
        entity
      );
    }

    if (den.startsWith('.') || den.endsWith('.')) {
      throw new ValidationError(
        `DEN cannot start/end with period: ${den}`,
        entity
      );
    }
  }

  private validateUniqueness(entities: UBLEntity[]): void {
    const denSet = new Set<string>();
    const duplicates: string[] = [];

    for (const entity of entities) {
      const den = entity.dictionary_entry_name;
      if (denSet.has(den)) {
        duplicates.push(den);
      } else {
        denSet.add(den);
      }
    }

    if (duplicates.length > 0) {
      throw new ValidationError(
        `Duplicate DictionaryEntryNames found: ${duplicates.join(', ')}`
      );
    }
  }
}

class ValidationError extends Error {
  constructor(message: string, public entity?: UBLEntity) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### GeneriCode Generator

```typescript
// services/genericode-generator.service.ts
import { create } from 'xmlbuilder2';
import { UBLEntity } from '../types/entity';
import { ValidationService } from './validation.service';
import { MetadataService } from './metadata.service';

export class GeneriCodeGeneratorService {
  constructor(
    private validationService: ValidationService,
    private metadataService: MetadataService
  ) {}

  async generateLibraryFile(version: string): Promise<string> {
    // Fetch entities (implement based on your data layer)
    const entities = await this.fetchEntities('library', version);

    // Validate
    this.validationService.validateEntities(entities);

    // Sort
    this.sortEntities(entities);

    // Get metadata
    const metadata = await this.metadataService.getMetadata(version);

    // Generate XML
    return this.buildXML(entities, metadata);
  }

  private sortEntities(entities: UBLEntity[]): void {
    entities.sort((a, b) => {
      // Primary: model_name
      if (a.model_name !== b.model_name) {
        return a.model_name.localeCompare(b.model_name);
      }

      // Secondary: component_type
      const typeOrder = { 'ABIE': 1, 'MA': 1, 'BBIE': 2, 'ASBIE': 3 };
      const aOrder = typeOrder[a.component_type] || 4;
      const bOrder = typeOrder[b.component_type] || 4;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // Tertiary: dictionary_entry_name
      return a.dictionary_entry_name.localeCompare(b.dictionary_entry_name);
    });
  }

  private buildXML(entities: UBLEntity[], metadata: any): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('gc:CodeList', {
        'xmlns:gc': 'http://docs.oasis-open.org/codelist/ns/genericode/1.0/',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://docs.oasis-open.org/codelist/ns/genericode/1.0/ genericode.xsd'
      });

    // Identification
    this.buildIdentification(root, metadata);

    // ColumnSet
    this.buildColumnSet(root);

    // SimpleCodeList
    this.buildSimpleCodeList(root, entities);

    return root.end({ prettyPrint: true, indent: '  ' });
  }

  private buildIdentification(parent: any, metadata: any): void {
    const id = parent.ele('Identification');
    id.ele('ShortName').txt(metadata.shortName);
    id.ele('LongName', { 'xml:lang': 'en' }).txt(metadata.longName);
    id.ele('Version').txt(metadata.version);
    id.ele('CanonicalUri').txt(metadata.canonicalUri);
    id.ele('CanonicalVersionUri').txt(metadata.canonicalVersionUri);
    id.ele('LocationUri').txt(metadata.locationUri);

    const agency = id.ele('Agency');
    agency.ele('LongName', { 'xml:lang': 'en' }).txt(metadata.agency.longName);
    agency.ele('Identifier').txt(metadata.agency.identifier);
  }

  private buildColumnSet(parent: any): void {
    const columnSet = parent.ele('ColumnSet');

    const columns = this.getColumnDefinitions();

    for (const col of columns) {
      const column = columnSet.ele('Column', {
        Id: col.id,
        Use: col.use
      });
      column.ele('ShortName').txt(col.shortName);
      column.ele('LongName').txt(col.longName);
      column.ele('Data', { Type: 'string' });
    }

    // Add Key
    const key = columnSet.ele('Key', { Id: 'dictionary-entry-name-key' });
    key.ele('ShortName').txt('DictionaryEntryNameKey');
    key.ele('LongName').txt('The unique name for a dictionary entry');
    key.ele('ColumnRef', { Ref: 'dictionary-entry-name' });
  }

  private buildSimpleCodeList(parent: any, entities: UBLEntity[]): void {
    const simpleCodeList = parent.ele('SimpleCodeList');

    for (const entity of entities) {
      const row = simpleCodeList.ele('Row');

      const fieldMappings = this.getFieldMappings(entity);

      for (const [columnId, value] of Object.entries(fieldMappings)) {
        if (value !== null && value !== undefined && value !== '') {
          const valueElem = row.ele('Value', { ColumnRef: columnId });
          valueElem.ele('SimpleValue').txt(String(value));
        }
      }
    }
  }

  private getColumnDefinitions() {
    return [
      { id: 'model-name', shortName: 'ModelName', longName: 'Model Name', use: 'required' },
      { id: 'component-type', shortName: 'ComponentType', longName: 'Component Type', use: 'required' },
      { id: 'dictionary-entry-name', shortName: 'DictionaryEntryName', longName: 'Dictionary Entry Name', use: 'required' },
      { id: 'uid', shortName: 'UID', longName: 'UID', use: 'optional' },
      { id: 'component-name', shortName: 'ComponentName', longName: 'Component Name', use: 'required' },
      { id: 'definition', shortName: 'Definition', longName: 'Definition', use: 'required' },
      { id: 'cardinality', shortName: 'Cardinality', longName: 'Cardinality', use: 'required' },
      // ... all 26+ columns ...
    ];
  }

  private getFieldMappings(entity: UBLEntity): Record<string, any> {
    return {
      'model-name': entity.model_name,
      'component-type': entity.component_type,
      'dictionary-entry-name': entity.dictionary_entry_name,
      'uid': entity.uid,
      'component-name': entity.component_name,
      'definition': entity.definition,
      'cardinality': entity.cardinality,
      'object-class-term-qualifier': entity.object_class_term_qualifier,
      'object-class-term': entity.object_class_term,
      'property-term-qualifier': entity.property_term_qualifier,
      'property-term': entity.property_term,
      'representation-term-qualifier': entity.representation_term_qualifier,
      'representation-term': entity.representation_term,
      'data-type-qualifier': entity.data_type_qualifier,
      'data-type': entity.data_type,
      'associated-object-class-term-qualifier': entity.associated_object_class_term_qualifier,
      'associated-object-class-term': entity.associated_object_class_term,
      'alternative-business-terms': entity.alternative_business_terms,
      'examples': entity.examples,
      'primitive-term': entity.primitive_term,
      'usage-rule': entity.usage_rule,
      'language-code': entity.language_code,
      'ubl-version-id': entity.ubl_version_id,
      'ubl-version-reason': entity.ubl_version_reason,
      'component-version': entity.component_version,
      'modification-reason': entity.modification_reason,
    };
  }

  private async fetchEntities(type: string, version: string): Promise<UBLEntity[]> {
    // Implement based on your data access layer
    // Example:
    // return await this.entityRepository.findByTypeAndVersion(type, version);
    throw new Error('Not implemented');
  }
}
```

#### API Controller

```typescript
// api/controllers/export.controller.ts
import { Request, Response } from 'express';
import { GeneriCodeGeneratorService } from '../../services/genericode-generator.service';

export class ExportController {
  constructor(private generatorService: GeneriCodeGeneratorService) {}

  async exportGeneriCode(req: Request, res: Response): Promise<void> {
    try {
      const { type = 'library', version = '2.5' } = req.query;

      // Validate parameters
      if (!['library', 'document', 'signature'].includes(type as string)) {
        res.status(400).json({ error: 'Invalid type parameter' });
        return;
      }

      // Generate GeneriCode
      let xml: string;
      switch (type) {
        case 'library':
          xml = await this.generatorService.generateLibraryFile(version as string);
          break;
        // ... other cases ...
        default:
          throw new Error('Unsupported type');
      }

      // Set response headers
      const filename = `UBL-Entities-${version}.gc`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Send XML
      res.send(xml);
    } catch (error) {
      console.error('Export failed:', error);
      res.status(500).json({
        error: 'Export failed',
        message: error.message
      });
    }
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/validation.service.test.ts
import { ValidationService } from '../services/validation.service';
import { UBLEntity } from '../types/entity';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  describe('validateRequiredFields', () => {
    it('should pass for valid entity', () => {
      const entity: UBLEntity = {
        id: 1,
        model_name: 'Address',
        component_type: 'ABIE',
        dictionary_entry_name: 'Address. Details',
        component_name: 'Address',
        definition: 'A class...',
        cardinality: '1..1'
      };

      expect(() => service.validateEntities([entity])).not.toThrow();
    });

    it('should throw for missing model_name', () => {
      const entity = {
        component_type: 'ABIE',
        // missing model_name
      } as UBLEntity;

      expect(() => service.validateEntities([entity])).toThrow('model_name');
    });
  });

  describe('validateUniqueness', () => {
    it('should throw for duplicate DEN', () => {
      const entities = [
        { dictionary_entry_name: 'Address. Details', /* ... */ },
        { dictionary_entry_name: 'Address. Details', /* ... */ }, // duplicate
      ] as UBLEntity[];

      expect(() => service.validateEntities(entities)).toThrow('Duplicate');
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/genericode-export.test.ts
import { GeneriCodeGeneratorService } from '../../services/genericode-generator.service';
import { validateXMLSchema } from '../helpers/xml-validator';

describe('GeneriCode Export Integration', () => {
  let service: GeneriCodeGeneratorService;

  beforeAll(() => {
    // Setup database with test data
  });

  it('should generate valid GeneriCode XML', async () => {
    const xml = await service.generateLibraryFile('2.5');

    // Validate against schema
    const isValid = await validateXMLSchema(xml, 'genericode.xsd');
    expect(isValid).toBe(true);

    // Check structure
    expect(xml).toContain('<gc:CodeList');
    expect(xml).toContain('<Identification>');
    expect(xml).toContain('<ColumnSet>');
    expect(xml).toContain('<SimpleCodeList>');
  });

  it('should include all entities', async () => {
    const xml = await service.generateLibraryFile('2.5');

    // Count rows
    const rowCount = (xml.match(/<Row>/g) || []).length;
    expect(rowCount).toBeGreaterThan(0);
  });
});
```

### Schema Validation Helper

```typescript
// tests/helpers/xml-validator.ts
import { parseXmlString } from 'libxmljs';
import * as fs from 'fs';

export async function validateXMLSchema(
  xml: string,
  schemaPath: string
): Promise<boolean> {
  try {
    const xsdDoc = parseXmlString(fs.readFileSync(schemaPath, 'utf-8'));
    const xmlDoc = parseXmlString(xml);
    return xmlDoc.validate(xsdDoc);
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}
```

---

## Common Pitfalls

### 1. Not Escaping XML Special Characters

**Problem**:
```typescript
// WRONG
value.ele('SimpleValue').txt(entity.definition);
// If definition contains "<", this breaks
```

**Solution**:
```typescript
// Use library that auto-escapes (xmlbuilder2 does this)
value.ele('SimpleValue').txt(entity.definition); // Auto-escaped

// Or manually escape
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### 2. Including Empty Values

**Problem**:
```xml
<!-- WRONG -->
<Value ColumnRef="uid">
  <SimpleValue></SimpleValue>
</Value>
```

**Solution**:
```typescript
// Skip null/empty values
if (value !== null && value !== undefined && value !== '') {
  row.ele('Value', { ColumnRef: columnId })
    .ele('SimpleValue').txt(value);
}
```

### 3. Incorrect Column Sorting

**Problem**: Rows appear in random order, making diffs hard

**Solution**:
```typescript
entities.sort((a, b) => {
  // Always sort consistently
  if (a.model_name !== b.model_name) {
    return a.model_name.localeCompare(b.model_name);
  }
  // Secondary sort...
});
```

### 4. Missing Namespace Declarations

**Problem**:
```xml
<!-- WRONG - missing namespaces -->
<CodeList>
```

**Solution**:
```xml
<!-- CORRECT -->
<gc:CodeList
  xmlns:gc="http://docs.oasis-open.org/codelist/ns/genericode/1.0/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="...">
```

### 5. Loading All Entities Into Memory

**Problem**: 3,500+ entities = memory issues

**Solution**: Use streaming
```typescript
// Stream rows instead of building entire XML in memory
for await (const entity of entityStream) {
  appendRow(entity);
}
```

### 6. Not Validating Before Export

**Problem**: Invalid data discovered during export

**Solution**: Validate on save/edit
```typescript
// In entity save handler
await validationService.validateEntity(entity);
// Only save if valid
```

---

## Performance Optimization

### Database Query Optimization

```sql
-- GOOD: Single query with all needed columns
SELECT
  model_name, component_type, dictionary_entry_name,
  -- all columns --
FROM entities
WHERE type = 'library' AND version = '2.5'
ORDER BY model_name, component_type;

-- BAD: N+1 query pattern
SELECT id FROM entities WHERE type = 'library';
-- Then for each id:
SELECT * FROM entities WHERE id = ?;
```

### Caching

```typescript
// Cache metadata (rarely changes)
class MetadataService {
  private cache = new Map<string, any>();

  async getMetadata(version: string): Promise<any> {
    if (!this.cache.has(version)) {
      const metadata = await this.fetchFromDB(version);
      this.cache.set(version, metadata);
    }
    return this.cache.get(version);
  }
}
```

### Streaming for Large Exports

```typescript
import { Transform } from 'stream';

class GeneriCodeStreamTransform extends Transform {
  constructor() {
    super({ objectMode: true });
    this.push('<?xml version="1.0"?>\n<gc:CodeList...>\n');
  }

  _transform(entity: UBLEntity, encoding: string, callback: Function) {
    const rowXML = this.buildRow(entity);
    this.push(rowXML);
    callback();
  }

  _flush(callback: Function) {
    this.push('</SimpleCodeList>\n</gc:CodeList>');
    callback();
  }
}
```

---

## Deployment Considerations

### Configuration Management

**Development**:
```json
{
  "metadata": {
    "version": "2.5",
    "stage": "DEV",
    "shortName": "UBL-2.5-DEV"
  }
}
```

**Production**:
```json
{
  "metadata": {
    "version": "2.5",
    "stage": "CSD02",
    "shortName": "UBL-2.5-CSD02"
  }
}
```

### Environment Variables

```bash
# .env
UBL_VERSION=2.5
UBL_STAGE=CSD02
GENERICODE_SCHEMA_PATH=/path/to/genericode.xsd
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

---

## Monitoring and Logging

### Key Metrics

- Export request count
- Export duration
- Export file size
- Validation errors
- Schema validation failures

### Logging Examples

```typescript
logger.info('GeneriCode export started', {
  type: 'library',
  version: '2.5',
  userId: req.user.id
});

logger.info('GeneriCode export completed', {
  type: 'library',
  version: '2.5',
  duration: 1234, // ms
  entityCount: 3500,
  fileSize: 2500000 // bytes
});

logger.error('GeneriCode export failed', {
  type: 'library',
  version: '2.5',
  error: error.message,
  stack: error.stack
});
```

---

## Key Takeaways

1. **Use XML Libraries**: Don't build XML strings manually - use xmlbuilder2, lxml, or JDOM

2. **Validate Early**: Check data quality when saving, not just when exporting

3. **Test Against Schema**: Use `xmllint` or equivalent to validate generated XML

4. **Stream Large Files**: Don't load 3,500 entities into memory at once

5. **Cache Metadata**: Configuration rarely changes - cache it

6. **Sort Consistently**: Makes version control diffs readable

7. **Handle Errors Gracefully**: Provide clear error messages to users

8. **Log Everything**: Track exports for debugging and analytics

9. **Start Simple**: MVP first, then add features

10. **Follow the Spec**: Refer to `format-specification.md` for exact requirements

---

## Next Steps

1. **Choose your technology stack** based on existing project
2. **Set up database schema** with all 26+ columns
3. **Implement validation service** first (TDD approach)
4. **Build generator service** with basic XML output
5. **Add API endpoint** for export
6. **Write comprehensive tests** (unit + integration)
7. **Optimize for performance** with caching and streaming
8. **Deploy and monitor** in production

---

## References

- **Format Specification**: `format-specification.md`
- **Sheet Mapping**: `sheet-to-gc-mapping.md`
- **Generation Requirements**: `generation-requirements.md`
- **Pipeline Integration**: `pipeline-integration.md`
- **OASIS UBL Repository**: https://github.com/oasis-tcs/ubl
