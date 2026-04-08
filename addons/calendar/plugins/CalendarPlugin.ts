'use strict';

import type { PluginContext, PluginParams } from '../../../src/managers/PluginManager';

/**
 * CalendarPlugin — renders a FullCalendar widget into the wiki page body.
 * FullCalendar is loaded from jsDelivr CDN; no local build step required.
 *
 * Usage:
 *   [{Calendar}]
 *   [{Calendar view='timeGridWeek'}]
 *   [{Calendar calendarId='events' height='500' editable='false'}]
 *
 * Parameters:
 *   view        — FullCalendar initial view (default: dayGridMonth)
 *   calendarId  — Filter events to this logical calendar (default: all)
 *   height      — Calendar height in px (default: 650)
 *   editable    — Allow drag-drop/resize (default: true)
 *   weekNumbers — Show week numbers (default: false)
 *   firstDay    — First day of week: 0=Sun, 1=Mon (default: 0)
 *   modal       — Enable create/edit/delete modal for managed calendars (default: false)
 */

const FULLCALENDAR_VERSION = '6.1.15';
const FC_CSS = `https://cdn.jsdelivr.net/npm/fullcalendar@${FULLCALENDAR_VERSION}/index.global.min.css`;
const FC_JS  = `https://cdn.jsdelivr.net/npm/fullcalendar@${FULLCALENDAR_VERSION}/index.global.min.js`;

let instanceCounter = 0;

function escapeAttr(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const CalendarPlugin = {
  name: 'Calendar',

  execute(context: PluginContext, params: PluginParams): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mgr = context.engine?.getManager('CalendarDataManager');
    if (!mgr) {
      return '<span class="plugin-error">Calendar: CalendarDataManager not available</span>';
    }

    const instanceId   = `cal-${++instanceCounter}`;
    const view         = escapeAttr(String(params.view        ?? 'dayGridMonth'));
    const calendarId   = escapeAttr(String(params.calendarId  ?? ''));
    const height       = parseInt(String(params.height ?? '650'), 10) || 650;
    const editable     = params.editable     !== 'false';
    const weekNumbers  = params.weekNumbers  === 'true';
    const firstDay     = parseInt(String(params.firstDay ?? '0'), 10);
    const modalEnabled = params.modal        === 'true' || params.modal === true;

    const eventsUrl = calendarId
      ? `/api/calendar/events?calendarId=${encodeURIComponent(calendarId)}`
      : '/api/calendar/events';

    const loaderHtml = [
      `<link id="fc-css" rel="stylesheet" href="${FC_CSS}">`,
      `<script id="fc-js" src="${FC_JS}"></script>`,
      modalEnabled
        ? '<script src="/addons/calendar/js/calendar-modal.js"></script>'
        : ''
    ].filter(Boolean).join('\n');

    // data-* attributes let calendar-modal.js discover config without inline JS
    const dataAttrs = [
      `data-calendar-id="${calendarId}"`,
      `data-events-url="${eventsUrl}"`,
      `data-modal="${modalEnabled}"`
    ].join(' ');

    return `
${loaderHtml}
<div id="${instanceId}" class="calendar-container" style="min-height:${height}px"
     ${dataAttrs}></div>
<script>
(function () {
  function initCalendar() {
    var el = document.getElementById('${instanceId}');
    if (!el || !window.FullCalendar) return;
    new window.FullCalendar.Calendar(el, {
      initialView: '${view}',
      height: ${height},
      editable: ${editable},
      selectable: ${editable},
      weekNumbers: ${weekNumbers},
      firstDay: ${firstDay},
      headerToolbar: {
        left:   'prev,next today',
        center: 'title',
        right:  'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      events: {
        url: '${eventsUrl}',
        method: 'GET',
        failure: function () {
          el.insertAdjacentHTML('beforeend',
            '<p class="plugin-error">Calendar: could not load events.</p>');
        }
      },
      eventClick: function (info) {
        if (${modalEnabled} && window.calendarModal) {
          info.jsEvent.preventDefault();
          window.calendarModal.openEdit(info.event);
        } else if (info.event.url) {
          info.jsEvent.preventDefault();
          window.location.href = info.event.url;
        }
      },
      dateClick: ${modalEnabled}
        ? 'function (info) { if (window.calendarModal) window.calendarModal.openCreate(info.dateStr, "${calendarId}"); }'
        : 'undefined'
    }).render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
  } else {
    initCalendar();
  }
}());
</script>`.trim();
  }
};

export default CalendarPlugin;
module.exports = CalendarPlugin;
