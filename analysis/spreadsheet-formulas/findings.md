# Spreadsheet Formulas Analysis

**Complete documentation of all formulas, derived column logic, and validation
rules in the three UBL Google Sheets.**

---

## Summary

The UBL model spreadsheets contain formulas in **6 columns** across three
component types. Four columns (A, J, P, S) are fully derived — their values are
computed algorithmically from other columns. One column (Q) is partially derived
(only for ASBIEs). There are no data validation rules, conditional formatting, or
cross-sheet references in the ODS exports.

### Quick Reference: Where Formulas Exist

| Column | Name | ABIE | BBIE | ASBIE |
|--------|------|------|------|-------|
| A | Component Name | ✅ formula | ✅ formula | ✅ formula |
| J | Dictionary Entry Name | ✅ formula | ✅ formula | ✅ formula |
| P | Property Term | — | ✅ formula | ✅ formula |
| Q | Representation Term | — | — | ✅ formula (= P) |
| S | Data Type | — | ✅ formula | — |

### Column Key (Input Columns Referenced by Formulas)

| Col | Name | Description |
|-----|------|-------------|
| K | Object Class Qualifier | Qualifier for the object class (never populated in current data) |
| L | Object Class | The aggregate entity this BIE belongs to |
| M | Property Term Qualifier | Qualifier prefix for property term |
| N | Property Term Possessive Noun | Possessive noun part of property term |
| O | Property Term Primary Noun | Primary noun part of property term |
| Q | Representation Term | The CCTS representation type |
| R | Data Type Qualifier | Qualifier for the data type |
| T | Associated Object Class Qualifier | Qualifier for associated class (never populated) |
| U | Associated Object Class | The associated aggregate entity (ASBIEs) |

---

## Derived Column Formulas

### Overview

The formulas differ by **component type** (ABIE, BBIE, ASBIE), stored in
column V. Each component type has its own formula variant for columns A and J.
The formulas are structurally identical across all sheets in both Library and
Documents spreadsheets — only the row numbers change.

The Signatures spreadsheet uses the **same formula logic** but with different
column letters due to its different column layout (see
[Signatures Section](#signatures-spreadsheet-formulas) below).

---

### Column P — Property Term (BBIE and ASBIE only)

Column P is the simplest derived column. It has two variants.

#### For BBIEs: Concatenate Possessive Noun + Primary Noun

```
P = IF(N <> "", N + " " + O, O)
```

**Logic**: If Possessive Noun (N) is populated, concatenate it with Primary Noun
(O) separated by a space. Otherwise, just use Primary Noun.

**Raw formula** (OpenDocument):
```
of:=IF([.N]<>"";CONCATENATE([.N];" ";[.O]);[.O])
```

**Examples**:

| N (Possessive Noun) | O (Primary Noun) | → P (Property Term) |
|---------------------|-------------------|---------------------|
| *(empty)* | Identifier | Identifier |
| Supply Chain Activity Type | Code | Supply Chain Activity Type Code |
| Street | Name | Street Name |
| UBL Version | Identifier | UBL Version Identifier |
| Issue | Date | Issue Date |
| Building | Number | Building Number |
| Referenced Signature | Identifier | Referenced Signature Identifier |

#### For ASBIEs: Concatenate Associated Object Class (with Qualifier)

```
P = IF(T <> "", T + "_ " + U, U)
```

**Logic**: If Associated Object Class Qualifier (T) is populated, prepend it
with `_ ` separator. Otherwise, just use Associated Object Class (U).

**Note**: T is never populated in current data, so P always equals U for ASBIEs.

**Raw formula** (OpenDocument):
```
of:=CONCATENATE(IF([.T]="";"";CONCATENATE([.T];"_ "));[.U])
```

**Examples**:

| T (Assoc. Qualifier) | U (Associated Object Class) | → P (Property Term) |
|----------------------|-----------------------------|---------------------|
| *(empty)* | Customer Party | Customer Party |
| *(empty)* | Period | Period |
| *(empty)* | Location | Location |
| *(empty)* | Signature | Signature |

---

### Column Q — Representation Term (ASBIE only, formula-driven)

For ASBIEs only, column Q is set by formula to equal column P:

```
Q = P
```

**Raw formula**: `of:=[.P]`

This means for ASBIEs, the Representation Term is always the same as the
Property Term (which is the Associated Object Class name). For BBIEs, Q is
manually entered (e.g., "Text", "Code", "Identifier", "Date", "Amount").

---

### Column S — Data Type (BBIE only)

Column S derives the CCTS data type from the Representation Term (Q) and
optional Data Type Qualifier (R).

```
IF R <> "":
    S = R + "_ " + Q + ". Type"
ELSE:
    S = Q + ". Type"
```

**Raw formula** (OpenDocument):
```
of:=IF([.R]<>"";CONCATENATE([.R];"_ ";[.Q];". Type");CONCATENATE([.Q];". Type"))
```

**Examples**:

| R (Data Type Qualifier) | Q (Representation Term) | → S (Data Type) |
|-------------------------|-------------------------|-----------------|
| *(empty)* | Identifier | Identifier. Type |
| *(empty)* | Code | Code. Type |
| *(empty)* | Text | Text. Type |
| *(empty)* | Name | Name. Type |
| *(empty)* | Date | Date. Type |
| *(empty)* | Amount | Amount. Type |
| *(empty)* | Indicator | Indicator. Type |
| Allowance Charge Reason | Code | Allowance Charge Reason_ Code. Type |
| Currency | Code | Currency_ Code. Type |
| Channel | Code | Channel_ Code. Type |
| Language | Code | Language_ Code. Type |
| Document Status | Code | Document Status_ Code. Type |

**Note**: The `_ ` separator (underscore-space) and `. ` (period-space) are
CCTS naming convention delimiters. The pattern is always
`[Qualifier_ ]RepresentationTerm. Type`.

---

### Column A — Component Name

Column A is the XML element name used in the UBL schemas. It has three distinct
formulas depending on component type.

#### For ABIEs: Remove Spaces from Object Class

```
A = REMOVE_SPACES(K + L)
```

**Raw formula**:
```
of:=SUBSTITUTE(CONCATENATE([.K];[.L]);" ";"")
```

**Logic**: Concatenate Object Class Qualifier (K) and Object Class (L), then
remove all spaces. Since K is never populated, this effectively just removes
spaces from L.

**Examples**:

| K (Qualifier) | L (Object Class) | → A (Component Name) |
|---------------|-------------------|----------------------|
| *(empty)* | Activity Data Line | ActivityDataLine |
| *(empty)* | Address | Address |
| *(empty)* | Invoice | Invoice |
| *(empty)* | Credit Note | CreditNote |
| *(empty)* | Waste Movement | WasteMovement |

#### For BBIEs: Complex Name Abbreviation Logic

This is the most complex formula in the spreadsheet. It constructs the XML
element name from the property term parts with several abbreviation rules.

**Raw formula**:
```
of:=SUBSTITUTE(
  CONCATENATE(
    M;
    N;
    IF(O="Identifier"; "ID";
      IF(AND(O="Text"; OR(M<>""; N<>""));
        "";
        O));
    IF(AND(Q<>"Text"; O<>Q;
           NOT(AND(O="URI"; Q="Identifier"));
           NOT(AND(O="UUID"; Q="Identifier"));
           NOT(AND(O="OID"; Q="Identifier")));
      IF(Q="Identifier"; "ID"; Q);
      "")
  );
  " ";
  "")
```

**Pseudocode**:

```python
def component_name_bbie(M, N, O, Q):
    """
    M = Property Term Qualifier
    N = Property Term Possessive Noun
    O = Property Term Primary Noun
    Q = Representation Term
    """
    parts = []

    # Part 1: Property Term Qualifier (M)
    parts.append(M)

    # Part 2: Property Term Possessive Noun (N)
    parts.append(N)

    # Part 3: Primary Noun with abbreviation rules
    if O == "Identifier":
        parts.append("ID")                    # Abbreviate "Identifier" → "ID"
    elif O == "Text" and (M != "" or N != ""):
        parts.append("")                      # Suppress "Text" when qualified
    else:
        parts.append(O)                       # Use as-is

    # Part 4: Representation Term suffix (when different from Primary Noun)
    if (Q != "Text"                           # Never append "Text"
        and O != Q                            # Only when different from Primary Noun
        and not (O == "URI" and Q == "Identifier")    # URI is equivalent to Identifier
        and not (O == "UUID" and Q == "Identifier")   # UUID is equivalent to Identifier
        and not (O == "OID" and Q == "Identifier")):  # OID is equivalent to Identifier
        if Q == "Identifier":
            parts.append("ID")               # Abbreviate "Identifier" → "ID"
        else:
            parts.append(Q)                  # Append representation term
    # else: don't append anything

    # Join all parts and remove spaces
    return "".join(parts).replace(" ", "")
```

**Abbreviation Rules Explained**:

1. **"Identifier" → "ID"**: Always abbreviated to "ID" wherever it appears
2. **"Text" suppression**: When the Primary Noun is "Text" and there is a
   Qualifier (M) or Possessive Noun (N), "Text" is dropped entirely (e.g.,
   "Inhouse Mail" not "Inhouse Mail Text")
3. **Representation Term suffix**: Only appended when:
   - It differs from the Primary Noun AND
   - It's not "Text" AND
   - The Primary Noun isn't an "Identifier-equivalent" (URI, UUID, OID)
4. **Identifier equivalents**: URI, UUID, and OID are treated as equivalent to
   Identifier — when the Primary Noun is one of these and the Representation
   Term is "Identifier", the suffix is suppressed

**Examples**:

| M (Qualifier) | N (Possessive) | O (Primary) | Q (Rep Term) | → A (Name) |
|---------------|----------------|-------------|--------------|------------|
| | | Identifier | Identifier | ID |
| | Supply Chain Activity Type | Code | Code | SupplyChainActivityTypeCode |
| | Street | Name | Name | StreetName |
| Additional | Street | Name | Name | AdditionalStreetName |
| Inhouse | | Mail | Text | InhouseMail |
| | | Postbox | Text | Postbox |
| | | Description | Text | Description |
| | Building | Number | Text | BuildingNumber |
| | Building | Name | Name | BuildingName |
| | | Value | Text | Value |
| | | UUID | Identifier | UUID |
| | | URI | Identifier | URI |
| Copy | | Indicator | Indicator | CopyIndicator |
| | UBL Version | Identifier | Identifier | UBLVersionID |
| | Issue | Date | Date | IssueDate |
| | Waste Movement Type | Code | Code | WasteMovementTypeCode |
| | Sequence Number | Identifier | Identifier | SequenceNumberID |
| | Consignment | Quantity | Quantity | ConsignmentQuantity |
| | Mark | Attention | Text | MarkAttention |

#### For ASBIEs: Qualifier + Property Term (Simplified)

```
A = REMOVE_SPACES(REMOVE_UNDERSCORES(M + (IF P="Identifier" THEN "ID" ELSE P)))
```

**Raw formula**:
```
of:=SUBSTITUTE(SUBSTITUTE(CONCATENATE([.M];IF([.P]="Identifier";"ID";[.P]));" ";"");"_";"")
```

**Logic**: Concatenate Property Term Qualifier (M) with Property Term (P),
abbreviate "Identifier" to "ID", then remove all spaces and underscores.

**Examples**:

| M (Qualifier) | P (Property Term) | → A (Component Name) |
|---------------|-------------------|----------------------|
| Buyer | Customer Party | BuyerCustomerParty |
| Seller | Supplier Party | SellerSupplierParty |
| Activity | Period | ActivityPeriod |
| Activity Origin | Location | ActivityOriginLocation |
| *(empty)* | Sales Item | SalesItem |
| *(empty)* | Signature | Signature |
| Sender | Party | SenderParty |

---

### Column J — Dictionary Entry Name

Column J constructs the ISO/IEC 11179 Dictionary Entry Name, which serves as the
**primary key** for each entity. It has three variants by component type.

#### For ABIEs: Object Class + ". Details"

```
J = [IF K<>"" THEN K+"_ "] + L + ". Details"
```

**Raw formula**:
```
of:=CONCATENATE(IF([.K]="";"";CONCATENATE([.K];"_ "));[.L];". Details")
```

**Logic**: If Object Class Qualifier (K) is populated, prepend it with `_ `
separator. Then append the Object Class (L) and the literal suffix `. Details`.

**Examples**:

| K (Qualifier) | L (Object Class) | → J (Dictionary Entry Name) |
|---------------|-------------------|-----------------------------|
| *(empty)* | Activity Data Line | Activity Data Line. Details |
| *(empty)* | Address | Address. Details |
| *(empty)* | Invoice | Invoice. Details |
| *(empty)* | Credit Note | Credit Note. Details |

#### For BBIEs: Object Class + Property Term [+ Representation Term]

```
J = [K+"_ "] + L + ". " + [M+"_ "] + P + [IF(M<>"" OR P<>Q) THEN ". "+Q]
```

**Raw formula**:
```
of:=CONCATENATE(
  IF([.K]="";"";CONCATENATE([.K];"_ "));
  [.L];
  ". ";
  IF([.M]="";"";CONCATENATE([.M];"_ "));
  [.P];
  IF(OR([.M]<>"";[.P]<>[.Q]);
    CONCATENATE(". ";[.Q]);
    ""))
```

**Logic**:
1. Start with qualified Object Class: `[Qualifier_ ]ObjectClass`
2. Add `. ` separator
3. Add qualified Property Term: `[Qualifier_ ]PropertyTerm`
4. **Conditionally** add `. RepresentationTerm` — only when:
   - Property Term Qualifier (M) is not empty, OR
   - Property Term (P) differs from Representation Term (Q)

The condition for appending the Representation Term is key: when P equals Q
(e.g., "Identifier" == "Identifier"), the Representation Term is suppressed
**unless** there's a qualifier M that makes P different from the "raw" property
term.

**Examples**:

| K | L | M | P | Q | → J |
|---|---|---|---|---|-----|
| | Activity Data Line | | Identifier | Identifier | Activity Data Line. Identifier |
| | Activity Data Line | | Supply Chain Activity Type Code | Code | Activity Data Line. Supply Chain Activity Type Code. Code |
| | Address | | Street Name | Name | Address. Street Name. Name |
| | Address | Additional | Street Name | Name | Address. Additional_ Street Name. Name |
| | Address | | Postbox | Text | Address. Postbox. Text |
| | Address | Inhouse | Mail | Text | Address. Inhouse_ Mail. Text |
| | Credit Note | Copy | Indicator | Indicator | Credit Note. Copy_ Indicator. Indicator |
| | Credit Note | | UUID | Identifier | Credit Note. UUID. Identifier |
| | Waste Movement | | Issue Date | Date | Waste Movement. Issue Date. Date |

#### For ASBIEs: Object Class + Property Term [+ Representation Term]

```
J = [K+"_ "] + L + ". " + [M+"_ "] + P + [IF M<>"" THEN ". "+Q]
```

**Raw formula**:
```
of:=CONCATENATE(
  IF([.K]="";"";CONCATENATE([.K];"_ "));
  [.L];
  ". ";
  IF([.M]="";"";CONCATENATE([.M];"_ "));
  [.P];
  IF([.M]="";"";CONCATENATE(". ";[.Q])))
```

**Logic**: Same as BBIE but the condition for appending the Representation Term
is simpler — only when Qualifier (M) is not empty. For unqualified ASBIEs, the
DEN is just `ObjectClass. PropertyTerm`.

**Examples**:

| K | L | M | P | Q | → J |
|---|---|---|---|---|-----|
| | Activity Data Line | Buyer | Customer Party | Customer Party | Activity Data Line. Buyer_ Customer Party. Customer Party |
| | Activity Data Line | Seller | Supplier Party | Supplier Party | Activity Data Line. Seller_ Supplier Party. Supplier Party |
| | Activity Data Line | | Sales Item | Sales Item | Activity Data Line. Sales Item |
| | Waste Movement | | Signature | Signature | Waste Movement. Signature |
| | Waste Movement | Sender | Party | Party | Waste Movement. Sender_ Party. Party |

---

## Non-Derived Columns

All other columns (**B, C, D, E, F, G, H, I, K, L, M, N, O, R, T, U, V, W, X,
Y, Z**) are **manually entered** — they contain no formulas. This was confirmed
by scanning all cells across all sheets in all three spreadsheets.

### Columns Never Populated in Current Data

Two input columns referenced by formulas are structurally present but never have
values:

- **K (Object Class Qualifier)**: Always empty across all 3,000+ Library rows
  and all 100 Document sheets
- **T (Associated Object Class Qualifier)**: Always empty

The formulas still account for these columns (using `IF(K<>""; K+"_ "; "")`
patterns), so the website implementation should support them even though they're
currently unused.

---

## Validation Rules

### In the Spreadsheets

**No data validation rules** were found in any of the three ODS files. There are
no dropdown lists, no cell-level validation constraints, and no conditional
formatting rules in the exported ODS format.

### Implicit Constraints (from formula logic and CCTS rules)

While not enforced by the spreadsheet, these constraints are implied:

1. **Column V (Component Type)** must be one of: `ABIE`, `BBIE`, `ASBIE`, `END`
2. **Valid cardinalities** (columns C, D): `0..1`, `1..1`, `0..n`, `1..n`,
   and for endorsed column D only: `0`, `0..0`
3. **Representation Terms** (column Q for BBIEs) must be from the standard CCTS
   types defined in `config-UBL.xml`:
   Amount, Binary Object, Code, Date Time, Date, Graphic, Identifier, Indicator,
   Measure, Name, Numeric, Percent, Picture, Quantity, Rate, Sound, Text, Time,
   Value, Video
4. **Row structure**: Each group starts with an ABIE row, followed by its
   BBIE/ASBIE children, terminated by the next ABIE or an `END` marker
5. **DEN uniqueness**: Column J values must be unique (it's the primary key)

---

## Signatures Spreadsheet Formulas

The Signatures spreadsheet uses **identical formula logic** but different column
letters because it has a different column layout (32 columns instead of 26, in a
different order).

### Column Mapping: Signatures → Library/Documents

| Signatures | Library/Documents | Meaning |
|------------|-------------------|---------|
| A | A | Component Name (derived) |
| B | J | Dictionary Entry Name (derived) |
| C | K | Object Class Qualifier |
| D | L | Object Class |
| E | M | Property Term Qualifier |
| F | N | Property Term Possessive Noun |
| G | O | Property Term Primary Noun |
| H | P | Property Term (derived) |
| I | Q | Representation Term |
| J | R | Data Type Qualifier |
| K | S | Data Type (derived) |
| L | T | Associated Object Class Qualifier |
| M | U | Associated Object Class |
| P | V | Component Type |

### Signatures Formula Examples

**Column A (UBL Name)** — same logic, different letters:
- ABIE: `SUBSTITUTE(CONCATENATE(C, D), " ", "")` → same as Library's `SUBSTITUTE(CONCATENATE(K, L), " ", "")`
- BBIE: uses E, F, G, I instead of M, N, O, Q
- ASBIE: uses E, H instead of M, P

**Column B (Dictionary Entry Name)** — same logic:
- ABIE: `CONCATENATE(IF(C="","",C+"_ "), D, ". Details")`
- BBIE: `CONCATENATE(IF(C="","",C+"_ "), D, ". ", IF(E="","",E+"_ "), H, IF(OR(E<>"",H<>I),". "+I,""))`

**Column H (Property Term)** — same logic:
- BBIE: `IF(F<>"", F+" "+G, G)` — same as Library P: `IF(N<>"", N+" "+O, O)`
- ASBIE: `CONCATENATE(IF(L="","",L+"_ "), M)` — same as Library P: `CONCATENATE(IF(T="","",T+"_ "), U)`

**Column K (Data Type)** — same logic:
- BBIE: `IF(J<>"", J+"_ "+I+". Type", I+". Type")` — same as Library S

**Minor difference**: The BBIE Column A formula in Signatures omits the `OID`
check that Library/Documents includes:
```
# Library/Documents BBIE Column A checks:
NOT(AND(O="URI";Q="Identifier"))
NOT(AND(O="UUID";Q="Identifier"))
NOT(AND(O="OID";Q="Identifier"))   ← present in Library/Documents

# Signatures BBIE Column A checks:
NOT(AND(G="URI";I="Identifier"))
NOT(AND(G="UUID";I="Identifier"))
                                     ← OID check absent in Signatures
```

This is likely an oversight since the Signatures spreadsheet is much smaller and
doesn't contain any OID fields. The website implementation should include the OID
check universally.

### Signatures Data

The Signatures spreadsheet contains only 2 sheets with minimal data:
- **CommonSgntComponents**: 1 ABIE + 1 ASBIE + END marker (3 data rows)
- **SgntLibrary**: 1 ABIE + 2 BBIEs + END marker (4 data rows)

---

## Cross-Reference with Build Configuration

### config-UBL.xml: Abbreviation Rules

The build configuration defines name abbreviations that are used **at the
XSD/JSON schema generation level**, not in the spreadsheet formulas themselves.
The spreadsheet formulas handle their own abbreviations (Identifier→ID,
Text suppression, URI/UUID/OID equivalences).

**Name abbreviations** (for XML element names in schemas):

| Short | Full |
|-------|------|
| CV2 | Card Verification Value |
| ID | Identifier |
| IMO | International Maritime Organisation |
| INF | Irradiated Nuclear Fuel |
| ISPS | International Ship and Port Facility Security |
| ISSC | International Ship Security Certificate |
| OID | Object Identifier |
| MMSI | Maritime Mobile Service Identity |
| SME | Micro-, Small-, and Medium-sized Enterprise |
| SSP | Ship Security Plan |
| URI | Uniform Resource Identifier |
| UN | United Nations |
| UNDG | United Nations Development Group |
| UBL | Universal Business Language |
| UUID | Universally Unique Identifier |
| WHO | World Health Organisation |
| XPath | XML Path Language |

**Identifier equivalences** (Primary Nouns treated as Identifiers):
- OID ↔ Identifier
- URI ↔ Identifier
- UUID ↔ Identifier

These equivalences match the BBIE Column A formula logic exactly — confirming
that the spreadsheet formulas encode the same rules as the build config.

### massageModelName.xml: Sheet Name Abbreviations

This file handles **worksheet tab name** abbreviations to fit the 31-character
ODS sheet name limit. It maps between full names and abbreviated names:

| Full | Abbreviated |
|------|-------------|
| Catalogue | Ctlg |
| Qualification | Qlfctn |
| Transport (not "Transporta...") | Txp |
| Signature | Sgnt |
| Procedure | Prcd |

These are applied at the ODS-to-GC conversion step (by the Crane XSLT) and are
**not relevant to formula logic**. The website can use full names.

### Build Pipeline

The current pipeline: Google Sheets → ODS → `Crane-ods2obdgc.xsl` → GC XML

The XSLT reads **computed cell values** from the ODS (not formulas). This
confirms that the spreadsheet formulas are the authoritative source of truth for
derived column values. The website needs to replicate these formulas exactly.

---

## Implementation Guide

### TypeScript Functions for Derived Columns

```typescript
// Column P: Property Term
function derivePropertyTerm(row: BieRow): string {
  if (row.componentType === 'ASBIE') {
    // ASBIE: from Associated Object Class (with optional qualifier)
    return row.associatedObjectClassQualifier
      ? `${row.associatedObjectClassQualifier}_ ${row.associatedObjectClass}`
      : row.associatedObjectClass;
  }
  // BBIE: from Possessive Noun + Primary Noun
  return row.propertyTermPossessiveNoun
    ? `${row.propertyTermPossessiveNoun} ${row.propertyTermPrimaryNoun}`
    : row.propertyTermPrimaryNoun;
}

// Column Q: Representation Term (ASBIE only)
function deriveRepresentationTerm(row: BieRow): string | undefined {
  if (row.componentType === 'ASBIE') {
    return derivePropertyTerm(row);  // Q = P for ASBIEs
  }
  return undefined; // Q is manually entered for BBIEs
}

// Column S: Data Type (BBIE only)
function deriveDataType(row: BieRow): string | undefined {
  if (row.componentType !== 'BBIE') return undefined;
  return row.dataTypeQualifier
    ? `${row.dataTypeQualifier}_ ${row.representationTerm}. Type`
    : `${row.representationTerm}. Type`;
}

// Column J: Dictionary Entry Name
function deriveDictionaryEntryName(row: BieRow): string {
  const qualifiedObjClass = row.objectClassQualifier
    ? `${row.objectClassQualifier}_ ${row.objectClass}`
    : row.objectClass;

  if (row.componentType === 'ABIE') {
    return `${qualifiedObjClass}. Details`;
  }

  const propertyTerm = derivePropertyTerm(row);
  const qualifiedPropTerm = row.propertyTermQualifier
    ? `${row.propertyTermQualifier}_ ${propertyTerm}`
    : propertyTerm;

  if (row.componentType === 'BBIE') {
    // Append Representation Term when qualified OR when P != Q
    const appendRepTerm =
      row.propertyTermQualifier !== '' || propertyTerm !== row.representationTerm;
    return appendRepTerm
      ? `${qualifiedObjClass}. ${qualifiedPropTerm}. ${row.representationTerm}`
      : `${qualifiedObjClass}. ${qualifiedPropTerm}`;
  }

  if (row.componentType === 'ASBIE') {
    // Append Representation Term only when qualified
    return row.propertyTermQualifier
      ? `${qualifiedObjClass}. ${qualifiedPropTerm}. ${row.representationTerm}`
      : `${qualifiedObjClass}. ${qualifiedPropTerm}`;
  }

  return ''; // Should not reach here
}

// Column A: Component Name
function deriveComponentName(row: BieRow): string {
  if (row.componentType === 'ABIE') {
    // Simple: remove spaces from [Qualifier +] Object Class
    return (
      (row.objectClassQualifier || '') + row.objectClass
    ).replace(/ /g, '');
  }

  if (row.componentType === 'BBIE') {
    return deriveBbieComponentName(
      row.propertyTermQualifier,
      row.propertyTermPossessiveNoun,
      row.propertyTermPrimaryNoun,
      row.representationTerm,
    );
  }

  if (row.componentType === 'ASBIE') {
    const propertyTerm = derivePropertyTerm(row);
    const abbreviated = propertyTerm === 'Identifier' ? 'ID' : propertyTerm;
    return (
      (row.propertyTermQualifier || '') + abbreviated
    ).replace(/ /g, '').replace(/_/g, '');
  }

  return '';
}

function deriveBbieComponentName(
  M: string, // Property Term Qualifier
  N: string, // Property Term Possessive Noun
  O: string, // Property Term Primary Noun
  Q: string, // Representation Term
): string {
  let result = '';

  // Part 1 & 2: Qualifier + Possessive Noun
  result += M;
  result += N;

  // Part 3: Primary Noun with abbreviation rules
  if (O === 'Identifier') {
    result += 'ID';
  } else if (O === 'Text' && (M !== '' || N !== '')) {
    // Suppress "Text" when qualified
    result += '';
  } else {
    result += O;
  }

  // Part 4: Representation Term suffix
  const isIdentifierEquivalent =
    (O === 'URI' || O === 'UUID' || O === 'OID') && Q === 'Identifier';

  if (Q !== 'Text' && O !== Q && !isIdentifierEquivalent) {
    result += Q === 'Identifier' ? 'ID' : Q;
  }

  // Remove all spaces
  return result.replace(/ /g, '');
}
```

### Key Implementation Notes

1. **Derived columns should be computed on read/display**, not stored.
   The database should store only the input columns (K, L, M, N, O, Q, R, T, U,
   V). Columns A, J, P, S are deterministic outputs.

2. **The `_ ` separator** (underscore-space) in Dictionary Entry Names is a CCTS
   convention, not a regular space. It indicates a qualifier relationship.

3. **The `. ` separator** (period-space) in DEN and Data Type separates
   structural parts of the name.

4. **"Text" suppression** in Component Names is context-dependent — it only
   happens when there are qualifying terms (M or N populated). A bare "Text"
   Primary Noun is kept.

5. **Q (Representation Term) for ASBIEs** should be auto-populated from P
   (Property Term). Users should not need to edit Q for ASBIEs.

6. **The END marker** in column V signals the end of a worksheet's data. The
   website should use database queries instead.

7. **Object Class Qualifier (K) and Associated Object Class Qualifier (T)** are
   never used in current data but are supported by the formulas. The website
   should support them for forward compatibility.

---

## Column Classification: Input Types and Value Distributions

Every cell across all 3 spreadsheets (3,183 Library rows, 2,671 Documents rows
across 101 sheets, and 5 Signatures rows) was analyzed to classify each column
by its actual usage pattern. This determines which fields need free-text input,
which should be dropdowns, and which are fully automatic.

### Auto-Derived — No User Input (5 columns)

These columns are entirely computed by formulas. Users never edit them.

| Col | Name | Derived From |
|-----|------|-------------|
| **A** | Component Name | K, L, M, N, O, Q (varies by type) |
| **J** | Dictionary Entry Name | K, L, M, P, Q (varies by type) |
| **P** | Property Term | N+O (BBIE) or T+U (ASBIE) |
| **S** | Data Type | R+Q (BBIE only) |
| **Q** | Representation Term | = P (ASBIE only; manual for BBIEs) |

### Pick From Fixed Set — Dropdown (4 columns)

These columns have a small, well-defined set of valid values.

| Col | Name | Valid Values | Notes |
|-----|------|-------------|-------|
| **V** | Component Type | `ABIE`, `BBIE`, `ASBIE` | 3 options (+ `END` marker in sheets) |
| **C** | Cardinality | `0..1`, `1`, `0..n`, `1..n` | 4 options. `1` means `1..1` |
| **D** | Endorsed Cardinality | `0`, `0..0`, `0..1` + the C values | Rarely used: 23 of 3,183 Library rows, 80 of 2,671 Documents rows |
| **X** | Current Version | `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5` | 6 values; always the UBL version when the BIE was introduced |

### Pick From Constrained Vocabulary — Searchable Dropdown (4 columns)

These columns draw from a larger but still bounded set of known values.

| Col | Name | Library Unique | Documents Unique | Nature |
|-----|------|---------------|-----------------|--------|
| **Q** | Representation Term (BBIE) | 20 standard types | 15 types | Must match CCTS type list: Amount, Binary Object, Code, Date, Date Time, Graphic, Identifier, Indicator, Measure, Name, Numeric, Percent, Picture, Quantity, Rate, Sound, Text, Time, Value, Video |
| **O** | Primary Noun | 192 | 33 | Heavily concentrated: Code (18%), Identifier (14%), Amount (6%), Indicator (6%). Documents use far fewer because they reference Library components |
| **R** | Data Type Qualifier | 19 | 4 | Rarely used: 27 of 1,781 Library BBIEs, 68 of 1,413 Documents BBIEs. Values like "Currency", "Language", "Line Status" |
| **L** | Object Class | 310 (Library) | 101 (Documents) | Not free-text — picks from existing ABIEs. Each BBIE/ASBIE inherits this from its parent ABIE |

### Pick From Existing Entities — Reference Selector (1 column)

| Col | Name | Library Unique | Documents Unique | Nature |
|-----|------|---------------|-----------------|--------|
| **U** | Associated Object Class | 256 | 114 | ASBIE only. References an existing ABIE name. Top values: Party (122x), Period (88x), Document Reference (79x) |

### Conventional Terms — Autocomplete With History (2 columns)

These have many unique values but follow naming conventions. An autocomplete
drawing from previously-used values would work well.

| Col | Name | Library Unique | Docs Unique | Populated | Top Values |
|-----|------|---------------|-------------|-----------|------------|
| **M** | Prop. Term Qualifier | 631 | 207 | 38% (Lib), 33% (Doc) | "Maximum", "Minimum", "Additional", "Total", "Copy", "Receiver" |
| **N** | Possessive Noun | 564 | 96 | 29% (Lib), 34% (Doc) | "Line Extension", "Issue", "Response", "UBL Version" |

### Free Text — Editor Input (5 columns)

These require genuine human-authored content.

| Col | Name | Populated | Avg Len | Max Len | Notes |
|-----|------|-----------|---------|---------|-------|
| **F** | Definition | 99.9% | 70 (Lib), 73 (Doc) | 445 (Lib), 1025 (Doc) | Almost always required. ~3,000 unique definitions in Library alone |
| **E** | Endorsed Card. Rationale | <1% (Lib), 3% (Doc) | 82, 71 | 183, 249 | Only when D is set. Explains why cardinality changed |
| **H** | Alt. Business Terms | 5% (Lib), 3% (Doc) | 24, 29 | 94, 141 | Optional synonyms |
| **I** | Examples | 11% (Lib), 12% (Doc) | 27, 11 | 735, 117 | Illustrative values |
| **Z** | Editor's Notes | 12% (Lib), 4% (Doc) | 42, 12 | 501, 70 | Internal notes, JIRA ticket refs |
| **G** | Deprecated Definition | <0.1% | 71 | 71 (Lib), 150 (Doc) | Only 2 rows in Library, 4 in Documents |

### Never Populated (4 columns)

These columns exist in the structure but have no data in any row of any sheet.

| Col | Name | Notes |
|-----|------|-------|
| **B** | Subset Cardinality | Reserved for subsetting; never used |
| **K** | Object Class Qualifier | Formulas support it; no data exists |
| **T** | Assoc. Object Class Qualifier | Formulas support it; no data exists |
| **Y** | Last Changed | Dropped from GC export too |

### Summary: What a User Actually Edits

When **adding a new BBIE** (the most common operation), the user provides:

1. **V** — Component Type → pick `BBIE` (or implied by context)
2. **L** — Object Class → inherited from parent ABIE (automatic)
3. **M** — Property Term Qualifier → optional, autocomplete (38% of BBIEs)
4. **N** — Possessive Noun → optional, autocomplete (29% of BBIEs)
5. **O** — Primary Noun → searchable dropdown of ~30 standard terms
6. **Q** — Representation Term → dropdown of ~20 CCTS types
7. **C** — Cardinality → dropdown of 4 options
8. **F** — Definition → free text (required)
9. **R** — Data Type Qualifier → rarely needed (1.5% of BBIEs)

Everything else is auto-derived (A, J, P, S), optional metadata (H, I, W, Z),
or never used (B, K, T, Y).

**Adding a new ASBIE** is even simpler: pick L (inherited), optionally M
(qualifier), U (associated ABIE from dropdown), C (cardinality), and write F
(definition). Columns A, J, P, Q, S are all auto-derived.

**Adding a new ABIE**: just L (name) and F (definition). Two fields.

---

## Appendix: Row Counts

| Spreadsheet | Sheet | Data Rows | ABIEs | BBIEs | ASBIEs |
|-------------|-------|-----------|-------|-------|--------|
| Library | CommonLibrary | 3,183 | 309 | 1,781 | 1,092 |
| Documents | 100 sheets | ~25 each | 1 MA/ABIE + children | | |
| Signatures | CommonSgntComponents | 2 | 1 | 0 | 1 |
| Signatures | SgntLibrary | 3 | 1 | 2 | 0 |

---

## Appendix: Logs Sheets

Each spreadsheet has a "Logs-sheet" tab that records script execution events:

```
10/13/2025 7:11:14  Script executed.  Edited by: kees@duvekot.net
10/15/2025 6:32:15  Script executed.  Edited by: No editors logged.
```

These are generated by Google Apps Script triggers (not formulas) and are
filtered out during the ODS-to-GC conversion via the `included-sheet-name-regex`
parameter: `^([Ll]($|[^o].*|o($|[^g].*|g($|[^s].*))))|^[^Ll].*` — which
excludes sheets starting with "Log".
