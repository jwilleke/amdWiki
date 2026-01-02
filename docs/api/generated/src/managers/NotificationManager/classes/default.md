[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/NotificationManager](../README.md) / default

# Class: default

Defined in: [src/managers/NotificationManager.ts:80](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L80)

NotificationManager - Handles system notifications and user alerts

Manages user-facing notifications and system alerts with persistent storage.
Extends BaseManager following the modular manager pattern.

 NotificationManager

## See

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const notificationManager = engine.getManager('NotificationManager');
notificationManager.addNotification({ title: 'Welcome!', level: 'info' });
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `NotificationManager`

Defined in: [src/managers/NotificationManager.ts:95](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L95)

Creates a new NotificationManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`NotificationManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### addNotification()

> **addNotification**(`notification`): `Promise`\<`string`\>

Defined in: [src/managers/NotificationManager.ts:262](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L262)

Add a notification (alias for createNotification for backward compatibility)

#### Parameters

##### notification

[`NotificationInput`](../interfaces/NotificationInput.md)

Notification object

#### Returns

`Promise`\<`string`\>

Notification ID

***

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/BaseManager.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L168)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data object containing all manager state

#### Throws

If backup operation fails

#### Example

```ts
async backup(): Promise<BackupData> {
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

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### cleanupExpiredNotifications()

> **cleanupExpiredNotifications**(): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.ts:371](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L371)

Clean up expired notifications

#### Returns

`Promise`\<`void`\>

***

### clearAllActive()

> **clearAllActive**(): `Promise`\<`number`\>

Defined in: [src/managers/NotificationManager.ts:394](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L394)

Clear all active (non-expired) notifications

#### Returns

`Promise`\<`number`\>

Number of cleared notifications

***

### createMaintenanceNotification()

> **createMaintenanceNotification**(`enabled`, `adminUsername`, `_config`): `Promise`\<`string`\>

Defined in: [src/managers/NotificationManager.ts:324](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L324)

Create maintenance mode notification

#### Parameters

##### enabled

`boolean`

Whether maintenance mode is enabled

##### adminUsername

`string`

Admin who toggled maintenance mode

##### \_config

[`MaintenanceConfig`](../interfaces/MaintenanceConfig.md) = `{}`

#### Returns

`Promise`\<`string`\>

Notification ID

***

### createNotification()

> **createNotification**(`notification`): `Promise`\<`string`\>

Defined in: [src/managers/NotificationManager.ts:229](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L229)

Create a new notification

#### Parameters

##### notification

[`NotificationInput`](../interfaces/NotificationInput.md)

Notification object

#### Returns

`Promise`\<`string`\>

Notification ID

***

### dismissNotification()

> **dismissNotification**(`notificationId`, `username`): `Promise`\<`boolean`\>

Defined in: [src/managers/NotificationManager.ts:300](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L300)

Dismiss a notification for a user

#### Parameters

##### notificationId

`string`

Notification ID

##### username

`string`

Username dismissing the notification

#### Returns

`Promise`\<`boolean`\>

Success status

***

### getAllNotifications()

> **getAllNotifications**(`includeExpired`): [`Notification`](../interfaces/Notification.md)[]

Defined in: [src/managers/NotificationManager.ts:354](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L354)

Get all active notifications

#### Parameters

##### includeExpired

`boolean` = `false`

Include expired notifications

#### Returns

[`Notification`](../interfaces/Notification.md)[]

Array of all notifications

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### getStats()

> **getStats**(): [`NotificationStats`](../interfaces/NotificationStats.md)

Defined in: [src/managers/NotificationManager.ts:420](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L420)

Get notification statistics

#### Returns

[`NotificationStats`](../interfaces/NotificationStats.md)

Statistics object

***

### getUserNotifications()

> **getUserNotifications**(`username`, `includeExpired`): [`Notification`](../interfaces/Notification.md)[]

Defined in: [src/managers/NotificationManager.ts:272](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L272)

Get notifications for a specific user

#### Parameters

##### username

`string`

Username to get notifications for

##### includeExpired

`boolean` = `false`

Include expired notifications

#### Returns

[`Notification`](../interfaces/Notification.md)[]

Array of notifications

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.ts:113](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L113)

Initialize the notification manager

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

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

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L196)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data object from backup() method

#### Returns

`Promise`\<`void`\>

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData: BackupData): Promise<void> {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.ts:450](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/NotificationManager.ts#L450)

Shutdown the notification manager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)
