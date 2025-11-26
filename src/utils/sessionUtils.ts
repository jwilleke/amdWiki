// src/utils/sessionUtils.ts
const ConfigurationManager = require('../managers/ConfigurationManager');
const UserManager = require('../managers/UserManager');
import { Request } from 'express';

/**
 * Express session data
 */
interface SessionData {
  userId?: string;
}

/**
 * Express Request with session
 */
interface RequestWithSession extends Request {
  session?: SessionData;
}

/**
 * User context returned by buildUserContext
 */
export interface UserContext {
  isAuthenticated: boolean;
  roles: string[];
  userId: string | null;
  username: string;
  displayName: string;
}

/**
 * User data structure
 */
interface UserData {
  username: string;
  displayName: string;
  roles: string[];
}

/**
 * Builds userContext from Express session, using ConfigurationManager for amdwiki.authorizer
 * and UserManager to gather user information.
 * Prepares for future AuthorizationManager.js (JSPWiki-inspired).
 *
 * @param req - Express request object with session
 * @returns userContext with user data and roles
 */
export async function buildUserContext(req: RequestWithSession): Promise<UserContext> {
  const configManager = new ConfigurationManager();
  const authorizer = configManager.getProperty?.('amdwiki.authorizer') || 'DefaultAuthorizer';

  const userManager = new UserManager();

  const userId = req.session?.userId || null;
  let userData: UserData = {
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
