[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/NodeCacheAdapter](../README.md) / NodeCacheAdapterOptions

# Interface: NodeCacheAdapterOptions

Defined in: [src/cache/NodeCacheAdapter.ts:8](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L8)

NodeCacheAdapter configuration options

## Indexable

\[`key`: `string`\]: `unknown`

Additional node-cache options

## Properties

### checkperiod?

> `optional` **checkperiod**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:12](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L12)

Check period for expired keys in seconds (default: 120)

***

### deleteOnExpire?

> `optional` **deleteOnExpire**: `boolean`

Defined in: [src/cache/NodeCacheAdapter.ts:16](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L16)

Delete keys on expiration (default: true)

***

### maxKeys?

> `optional` **maxKeys**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:18](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L18)

Maximum number of keys (default: 1000)

***

### stdTTL?

> `optional` **stdTTL**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:10](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L10)

Standard TTL in seconds (default: 300)

***

### useClones?

> `optional` **useClones**: `boolean`

Defined in: [src/cache/NodeCacheAdapter.ts:14](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L14)

Whether to clone objects (default: true)
