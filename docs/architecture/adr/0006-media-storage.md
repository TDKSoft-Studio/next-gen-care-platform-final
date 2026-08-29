# ADR-0006: Asset and media storage

**Status:** Proposed — human decision required  
**Date:** 2026-08-29

## Context

The portal needs optimized, accessible images/media with alt-text governance and reliable delivery. No storage/CDN/provider or upload workflow is approved.

## Options considered

1. Local/container filesystem.
2. S3-compatible object storage behind a stable port.
3. Managed media/CDN platform.

## Recommendation for review

Exclude local/container storage from production. Prefer an exportable object-storage contract or CMS abstraction unless a managed media platform proves a material time/operations benefit and an acceptable exit path.

## Required evidence before acceptance

EU residency/subprocessors, encryption/key access, private originals/public derivatives, signed upload/read rules, MIME/size/malware controls, alt-text workflow, responsive transformations, cache invalidation, lifecycle/retention, backup/restore, CDN accessibility/performance, cost, and bulk export.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-06.
- Master Contract sections 10, 13, 14, and 17.
