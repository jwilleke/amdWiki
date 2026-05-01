/**
 * Storage seam for Organization records (#617)
 *
 * File system is the v1 default; future providers (S3, LDAP, external
 * directory) implement the same interface and register without touching
 * OrganizationManager.
 */

import type { BaseProvider } from './Provider.js';
import type { Organization, OrganizationUpdate } from './Organization.js';

export interface OrganizationProvider extends BaseProvider {
  /** Return all organizations the provider can see. */
  list(): Promise<Organization[]>;

  /** Look up an organization by its `@id` (canonical URL). */
  getById(id: string): Promise<Organization | null>;

  /**
   * Look up an organization by its storage filename.
   *
   * Used by OrganizationManager.getInstallOrg() to resolve the value of
   * `ngdpbase.application.organization.file` to the install's anchor org.
   * Providers that don't store records as discrete files should treat this
   * as an alias lookup or return null.
   */
  getByFile(filename: string): Promise<Organization | null>;

  /**
   * Create a new organization.
   *
   * @param org    Full Organization record. The provider will write it under
   *               a filename derived from `filename` if supplied, or from a
   *               slug of `org.name` otherwise.
   * @param filename  Optional explicit filename (used by install seeding).
   * @returns      The stored organization.
   */
  create(org: Organization, filename?: string): Promise<Organization>;

  /** Apply a partial update by `@id`. Returns the updated record, or null if not found. */
  update(id: string, patch: OrganizationUpdate): Promise<Organization | null>;

  /** Delete by `@id`. Returns true if a record was removed. */
  delete(id: string): Promise<boolean>;
}
