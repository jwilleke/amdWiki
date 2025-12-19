[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PolicyEvaluator](../README.md) / export=

# Class: export=

Defined in: [src/managers/PolicyEvaluator.js:9](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L9)

PolicyEvaluator - Evaluates access policies against a given context.
PolicyEvaluator mimics how JSPWiki uses Java's built-in security framework (java.security) to load and evaluate security policies from a policy file

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PolicyEvaluator`

Defined in: [src/managers/PolicyEvaluator.js:10](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L10)

#### Parameters

##### engine

`any`

#### Returns

`PolicyEvaluator`

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

Defined in: [src/managers/PolicyEvaluator.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L12)

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

### evaluateAccess()

> **evaluateAccess**(`context`): `Promise`\<\{ `allowed`: `boolean`; `hasDecision`: `boolean`; `policyName`: `string`; `reason`: `string`; \}\>

Defined in: [src/managers/PolicyEvaluator.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L31)

Evaluates all relevant policies to make an access decision.

#### Parameters

##### context

The context of the access request.

###### action

`string`

The action being performed (e.g., 'view').

###### pageName

`string`

The name of the page being accessed.

###### userContext

`any`

The user's context, including roles.

#### Returns

`Promise`\<\{ `allowed`: `boolean`; `hasDecision`: `boolean`; `policyName`: `string`; `reason`: `string`; \}\>

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

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/PolicyEvaluator.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L15)

Initialize the manager with configuration

Override this method in subclasses to perform initialization logic.
Always call super.initialize() first in overridden implementations.

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

### matches()

> **matches**(`policy`, `context`): `boolean`

Defined in: [src/managers/PolicyEvaluator.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L54)

Checks if a single policy matches the given context.

#### Parameters

##### policy

`any`

The policy to check.

##### context

`any`

The access request context.

#### Returns

`boolean`

True if the policy matches, false otherwise.

***

### matchesAction()

> **matchesAction**(`actions`, `action`): `boolean`

Defined in: [src/managers/PolicyEvaluator.js:121](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L121)

Checks if the action matches the policy's actions.

#### Parameters

##### actions

`string`[]

The actions array from the policy.

##### action

`string`

The action being performed.

#### Returns

`boolean`

True if the action is in the policy's list.

***

### matchesResource()

> **matchesResource**(`resources`, `pageName`): `boolean`

Defined in: [src/managers/PolicyEvaluator.js:103](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L103)

Checks if the resource matches the policy's resources.

#### Parameters

##### resources

`any`[]

The resources array from the policy.

##### pageName

`string`

The name of the page being accessed.

#### Returns

`boolean`

True if a resource matches the page.

***

### matchesSubject()

> **matchesSubject**(`policySubjects`, `userContext`): `boolean`

Defined in: [src/managers/PolicyEvaluator.js:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyEvaluator.js#L68)

Check if the user context's roles match the policy's subject requirements.

#### Parameters

##### policySubjects

`any`[]

The subjects array from the policy.

##### userContext

`any`

The user's context.

#### Returns

`boolean`

True if the user matches the policy subjects.

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
