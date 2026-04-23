'use strict';

/**
 * FormsPlugin — renders a form inline in a wiki page.
 *
 * Usage:
 *   [{Form id='clubhouse-reservation'}]
 */

import type { PluginContext, PluginParams } from '../../../dist/src/managers/PluginManager';
import type ConfigurationManager from '../../../dist/src/managers/ConfigurationManager';
import type FormsDataManager from '../managers/FormsDataManager';
import type { FormDefinition, FormField } from '../managers/FormsDataManager';

function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderField(field: FormField & { resolvedOptions?: string[] }): string {
  const required = field.required ? ' required' : '';
  const placeholder = field.placeholder ? ` placeholder="${escHtml(field.placeholder)}"` : '';
  const desc = field.description
    ? `<div class="form-text text-muted">${escHtml(field.description)}</div>`
    : '';
  const requiredBadge = field.required ? ' <span class="text-danger">*</span>' : '';

  let control = '';

  if (field.type === 'textarea') {
    control = `<textarea name="${escHtml(field.name)}" class="form-control"${placeholder}${required} rows="4"></textarea>`;
  } else if (field.type === 'dropdown') {
    const opts = (field.resolvedOptions ?? field.options ?? [])
      .map(o => `<option value="${escHtml(o)}">${escHtml(o)}</option>`)
      .join('');
    control = `<select name="${escHtml(field.name)}" class="form-select"${required}><option value="">— select —</option>${opts}</select>`;
  } else if (field.type === 'checkbox') {
    return `<div class="mb-3 form-check">
      <input type="checkbox" name="${escHtml(field.name)}" id="field-${escHtml(field.name)}" class="form-check-input"${required}>
      <label class="form-check-label" for="field-${escHtml(field.name)}">${escHtml(field.label)}${requiredBadge}</label>
      ${desc}
    </div>`;
  } else if (field.type === 'hidden') {
    return `<input type="hidden" name="${escHtml(field.name)}">`;
  } else {
    control = `<input type="${escHtml(field.type)}" name="${escHtml(field.name)}" id="field-${escHtml(field.name)}" class="form-control"${placeholder}${required}>`;
  }

  return `<div class="mb-3">
    <label class="form-label" for="field-${escHtml(field.name)}">${escHtml(field.label)}${requiredBadge}</label>
    ${control}
    ${desc}
  </div>`;
}

type ResolvedField = FormField & { resolvedOptions?: string[] };

function renderFieldset(label: string, fieldsHtml: string): string {
  return `<fieldset class="mb-4 border rounded p-3">
      <legend class="float-none w-auto px-2 fs-6 fw-semibold">${escHtml(label)}</legend>
      ${fieldsHtml}
    </fieldset>`;
}

function renderGroups(resolvedFields: ResolvedField[]): string {
  type Group = { label: string | null; fields: ResolvedField[] };
  const groups: Group[] = [];
  let current: Group = { label: null, fields: [] };

  for (const field of resolvedFields) {
    if (field.type === 'section') {
      if (current.label !== null || current.fields.length > 0) groups.push(current);
      current = { label: field.label, fields: [] };
    } else {
      current.fields.push(field);
    }
  }
  if (current.label !== null || current.fields.length > 0) groups.push(current);

  return groups.map(g => {
    const html = g.fields.map(renderField).join('\n');
    return g.label ? renderFieldset(g.label, html) : html;
  }).join('\n');
}

function renderForm(form: FormDefinition, resolvedFields: ResolvedField[]): string {
  const proxyBlock = form.proxySubmission ? renderFieldset('For Another Occupant', `
      <p class="text-muted small mb-3">Complete this section only if submitting on behalf of another resident. Leave blank if submitting for yourself.</p>
      <div class="mb-3">
        <label class="form-label" for="obo-name">Full Name</label>
        <input type="text" name="onBehalfOf[name]" id="obo-name" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label" for="obo-email">Email</label>
        <input type="email" name="onBehalfOf[email]" id="obo-email" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label" for="obo-phone">Phone</label>
        <input type="tel" name="onBehalfOf[phone]" id="obo-phone" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label" for="obo-address">Unit Address</label>
        <input type="text" name="onBehalfOf[address]" id="obo-address" class="form-control">
      </div>`) : '';

  return `<div class="ngdp-form card shadow-sm" id="form-wrapper-${escHtml(form.id)}">
  <div class="card-body">
    <h4 class="card-title mb-3">${escHtml(form.title)}</h4>
    ${form.description ? `<p class="text-muted mb-3">${escHtml(form.description)}</p>` : ''}
    <div id="form-result-${escHtml(form.id)}"></div>
    <form data-ngdp-form="${escHtml(form.id)}" novalidate>
      ${renderGroups(resolvedFields)}
      ${proxyBlock}
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</div>
<script src="/addons/forms/js/forms-submit.js" defer></script>`;
}

const FormsPlugin = {
  name: 'Form',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const formId = typeof params['id'] === 'string' ? params['id'] : undefined;
    if (!formId) {
      return '<div class="alert alert-warning">Form: missing required parameter <code>id</code></div>';
    }

    const fdm = context.engine.getManager<FormsDataManager>('FormsDataManager');
    if (!fdm) {
      return '<div class="alert alert-danger">Form: FormsDataManager not available</div>';
    }

    const form = fdm.getDefinition(formId);
    if (!form) {
      return `<div class="alert alert-warning">Form: no form found with id <code>${escHtml(formId)}</code></div>`;
    }

    const cm = context.engine.getManager<ConfigurationManager>('ConfigurationManager');

    // Resolve optionsSource for dropdown fields
    const resolvedFields = form.fields.map(field => {
      if (field.type === 'dropdown' && field.optionsSource?.startsWith('config:') && cm) {
        const key = field.optionsSource.slice(7);
        const opts = cm.getProperty(key, []) as string[];
        return { ...field, resolvedOptions: opts };
      }
      return { ...field, resolvedOptions: field.options };
    });

    return renderForm(form, resolvedFields);
  }
};

export default FormsPlugin;
