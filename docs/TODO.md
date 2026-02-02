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

## In Progress

- [#231](https://github.com/jwilleke/amdWiki/issues/231) — `server.sh stop` fails to stop server (PM2 respawn race). Fix implemented in `server.sh`: `kill_all_amdwiki()` now deletes all PM2 apps before killing node processes, `stop` has a retry loop, `unlock` explicitly deletes PM2 apps before killing the daemon. Docker/K8s unaffected (they don't use PM2).
