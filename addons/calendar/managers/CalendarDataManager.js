'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * CalendarDataManager
 *
 * JSON-file-backed store for calendar events.
 * Each event conforms to the FullCalendar EventInput shape plus
 * a few extra fields (description, calendarId, created, updated).
 *
 * @typedef {Object} CalendarEvent
 * @property {string}  id          — UUID
 * @property {string}  title       — Display title
 * @property {string}  start       — ISO 8601 start (date or datetime)
 * @property {string}  [end]       — ISO 8601 end (optional)
 * @property {boolean} [allDay]    — true for all-day events
 * @property {string}  [description]
 * @property {string}  [url]       — Link target when event is clicked
 * @property {string}  [calendarId]— Logical calendar grouping (default: 'default')
 * @property {string}  [color]     — CSS colour override
 * @property {string}  created     — ISO 8601 creation timestamp
 * @property {string}  updated     — ISO 8601 last-modified timestamp
 */

class CalendarDataManager {
  /**
   * @param {string} dataPath  Path to the add-on's data directory
   */
  constructor(dataPath) {
    this.dataPath = dataPath;
    /** @type {Map<string, CalendarEvent>} */
    this.events = new Map();
    this.dataFile = path.join(dataPath, 'events.json');
  }

  /**
   * Load events from disk. Called once during register().
   */
  async load() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    if (!fs.existsSync(this.dataFile)) {
      return; // Start empty — no file yet
    }
    const raw = fs.readFileSync(this.dataFile, 'utf8');
    const arr = JSON.parse(raw);
    this.events.clear();
    for (const event of arr) {
      if (event.id) {
        this.events.set(String(event.id), event);
      }
    }
  }

  /**
   * Persist events to disk.
   */
  async save() {
    const arr = Array.from(this.events.values());
    fs.writeFileSync(this.dataFile, JSON.stringify(arr, null, 2), 'utf8');
  }

  /** @returns {number} Total event count */
  count() {
    return this.events.size;
  }

  /**
   * @param {string} id
   * @returns {CalendarEvent | undefined}
   */
  getById(id) {
    return this.events.get(String(id));
  }

  /**
   * Return events optionally filtered by date range and/or calendarId.
   *
   * FullCalendar passes `start` and `end` as ISO strings when fetching
   * events from a JSON feed URL.
   *
   * @param {{ start?: string, end?: string, calendarId?: string }} opts
   * @returns {CalendarEvent[]}
   */
  query({ start, end, calendarId } = {}) {
    let results = Array.from(this.events.values());

    if (calendarId) {
      results = results.filter(
        e => (e.calendarId || 'default') === calendarId
      );
    }

    if (start || end) {
      const rangeStart = start ? new Date(start) : null;
      const rangeEnd = end ? new Date(end) : null;

      results = results.filter(e => {
        const evStart = new Date(e.start);
        const evEnd = e.end ? new Date(e.end) : evStart;
        if (rangeStart && evEnd < rangeStart) return false;
        if (rangeEnd && evStart >= rangeEnd) return false;
        return true;
      });
    }

    return results;
  }

  /**
   * Case-insensitive keyword search across title and description.
   * @param {string} query
   * @returns {CalendarEvent[]}
   */
  search(query) {
    const q = (query || '').toLowerCase();
    if (!q) return Array.from(this.events.values());
    return Array.from(this.events.values()).filter(e => {
      return (
        (e.title || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
      );
    });
  }

  /**
   * Create a new event. Assigns a UUID and timestamps.
   * @param {Omit<CalendarEvent, 'id' | 'created' | 'updated'>} data
   * @returns {Promise<CalendarEvent>}
   */
  async create(data) {
    if (!data.title) throw new Error('title is required');
    if (!data.start) throw new Error('start is required');

    const now = new Date().toISOString();
    const event = {
      ...data,
      id: uuidv4(),
      calendarId: data.calendarId || 'default',
      allDay: Boolean(data.allDay),
      created: now,
      updated: now
    };
    this.events.set(event.id, event);
    await this.save();
    return event;
  }

  /**
   * Update an existing event (partial update).
   * @param {string} id
   * @param {Partial<CalendarEvent>} patch
   * @returns {Promise<CalendarEvent>}
   */
  async update(id, patch) {
    const existing = this.events.get(String(id));
    if (!existing) throw new Error(`Event not found: ${id}`);

    // Protect immutable fields
    const { id: _id, created: _created, ...safePatch } = patch;

    const updated = {
      ...existing,
      ...safePatch,
      id: existing.id,
      created: existing.created,
      updated: new Date().toISOString()
    };
    this.events.set(updated.id, updated);
    await this.save();
    return updated;
  }

  /**
   * @param {string} id
   */
  async delete(id) {
    if (!this.events.has(String(id))) {
      throw new Error(`Event not found: ${id}`);
    }
    this.events.delete(String(id));
    await this.save();
  }
}

module.exports = CalendarDataManager;
