[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionRetentionPolicy

# Interface: VersionRetentionPolicy

Defined in: [src/types/Version.ts:202](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L202)

Version retention policy

Configuration for version retention and cleanup.

## Properties

### checkpointInterval

> **checkpointInterval**: `number`

Defined in: [src/types/Version.ts:216](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L216)

Checkpoint interval for full snapshots

***

### keepBaseline

> **keepBaseline**: `boolean`

Defined in: [src/types/Version.ts:210](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L210)

Always keep version 1 (baseline)

***

### keepCheckpoints

> **keepCheckpoints**: `boolean`

Defined in: [src/types/Version.ts:219](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L219)

Keep all checkpoint versions

***

### keepCurrent

> **keepCurrent**: `boolean`

Defined in: [src/types/Version.ts:213](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L213)

Always keep current version

***

### maxVersions

> **maxVersions**: `number`

Defined in: [src/types/Version.ts:204](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L204)

Maximum number of versions to keep (0 = unlimited)

***

### retentionDays

> **retentionDays**: `number`

Defined in: [src/types/Version.ts:207](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L207)

Number of days to retain versions (0 = unlimited)
