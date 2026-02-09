---
title: amdWiki Development TODO
category: System
user-keywords:
- todo  
- planning
- roadmap
uuid: 124f3d52-75a0-4e61-8008-de37d1da4ef6
lastModified: '2026-01-27T00:00:00.000Z'
slug: amdwiki-todo
---

# Project Development TODO

## Completed

- ✅ [FEATURE] Admin Dashboard: User-Keyword Management (CRUD + Consolidate) #248
- ✅ [FEATURE] Alphabetize User Keywords #249
- ✅ [PERF] Server startup performance optimization #250
  - Content caching in FileSystemProvider
  - PageNameMatcher index for O(1) lookups
  - Parallel page loading in buildLinkGraph
  - Result: Startup reduced from ~48s to ~3s (360x speedup for link graph)

## In Progress

- Pages without user-keywords (7 pages): Install System Integration Guide, Policies Roles and Permissions Architecture, Paleolithic age, Apple

## Future Optimizations

- Replace getPage() with getPageMetadata() where only metadata is needed
- Review existing performance monitoring code in MarkupParser
