 
 
// src/utils/sessionUtils.ts
import ConfigurationManager from '../managers/ConfigurationManager';
import UserManager from '../managers/UserManager';
import type { WikiEngine } from '../types/WikiEngine';
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
interface RequestWithSession extends Omit<Request, 'session'> {
  session?: SessionData & { destroy?: (callback?: (err?: Error) => void) => void };
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
  // Note: These managers are instantiated without a full engine context
  // They work for basic property access and user lookup operations
  const configManager = new ConfigurationManager(null as unknown as WikiEngine);
  const rawAuthorizer = configManager.getProperty?.('amdwiki.authorizer');
  const authorizer = typeof rawAuthorizer === 'string' ? rawAuthorizer : 'DefaultAuthorizer';

  const userManager = new UserManager(null as unknown as WikiEngine);

  const userId = req.session?.userId || null;
  let userData: UserData = {
    username: 'Anonymous',
    displayName: 'Anonymous',
    roles: ['anonymous']
  };

  let isAuth = false;
  if (userId) {
    // Gather user information using UserManager
    const fetchedUser = await userManager.getUser(userId) as { username?: string; displayName?: string; roles?: string[] } | null;
    if (fetchedUser) {
      userData = {
        username: String(fetchedUser.username || 'Anonymous'),
        displayName: String(fetchedUser.displayName || fetchedUser.username || 'Anonymous'),
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
