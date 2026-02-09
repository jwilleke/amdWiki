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

[FEATURE] Admin Dashboard: User-Keyword Management (CRUD + Consolidate) #248
And
[FEATURE] Alphabetize User Keywords #249

Are there any pages with no User-Keyword assigned?
⏺ Yes, there are 7 pages without user-keywords assigned (out of 2832 total):

- Install System Integration Guide

- Policies, Roles, and Permissions Architecture
- Paleolithic age
- Apple

❯ My guess is it maybe in caching and maintaining indexes\
  It takes 30 seconds or more to restart server.

We have a lot of code and test entries for ....performance.monitoring (and simialer) Can we look at them?

Quick win: Replace getPage() with getPageMetadata() where only metadata is needed
