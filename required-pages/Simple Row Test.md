---
uuid: simple-row-test-001
categories: [System, Documentation, Test]
user-keywords: [jspwiki, tables, testing]
title: Simple Row Test
lastModified: '2025-09-08T15:35:00.000Z'
---
# Simple Row Test

Test the %%table-striped syntax:

%%table-striped
|| Name || Age || City ||
| Alice | 25 | New York |
| Bob | 30 | Chicago |
| Charlie | 35 | Los Angeles |
| Diana | 28 | Seattle |
/%

Test basic [{Table}] syntax:

[{Table evenRowStyle:'background: lightblue;'}]
|| Product || Price ||
| Item A | $10 |
| Item B | $20 |
| Item C | $15 |

Test row numbering:

[{Table}]
||# || Task ||
|# | First task |
|# | Second task |
|# | Third task |
