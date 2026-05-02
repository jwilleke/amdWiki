'use strict';

/**
 * ApiContext — Lightweight request context for API route handlers.
 *
 * Parallel to WikiContext (used for page rendering), ApiContext provides a
 * clean, typed, consistent object for addon and core API routes. It replaces
 * scattered access to `req.userContext`, `req.session`, and engine managers.
 *
 * Usage:
 *   import { ApiContext, ApiError } from '../../../src/context/ApiContext';
 *
 *   router.post('/reservations', async (req, res) => {
 *     try {
 *       const ctx = ApiContext.from(req, engine);
 *       ctx.requireAuthenticated();
 *       ctx.requireRole('clubhouse-manager', 'admin');
 *       // ...
 *     } catch (err) {
 *       if (err instanceof ApiError) {
 *         return res.status(err.status).json({ error: err.message });
 *       }
 *       res.status(500).json({ error: String(err) });
 *     }
 *   });
 */

import type { Request } from 'express';
import type { WikiEngine } from '../types/WikiEngine.js';
import type ConfigurationManager from '../managers/ConfigurationManager.js';

// ── ApiError ────────────────────────────────────────────────────────────────

/**
 * Thrown by ApiContext guard methods (requireAuthenticated, requireRole).
 * Route handlers should catch this and forward `status` to `res.status()`.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── ApiContext ───────────────────────────────────────────────────────────────

export class ApiContext {
  /** Reference to the wiki engine */
  readonly engine: WikiEngine;

  /** Whether the caller has an active authenticated session */
  readonly isAuthenticated: boolean;

  /** Caller's username, or null for anonymous */
  readonly username: string | null;

  /** Caller's display name, or null */
  readonly displayName: string | null;

  /** Caller's email address, or null */
  readonly email: string | null;

  /** Caller's assigned roles (always an array, never undefined) */
  readonly roles: string[];

  private constructor(
    engine: WikiEngine,
    isAuthenticated: boolean,
    username: string | null,
    displayName: string | null,
    email: string | null,
    roles: string[]
  ) {
    this.engine = engine;
    this.isAuthenticated = isAuthenticated;
    this.username = username;
    this.displayName = displayName;
    this.email = email;
    this.roles = roles;
  }

  /**
   * Build an ApiContext from an Express request and engine reference.
   *
   * Reads `req.userContext` (set by the session middleware in app.ts) and
   * normalises the values into a fully-typed object. Always succeeds — an
   * unauthenticated request produces a context with `isAuthenticated: false`
   * and an empty/anonymous roles array.
   */
  static from(req: Request, engine: WikiEngine): ApiContext {
    const uc = req.userContext ?? {};
    const isAuthenticated = Boolean(
      (uc as Record<string, unknown>)['isAuthenticated'] ??
      req.session?.isAuthenticated ??
      false
    );

    return new ApiContext(
      engine,
      isAuthenticated,
      (uc.username) ?? null,
      (uc.displayName) ?? null,
      (uc.email) ?? null,
      Array.isArray(uc.roles) ? (uc.roles) : []
    );
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  /**
   * Throws `ApiError(401)` if the caller is not authenticated.
   *
   * @example
   * ctx.requireAuthenticated(); // → 401 if anonymous
   */
  requireAuthenticated(): void {
    if (!this.isAuthenticated) {
      throw new ApiError(401, 'Authentication required');
    }
  }

  /**
   * Returns true if the caller has at least one of the specified roles.
   *
   * @example
   * if (ctx.hasRole('admin', 'clubhouse-manager')) { ... }
   */
  hasRole(...roles: string[]): boolean {
    // eslint-disable-next-line no-restricted-syntax -- canonical role-check implementation
    return roles.some(r => this.roles.includes(r));
  }

  /**
   * Throws `ApiError(403)` if the caller does not have at least one of the
   * specified roles.
   *
   * @example
   * ctx.requireRole('admin', 'clubhouse-manager'); // → 403 if neither role
   */
  requireRole(...roles: string[]): void {
    if (!this.hasRole(...roles)) {
      throw new ApiError(403, 'Forbidden');
    }
  }

  /**
   * Returns true if the caller's already-resolved roles grant the given permission.
   *
   * Reads `ngdpbase.roles.definitions` from ConfigurationManager (in-memory) —
   * no async DB call needed since roles are resolved at session time.
   *
   * @example
   * if (ctx.hasPermission('user-read')) { // include PII fields }
   */
  hasPermission(permission: string): boolean {
    const cm = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!cm) return false;
    const defs = cm.getProperty('ngdpbase.roles.definitions', {}) as Record<string, { permissions?: string[] }>;
    return this.roles.some(role => {
      const roleDef = defs[role];
      return Array.isArray(roleDef?.permissions) && roleDef.permissions.includes(permission);
    });
  }

  /**
   * Throws `ApiError(403)` if the caller's roles do not grant the given permission.
   *
   * @example
   * ctx.requirePermission('search-user'); // → 403 if no role grants it
   */
  requirePermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      throw new ApiError(403, 'Forbidden');
    }
  }
}

