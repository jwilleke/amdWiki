'use strict';

/**
 * CalendarConfig — per-calendar configuration shape.
 *
 * Defined in app-custom-config.json under ngdpbase.addons.calendar.calendars:
 *
 *   "calendars": {
 *     "clubhouse":    { "workflow": "reservation", "visibility": "public",        "enabled": true },
 *     "tennis-court": { "workflow": "reservation", "visibility": "authenticated", "enabled": true },
 *     "events":       { "workflow": "managed",     "visibility": "public",        "enabled": true }
 *   }
 *
 * workflow:
 *   "reservation" — members submit requests; manager approves; CLASS: CONFIDENTIAL
 *   "managed"     — admin/clubhouse-manager create/edit/delete events
 *
 * visibility:
 *   "public"        — anyone can view events
 *   "authenticated" — must be logged in to view
 *   "private"       — admin/clubhouse-manager only
 *
 * Maps to RFC 5545:
 *   workflow=reservation  → CLASS: CONFIDENTIAL, TRANSP: OPAQUE
 *   visibility=private    → CLASS: PRIVATE
 */
export interface CalendarConfig {
  /** Whether this calendar is active. */
  enabled?: boolean;

  /**
   * Reservation calendars accept member-submitted bookings (with conflict detection).
   * Managed calendars are populated by admins/clubhouse-managers.
   */
  workflow: 'reservation' | 'managed';

  /**
   * Who can view events on this calendar.
   * public: anonymous, authenticated: logged-in users, private: privileged roles only.
   */
  visibility: 'public' | 'authenticated' | 'private';
}

export default CalendarConfig;
