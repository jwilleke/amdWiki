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

Work on [FEATURE] Handling of attachments #232

## What Works Now

- Central storage — Attachments are stored in data/attachments/ using SHA-256 content hashing (deduplication built in)
- Schema.org metadata — Each attachment tracked in metadata.json as a CreativeWork with author, dates, MIME type, size
- Page linking via "mentions" — Attachments link to pages through a mentions[] array (many-to-many), not stored per-page
- Upload/download/delete routes — /attachments/upload/:page (POST), /attachments/:id (GET/DELETE)
- Markup syntax — [{ATTACH filename.pdf|Display Text|options}] parsed by AttachmentHandler.ts
- Permission checks — Upload/delete require authentication; sensitive extensions blocked for anonymous users
- Backup/restore — Integrated with BackupManager
- Config-driven — Max size (10MB), allowed MIME types, thumbnail settings all configurable
- Enhanced features configured but status unclear — Thumbnails, file size display, file type icons are in config but implementation may be partial
- Attachment panel in editor — Shows page attachments with Insert/Copy URL buttons; dynamically updates after uploads

## What's Missing / Enhancement Opportunities

- ImagePlugin path resolution — ImagePlugin doesn't resolve filenames to attachment URLs (see Decisions below)
- JSPWiki import migration — One-time migration needed for Page/file.png references; also review src/converters
- No drag-and-drop upload — Editor has no inline attachment upload
- Private/restricted attachments — Issue #122 mentions private folders; no per-attachment ACL beyond auth/anon
- No admin attachment management page — No way to browse/search all attachments from admin UI
- Thumbnail generation may be stub — Config exists but actual image processing (sharp/jimp) unclear

## Decisions (2026-02-03)

### Image and Attachment Paths

- All user-uploaded images and files are stored in central attachment storage (`amdwiki.attachment.provider.basic.storagedir`) with `<hash>` URLs
- `public/images/` is for app operations only (branding, theming) — developer/repository-managed, read-only to end users
- Files manually placed in `public/images/` continue to work via `[{Image src='photo.jpg'}]` → `/images/photo.jpg`
- `amdwiki.attachment.*` config is for end-user attachments; `amdwiki.features.images.*` is for instance-level app branding — no overlap

### ImagePlugin Resolution Order

When `src` doesn't start with `/` or `http`, ImagePlugin resolves in this order:

- Check if filename matches an attachment mentioned by the current page → use `/attachments/<hash>`
- Check if it's a `Page/filename` pattern → look up attachment on that page → use `/attachments/<hash>`
- Fall back to `/images/<src>` (legacy `public/images/` support)

Attachment and image searches should consider both `amdwiki.attachment.*` and `amdwiki.features.images.*` paths.

### Description Field

Required but auto-populated — pre-fill with the filename, let users edit it. This avoids blocking uploads while ensuring every attachment has a description for browsing.

### JSPWiki Import Conversion

Write a one-time migration script that finds all `Page/file.png` references, locates the files, uploads them to central storage, and rewrites the markup. Also review and update converters in `src/converters/`.

### Syntax

```text
[{Image src='Geolog_path_text.svg.png' caption='Attachment Description' align='left' style='font-size: 120%;background-color: white;'}]\\
```
