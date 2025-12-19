[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PolicyValidator](../README.md) / export=

# Class: export=

Defined in: [src/managers/PolicyValidator.js:9](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L9)

PolicyValidator - Validates policy schemas and detects conflicts
Ensures policy integrity and prevents conflicting rules

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PolicyValidator`

Defined in: [src/managers/PolicyValidator.js:10](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L10)

#### Parameters

##### engine

`any`

#### Returns

`PolicyValidator`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### policyManager

> **policyManager**: `any`

Defined in: [src/managers/PolicyValidator.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L12)

***

### policySchema

> **policySchema**: `object`

Defined in: [src/managers/PolicyValidator.js:14](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L14)

#### properties

> **properties**: `object`

##### properties.actions

> **actions**: `object`

##### properties.actions.items

> **items**: `object`

##### properties.actions.items.enum

> **enum**: `string`[]

##### properties.actions.items.type

> **type**: `string` = `'string'`

##### properties.actions.minItems

> **minItems**: `number` = `1`

##### properties.actions.type

> **type**: `string` = `'array'`

##### properties.conditions

> **conditions**: `object`

##### properties.conditions.items

> **items**: `object`

##### properties.conditions.items.properties

> **properties**: `object`

##### properties.conditions.items.properties.endTime

> **endTime**: `object`

##### properties.conditions.items.properties.endTime.anyOf

> **anyOf**: (\{ `format`: `string`; `pattern?`: `undefined`; \} \| \{ `format?`: `undefined`; `pattern`: `string`; \})[]

##### properties.conditions.items.properties.endTime.type

> **type**: `string` = `'string'`

##### properties.conditions.items.properties.key

> **key**: `object`

##### properties.conditions.items.properties.key.type

> **type**: `string` = `'string'`

##### properties.conditions.items.properties.operator

> **operator**: `object`

##### properties.conditions.items.properties.operator.enum

> **enum**: `string`[]

##### properties.conditions.items.properties.operator.type

> **type**: `string` = `'string'`

##### properties.conditions.items.properties.ranges

> **ranges**: `object`

##### properties.conditions.items.properties.ranges.items

> **items**: `object`

##### properties.conditions.items.properties.ranges.items.type

> **type**: `string` = `'string'`

##### properties.conditions.items.properties.ranges.type

> **type**: `string` = `'array'`

##### properties.conditions.items.properties.startTime

> **startTime**: `object`

##### properties.conditions.items.properties.startTime.anyOf

> **anyOf**: (\{ `format`: `string`; `pattern?`: `undefined`; \} \| \{ `format?`: `undefined`; `pattern`: `string`; \})[]

##### properties.conditions.items.properties.startTime.type

> **type**: `string` = `'string'`

##### properties.conditions.items.properties.type

> **type**: `object`

##### properties.conditions.items.properties.type.enum

> **enum**: `string`[]

##### properties.conditions.items.properties.type.type

> **type**: `string` = `'string'`

##### properties.conditions.items.properties.value

> **value**: `object`

##### properties.conditions.items.properties.value.type

> **type**: `string`[]

##### properties.conditions.items.required

> **required**: `string`[]

##### properties.conditions.items.type

> **type**: `string` = `'object'`

##### properties.conditions.type

> **type**: `string` = `'array'`

##### properties.description

> **description**: `object`

##### properties.description.maxLength

> **maxLength**: `number` = `1000`

##### properties.description.type

> **type**: `string` = `'string'`

##### properties.effect

> **effect**: `object`

##### properties.effect.enum

> **enum**: `string`[]

##### properties.effect.type

> **type**: `string` = `'string'`

##### properties.id

> **id**: `object`

##### properties.id.maxLength

> **maxLength**: `number` = `100`

##### properties.id.minLength

> **minLength**: `number` = `1`

##### properties.id.pattern

> **pattern**: `string` = `'^[a-zA-Z0-9_-]+$'`

##### properties.id.type

> **type**: `string` = `'string'`

##### properties.metadata

> **metadata**: `object`

##### properties.metadata.properties

> **properties**: `object`

##### properties.metadata.properties.author

> **author**: `object`

##### properties.metadata.properties.author.type

> **type**: `string` = `'string'`

##### properties.metadata.properties.created

> **created**: `object`

##### properties.metadata.properties.created.format

> **format**: `string` = `'date-time'`

##### properties.metadata.properties.created.type

> **type**: `string` = `'string'`

##### properties.metadata.properties.modified

> **modified**: `object`

##### properties.metadata.properties.modified.format

> **format**: `string` = `'date-time'`

##### properties.metadata.properties.modified.type

> **type**: `string` = `'string'`

##### properties.metadata.properties.tags

> **tags**: `object`

##### properties.metadata.properties.tags.items

> **items**: `object`

##### properties.metadata.properties.tags.items.type

> **type**: `string` = `'string'`

##### properties.metadata.properties.tags.type

> **type**: `string` = `'array'`

##### properties.metadata.properties.version

> **version**: `object`

##### properties.metadata.properties.version.type

> **type**: `string` = `'string'`

##### properties.metadata.type

> **type**: `string` = `'object'`

##### properties.name

> **name**: `object`

##### properties.name.maxLength

> **maxLength**: `number` = `200`

##### properties.name.minLength

> **minLength**: `number` = `1`

##### properties.name.type

> **type**: `string` = `'string'`

##### properties.priority

> **priority**: `object`

##### properties.priority.default

> **default**: `number` = `50`

##### properties.priority.maximum

> **maximum**: `number` = `1000`

##### properties.priority.minimum

> **minimum**: `number` = `0`

##### properties.priority.type

> **type**: `string` = `'number'`

##### properties.resources

> **resources**: `object`

##### properties.resources.items

> **items**: `object`

##### properties.resources.items.oneOf

> **oneOf**: `object`[]

##### properties.resources.items.properties

> **properties**: `object`

##### properties.resources.items.properties.pattern

> **pattern**: `object`

##### properties.resources.items.properties.pattern.type

> **type**: `string` = `'string'`

##### properties.resources.items.properties.type

> **type**: `object`

##### properties.resources.items.properties.type.enum

> **enum**: `string`[]

##### properties.resources.items.properties.type.type

> **type**: `string` = `'string'`

##### properties.resources.items.properties.value

> **value**: `object`

##### properties.resources.items.properties.value.type

> **type**: `string`[]

##### properties.resources.items.required

> **required**: `string`[]

##### properties.resources.items.type

> **type**: `string` = `'object'`

##### properties.resources.minItems

> **minItems**: `number` = `1`

##### properties.resources.type

> **type**: `string` = `'array'`

##### properties.subjects

> **subjects**: `object`

##### properties.subjects.items

> **items**: `object`

##### properties.subjects.items.oneOf

> **oneOf**: `object`[]

##### properties.subjects.items.properties

> **properties**: `object`

##### properties.subjects.items.properties.key

> **key**: `object`

##### properties.subjects.items.properties.key.type

> **type**: `string` = `'string'`

##### properties.subjects.items.properties.type

> **type**: `object`

##### properties.subjects.items.properties.type.enum

> **enum**: `string`[]

##### properties.subjects.items.properties.type.type

> **type**: `string` = `'string'`

##### properties.subjects.items.properties.value

> **value**: `object`

##### properties.subjects.items.properties.value.type

> **type**: `string`[]

##### properties.subjects.items.required

> **required**: `string`[]

##### properties.subjects.items.type

> **type**: `string` = `'object'`

##### properties.subjects.minItems

> **minItems**: `number` = `1`

##### properties.subjects.type

> **type**: `string` = `'array'`

#### required

> **required**: `string`[]

#### type

> **type**: `string` = `'object'`

***

### schemaValidator

> **schemaValidator**: `any`

Defined in: [src/managers/PolicyValidator.js:13](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L13)

***

### schemaValidatorCompiled

> **schemaValidatorCompiled**: `any`

Defined in: [src/managers/PolicyValidator.js:186](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L186)

***

### validationCache

> **validationCache**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PolicyValidator.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L15)

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/BaseManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L130)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<`any`\>

Backup data object containing all manager state

#### Async

#### Throws

If backup operation fails

#### Example

```ts
async backup() {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### clearCache()

> **clearCache**(): `void`

Defined in: [src/managers/PolicyValidator.js:648](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L648)

Clear validation cache

#### Returns

`void`

***

### detectPolicyConflicts()

> **detectPolicyConflicts**(`policies`): `object`

Defined in: [src/managers/PolicyValidator.js:431](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L431)

Detect conflicting policies

#### Parameters

##### policies

`any`

#### Returns

`object`

##### errors

> **errors**: `any`[]

##### warnings

> **warnings**: `any`[]

***

### formatSchemaErrors()

> **formatSchemaErrors**(`schemaErrors`): `any`

Defined in: [src/managers/PolicyValidator.js:233](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L233)

Format JSON schema validation errors

#### Parameters

##### schemaErrors

`any`

#### Returns

`any`

***

### generateWarnings()

> **generateWarnings**(`policy`): `object`[]

Defined in: [src/managers/PolicyValidator.js:347](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L347)

Generate warnings for potential issues

#### Parameters

##### policy

`any`

#### Returns

`object`[]

***

### getEngine()

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### getStatistics()

> **getStatistics**(): `object`

Defined in: [src/managers/PolicyValidator.js:655](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L655)

Get validation statistics

#### Returns

`object`

##### cacheSize

> **cacheSize**: `number`

##### schemaLoaded

> **schemaLoaded**: `boolean`

##### validatorReady

> **validatorReady**: `boolean`

***

### groupPoliciesByOverlap()

> **groupPoliciesByOverlap**(`policies`): `any`[]

Defined in: [src/managers/PolicyValidator.js:482](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L482)

Group policies by overlapping criteria

#### Parameters

##### policies

`any`

#### Returns

`any`[]

***

### hasActionOverlap()

> **hasActionOverlap**(`actions1`, `actions2`): `any`

Defined in: [src/managers/PolicyValidator.js:554](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L554)

Check if action criteria overlap

#### Parameters

##### actions1

`any`

##### actions2

`any`

#### Returns

`any`

***

### hasResourceOverlap()

> **hasResourceOverlap**(`resources1`, `resources2`): `boolean`

Defined in: [src/managers/PolicyValidator.js:540](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L540)

Check if resource criteria overlap

#### Parameters

##### resources1

`any`

##### resources2

`any`

#### Returns

`boolean`

***

### hasSubjectOverlap()

> **hasSubjectOverlap**(`subjects1`, `subjects2`): `boolean`

Defined in: [src/managers/PolicyValidator.js:526](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L526)

Check if subject criteria overlap

#### Parameters

##### subjects1

`any`

##### subjects2

`any`

#### Returns

`boolean`

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/managers/PolicyValidator.js:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L18)

Initialize the manager with configuration

Override this method in subclasses to perform initialization logic.
Always call super.initialize() first in overridden implementations.

#### Parameters

##### config

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async initialize(config = {}) {
  await super.initialize(config);
  // Your initialization logic here
  console.log('MyManager initialized');
}
```

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### loadPolicySchema()

> **loadPolicySchema**(): `Promise`\<`void`\>

Defined in: [src/managers/PolicyValidator.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L44)

Load JSON schema for policy validation

#### Returns

`Promise`\<`void`\>

***

### patternsOverlap()

> **patternsOverlap**(`pattern1`, `pattern2`): `any`

Defined in: [src/managers/PolicyValidator.js:603](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L603)

Check if two patterns overlap

#### Parameters

##### pattern1

`any`

##### pattern2

`any`

#### Returns

`any`

***

### policiesOverlap()

> **policiesOverlap**(`policy1`, `policy2`): `boolean`

Defined in: [src/managers/PolicyValidator.js:507](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L507)

Check if two policies have overlapping criteria

#### Parameters

##### policy1

`any`

##### policy2

`any`

#### Returns

`boolean`

***

### resourcesMatch()

> **resourcesMatch**(`r1`, `r2`): `any`

Defined in: [src/managers/PolicyValidator.js:583](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L583)

Check if two resources match

#### Parameters

##### r1

`any`

##### r2

`any`

#### Returns

`any`

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L163)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

Backup data object from backup() method

###### data

`any`

Manager-specific backup data

###### managerName

`string`

Name of the manager

###### timestamp

`string`

ISO timestamp of backup

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L101)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async shutdown() {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)

***

### subjectsMatch()

> **subjectsMatch**(`s1`, `s2`): `boolean`

Defined in: [src/managers/PolicyValidator.js:561](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L561)

Check if two subjects match

#### Parameters

##### s1

`any`

##### s2

`any`

#### Returns

`boolean`

***

### validateAllPolicies()

> **validateAllPolicies**(`policies`): `object`

Defined in: [src/managers/PolicyValidator.js:390](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L390)

Validate all policies for conflicts

#### Parameters

##### policies

`any` = `null`

#### Returns

`object`

##### errors

> **errors**: `any`[]

##### isValid

> **isValid**: `boolean`

##### summary

> **summary**: `object`

###### summary.conflicts

> **conflicts**: `number` = `conflicts.errors.length`

###### summary.totalPolicies

> **totalPolicies**: `any` = `policies.length`

###### summary.validPolicies

> **validPolicies**: `number`

##### warnings

> **warnings**: `any`[]

***

### validateAndSavePolicy()

> **validateAndSavePolicy**(`policy`): `Promise`\<\{ `conflicts`: `any`[]; `policy`: `any`; `success`: `boolean`; `validation`: `any`; \}\>

Defined in: [src/managers/PolicyValidator.js:616](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L616)

Validate policy before saving

#### Parameters

##### policy

`any`

#### Returns

`Promise`\<\{ `conflicts`: `any`[]; `policy`: `any`; `success`: `boolean`; `validation`: `any`; \}\>

***

### validateBusinessLogic()

> **validateBusinessLogic**(`policy`): `object`[]

Defined in: [src/managers/PolicyValidator.js:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L245)

Validate business logic rules

#### Parameters

##### policy

`any`

#### Returns

`object`[]

***

### validatePolicy()

> **validatePolicy**(`policy`): `any`

Defined in: [src/managers/PolicyValidator.js:198](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L198)

Validate a single policy

#### Parameters

##### policy

`any`

#### Returns

`any`

***

### validateSemantics()

> **validateSemantics**(`policy`): `object`[]

Defined in: [src/managers/PolicyValidator.js:301](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyValidator.js#L301)

Validate semantic correctness

#### Parameters

##### policy

`any`

#### Returns

`object`[]
