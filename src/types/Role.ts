/**
 * Schema.org OrganizationRole type (#617 follow-up)
 *
 * Canonical core record for an (organization, role) binding. Stored as one
 * JSON file per `(organization, namedPosition)` pair under
 * `ngdpbase.application.roles.storagedir`. Filename is `<namedPosition>.json`.
 *
 * `@id` uses URL form, hierarchical under the organization's URL space:
 *   `<org-url>/roles/<namedPosition>#role`
 *
 * Snapshot semantics: at create time, the role catalog at
 * `ngdpbase.roles.definitions[namedPosition]` is the template — `roleName`,
 * `description`, `issystem`, `icon`, `color`, and the `permissions` list (via
 * `additionalProperty`) get copied into the record. Later catalog edits do
 * NOT retroactively rewrite existing role files. Per-record overrides via
 * `additionalProperty[]` are first-class.
 *
 * @see https://schema.org/OrganizationRole
 */

import type { Person } from './Person.js';
import type { Organization } from './Organization.js';

/**
 * Reference to another JSON-LD entity by `@id`.
 */
export interface IdRef {
  '@id': string;
}

/**
 * Property-value pair used for schema.org `additionalProperty`. Permissions
 * are carried here as `{ name: 'permissions', value: ['page-read', ...] }`.
 */
export interface PropertyValue {
  '@type': 'PropertyValue';
  name: string;
  value: unknown;
}

/**
 * Canonical OrganizationRole record.
 *
 * Required: `@context`, `@type`, `@id`, `namedPosition`, `organization`.
 * Optional fields mirror schema.org OrganizationRole + the snapshot fields
 * copied from the role catalog at create time.
 */
export interface Role {
  '@context': 'https://schema.org';
  '@type': 'OrganizationRole';
  /** URL form: `<org-url>/roles/<namedPosition>#role` */
  '@id': string;
  /** Catalog key into `ngdpbase.roles.definitions` (e.g. 'admin', 'editor'). */
  namedPosition: string;
  /** Reference to the owning Organization by its `@id`. */
  organization: IdRef;
  /** Persons holding this role. References by Person `@id`. */
  member?: IdRef[];

  /** Snapshot from catalog: human-readable role label. */
  roleName?: string;
  /** Snapshot from catalog: short description. */
  description?: string;
  /** Snapshot from catalog: built-in role flag. */
  issystem?: boolean;
  /** Snapshot from catalog: Font Awesome icon name. */
  icon?: string;
  /** Snapshot from catalog: hex color. */
  color?: string;

  /**
   * PropertyValue array; canonically carries `permissions` as a snapshot
   * from `ngdpbase.roles.definitions[namedPosition].permissions`. Per-record
   * overrides land here too.
   */
  additionalProperty?: PropertyValue[];

  /** Allow extension fields (forwards-compat). */
  [key: string]: unknown;
}

/**
 * Patch shape for update operations.
 * `@context`/`@type`/`@id` are immutable; `namedPosition` and `organization`
 * are the natural key for the file's location and cannot be changed via update.
 */
export type RoleUpdate = Partial<
  Omit<Role, '@context' | '@type' | '@id' | 'namedPosition' | 'organization'>
>;

/**
 * Helpers used by callers when wiring Person/Organization references into
 * Role records. Re-exported so tests can shape fixtures without touching
 * the underlying types.
 */
export type RoleMemberRef = IdRef;
export type RoleOrganizationRef = IdRef;

/** Type guard — narrows a Person to its `@id`. */
export function personIdRef(person: Pick<Person, '@id'>): IdRef {
  return { '@id': person['@id'] };
}

/** Type guard — narrows an Organization to its `@id`. */
export function organizationIdRef(org: Pick<Organization, '@id'>): IdRef {
  return { '@id': org['@id'] };
}
