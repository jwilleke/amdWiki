[**amdWiki API v1.5.0**](../../README.md)

***

[amdWiki API](../../README.md) / [logger](../README.md) / LoggerConfig

# Interface: LoggerConfig

Defined in: [src/utils/logger.ts:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/logger.ts#L21)

Logger configuration options

## Properties

### dir?

> `optional` **dir**: `string`

Defined in: [src/utils/logger.ts:25](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/logger.ts#L25)

Log directory path

***

### level?

> `optional` **level**: `string`

Defined in: [src/utils/logger.ts:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/logger.ts#L23)

Log level (error, warn, info, debug)

***

### maxFiles?

> `optional` **maxFiles**: `number`

Defined in: [src/utils/logger.ts:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/logger.ts#L29)

Max number of rotated log files

***

### maxSize?

> `optional` **maxSize**: `string` \| `number`

Defined in: [src/utils/logger.ts:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/logger.ts#L27)

Max log file size in bytes or string format (e.g., '1MB')
