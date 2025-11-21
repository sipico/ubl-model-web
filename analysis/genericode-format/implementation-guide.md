# GeneriCode Implementation Guide

**Practical implementation notes and recommendations**

---

## Purpose

This guide provides implementation notes to complement the main documentation. For detailed column information and export logic, see the primary documents.

**Primary Documentation**:
- `columns-and-structure.md` - Column reference and structure
- `transformation-and-export.md` - Export implementation details

---

## Technology Recommendations

### Backend Options

**Node.js/TypeScript**:
- Fast development
- Good XML libraries (xmlbuilder2)
- Easy streaming support

**Python**:
- Excellent XML libraries (lxml)
- Strong typing with type hints
- Great for data processing

**Java/Spring Boot**:
- Enterprise-ready
- Strong type safety
- Excellent XML support

---

## Key Libraries

### Node.js/TypeScript
```json
{
  "xmlbuilder2": "^3.0.0",  // XML generation
  "libxmljs": "^0.19.0",     // XML validation  
  "zod": "^3.0.0"            // Schema validation
}
```

### Python
```
lxml==4.9.0        # XML generation and validation
xmlschema==2.0.0   # Schema validation
pydantic==2.0.0    # Data validation
```

---

## Implementation Checklist

### Database Schema
- [ ] Create tables with all 26/32 columns
- [ ] Add DictionaryEntryName unique constraint
- [ ] Index model_name and component_type
- [ ] Store endorsed columns

### Validation Service
- [ ] Required field validation
- [ ] DictionaryEntryName uniqueness check
- [ ] Component type validation
- [ ] Type-specific rules (ABIE/BBIE/ASBIE)
- [ ] Cardinality format validation

### Export Service
- [ ] Full model export function
- [ ] Endorsed model export function
- [ ] Signature export function
- [ ] Metadata injection
- [ ] XML escaping

### API Layer
- [ ] GET /api/export/genericode/full
- [ ] GET /api/export/genericode/endorsed
- [ ] GET /api/export/genericode/signatures
- [ ] Authentication/authorization
- [ ] Streaming for large files

### Testing
- [ ] Unit tests for validation
- [ ] Unit tests for filtering
- [ ] Integration tests for full export
- [ ] XSD schema validation tests
- [ ] Regression tests vs OASIS samples

---

## Common Pitfalls

### 1. Not Escaping XML

**Wrong**:
```javascript
`<SimpleValue>${entity.definition}</SimpleValue>`
```

**Correct**:
```javascript
`<SimpleValue>${escapeXML(entity.definition)}</SimpleValue>`

function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### 2. Including Empty Values

**Wrong**:
```xml
<Value ColumnRef="uid">
  <SimpleValue></SimpleValue>
</Value>
```

**Correct**: Omit the entire `<Value>` element for null/empty fields.

### 3. Wrong Column Names

Use **PascalCase** from the transformation, not database column names:
- `ComponentName` not `component_name`
- `PropertyTermPossessiveNoun` not `property_term_possessive_noun`

### 4. Forgetting Property Term Parts

Property Term is **THREE columns**:
- PropertyTermQualifier
- PropertyTermPossessiveNoun
- PropertyTermPrimaryNoun

### 5. Not Filtering Endorsed Properly

Must filter BOTH:
- Direct deprecated (EndorsedCardinality = 0)
- Children of deprecated ABIEs (cascade)

---

## Quick Reference

### Component Type Rules

**ABIE**:
- Must have: ObjectClass
- Must NOT have: PropertyTerm, RepresentationTerm

**BBIE**:
- Must have: PropertyTerm, RepresentationTerm
- Represents: Basic property (text, number, etc.)

**ASBIE**:
- Must have: AssociatedObjectClass
- Must NOT have: RepresentationTerm
- Represents: Reference to another ABIE

**MA**:
- Same as ABIE
- Represents: Document type

### Valid Cardinalities

- `0..1` - Optional, single
- `1..1` - Mandatory, single
- `0..n` - Optional, multiple
- `1..n` - Mandatory, multiple

For endorsed only:
- `0` or `0..0` - Deprecated

---

## Performance Tips

1. **Single database query** - Fetch all entities at once
2. **Stream XML** - Don't build entire string in memory
3. **Cache metadata** - Reuse across exports
4. **Sort in database** - Use ORDER BY, not in-memory sort
5. **Index key columns** - model_name, component_type, dictionary_entry_name

---

## Validation

### Pre-Export
```bash
# Your validation service should check all rules
# before starting XML generation
```

### Post-Export
```bash
# Validate against GeneriCode XSD
xmllint --noout --schema utilities/genericode/xsd/genericode.xsd output.gc
```

---

## API Example

```typescript
// GET /api/export/genericode/full?version=2.5
app.get('/api/export/genericode/full', async (req, res) => {
  try {
    const { version = '2.5' } = req.query;
    const xml = await exportService.exportFullModel(version);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 
      `attachment; filename="UBL-Entities-${version}.gc"`);
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Testing Example

```typescript
describe('GeneriCode Export', () => {
  it('generates valid full model', async () => {
    const xml = await exportService.exportFullModel('2.5');
    
    // Validate structure
    expect(xml).toContain('<gc:CodeList');
    expect(xml).toContain('<Identification>');
    expect(xml).toContain('<ColumnSet>');
    expect(xml).toContain('<SimpleCodeList>');
    
    // Validate against XSD
    const isValid = await validateAgainstXSD(xml);
    expect(isValid).toBe(true);
  });
  
  it('filters endorsed correctly', async () => {
    const xml = await exportService.exportEndorsedModel('2.5');
    
    // Should not contain endorsed columns
    expect(xml).not.toContain('EndorsedCardinality');
    expect(xml).not.toContain('EndorsedCardinalityRationale');
  });
});
```

---

## Resources

**Main Documentation**:
- `columns-and-structure.md` - Complete column reference
- `transformation-and-export.md` - Export implementation details
- `README.md` - Overview and quick start

**OASIS Repository**:
- https://github.com/oasis-tcs/ubl/tree/ubl-2.5
- GeneriCode schema: `utilities/genericode/xsd/genericode.xsd`

**Sample Files**:
- `data/minimal-example.gc.xml` - Annotated example
- OASIS samples linked in README

---

## Next Steps

1. Review `columns-and-structure.md` for database schema design
2. Review `transformation-and-export.md` for export logic
3. Implement validation service
4. Implement export functions (full, endorsed, signatures)
5. Add API endpoints
6. Write tests
7. Validate against OASIS GeneriCode XSD

---

**Note**: This guide is intentionally brief. See the primary documentation for complete details.
