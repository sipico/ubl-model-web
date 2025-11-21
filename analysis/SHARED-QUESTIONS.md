# Shared Questions Document

**Purpose**: Central hub for cross-persona communication and coordination

This document serves as the **single source of truth** for all questions between AI personas working on different analyses. Instead of scattered questions in individual task directories, all personas add their questions here.

## Why a Shared Document?

- ✅ **Single source of truth** - All questions visible in one place
- ✅ **Better coordination** - Easy to see dependencies across the project
- ✅ **Track answers** - Mark questions as answered/addressed with status
- ✅ **Avoid duplication** - See if someone else already asked similar questions
- ✅ **Async collaboration** - Like a distributed team across time zones

## How to Use This Document

### As a Persona (Adding Questions)

When you need input from another domain:

1. **Add your question** using the template below
2. **Set status to "OPEN"**
3. **Continue your work** with reasonable assumptions
4. **Document your assumptions** in your deliverables
5. **Reference this question** in your deliverables (e.g., "See SHARED-QUESTIONS.md #3")

### As the AR Manager (Routing Questions)

1. **Review OPEN questions** regularly
2. **Route to appropriate personas** (start sessions)
3. **Update status to "IN PROGRESS"** when assigning
4. **Mark "ANSWERED"** when complete
5. **Add answer** with link to deliverables

### As a Persona (Answering Questions)

1. **Check for questions addressed to you**
2. **Answer in your deliverables**
3. **Update the question** with status "ANSWERED" and pointer to your work
4. **Notify dependent personas** (via their README or deliverables)

---

## Question Template

```markdown
### Q#: [Brief Title]

**Status**: OPEN | IN PROGRESS | ANSWERED | OBSOLETE
**For**: [Target Persona/Analysis]
**From**: [Your Persona/Analysis]
**Date**: YYYY-MM-DD
**Priority**: High | Medium | Low

**Question**: [Clear, specific question]

**Why it matters**: [How this impacts the requesting persona's work]

**Current assumption**: [What the requester is assuming for now]

**Impact if wrong**: [What would need to change in their work]

**Answer**: [Filled in when answered - link to relevant deliverables]
```

---

## Questions Registry

### Legend
- 🟢 **ANSWERED** - Question has been resolved
- 🟡 **IN PROGRESS** - Someone is working on it
- 🔴 **OPEN** - Waiting for assignment
- ⚫ **OBSOLETE** - No longer relevant

---

## Technical Investigation Questions

<!-- Questions about understanding the current state -->

### Q1: Example - Delete this when first real question is added

**Status**: 🟢 ANSWERED
**For**: Example Persona
**From**: Example Asker
**Date**: 2025-11-21
**Priority**: Low

**Question**: How do I use this document?

**Why it matters**: Need to know the process for cross-persona communication.

**Current assumption**: Read the instructions above.

**Impact if wrong**: Confusion and miscommunication.

**Answer**: See the "How to Use This Document" section above. Remove this example question when adding your first real question.

---

## Requirements Gathering Questions

<!-- Questions about designing the future state -->

---

## Architecture & Design Questions

<!-- Questions about technology choices, system design, etc. -->

---

## Implementation Questions

<!-- Questions that arise during actual development work -->

---

## Meta Questions

<!-- Questions about the process, methodology, or project management -->

---

## Answered Questions Archive

<!-- Periodically move ANSWERED questions here to keep the active sections clean -->

<!-- Move questions here when they've been answered and the dependent work is complete -->

---

**Last Updated**: 2025-11-21
**Document Owner**: AR Manager
