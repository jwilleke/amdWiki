'use strict';

const express = require('express');

/**
 * API routes for the calendar add-on.
 * Mounted at /api/calendar in register().
 *
 * Endpoints:
 *   GET    /api/calendar/events           — list / FullCalendar feed
 *   POST   /api/calendar/events           — create event
 *   GET    /api/calendar/events/search    — keyword search
 *   GET    /api/calendar/events/:id       — get single event
 *   PUT    /api/calendar/events/:id       — update event (partial)
 *   DELETE /api/calendar/events/:id       — delete event
 *
 * FullCalendar JSON Feed format:
 *   GET /api/calendar/events?start=ISO&end=ISO[&calendarId=name]
 *   Returns an array of event objects (FullCalendar EventInput shape).
 *
 * @param {import('../../../src/types/WikiEngine').WikiEngine} engine
 * @param {Record<string, unknown>} _config
 * @returns {express.Router}
 */
module.exports = function apiRoutes(engine, _config) {
  const router = express.Router();

  // ── GET /api/calendar/events ─────────────────────────────────────────────
  // FullCalendar calls this with ?start=&end= for the visible range.
  router.get('/events', async (req, res) => {
    try {
      const mgr = engine.getManager('CalendarDataManager');
      if (!mgr) {
        res.status(503).json({ error: 'CalendarDataManager not available' });
        return;
      }
      const { start, end, calendarId } = req.query;
      const events = mgr.query({
        start: start ? String(start) : undefined,
        end:   end   ? String(end)   : undefined,
        calendarId: calendarId ? String(calendarId) : undefined
      });
      // Return plain array — FullCalendar expects an array, not { results: [] }
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── GET /api/calendar/events/search?q= ───────────────────────────────────
  router.get('/events/search', async (req, res) => {
    try {
      const mgr = engine.getManager('CalendarDataManager');
      const q = String(req.query.q || '');
      const results = mgr ? mgr.search(q) : [];
      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── POST /api/calendar/events ────────────────────────────────────────────
  router.post('/events', async (req, res) => {
    try {
      const mgr = engine.getManager('CalendarDataManager');
      if (!mgr) {
        res.status(503).json({ error: 'CalendarDataManager not available' });
        return;
      }
      const event = await mgr.create(req.body);
      res.status(201).json(event);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // ── GET /api/calendar/events/:id ─────────────────────────────────────────
  router.get('/events/:id', (req, res) => {
    const mgr = engine.getManager('CalendarDataManager');
    const event = mgr?.getById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(event);
  });

  // ── PUT /api/calendar/events/:id ─────────────────────────────────────────
  router.put('/events/:id', async (req, res) => {
    try {
      const mgr = engine.getManager('CalendarDataManager');
      if (!mgr) {
        res.status(503).json({ error: 'CalendarDataManager not available' });
        return;
      }
      const event = await mgr.update(req.params.id, req.body);
      res.json(event);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = msg.includes('not found') ? 404 : 400;
      res.status(status).json({ error: msg });
    }
  });

  // ── DELETE /api/calendar/events/:id ──────────────────────────────────────
  router.delete('/events/:id', async (req, res) => {
    try {
      const mgr = engine.getManager('CalendarDataManager');
      if (!mgr) {
        res.status(503).json({ error: 'CalendarDataManager not available' });
        return;
      }
      await mgr.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = msg.includes('not found') ? 404 : 400;
      res.status(status).json({ error: msg });
    }
  });

  return router;
};
