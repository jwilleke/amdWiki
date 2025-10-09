# Backing Up amdWiki

## Managers MUST incldue Backup

 Create src/managers/BackupManger
src/managers/BackupManger should be able to create single *.gz file to perform a backup().
src/managers/BackupManger MUST have a single backup() fuction which will call every other src/managers/*Manager backup() fuction
src/managers/BackupManger MUST have a single restore() fuction which will call every other src/managers/*Manager restore() fuction

We will require but not do yet 
All src/*Managers MUST have a single backup() function to perform a backup of the data they accoutnable to manage.
All src/*Managers MUST have a single restore() function to perform a restore of the data they accoutnable to manage.

But add it to src/managers/BaseManager.js

BackupManager Implementation Complete ✅
Created Files:
src/managers/BackupManager.js - Full implementation with backup/restore orchestration
Modified Files:
src/managers/BaseManager.js - Added backup()/restore() interface methods
src/core/Engine.js - Added getRegisteredManagers() method
src/WikiEngine.js - Added BackupManager import
src/WikiEngine.js - Added BackupManager initialization
config/app-default-config.json - Added backup configuration properties

## BackupManger Key Features
- Creates single compressed .gz backup files
- Calls backup() on all registered managers
- Calls restore() on all managers from backup file
- Automatic cleanup of old backups (keeps last 10)
- Comprehensive error handling and logging
- Helper methods: listBackups(), getLatestBackup()

## BackupManger Status
- BackupManager is initialized and running ✅
- Interface defined in BaseManager ✅
- Server running normally ✅
- 
- Ready for individual manager implementations (future work as specified by user)

## BackupManger Configuration entries
``` json
  "_comment_backup": "Backup and restore configuration for BackupManager",
  "amdwiki.backup.directory": "./backups",
  "amdwiki.backup.maxBackups": 10,
  "amdwiki.backup.compress": true,
  "amdwiki.backup.autoBackup": false,
  "amdwiki.backup.autoBackupInterval": 86400000
```

## BackupManger TODOs

- src/managers/PageManager MUST have backup for regular "amdwiki.directories.pages": "./pages"
- src/managers/PageManager SHOULD have backup for "amdwiki.directories.required-pages": "./required-pages",
- src/managers/ConfigurationMaanger MUST have Backup for all Config data
- src/managers/UserManager.js MUST have back for all USER data including Audit Data
- /src/managers/TemplateManager.js MUST have Backup for all Template data
- src/managers/VariableManager.js MUST have Backup for Varibele data
- src/managers/PluginManager.js MUST have Backup for Plugin data
- src/managers/ExportManager.js should only need to call instances for Managers backup()
