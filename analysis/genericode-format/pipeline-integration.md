# GeneriCode Pipeline Integration

## Overview

This document explains how GeneriCode (GC) files integrate with the UBL publishing pipeline, their role in schema generation, and the configuration files that control the process.

---

## Publishing Pipeline Architecture

### Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ SOURCE DATA                                                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Library    │  │  Documents   │  │  Signatures  │         │
│  │ Spreadsheet  │  │ Spreadsheet  │  │ Spreadsheet  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────┬──────────────┬──────────────┬────────────────────┘
             │              │              │
             ▼              ▼              ▼
         Download as ODS (OpenDocument Spreadsheet)
             │              │              │
             └──────────────┴──────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ TRANSFORMATION LAYER (Current Website Goal: Replace Above)      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  XSLT: Crane-ods2obdgc.xsl                             │    │
│  │  Input: ODS files + ident-UBL.xml                      │    │
│  │  Output: GeneriCode XML files                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Produces:                                                       │
│  • UBL-Entities-{version}.gc                                    │
│  • UBL-Signature-Entities-{version}.gc                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCHEMA GENERATION (Downstream - Keep Unchanged)                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  XSLT: Crane-gc2obdndr.xsl                             │    │
│  │  Input: GeneriCode files + config-UBL.xml              │    │
│  │  Output: XSD schemas, JSON schemas, documentation      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Produces:                                                       │
│  • XSD schemas (raw/xsd/)                                       │
│  • JSON schemas (raw/json-schema/)                              │
│  • Documentation fragments (raw/mod/)                           │
│  • Code lists (raw/cl/)                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PUBLISHING (GitHub Actions)                                     │
│                                                                  │
│  • Build and validate all artifacts                             │
│  • Package for distribution                                     │
│  • Submit to Réalta for OASIS/ISO formatting                    │
│  • Publish to docs.oasis-open.org                               │
└─────────────────────────────────────────────────────────────────┘
```

### Website Integration Point

**Current**: Google Sheets → ODS → GeneriCode
**Future**: Website Database → **GeneriCode** → (rest unchanged)

The website will **replace** only the top portion of the pipeline. Everything from GeneriCode files onward remains exactly as-is.

---

## Role of GeneriCode Files

### Strategic Position

GeneriCode files are the **critical interface** between:
- **Upstream**: Data entry/maintenance (currently Google Sheets, future: website)
- **Downstream**: Schema generation, documentation, publishing

### Why GeneriCode is the Perfect Boundary

1. **Stable Standard**: OASIS GeneriCode 1.0 is mature and unchanging
2. **Well-Defined**: Clear schema, validation rules, no ambiguity
3. **Tool Support**: Existing XSLT transformations expect this format
4. **Version Control Friendly**: Text-based, line-oriented, diffable
5. **Human Readable**: Developers can inspect and verify output

### What GeneriCode Represents

For the UBL pipeline, GeneriCode files represent:
- **Complete vocabulary** of all UBL entities (ABIEs, BBIEs, ASBIEs, Documents)
- **Single source of truth** for component names, definitions, and metadata
- **Validated dataset** ready for schema generation

---

## Configuration Files

### 1. ident-UBL.xml

**Purpose**: Provides identification metadata for the GeneriCode files

**Location**: Repository root (`ident-UBL.xml`)

**Role**: **Metadata provider only** - not a transformation controller

**Contents**:
```xml
<!DOCTYPE Identification [
  <!ENTITY ublversion "2.5">
  <!ENTITY ublstage "CSD02">
  <!ENTITY ublstagelong "Committee Specification Draft 02">
  <!ENTITY version "&ublversion;-&ublstage;">
  <!ENTITY shortName "UBL-&version;">
  <!ENTITY dir "csd02-UBL-&ublversion;">
]>
<Identification>
  <ShortName>&shortName;</ShortName>
  <LongName xml:lang="en">UBL &ublversion; &ublstagelong; Business Entity Summary</LongName>
  <Version>&ublversion;</Version>
  <CanonicalUri>urn:oasis:names:specification:ubl:BIE</CanonicalUri>
  <CanonicalVersionUri>urn:oasis:names:specification:ubl:BIE:&ublversion;</CanonicalVersionUri>
  <LocationUri>https://docs.oasis-open.org/ubl/&dir;/gc/UBL-Entities-&version;.gc</LocationUri>
  <Agency>
    <LongName xml:lang="en">OASIS Universal Business Language TC</LongName>
    <Identifier>UBL</Identifier>
  </Agency>
</Identification>
```

**Key Elements**:
- `ShortName`: Brief identifier (e.g., "UBL-2.5-CSD02")
- `LongName`: Human-readable name
- `Version`: Version number
- `CanonicalUri`: Permanent URN
- `CanonicalVersionUri`: Version-specific URN
- `LocationUri`: Public URL for the file
- `Agency`: Standards organization

**When to Update**:
- Version number changes (e.g., 2.5 → 2.6)
- Stage changes (e.g., CSD02 → CSD03 → OS)
- URIs change (rare)

**For Website Integration**:
- Store these values in configuration
- Generate `<Identification>` section programmatically
- Update only when publishing a new UBL version

---

### 2. config-UBL.xml

**Purpose**: Configures **downstream** schema generation (XSD, JSON)

**Location**: Repository root (`config-UBL.xml`)

**Role**: Controls GeneriCode → XSD/JSON transformation

**NOT relevant for GeneriCode generation** - only for what happens *after* GeneriCode

**Key Configuration**:
- XSD namespace prefixes
- JSON schema conventions
- Documentation formatting
- Code list handling
- Validation rules

**For Website Integration**:
- **No changes needed** to this file
- Website does not interact with `config-UBL.xml`
- Only affects downstream pipeline stages

---

## Downstream Dependencies

### What Consumes GeneriCode Files?

#### 1. XSD Schema Generation

**Tool**: `Crane-gc2obdndr.xsl` (XSLT transformation)

**Input**:
- GeneriCode files
- `config-UBL.xml`

**Output**:
- `raw/xsd/common/` - Common schema components
- `raw/xsd/maindoc/` - Document schemas

**Process**:
- Reads `<SimpleCodeList>` rows
- Generates XSD `<complexType>` and `<element>` definitions
- Applies CCTS naming rules
- Creates documentation annotations

#### 2. JSON Schema Generation

**Tool**: Custom scripts (likely XSLT or Python)

**Input**:
- GeneriCode files or intermediate XSD

**Output**:
- `raw/json-schema/` - JSON Schema files

**Process**:
- Converts UBL entities to JSON Schema
- Maps XSD types to JSON types
- Preserves cardinality and definitions

#### 3. Documentation Generation

**Tool**: XSLT and formatting scripts

**Input**:
- GeneriCode files
- Generated schemas

**Output**:
- HTML documentation
- PDF specification documents
- Markdown reference guides

**Process**:
- Extracts definitions, examples, usage rules
- Formats as human-readable documentation
- Submits to Réalta for OASIS formatting

---

## Validation Requirements

### What Makes a Valid GeneriCode File?

For the downstream pipeline to succeed, GeneriCode files must be:

#### 1. Schema-Valid
- Must validate against `utilities/genericode/xsd/genericode.xsd`
- All required elements present
- Proper namespace declarations
- Correct `ColumnRef` references

**Validation Command**:
```bash
xmllint --noout --schema utilities/genericode/xsd/genericode.xsd UBL-Entities-2.5.gc
```

#### 2. Key Constraint Satisfied
- `DictionaryEntryName` must be unique across all rows
- No duplicate entries
- No null/empty DEN values

#### 3. Required Columns Present
The following columns are expected by downstream tools:
- `ModelName` (required)
- `ComponentType` (required)
- `DictionaryEntryName` (required - primary key)
- `Definition` (expected for documentation)
- `ComponentName` (expected for naming)
- `ObjectClassTerm` (required for ABIEs/Documents)
- `PropertyTerm` (required for BBIEs)
- `RepresentationTerm` (required for BBIEs)
- `Cardinality` (required for schema generation)

#### 4. Data Consistency
- `ComponentType` must be one of: ABIE, BBIE, ASBIE, MA
- `Cardinality` must be: 0..1, 1..1, 0..n, 1..n (or variants)
- `DictionaryEntryName` must follow CCTS naming rules
- ABIEs have `ObjectClassTerm` but no `PropertyTerm`
- BBIEs have both `PropertyTerm` and `RepresentationTerm`
- ASBIEs have `AssociatedObjectClassTerm`

---

## Testing and Validation

### Validating Generated GeneriCode

**Step 1: Schema Validation**
```bash
cd /path/to/ubl-repo
xmllint --noout --schema utilities/genericode/xsd/genericode.xsd \
  path/to/generated/UBL-Entities-2.5-TEST.gc
```

**Step 2: Transform to XSD**
```bash
cd /path/to/ubl-repo
java -jar utilities/saxon/saxon9he.jar \
  -xsl:utilities/Crane-gc2obdndr/Crane-gc2obdndr.xsl \
  -s:path/to/generated/UBL-Entities-2.5-TEST.gc \
  -o:test-output/
```

**Step 3: Verify XSD Output**
- Check that XSD files are generated
- Validate XSD files themselves
- Look for transformation errors in console output

**Step 4: Compare with Known Good**
```bash
# Compare structure (not exact match due to timestamps, etc.)
diff -u expected/UBL-2.5.xsd generated/UBL-2.5.xsd
```

### Continuous Integration

The OASIS UBL repository uses **GitHub Actions** to:
1. Download latest Google Sheets as ODS
2. Transform to GeneriCode
3. Generate XSD and JSON schemas
4. Validate all outputs
5. Package for distribution

**For the website**:
- Implement similar CI for export validation
- Generate test GeneriCode files
- Run transformation pipeline
- Compare outputs with expected results

---

## Versioning and Archives

### Version Management Strategy

**Current Stage Files**:
- `UBL-Entities-{version}-{stage}.gc`
- Updated continuously during development

**Archived Versions**:
- `os-UBL-2.4/UBL-Entities-2.4-os.gc` (UBL 2.4 final)
- `os-UBL-2.3/UBL-Entities-2.3-os.gc` (UBL 2.3 final)
- etc.

**Archive Strategy**:
When a new version is published:
1. Archive the previous version's GC files
2. Update current files to new version
3. Update `ident-UBL.xml` with new version info
4. Update pipeline to reference new files

**For Website**:
- Support exporting multiple versions
- Tag exports with version and stage
- Maintain historical exports for reference
- Allow reverting to previous versions

---

## GitHub Actions Integration

### Current Workflow

**Trigger**: Push to `ubl-2.5` branch or manual trigger

**Steps**:
1. **Checkout repository**
2. **Download Google Sheets**:
   - Library → `Library.ods`
   - Documents → `Documents.ods`
   - Signatures → `Signatures.ods`
3. **Transform to GeneriCode**:
   - Run `Crane-ods2obdgc.xsl` with Saxon
   - Input: ODS files + `ident-UBL.xml`
   - Output: GC files
4. **Generate Schemas**:
   - Run `Crane-gc2obdndr.xsl` with Saxon
   - Input: GC files + `config-UBL.xml`
   - Output: XSD, JSON schemas, documentation
5. **Validate Outputs**:
   - Schema validation
   - Business rule checking
6. **Package and Publish**:
   - Create distribution ZIPs
   - Upload to GitHub releases
   - Submit to Réalta for formatting

### Future Workflow (With Website)

**Trigger**: Export action on website or API call

**Modified Steps**:
1. **Fetch data from website API**:
   - GET `/api/export/library`
   - GET `/api/export/documents`
   - GET `/api/export/signatures`
2. **Generate GeneriCode directly**:
   - No ODS intermediate step
   - Apply metadata from configuration
   - Validate against GeneriCode schema
3. **Continue with existing pipeline**:
   - Generate schemas (unchanged)
   - Validate (unchanged)
   - Package and publish (unchanged)

---

## Dependencies and Constraints

### External Dependencies

**Required Tools** (for full pipeline):
- **Saxon XSLT Processor** (Saxon9HE or later)
  - Required for XSLT 2.0+ transformations
  - Available at: http://saxon.sf.net

- **xmllint** (from libxml2)
  - For schema validation
  - Standard on most Linux systems

**Optional Tools**:
- **Réalta Publishing System** (OASIS-specific)
  - Formats output for OASIS/ISO standards
  - Not needed for basic schema generation

### Format Constraints

**GeneriCode files must**:
- Be valid XML 1.0 with UTF-8 encoding
- Validate against GeneriCode 1.0 XSD
- Use correct namespace declarations
- Have unique `DictionaryEntryName` values
- Include all required columns for UBL

**GeneriCode files should**:
- Be formatted with indentation for readability
- Have rows sorted by ModelName, then ComponentType
- Include comprehensive definitions
- Follow CCTS naming conventions

### Backwards Compatibility

**GeneriCode format is stable**:
- OASIS GeneriCode 1.0 has not changed since adoption
- New UBL versions use same GC format
- Downstream tools expect consistent structure

**Column changes**:
- UBL may add new columns in future versions
- Existing columns must remain compatible
- New optional columns should not break old tools

---

## Troubleshooting

### Common Issues

#### 1. Invalid GeneriCode XML

**Symptom**: `xmllint` reports validation errors

**Causes**:
- Missing required elements (`Identification`, `ColumnSet`, `SimpleCodeList`)
- Invalid `ColumnRef` references
- Namespace errors
- Malformed XML

**Solution**:
- Validate against GeneriCode XSD
- Check namespace declarations
- Verify all `ColumnRef` match `Column/@Id` values

#### 2. Duplicate DictionaryEntryName

**Symptom**: Key constraint violation

**Causes**:
- Same component defined multiple times
- Copy-paste errors in data
- Incorrect merging of sheets

**Solution**:
- Ensure DEN is unique in source data
- Implement uniqueness validation in website
- Check for duplicates before export

#### 3. Missing Required Columns

**Symptom**: XSD generation fails or produces incomplete schemas

**Causes**:
- Column definitions incomplete in ColumnSet
- Required columns omitted from rows
- Column naming inconsistencies

**Solution**:
- Include all 26+ standard UBL columns
- Mark appropriate columns as "required"
- Test with downstream transformation tools

#### 4. Transformation Produces No Output

**Symptom**: XSLT runs but no XSD files created

**Causes**:
- GeneriCode structure doesn't match expected format
- Missing or incorrect `ModelName` values
- Invalid `ComponentType` values

**Solution**:
- Check XSLT error messages
- Verify GeneriCode structure matches examples
- Ensure ComponentType is ABIE, BBIE, ASBIE, or MA

---

## Performance Considerations

### File Sizes

**UBL 2.4 GeneriCode files**:
- Main entities: ~2.5 MB, ~3,500 rows
- Signature entities: ~100 KB, ~150 rows

**Generation time**:
- Direct XML generation: < 1 second
- XSLT transformation: 2-5 seconds
- Schema generation from GC: 10-30 seconds

### Optimization Tips

1. **Pre-compute DictionaryEntryName**: Don't calculate on-the-fly during export
2. **Sort before export**: Helps with diffing and version control
3. **Stream large exports**: Don't build entire XML in memory
4. **Cache metadata**: Reuse `<Identification>` section across exports
5. **Validate incrementally**: Check data integrity before full export

---

## Key Takeaways

1. **GeneriCode is the Interface**: Perfect boundary between data entry and schema generation

2. **Downstream Pipeline Unchanged**: Everything after GeneriCode stays as-is

3. **Two Configuration Files**:
   - `ident-UBL.xml`: Metadata for GeneriCode (website needs this)
   - `config-UBL.xml`: Schema generation config (website ignores this)

4. **Validation is Critical**: Schema validation + key uniqueness + data consistency

5. **Direct Generation Possible**: No need to create ODS files as intermediate format

6. **Standard Tools Work**: Use `xmllint`, Saxon XSLT processor for testing

7. **Version Management**: Archive previous versions when publishing new releases

8. **GitHub Actions Compatible**: Can integrate website export into existing CI/CD

---

## References

- **UBL Publishing Pipeline**: https://github.com/oasis-tcs/ubl/blob/ubl-2.5/README.md
- **GeneriCode Specification**: http://docs.oasis-open.org/codelist/cs01-genericode-1.0/
- **XSLT Transformations**: `utilities/Crane-*/` in OASIS UBL repository
- **Saxon XSLT Processor**: http://saxon.sf.net
- **OASIS UBL TC**: https://www.oasis-open.org/committees/ubl/
