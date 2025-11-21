# GeneriCode Format Analysis - ACTUAL FINDINGS

## Date: 2025-11-21
## Methodology: Downloaded actual ODS files + examined OASIS build process

---

## Executive Summary

After downloading and examining the **actual Google Sheets in ODS format** and tracing through the **complete OASIS build process**, I can now provide accurate information about the GeneriCode transformation.

**Key Finding**: My original analysis was **partially correct** in approach but **wrong in details**. The column count, column names, and transformation logic all differ from my initial documentation.

---

## What I Got Right ✅

1. **GeneriCode is the interface** between data entry and schema generation
2. **Direct generation is feasible** - no need for ODS intermediate format
3. **Two output files required**: main entities + signatures
4. **ModelName is derived** from worksheet names
5. **Empty values omitted** from GeneriCode output
6. **All columns are strings** in GeneriCode
7. **DictionaryEntryName is the primary key**
8. **Transformation is mostly mechanical**

---

## What I Got WRONG ❌

### 1. Column Count

**My claim**: "26+ columns"

**REALITY**:
- **Source (Library/Documents)**: 26 columns in spreadsheets
- **GeneriCode output**: 23 columns (some dropped, ModelName added)
- **Source (Signatures)**: 32 columns (completely different structure!)

### 2. Specific Columns

**Columns I claimed existed but DON'T**:
- ❌ UID
- ❌ RepresentationTermQualifier
- ❌ PrimitiveTerm
- ❌ UsageRule
- ❌ LanguageCode
- ❌ UBLVersionID
- ❌ UBLVersionReason
- ❌ ModificationReason

**Columns that DO exist but I missed**:
- ✅ PropertyTermPossessiveNoun
- ✅ PropertyTermPrimaryNoun
- ✅ Subset (not "Subset Cardinality")
- ✅ UNTDEDCode (not "UID")
- ✅ CurrentVersion (not "ComponentVersion")
- ✅ EditorsNotes

### 3. Endorsed Columns

**My claim**: Vaguely mentioned "endorsed" but didn't understand them

**REALITY**: The endorsed columns are **metadata for generating a SUBSET model**:
- **Endorsed Cardinality**: Modified cardinality for endorsed subset
- **Endorsed Cardinality Rationale**: Explanation for changes

These columns are used to create **TWO different GeneriCode outputs** from the same source data:
1. **UBL-Entities** (full model, all entities, original cardinalities)
2. **UBL-Endorsed-Entities** (subset, deprecated removed, modified cardinalities)

---

## ACTUAL Column Structure

### Library/Documents Spreadsheets (26 columns)

1. Component Name
2. **Subset Cardinality** → becomes "Subset" in GC
3. Cardinality
4. **Endorsed Cardinality** → used for endorsed model
5. **Endorsed Cardinality Rationale** → used for endorsed model
6. Definition
7. **Deprecated Definition** → DROPPED in transformation
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
25. **Last Changed** → DROPPED in transformation
26. Editor's Notes

**Transformation**:
- **Adds**: ModelName (from worksheet name)
- **Drops**: Subset Cardinality (column 2), Endorsed Cardinality (4), Endorsed Cardinality Rationale (5), Deprecated Definition (7), Last Changed (25)
- **Renames**: All column names (spaces removed, camelCase)
- **Result**: 23 columns in GeneriCode

### Signatures Spreadsheet (32 columns - DIFFERENT!)

1. **UBL Name** (not "Component Name")
2. Dictionary Entry Name
3-21. Similar to Library but different order
22. **Context: Business Process** ✨
23. **Context: Region (Geopolitical)** ✨
24. **Context: Official Constraints** ✨
25. **Context: Product** ✨
26. **Context: Industry** ✨
27. **Context: Role** ✨
28. **Context: Supporting Role** ✨
29. **Context: System Constraint** ✨
30. **Analyst Notes** ✨
31. **CCL Dictionary Entry Name** ✨
32. **Changes from Previous Version** ✨

✨ = Unique to Signatures

---

## ACTUAL GeneriCode Columns (Output)

### Full Model (UBL-Entities-{version}.gc) - 23 columns

1. **ModelName** (added by transformation)
2. ComponentName
3. Subset
4. Cardinality
5. Definition
6. AlternativeBusinessTerms
7. Examples
8. DictionaryEntryName
9. ObjectClassQualifier
10. ObjectClass
11. PropertyTermQualifier
12. PropertyTermPossessiveNoun
13. PropertyTermPrimaryNoun
14. PropertyTerm
15. RepresentationTerm
16. DataTypeQualifier
17. DataType
18. AssociatedObjectClassQualifier
19. AssociatedObjectClass
20. ComponentType
21. UNTDEDCode
22. CurrentVersion
23. EditorsNotes

**Note**: This is for UBL 2.4. The "raw" version created during build MAY include EndorsedCardinality columns temporarily.

---

## ACTUAL Transformation Flow

### Step 1: Download ODS from Google Sheets

```bash
wget -O Library.ods "${libraryGoogle}/export?format=ods"
wget -O Documents.ods "${documentsGoogle}/export?format=ods"
wget -O Signatures.ods "${signatureGoogle}/export?format=ods"
```

### Step 2: Transform to GeneriCode (Full Model)

```bash
java -jar saxon9he.jar \
  -xsl:Crane-ods2obdgc.xsl \
  -o:UBL-Entities-2.5.gc \
  -it:ods-uri \
  ods-uri=Library.ods,Documents.ods \
  identification-uri=ident-UBL.xml \
  included-sheet-name-regex="..." \
  lengthen-model-name-uri=massageModelName.xml
```

**What happens**:
- Reads multiple ODS files
- Processes each worksheet
- First row → ColumnSet definitions
- Subsequent rows → SimpleCodeList rows
- Adds ModelName from worksheet name
- Drops some columns (Last Changed, Deprecated Definition, etc.)
- Injects metadata from ident-UBL.xml
- Omits empty cells

### Step 3: Transform to GeneriCode (Endorsed Model)

**Step 3A**: Create raw endorsed GeneriCode (same as Step 2, different metadata)

```bash
java -jar saxon9he.jar \
  -xsl:Crane-ods2obdgc.xsl \
  -o:UBL-Endorsed-Entities-2.5-raw.gc \
  -it:ods-uri \
  ods-uri=Library.ods,Documents.ods \
  identification-uri=ident-UBL-Endorsed.xml \  # ← Different!
  ...
```

**Step 3B**: Filter and modify with gc2endorsed.xsl

```bash
java -jar saxon9he.jar \
  -o:UBL-Endorsed-Entities-2.5.gc \
  -s:UBL-Endorsed-Entities-2.5-raw.gc \
  -xsl:gc2endorsed.xsl
```

**What gc2endorsed.xsl does**:
1. **Remove** rows where EndorsedCardinality = '0' or '0..0' (deprecated)
2. **Remove** children of removed ABIEs
3. **Replace** Cardinality values with EndorsedCardinality values
4. **Strip** all Endorsed* columns from output

### Step 4: Generate XSD/JSON from GeneriCode

```bash
java -jar saxon9he.jar \
  -xsl:Crane-gc2obdndr.xsl \
  -s:UBL-Entities-2.5.gc \
  ...
```

(This part was correctly understood in original analysis)

---

## Comparison: Original vs. Actual

| Aspect | Original Claim | Actual Reality |
|--------|----------------|----------------|
| **Column count** | "26+ columns" | 26 (spreadsheet), 23 (GeneriCode) |
| **UID column** | Exists | Does NOT exist |
| **Property Term structure** | Single column | THREE columns (Qualifier, PossessiveNoun, PrimaryNoun, Term) |
| **Version columns** | "UBLVersionID", "ComponentVersion" | "CurrentVersion" only |
| **Endorsed handling** | Not explained | Complete two-model system |
| **Signatures structure** | "Same as Library" | 32 columns, completely different |
| **Dropped columns** | Not mentioned | 5 columns dropped during transformation |
| **Column naming** | kebab-case IDs | PascalCase IDs (no hyphens!) |

---

## Implications for Website Development

### Data Model (Database)

**Store spreadsheet columns, not GeneriCode columns!**

For Library/Documents entities:
```sql
CREATE TABLE entities (
  id INTEGER PRIMARY KEY,
  component_name VARCHAR,
  subset_cardinality VARCHAR,
  cardinality VARCHAR,
  endorsed_cardinality VARCHAR,          -- For endorsed model
  endorsed_cardinality_rationale TEXT,   -- Explanation
  definition TEXT,
  deprecated_definition TEXT,            -- Keep even though dropped from GC
  alternative_business_terms TEXT,
  examples TEXT,
  dictionary_entry_name VARCHAR UNIQUE,  -- Primary key
  object_class_qualifier VARCHAR,
  object_class VARCHAR,
  property_term_qualifier VARCHAR,
  property_term_possessive_noun VARCHAR, -- Three-part property term!
  property_term_primary_noun VARCHAR,
  property_term VARCHAR,
  representation_term VARCHAR,
  data_type_qualifier VARCHAR,
  data_type VARCHAR,
  associated_object_class_qualifier VARCHAR,
  associated_object_class VARCHAR,
  component_type VARCHAR CHECK (component_type IN ('ABIE', 'BBIE', 'ASBIE', 'MA')),
  un_tded_code VARCHAR,
  current_version VARCHAR,
  last_changed TIMESTAMP,                -- Keep even though dropped from GC
  editors_notes TEXT,

  -- Metadata
  model_name VARCHAR,                    -- Which ABIE this belongs to
  entity_type VARCHAR CHECK (entity_type IN ('library', 'document', 'signature'))
);
```

### Export Logic (Full Model)

```javascript
async function exportFullModel(version) {
  // 1. Fetch entities
  const entities = await db.query(`
    SELECT * FROM entities
    WHERE entity_type IN ('library', 'document')
    ORDER BY model_name, component_type
  `);

  // 2. Transform column names
  const gcColumns = {
    'component_name': 'ComponentName',
    'subset_cardinality': 'Subset',  // ← Renamed!
    'cardinality': 'Cardinality',
    'definition': 'Definition',
    // ... map all columns
    // NOTE: Drop 'last_changed', 'deprecated_definition'
  };

  // 3. Build XML
  // - Add ModelName from model_name field
  // - Omit null/empty values
  // - Inject metadata from config

  return buildGeneriCodeXML(entities, gcColumns, metadata);
}
```

### Export Logic (Endorsed Model)

```javascript
async function exportEndorsedModel(version) {
  // 1. Fetch entities
  const entities = await db.query(`
    SELECT * FROM entities
    WHERE entity_type IN ('library', 'document')
    ORDER BY model_name, component_type
  `);

  // 2. Filter deprecated (EndorsedCardinality = 0 or 0..0)
  const activeEntities = entities.filter(e =>
    !['0', '0..0'].includes(e.endorsed_cardinality)
  );

  // 3. Filter children of deprecated ABIEs
  const deprecatedABIEs = entities
    .filter(e => e.component_type === 'ABIE' &&
                 ['0', '0..0'].includes(e.endorsed_cardinality))
    .map(e => e.object_class);

  const filteredEntities = activeEntities.filter(e =>
    !deprecatedABIEs.includes(e.object_class) || e.component_type === 'ABIE'
  );

  // 4. Replace Cardinality with EndorsedCardinality
  const modifiedEntities = filteredEntities.map(e => ({
    ...e,
    cardinality: e.endorsed_cardinality || e.cardinality
  }));

  // 5. Remove Endorsed* columns from output mapping
  const gcColumns = {
    'component_name': 'ComponentName',
    'cardinality': 'Cardinality',  // Now contains endorsed value
    // ... NO endorsed_cardinality or endorsed_cardinality_rationale
  };

  return buildGeneriCodeXML(modifiedEntities, gcColumns, endorsedMetadata);
}
```

### Validation Rules

**Update validation to use actual column names**:

```javascript
function validateEntity(entity) {
  // Required fields
  assert(entity.component_name, 'Component Name required');
  assert(entity.dictionary_entry_name, 'Dictionary Entry Name required');
  assert(entity.component_type, 'Component Type required');
  assert(['ABIE', 'BBIE', 'ASBIE', 'MA'].includes(entity.component_type));

  // Cardinality format
  assert(['0..1', '1..1', '0..n', '1..n'].includes(entity.cardinality));

  // Endorsed cardinality (if present)
  if (entity.endorsed_cardinality) {
    assert(['0', '0..0', '0..1', '1..1', '0..n', '1..n']
      .includes(entity.endorsed_cardinality));
  }

  // Type-specific validations
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
```

---

## Key Takeaways

1. **Always examine source data** - Don't rely on documentation alone

2. **Column counts matter** - 26 → 23 transformation with specific rules

3. **Endorsed columns are for subsetting** - They create a second GeneriCode output

4. **Signatures are completely different** - 32 columns, different structure

5. **Property Term is three-part** - Qualifier, PossessiveNoun, PrimaryNoun

6. **Five columns dropped** - Subset Cardinality (renamed), Endorsed×2, Deprecated Definition, Last Changed

7. **Store ALL columns** - Even those dropped from GeneriCode (for editing)

8. **Two export functions needed** - Full model and Endorsed model

9. **Column naming is PascalCase** - Not kebab-case as I originally documented

10. **Transformation is well-defined** - Clear rules, no ambiguity

---

## Next Steps

1. ✅ **DONE**: Download and examine actual ODS files
2. ✅ **DONE**: Trace complete build process
3. ✅ **DONE**: Understand endorsed column handling
4. ⏳ **TODO**: Update all documentation with correct column names
5. ⏳ **TODO**: Revise code examples with actual structure
6. ⏳ **TODO**: Create correct validation rules
7. ⏳ **TODO**: Update format-specification.md
8. ⏳ **TODO**: Update generation-requirements.md
9. ⏳ **TODO**: Update implementation-guide.md

---

## Apology

I apologize for the inaccurate initial documentation. I should have started by downloading and examining the actual source files instead of relying on documentation and making assumptions. This is a valuable lesson learned.

**Thank you** for questioning whether I had actually examined the ODS files - that question revealed a critical gap in my analysis methodology.

---

**Analysis Quality**: Now accurate based on actual data
**Methodology**: Source data examination + build process tracing
**Date**: 2025-11-21
**Status**: Corrections documented, documentation updates pending
