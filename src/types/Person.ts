/**
 * Schema.org Person type (#617)
 *
 * Canonical core record for a person. Stored as one JSON file per person
 * under `ngdpbase.application.persons.storagedir`. Filename is `<uuid>.json`
 * (where the uuid matches the v4 segment of `@id`).
 *
 * `@id` uses the urn:uuid:<v4> form because persons typically lack a
 * canonical web URL. `identifier` matches `User.username` so existing auth
 * records link cleanly to a Person.
 *
 * No embedded role-records — those live in the future person-contacts
 * addon (#602) and are folded in at JSON-LD export time.
 *
 * @see https://schema.org/Person
 */

import type { PostalAddress, ContactPoint } from './Organization.js';

/**
 * Canonical Person record.
 *
 * Required: `@context`, `@type`, `@id`, `identifier`.
 * Optional fields mirror schema.org Person.
 */
export interface Person {
  '@context': 'https://schema.org';
  '@type': 'Person';
  /** urn:uuid:<v4> */
  '@id': string;
  /** Matches User.username so auth records link to this Person */
  identifier: string;
  /** Display name */
  name?: string;
  /** Given name (first name) */
  givenName?: string;
  /** Family name (last name) */
  familyName?: string;
  /** Email address */
  email?: string;
  /** Postal address */
  address?: PostalAddress;
  /** Contact points (work phone, mobile, etc.) */
  contactPoint?: ContactPoint[];
  /** ISO language tags this person knows */
  knowsLanguage?: string[];
  /** Profile/avatar image URL */
  image?: string;
  /** Other URLs that identify this person (LinkedIn, GitHub, etc.) */
  sameAs?: string[];
  /** Allow extension fields (additionalProperty, etc.) */
  [key: string]: unknown;
}

/**
 * Patch shape for update operations.
 * `@context`/`@type` are immutable; `@id` and `identifier` cannot be changed via update.
 */
export type PersonUpdate = Partial<Omit<Person, '@context' | '@type' | '@id' | 'identifier'>>;
