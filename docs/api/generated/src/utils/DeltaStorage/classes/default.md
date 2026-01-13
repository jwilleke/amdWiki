[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/DeltaStorage](../README.md) / default

# Class: default

Defined in: [src/utils/DeltaStorage.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L37)

DeltaStorage - Utility for creating and applying content diffs

Uses the fast-diff library (Myers diff algorithm) to efficiently store
page versions as deltas. Version 1 stores full content, subsequent versions
store only the differences from the previous version.

fast-diff returns an array of tuples: [operation, text]
- operation: -1 (delete), 0 (equal), 1 (insert)
- text: the text content

## Example

```ts
const diff = DeltaStorage.createDiff("Hello world", "Hello amdWiki");
// Returns: [[0, "Hello "], [-1, "world"], [1, "amdWiki"]]

const reconstructed = DeltaStorage.applyDiff("Hello world", diff);
// Returns: "Hello amdWiki"
```

## Constructors

### Constructor

> **new default**(): `DeltaStorage`

#### Returns

`DeltaStorage`

## Methods

### applyDiff()

> `static` **applyDiff**(`baseContent`, `diff`): `string`

Defined in: [src/utils/DeltaStorage.ts:75](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L75)

Apply a diff to base content to reconstruct a version

Takes the base content and applies a diff array to reconstruct the target content.
Used to reconstruct versions from delta storage.

#### Parameters

##### baseContent

`string`

Base content to apply diff to

##### diff

[`DiffTuple`](../type-aliases/DiffTuple.md)[]

Diff array from fast-diff

#### Returns

`string`

Reconstructed content

#### Throws

If inputs are invalid

#### Example

```ts
const base = "Hello world";
const diff: DiffTuple[] = [[0, "Hello "], [-1, "world"], [1, "amdWiki"]];
const result = DeltaStorage.applyDiff(base, diff);
// Returns: "Hello amdWiki"
```

***

### applyDiffChain()

> `static` **applyDiffChain**(`v1Content`, `diffArray`): `string`

Defined in: [src/utils/DeltaStorage.ts:147](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L147)

Apply multiple diffs sequentially

Applies a chain of diffs to reconstruct a version from v1.
Used when retrieving versions > 2 in delta storage.

#### Parameters

##### v1Content

`string`

Version 1 (base) content

##### diffArray

[`DiffTuple`](../type-aliases/DiffTuple.md)[][]

Array of diffs to apply sequentially

#### Returns

`string`

Final reconstructed content

#### Throws

If any diff application fails

#### Example

```ts
const v1 = "Version 1";
const diffs: DiffTuple[][] = [
  [[0, "Version "], [-1, "1"], [1, "2"]],  // v1 → v2
  [[0, "Version "], [-1, "2"], [1, "3"]]   // v2 → v3
];
const v3 = DeltaStorage.applyDiffChain(v1, diffs);
// Returns: "Version 3"
```

***

### calculateHash()

> `static` **calculateHash**(`content`): `string`

Defined in: [src/utils/DeltaStorage.ts:181](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L181)

Calculate SHA-256 hash of content

Used for content integrity verification and deduplication.
Stored in version metadata for verification.

#### Parameters

##### content

`string`

Content to hash

#### Returns

`string`

SHA-256 hash in hexadecimal format

***

### createDiff()

> `static` **createDiff**(`oldContent`, `newContent`): [`DiffTuple`](../type-aliases/DiffTuple.md)[]

Defined in: [src/utils/DeltaStorage.ts:51](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L51)

Generate diff between old and new content

Creates a diff using the Myers algorithm (similar to git).
Returns an array of operations that transform oldContent into newContent.

#### Parameters

##### oldContent

`string`

Original content

##### newContent

`string`

New content

#### Returns

[`DiffTuple`](../type-aliases/DiffTuple.md)[]

Diff array from fast-diff

#### Example

```ts
const diff = DeltaStorage.createDiff("foo", "bar");
// Returns: [[-1, "foo"], [1, "bar"]]
```

***

### getDiffStats()

> `static` **getDiffStats**(`diff`): [`DiffStats`](../interfaces/DiffStats.md)

Defined in: [src/utils/DeltaStorage.ts:220](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L220)

Calculate diff statistics

Analyzes a diff to provide statistics about the changes.
Useful for UI display and analytics.

#### Parameters

##### diff

[`DiffTuple`](../type-aliases/DiffTuple.md)[]

Diff array from fast-diff

#### Returns

[`DiffStats`](../interfaces/DiffStats.md)

Statistics object

#### Example

```ts
const stats = DeltaStorage.getDiffStats(diff);
// Returns: { additions: 10, deletions: 5, unchanged: 100 }
```

***

### verifyHash()

> `static` **verifyHash**(`content`, `expectedHash`): `boolean`

Defined in: [src/utils/DeltaStorage.ts:199](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/DeltaStorage.ts#L199)

Verify content integrity using hash

Checks if the content hash matches the expected hash.
Used to detect corruption in version storage.

#### Parameters

##### content

`string`

Content to verify

##### expectedHash

`string`

Expected SHA-256 hash

#### Returns

`boolean`

True if hash matches, false otherwise
