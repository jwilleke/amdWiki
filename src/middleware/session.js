const logger = require('../utils/logger');

/**
 * Custom session middleware that uses the UserManager to load session state.
 * @param {object} engine - The fully initialized WikiEngine instance.
 */
function sessionMiddleware(engine) {
  return async (req, res, next) => {
    const userManager = engine.getManager('UserManager');
    if (!userManager) {
      logger.error('[SESSION] UserManager not available.');
      req.userContext = userManager.getAnonymousUser(); // Fallback to anonymous
      return next();
    }

    const sessionId = req.cookies.sessionId;
    console.log('[SESSION-DEBUG] Cookie sessionId:', sessionId);

    if (sessionId) {
      const session = await userManager.getSession(sessionId);
      console.log('[SESSION-DEBUG] Retrieved session:', session ? `user=${session.username}` : 'null');

      if (session && session.username) {
        // Attach the full user context from the session to the request
        req.userContext = await userManager.getCurrentUser(session.username);
        logger.info(`[SESSION] Restored session for user: ${req.userContext.username}`);
      } else {
        // Invalid session ID, treat as anonymous
        console.log('[SESSION-DEBUG] Invalid session, clearing cookie');
        req.userContext = userManager.getAnonymousUser();
        res.clearCookie('sessionId');
      }
    } else {
      // No session ID, treat as anonymous
      console.log('[SESSION-DEBUG] No sessionId cookie found');
      req.userContext = userManager.getAnonymousUser();
    }

    next();
  };
}

module.exports = sessionMiddleware;