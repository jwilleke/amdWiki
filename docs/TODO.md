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

## 2026-02-08

You pick the order but Work on:

Questions, Comments and Suggestions are always encouraged!

- <https://github.com/jwilleke/amdWiki/issues/123#issuecomment-3863960355>
- <https://github.com/jwilleke/amdWiki/issues/123#issuecomment-3847788173>
- <https://github.com/jwilleke/amdWiki/issues/123#issuecomment-3864004599>
- <https://github.com/jwilleke/amdWiki/issues/235>
- <https://github.com/jwilleke/amdWiki/issues/240>
- <https://github.com/jwilleke/amdWiki/issues/242>
- [FEATURE] in Edit Page Replace "Upload Image button" #243 (You did NOT remove them from the "More..." Dropdown button )
- ~~[BUG](https://github.com/jwilleke/amdWiki/issues/244)~~ - DONE: ConfigurationManager now deep-merges object-type properties

## ~~Started getting Error: Could not render the page on ALL pages~~ FIXED

~~2026-02-08T12:04:30.854Z [error]: [VIEW] Error viewing page~~
~~2026-02-08T12:04:30.854Z [error]: Error rendering error page: a.localeCompare is not a function~~

~~This was following import from  /tmp/import-pages~~

**Root cause**: Pages with numeric-only titles (e.g., `149.txt`) were imported with `title: 149` in YAML frontmatter. YAML parsed these as numbers, not strings, causing `localeCompare` to fail.

**Fix (commit 488ea41)**:

- FileSystemProvider: `String(metadata.title)` ensures titles are strings
- ImportManager.yamlValue(): Quotes numeric-only strings in YAML output

~~[BUG] Error deleting page: Internal Server Error #246~~ - FIXED v1.5.10: slug.toLowerCase error + JSON response for AJAX delete

~~You did not use src/utils/version.ts to perform SEMVER patch and so   "amdwiki.version": "1.5.9" in config/app-default-config.json was not updated.~~ - FIXED: Updated config to 1.5.10

~~[BUG] SLOW page saves #245~~ - FIXED: Incremental save/delete (commit 65e29a8)

~~Create pages for all user-keywords that do not already exist~~ - DONE: Created 9 pages (default, private, draft, review, published, medicine, meteorology, oceanography, political-science). Existing: geology, psychology, sociology, anthropology, economics.

~~[BUG] Search plugin user-keywords filter uses partial string matching #247~~ - FIXED: Uses exact word matching instead of substring includes()
