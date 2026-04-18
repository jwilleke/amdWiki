'use strict';

import type { WikiEngine } from '../../../dist/src/types/WikiEngine';
import type PageManager from '../../../dist/src/managers/PageManager';
import type RenderingManager from '../../../dist/src/managers/RenderingManager';

function formatLeftMenuContent(content: string): string {
  content = content.replace(/<ul>/g, '<ul class="nav flex-column">');
  content = content.replace(/<li>/g, '<li class="nav-item">');
  content = content.replace(/<a href="([^"]*)">/g, '<a class="nav-link" href="$1">');
  content = content.replace(/(<a class="nav-link"[^>]*>)Main page/g, '$1<i class="fas fa-home"></i> Main page');
  content = content.replace(/(<a class="nav-link"[^>]*>)About/g, '$1<i class="fas fa-info-circle"></i> About');
  content = content.replace(/(<a class="nav-link"[^>]*>)Find pages/g, '$1<i class="fas fa-search"></i> Find pages');
  content = content.replace(/(<a class="nav-link"[^>]*>)Search/g, '$1<i class="fas fa-search"></i> Search');
  content = content.replace(/(<a class="nav-link"[^>]*>)News/g, '$1<i class="fas fa-newspaper"></i> News');
  content = content.replace(/(<a class="nav-link"[^>]*>)Recent Changes/g, '$1<i class="fas fa-history"></i> Recent Changes');
  content = content.replace(/(<a class="nav-link"[^>]*>)Page Index/g, '$1<i class="fas fa-list"></i> Page Index');
  content = content.replace(/(<a class="nav-link"[^>]*>)SystemInfo/g, '$1<i class="fas fa-server"></i> SystemInfo');
  return content;
}

export async function getLeftMenu(
  engine: WikiEngine,
  userContext: import('../../../dist/src/context/WikiContext').UserContext | null
): Promise<string | null> {
  try {
    const pm = engine.getManager<PageManager>('PageManager');
    const rm = engine.getManager<RenderingManager>('RenderingManager');
    if (!pm || !rm) return null;

    const page = await pm.getPage('LeftMenu');
    if (!page) {
      engine.logger?.warn('[LeftMenu] LeftMenu page not found — sidebar will be empty.');
      return null;
    }

    const rendered = await rm.renderMarkdown(page.content ?? '', 'LeftMenu', userContext, null);
    return formatLeftMenuContent(rendered);
  } catch {
    return null;
  }
}
