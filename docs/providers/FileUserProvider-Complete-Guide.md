# FileUserProvider Complete Guide

[Quick Reference](FileUserProvider.md) | **Complete Guide**

**Module:** `src/providers/FileUserProvider.js`
**Type:** User Storage Provider
**Extends:** BaseUserProvider
**Status:** Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-12-22

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Initialization](#initialization)
- [User Management](#user-management)
- [Session Management](#session-management)
- [File Format](#file-format)
- [Backup and Restore](#backup-and-restore)
- [Methods Reference](#methods-reference)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

FileUserProvider is the default user storage provider for amdWiki, implementing JSON file-based storage for users and sessions. It provides a simple, human-readable, and portable user database without requiring external database servers.

### Design Philosophy

- **Simplicity**: Plain JSON files, no database server required
- **Portability**: Files can be version-controlled, backed up easily
- **Performance**: In-memory caching via Map structures
- **Reliability**: Atomic file writes, automatic session cleanup
- **Transparency**: Human-readable JSON format

### Key Features

**User Storage:**

- JSON file-based persistence (`users.json`)
- In-memory caching (Map structure for O(1) lookups)
- Username as primary key
- Password hashing handled by UserManager (not provider)

**Session Storage:**

- Separate JSON file (`sessions.json`)
- Automatic expiration cleanup on load
- Session ID as primary key
- Timestamp-based expiration

**Operational:**

- Backup/restore support
- Graceful shutdown with cleanup
- Error recovery (missing files handled)
- Atomic file writes

---

## Architecture

### Class Hierarchy

```
BaseUserProvider (abstract)
  └── FileUserProvider (concrete)
```

### Component Relationships

```
WikiEngine
  └── UserManager
        └── FileUserProvider
              ├── Uses: ConfigurationManager (config access)
              ├── Uses: fs.promises (file I/O)
              └── Uses: path (path manipulation)
```

### Data Flow

**User Authentication:**

```
User logs in
  → UserManager.authenticateUser('admin', 'password')
    → FileUserProvider.getUser('admin')
      → Lookup in users Map
        → Return user object { username, password, roles, ... }
          → UserManager verifies password hash
            → Create session
              → FileUserProvider.createSession(sessionId, sessionData)
                → Add to sessions Map
                  → Save to sessions.json
```

**Session Validation:**

```
Request arrives with sessionId
  → express-session middleware
    → FileUserProvider.getSession(sessionId)
      → Lookup in sessions Map
        → Check expiration
          → Return session or null
```

### Directory Structure

```
data/users/
  ├── users.json      - User accounts (username → user data)
  └── sessions.json   - Active sessions (sessionId → session data)
```

---

## Configuration

All configuration via ConfigurationManager (lowercase keys):

### Storage Directory

```javascript
'amdwiki.user.provider.storagedir'
  Default: './data/users'
  Type: String
  Purpose: Directory for user and session files
```

### User File

```javascript
'amdwiki.user.provider.files.users'
  Default: 'users.json'
  Type: String
  Purpose: Filename for user database
```

### Session File

```javascript
'amdwiki.user.provider.files.sessions'
  Default: 'sessions.json'
  Type: String
  Purpose: Filename for session database
```

### Configuration Example

```json
{
  "amdwiki": {
    "user": {
      "provider": {
        "storagedir": "./data/users",
        "files": {
          "users": "users.json",
          "sessions": "sessions.json"
        }
      }
    }
  }
}
```

---

## Initialization

### Initialization Sequence

1. **Validate ConfigurationManager**
   - Ensures ConfigurationManager available
   - Throws error if missing

2. **Load Configuration**
   - Read storage directory path
   - Read users file name
   - Read sessions file name

3. **Create Directory**
   - Ensures storage directory exists
   - Uses `fs.mkdir(recursive: true)`

4. **Load Users**
   - Read users.json if exists
   - Parse JSON into Map
   - Handle missing file (empty Map)

5. **Load Sessions**
   - Read sessions.json if exists
   - Filter expired sessions
   - Save cleaned sessions back to disk

6. **Mark Initialized**
   - Set `initialized = true`
   - Log user count

### Initialization Code

```javascript
async initialize() {
  // 1. Get ConfigurationManager
  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('FileUserProvider requires ConfigurationManager');
  }

  // 2. Load configuration
  this.usersDirectory = configManager.getProperty(
    'amdwiki.user.provider.storagedir',
    './users'
  );
  this.usersFile = configManager.getProperty(
    'amdwiki.user.provider.files.users',
    'users.json'
  );
  this.sessionsFile = configManager.getProperty(
    'amdwiki.user.provider.files.sessions',
    'sessions.json'
  );

  // 3. Create storage directory
  await fs.mkdir(this.usersDirectory, { recursive: true });

  // 4. Load users
  await this.loadUsers();

  // 5. Load sessions (with expiration cleanup)
  await this.loadSessions();

  this.initialized = true;
  logger.info(`Initialized with ${this.users.size} users`);
}
```

---

## User Management

### In-Memory Cache

FileUserProvider stores users in a Map for O(1) lookups:

```javascript
{
  users: Map {
    'admin' => {
      username: 'admin',
      email: 'admin@localhost',
      password: '$2b$10$abcdef...', // bcrypt hash
      fullName: 'Administrator',
      roles: ['Admin', 'Authenticated'],
      active: true,
      created: '2025-01-22T10:00:00.000Z',
      lastLogin: '2025-01-22T14:30:00.000Z'
    },
    'editor' => {
      username: 'editor',
      email: 'editor@example.com',
      password: '$2b$10$xyz789...',
      fullName: 'Editor User',
      roles: ['Editor', 'Authenticated'],
      active: true,
      created: '2025-01-16T09:00:00.000Z'
    }
  }
}
```

### User CRUD Operations

#### Create User

```javascript
async createUser(username, userData) {
  // 1. Check for duplicate
  if (this.users.has(username)) {
    throw new Error(`User already exists: ${username}`);
  }

  // 2. Add to Map
  this.users.set(username, userData);

  // 3. Save to disk
  await this.saveUsers();

  logger.info(`Created user: ${username}`);
}
```

**Usage:**

```javascript
await provider.createUser('bob', {
  username: 'bob',
  email: 'bob@example.com',
  password: '$2b$10$hashedPassword...',
  fullName: 'Bob Smith',
  roles: ['Authenticated'],
  active: true,
  created: new Date().toISOString()
});
```

#### Read User

```javascript
async getUser(username) {
  return this.users.get(username) || null;
}
```

**Usage:**

```javascript
const user = await provider.getUser('admin');
if (user) {
  console.log(user.email);  // 'admin@localhost'
  console.log(user.roles);  // ['Admin', 'Authenticated']
}
```

#### Update User

```javascript
async updateUser(username, userData) {
  // 1. Check user exists
  if (!this.users.has(username)) {
    throw new Error(`User not found: ${username}`);
  }

  // 2. Update Map
  this.users.set(username, userData);

  // 3. Save to disk
  await this.saveUsers();

  logger.info(`Updated user: ${username}`);
}
```

**Usage:**

```javascript
const user = await provider.getUser('admin');
user.lastLogin = new Date().toISOString();
await provider.updateUser('admin', user);
```

#### Delete User

```javascript
async deleteUser(username) {
  // 1. Remove from Map
  const deleted = this.users.delete(username);

  // 2. Save to disk if deleted
  if (deleted) {
    await this.saveUsers();
    logger.info(`Deleted user: ${username}`);
  }

  return deleted;
}
```

**Usage:**

```javascript
const deleted = await provider.deleteUser('olduser');
if (deleted) {
  console.log('User deleted successfully');
}
```

### User Queries

#### Get All Users

```javascript
async getAllUsers() {
  return new Map(this.users); // Return copy
}
```

#### Get All Usernames

```javascript
async getAllUsernames() {
  return Array.from(this.users.keys());
}
```

#### Check User Exists

```javascript
async userExists(username) {
  return this.users.has(username);
}
```

---

## Session Management

### In-Memory Session Cache

Sessions stored in Map with automatic expiration:

```javascript
{
  sessions: Map {
    'session-id-123' => {
      username: 'admin',
      created: '2025-01-22T14:00:00.000Z',
      expiresAt: '2025-01-23T14:00:00.000Z',
      data: {
        lastActivity: '2025-01-22T14:30:00.000Z',
        ipAddress: '192.168.1.100'
      }
    }
  }
}
```

### Session Operations

#### Create Session

```javascript
async createSession(sessionId, sessionData) {
  this.sessions.set(sessionId, sessionData);
  await this.saveSessions();
  logger.debug(`Created session: ${sessionId}`);
}
```

**Usage:**

```javascript
const sessionId = uuidv4();
await provider.createSession(sessionId, {
  username: 'admin',
  created: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h
  data: {
    lastActivity: new Date().toISOString(),
    ipAddress: req.ip
  }
});
```

#### Get Session

```javascript
async getSession(sessionId) {
  return this.sessions.get(sessionId) || null;
}
```

**Usage:**

```javascript
const session = await provider.getSession(sessionId);
if (session && new Date(session.expiresAt) > new Date()) {
  console.log(`Active session for ${session.username}`);
} else {
  console.log('Session expired or not found');
}
```

#### Delete Session

```javascript
async deleteSession(sessionId) {
  const deleted = this.sessions.delete(sessionId);

  if (deleted) {
    await this.saveSessions();
    logger.debug(`Deleted session: ${sessionId}`);
  }

  return deleted;
}
```

### Expiration Cleanup

#### Automatic Cleanup on Load

```javascript
async loadSessions() {
  this.sessions.clear();
  const sessionsFilePath = path.join(this.usersDirectory, this.sessionsFile);

  try {
    const sessionsData = await fs.readFile(sessionsFilePath, 'utf8');
    const sessionsFromFile = JSON.parse(sessionsData);

    const now = new Date();
    let sessionsChanged = false;

    // Filter expired sessions
    for (const [sessionId, session] of Object.entries(sessionsFromFile)) {
      if (new Date(session.expiresAt) > now) {
        this.sessions.set(sessionId, session);
      } else {
        sessionsChanged = true; // Mark for cleanup
      }
    }

    // Save cleaned sessions back if any expired
    if (sessionsChanged) {
      await this.saveSessions();
    }

    logger.info(`Loaded ${this.sessions.size} active sessions`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      this.sessions = new Map();
    }
  }
}
```

#### Manual Cleanup

```javascript
async cleanExpiredSessions() {
  const now = new Date();
  let removedCount = 0;

  for (const [sessionId, session] of this.sessions.entries()) {
    if (new Date(session.expiresAt) <= now) {
      this.sessions.delete(sessionId);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    await this.saveSessions();
    logger.info(`Cleaned up ${removedCount} expired sessions`);
  }

  return removedCount;
}
```

---

## File Format

### users.json Structure

```json
{
  "admin": {
    "username": "admin",
    "email": "admin@localhost",
    "password": "$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "fullName": "Administrator",
    "roles": ["Admin", "Authenticated"],
    "active": true,
    "created": "2025-01-15T10:00:00.000Z",
    "lastLogin": "2025-01-22T14:30:00.000Z",
    "metadata": {
      "loginCount": 42,
      "preferences": {
        "theme": "dark",
        "timezone": "America/New_York"
      }
    }
  },
  "editor": {
    "username": "editor",
    "email": "editor@example.com",
    "password": "$2b$10$xyz789...",
    "fullName": "Editor User",
    "roles": ["Editor", "Authenticated"],
    "active": true,
    "created": "2025-01-16T09:00:00.000Z",
    "lastLogin": "2025-01-22T13:00:00.000Z"
  }
}
```

### sessions.json Structure

```json
{
  "session-id-abc123": {
    "username": "admin",
    "created": "2025-01-22T14:00:00.000Z",
    "expiresAt": "2025-01-23T14:00:00.000Z",
    "data": {
      "lastActivity": "2025-01-22T14:30:00.000Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  },
  "session-id-xyz789": {
    "username": "editor",
    "created": "2025-01-22T13:00:00.000Z",
    "expiresAt": "2025-01-23T13:00:00.000Z",
    "data": {
      "lastActivity": "2025-01-22T13:15:00.000Z",
      "ipAddress": "192.168.1.101"
    }
  }
}
```

---

## Backup and Restore

### Backup

Creates complete snapshot of users and sessions:

```javascript
async backup() {
  logger.info('[FileUserProvider] Starting backup...');

  const backupData = {
    providerName: 'FileUserProvider',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config: {
      usersDirectory: this.usersDirectory,
      usersFile: this.usersFile,
      sessionsFile: this.sessionsFile
    },
    users: Object.fromEntries(this.users),
    sessions: Object.fromEntries(this.sessions),
    statistics: {
      totalUsers: this.users.size,
      activeSessions: this.sessions.size,
      usernames: Array.from(this.users.keys())
    }
  };

  logger.info(`Backup complete: ${this.users.size} users, ${this.sessions.size} sessions`);

  return backupData;
}
```

**Usage:**

```javascript
const backup = await provider.backup();
// Save to file
await fs.writeFile('user-backup-2025-01-22.json', JSON.stringify(backup, null, 2));
```

### Restore

Restores users and sessions from backup:

```javascript
async restore(backupData) {
  logger.info('[FileUserProvider] Starting restore...');

  if (!backupData) {
    throw new Error('No backup data provided for restore');
  }

  // Restore users
  if (backupData.users && typeof backupData.users === 'object') {
    this.users = new Map(Object.entries(backupData.users));
    await this.saveUsers();
    logger.info(`Restored ${this.users.size} users`);
  }

  // Restore sessions (filter expired)
  if (backupData.sessions && typeof backupData.sessions === 'object') {
    const now = new Date();
    const validSessions = Object.entries(backupData.sessions).filter(
      ([, session]) => new Date(session.expiresAt) > now
    );

    this.sessions = new Map(validSessions);
    await this.saveSessions();
    logger.info(`Restored ${this.sessions.size} active sessions (expired filtered)`);
  }

  logger.info('[FileUserProvider] Restore completed successfully');
}
```

**Usage:**

```javascript
const backupData = JSON.parse(await fs.readFile('user-backup-2025-01-22.json', 'utf8'));
await provider.restore(backupData);
```

---

## Methods Reference

### User Methods

#### `async getUser(username)`

Get user by username.

**Returns:** `Promise<Object|null>`

#### `async getAllUsers()`

Get all users (Map copy).

**Returns:** `Promise<Map<string, Object>>`

#### `async getAllUsernames()`

Get array of usernames.

**Returns:** `Promise<Array<string>>`

#### `async createUser(username, userData)`

Create new user.

**Throws:** Error if user exists

#### `async updateUser(username, userData)`

Update existing user.

**Throws:** Error if user not found

#### `async deleteUser(username)`

Delete user.

**Returns:** `Promise<Boolean>` - true if deleted

#### `async userExists(username)`

Check if user exists.

**Returns:** `Promise<Boolean>`

### Session Methods

#### `async createSession(sessionId, sessionData)`

Create new session.

**Returns:** `Promise<void>`

#### `async getSession(sessionId)`

Get session by ID.

**Returns:** `Promise<Object|null>`

#### `async getAllSessions()`

Get all sessions (Map copy).

**Returns:** `Promise<Map<string, Object>>`

#### `async deleteSession(sessionId)`

Delete session.

**Returns:** `Promise<Boolean>` - true if deleted

#### `async cleanExpiredSessions()`

Remove expired sessions.

**Returns:** `Promise<number>` - Count removed

### File Methods

#### `async loadUsers()`

Load users from users.json.

**Returns:** `Promise<void>`

#### `async saveUsers()`

Save users to users.json.

**Returns:** `Promise<void>`

#### `async loadSessions()`

Load sessions from sessions.json (with expiration cleanup).

**Returns:** `Promise<void>`

#### `async saveSessions()`

Save sessions to sessions.json.

**Returns:** `Promise<void>`

### Backup Methods

#### `async backup()`

Create backup of all data.

**Returns:** `Promise<Object>` - Backup data

#### `async restore(backupData)`

Restore from backup.

**Returns:** `Promise<void>`

### Lifecycle Methods

#### `async initialize()`

Initialize provider.

**Returns:** `Promise<void>`

#### `async shutdown()`

Shutdown provider (cleans expired sessions).

**Returns:** `Promise<void>`

#### `getProviderInfo()`

Get provider metadata.

**Returns:** `Object` - Provider info

---

## Error Handling

### Common Errors

**Missing ConfigurationManager:**

```javascript
Error: FileUserProvider requires ConfigurationManager
```

**Duplicate User:**

```javascript
Error: User already exists: bob
```

**User Not Found:**

```javascript
Error: User not found: nonexistent
```

**File Write Error:**

```javascript
Error saving users: EACCES: permission denied
```

### Error Handling Patterns

```javascript
// Check before creating
if (await provider.userExists('bob')) {
  console.log('User already exists');
} else {
  await provider.createUser('bob', userData);
}

// Handle deletion
try {
  await provider.deleteUser('bob');
} catch (err) {
  console.error('Failed to delete user:', err);
}
```

---

## Performance

### Performance Characteristics

**User Operations:**

- getUser: O(1) - Map lookup
- getAllUsers: O(n) - Map copy
- createUser: O(1) + file write (~10ms)
- updateUser: O(1) + file write (~10ms)
- deleteUser: O(1) + file write (~10ms)

**Session Operations:**

- getSession: O(1) - Map lookup
- createSession: O(1) + file write (~10ms)
- cleanExpiredSessions: O(n) - iterate all sessions

**File Operations:**

- loadUsers: O(n) - parse JSON
- saveUsers: O(n) - stringify JSON + write

### Optimization Tips

1. **Batch user updates**

   ```javascript
   // Update Map for all users
   for (const user of users) {
     this.users.set(user.username, user);
   }
   // Single save at end
   await this.saveUsers();
   ```

2. **Periodic session cleanup**

   ```javascript
   // Run cleanup every hour
   setInterval(async () => {
     await provider.cleanExpiredSessions();
   }, 3600000);
   ```

3. **Avoid redundant saves**

   ```javascript
   // Bad: Save after each user
   for (const user of users) {
     await provider.createUser(user.username, user); // Save each time
   }

   // Good: Batch operation
   for (const user of users) {
     this.users.set(user.username, user);
   }
   await this.saveUsers(); // Single save
   ```

---

## Security Considerations

### Password Storage

**Provider does NOT hash passwords:**

- UserManager handles hashing (bcrypt)
- Provider stores pre-hashed passwords
- Never store plaintext passwords

**Correct flow:**

```javascript
// UserManager hashes password
const hashedPassword = await bcrypt.hash('password123', 10);

// Provider stores hash
await provider.createUser('bob', {
  username: 'bob',
  password: hashedPassword, // Already hashed!
  ...
});
```

### File Permissions

Ensure proper file permissions:

```bash
# Users file should be readable only by app user
chmod 600 data/users/users.json

# Sessions file should be readable only by app user
chmod 600 data/users/sessions.json

# Directory should be writable by app user
chmod 700 data/users/
```

### Session Security

- Use secure session IDs (UUIDs)
- Set reasonable expiration times
- Clean expired sessions regularly
- Use HTTPS for session cookies

---

## Troubleshooting

### Users Not Loading

**Symptom:** `users.size` is 0 after initialization

**Checks:**

1. Verify users.json exists
2. Check file permissions
3. Validate JSON syntax
4. Check logs for errors

### Session Expiration Issues

**Symptom:** Sessions expire too quickly

**Solution:**

- Check `expiresAt` timestamps
- Verify system clock is correct
- Ensure session creation sets proper expiration

### File Write Failures

**Symptom:** Changes not persisting to disk

**Checks:**

1. Verify directory exists
2. Check write permissions
3. Ensure sufficient disk space
4. Check for file locks

### Backup/Restore Failures

**Symptom:** Restore doesn't work

**Checks:**

1. Verify backup data structure
2. Check backup version compatibility
3. Ensure expired sessions are filtered
4. Validate JSON format

---

## Related Documentation

- **Quick Reference:** [FileUserProvider.md](FileUserProvider.md)
- **Base Class:** [BaseUserProvider.md](BaseUserProvider.md)
- **Manager:** [UserManager.md](../managers/UserManager.md)
- **Security:** [Policies-Roles-Permissions.md](../architecture/Policies-Roles-Permissions.md)

---

**Last Updated:** 2025-12-22
**Version:** 1.0.0
