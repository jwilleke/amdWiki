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
