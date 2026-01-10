/**
 * Express type extensions for amdWiki
 * Extends Express Request and Response with custom properties
 */

import 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    username?: string;
    userId?: string;
    user?: unknown;
    isAuthenticated?: boolean;
    roles?: string[];
    [key: string]: unknown;
  }
}

declare global {
  namespace Express {
    interface Request {
      userContext?: {
        username?: string;
        email?: string;
        displayName?: string;
        roles?: string[];
        isSystem?: boolean;
        permissions?: string[];
        [key: string]: unknown;
      };
      sessionID?: string;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};
