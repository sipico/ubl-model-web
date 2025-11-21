# GeneriCode Format Analysis

## Objective

Understand the GeneriCode (GC) XML format that the website must export to integrate with the existing UBL publishing pipeline.

## Key Questions

1. What is the exact structure of GC XML files?
2. How do the three sheets map to GC files?
3. What transformations occur during ODS → GC conversion?
4. What does `ident-UBL.xml` specify?
5. Can we generate GC directly, bypassing ODS?

## Status

**Status**: Not Started
**Priority**: High (needed for export functionality)

## Resources

- Publishing pipeline: https://github.com/oasis-tcs/ubl/blob/ubl-2.5/README.md
- `ident-UBL.xml` and `config-UBL.xml` in that repository

## Notes

This analysis may require coordination with someone who has access to the full publishing pipeline repository and can explain the transformation process in detail.
