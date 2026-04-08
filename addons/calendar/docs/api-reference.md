# Calendar Add-on — REST API Reference

Base path: `/api/calendar`

All JSON requests must include `Content-Type: application/json`.
Authentication uses the ngdpbase session cookie (same as the wiki UI).

---

## Events

### GET /api/calendar/events

Return events as a FullCalendar-compatible JSON array.

**Auth**: none for `public` calendars; session required for `authenticated`/`private`.

#### Query parameters

| Param | Description |
|-------|-------------|
| `calendarId` | Filter to a single calendar |
| `start` | ISO 8601 range start (FullCalendar passes this automatically) |
| `end` | ISO 8601 range end |

**Privacy**: `_private` blocks are stripped for callers who are not the event's
requester and do not hold `admin` or `clubhouse-manager`.

**Response** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Annual BBQ",
    "start": "2026-07-04T12:00:00",
    "end":   "2026-07-04T15:00:00",
    "extendedProps": {
      "calendarId":  "events",
      "description": "Annual summer BBQ",
      "status":      "CONFIRMED"
    }
  }
]
```

---

### POST /api/calendar/events

Create a new event on a `managed` calendar.

**Auth**: `admin` or `clubhouse-manager`

#### Request body

| Field | Required | Description |
|-------|----------|-------------|
| `calendarId` | yes | Target calendar ID |
| `title` | yes | Event title |
| `start` | yes | ISO 8601 datetime |
| `end` | no | ISO 8601 datetime |
| `allDay` | no | boolean |
| `description` | no | Free text |
| `location` | no | Venue |
| `color` | no | CSS colour string |
| `status` | no | `CONFIRMED` `TENTATIVE` `CANCELLED` (default: `CONFIRMED`) |
| `url` | no | Link opened on event click |

**Response** `201 Created` — full `FullCalendarEvent` object.

#### Errors

| Code | Reason |
|------|--------|
| `401` | Not authenticated |
| `403` | Missing required role |
| `400` | Missing `title`, `start`, or `calendarId` |

---

### GET /api/calendar/events/search

Keyword search across event titles and descriptions.

**Auth**: none for `public` calendars.

#### Query parameters

| Param | Description |
|-------|-------------|
| `q` | Search string (case-insensitive) |
| `calendarId` | Optional calendar filter |

**Response** `200 OK` — array of `FullCalendarEvent`.

---

### GET /api/calendar/events/:id

Return a single event by UUID.

**Auth**: same visibility rules as the list endpoint.

**Response** `200 OK` — single `FullCalendarEvent`.

**Errors**: `404` if not found.

---

### PUT /api/calendar/events/:id

Partial update of an existing event. Send only the fields to change.
`id`, `created`, and `dtstamp` are protected and ignored in the patch.

**Auth**: `admin` or `clubhouse-manager`

**Response** `200 OK` — updated `FullCalendarEvent`.

**Errors**: `404`, `401`, `403`.

---

### DELETE /api/calendar/events/:id

Delete an event.

**Auth**: `admin` or `clubhouse-manager`

**Response** `204 No Content`

**Errors**: `404`, `401`, `403`.

---

## Reservations

### POST /api/calendar/reservations

Submit a reservation request. The target calendar must have `workflow: reservation`.
Events are stored as `CLASS: CONFIDENTIAL` and are invisible in the public feed.
Email notifications are sent to the requester and the manager.

**Auth**: authenticated (any logged-in user)

#### Request body

| Field | Required | Description |
|-------|----------|-------------|
| `calendarId` | yes | Must be a `reservation`-workflow calendar |
| `title` | yes | Description of the reservation |
| `start` | yes | ISO 8601 datetime |
| `end` | yes | ISO 8601 datetime |
| `description` | no | Additional details |
| `location` | no | Specific area / room |
| `notes` | no | Notes to the manager (stored in `_private`) |

**Response** `201 Created` — `FullCalendarEvent` with `_private` visible to the requester.

#### Errors

| Code | Reason |
|------|--------|
| `400` | Missing required field, or calendar does not accept reservations |
| `401` | Not authenticated |
| `409` | Time slot conflicts with an existing reservation |

---

### DELETE /api/calendar/reservations/:id

Cancel a reservation. The requester may cancel their own; managers and admins
may cancel any reservation.

**Auth**: authenticated

**Response** `204 No Content`

**Errors**: `401`, `403`, `404`.

---

## ICS Feed

### GET /api/calendar/:calendarId/feed.ics

RFC 5545 iCalendar subscription feed for a single calendar. `CONFIDENTIAL` events
are excluded. Subscribe from Apple Calendar, Google Calendar, or any CalDAV client.

**Auth**: none for `public` calendars; session required for `authenticated`/`private`.

**Response** `200 OK` with `Content-Type: text/calendar`

```
BEGIN:VCALENDAR
PRODID:-//ngdpbase//Calendar//EN
VERSION:2.0
BEGIN:VEVENT
UID:550e8400-e29b-41d4-a716-446655440000@ngdpbase
SUMMARY:Annual BBQ
DTSTART:20260704T120000
DTEND:20260704T150000
STATUS:CONFIRMED
CLASS:PUBLIC
END:VEVENT
END:VCALENDAR
```

---

## Admin dashboard

### GET /admin/calendar

Management dashboard rendered as HTML. Shows all enabled calendars; reservation
calendars include `_private` columns. Provides create/edit/delete UI for events.

**Auth**: `admin` or `clubhouse-manager`

**Response** `200 OK` HTML page, or `401` redirect to login.

---

## Common error shape

All error responses use:

```json
{ "error": "Human-readable message" }
```
