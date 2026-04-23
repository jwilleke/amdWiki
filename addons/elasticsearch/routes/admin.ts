
/**
 * Admin routes for the elasticsearch add-on.
 * Mounted at /addons/elasticsearch in register().
 *
 * Endpoints:
 *   GET  /addons/elasticsearch  — connection status and config summary
 */

import { Router, type Request, type Response } from 'express';
import { ApiContext, ApiError } from '../../../dist/src/context/ApiContext.js';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine.js';
import type { Sist2AssetProvider } from '../src/Sist2AssetProvider.js';

export interface ElasticsearchAdminConfig {
  esUrl: string;
  esIndex: string;
  sist2Url: string;
  indexIds: number[];
  hiddenPaths: string[] | null;
}

export default function adminRoutes(
  engine: WikiEngine,
  getProvider: () => Sist2AssetProvider | null,
  config: ElasticsearchAdminConfig
): Router {
  const router = Router();

  // ── GET /addons/elasticsearch ─────────────────────────────────────────────
  router.get('/', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();
        ctx.requireRole('admin');

        const p = getProvider();
        const healthy = p ? await p.healthCheck() : false;
        const message = p
          ? (healthy ? 'sist2 reachable' : 'sist2 unreachable — check es-url / sist2-url config')
          : 'Provider not initialised';

        res.render('admin-elasticsearch', {
          currentUser: req.userContext,
          healthy,
          message,
          config
        });
      } catch (err) {
        if (err instanceof ApiError) { res.status(err.status).send(err.message); return; }
        res.status(500).send(String(err));
      }
    })();
  });

  return router;
}
