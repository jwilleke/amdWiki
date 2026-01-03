/**
 * Express type extensions for amdWiki
 * Extends Express Request and Response with custom properties
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    username?: string;
    userId?: string;
    user?: any;
    isAuthenticated?: boolean;
    roles?: string[];
    [key: string]: any;
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
        [key: string]: any;
      };
      sessionID?: string;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};
