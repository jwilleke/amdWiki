---
title: ngdpbase Development TODO
category: System
user-keywords:
- todo
- planning
- roadmap
uuid: 124f3d52-75a0-4e61-8008-de37d1da4ef6
lastModified: '2026-02-10T00:00:00.000Z'
slug: ngdpbase-todo
---

# Project Development TODO

- 1. Storage — where do comments live?
  The natural fit is data/comments/<pageUuid>/<commentId>.json, similar to how attachments are stored. Or would you prefer comments stored inline in the page file (as a YAML
  frontmatter array)? I'd lean toward a separate data/comments/ directory so comments don't pollute page content.
--> a separate data/comments/ directory

- 1. Approval flow — who approves, and how?
  The issue says "anyone with Admin Role." Does approval happen through:

- (a) An admin UI page (e.g. /admin/comments) — list pending, click approve/reject
- (b) An email link (approve token in email)
- (c) Both?

- 3 Rendering — where do approved comments appear on the page?
  Options:

- (a) Automatically appended below page content (injected at render time)
- (b) Via a [{Comments}] plugin directive the page author places manually
- (c) Both — auto-append as default, plugin directive for explicit placement
--> Links following `----` [{ReferringPagesPlugin before='*' after='\n' }] and `----` (Must be space both sides of `----`)
Maybe extend [{ReferringPagesPlugin before='*' after='\n' }]???

## More Information

-4 ngdpbase.comments.require.approval — what's the default?
  Should approval be on by default (safer), or off (comments appear immediately for authenticated users)?

---> Approval off but comments ONLY from authenticated users EVER!

- 5 Editing/deleting comments — who can?

- Author can delete their own? YES
- Admin can delete any? YES
- No editing after submit comments are immutable? TRUE

- 6  Scope — required-pages excluded?
  Should system/required pages (like LeftMenu, Footer, etc.) be comment-eligible, or only user pages?
--> only user pages
