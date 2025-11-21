# Endorsed Columns - Complete Explanation

## Date: 2025-11-21
## Source: Actual examination of OASIS UBL build process

---

## TL;DR - What Are Endorsed Columns?

The **"Endorsed"** columns in the Google Sheets are **metadata for generating a SUBSET model** with modified cardinalities. They're used to create TWO different GeneriCode outputs from the SAME source data:

1. **UBL-Entities-{version}.gc** - Full model (all entities)
2. **UBL-Endorsed-Entities-{version}.gc** - Endorsed subset (deprecated items removed, cardinalities adjusted)

---

## The Endorsed Columns in the Spreadsheets

From examining the actual Library/Documents ODS files, these columns exist:

| Column # | Name | Purpose |
|----------|------|---------|
| 3 | **Cardinality** | Standard/full model cardinality |
| 4 | **Endorsed Cardinality** | Modified cardinality for endorsed subset |
| 5 | **Endorsed Cardinality Rationale** | Explanation for why cardinality changed |

**Plus** (not used in transformation):
| Column # | Name | Purpose |
|----------|------|---------|
| 2 | **Subset Cardinality** | (Appears in spreadsheet, renamed to "Subset" in GC) |

---

## How the Build Process Works

### Step 1: Download ODS Files

```bash
wget -O UBL-Library-Google.ods "${libraryGoogle}/export?format=ods"
wget -O UBL-Documents-Google.ods "${documentsGoogle}/export?format=ods"
wget -O UBL-Signature-Google.ods "${signatureGoogle}/export?format=ods"
```

### Step 2A: Create Full Model GeneriCode

```bash
# Transform Library + Documents → UBL-Entities-2.5.gc
java -jar saxon9he.jar \
  -xsl:Crane-ods2obdgc.xsl \
  -o:UBL-Entities-2.5.gc \
  -it:ods-uri \
  ods-uri=UBL-Library-Google.ods,UBL-Documents-Google.ods \
  identification-uri=ident-UBL.xml \
  included-sheet-name-regex="^([Ll]($|[^o].*|o($|[^g].*|g($|[^s].*))))|^[^Ll].*" \
  lengthen-model-name-uri=massageModelName.xml
```

**Result**: GeneriCode with **ALL columns** including:
- Subset
- Cardinality
- EndorsedCardinality ✨
- EndorsedCardinalityRationale ✨

### Step 2B: Create Endorsed Model GeneriCode (Part 1 - Raw)

```bash
# Transform Library + Documents → UBL-Endorsed-Entities-2.5-raw.gc
# SAME transformation, DIFFERENT identification metadata
java -jar saxon9he.jar \
  -xsl:Crane-ods2obdgc.xsl \
  -o:UBL-Endorsed-Entities-2.5-raw.gc \
  -it:ods-uri \
  ods-uri=UBL-Library-Google.ods,UBL-Documents-Google.ods \
  identification-uri=ident-UBL-Endorsed.xml \  # ← Different!
  included-sheet-name-regex="^([Ll]($|[^o].*|o($|[^g].*|g($|[^s].*))))|^[^Ll].*" \
  lengthen-model-name-uri=massageModelName.xml
```

**Result**: Same structure as full model, but with endorsed identification

### Step 2C: Create Endorsed Model GeneriCode (Part 2 - Filter)

```bash
# Filter and modify the raw endorsed GC
java -jar saxon9he.jar \
  -o:UBL-Endorsed-Entities-2.5.gc \
  -s:UBL-Endorsed-Entities-2.5-raw.gc \
  -xsl:gc2endorsed.xsl
```

**Result**: **Filtered and modified** GeneriCode

---

## What gc2endorsed.xsl Does

This transformation performs THREE operations:

### Operation 1: Remove Deprecated Entities

**Rule**: Delete any row where `EndorsedCardinality = '0'` or `'0..0'`

```xsl
<xsl:template priority="1" match="
  Row[Value[@ColumnRef='EndorsedCardinality']/SimpleValue=('0','0..0')]"/>
```

**Example**:
```xml
<!-- This row is REMOVED from endorsed model -->
<Row>
  <Value ColumnRef="ComponentName"><SimpleValue>ObsoleteField</SimpleValue></Value>
  <Value ColumnRef="Cardinality"><SimpleValue>0..1</SimpleValue></Value>
  <Value ColumnRef="EndorsedCardinality"><SimpleValue>0..0</SimpleValue></Value>
</Row>
```

### Operation 2: Remove Child Entities of Deprecated ABIEs

**Rule**: If an ABIE (Aggregate) is deprecated, also remove all its children (BBIEs and ASBIEs)

```xsl
<xsl:key name="c:BIEsRemovedByABIEs"
  use="Value[@ColumnRef='ObjectClass']/SimpleValue"
  match="Row[Value[@ColumnRef='ComponentType']/SimpleValue='ABIE']
            [Value[@ColumnRef='EndorsedCardinality']/SimpleValue=('0','0..0')]"/>

<xsl:template priority="2" match="
  Row[exists(key('c:BIEsRemovedByABIEs',
              Value[@ColumnRef='ObjectClass']/SimpleValue))]"/>
```

**Example**:
```
ABIE: DeprecatedClass. Details (EndorsedCardinality = 0..0)
  ├─ BBIE: DeprecatedClass. Some Property (← REMOVED because parent ABIE removed)
  └─ ASBIE: DeprecatedClass. Some Association (← REMOVED because parent ABIE removed)
```

### Operation 3: Replace Cardinality with EndorsedCardinality

**Rule**: For remaining rows, replace `Cardinality` value with `EndorsedCardinality` value

```xsl
<xsl:template match="Value[@ColumnRef='Cardinality']
                          [../Value[@ColumnRef='EndorsedCardinality']]/
                     SimpleValue" priority="1">
  <xsl:copy-of select="../../Value[@ColumnRef='EndorsedCardinality']/SimpleValue"/>
</xsl:template>
```

**Example**:
```xml
<!-- BEFORE gc2endorsed.xsl -->
<Row>
  <Value ColumnRef="ComponentName"><SimpleValue>InvoiceNumber</SimpleValue></Value>
  <Value ColumnRef="Cardinality"><SimpleValue>0..1</SimpleValue></Value>
  <Value ColumnRef="EndorsedCardinality"><SimpleValue>1..1</SimpleValue></Value>
</Row>

<!-- AFTER gc2endorsed.xsl -->
<Row>
  <Value ColumnRef="ComponentName"><SimpleValue>InvoiceNumber</SimpleValue></Value>
  <Value ColumnRef="Cardinality"><SimpleValue>1..1</SimpleValue></Value>  <!-- ← CHANGED! -->
  <!-- EndorsedCardinality column removed -->
</Row>
```

### Operation 4: Remove All Endorsed Columns

**Rule**: Strip out all columns and values starting with "Endorsed"

```xsl
<xsl:template match="Column[starts-with(@Id,'Endorsed')] |
                     Value[starts-with(@ColumnRef,'Endorsed')]"/>
```

**Result**:
- `<Column Id="EndorsedCardinality">` → REMOVED
- `<Column Id="EndorsedCardinalityRationale">` → REMOVED
- All `<Value ColumnRef="Endorsed*">` elements → REMOVED

---

## Final Column Counts

### Full Model (UBL-Entities-2.5.gc)

**23 columns** including:
1. ModelName (added)
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

**Plus (present but not always used)**:
- EndorsedCardinality ✨
- EndorsedCardinalityRationale ✨

### Endorsed Model (UBL-Endorsed-Entities-2.5.gc)

**23 columns** (same as full model):
- Same columns as full model
- **BUT**: Endorsed* columns removed
- **AND**: Some rows removed (deprecated entities)
- **AND**: Cardinality values replaced with EndorsedCardinality values

---

## Example Transformation Flow

### Input Spreadsheet Row:

| Component Name | Cardinality | Endorsed Cardinality | Endorsed Rationale | ... |
|----------------|-------------|----------------------|-------------------|-----|
| InvoiceNumber  | 0..1        | 1..1                 | Now mandatory     | ... |
| ObsoleteField  | 0..1        | 0..0                 | Deprecated in 2.5 | ... |

### Output GeneriCode (Full Model):

```xml
<Row>
  <Value ColumnRef="ComponentName"><SimpleValue>InvoiceNumber</SimpleValue></Value>
  <Value ColumnRef="Cardinality"><SimpleValue>0..1</SimpleValue></Value>
  <Value ColumnRef="EndorsedCardinality"><SimpleValue>1..1</SimpleValue></Value>
  <Value ColumnRef="EndorsedCardinalityRationale"><SimpleValue>Now mandatory</SimpleValue></Value>
</Row>

<Row>
  <Value ColumnRef="ComponentName"><SimpleValue>ObsoleteField</SimpleValue></Value>
  <Value ColumnRef="Cardinality"><SimpleValue>0..1</SimpleValue></Value>
  <Value ColumnRef="EndorsedCardinality"><SimpleValue>0..0</SimpleValue></Value>
  <Value ColumnRef="EndorsedCardinalityRationale"><SimpleValue>Deprecated in 2.5</SimpleValue></Value>
</Row>
```

### Output GeneriCode (Endorsed Model):

```xml
<!-- InvoiceNumber: Cardinality replaced with EndorsedCardinality, Endorsed* columns removed -->
<Row>
  <Value ColumnRef="ComponentName"><SimpleValue>InvoiceNumber</SimpleValue></Value>
  <Value ColumnRef="Cardinality"><SimpleValue>1..1</SimpleValue></Value>  <!-- ← Changed! -->
</Row>

<!-- ObsoleteField: ENTIRE ROW REMOVED because EndorsedCardinality = 0..0 -->
```

---

## Why Two Models?

### Full Model (UBL-Entities)
- **Contains**: All entities, including deprecated ones
- **Cardinality**: Original/permissive values
- **Purpose**: Complete model for backward compatibility
- **Users**: Existing implementations that rely on deprecated fields

### Endorsed Model (UBL-Endorsed-Entities)
- **Contains**: Only non-deprecated entities
- **Cardinality**: Stricter/updated values
- **Purpose**: Recommended subset for new implementations
- **Users**: New implementations following current best practices

---

## Implications for Website Development

### Database Schema

The website needs to store:

✅ **Cardinality** - Standard cardinality (required)
✅ **Endorsed Cardinality** - Modified cardinality for endorsed subset (optional)
✅ **Endorsed Cardinality Rationale** - Explanation (optional)

**Note**: These are stored in the database but NOT all appear in every GeneriCode export.

### Export Logic

The website needs **TWO export functions**:

#### Export Full Model
```javascript
function exportFullModel(version) {
  // 1. Fetch all entities
  // 2. Include ALL columns including EndorsedCardinality
  // 3. Generate UBL-Entities-{version}.gc
  // 4. All rows included
}
```

#### Export Endorsed Model
```javascript
function exportEndorsedModel(version) {
  // 1. Fetch all entities
  // 2. Filter out where endorsed_cardinality IN ('0', '0..0')
  // 3. Filter out children of removed ABIEs
  // 4. Replace cardinality with endorsed_cardinality
  // 5. Remove Endorsed* columns from output
  // 6. Generate UBL-Endorsed-Entities-{version}.gc
}
```

### UI Considerations

The website should:
1. **Show both cardinalities** in the editor
2. **Highlight differences** between standard and endorsed
3. **Provide export options** for both models
4. **Validate endorsed cardinality** (must be valid or '0'/'0..0')
5. **Show warnings** when setting EndorsedCardinality to 0

---

## Common Use Cases

### Case 1: New Mandatory Field

**Scenario**: A field that was optional is now mandatory in the endorsed model

| Field | Cardinality | Endorsed Cardinality | Rationale |
|-------|-------------|----------------------|-----------|
| InvoiceNumber | 0..1 | 1..1 | Now required for compliance |

**Result**:
- Full model: Optional (0..1)
- Endorsed model: Mandatory (1..1)

### Case 2: Deprecated Field

**Scenario**: A field is being phased out

| Field | Cardinality | Endorsed Cardinality | Rationale |
|-------|-------------|----------------------|-----------|
| ObsoleteField | 0..1 | 0..0 | Superseded by NewField |

**Result**:
- Full model: Optional (0..1) - still present
- Endorsed model: REMOVED entirely

### Case 3: Tightened Multiplicity

**Scenario**: A repeating field is now limited

| Field | Cardinality | Endorsed Cardinality | Rationale |
|-------|-------------|----------------------|-----------|
| ContactPoint | 0..n | 0..1 | Limit to single contact |

**Result**:
- Full model: Unlimited (0..n)
- Endorsed model: Single only (0..1)

---

## Key Takeaways

1. **Endorsed columns are metadata** for creating a filtered/modified subset

2. **Same source data** produces TWO different GeneriCode files

3. **Three transformations occur**:
   - ODS → Full GeneriCode (keep all endorsed columns)
   - ODS → Endorsed Raw GeneriCode (keep all endorsed columns)
   - Endorsed Raw → Endorsed Final GeneriCode (filter and remove endorsed columns)

4. **gc2endorsed.xsl does four things**:
   - Remove rows with EndorsedCardinality = 0 or 0..0
   - Remove children of removed ABIEs
   - Replace Cardinality with EndorsedCardinality
   - Strip out all Endorsed* columns

5. **Website must support BOTH exports**:
   - Full model with all entities and endorsed metadata
   - Endorsed model with filtered entities and updated cardinalities

6. **Column count difference**:
   - Spreadsheet: 26 columns (including Endorsed columns)
   - Full GeneriCode: 23-25 columns (some endorsed kept, some transformation drops)
   - Endorsed GeneriCode: 23 columns (endorsed columns removed)

---

## References

- **Build script**: `build.xml` lines 240-300
- **gc2endorsed.xsl**: https://github.com/oasis-tcs/ubl/blob/ubl-2.5/gc2endorsed.xsl
- **Crane-ods2obdgc.xsl**: `utilities/Crane-ods2obdgc/Crane-ods2obdgc.xsl`
- **Full model GC**: `UBL-Entities-{version}.gc`
- **Endorsed model GC**: `UBL-Endorsed-Entities-{version}.gc`

---

**Analysis Quality**: Complete with actual build process examination
**Understanding**: Now fully documented with transformation logic
**Date**: 2025-11-21
