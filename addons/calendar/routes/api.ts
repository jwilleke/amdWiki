'use strict';

import { Router, type Request, type Response } from 'express';
import type { WikiEngine } from '../../../src/types/WikiEngine';
import type CalendarDataManager from '../managers/CalendarDataManager';

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
 */
export default function apiRoutes(engine: WikiEngine, _config: Record<string, unknown>): Router {
  const router = Router();

  function mgr(): CalendarDataManager | undefined {
    return engine.getManager<CalendarDataManager>('CalendarDataManager');
  }

  /** Safely extract a scalar string from req.query — discards arrays/objects. */
  function qs(v: unknown): string | undefined {
    return typeof v === 'string' ? v : undefined;
  }

  // ── GET /api/calendar/events ─────────────────────────────────────────────
  router.get('/events', (req: Request, res: Response) => {
    try {
      const m = mgr();
      if (!m) { res.status(503).json({ error: 'CalendarDataManager not available' }); return; }
      const events = m.query({
        start:      qs(req.query['start']),
        end:        qs(req.query['end']),
        calendarId: qs(req.query['calendarId'])
      });
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── GET /api/calendar/events/search?q= ───────────────────────────────────
  router.get('/events/search', (req: Request, res: Response) => {
    try {
      const m = mgr();
      const q = qs(req.query['q']) ?? '';
      const results = m ? m.search(q) : [];
      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── POST /api/calendar/events ────────────────────────────────────────────
  router.post('/events', async (req: Request, res: Response) => {
    try {
      const m = mgr();
      if (!m) { res.status(503).json({ error: 'CalendarDataManager not available' }); return; }
      const event = await m.create(req.body as Parameters<typeof m.create>[0]);
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── GET /api/calendar/events/:id ─────────────────────────────────────────
  router.get('/events/:id', (req: Request, res: Response) => {
    const id = String(req.params['id']);
    const event = mgr()?.getById(id);
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json(event);
  });

  // ── PUT /api/calendar/events/:id ─────────────────────────────────────────
  router.put('/events/:id', async (req: Request, res: Response) => {
    try {
      const m = mgr();
      if (!m) { res.status(503).json({ error: 'CalendarDataManager not available' }); return; }
      const event = await m.update(String(req.params['id']), req.body as Parameters<typeof m.update>[1]);
      res.json(event);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 400).json({ error: msg });
    }
  });

  // ── DELETE /api/calendar/events/:id ──────────────────────────────────────
  router.delete('/events/:id', async (req: Request, res: Response) => {
    try {
      const m = mgr();
      if (!m) { res.status(503).json({ error: 'CalendarDataManager not available' }); return; }
      await m.delete(String(req.params['id']));
      res.status(204).end();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 400).json({ error: msg });
    }
  });

  return router;
}

module.exports = apiRoutes;
