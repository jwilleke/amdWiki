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

%%table-fit
%%border
|| Day || From || To || Est. Miles ||
| 1 | Mount Vernon, OH | Elgin, IL | 440 |
/%
/%

Page  Medical Summary - Molly E. Willeke (MEW)
Author: molly but molly STILL can not open it.
Neither can Jim (Admin Role)
Title:         Medical Summary - Molly E. Willeke (MEW)
Page Name:     Medical Summary - Molly E. Willeke (MEW)
Slug:          medical-summary-molly-e-willeke-mew
UUID:          b06973bc-56c2-4da0-8702-08408de8c207
Version:       v5 of 5
URL:           <http://jminim4:3000/view/Medical%20Summary%20-%20Molly%20E.%20Willeke%20(MEW)#>
Created:       4/21/2026, 10:43:56 AM
Last Modified: 4/21/2026, 10:44:10 AM
Last Accessed: 4/21/2026, 10:44:11 AM
Author:        molly
Editor:        molly
Category:      general
User Keywords: health, private

Custom Metadata
author-lock: true
system-location: private
page-creator: jim
system-keywords:

The "_comment_interwiki": "InterWiki link configuration", are not working

Pacific_Ocean

* [^2] - [Pacific_Ocean|Wikipedia:Pacific_Ocean|target='_blank'] - based on information obtained 2026-04-21

MUST become like:
<https://en.wikipedia.org/wiki/Pacific_Ocean>

## mew health

Title:         Medical Summary - Molly E. Willeke (MEW)
Page Name:     Medical Summary - Molly E. Willeke (MEW)
Slug:          medical-summary-molly-e-willeke-mew
UUID:          b06973bc-56c2-4da0-8702-08408de8c207
Version:       v3 of 3
URL:           <http://jminim4:3000/view/Medical%20Summary%20-%20Molly%20E.%20Willeke%20(MEW)#>
Created:       4/21/2026, 10:34:16 AM
Last Modified: 4/21/2026, 10:36:09 AM
Last Accessed: 4/21/2026, 10:36:11 AM
Author:        molly
Editor:        molly
Category:      general
User Keywords: health, private

## Footernotes

The current templates/default.md shows :

```
---
uuid: {{uuid}}
category: {{category}}
user-keywords: {{userKeywords}}

# Overview

[{$pagename}]
```

MUST be more like

```
---
uuid: {{uuid}}
category: {{category}}
user-keywords: {{userKeywords}}
---
# Overview

[{$pagename}]
```

I found the bug. The "developer" system category has storageLocation: "github" in the config, but it's enabled: true, so it appears in the admin's system-category dropdown. When
   an admin selects "developer" and creates a page, FileSystemProvider.savePage throws:

Cannot save page with system-category 'developer' - pages with storageLocation 'github' are not stored in the wiki

This is caught by the outer try/catch in createPageFromTemplate and returns the generic "Error creating page".

Fix: Filter out storageLocation === 'github' categories from getSystemCategories() so they never appear in the create/edit dropdown.

This is NOT what happend as system category was general
![alt text](image.png)

But we SHOULD fix it so "developer" and "addon" it not in the dropdown as these are only set by API calls or the system.

We do not even reach the /edit page so templates should not be involved

We should indcate
${SLOW_STORAGE}/data/
${FAST_STORAGE}/data/

Step 7
Apply to both project data/pages/ and live /Volumes/hd2A/jimstest-wiki/data/pages/.
There is ONLY (From .env)

FAST_STORAGE=/Volumes/hd2/jimstest-wiki/data/
SLOW_STORAGE=/Volumes/hd2A/jimstest-wiki/data/pages (data/pages/)

Step 8 — MarkupParser: suppress footnote bullets from rendered body
Why NOT Mirgrate to ${SLOW_STORAGE}/data/footnotes/{uuid}.json

## Verification

* run all tests
* npm run build passes
* ren all E2E Tests
* ...

----

I would like, if there is an markdown link within the page as a referencce, lake at the end of a sentance, to place a [^#] markerr and add this to the footnotes.

The footnote definitions (* [^N] - ...) stay in the raw page source — that's where FootnotesPlugin reads them. But right now they also render visibly in the page body as bullet
  points, which is the double-display problem you're seeing.

  The fix is to strip footnote bullet lines from the rendered body before the markdown parser sees them, since FootnotesPlugin already displays them in the tab. They stay in the
  file, just hidden from the body.

  Want me to implement that? It would go in the rendering pipeline — strip *[^N] - ... and* [#N] - ... lines before textToHTML, but leave the raw source untouched so
  FootnotesPlugin can still read them.

❯ Where are the footnate tabs data stored?

⏺ In the same .md file as the page content — at the bottom, as plain text lines:

* [^1] - [Washington Post|https://www.washingtonpost.com]
* [^2] - [Some Study|https://example.com]

  FootnotesPlugin reads rawContent from PageManager (the unrendered markdown) and extracts those lines. There is no separate storage — the footnotes live inside the page file
  itself.

  That's why they currently appear twice: once rendered as bullet points in the page body, and again in the Footnotes tab. The fix is to strip those lines from the content before
  the markdown renderer sees them, leaving them only in the raw source where FootnotesPlugin can find them.

----

we need to update:
Title:         Editing a Page
Page Name:     Editing a Page
Slug:          editing-a-page
UUID:          51666223-22ef-4143-a34c-5902a3cf1ce0
Version:       v1 of 1
URL:           <http://jminim4:3000/view/Editing%20a%20Page#>
Created:       4/21/2026, 7:55:53 AM
Last Modified: 4/20/2026, 4:21:33 PM
Last Accessed: 4/21/2026, 8:17:53 AM
Author:        system
Editor:        system
Category:      documentation

adding links to appropriate pages including those done from teh "/docs" Skill

On page
Title:         Mandatory spending
Page Name:     Mandatory spending
Slug:          mandatory-spending
UUID:          2aac8441-ce5e-4733-b430-f3568cddeb64
Version:       v2 of 2
URL:           <http://jminim4:3000/view/Mandatory%20spending#>
Created:       2/11/2026, 7:34:17 AM
Last Modified: 4/21/2026, 8:08:43 AM
Last Accessed: 4/21/2026, 8:08:44 AM
Author:        jim
Editor:        jim
Category:      general
User Keywords: united states federal budget

* [^1] <https://www.cbo.gov/publication/most-recent/graphics>
* [^2] <https://www.brookings.edu/articles/what-is-discretionary-spending-in-the-federal-budget/>
* [^3] <https://taxpolicycenter.org/briefing-book/what-mandatory-and-discretionary-spending>
* [^4] <https://www.nationalpriorities.org/budget-basics/federal-budget-101/spending/>
* [^5] <https://www.pgpf.org/finding-solutions/understanding-the-budget/spending>
* [^6] <http://webhome.auburn.edu/~johnspm/gloss/entitlement_program.phtml>
* [^7] <https://www.everythingpolicy.org/policy-briefs/entitlements-what-you-need-to-know>
* [^8] <https://www.brookings.edu/articles/how-does-medicare-work-and-how-is-it-financed/>

Can we migrate these (By Migrate MOVE to footer tab not just copy

Title:         Certificate Transparency
Page Name:     Certificate Transparency
Slug:          certificate-transparency
UUID:          883dd5f4-2d4e-4f56-9306-4aaa734572af
Version:       v1 of 1
URL:           <http://jminim4:3000/view/Certificate%20Transparency#>
Created:       2/11/2026, 8:15:22 AM
Last Modified: 2/24/2026, 12:15:34 PM
Last Accessed: 4/21/2026, 7:41:34 AM
Editor:        unknown
Category:      general

The footnote tabe is not a link

[Certificate Transparency](https://www.certificate-transparency.org/what-is-ct|target='_blank') - based on information obtained 2013-04-10
Should be
[Certificate Transparency|https://www.certificate-transparency.org/what-is-ct|target='_blank'] - based on information obtained 2013-04-10

Are there more like that?

Now we need to find any pages with

```
## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
```

or

```
----
* [^1] - [ ... ] - based on information obtained 2026-04-21
```

Type entries and move to the appropiate tabs.

Create a GH Issue and proceed.

I though footnotes for Markdown should be [^#]?? - Did we loose the contents thouhgh?

Coments header is gone.

"Referrig Pages" are back.

On Page
Title:         Monitoring
Page Name:     Monitoring
Slug:          monitoring
UUID:          d9c956cb-7092-4cbe-bfc1-2fb350fbbfdd
Version:       v3 of 3
URL:           <http://jminim4:3000/view/Monitoring#>
Created:       2/11/2026, 8:35:01 AM
Last Modified: 4/21/2026, 4:15:45 AM
Last Accessed: 4/21/2026, 7:05:08 AM
Author:        jim
Editor:        jim
Category:      general

we have:
Application Performance Management has alink of
  wikipedia:Application_performance_management/

It should be more like:

* [^1] - [wpplication Performance Management|Wikipedia:Application_performance_management/|target='_blank'] - based on information obtained 2026-04-21

The "Wikipedia:" is case sensitve as it is handled by InterWikiLinkHandler

Can we also find noraml external links in the markdown body like

```
[washingtonpost](https://www.washingtonpost.com)
```

Substitue [^#] And add them to footnotes?
