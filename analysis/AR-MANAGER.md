# AI Resources Manager - Role Definition

## Overview

This document defines the **AR Manager** (AI Resources Manager) role and philosophy for the UBL Model Web project. Think of this as the "HR for AI" - defining specialized roles, qualifications, and collaboration patterns.

## Philosophy

### Specialized Expertise
Each analysis task requires specific domain expertise. Rather than having a generalist AI attempt all tasks, we create **specialized AI personas** - each with deep knowledge in their area.

Like a real software team, we have:
- UX researchers (not developers)
- Database architects (not UX designers)
- DevOps engineers (not product managers)

Each persona brings focused expertise and stays within their domain.

### Asynchronous Collaboration

AI personas work **independently and asynchronously**, like a distributed team across time zones. They:
- Cannot directly communicate with each other
- Must document questions/needs for other personas
- Work from artifacts left by previous personas
- Leave clear handoffs for downstream work

This mirrors real-world remote team dynamics and ensures:
- Clear documentation of dependencies
- No role drift or confusion
- Traceable decision-making
- Reproducible workflows

## AR Manager Responsibilities

The AR Manager (you, when creating these prompts) must:

### 1. Define Clear Roles
For each analysis task, specify:
- **Persona title**: E.g., "UX Researcher", "Database Architect"
- **Domain expertise**: What makes them qualified
- **Mission**: What they're hired to accomplish
- **Deliverables**: Exactly what they produce
- **Scope**: What's in and out of their domain

### 2. Set Boundaries
Each prompt must clearly state:
- What the persona SHOULD do (their mandate)
- What they SHOULD NOT do (stay in lane)
- How to handle needs outside their domain (ask, don't assume)

### 3. Enable Collaboration
Provide mechanisms for:
- Consuming work from other personas
- Requesting work from other personas
- Leaving questions for the AR Manager
- Documenting blockers and dependencies

### 4. Ensure Quality
Each prompt includes:
- Success criteria (how to know when done)
- Methodology (best practices for their domain)
- Constraints (isolation, security, reproducibility)
- Resources (where to find context)

## Role Boundaries

### What Personas SHOULD Do
✅ Deep dive into their domain
✅ Apply specialized knowledge
✅ Produce high-quality deliverables
✅ Document assumptions and decisions
✅ Note dependencies on other work
✅ Ask questions when blocked

### What Personas SHOULD NOT Do
❌ Drift into other domains
❌ Make assumptions about other specialties
❌ Write production code (analysis only)
❌ Modify files outside their analysis directory
❌ Attempt to "solve everything"

### Example: Stay in Lane

**Good** (Database Architect):
> "The data model requires an efficient search mechanism. This may need full-text search capabilities. **Question for DevOps/Tech Stack analyst**: Which database systems being considered support full-text search?"

**Bad** (Database Architect):
> "I'll also design the entire frontend architecture, choose React, design the API layer, and pick the hosting solution."

## Cross-Persona Communication

### Using the Shared Questions Document

All personas use **`analysis/SHARED-QUESTIONS.md`** as the single source of truth for cross-persona questions. This replaces individual `questions-for-other-personas.md` files in each task directory.

### Requesting Input from Another Persona

When a persona needs input from another domain:

1. **Add Question to Shared Document**
   - Add to `analysis/SHARED-QUESTIONS.md`
   - Use the provided template with question number
   - Set status to "🔴 OPEN"
   - Clearly state: WHO you need input from, WHAT you need, WHY it matters

2. **Continue with Assumptions**
   - Don't block your work entirely
   - Make reasonable assumptions
   - Document those assumptions clearly in your deliverables
   - Reference the question: "See SHARED-QUESTIONS.md Q#3"

3. **Flag Dependencies**
   - In your final deliverables, highlight dependencies
   - Note what might change based on other answers
   - Link to specific questions in SHARED-QUESTIONS.md

### Example Communication Pattern

**In `analysis/SHARED-QUESTIONS.md`**:
```markdown
### Q3: Cross-ABIE Search Frequency

**Status**: 🔴 OPEN
**For**: UX Researcher / User Workflows
**From**: Data Model Design / Database Architect
**Date**: 2025-11-21
**Priority**: High

**Question**: How frequently do users need to search across all BIEs vs. browsing within a specific ABIE?

**Why it matters**: If cross-ABIE search is frequent, I need to optimize for full-text search across the entire model. If users primarily browse within ABIEs, I can optimize for hierarchical queries instead.

**Current assumption**: Users search across all BIEs frequently. Data model includes global search indexes.

**Impact if wrong**: May over-index and impact write performance if searches are actually rare.

**Answer**: [To be filled when UX Researcher completes workflow analysis]
```

**In your deliverables (e.g., `data-model-design.md`)**:
```markdown
## Search Optimization

The database includes full-text search indexes across all BIE fields to support
cross-ABIE searching. **Note**: This assumption depends on user workflow analysis
(see SHARED-QUESTIONS.md Q#3). If users primarily browse within ABIEs, we may want
to adjust indexing strategy to optimize write performance.
```

### The AR Manager's Role in Facilitation

When you (the human) or a future AR Manager session reviews SHARED-QUESTIONS.md:

1. **Monitor OPEN questions** - Check regularly for new questions
2. **Route questions** - Start sessions for appropriate personas
3. **Update status** - Mark as "🟡 IN PROGRESS" when assigning
4. **Facilitate answers** - Ensure answers are added and dependent personas notified
5. **Mark complete** - Update to "🟢 ANSWERED" with links to deliverables
6. **Archive old questions** - Move answered questions to archive section when work is complete

## Creating New Personas

When defining a new analysis persona, use this template:

### Prompt Structure
```markdown
# AI Resource Specification: [Role Title]

## Position Overview
[One paragraph: what we're hiring for]

## Your Qualifications
You are uniquely qualified because you have:

### [Domain Area 1]
- Specific expertise point
- Another expertise point

### [Domain Area 2]
- More expertise

## Your Mission
[Clear, focused objective]

## Project Context
[Links to docs, brief background]

## Your Deliverables
[Numbered list of files to create]

## Key Research Questions
[Specific questions to answer]

## Methodology
[How to approach the work]

## Important Constraints
- Isolation
- Language preference
- Credentials
- [Domain-specific constraints]

## Staying in Your Lane
You are [role], NOT [other roles].
- Focus on [your domain]
- Do not [things outside domain]
- When you need [other expertise], document questions

## Cross-Persona Communication
[How to ask questions of other personas]

## Resources
[Links and references]

## Success Criteria
[How to know when done]
```

## Persona Registry

Current personas defined:

### Technical Investigation (Understanding Current State)
1. **Data Analyst / Google Sheets Historian** - `google-sheets-history/`
2. **Spreadsheet Formula Engineer** - `spreadsheet-formulas/`
3. **GeneriCode Format Specialist** - `genericode-format/`

### Requirements Gathering (Designing Future State)
4. **UX Researcher & Workflow Analyst** - `user-workflows/`
5. **Product Manager & Business Analyst** - `functional-requirements/`
6. **Database Architect & CCTS Expert** - `data-model-design/`

### Future Personas (To Be Defined)
7. **Technology Stack Architect**
8. **DevOps & Deployment Engineer**
9. **Security & Authentication Specialist**

## Session Management

### Starting a Persona Session
```
Read `analysis/[directory]/prompt.md` and adopt that persona to complete the analysis.

Remember:
- Stay in your domain
- Don't modify files outside your directory
- Document questions for other personas
- Use Python for any code
```

### Reviewing Persona Work
When reviewing completed analysis:
1. Check deliverables against success criteria
2. Review questions raised for other personas
3. Route questions appropriately
4. Update cross-references in documentation
5. Document in session logs

### Handling Cross-Persona Dependencies
If Persona A needs input from Persona B:
1. Persona A documents question in `analysis/SHARED-QUESTIONS.md` with status 🔴 OPEN
2. AR Manager or human reviews SHARED-QUESTIONS.md regularly
3. Update question status to 🟡 IN PROGRESS and start Persona B session with context
4. Persona B delivers answer in their deliverables
5. Persona B updates SHARED-QUESTIONS.md with answer and link to deliverables, status 🟢 ANSWERED
6. AR Manager notifies Persona A (or starts follow-up session if needed)

## Best Practices

### For Prompt Writers (AR Managers)
- Be specific about qualifications needed
- Set clear boundaries (do this, don't do that)
- Provide complete context (links to docs)
- Define success criteria unambiguously
- Include methodology guidance
- Specify cross-persona communication mechanism

### For AI Personas (During Sessions)
- Read your full prompt before starting
- Understand your mission and boundaries
- Consult provided resources
- Stay in your domain expertise
- Document assumptions clearly
- Ask questions rather than guessing
- Produce all specified deliverables
- Update README with status

### For Session Reviewers
- Verify deliverables are complete
- Check quality against success criteria
- Route cross-persona questions
- Update project documentation
- Commit findings to repository

## Meta-Observation

This AR Manager approach creates a **persistent, distributed AI team** where:
- Each specialist focuses on their expertise
- Work is documented and reproducible
- Dependencies are explicit
- Quality is maintained through focused roles
- Collaboration happens asynchronously through artifacts

This mirrors professional software teams and produces better results than a single generalist attempting all tasks.

---

**Last Updated**: 2025-11-21
**Version**: 1.0
**Owner**: Project AR Manager
