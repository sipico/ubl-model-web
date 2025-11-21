# Google Sheets History Analysis - Session Prompt

## Context

You are helping analyze the edit history of Google Sheets that currently maintain the UBL (Universal Business Language) model for the OASIS UBL Technical Committee. This analysis is part of a project to replace these Google Sheets with a web-based system.

## Project Background

**Repository**: sipico/ubl-model-web
**Project Goal**: Create a website to visualize, maintain, and serve as the authoritative source for the UBL model

Read the project context in:
- `.claude/CLAUDE.md` - Project overview and domain understanding
- `.claude/sessions/2025-11-21_session-01.md` - Initial discovery session

## What is UBL?

Universal Business Language (OASIS standard) - "HTML for business documents"
- Royalty-free XML standard for business document exchange
- Based on UN/CEFACT CCTS 2.01 (Core Components Technical Specification)
- Uses ISO/IEC 11179 naming conventions
- Currently at version 2.4, working towards 2.5

The model consists of Business Information Entities (BIEs):
- **ABIE** (Aggregate BIE): Complex objects like "Address", "Party", "Invoice"
- **BBIE** (Basic BIE): Simple elements like "StreetName", "Amount"
- **ASBIE** (Association BIE): Relationships between ABIEs

## Current Source of Truth

Three Google Sheets maintained by the UBL Technical Committee:

1. **Library Sheet**: https://docs.google.com/spreadsheets/d/18o1YqjHWUw0-s8mb3ja4i99obOUhs-4zpgso6RZrGaY
   - Reusable components (ABIEs, BBIEs, ASBIEs)

2. **Documents Sheet**: https://docs.google.com/spreadsheets/d/1024Th-Uj8cqliNEJc-3pDOR7DxAAW7gCG4e-pbtarsg
   - Document types (Invoice, Order, etc.)

3. **Signatures Sheet**: https://docs.google.com/spreadsheets/d/1T6z2NZ4mc69YllZOXE5TnT5Ey-FlVtaXN1oQ4AIMp7g
   - Digital signature extensions

Each sheet follows a strict structure with 26+ columns (A-Z+) defined by OASIS Business Document Naming and Design Rules. See `.claude/sessions/2025-11-21_session-01.md` for detailed column descriptions.

## Your Mission

Analyze the edit history of these three Google Sheets to understand:

1. **Change Patterns**
   - What types of changes are most common? (new rows, modified cells, deletions)
   - Which columns are edited most frequently?
   - Are changes typically small (single cell) or large (multiple rows)?

2. **Change Frequency**
   - How often are changes made? (daily, weekly, monthly)
   - Are there bursts of activity or steady flow?
   - Seasonal patterns?

3. **User Behavior**
   - How many active editors are there?
   - Do different people edit different sheets or areas?
   - Individual vs. collaborative editing patterns?

4. **Coordination Patterns**
   - Do multiple people edit simultaneously?
   - Are there conflicts or overwrites?
   - How long between edits to same areas?

5. **Common Operations**
   - Adding new BIEs (rows)
   - Modifying definitions (column F)
   - Adjusting cardinality (column C)
   - Deprecating elements (column D)
   - Updating examples (column I)
   - Other patterns?

6. **Problem Areas**
   - Where do mistakes happen?
   - Which columns have most corrections?
   - Any validation issues visible in history?

## Methodology

1. **Access History**
   - Investigate how to access Google Sheets revision history via API or export
   - Determine what information is available (timestamp, user, cell changes, etc.)

2. **Export Data**
   - Export revision history for all three sheets
   - Store in `analysis/google-sheets-history/data/`
   - Document export process in scripts

3. **Analyze**
   - Write analysis scripts in `analysis/google-sheets-history/scripts/`
   - Use Python, JavaScript, or any appropriate tool
   - Focus on insights that inform UI/UX design

4. **Document Findings**
   - Write comprehensive findings in `findings.md`
   - Include visualizations if helpful (charts, graphs)
   - Provide specific recommendations for the website design

## Important Constraints

- **Privacy**: Be mindful of user privacy. Focus on patterns, not individuals unless necessary.
- **Isolation**: **DO NOT modify any code or documents outside this analysis directory**. All work must stay within `analysis/google-sheets-history/`.
- **Language Preference**: Use **Python** for all scripts - it's easier for others to understand and maintain.
- **Credentials Security**:
  - **NEVER commit credentials, API keys, or secrets to git**
  - Only request credentials when actually needed
  - Store them in session context or use environment variables
  - Document what credentials are needed in README.md
  - Ensure `.gitignore` catches credential files
- **Reproducibility**: Make analysis reproducible so it can be re-run later.
- **Access**: You may need credentials or API access - document requirements clearly but handle securely.

## Expected Deliverables

1. **Scripts** in `scripts/` directory:
   - Data export scripts
   - Analysis scripts
   - Any utilities needed

2. **Data** in `data/` directory:
   - Exported revision history (may be gitignored if large/sensitive)
   - Processed datasets
   - Analysis results

3. **Findings** in `findings.md`:
   - Summary of key insights
   - Quantitative metrics (change frequency, patterns, etc.)
   - Qualitative observations
   - Recommendations for website design
   - Testing scenarios based on real usage

4. **Updated README.md**:
   - Update status
   - Document any issues or limitations
   - Note any follow-up analyses needed

## Key Questions to Answer

For website design:
- What editing workflows should we prioritize?
- What errors should we prevent?
- What features would most improve coordination?
- How should we structure permissions?
- What validation is most critical?

For testing:
- What are realistic test scenarios?
- What edge cases actually occur?
- What should regression tests cover?

## Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [OASIS Business Document Naming and Design Rules](http://docs.oasis-open.org/ubl/os-UBL-2.1/UBL-2.1.html)
- UBL 2.5 Spec Section D.4: https://docs.oasis-open.org/ubl/csd01-UBL-2.5/UBL-2.5.html#D-4-THE-CCTS-SPECIFICATION-OF-UBL-BUSINESS-INFORMATION-ENTITIES

## Notes

- This is exploratory analysis - not production code
- Focus on actionable insights
- Document assumptions and limitations
- If you need additional context, refer to session logs in `.claude/sessions/`

---

**Ready to start? Begin by investigating how to access Google Sheets revision history and what data is available.**
