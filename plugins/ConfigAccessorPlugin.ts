/**
 * ConfigAccessorPlugin - JSPWiki-style plugin for amdWiki
 * Displays configuration values including roles, features, and system settings
 *
 * Usage:
 *   [{ConfigAccessor key='amdwiki.server.port'}]                                - Display single config value (formatted)
 *   [{ConfigAccessor key='amdwiki.server.*'}]                                   - Display matching config values with wildcard (formatted)
 *   [{ConfigAccessor key='amdwiki.server.port' valueonly='true'}]               - Return only the value (inline, no trailing content by default)
 *   [{ConfigAccessor key='amdwiki.server.port' valueonly='true' after='\n'}]    - Return value with trailing newline
 *   [{ConfigAccessor key='amdwiki.server.*' valueonly='true'}]                  - Return matching values, one per line (default)
 *   [{ConfigAccessor key='amdwiki.server.*' valueonly='true' before='* '}]      - Return as bulleted list
 *   [{ConfigAccessor type='roles'}]                                             - Display all roles (formatted)
 *   [{ConfigAccessor type='permissions'}]                                       - Display Security Policy Summary (permissions matrix)
 *   [{ConfigAccessor type='policy-summary'}]                                    - Alias for permissions type
 *   [{ConfigAccessor type='user-summary'}]                                      - Display current user's roles and permissions
 *   [{ConfigAccessor type='manager' manager='UserManager'}]                     - Display manager config (formatted)
 *   [{ConfigAccessor type='feature' feature='search'}]                          - Display feature config (formatted)
 *   [{ConfigAccessor type='userKeywords'}]                                      - Display all user keywords (formatted)
 *   [{ConfigAccessor type='userKeywords' label='private'}]                      - Display keywords with label='private'
 *   [{ConfigAccessor type='userKeywords' enabled='true'}]                       - Display enabled keywords
 *   [{ConfigAccessor type='userKeywords' category='access'}]                    - Display keywords by category
 *   [{ConfigAccessor type='userKeywords' enabled='true' valueonly='true'}]      - Return enabled keyword labels only
 *
 * Note: Plugin names are case-insensitive. [{configaccessor}], [{ConfigAccessor}], and [{CONFIGACCESSOR}] all work the same.
 * Default 'after' value: '' (empty) for single values, '\n' (newline) for multiple values (wildcards)
 */

import type { PluginContext, PluginParams, SimplePlugin } from './types';

// ============================================================================
// Type Definitions
// ============================================================================

interface Role {
  name: string;
  displayname: string;
  description?: string;
  issystem?: boolean;
  color?: string;
  icon?: string;
  permissions?: string[];
}

interface UserContext {
  username?: string;
  displayName?: string;
  displayname?: string;
  email?: string;
  roles?: string[];
}

interface ConfigurationManager {
  getProperty(key: string, defaultValue?: unknown): unknown;
  getAllProperties(): Record<string, unknown>;
  getManagerConfig(name: string): Record<string, unknown> | null;
  getFeatureConfig(name: string): Record<string, unknown> | null;
}

interface UserManager {
  getRoles(): Role[];
  getPermissions(): Map<string, string>;
}

interface AccessPolicy {
  actions?: string[];
}

interface UserKeyword {
  label: string;
  description?: string;
  category?: string;
  enabled?: boolean;
  restrictEditing?: boolean;
  allowedRoles?: string[];
}

interface SystemKeyword {
  label: string;
  description?: string;
  category?: string;
  enabled?: boolean;
  default?: boolean;
  schemaOrg?: string;
}

interface SystemCategory {
  label: string;
  description?: string;
  enabled?: boolean;
  default?: boolean;
  storageLocation?: string;
}

interface ConfigAccessorParams extends PluginParams {
  key?: string;
  type?: string;
  valueonly?: string | boolean;
  before?: string;
  after?: string;
  manager?: string;
  feature?: string;
  label?: string;
  enabled?: string | boolean;
  category?: string;
  restrictEditing?: string | boolean;
  default?: string | boolean;
  storageLocation?: string;
}

interface ExtendedPluginContext extends PluginContext {
  userContext?: UserContext;
  currentUser?: UserContext;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Escape HTML special characters
 */
function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'object' ? JSON.stringify(text) : String(text as string | number | boolean);
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Process escape sequences in strings (e.g., \n, \t, \\)
 */
function processEscapeSequences(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\\n/g, '\n')   // Newline
    .replace(/\\t/g, '\t')   // Tab
    .replace(/\\r/g, '\r')   // Carriage return
    .replace(/\\\\/g, '\\'); // Backslash (must be last)
}

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display all roles
 */
function displayRoles(userManager: UserManager | null): string {
  if (!userManager) {
    return '<p class="error">UserManager not available</p>';
  }

  const roles = userManager.getRoles();

  if (!roles || roles.length === 0) {
    return '<p class="text-muted">No roles configured</p>';
  }

  let html = '<div class="config-accessor-plugin">\n';
  html += '  <div class="card">\n';
  html += '    <div class="card-header">\n';
  html += '      <h5><i class="fas fa-users"></i> Available Roles</h5>\n';
  html += '      <small class="text-muted">System and user-defined roles</small>\n';
  html += '    </div>\n';
  html += '    <div class="card-body">\n';
  html += '      <div class="table-responsive">\n';
  html += '        <table class="table table-sm table-hover">\n';
  html += '          <thead>\n';
  html += '            <tr>\n';
  html += '              <th style="width: 20%;">Role Name</th>\n';
  html += '              <th style="width: 25%;">Display Name</th>\n';
  html += '              <th style="width: 35%;">Description</th>\n';
  html += '              <th style="width: 10%;">Type</th>\n';
  html += '              <th style="width: 10%;">Icon</th>\n';
  html += '            </tr>\n';
  html += '          </thead>\n';
  html += '          <tbody>\n';

  // Sort roles: system first, then alphabetically
  const sortedRoles = [...roles].sort((a, b) => {
    if (a.issystem && !b.issystem) return -1;
    if (!a.issystem && b.issystem) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const role of sortedRoles) {
    const color = role.color || '#6c757d';
    const badge = role.issystem ?
      '<span class="badge bg-primary">System</span>' :
      '<span class="badge bg-secondary">Custom</span>';

    html += '            <tr>\n';
    html += `              <td><code>${escapeHtml(role.name)}</code></td>\n`;
    html += `              <td><strong style="color: ${escapeHtml(color)};">${escapeHtml(role.displayname)}</strong></td>\n`;
    html += `              <td><small class="text-muted">${escapeHtml(role.description || 'No description')}</small></td>\n`;
    html += `              <td>${badge}</td>\n`;
    html += `              <td><i class="fas fa-${escapeHtml(role.icon || 'user')}" style="color: ${escapeHtml(color)};"></i></td>\n`;
    html += '            </tr>\n';
  }

  html += '          </tbody>\n';
  html += '        </table>\n';
  html += '      </div>\n';
  html += '    </div>\n';
  html += '    <div class="card-footer text-muted">\n';
  html += `      <small>Total Roles: ${roles.length} | System Roles: ${roles.filter(r => r.issystem).length} | Custom Roles: ${roles.filter(r => !r.issystem).length}</small>\n`;
  html += '    </div>\n';
  html += '  </div>\n';
  html += '</div>\n';

  return html;
}

/**
 * Display Security Policy Summary - permissions matrix showing which roles have which permissions
 */
function displayPermissions(userManager: UserManager | null): string {
  if (!userManager) {
    return '<p class="error">UserManager not available</p>';
  }

  const roles = userManager.getRoles();
  const permissions = userManager.getPermissions();

  if (!roles || roles.length === 0) {
    return '<p class="text-muted">No roles configured</p>';
  }

  if (!permissions || permissions.size === 0) {
    return '<p class="text-muted">No permissions defined in the system</p>';
  }

  // Convert permissions Map to array
  const permissionsArray = Array.from(permissions.entries()).map(([key, desc]) => ({
    key,
    description: desc
  }));

  // Roles are already an array from getRoles()
  const rolesArray: Role[] = roles;

  let html = '<div class="config-accessor-plugin">\n';
  html += '  <div class="card mt-4">\n';
  html += '    <div class="card-header">\n';
  html += '      <h5 class="mb-0"><i class="fas fa-shield-alt"></i> Security Policy Summary</h5>\n';
  html += '      <small class="text-muted">Permissions matrix showing which roles have which permissions</small>\n';
  html += '    </div>\n';
  html += '    <div class="card-body">\n';
  html += '      <div class="table-responsive">\n';
  html += '        <table class="table table-bordered table-hover table-sm">\n';
  html += '          <thead>\n';
  html += '            <tr>\n';
  html += '              <th style="width: 300px;">Permission</th>\n';

  // Add column headers for each role
  for (const role of rolesArray) {
    html += `              <th class="text-center">${escapeHtml(role.displayname)}</th>\n`;
  }

  html += '            </tr>\n';
  html += '          </thead>\n';
  html += '          <tbody>\n';

  // Add rows for each permission
  for (const perm of permissionsArray) {
    html += '            <tr>\n';
    html += '              <td>\n';
    html += `                <code class="text-primary">${escapeHtml(perm.key)}</code>\n`;
    html += `                <br><small class="text-muted">${escapeHtml(perm.description)}</small>\n`;
    html += '              </td>\n';

    // Check each role for this permission
    for (const role of rolesArray) {
      html += '              <td class="text-center">\n';
      if (role.permissions && role.permissions.includes(perm.key)) {
        html += '                <i class="fas fa-check text-success"></i>\n';
      } else {
        html += '                <i class="fas fa-times text-muted"></i>\n';
      }
      html += '              </td>\n';
    }

    html += '            </tr>\n';
  }

  html += '          </tbody>\n';
  html += '        </table>\n';
  html += '      </div>\n';
  html += '    </div>\n';
  html += '    <div class="card-footer text-muted">\n';
  html += `      <small>Total Permissions: ${permissionsArray.length} | Total Roles: ${rolesArray.length}</small>\n`;
  html += '    </div>\n';
  html += '  </div>\n';
  html += '</div>\n';

  return html;
}

/**
 * Display current user summary - roles and permissions from WikiContext
 */
function displayUserSummary(context: ExtendedPluginContext, userManager: UserManager | null): string {
  if (!userManager) {
    return '<p class="error">UserManager not available</p>';
  }

  // Get current user from context (WikiContext uses userContext, not currentUser)
  const currentUser = context?.userContext || context?.currentUser;

  if (!currentUser) {
    return '<div class="alert alert-info"><i class="fas fa-info-circle"></i> Not logged in. Please <a href="/login">login</a> to see your user summary.</div>';
  }

  const username = currentUser.username || 'Unknown';
  const displayName = currentUser.displayName || currentUser.displayname || username;
  const email = currentUser.email || '';
  const userRoles = currentUser.roles || [];

  // Get all permissions for the user's roles
  const allRoles = userManager.getRoles();
  const rolesArray: Role[] = allRoles;

  // Collect user's permissions from their roles
  const userPermissions = new Set<string>();
  const roleDetails: Role[] = [];

  for (const roleName of userRoles) {
    const roleObj = rolesArray.find(r => r.name === roleName);
    if (roleObj) {
      roleDetails.push(roleObj);
      if (roleObj.permissions && Array.isArray(roleObj.permissions)) {
        roleObj.permissions.forEach(perm => userPermissions.add(perm));
      }
    }
  }

  const permissionsArray = Array.from(userPermissions).sort();

  let html = '<div class="config-accessor-plugin">\n';
  html += '  <div class="card">\n';
  html += '    <div class="card-header">\n';
  html += '      <h5 class="mb-0"><i class="fas fa-user-circle"></i> Current User Summary</h5>\n';
  html += '      <small class="text-muted">Your roles and permissions</small>\n';
  html += '    </div>\n';
  html += '    <div class="card-body">\n';

  // User Information Section
  html += '      <h6><i class="fas fa-id-card"></i> User Information</h6>\n';
  html += '      <table class="table table-sm table-borderless mb-3">\n';
  html += '        <tbody>\n';
  html += `          <tr><td style="width: 150px;"><strong>Username:</strong></td><td><code>${escapeHtml(username)}</code></td></tr>\n`;
  html += `          <tr><td><strong>Display Name:</strong></td><td>${escapeHtml(displayName)}</td></tr>\n`;
  if (email) {
    html += `          <tr><td><strong>Email:</strong></td><td>${escapeHtml(email)}</td></tr>\n`;
  }
  html += '        </tbody>\n';
  html += '      </table>\n';

  // Roles Section
  html += '      <h6><i class="fas fa-users"></i> Your Roles</h6>\n';
  if (roleDetails.length > 0) {
    html += '      <div class="mb-3">\n';
    for (const role of roleDetails) {
      const color = role.color || '#6c757d';
      const badge = role.issystem ?
        '<span class="badge bg-primary ms-2">System</span>' :
        '<span class="badge bg-secondary ms-2">Custom</span>';
      html += '        <div class="mb-2">\n';
      html += `          <i class="fas fa-${escapeHtml(role.icon || 'user')}" style="color: ${escapeHtml(color)};"></i>\n`;
      html += `          <strong style="color: ${escapeHtml(color)};">${escapeHtml(role.displayname)}</strong>\n`;
      html += `          ${badge}\n`;
      html += `          <br><small class="text-muted ms-4">${escapeHtml(role.description || 'No description')}</small>\n`;
      html += '        </div>\n';
    }
    html += '      </div>\n';
  } else {
    html += '      <p class="text-muted">No roles assigned</p>\n';
  }

  // Permissions Section
  html += '      <h6><i class="fas fa-shield-alt"></i> Your Permissions</h6>\n';
  if (permissionsArray.length > 0) {
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm table-bordered">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 40%;">Permission</th>\n';
    html += '              <th style="width: 60%;">Granted By Role(s)</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    // Get permissions details
    const allPermissions = userManager.getPermissions();

    for (const permKey of permissionsArray) {
      const permDesc = allPermissions.get(permKey) || 'No description';

      // Find which roles grant this permission
      const grantingRoles = roleDetails
        .filter(role => role.permissions && role.permissions.includes(permKey))
        .map(role => role.displayname);

      html += '            <tr>\n';
      html += '              <td>\n';
      html += `                <code class="text-primary">${escapeHtml(permKey)}</code>\n`;
      html += `                <br><small class="text-muted">${escapeHtml(permDesc)}</small>\n`;
      html += '              </td>\n';
      html += `              <td><small>${escapeHtml(grantingRoles.join(', '))}</small></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
  } else {
    html += '      <p class="text-muted">No permissions assigned (no roles with permissions)</p>\n';
  }

  html += '    </div>\n';
  html += '    <div class="card-footer text-muted">\n';
  html += `      <small><i class="fas fa-info-circle"></i> Total Roles: ${roleDetails.length} | Total Permissions: ${permissionsArray.length}</small>\n`;
  html += '    </div>\n';
  html += '  </div>\n';
  html += '</div>\n';

  return html;
}

/**
 * Display all unique actions from access policies
 */
function displayActions(
  configManager: ConfigurationManager,
  valueonly = false,
  before = '',
  after: string | undefined = undefined
): string {
  try {
    // Get access policies from configuration
    const policies = configManager.getProperty('amdwiki.access.policies', []) as AccessPolicy[];

    if (!Array.isArray(policies) || policies.length === 0) {
      if (valueonly) {
        return '';
      }
      return '<p class="text-muted">No access policies found</p>';
    }

    // Extract all unique actions from all policies
    const actionsSet = new Set<string>();
    for (const policy of policies) {
      if (policy.actions && Array.isArray(policy.actions)) {
        policy.actions.forEach(action => actionsSet.add(action));
      }
    }

    const actions = Array.from(actionsSet).sort();

    if (actions.length === 0) {
      if (valueonly) {
        return '';
      }
      return '<p class="text-muted">No actions defined in access policies</p>';
    }

    // If valueonly, return actions with before/after formatting
    if (valueonly) {
      // Default after for multiple values is '\n'
      const afterStr = after !== undefined ? after : '\n';
      const processedBefore = processEscapeSequences(before);
      const processedAfter = processEscapeSequences(afterStr);

      const items = actions.map(action => {
        return processedBefore + escapeHtml(action) + processedAfter;
      }).join('');

      // Convert newlines to <br> for HTML rendering
      const htmlItems = items.replace(/\n/g, '<br>\n');
      return `<span class="config-actions">${htmlItems}</span>`;
    }

    // Otherwise, return formatted HTML table
    // Group actions by category (prefix before colon)
    const actionsByCategory: Record<string, string[]> = {};
    for (const action of actions) {
      const [category] = action.split(':');
      if (!actionsByCategory[category]) {
        actionsByCategory[category] = [];
      }
      actionsByCategory[category].push(action);
    }

    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += '      <h6><i class="fas fa-shield-alt"></i> Available Actions (Permissions)</h6>\n';
    html += '      <small class="text-muted">All unique actions defined in access control policies</small>\n';
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm table-hover">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 30%;">Category</th>\n';
    html += '              <th style="width: 70%;">Actions</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    // Sort categories for consistent display
    const categories = Object.keys(actionsByCategory).sort();
    for (const category of categories) {
      const categoryActions = actionsByCategory[category];
      html += '            <tr>\n';
      html += `              <td><strong><code>${escapeHtml(category)}</code></strong></td>\n`;
      html += '              <td>\n';

      // Display actions as badges
      for (const action of categoryActions) {
        html += `                <code class="me-2">${escapeHtml(action)}</code>\n`;
      }

      html += '              </td>\n';
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="card-footer text-muted">\n';
    html += `      <small>Total Actions: ${actions.length} | Categories: ${categories.length}</small>\n`;
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<p class="error">Error displaying actions: ${escapeHtml(message)}</p>`;
  }
}

/**
 * Display user keywords with optional filtering
 */
function displayUserKeywords(
  configManager: ConfigurationManager,
  opts: ConfigAccessorParams = {},
  valueonly = false,
  before = '',
  after: string | undefined = undefined
): string {
  try {
    // Get userKeywords from configuration
    const userKeywordsRaw = configManager.getProperty('amdwiki.user-keywords', {}) as Record<string, Omit<UserKeyword, 'label'>>;

    if (!userKeywordsRaw || typeof userKeywordsRaw !== 'object' || Object.keys(userKeywordsRaw).length === 0) {
      if (valueonly) {
        return '';
      }
      return '<p class="text-muted">No user keywords found</p>';
    }

    // Convert to array and filter based on opts
    let keywords: (UserKeyword & { key: string })[] = Object.entries(userKeywordsRaw).map(([key, value]) => ({
      key,
      label: key,
      ...value
    }));

    // Apply filters based on opts
    const filterKeys = ['label', 'enabled', 'category', 'restrictEditing'] as const;
    for (const filterKey of filterKeys) {
      if (opts[filterKey] !== undefined) {
        const filterValue = opts[filterKey];
        keywords = keywords.filter(kw => {
          // Handle boolean values
          if (filterKey === 'enabled' || filterKey === 'restrictEditing') {
            const boolValue = filterValue === 'true' || filterValue === true;
            return kw[filterKey] === boolValue;
          }
          // Handle string values (case-insensitive comparison)
          const kwValue = kw[filterKey as keyof typeof kw];
          return String(kwValue).toLowerCase() === String(filterValue).toLowerCase();
        });
      }
    }

    if (keywords.length === 0) {
      if (valueonly) {
        return '';
      }
      const filterDesc = Object.entries(opts)
        .filter(([k]) => (filterKeys as readonly string[]).includes(k))
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(', ');
      return `<p class="text-muted">No user keywords match filter: ${escapeHtml(filterDesc)}</p>`;
    }

    // If valueonly, return labels with before/after formatting
    if (valueonly) {
      // Default after for multiple values is '\n'
      const afterStr = after !== undefined ? after : '\n';
      const processedBefore = processEscapeSequences(before);
      const processedAfter = processEscapeSequences(afterStr);

      const items = keywords.map(kw => {
        return processedBefore + escapeHtml(kw.label) + processedAfter;
      }).join('');

      // Convert newlines to <br> for HTML rendering
      const htmlItems = items.replace(/\n/g, '<br>\n');
      return `<span class="config-userkeywords">${htmlItems}</span>`;
    }

    // Otherwise, return formatted HTML table
    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += '      <h6><i class="fas fa-tags"></i> User Keywords';

    // Add filter info to header if filters applied
    const appliedFilters = Object.entries(opts)
      .filter(([k]) => (filterKeys as readonly string[]).includes(k))
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(', ');
    if (appliedFilters) {
      html += ` (${escapeHtml(appliedFilters)})`;
    }

    html += '</h6>\n';
    html += '      <small class="text-muted">User-defined keywords for content tagging and organization</small>\n';
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm table-hover">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 15%;">Label</th>\n';
    html += '              <th style="width: 30%;">Description</th>\n';
    html += '              <th style="width: 15%;">Category</th>\n';
    html += '              <th style="width: 10%;">Enabled</th>\n';
    html += '              <th style="width: 15%;">Restrict Editing</th>\n';
    html += '              <th style="width: 15%;">Allowed Roles</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    // Sort keywords by label
    keywords.sort((a, b) => a.label.localeCompare(b.label));

    for (const kw of keywords) {
      const enabledBadge = kw.enabled ?
        '<span class="badge bg-success">Yes</span>' :
        '<span class="badge bg-secondary">No</span>';
      const restrictBadge = kw.restrictEditing ?
        '<span class="badge bg-warning">Yes</span>' :
        '<span class="badge bg-secondary">No</span>';
      const allowedRoles = kw.allowedRoles && Array.isArray(kw.allowedRoles) ?
        kw.allowedRoles.join(', ') : '-';

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(kw.label)}</code></td>\n`;
      html += `              <td><small class="text-muted">${escapeHtml(kw.description || 'No description')}</small></td>\n`;
      html += `              <td><span class="badge bg-info">${escapeHtml(kw.category || 'none')}</span></td>\n`;
      html += `              <td>${enabledBadge}</td>\n`;
      html += `              <td>${restrictBadge}</td>\n`;
      html += `              <td><small>${escapeHtml(allowedRoles)}</small></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="card-footer text-muted">\n';
    html += `      <small>Total Keywords: ${keywords.length}`;

    // Add breakdown by category
    const categoryCounts: Record<string, number> = {};
    for (const kw of keywords) {
      const cat = kw.category || 'none';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ');
    html += ` | By Category: ${categoryBreakdown}`;

    html += '</small>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<p class="error">Error displaying user keywords: ${escapeHtml(message)}</p>`;
  }
}

/**
 * Display system keywords with optional filtering
 */
function displaySystemKeywords(
  configManager: ConfigurationManager,
  opts: ConfigAccessorParams = {},
  valueonly = false,
  before = '',
  after: string | undefined = undefined
): string {
  try {
    // Get systemKeywords from configuration
    const systemKeywordsRaw = configManager.getProperty('amdwiki.system-keywords', {}) as Record<string, Omit<SystemKeyword, 'label'>>;

    if (!systemKeywordsRaw || typeof systemKeywordsRaw !== 'object' || Object.keys(systemKeywordsRaw).length === 0) {
      if (valueonly) {
        return '';
      }
      return '<p class="text-muted">No system keywords found</p>';
    }

    // Convert to array and filter based on opts
    let keywords: (SystemKeyword & { key: string })[] = Object.entries(systemKeywordsRaw).map(([key, value]) => ({
      key,
      label: key,
      ...value
    }));

    // Apply filters based on opts
    const filterKeys = ['label', 'enabled', 'category', 'default'] as const;
    for (const filterKey of filterKeys) {
      if (opts[filterKey] !== undefined) {
        const filterValue = opts[filterKey];
        keywords = keywords.filter(kw => {
          // Handle boolean values
          if (filterKey === 'enabled' || filterKey === 'default') {
            const boolValue = filterValue === 'true' || filterValue === true;
            return kw[filterKey] === boolValue;
          }
          // Handle string values (case-insensitive comparison)
          const kwValue = kw[filterKey as keyof typeof kw];
          return String(kwValue).toLowerCase() === String(filterValue).toLowerCase();
        });
      }
    }

    if (keywords.length === 0) {
      if (valueonly) {
        return '';
      }
      const filterDesc = Object.entries(opts)
        .filter(([k]) => (filterKeys as readonly string[]).includes(k))
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(', ');
      return `<p class="text-muted">No system keywords match filter: ${escapeHtml(filterDesc)}</p>`;
    }

    // If valueonly, return labels with before/after formatting
    if (valueonly) {
      const afterStr = after !== undefined ? after : '\n';
      const processedBefore = processEscapeSequences(before);
      const processedAfter = processEscapeSequences(afterStr);

      const items = keywords.map(kw => {
        return processedBefore + escapeHtml(kw.label) + processedAfter;
      }).join('');

      const htmlItems = items.replace(/\n/g, '<br>\n');
      return `<span class="config-systemkeywords">${htmlItems}</span>`;
    }

    // Otherwise, return formatted HTML table
    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += '      <h6><i class="fas fa-tags"></i> System Keywords';

    const appliedFilters = Object.entries(opts)
      .filter(([k]) => (filterKeys as readonly string[]).includes(k))
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(', ');
    if (appliedFilters) {
      html += ` (${escapeHtml(appliedFilters)})`;
    }

    html += '</h6>\n';
    html += '      <small class="text-muted">System-defined keywords for controlled vocabulary</small>\n';
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm table-hover">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 15%;">Label</th>\n';
    html += '              <th style="width: 40%;">Description</th>\n';
    html += '              <th style="width: 15%;">Category</th>\n';
    html += '              <th style="width: 10%;">Enabled</th>\n';
    html += '              <th style="width: 10%;">Default</th>\n';
    html += '              <th style="width: 10%;">Schema.org</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    keywords.sort((a, b) => a.label.localeCompare(b.label));

    for (const kw of keywords) {
      const enabledBadge = kw.enabled ?
        '<span class="badge bg-success">Yes</span>' :
        '<span class="badge bg-secondary">No</span>';
      const defaultBadge = kw.default ?
        '<span class="badge bg-primary">Yes</span>' :
        '<span class="badge bg-secondary">No</span>';

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(kw.label)}</code></td>\n`;
      html += `              <td><small class="text-muted">${escapeHtml(kw.description || 'No description')}</small></td>\n`;
      html += `              <td><span class="badge bg-info">${escapeHtml(kw.category || 'none')}</span></td>\n`;
      html += `              <td>${enabledBadge}</td>\n`;
      html += `              <td>${defaultBadge}</td>\n`;
      html += `              <td><small>${escapeHtml(kw.schemaOrg || '-')}</small></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="card-footer text-muted">\n';
    html += `      <small>Total Keywords: ${keywords.length}`;

    const categoryCounts: Record<string, number> = {};
    for (const kw of keywords) {
      const cat = kw.category || 'none';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ');
    html += ` | By Category: ${categoryBreakdown}`;

    html += '</small>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<p class="error">Error displaying system keywords: ${escapeHtml(message)}</p>`;
  }
}

/**
 * Display system categories with optional filtering
 */
function displaySystemCategories(
  configManager: ConfigurationManager,
  opts: ConfigAccessorParams = {},
  valueonly = false,
  before = '',
  after: string | undefined = undefined
): string {
  try {
    // Get systemCategories from configuration
    const systemCategoriesRaw = configManager.getProperty('amdwiki.system-category', {}) as Record<string, Omit<SystemCategory, 'label'>>;

    if (!systemCategoriesRaw || typeof systemCategoriesRaw !== 'object' || Object.keys(systemCategoriesRaw).length === 0) {
      if (valueonly) {
        return '';
      }
      return '<p class="text-muted">No system categories found</p>';
    }

    // Convert to array and filter based on opts
    let categories: (SystemCategory & { key: string })[] = Object.entries(systemCategoriesRaw).map(([key, value]) => ({
      key,
      label: key,
      ...value
    }));

    // Apply filters based on opts
    const filterKeys = ['label', 'enabled', 'default', 'storageLocation'] as const;
    for (const filterKey of filterKeys) {
      if (opts[filterKey] !== undefined) {
        const filterValue = opts[filterKey];
        categories = categories.filter(cat => {
          // Handle boolean values
          if (filterKey === 'enabled' || filterKey === 'default') {
            const boolValue = filterValue === 'true' || filterValue === true;
            return cat[filterKey] === boolValue;
          }
          // Handle string values (case-insensitive comparison)
          const catValue = cat[filterKey as keyof typeof cat];
          return String(catValue).toLowerCase() === String(filterValue).toLowerCase();
        });
      }
    }

    if (categories.length === 0) {
      if (valueonly) {
        return '';
      }
      const filterDesc = Object.entries(opts)
        .filter(([k]) => (filterKeys as readonly string[]).includes(k))
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(', ');
      return `<p class="text-muted">No system categories match filter: ${escapeHtml(filterDesc)}</p>`;
    }

    // If valueonly, return labels with before/after formatting
    if (valueonly) {
      const afterStr = after !== undefined ? after : '\n';
      const processedBefore = processEscapeSequences(before);
      const processedAfter = processEscapeSequences(afterStr);

      const items = categories.map(cat => {
        return processedBefore + escapeHtml(cat.label) + processedAfter;
      }).join('');

      const htmlItems = items.replace(/\n/g, '<br>\n');
      return `<span class="config-systemcategories">${htmlItems}</span>`;
    }

    // Otherwise, return formatted HTML table
    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += '      <h6><i class="fas fa-folder"></i> System Categories';

    const appliedFilters = Object.entries(opts)
      .filter(([k]) => (filterKeys as readonly string[]).includes(k))
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(', ');
    if (appliedFilters) {
      html += ` (${escapeHtml(appliedFilters)})`;
    }

    html += '</h6>\n';
    html += '      <small class="text-muted">System categories that determine page storage location</small>\n';
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm table-hover">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 15%;">Label</th>\n';
    html += '              <th style="width: 45%;">Description</th>\n';
    html += '              <th style="width: 15%;">Storage Location</th>\n';
    html += '              <th style="width: 10%;">Enabled</th>\n';
    html += '              <th style="width: 15%;">Default</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    categories.sort((a, b) => a.label.localeCompare(b.label));

    for (const cat of categories) {
      const enabledBadge = cat.enabled ?
        '<span class="badge bg-success">Yes</span>' :
        '<span class="badge bg-secondary">No</span>';
      const defaultBadge = cat.default ?
        '<span class="badge bg-primary">Yes</span>' :
        '<span class="badge bg-secondary">No</span>';
      const storageBadge = cat.storageLocation === 'required' ?
        '<span class="badge bg-warning">required-pages</span>' :
        '<span class="badge bg-info">pages</span>';

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(cat.label)}</code></td>\n`;
      html += `              <td><small class="text-muted">${escapeHtml(cat.description || 'No description')}</small></td>\n`;
      html += `              <td>${storageBadge}</td>\n`;
      html += `              <td>${enabledBadge}</td>\n`;
      html += `              <td>${defaultBadge}</td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="card-footer text-muted">\n';
    html += `      <small>Total Categories: ${categories.length}`;

    const storageBreakdown = categories.reduce<Record<string, number>>((acc, cat) => {
      const loc = cat.storageLocation || 'regular';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    const storageDesc = Object.entries(storageBreakdown)
      .map(([loc, count]) => `${loc}: ${count}`)
      .join(', ');
    html += ` | By Storage: ${storageDesc}`;

    html += '</small>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<p class="error">Error displaying system categories: ${escapeHtml(message)}</p>`;
  }
}

/**
 * Display config value(s) with optional wildcard support
 */
function displayConfigValue(
  configManager: ConfigurationManager,
  key: string,
  valueonly = false,
  before = '',
  after: string | undefined = undefined
): string {
  if (!key) {
    return '<p class="error">Missing required parameter: key</p><p class="text-muted">Usage: [{ConfigAccessor key=\'amdwiki.some.key\'}]</p>';
  }

  // Check if key contains wildcard
  const hasWildcard = key.includes('*');

  if (hasWildcard) {
    // Get all properties and filter by pattern
    const allProps = configManager.getAllProperties();
    const pattern = new RegExp('^' + key.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    const matchingKeys = Object.keys(allProps).filter(k => pattern.test(k)).sort();

    if (matchingKeys.length === 0) {
      if (valueonly) {
        return ''; // Return empty string for valueonly if no matches
      }
      return `<p class="text-muted">No config keys match pattern: <code>${escapeHtml(key)}</code></p>`;
    }

    // If valueonly, return values with before/after formatting wrapped in span
    if (valueonly) {
      // Default after for multiple values is '\n'
      const afterStr = after !== undefined ? after : '\n';
      // Process escape sequences in before/after strings
      const processedBefore = processEscapeSequences(before);
      const processedAfter = processEscapeSequences(afterStr);

      const items = matchingKeys.map(k => {
        const val = allProps[k];
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val as string | number | boolean);
        return processedBefore + escapeHtml(valStr) + processedAfter;
      }).join('');
      // Convert newlines to <br> for HTML rendering
      const htmlItems = items.replace(/\n/g, '<br>\n');
      // Wrap in span to ensure it's treated as inline HTML
      return `<span class="config-values">${htmlItems}</span>`;
    }

    // Otherwise, return formatted HTML table
    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += `      <h6><i class="fas fa-cog"></i> Configuration Values (${matchingKeys.length} matches)</h6>\n`;
    html += `      <small class="text-muted">Pattern: <code>${escapeHtml(key)}</code></small>\n`;
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 40%;">Key</th>\n';
    html += '              <th style="width: 60%;">Value</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    for (const matchKey of matchingKeys) {
      const value = allProps[matchKey];
      const displayValue = typeof value === 'object' ?
        JSON.stringify(value, null, 2) :
        String(value as string | number | boolean);

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(matchKey)}</code></td>\n`;
      html += `              <td><code>${escapeHtml(displayValue)}</code></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;
  }

  // Single key lookup (no wildcard)
  const value = configManager.getProperty(key);

  if (value === undefined || value === null) {
    if (valueonly) {
      return ''; // Return empty string for valueonly if not found
    }
    return `<p class="text-muted">Config key <code>${escapeHtml(key)}</code> not found</p>`;
  }

  // If valueonly, return just the value with before/after formatting wrapped in span
  if (valueonly) {
    // Default after for single value is '' (empty string) for inline use
    const afterStr = after !== undefined ? after : '';
    // Process escape sequences in before/after strings
    const processedBefore = processEscapeSequences(before);
    const processedAfter = processEscapeSequences(afterStr);

    const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value as string | number | boolean);
    // Escape the value, process escape sequences in before/after
    // Wrap in span to ensure it's treated as inline HTML
    return `<span class="config-value">${processedBefore}${escapeHtml(valStr)}${processedAfter}</span>`;
  }

  // Otherwise, return formatted HTML
  let html = '<div class="config-accessor-plugin">\n';
  html += '  <div class="card">\n';
  html += '    <div class="card-header">\n';
  html += '      <h6><i class="fas fa-cog"></i> Configuration Value</h6>\n';
  html += '    </div>\n';
  html += '    <div class="card-body">\n';
  html += `      <p><strong>Key:</strong> <code>${escapeHtml(key)}</code></p>\n`;

  // Format value based on type
  if (typeof value === 'object') {
    html += '      <p><strong>Value:</strong></p>\n';
    html += `      <pre><code>${escapeHtml(JSON.stringify(value, null, 2))}</code></pre>\n`;
  } else {
    html += `      <p><strong>Value:</strong> <code>${escapeHtml(value)}</code></p>\n`;
  }

  html += '    </div>\n';
  html += '  </div>\n';
  html += '</div>\n';

  return html;
}

/**
 * Display manager-specific configuration
 */
function displayManagerConfig(configManager: ConfigurationManager, managerName: string | undefined): string {
  if (!managerName) {
    return '<p class="error">Missing required parameter: manager</p><p class="text-muted">Usage: [{ConfigAccessor type=\'manager\' manager=\'UserManager\'}]</p>';
  }

  try {
    const config = configManager.getManagerConfig(managerName);

    // Check if config is a valid object with properties
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return `<p class="text-muted">No configuration found for manager: <code>${escapeHtml(managerName)}</code></p>`;
    }

    const configEntries = Object.entries(config);
    if (configEntries.length === 0) {
      return `<p class="text-muted">No configuration properties found for manager: <code>${escapeHtml(managerName)}</code></p>`;
    }

    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += `      <h6><i class="fas fa-cogs"></i> ${escapeHtml(managerName)} Configuration</h6>\n`;
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 40%;">Property</th>\n';
    html += '              <th style="width: 60%;">Value</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    for (const [key, value] of configEntries) {
      const displayValue = typeof value === 'object' ?
        JSON.stringify(value, null, 2) :
        String(value as string | number | boolean);

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(key)}</code></td>\n`;
      html += `              <td><code>${escapeHtml(displayValue)}</code></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<p class="error">Error displaying manager configuration: ${escapeHtml(message)}</p>`;
  }
}

/**
 * Display feature-specific configuration
 */
function displayFeatureConfig(configManager: ConfigurationManager, featureName: string | undefined): string {
  if (!featureName) {
    return '<p class="error">Missing required parameter: feature</p><p class="text-muted">Usage: [{ConfigAccessor type=\'feature\' feature=\'search\'}]</p>';
  }

  try {
    const config = configManager.getFeatureConfig(featureName);

    // Check if config is a valid object with properties
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return `<p class="text-muted">No configuration found for feature: <code>${escapeHtml(featureName)}</code></p>`;
    }

    const configEntries = Object.entries(config);
    if (configEntries.length === 0) {
      return `<p class="text-muted">No configuration properties found for feature: <code>${escapeHtml(featureName)}</code></p>`;
    }

    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += `      <h6><i class="fas fa-puzzle-piece"></i> ${escapeHtml(featureName)} Feature Configuration</h6>\n`;
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 40%;">Property</th>\n';
    html += '              <th style="width: 60%;">Value</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    for (const [key, value] of configEntries) {
      const displayValue = typeof value === 'object' ?
        JSON.stringify(value, null, 2) :
        String(value as string | number | boolean);

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(key)}</code></td>\n`;
      html += `              <td><code>${escapeHtml(displayValue)}</code></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<p class="error">Error displaying feature configuration: ${escapeHtml(message)}</p>`;
  }
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * ConfigAccessorPlugin implementation
 */
const ConfigAccessorPlugin: SimplePlugin = {
  name: 'ConfigAccessorPlugin',
  description: 'Access configuration values including roles, features, and system settings',
  author: 'amdWiki',
  version: '2.7.0',

  /**
   * Execute the plugin
   */
  execute(context: PluginContext, params: PluginParams): string {
    const opts = (params || {}) as ConfigAccessorParams;
    const key = opts.key;
    const type = opts.type;
    const valueonly = opts.valueonly === 'true' || opts.valueonly === true;
    const before = typeof opts.before === 'string' ? opts.before : '';
    // Note: after default is determined in displayConfigValue based on single vs multiple values
    const after = typeof opts.after === 'string' ? opts.after : undefined;

    try {
      // Get managers from engine
      const configManager = context?.engine?.getManager?.('ConfigurationManager') as ConfigurationManager | null;
      const userManager = context?.engine?.getManager?.('UserManager') as UserManager | null;

      if (!configManager) {
        return '<p class="error">ConfigurationManager not available</p>';
      }

      // Require either key or type parameter
      if (!key && !type) {
        return '<p class="error">Missing required parameter: must specify either \'key\' or \'type\'</p>';
      }

      // If key is provided, handle config value(s)
      if (key) {
        return displayConfigValue(configManager, key, valueonly, before, after);
      }

      // Otherwise handle type-based display (type is guaranteed non-null here due to check above)
      switch ((type ?? '').toLowerCase()) {
      case 'roles':
        return displayRoles(userManager);

      case 'permissions':
      case 'policy-summary':
        return displayPermissions(userManager);

      case 'user-summary':
        return displayUserSummary(context as ExtendedPluginContext, userManager);

      case 'actions':
        return displayActions(configManager, valueonly, before, after);

      case 'manager':
        return displayManagerConfig(configManager, opts.manager);

      case 'feature':
        return displayFeatureConfig(configManager, opts.feature);

      case 'userkeywords':
        return displayUserKeywords(configManager, opts, valueonly, before, after);

      case 'systemkeywords':
        return displaySystemKeywords(configManager, opts, valueonly, before, after);

      case 'systemcategories':
        return displaySystemCategories(configManager, opts, valueonly, before, after);

      default:
        return `<p class="error">Unknown type: ${escapeHtml(type)}. Use 'roles', 'permissions', 'policy-summary', 'user-summary', 'actions', 'manager', 'feature', 'userKeywords', 'systemKeywords', or 'systemCategories'.</p>`;
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `<p class="error">Error accessing configuration: ${escapeHtml(message)}</p>`;
    }
  },

  /**
   * Plugin initialization (JSPWiki-style)
   */
  initialize(_engine: unknown): void {
    // Initialization complete
  }
};

// Export plugin
export default ConfigAccessorPlugin;
