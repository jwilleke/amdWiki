/**
 * admin-events.js — real-time admin notifications via SSE + Web Notifications API.
 *
 * Loaded on all admin pages. Connects to GET /admin/events and:
 *   1. Shows a browser Web Notification for each event (if permission granted)
 *   2. Prepends the notification to the System Notifications card on /admin
 *
 * Permission is requested once on first load and remembered by the browser.
 */
(function () {
  'use strict';

  // Only run on admin pages
  if (!window.location.pathname.startsWith('/admin')) return;

  // ── Web Notification permission ─────────────────────────────────────────────

  function requestPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function showWebNotification(title, body, url) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'admin-event-' + Date.now()
    });
    if (url) {
      n.onclick = function () {
        window.focus();
        window.location.href = url;
        n.close();
      };
    }
  }

  // ── Admin dashboard live card update ────────────────────────────────────────

  function prependDashboardNotification(title, message) {
    // Only attempt update on the dashboard page
    const card = document.querySelector('.card .card-body .alert');
    const cardBody = card ? card.closest('.card-body') : document.querySelector('[data-notification-list]');

    // Find the notification list container by looking for the "no notifications" placeholder
    // or the existing alert list under the System Notifications card
    const cardHeaders = document.querySelectorAll('.card-header h5');
    let notifCardBody = null;
    cardHeaders.forEach(h => {
      if (h.textContent && h.textContent.includes('System Notifications')) {
        notifCardBody = h.closest('.card')?.querySelector('.card-body') || null;
      }
    });
    if (!notifCardBody) return;

    // Remove "no notifications" placeholder if present
    const placeholder = notifCardBody.querySelector('.text-center.py-4');
    if (placeholder) placeholder.remove();

    const alertHtml = `
      <div class="alert alert-warning border-0 mb-3 admin-live-notification">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h6 class="alert-heading mb-1">${escHtml(title)}</h6>
            <p class="mb-1">${escHtml(message)}</p>
            <small class="text-muted"><i class="fas fa-clock"></i> Just now</small>
          </div>
        </div>
      </div>`;

    notifCardBody.insertAdjacentHTML('afterbegin', alertHtml);

    // Update badge count
    const badge = notifCardBody.closest('.card')?.querySelector('.card-header .badge');
    if (badge) {
      const current = parseInt(badge.textContent, 10) || 0;
      badge.textContent = String(current + 1);
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── SSE connection ───────────────────────────────────────────────────────────

  function connect() {
    const es = new EventSource('/admin/events');

    es.addEventListener('required-page-modified', function (e) {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }

      const title = 'Required page edited';
      const body = `"${data.title}" was edited by ${data.editor}`;

      showWebNotification(title, body, data.url);
      prependDashboardNotification(title, `${body}. <a href="${escHtml(data.url)}">Review sync →</a>`);
    });

    es.onerror = function () {
      es.close();
      // Reconnect after 15s if the connection drops
      setTimeout(connect, 15_000);
    };
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────────

  requestPermission();
  connect();
})();
