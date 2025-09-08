---
title: Extended Link Test
category: System/Admin
user-keywords: [test, links, extended, target]
uuid: d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy
lastModified: '2025-09-07T11:40:00.000Z'
---

# Extended Link Syntax Test

This page tests the extended pipe syntax for wiki links with additional parameters.

## Basic Pipe Syntax (still works)
* [Simple Link|Plugin Test] - Basic pipe syntax
* [Search the Wiki|Search] - Search functionality

## Extended Syntax with target='_blank'
* [Rub' al Khali|https://squarekufic.com/2022/04/15/saudi-ia-sands/|target='_blank'] - Opens in new tab
* [Google Search|https://www.google.com|target='_blank'] - Another new tab link
* [GitHub|https://github.com|target='_blank'] - GitHub in new tab

## Extended Syntax with Other Attributes
* [Tooltip Link|https://example.com|title='This is a tooltip'|target='_blank'] - Link with tooltip and new tab
* [Custom Class|https://example.com|class='custom-link'|target='_blank'] - Link with custom CSS class

## Internal Links with Parameters
* [Admin Dashboard|/admin|target='_blank'] - Admin in new tab
* [User Info|/user-info|title='Debug information'] - Internal link with tooltip

## Wiki Pages with Parameters
* [Plugin Documentation|Plugin Test|title='View plugin documentation'] - Wiki page with tooltip
* [Create New Page|Non Existent Page|target='_blank'] - Red link that opens in new tab

## Mixed Examples
Here are various link types:
- Regular: [Welcome]
- Basic pipe: [Home|Welcome]  
- External new tab: [Documentation|https://docs.example.com|target='_blank']
- With tooltip: [Help|https://help.example.com|title='Get help here'|target='_blank']

This demonstrates JSPWiki-style extended pipe syntax for maximum link flexibility.
