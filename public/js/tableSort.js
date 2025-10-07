/* global window, document */
/**
 * TableSort - JSPWiki-style sortable tables
 * Supports %%sortable and %%table-sort styles
 */
(() => {
  const SORT_ASC_CLASS = 'sort-asc';
  const SORT_DESC_CLASS = 'sort-desc';
  const SORTABLE_CLASS = 'sortable';

  /**
   * Natural sort comparison for mixed alphanumeric content
   */
  function naturalCompare(a, b) {
    const ax = [];
    const bx = [];

    a.replace(/(\d+)|(\D+)/g, (_, num, str) => {
      ax.push([num || Infinity, str || '']);
    });
    b.replace(/(\d+)|(\D+)/g, (_, num, str) => {
      bx.push([num || Infinity, str || '']);
    });

    while (ax.length && bx.length) {
      const an = ax.shift();
      const bn = bx.shift();
      const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
      if (nn) return nn;
    }

    return ax.length - bx.length;
  }

  /**
   * Extract sortable value from cell
   */
  function getCellValue(cell) {
    // Check for data-sort attribute first
    if (cell.hasAttribute('data-sort')) {
      return cell.getAttribute('data-sort');
    }

    // Get text content, strip HTML
    const text = cell.textContent || cell.innerText || '';
    return text.trim();
  }

  /**
   * Determine sort type from column values
   */
  function detectSortType(rows, columnIndex) {
    let numCount = 0;
    let dateCount = 0;
    const sampleSize = Math.min(rows.length, 10);

    for (let i = 0; i < sampleSize; i++) {
      const cell = rows[i].cells[columnIndex];
      if (!cell) continue;

      const value = getCellValue(cell);

      // Check if numeric
      if (!isNaN(value) && value !== '') {
        numCount++;
      }

      // Check if date
      const date = Date.parse(value);
      if (!isNaN(date)) {
        dateCount++;
      }
    }

    if (numCount > sampleSize * 0.7) return 'number';
    if (dateCount > sampleSize * 0.7) return 'date';
    return 'text';
  }

  /**
   * Compare function factory
   */
  function getCompareFunction(sortType, ascending) {
    const direction = ascending ? 1 : -1;

    return (rowA, rowB, columnIndex) => {
      const cellA = rowA.cells[columnIndex];
      const cellB = rowB.cells[columnIndex];

      if (!cellA || !cellB) return 0;

      const valueA = getCellValue(cellA);
      const valueB = getCellValue(cellB);

      if (sortType === 'number') {
        const numA = parseFloat(valueA) || 0;
        const numB = parseFloat(valueB) || 0;
        return (numA - numB) * direction;
      }

      if (sortType === 'date') {
        const dateA = Date.parse(valueA) || 0;
        const dateB = Date.parse(valueB) || 0;
        return (dateA - dateB) * direction;
      }

      // Text comparison with natural sort
      return naturalCompare(valueA, valueB) * direction;
    };
  }

  /**
   * Sort table by column
   */
  function sortTable(table, columnIndex, forceDirection = null) {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    const rows = Array.from(tbody.rows);
    if (rows.length === 0) return;

    // Get current sort state
    const headers = Array.from(table.querySelectorAll('th'));
    const header = headers[columnIndex];
    if (!header) return;

    // Determine sort direction
    let ascending = true;
    if (forceDirection !== null) {
      ascending = forceDirection;
    } else if (header.classList.contains(SORT_ASC_CLASS)) {
      ascending = false;
    } else if (header.classList.contains(SORT_DESC_CLASS)) {
      ascending = true;
    }

    // Clear all sort indicators
    headers.forEach(h => {
      h.classList.remove(SORT_ASC_CLASS, SORT_DESC_CLASS);
    });

    // Add sort indicator to current column
    header.classList.add(ascending ? SORT_ASC_CLASS : SORT_DESC_CLASS);

    // Detect sort type
    const sortType = detectSortType(rows, columnIndex);

    // Sort rows
    const compareFunction = getCompareFunction(sortType, ascending);
    rows.sort((a, b) => compareFunction(a, b, columnIndex));

    // Reattach rows in sorted order
    rows.forEach(row => tbody.appendChild(row));

    // Trigger zebra table refresh if available
    if (window.ZebraTable && window.ZebraTable.refresh) {
      window.ZebraTable.refresh(table);
    }

    // Store sort state
    table.dataset.sortColumn = columnIndex;
    table.dataset.sortDirection = ascending ? 'asc' : 'desc';
  }

  /**
   * Make table sortable
   */
  function makeSortable(table) {
    if (table.dataset.sortableInitialized === 'true') {
      return;
    }

    // Find header row
    const thead = table.tHead;
    if (!thead) return;

    const headerRow = thead.rows[0];
    if (!headerRow) return;

    // Add click handlers to headers
    Array.from(headerRow.cells).forEach((header, index) => {
      // Skip if header has no-sort class
      if (header.classList.contains('no-sort')) {
        return;
      }

      header.style.cursor = 'pointer';
      header.style.userSelect = 'none';

      header.addEventListener('click', () => {
        sortTable(table, index);
      });
    });

    table.classList.add(SORTABLE_CLASS);
    table.dataset.sortableInitialized = 'true';

    // Auto-sort if data-sort-column is set
    if (table.dataset.sortColumn) {
      const columnIndex = parseInt(table.dataset.sortColumn, 10);
      const direction = table.dataset.sortDirection === 'desc' ? false : true;
      sortTable(table, columnIndex, direction);
    }
  }

  /**
   * Collect sortable tables
   */
  function collectTables(root) {
    return Array.from(
      root.querySelectorAll('table.sortable, table.table-sort, table[data-sortable]')
    );
  }

  /**
   * Initialize sortable tables
   */
  function init(root = document) {
    collectTables(root).forEach(makeSortable);
  }

  /**
   * Refresh sortable tables (re-sort if already sorted)
   */
  function refresh(root = document) {
    collectTables(root).forEach(table => {
      if (table.dataset.sortableInitialized === 'true' && table.dataset.sortColumn) {
        const columnIndex = parseInt(table.dataset.sortColumn, 10);
        const direction = table.dataset.sortDirection === 'desc' ? false : true;
        sortTable(table, columnIndex, direction);
      }
    });
  }

  // Export API
  window.TableSort = { init, refresh, sortTable };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
})();
