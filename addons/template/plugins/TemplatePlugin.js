'use strict';

/**
 * TemplatePlugin
 *
 * Renders a data record from TemplateDataManager into the page body.
 *
 * Usage in wiki markup:
 *   [{Template id='42'}]
 *   [{Template id='42' style='compact'}]
 *
 * @type {import('../../../src/managers/PluginManager').PluginObject}
 */
module.exports = {
  name: 'Template',

  /**
   * @param {{ engine: import('../../../src/types/WikiEngine').WikiEngine, pageName: string }} context
   * @param {{ id?: string, style?: string }} params
   * @returns {string}  HTML fragment
   */
  execute(context, params) {
    const id = params.id || '';
    if (!id) {
      return '<span class="plugin-error">Template: id parameter is required</span>';
    }

    const mgr = context.engine.getManager('TemplateDataManager');
    if (!mgr) {
      return '<span class="plugin-error">Template: TemplateDataManager not available</span>';
    }

    const record = mgr.getById(id);
    if (!record) {
      return `<span class="plugin-error">Template: record not found (id=${id})</span>`;
    }

    const style = params.style || 'default';

    if (style === 'compact') {
      return `<span class="template-inline">${escapeHtml(String(record.name || id))}</span>`;
    }

    // Default: simple card
    return `
<div class="template-card">
  <div class="template-card-title">${escapeHtml(String(record.name || id))}</div>
  ${record.description
    ? `<div class="template-card-body">${escapeHtml(String(record.description))}</div>`
    : ''}
</div>`.trim();
  }
};

/** @param {string} str */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
