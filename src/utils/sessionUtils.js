// src/utils/sessionUtils.js
const ConfigurationManager = require('../managers/ConfigurationManager');
const UserManager = require('../managers/UserManager');

/**
 * Builds userContext from Express session, using ConfigurationManager for amdwiki.authorizer
 * and UserManager to gather user information.
 * Prepares for future AuthorizationManager.js (JSPWiki-inspired).
 * @param {Object} req - Express request object with session.
 * @returns {Promise<Object>} userContext with user data and roles.
 */
async function buildUserContext(req) {
  const configManager = new ConfigurationManager();
  await configManager.loadConfig();
  const authorizer = configManager.getProperty('amdwiki.authorizer') || 'DefaultAuthorizer';

  const userManager = new UserManager(); // Assuming UserManager is instantiable

  const userId = req.session?.userId || null;
  let userData = {
    username: 'Anonymous',
    displayName: 'Anonymous',
    roles: ['anonymous']
  };

  let isAuth = false;
  if (userId) {
    // Gather user information using UserManager
    const fetchedUser = await userManager.getUser(userId); // Assume method like getUser(userId)
    if (fetchedUser) {
      userData = {
        username: fetchedUser.username || 'Anonymous',
        displayName: fetchedUser.displayName || fetchedUser.username || 'Anonymous',
        roles: Array.isArray(fetchedUser.roles) ? fetchedUser.roles : ['authenticated']
      };
      isAuth = true;
    }
  }

  // Apply authorizer-specific logic (placeholder for AuthorizationManager)
  if (authorizer === 'DefaultAuthorizer') {
    if (userData.username === 'admin') {
      userData.roles.push('admin', 'editor');
    } else if (isAuth) {
      userData.roles.push('editor');
    }
  } // Extend for other authorizers in future

  return {
    isAuthenticated: isAuth,
    roles: [...new Set(userData.roles)], // Remove duplicates
    userId,
    username: userData.username,
    displayName: userData.displayName
  };
}

module.exports = { buildUserContext };