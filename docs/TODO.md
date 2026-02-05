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

Using v1.5.7 See also <https://github.com/jwilleke/amdWiki/issues/123#issuecomment-3841920418> and
<https://github.com/jwilleke/amdWiki/issues/123#issuecomment-3846451374>

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

- ~~ImagePlugin path resolution — ImagePlugin doesn't resolve filenames to attachment URLs~~ **Done (2026-02-03)** — three-step resolution: page attachment → cross-page → /images/ fallback
- ~~Description auto-populate — Upload description pre-filled with filename~~ **Done (2026-02-03)** — navbar modal, editor, and server-side fallback
- ~~JSPWiki import migration — One-time migration needed for Page/file.png references; also review src/converters~~ **Done (2026-02-04)** — ImportManager.importSinglePage() now auto-imports `-att/` attachments via AttachmentManager; JSPWikiConverter detects unhandled plugins; page name decoding handles `%XX` encoding
- ~~No drag-and-drop upload — Editor has no inline attachment upload~~ **Deferred** — not implementing now; editor attachment panel with upload/insert buttons covers current workflow
- ~~Private/restricted attachments — Issue #122 mentions private folders; no per-attachment ACL beyond auth/anon~~ **Moved to #122** — per-attachment ACL belongs with private folder implementation
- ~~No admin attachment management page — No way to browse/search all attachments from admin UI~~ **Done (2026-02-04)** — `/admin/attachments` page with search, MIME filter, sortable table, pagination, and admin delete
- Thumbnail generation may be stub — Config exists but actual image processing (sharp/jimp) unclear

## Decisions (2026-02-03)

### Image and Attachment Paths

- All user-uploaded images and files are stored in central attachment storage (`amdwiki.attachment.provider.basic.storagedir`) with `<hash>` URLs
- `public/images/` is for app operations only (branding, theming) — developer/repository-managed, read-only to end users
- Files manually placed in `public/images/` continue to work via `[{Image src='photo.jpg'}]` → `/images/photo.jpg`
- `amdwiki.attachment.*` config is for end-user attachments; `amdwiki.features.images.*` is for instance-level app branding — no overlap

### ImagePlugin Resolution Order

When `src` doesn't start with `/` or `http`, ImagePlugin resolves in this order:

- Step 1: Check if filename matches an attachment mentioned by the current page → use `/attachments/<hash>`
- Step 2: Check if it's a `Page/filename` pattern → look up attachment on that page → use `/attachments/<hash>`
- Step 2.5: Global filename search — scan all attachments for exact filename match → use `/attachments/<hash>` (resilient to missing mentions)
- Step 3: Fall back to `/images/<src>` (legacy `public/images/` support)

Attachment and image searches should consider both `amdwiki.attachment.*` and `amdwiki.features.images.*` paths.

### Description Field

Required but auto-populated — pre-fill with the filename, let users edit it. This avoids blocking uploads while ensuring every attachment has a description for browsing.

See comments:

- <https://github.com/jwilleke/amdWiki/issues/232#issuecomment-3851705104>
- <https://github.com/jwilleke/amdWiki/issues/232#issuecomment-3851737481>
- <https://github.com/jwilleke/amdWiki/issues/232#issuecomment-3851743731>

## Implement the following plan

For <https://github.com/jwilleke/amdWiki/issues/232#issuecomment-3851705104>

### Fix: ImagePlugin doesn't resolve attachment filenames (#232)

#### Problem

  `[{Image src='arabian-peninsula.webp'}]` on page `1b951bb5-a0b8-4c01-8366-3774f9546718` doesn't render.

  **Root cause**: The attachment exists in storage (`data/attachments/attachment-metadata.json`) but has an empty `mentions[]` array. ImagePlugin Step 1 calls `getAttachmentsForPage(pageName)` which filters by mentions — finds nothing. Steps 2 and 3 don't
  help (no `/` in filename, and `/images/arabian-peninsula.webp` doesn't exist).  

  The upload route (`/attachments/upload/:page`) correctly passes `pageName` and calls `attachToPage()`, so this is likely a one-off data issue. However, the resolution chain is too fragile — if mentions are missing for any reason, images silently break.  

## Fix: Add global filename fallback (Step 2.5)

  Add a new resolution step between the cross-page lookup and the `/images/` fallback:  

  **Current flow:**

- Step 1: Page-specific attachment lookup (via mentions)
- Step 2: Cross-page `Page/filename` pattern
- Step 3: Fall back to `/images/<src>`

  **New flow:**

- Step 1: Page-specific attachment lookup (via mentions) — unchanged
- Step 2: Cross-page `Page/filename` pattern — unchanged
- **Step 2.5 (NEW): Global filename search** — search ALL attachments for exact filename match
- Step 3: Fall back to `/images/<src>` — unchanged

  This makes the system resilient to missing mentions while keeping page-specific lookups as the preferred path.

## Files to Modify  

- `src/managers/AttachmentManager.ts` — Add `getAttachmentByFilename(filename)` method
- `src/providers/BasicAttachmentProvider.ts` — Add `getAttachmentByFilename(filename)` implementation
- `plugins/ImagePlugin.ts` — Add Step 2.5 using the new method
- `plugins/__tests__/ImagePlugin.test.js` — Add tests for global filename fallback
- `data/attachments/attachment-metadata.json` — Fix the test data (add mention for the page)

## Implementation Details

### BasicAttachmentProvider.getAttachmentByFilename()

  Search `attachmentMetadata` map for first entry where `metadata.name === filename`. Return `AttachmentMetadata` or `null`. Simple linear scan — metadata map is small.

### AttachmentManager.getAttachmentByFilename()

  Delegate to provider, same pattern as other methods.

### ImagePlugin Step 2.5  

  ```typescript
  // Step 2.5: Global filename search across all attachments 
  if (!resolved) { 
  try {
  const globalMatch = await attachmentManager.getAttachmentByFilename(src); 
  if (globalMatch) {  
  src = globalMatch.url; 
  resolved = true; 
  } 
  } catch {  
  // Global lookup failed, continue to fallback  
  } 
  } 
  ```  

### Data fix  

  Add mention to `arabian-peninsula.webp` in `attachment-metadata.json`:

  ```json
  "mentions": [{
  "@type": "WebPage", 
  "name": "1b951bb5-a0b8-4c01-8366-3774f9546718",
  "url": "/wiki/1b951bb5-a0b8-4c01-8366-3774f9546718"  
  }]
  ```  

## Tests to Add  

- ImagePlugin resolves via global filename when page-specific lookup returns no match
- ImagePlugin prefers page-specific match over global match
- `getAttachmentByFilename()` returns matching attachment  
- `getAttachmentByFilename()` returns null for non-existent filename

## Verification  

- `npm test` — all suites pass  
- Manual: page `1b951bb5-a0b8-4c01-8366-3774f9546718` renders `arabian-peninsula.webp` with both simple and captioned syntax

  If you need specific details from before exiting plan mode (like exact code snippets, error messages, or content you generated), read the full transcript at:
  /Users/jim/.claude/projects/-Volumes-jobd-code-GitHub-amdWiki/f9cfc29d-d490-499f-8235-4831fb5622a6.jsonl
