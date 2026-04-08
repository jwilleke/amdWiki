'use strict';

import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * CalendarEvent — internal storage shape.
 * Field names follow FullCalendar EventInput for UI compatibility.
 * RFC 5545 compliance fields will be added in Phase 2.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  url?: string;
  calendarId?: string;
  color?: string;
  createdBy?: string;
  created: string;
  updated: string;
}

export interface QueryOptions {
  start?: string;
  end?: string;
  calendarId?: string;
}

class CalendarDataManager {
  private dataPath: string;
  private events: Map<string, CalendarEvent>;
  private dataFile: string;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
    this.events = new Map();
    this.dataFile = path.join(dataPath, 'events.json');
  }

  /** Load events from disk. Called once during register(). */
  async load(): Promise<void> {
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }
    if (!existsSync(this.dataFile)) {
      return;
    }
    const raw = await readFile(this.dataFile, 'utf8');
    const arr = JSON.parse(raw) as CalendarEvent[];
    this.events.clear();
    for (const event of arr) {
      if (event.id) {
        this.events.set(String(event.id), event);
      }
    }
  }

  /** Persist events to disk. */
  async save(): Promise<void> {
    const arr = Array.from(this.events.values());
    await writeFile(this.dataFile, JSON.stringify(arr, null, 2), 'utf8');
  }

  /** Total event count. */
  count(): number {
    return this.events.size;
  }

  getById(id: string): CalendarEvent | undefined {
    return this.events.get(String(id));
  }

  /**
   * Return events optionally filtered by date range and/or calendarId.
   * FullCalendar passes `start` and `end` as ISO strings for the visible range.
   */
  query({ start, end, calendarId }: QueryOptions = {}): CalendarEvent[] {
    let results = Array.from(this.events.values());

    if (calendarId) {
      results = results.filter(
        e => (e.calendarId ?? 'default') === calendarId
      );
    }

    if (start ?? end) {
      const rangeStart = start ? new Date(start) : null;
      const rangeEnd   = end   ? new Date(end)   : null;

      results = results.filter(e => {
        const evStart = new Date(e.start);
        const evEnd   = e.end ? new Date(e.end) : evStart;
        if (rangeStart && evEnd < rangeStart) return false;
        if (rangeEnd   && evStart >= rangeEnd) return false;
        return true;
      });
    }

    return results;
  }

  /** Case-insensitive keyword search across title and description. */
  search(query: string): CalendarEvent[] {
    const q = (query ?? '').toLowerCase();
    if (!q) return Array.from(this.events.values());
    return Array.from(this.events.values()).filter(e =>
      (e.title ?? '').toLowerCase().includes(q) ||
      (e.description ?? '').toLowerCase().includes(q)
    );
  }

  /** Create a new event. Assigns a UUID and timestamps. */
  async create(data: Omit<CalendarEvent, 'id' | 'created' | 'updated'>): Promise<CalendarEvent> {
    if (!data.title) throw new Error('title is required');
    if (!data.start) throw new Error('start is required');

    const now = new Date().toISOString();
    const event: CalendarEvent = {
      ...data,
      id: uuidv4(),
      calendarId: data.calendarId ?? 'default',
      allDay: Boolean(data.allDay),
      created: now,
      updated: now
    };
    this.events.set(event.id, event);
    await this.save();
    return event;
  }

  /** Update an existing event (partial update). */
  async update(id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const existing = this.events.get(String(id));
    if (!existing) throw new Error(`Event not found: ${id}`);

    const { id: _id, created: _created, ...safePatch } = patch;

    const updated: CalendarEvent = {
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

  async delete(id: string): Promise<void> {
    if (!this.events.has(String(id))) {
      throw new Error(`Event not found: ${id}`);
    }
    this.events.delete(String(id));
    await this.save();
  }
}

export default CalendarDataManager;
module.exports = CalendarDataManager;
