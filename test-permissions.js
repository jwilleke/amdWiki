const path = require('path');
const fs = require('fs').promises;

// Simple test without full WikiEngine initialization
async function testPermissionLogic() {
  try {
    console.log('Testing permission logic...');

    // Load users and roles directly
    const usersFile = path.join('./users', 'users.json');
    const usersData = await fs.readFile(usersFile, 'utf8');
    const users = JSON.parse(usersData);

    console.log('Loaded users:', Object.keys(users));

    // Define default roles (from UserManager)
    const defaultRoles = {
      'admin': {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        permissions: ['page:read', 'page:edit', 'page:create', 'page:delete', 'page:rename', 'attachment:upload', 'attachment:delete', 'export:pages', 'search:all', 'user:manage', 'system:config'],
        isSystem: true
      },
      'editor': {
        name: 'editor',
        displayName: 'Editor',
        description: 'Can create and edit all pages',
        permissions: ['page:read', 'page:edit', 'page:create', 'page:delete', 'page:rename', 'attachment:upload', 'attachment:delete', 'export:pages', 'search:all'],
        isSystem: true
      },
      'contributor': {
        name: 'contributor',
        displayName: 'Contributor',
        description: 'Can edit existing pages and create new ones',
        permissions: ['page:read', 'page:edit', 'page:create', 'attachment:upload', 'export:pages', 'search:all'],
        isSystem: true
      },
      'reader': {
        name: 'reader',
        displayName: 'Reader',
        description: 'Read-only access',
        permissions: ['page:read', 'search:all', 'export:pages'],
        isSystem: true
      },
      'anonymous': {
        name: 'anonymous',
        displayName: 'Anonymous User',
        description: 'Public access (no login required)',
        permissions: ['page:read'],
        isSystem: true
      }
    };

    // Test permission logic for different users
    const testUsers = ['jim', 'mew', 'admin', null, 'nonexistent'];

    for (const username of testUsers) {
      console.log(`\n=== Testing user: ${username || 'null'} ===`);

      let userRoles = [];
      let userPermissions = [];

      if (!username || username === 'anonymous') {
        console.log('Treating as anonymous user');
        userRoles = ['anonymous'];
      } else if (username === 'asserted') {
        console.log('Treating as asserted user');
        userRoles = ['reader'];
      } else {
        const user = users[username];
        if (!user || !user.isActive) {
          console.log('User not found or inactive');
          userRoles = ['anonymous'];
        } else {
          userRoles = user.roles || [];
          console.log('User found with roles:', userRoles);
        }
      }

      // Get permissions from roles
      for (const roleName of userRoles) {
        const role = defaultRoles[roleName];
        if (role && role.permissions) {
          userPermissions.push(...role.permissions);
        }
      }

      // Remove duplicates
      userPermissions = [...new Set(userPermissions)];

      console.log('User permissions:', userPermissions);
      console.log('Has page:read permission:', userPermissions.includes('page:read'));
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPermissionLogic();