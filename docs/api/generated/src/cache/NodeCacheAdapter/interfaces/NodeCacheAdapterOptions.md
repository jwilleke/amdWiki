[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/NodeCacheAdapter](../README.md) / NodeCacheAdapterOptions

# Interface: NodeCacheAdapterOptions

Defined in: [src/cache/NodeCacheAdapter.ts:9](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L9)

NodeCacheAdapter configuration options

## Indexable

\[`key`: `string`\]: `unknown`

Additional node-cache options

## Properties

### checkperiod?

> `optional` **checkperiod**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:13](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L13)

Check period for expired keys in seconds (default: 120)

***

### deleteOnExpire?

> `optional` **deleteOnExpire**: `boolean`

Defined in: [src/cache/NodeCacheAdapter.ts:17](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L17)

Delete keys on expiration (default: true)

***

### maxKeys?

> `optional` **maxKeys**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:19](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L19)

Maximum number of keys (default: 1000)

***

### stdTTL?

> `optional` **stdTTL**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:11](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L11)

Standard TTL in seconds (default: 300)

***

### useClones?

> `optional` **useClones**: `boolean`

Defined in: [src/cache/NodeCacheAdapter.ts:15](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L15)

Whether to clone objects (default: true)
