/* global window, document */
(() => {
  const EVEN_CLASS = 'zebra-even';
  const ODD_CLASS = 'zebra-odd';
  const HOVER_CLASS = 'zebra-hover';

  function shouldSkip(row) {
    return row.classList.contains('no-zebra') || row.closest('table')?.dataset?.zebra === 'off';
  }

  function resetRow(row) {
    row.classList.remove(EVEN_CLASS, ODD_CLASS, HOVER_CLASS);
    row.removeEventListener('mouseenter', row._zebraEnter);
    row.removeEventListener('mouseleave', row._zebraLeave);
    delete row._zebraEnter;
    delete row._zebraLeave;
  }

  function decorateRow(row, isEven) {
    const enter = () => row.classList.add(HOVER_CLASS);
    const leave = () => row.classList.remove(HOVER_CLASS);

    row.classList.add(isEven ? EVEN_CLASS : ODD_CLASS);
    row._zebraEnter = enter;
    row._zebraLeave = leave;
    row.addEventListener('mouseenter', enter);
    row.addEventListener('mouseleave', leave);
  }

  function apply(table) {
    const bodies = table.tBodies.length ? Array.from(table.tBodies) : [table];
    bodies.forEach(tbody => {
      const rows = Array.from(tbody.rows);
      let visibleIndex = 0;

      rows.forEach(row => {
        resetRow(row);
        if (shouldSkip(row) || row.hidden || row.offsetParent === null) {
          return;
        }
        decorateRow(row, visibleIndex % 2 === 0);
        visibleIndex += 1;
      });
    });
  }

  function collectTables(root) {
    return Array.from(
      root.querySelectorAll('table.wikitable, table.zebra, table.zebra-table, table[data-zebra], table.table-striped')
    );
  }

  function init(root = document) {
    collectTables(root).forEach(table => {
      if (table.dataset.zebraInitialized === 'true') {
        apply(table);
        return;
      }

      table.dataset.zebraInitialized = 'true';
      apply(table);

      // Only watch for structural changes, not class/style changes
      const observer = new MutationObserver((mutations) => {
        // Only reapply if rows were added/removed or display changed
        const shouldReapply = mutations.some(mut =>
          mut.type === 'childList' ||
          (mut.type === 'attributes' && (mut.attributeName === 'hidden' || mut.attributeName === 'style'))
        );
        if (shouldReapply) {
          apply(table);
        }
      });
      observer.observe(table, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['hidden', 'style'] // Only watch these attributes
      });
      table._zebraObserver = observer;
    });
  }

  function refresh(root = document) {
    collectTables(root).forEach(apply);
  }

  window.ZebraTable = { init, refresh };

  document.addEventListener('DOMContentLoaded', () => init());
})();