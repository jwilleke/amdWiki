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

## [FEATURE] ADD-ON Request - Response System #494

Usere stories 

Mjor category for requests

- Maintenance
  - ANIMAL
  - DRIVEWAY
  - FIREPLACE
  - GUTTERS-DOWNSPOUT
  - LANDSCAPING
  - LIGHTING
  - MAILBOX
  - PAINTING
  - PETS
  - RAILING
  - ROOF
  - SIDING
  - SNOW-ICE
  - STEPS-WALKWAY
  - SURFACE WATER
  - TRASH
  - OTHER

- Clubhouse
  - Make Reservation
  - Cancel Reservation
  - List My Reservations
- Question
- BOARD REQUEST


ANIMAL
DRIVEWAY
FIREPLACE
GUTTERS-DOWNSPOUT
LANDSCAPING
LIGHTING
MAILBOX
PAINTING
PETS
RAILING
ROOF
SIDING
SNOW-ICE
STEPS-WALKWAY
SURFACE WATER
TRASH
UNIT OWNER - Maintenance
OTHER



  1. Test mocks don't fully implement WikiEngine (most common — ~20 files)
  Partial mock objects like { getManager: jest.Mock<...> } passed as WikiEngine. The WikiEngine type has grown over time and test mocks haven't kept up.

  ▎ e.g. PageManager.test.ts, RenderingManager.test.ts, UserManager.test.ts, etc.

  1. Test mocks missing properties on their own types (~10 files)
  Tests access properties on mock objects that aren't declared on the mock's type.

  ▎ e.g. AddonsManager.test.ts — enabled not on {}, AuthManager.test.ts — magicLinkEnabled not on {}, ImportManager.test.ts — formatId not on MockConverter

  1. Production code warnings (2 files)

- ConfigurationManager.ts:956 — TS2698: spread on a non-object type
- WikiRoutes.ts:925 — TS2352: possibly unsafe as cast from string to a record type
