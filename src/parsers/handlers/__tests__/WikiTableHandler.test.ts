/**
 * WikiTableHandler tests
 *
 * Covers:
 * - process() with empty/null content
 * - process() passthrough for non-table content
 * - || header || → <thead><tr><th>
 * - | cell | → <tbody><tr><td>
 * - Mixed header + data rows
 * - Default "table" class on generated <table>
 * - HTML escaping in cells
 * - %%TABLE_CLASSES{...}%% marker applies extra classes to next table
 * - Multiple tables in one string
 * - Table at end of content (no trailing newline)
 * - getInfo() metadata
 *
 * @jest-environment node
 */

import WikiTableHandler from '../WikiTableHandler';

const ctx = { pageName: 'TestPage', engine: { getManager: vi.fn(() => null) } };

async function run(content: string): Promise<string> {
  const h = new WikiTableHandler();
  return h.process(content, ctx);
}

describe('WikiTableHandler', () => {
  describe('metadata', () => {
    test('has correct handlerId', () => {
      expect(new WikiTableHandler().handlerId).toBe('WikiTableHandler');
    });

    test('has priority 60', () => {
      expect(new WikiTableHandler().priority).toBe(60);
    });

    test('getInfo() returns supportedPatterns and features', () => {
      const info = new WikiTableHandler().getInfo();
      expect(Array.isArray(info.supportedPatterns)).toBe(true);
      expect(Array.isArray(info.features)).toBe(true);
    });
  });

  describe('process() — passthrough', () => {
    test('returns empty string for empty content', async () => {
      expect(await run('')).toBe('');
    });

    test('returns regular text unchanged', async () => {
      const text = 'Just some regular text here.';
      expect(await run(text)).toBe(text);
    });

    test('leaves markdown headings unchanged', async () => {
      const text = '# Heading\n\nParagraph text.';
      const result = await run(text);
      expect(result).toContain('# Heading');
      expect(result).toContain('Paragraph text.');
    });
  });

  describe('process() — header rows', () => {
    test('|| Col1 || Col2 || → <thead> with <th> cells', async () => {
      const result = await run('|| Name || Age ||');
      expect(result).toContain('<table');
      expect(result).toContain('<thead>');
      expect(result).toContain('<th>Name</th>');
      expect(result).toContain('<th>Age</th>');
    });

    test('single header cell', async () => {
      const result = await run('|| Title ||');
      expect(result).toContain('<th>Title</th>');
    });
  });

  describe('process() — data rows', () => {
    test('| cell | → <tbody> with <td> cells', async () => {
      const result = await run('| Alice | 30 |');
      expect(result).toContain('<table');
      expect(result).toContain('<tbody>');
      expect(result).toContain('<td>Alice</td>');
      expect(result).toContain('<td>30</td>');
    });

    test('single data cell', async () => {
      const result = await run('| Item |');
      expect(result).toContain('<td>Item</td>');
    });
  });

  describe('process() — mixed header and data rows', () => {
    test('generates both <thead> and <tbody> sections', async () => {
      const content = '|| Name || Age ||\n| Alice | 30 |\n| Bob | 25 |';
      const result = await run(content);
      expect(result).toContain('<thead>');
      expect(result).toContain('<tbody>');
      expect(result).toContain('<th>Name</th>');
      expect(result).toContain('<td>Alice</td>');
      expect(result).toContain('<td>Bob</td>');
    });
  });

  describe('process() — table classes', () => {
    test('applies default "table" class when no marker', async () => {
      const result = await run('|| Header ||\n| Cell |');
      expect(result).toContain('class="table"');
    });

    test('TABLE_CLASSES marker merges classes onto next table', async () => {
      const content = '%%TABLE_CLASSES{sortable}%%\n|| Col ||\n| Row |';
      const result = await run(content);
      expect(result).toContain('sortable');
      expect(result).toContain('table');
      expect(result).not.toContain('TABLE_CLASSES');
    });

    test('TABLE_CLASSES marker is consumed and not output', async () => {
      const content = '%%TABLE_CLASSES{zebra-table}%%\n| Cell |';
      const result = await run(content);
      expect(result).not.toContain('%%TABLE_CLASSES');
    });
  });

  describe('process() — HTML escaping', () => {
    test('escapes < > in cell content', async () => {
      const result = await run('| <script>alert(1)</script> |');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    test('escapes & in cell content', async () => {
      const result = await run('| A & B |');
      expect(result).toContain('&amp;');
      expect(result).not.toContain(' & ');
    });
  });

  describe('process() — multiple tables', () => {
    test('renders two separate tables with content between them', async () => {
      const content = '| A | B |\n\nSome text\n\n| C | D |';
      const result = await run(content);
      const tableCount = (result.match(/<table/g) ?? []).length;
      expect(tableCount).toBe(2);
      expect(result).toContain('Some text');
    });
  });

  describe('process() — table at end of content', () => {
    test('closes table when content ends without trailing newline', async () => {
      const result = await run('|| H ||\n| R |');
      expect(result).toContain('</table>');
    });
  });

  describe('onInitialize()', () => {
    test('initializes without throwing', async () => {
      const handler = new WikiTableHandler();
      const mockEngine = { getManager: vi.fn(() => null) };
      await expect(
        (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine: mockEngine })
      ).resolves.not.toThrow();
    });
  });
});
