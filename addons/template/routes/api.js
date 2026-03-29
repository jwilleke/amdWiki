'use strict';

const express = require('express');

/**
 * API routes for the template add-on.
 * Mounted at /api/template in register().
 *
 * @param {import('../../../src/types/WikiEngine').WikiEngine} engine
 * @param {Record<string, unknown>} _config
 * @returns {express.Router}
 */
module.exports = function apiRoutes(engine, _config) {
  const router = express.Router();

  // GET /api/template/search?q=...
  router.get('/search', async (req, res) => {
    try {
      const mgr = engine.getManager('TemplateDataManager');
      const q = String(req.query.q || '');
      const results = mgr ? mgr.search(q) : [];
      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // GET /api/template/:id
  router.get('/:id', (req, res) => {
    const mgr = engine.getManager('TemplateDataManager');
    const record = mgr?.getById(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(record);
  });

  return router;
};
