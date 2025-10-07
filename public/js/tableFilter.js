/* global window, document */
/**
 * TableFilter - JSPWiki-style filterable tables
 * Supports %%table-filter style
 */
(() => {
  const FILTER_CLASS = 'table-filter';
  const FILTER_ROW_CLASS = 'table-filter-row';
  const FILTER_INPUT_CLASS = 'table-filter-input';
  const FILTERED_OUT_CLASS = 'filtered-out';

  /**
   * Create filter input for a column
   */
  function createFilterInput(columnIndex, placeholder = '') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = `${FILTER_INPUT_CLASS} form-control form-control-sm`;
    input.placeholder = placeholder || `Filter...`;
    input.dataset.columnIndex = columnIndex;
    return input;
  }

  /**
   * Create filter row with inputs for each column
   */
  function createFilterRow(table) {
    const thead = table.tHead;
    if (!thead) return null;

    const headerRow = thead.rows[0];
    if (!headerRow) return null;

    // Check if filter row already exists
    const existingFilterRow = thead.querySelector(`.${FILTER_ROW_CLASS}`);
    if (existingFilterRow) {
      return existingFilterRow;
    }

    // Create new filter row
    const filterRow = document.createElement('tr');
    filterRow.className = FILTER_ROW_CLASS;

    Array.from(headerRow.cells).forEach((header, index) => {
      const filterCell = document.createElement('th');

      // Skip filter for no-filter columns
      if (header.classList.contains('no-filter')) {
        filterCell.innerHTML = '&nbsp;';
      } else {
        const input = createFilterInput(index, `Filter ${header.textContent.trim()}`);
        filterCell.appendChild(input);
      }

      filterRow.appendChild(filterCell);
    });

    // Insert filter row after header row
    if (headerRow.nextSibling) {
      thead.insertBefore(filterRow, headerRow.nextSibling);
    } else {
      thead.appendChild(filterRow);
    }

    return filterRow;
  }

  /**
   * Get cell value for filtering
   */
  function getCellValue(cell) {
    // Check for data-filter attribute first
    if (cell.hasAttribute('data-filter')) {
      return cell.getAttribute('data-filter').toLowerCase();
    }

    // Get text content
    const text = cell.textContent || cell.innerText || '';
    return text.trim().toLowerCase();
  }

  /**
   * Check if row matches all filters
   */
  function rowMatchesFilters(row, filters) {
    for (const [columnIndex, filterValue] of filters.entries()) {
      if (!filterValue) continue; // Skip empty filters

      const cell = row.cells[columnIndex];
      if (!cell) continue;

      const cellValue = getCellValue(cell);

      // Support multiple filter modes
      // 1. Exact match: =value
      // 2. Starts with: ^value
      // 3. Ends with: value$
      // 4. Regex: /pattern/
      // 5. Default: contains (case-insensitive)

      let matches = false;

      if (filterValue.startsWith('=')) {
        // Exact match
        const exactValue = filterValue.slice(1).toLowerCase();
        matches = cellValue === exactValue;
      } else if (filterValue.startsWith('^')) {
        // Starts with
        const startsValue = filterValue.slice(1).toLowerCase();
        matches = cellValue.startsWith(startsValue);
      } else if (filterValue.endsWith('$')) {
        // Ends with
        const endsValue = filterValue.slice(0, -1).toLowerCase();
        matches = cellValue.endsWith(endsValue);
      } else if (filterValue.startsWith('/') && filterValue.endsWith('/')) {
        // Regex
        try {
          const pattern = filterValue.slice(1, -1);
          const regex = new RegExp(pattern, 'i');
          matches = regex.test(cellValue);
        } catch (e) {
          console.warn('Invalid regex pattern:', filterValue);
          matches = false;
        }
      } else {
        // Default: contains (case-insensitive)
        matches = cellValue.includes(filterValue.toLowerCase());
      }

      if (!matches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply filters to table
   */
  function applyFilters(table, filters) {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    const rows = Array.from(tbody.rows);
    let visibleCount = 0;

    rows.forEach(row => {
      // Skip rows marked as no-filter
      if (row.classList.contains('no-filter')) {
        return;
      }

      const matches = rowMatchesFilters(row, filters);

      if (matches) {
        row.classList.remove(FILTERED_OUT_CLASS);
        row.style.display = '';
        visibleCount++;
      } else {
        row.classList.add(FILTERED_OUT_CLASS);
        row.style.display = 'none';
      }
    });

    // Update filter count badge if exists
    updateFilterCount(table, visibleCount, rows.length);

    // Trigger zebra table refresh if available
    if (window.ZebraTable && window.ZebraTable.refresh) {
      window.ZebraTable.refresh(table);
    }

    // Store filter state
    table.dataset.filteredRows = visibleCount;
    table.dataset.totalRows = rows.length;
  }

  /**
   * Update or create filter count badge
   */
  function updateFilterCount(table, visibleCount, totalCount) {
    const tableContainer = table.closest('.table-responsive') || table.parentElement;
    if (!tableContainer) return;

    let badge = tableContainer.querySelector('.table-filter-count');

    if (visibleCount === totalCount) {
      // All rows visible, remove badge
      if (badge) {
        badge.remove();
      }
      return;
    }

    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'table-filter-count badge bg-info mb-2';
      tableContainer.insertBefore(badge, table);
    }

    badge.textContent = `Showing ${visibleCount} of ${totalCount} rows`;
  }

  /**
   * Setup filter event handlers
   */
  function setupFilterHandlers(table, filterRow) {
    const inputs = filterRow.querySelectorAll(`.${FILTER_INPUT_CLASS}`);

    inputs.forEach(input => {
      let timeoutId = null;

      input.addEventListener('input', () => {
        // Debounce filtering for better performance
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const filters = new Map();

          inputs.forEach(inp => {
            const columnIndex = parseInt(inp.dataset.columnIndex, 10);
            const filterValue = inp.value.trim();
            filters.set(columnIndex, filterValue);
          });

          applyFilters(table, filters);
        }, 300); // 300ms debounce
      });

      // Clear filter on Escape key
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          input.value = '';
          input.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  /**
   * Clear all filters for a table
   */
  function clearFilters(table) {
    const filterRow = table.querySelector(`.${FILTER_ROW_CLASS}`);
    if (!filterRow) return;

    const inputs = filterRow.querySelectorAll(`.${FILTER_INPUT_CLASS}`);
    inputs.forEach(input => {
      input.value = '';
    });

    applyFilters(table, new Map());
  }

  /**
   * Make table filterable
   */
  function makeFilterable(table) {
    if (table.dataset.filterableInitialized === 'true') {
      return;
    }

    const filterRow = createFilterRow(table);
    if (!filterRow) {
      console.warn('Could not create filter row for table', table);
      return;
    }

    setupFilterHandlers(table, filterRow);

    table.classList.add(FILTER_CLASS);
    table.dataset.filterableInitialized = 'true';

    // Add clear filters button if desired
    addClearFiltersButton(table);
  }

  /**
   * Add clear filters button
   */
  function addClearFiltersButton(table) {
    const tableContainer = table.closest('.table-responsive') || table.parentElement;
    if (!tableContainer) return;

    // Check if button already exists
    if (tableContainer.querySelector('.table-filter-clear')) {
      return;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'table-filter-controls mb-2';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'table-filter-clear btn btn-sm btn-outline-secondary';
    clearButton.textContent = 'Clear Filters';
    clearButton.addEventListener('click', () => clearFilters(table));

    buttonContainer.appendChild(clearButton);
    tableContainer.insertBefore(buttonContainer, table);
  }

  /**
   * Collect filterable tables
   */
  function collectTables(root) {
    return Array.from(
      root.querySelectorAll('table.table-filter, table[data-filterable]')
    );
  }

  /**
   * Initialize filterable tables
   */
  function init(root = document) {
    collectTables(root).forEach(makeFilterable);
  }

  /**
   * Refresh filters (reapply current filter state)
   */
  function refresh(root = document) {
    collectTables(root).forEach(table => {
      if (table.dataset.filterableInitialized !== 'true') return;

      const filterRow = table.querySelector(`.${FILTER_ROW_CLASS}`);
      if (!filterRow) return;

      const inputs = filterRow.querySelectorAll(`.${FILTER_INPUT_CLASS}`);
      const filters = new Map();

      inputs.forEach(input => {
        const columnIndex = parseInt(input.dataset.columnIndex, 10);
        const filterValue = input.value.trim();
        filters.set(columnIndex, filterValue);
      });

      applyFilters(table, filters);
    });
  }

  // Export API
  window.TableFilter = { init, refresh, clearFilters };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
})();
