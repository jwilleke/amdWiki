/**
 * Express type extensions for amdWiki
 * Extends Express Request and Response with custom properties
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Import needed for module augmentation
import 'express';

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
    }

    interface SessionData {
      username?: string;
      userId?: string;
      roles?: string[];
      [key: string]: any;
    }
  }
}

export {};
