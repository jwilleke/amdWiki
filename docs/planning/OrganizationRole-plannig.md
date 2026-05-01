# Plan: OrganizationRole — Person↔Organization relationship model

## Context

ngdpbase has two concepts that share the word "role" and have been conflated:

- **Permission-role** — already exists, working. Defined in `config/app-default-config.json` (`admin`, `editor`, `reader`, `occupant`, etc.); driven by `User.roles: string[]`; consumed by `ACLManager` for permission checks. **Out of scope for this plan.**
- **Person↔Organization role-records** — do not exist yet. Model the *enduring* relationships between a [Person](https://schema.org/Person) and an [Organization](https://schema.org/Organization): employment, membership, board position, unit-ownership, etc. Membership/relationship semantics, not permission semantics.

A user can simultaneously be an `admin` (permission-role) AND a `Treasurer` (role-record on a board) AND a `Unit Owner` (role-record on a condo association). None of these constrain the others.

Three open/historical sources were trying to address this together; this plan unifies them and keeps the permission system untouched:

- **#154 (Schema.org with RBAC)** — conflated permission-role and role-records. Will be **closed as superseded by #602**.
- **#602 (person-contacts addon)** — already filed today; will be **updated** to be the canonical entry point, with the data-model below.
- **`docs/planning/Persons and relationships.md`** — pre-existing exploration; correct directionally. Its "Policy Overlay" / per-attribute access-control content belongs to a future permission-role concern, not here.

The permission-role nit (`ngdpbase.auth.google-oidc.default-roles: ["occupant"]` is a misnomer) is **out of scope** — track separately if desired.

## What schema.org actually does — and the corrected model

Schema.org doesn't model every Person↔Organization link the same way. Two distinct families:

### Enduring role-records (live on the Person side)

| Use case | Schema.org type | How it's hung off the Person |
|---|---|---|
| Employment | [EmployeeRole](https://schema.org/EmployeeRole) (with [worksFor](https://schema.org/worksFor)) | [Person.hasOccupation](https://schema.org/hasOccupation) |
| Membership / loyalty / club | [ProgramMembership](https://schema.org/ProgramMembership) (with [hostingOrganization](https://schema.org/hostingOrganization)) | [Person.memberOf](https://schema.org/memberOf) |
| Board position / unit-owner / generic affiliation | [OrganizationRole](https://schema.org/OrganizationRole) | [Person.memberOf](https://schema.org/memberOf) or [Person.affiliation](https://schema.org/affiliation) |

These are real entities with `identifier`, `startDate`, `endDate`, `status`. They're what this plan stores.

### Transaction-derived references (live on the transaction, NOT in person-contacts)

| Use case | Where schema.org puts it |
|---|---|
| Customer | On the [Invoice](https://schema.org/Invoice) ([Invoice.customer](https://schema.org/customer)) and on the [Order](https://schema.org/Order) ([Order.customer](https://schema.org/customer)) — just a [Person](https://schema.org/Person) reference, no role-record |
| Vendor / supplier / seller | On the [Order](https://schema.org/Order) ([Order.seller](https://schema.org/seller)), the [Invoice](https://schema.org/Invoice) ([Invoice.broker](https://schema.org/broker)), or accounting bill records — just a [Person](https://schema.org/Person)/[Organization](https://schema.org/Organization) reference |

"Who are our customers?" is answered by `SELECT DISTINCT customer FROM invoices` in the accounting addon (#486). Same for vendors via bills. No role-records needed.

**This is the corrected model.** The earlier draft of this plan invented a `relationshipType` discriminator to lump customer and vendor in with employment and membership. That was wrong: they don't belong in the same store because schema.org doesn't model them as enduring relationships.

## Decisions (locked)

1. **Layered architecture.** Core ngdpbase owns canonical [Person](https://schema.org/Person) and [Organization](https://schema.org/Organization) records (delivered by #617 — `PersonManager` + `OrganizationManager`, file-per-record under `ngdpbase.application.{persons,organization}.storagedir`). Person-contacts addon owns the role-records on top. Disabling the addon removes addon-created records but leaves Person/Organization untouched. The disable cascade in `AddonsManager.canDisable()` (#617) blocks disabling person-contacts while accounting (or any other dependent) is enabled.
2. **Three role-record families, named for their schema.org `@type`:** [EmployeeRole](https://schema.org/EmployeeRole), [ProgramMembership](https://schema.org/ProgramMembership), [OrganizationRole](https://schema.org/OrganizationRole). The storage `@type` IS the schema.org type — no invented discriminator.
3. **Customer and vendor are not role-records.** They emerge from accounting (#486) transactions ([Invoice.customer](https://schema.org/customer), [Order.seller](https://schema.org/seller), bill suppliers). Person-contacts has nothing to say about them.
4. **Physical-thing ownership uses [OwnershipInfo](https://schema.org/OwnershipInfo).** Lives in the units module (e.g., `data/fairways/units.json`), NOT in person-contacts. Carries [owner](https://schema.org/owner) → Person, [typeOfGood](https://schema.org/typeOfGood) → Unit, [ownedFrom](https://schema.org/ownedFrom)/[ownedThrough](https://schema.org/ownedThrough), and [additionalProperty](https://schema.org/additionalProperty) → [PropertyValue](https://schema.org/PropertyValue) for ownership percentage.
5. **HOA-style "unit-owner" membership is derived, not stored.** When the system emits an [Organization](https://schema.org/Organization)'s JSON-LD, it walks active [OwnershipInfo](https://schema.org/OwnershipInfo) records and emits a member [OrganizationRole](https://schema.org/OrganizationRole) (`roleName: "unit-owner"`) for each owner. **No persisted record duplicates this fact.** Special positions (Treasurer, Secretary, etc.) DO get their own persisted [OrganizationRole](https://schema.org/OrganizationRole) records.
6. **One unified collection, discriminated by `@type`.** All role-records live in a single store; each row's `@type` ∈ {`EmployeeRole`, `ProgramMembership`, `OrganizationRole`} drives both query branches and JSON-LD emission. Storage shape = JSON-LD shape (no mapping table).
7. **Close #154** as superseded; #602 is the entry point.
8. **Permission-roles unchanged.** `User.roles[]` stays. ACLManager stays. Org-scoped permission checks are a **follow-up** issue, not this work.

### Bootstrap at install time (when the addon is enabled)

The addon seeds exactly one record:

- One [OrganizationRole](https://schema.org/OrganizationRole) record tying the admin Person ↔ the base Organization (`roleName: "Administrator"`). The base Organization is sourced from `ngdpbase.application.organization.*` config (#617 renamed these from `ngdpbase.install.organization.*`; written at install time and now read by `OrganizationManager`). The admin Person is sourced from the core Person record managed by `PersonManager` (#617).

When the addon is disabled, that record is removed under the cascade rule below.

### Addon-disable cascade

person-contacts records are owned by the addon and removed when the addon is disabled — with two safeguards:

- **Operator confirmation.** Disable shows a count of records that will be removed and requires explicit confirmation.
- **Dependency check via AddonsManager.** AddonsManager already supports `dependencies: string[]` with topological-sort load order (`src/managers/AddonsManager.ts:41,554-565`). Extend its disable path: if any *enabled* addon (e.g., accounting #486) declares `dependencies: ['person-contacts']`, disable is blocked with a clear error naming the dependent addon. Disable that one first.

### Concrete shape of the unified collection

The provider stores role-records in a single file (or collection): `data/person-contacts/role-records.json`. Each entry is a self-contained JSON-LD object with the fields specified in the per-type schemas below. Reading "all of Jane's roles" is one filter on `person.@id`; reading "all formal positions in fairways-condos" is one filter on `memberOf.@id` (or `hostingOrganization.@id` for [ProgramMembership](https://schema.org/ProgramMembership)). The JSON-LD export folds matched records under [hasOccupation](https://schema.org/hasOccupation) / [memberOf](https://schema.org/memberOf) on the Person at emit time.

## Data model

### Person record

Stored in `addons/person-contacts/` (provider-controlled location). Canonical fields:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "urn:uuid:<uuid>",
  "identifier": "<username>",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "address": { "@type": "PostalAddress", ... },
  "contactPoint": [...],
  "knowsLanguage": [...]
}
```

`identifier` matches `User.username` so existing auth records link cleanly.

**No embedded role-records.** Roles live in their own family records (or as nested arrays, depending on storage shape) and are folded into the Person's [hasOccupation](https://schema.org/hasOccupation) / [memberOf](https://schema.org/memberOf) / [affiliation](https://schema.org/affiliation) at JSON-LD export time.

### Organization record

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://fairways.example.com/",
  "name": "The Fairways",
  "legalName": "The Fairways Condominium Association",
  "url": "https://fairways.example.com/",
  "address": { "@type": "PostalAddress", ... },
  "contactPoint": [...]
}
```

`@id` is the organization's canonical URL (Schema.org-native), not a synthetic urn. The install's anchor org is identified via the existing `ngdpbase.application.organization.*` config keys (renamed from `ngdpbase.install.organization.*` in #617) plus the new key `ngdpbase.application.organization.file` — the filename under `ngdpbase.application.organization.storagedir` that holds the anchor org. `OrganizationManager` (core) owns reads/writes; multi-org is supported by additional files in the same directory.

### EmployeeRole record

```json
{
  "@context": "https://schema.org",
  "@type": "EmployeeRole",
  "@id": "urn:role:<uuid>",
  "identifier": "EMP-001",
  "roleName": "Senior Analyst",
  "startDate": "2024-01-01",
  "endDate": null,
  "status": "active",
  "person":   { "@id": "urn:uuid:<person-uuid>" },
  "worksFor": { "@id": "urn:org:<identifier>" }
}
```

Native [EmployeeRole](https://schema.org/EmployeeRole) carries `baseSalary`, `salaryCurrency`, etc. as needed.

### ProgramMembership record

```json
{
  "@context": "https://schema.org",
  "@type": "ProgramMembership",
  "@id": "urn:role:<uuid>",
  "identifier": "MEM-777",
  "membershipNumber": "MEM-777",
  "startDate": "2024-01-01",
  "status": "active",
  "member":              { "@id": "urn:uuid:<person-uuid>" },
  "hostingOrganization": { "@id": "urn:org:<identifier>" }
}
```

### OrganizationRole record (board, unit-owner, affiliate)

```json
{
  "@context": "https://schema.org",
  "@type": "OrganizationRole",
  "@id": "urn:role:<uuid>",
  "identifier": "or-2024-jane-fairways-treasurer",
  "roleName": "Treasurer",
  "startDate": "2024-01-01",
  "endDate":   "2026-12-31",
  "status":    "active",
  "person":   { "@id": "urn:uuid:<person-uuid>" },
  "memberOf": { "@id": "https://fairways.example.com/" },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "unitId", "value": "4B" },
    { "@type": "PropertyValue", "name": "percentageInterest", "value": 1.85 }
  ]
}
```

Use `roleName` to distinguish "Treasurer" from "Unit Owner" from "Board Member" within the [OrganizationRole](https://schema.org/OrganizationRole) family. Use `additionalProperty` for type-specific extras (unit ID, percentage interest, etc.).

## Schema.org JSON-LD export

Already trivial: each role-record's storage `@type` is its export `@type`. Folding into a Person's JSON-LD:

- All [EmployeeRole](https://schema.org/EmployeeRole) records where `person.@id` matches → emit under [Person.hasOccupation](https://schema.org/hasOccupation).
- All [ProgramMembership](https://schema.org/ProgramMembership) records → emit under [Person.memberOf](https://schema.org/memberOf).
- All [OrganizationRole](https://schema.org/OrganizationRole) records → emit under [Person.memberOf](https://schema.org/memberOf) or [Person.affiliation](https://schema.org/affiliation) (configurable; default `memberOf`).

No mapping table needed. No invented discriminator.

## Critical files

**New (the #602 implementation):**

- `addons/person-contacts/index.ts` — `AddonModule` entry point.
- `addons/person-contacts/managers/PersonContactsManager.ts` — extends `BaseManager`. Public API: CRUD on Person/Organization/each role-record family, `exportPersonJsonLd(personId)`.
- `addons/person-contacts/providers/BasePersonContactsProvider.ts` — interface (storage seam).
- `addons/person-contacts/providers/FilePersonContactsProvider.ts` — JSON files in the configured data dir; v1 default.
- `addons/person-contacts/types/{Person,Organization,EmployeeRole,ProgramMembership,OrganizationRole}.ts` — TS types matching the schema.org shapes above.
- `addons/person-contacts/utils/jsonLdExport.ts` — assembles a Person's JSON-LD by folding in their role-records.
- `addons/person-contacts/routes.js` — read endpoints (e.g., `GET /api/persons/:identifier`, `GET /api/organizations/:identifier/members`, JSON-LD export).
- `addons/person-contacts/__tests__/*.test.ts` — unit + integration coverage for storage, queries, and export.
- `addons/person-contacts/seed/install-org-membership.json` — bootstraps a [ProgramMembership](https://schema.org/ProgramMembership) for the install user (so the install isn't empty).

**Modified:**

- `config/app-default-config.json` — install-anchor keys `ngdpbase.install.organization.path`, `ngdpbase.install.organization.identifier`. Plus the addon's own config block (`ngdpbase.addons.person-contacts.*`).
- `addons/README.md` — register `person-contacts` in the addon roster.

**Explicitly NOT modified in this plan:**

- `src/managers/UserManager.ts` — UserManager-to-Person linkage at sync time is a follow-up issue.
- `src/managers/ACLManager.ts` — org-scoped permission checks are a follow-up issue.
- `src/types/User.ts` — `User.roles[]` stays as-is.
- The permission-role catalog in `config/app-default-config.json` — untouched.

## Verification

1. **Typecheck:** `npm run typecheck` clean.
2. **Unit:** Each storage method per role-record family; the JSON-LD export per family; the `endDate`/`status` lifecycle.
3. **Integration:** Enable the addon. Seed an admin Person + the install Organization + a [ProgramMembership](https://schema.org/ProgramMembership) for that admin. Query the Person, assert the JSON-LD output contains the membership under [memberOf](https://schema.org/memberOf) with `@type: ProgramMembership`. Query the Organization's members, assert it returns the Person.
4. **Manual:** Boot a Fairways instance with `ngdpbase.install.organization.identifier: fairways-condos`. Create a unit-owner [OrganizationRole](https://schema.org/OrganizationRole) for an existing user. Confirm the Person's JSON-LD output and the org's member-list both reflect it.
5. **Permission-role regression:** Existing ACL tests pass unchanged — proof that this work is orthogonal to the permission system.

## Follow-up actions (post-plan-mode)

These run after exit, in order. **The first item is the next thing to start work on** — #602 implementation waits for it.

1. **File new `[FEATURE] Core Person/Organization refactor`** ⬅ **NEXT WORK**. Refactors `users.json` to align with the [Person](https://schema.org/Person) model. Creates the base [Organization](https://schema.org/Organization) record at install time from `ngdpbase.install.organization.*` config (currently written but never read). Extends AddonsManager's disable path with the dependency-aware cascade rule. Mark #602 as `blocked-by` this issue. **This is the prerequisite for everything else below.**
2. **Update #602's body** to reflect this plan: layered architecture (this addon sits on top of the core Person/Organization layer), three role-record families typed for their schema.org `@type`, no invented discriminator, customer/vendor handled by accounting, [OwnershipInfo](https://schema.org/OwnershipInfo) handled by the units module, HOA-membership derived at emit time. Mark #602 as `blocked-by` the new sub-issue.
3. **Close #154** with a comment explaining the role-vs-OrganizationRole distinction, pointing at #602 as the OrganizationRole tracker, and noting the permission-role catalog (including the `occupant` rename) is a separate concern.
4. **File new `[FEATURE] UserManager → Person link at user sync`** — replaces today's hardcoded `'ngdpbase-platform'` Organization. Depends on the core refactor.
5. **File new `[FEATURE] ACLManager org-scoped permission checks`** — extend permission evaluation to ask "does this user hold an [OrganizationRole](https://schema.org/OrganizationRole) of `roleName='Treasurer'` in the install's anchor org?"; depends on person-contacts; unblocks #486's admin views.
6. **Optional: file `[CHORE] Rename`occupant`permission-role`** — the user's noted nit. Permission-role concern, not OrganizationRole.
