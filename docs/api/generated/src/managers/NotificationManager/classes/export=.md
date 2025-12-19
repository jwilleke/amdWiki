[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/NotificationManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/NotificationManager.js:26](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L26)

NotificationManager - Handles system notifications and user alerts

Manages user-facing notifications and system alerts with persistent storage.
Extends BaseManager following the modular manager pattern.

 NotificationManager

## See

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const notificationManager = engine.getManager('NotificationManager');
notificationManager.addNotification('admin', 'Welcome!', 'info');
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `NotificationManager`

Defined in: [src/managers/NotificationManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L33)

Creates a new NotificationManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`NotificationManager`

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

### logger

> **logger**: `any`

Defined in: [src/managers/NotificationManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L50)

***

### notificationId

> **notificationId**: `number`

Defined in: [src/managers/NotificationManager.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L36)

Auto-incrementing notification ID

***

### notifications

> **notifications**: `Map`\<`any`, `any`\>

Defined in: [src/managers/NotificationManager.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L35)

Active notifications by ID

***

### saveInterval

> **saveInterval**: `Timeout`

Defined in: [src/managers/NotificationManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L81)

***

### saveQueue

> **saveQueue**: `Set`\<`any`\>

Defined in: [src/managers/NotificationManager.js:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L38)

Notifications pending save

***

### storagePath

> **storagePath**: `string`

Defined in: [src/managers/NotificationManager.js:37](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L37)

Path to notifications storage file

## Methods

### addNotification()

> **addNotification**(`notification`): `string`

Defined in: [src/managers/NotificationManager.js:190](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L190)

Add a notification (alias for createNotification for backward compatibility)

#### Parameters

##### notification

`any`

Notification object

#### Returns

`string`

Notification ID

***

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

### cleanupExpiredNotifications()

> **cleanupExpiredNotifications**(): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.js:296](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L296)

Clean up expired notifications

#### Returns

`Promise`\<`void`\>

***

### clearAllActive()

> **clearAllActive**(): `number`

Defined in: [src/managers/NotificationManager.js:319](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L319)

Clear all active (non-expired) notifications

#### Returns

`number`

Number of cleared notifications

***

### createMaintenanceNotification()

> **createMaintenanceNotification**(`enabled`, `adminUsername`, `config`): `string`

Defined in: [src/managers/NotificationManager.js:253](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L253)

Create maintenance mode notification

#### Parameters

##### enabled

`boolean`

Whether maintenance mode is enabled

##### adminUsername

`string`

Admin who toggled maintenance mode

##### config

`any` = `{}`

Maintenance configuration

#### Returns

`string`

Notification ID

***

### createNotification()

> **createNotification**(`notification`): `string`

Defined in: [src/managers/NotificationManager.js:157](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L157)

Create a new notification

#### Parameters

##### notification

Notification object

###### expiresAt

`Date`

When notification expires

###### level

`string`

Severity level (info, warning, error, success)

###### message

`string`

Notification message

###### targetUsers

`any`[]

Array of usernames to notify (empty for all)

###### title

`string`

Notification title

###### type

`string`

Type of notification (maintenance, system, user)

#### Returns

`string`

Notification ID

***

### dismissNotification()

> **dismissNotification**(`notificationId`, `username`): `boolean`

Defined in: [src/managers/NotificationManager.js:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L229)

Dismiss a notification for a user

#### Parameters

##### notificationId

`string`

Notification ID

##### username

`string`

Username dismissing the notification

#### Returns

`boolean`

Success status

***

### getAllNotifications()

> **getAllNotifications**(`includeExpired`): `any`[]

Defined in: [src/managers/NotificationManager.js:279](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L279)

Get all active notifications

#### Parameters

##### includeExpired

`boolean` = `false`

Include expired notifications

#### Returns

`any`[]

Array of all notifications

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

### getStats()

> **getStats**(): `any`

Defined in: [src/managers/NotificationManager.js:345](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L345)

Get notification statistics

#### Returns

`any`

Statistics object

***

### getUserNotifications()

> **getUserNotifications**(`username`, `includeExpired`): `any`[]

Defined in: [src/managers/NotificationManager.js:201](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L201)

Get notifications for a specific user

#### Parameters

##### username

`string`

Username to get notifications for

##### includeExpired

`boolean` = `false`

Include expired notifications

#### Returns

`any`[]

Array of notifications

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L48)

Initialize the notification manager

#### Parameters

##### config?

`any` = `{}`

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

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

### loadNotifications()

> **loadNotifications**(): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.js:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L93)

Load notifications from storage

#### Returns

`Promise`\<`void`\>

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

### saveNotifications()

> **saveNotifications**(): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L130)

Save notifications to storage

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/NotificationManager.js:375](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/NotificationManager.js#L375)

Shutdown the notification manager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)
