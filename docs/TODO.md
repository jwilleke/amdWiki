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

**Last Updated**: 2026-01-27

## 🎯 NEXT STEPS - High Priority

We were working on GH Issue [#219](https://github.com/jwilleke/amdWiki/issues/219) as shown in docs/project_log.md.
Need to do Verification process:

- Start fresh Docker container with HEADLESS_INSTALL=true  
  - Verify no redirect to /install
  - Verify Welcome page loads immediately  
  - Login as admin/admin123
  - Verify app functions normally
  - Test with pre-mounted config file
  - Test K8s deployment with ConfigMap
