---
title: Pipe Link Test
category: System/Admin
user-keywords: [test, links, pipe]
categories: [System, Documentation]
uuid: b1c2d3e4-f5g6-7890-hijk-lmnopqrstuvw
lastModified: '2025-09-07T11:30:00.000Z'
---

# Pipe Link Test Page

This page tests the pipe syntax for wiki links with custom display text.

## Simple Wiki Links (existing functionality)
* [Plugin Test] - Simple link to existing page
* [Non Existent Page] - Simple red link to non-existent page

## Pipe Syntax for Wiki Pages
* [Go to Plugin Test|Plugin Test] - Custom display text linking to existing page
* [Create New Page|Non Existent Page] - Custom display text linking to non-existent page

## Pipe Syntax for Special Pages
* [Find Pages|Search] - Link to search functionality
* [Search the Wiki|Search] - Another search link with different display text

## Pipe Syntax for External URLs
* [Visit Google|https://www.google.com] - External link with custom text
* [GitHub Repository|https://github.com] - Another external link

## Pipe Syntax for Internal Paths
* [Admin Dashboard|/admin] - Link to admin area
* [User Info|/user-info] - Link to user debug page

## Mixed Examples
Here's some text with various link types:
- Regular wiki link: [Welcome]
- Custom wiki link: [Home Page|Welcome] 
- Search link: [Find|Search]
- External link: [Documentation|https://docs.example.com]
- Non-existent page: [Create Tutorial|Tutorial Page]

This demonstrates JSPWiki-style pipe syntax for flexible link creation.
