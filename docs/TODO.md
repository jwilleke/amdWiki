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

## ✅ COMPLETED - Issue #219 Headless Installation

GH Issue [#219](https://github.com/jwilleke/amdWiki/issues/219) - **FULLY VERIFIED**

All verification tests completed 2026-01-27:

### Docker Tests

- [x] Fresh Docker container with `HEADLESS_INSTALL=true` - works
- [x] No redirect to `/install` - verified (redirects to `/wiki/Welcome`)
- [x] Welcome page loads immediately - verified
- [x] Login as `admin`/`admin123` - works
- [x] Admin dashboard accessible - verified
- [x] `.install-complete` marker created with `headless: true` flag
- [x] 68 pages copied to `data/pages/`
- [x] Config copied to `data/config/app-custom-config.json`
- [x] Env var overrides (`AMDWIKI_APP_NAME`) - works
- [x] Idempotency (restart doesn't re-run install) - works
- [x] Pre-mounted config file - works (respects existing config)

### Kubernetes Tests

- [x] ConfigMap with `HEADLESS_INSTALL=true` - works
- [x] Custom app name from ConfigMap - works ("K8s Headless Test Wiki")
- [x] Pages and configs copied - works (68 pages, 1 config)

Test image: `ghcr.io/jwilleke/amdwiki:headless-test`

## 🎯 NEXT STEPS - High Priority

- Close issue #219
- Merge headless install feature to main branch
- Update `ghcr.io/jwilleke/amdwiki:latest` with headless feature
