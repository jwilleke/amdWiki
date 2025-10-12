/**
 * WikiDocument Unit Tests
 *
 * Tests for the WikiDocument DOM-based implementation
 *
 * Related: GitHub Issue #93 - Phase 1.1
 */

const WikiDocument = require('../WikiDocument');

describe('WikiDocument', () => {
  describe('Constructor', () => {
    test('creates a document with page data', () => {
      const doc = new WikiDocument('Test content', { page: 'TestPage' });

      expect(doc).toBeDefined();
      expect(doc.getPageData()).toBe('Test content');
      expect(doc.getContext()).toEqual({ page: 'TestPage' });
    });

    test('creates a document without context', () => {
      const doc = new WikiDocument('Test content', null);

      expect(doc).toBeDefined();
      expect(doc.getPageData()).toBe('Test content');
      expect(doc.getContext()).toBeNull();
    });

    test('initializes with metadata', () => {
      const doc = new WikiDocument('Test', {});
      const metadata = doc.getMetadata();

      expect(metadata).toHaveProperty('createdAt');
      expect(metadata).toHaveProperty('version', '1.0.0');
    });
  });

  describe('Page Data Management', () => {
    test('getPageData returns original content', () => {
      const content = 'Original wiki markup';
      const doc = new WikiDocument(content, {});

      expect(doc.getPageData()).toBe(content);
    });

    test('setPageData updates content', () => {
      const doc = new WikiDocument('Original', {});
      doc.setPageData('Updated');

      expect(doc.getPageData()).toBe('Updated');
    });
  });

  describe('Context Management', () => {
    test('getContext returns context if alive', () => {
      const context = { page: 'TestPage', user: 'john' };
      const doc = new WikiDocument('Test', context);

      expect(doc.getContext()).toEqual(context);
    });

    test('setContext updates context', () => {
      const doc = new WikiDocument('Test', { initial: true });
      const newContext = { page: 'NewPage' };

      doc.setContext(newContext);

      expect(doc.getContext()).toEqual(newContext);
    });

    test('setContext with null clears context', () => {
      const doc = new WikiDocument('Test', { page: 'TestPage' });
      doc.setContext(null);

      expect(doc.getContext()).toBeNull();
    });
  });

  describe('Metadata Management', () => {
    test('setMetadata stores values', () => {
      const doc = new WikiDocument('Test', {});

      doc.setMetadata('author', 'John Doe');
      doc.setMetadata('tags', ['test', 'demo']);

      expect(doc.getMetadataValue('author')).toBe('John Doe');
      expect(doc.getMetadataValue('tags')).toEqual(['test', 'demo']);
    });

    test('getMetadataValue returns default for missing key', () => {
      const doc = new WikiDocument('Test', {});

      expect(doc.getMetadataValue('nonexistent')).toBeNull();
      expect(doc.getMetadataValue('nonexistent', 'default')).toBe('default');
    });

    test('getMetadata returns copy of all metadata', () => {
      const doc = new WikiDocument('Test', {});
      doc.setMetadata('key1', 'value1');
      doc.setMetadata('key2', 'value2');

      const metadata = doc.getMetadata();

      expect(metadata).toHaveProperty('key1', 'value1');
      expect(metadata).toHaveProperty('key2', 'value2');
      expect(metadata).toHaveProperty('createdAt');
      expect(metadata).toHaveProperty('version');
    });
  });

  describe('DOM Creation', () => {
    test('createElement creates element with attributes', () => {
      const doc = new WikiDocument('Test', {});
      const element = doc.createElement('div', { id: 'test', class: 'wiki-div' });

      expect(element.tagName.toLowerCase()).toBe('div');
      expect(element.getAttribute('id')).toBe('test');
      expect(element.getAttribute('class')).toBe('wiki-div');
    });

    test('createElement works without attributes', () => {
      const doc = new WikiDocument('Test', {});
      const element = doc.createElement('p');

      expect(element.tagName.toLowerCase()).toBe('p');
    });

    test('createTextNode creates text node', () => {
      const doc = new WikiDocument('Test', {});
      const text = doc.createTextNode('Hello World');

      expect(text.nodeType).toBe(3); // TEXT_NODE
      expect(text.textContent).toBe('Hello World');
    });

    test('createCommentNode creates comment node', () => {
      const doc = new WikiDocument('Test', {});
      const comment = doc.createCommentNode('This is a comment');

      expect(comment.nodeType).toBe(8); // COMMENT_NODE
      expect(comment.textContent).toBe('This is a comment');
    });
  });

  describe('DOM Manipulation', () => {
    test('appendChild adds child to root', () => {
      const doc = new WikiDocument('Test', {});
      const element = doc.createElement('p');
      const text = doc.createTextNode('Paragraph text');

      element.appendChild(text);
      doc.appendChild(element);

      expect(doc.getChildCount()).toBe(1);
      expect(doc.isEmpty()).toBe(false);
    });

    test('removeChild removes child from root', () => {
      const doc = new WikiDocument('Test', {});
      const element = doc.createElement('p');

      doc.appendChild(element);
      expect(doc.getChildCount()).toBe(1);

      doc.removeChild(element);
      expect(doc.getChildCount()).toBe(0);
      expect(doc.isEmpty()).toBe(true);
    });

    test('insertBefore inserts node before reference', () => {
      const doc = new WikiDocument('Test', {});
      const first = doc.createElement('p');
      first.textContent = 'First';
      const second = doc.createElement('p');
      second.textContent = 'Second';

      doc.appendChild(second);
      doc.insertBefore(first, second);

      const children = doc.getRootElement().childNodes;
      expect(children[0].textContent).toBe('First');
      expect(children[1].textContent).toBe('Second');
    });

    test('replaceChild replaces node', () => {
      const doc = new WikiDocument('Test', {});
      const old = doc.createElement('p');
      old.textContent = 'Old';
      const newEl = doc.createElement('div');
      newEl.textContent = 'New';

      doc.appendChild(old);
      doc.replaceChild(newEl, old);

      const child = doc.getRootElement().childNodes[0];
      expect(child.textContent).toBe('New');
      expect(child.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('DOM Query', () => {
    let doc;

    beforeEach(() => {
      doc = new WikiDocument('Test', {});

      // Create test structure
      const heading = doc.createElement('h1', { id: 'title' });
      heading.textContent = 'Test Page';
      doc.appendChild(heading);

      for (let i = 0; i < 5; i++) {
        const para = doc.createElement('p', { id: `para-${i}`, class: 'wiki-para' });
        para.textContent = `Paragraph ${i}`;
        doc.appendChild(para);
      }

      const list = doc.createElement('ul', { class: 'wiki-list' });
      for (let i = 0; i < 3; i++) {
        const item = doc.createElement('li');
        item.textContent = `Item ${i}`;
        list.appendChild(item);
      }
      doc.appendChild(list);
    });

    test('querySelector finds element by ID', () => {
      const result = doc.querySelector('#title');

      expect(result).not.toBeNull();
      expect(result.textContent).toBe('Test Page');
    });

    test('querySelector finds element by class', () => {
      const result = doc.querySelector('.wiki-para');

      expect(result).not.toBeNull();
      expect(result.textContent).toBe('Paragraph 0');
    });

    test('querySelectorAll finds multiple elements', () => {
      const results = doc.querySelectorAll('.wiki-para');

      expect(results.length).toBe(5);
      expect(results[2].textContent).toBe('Paragraph 2');
    });

    test('getElementById finds element', () => {
      const result = doc.getElementById('para-3');

      expect(result).not.toBeNull();
      expect(result.textContent).toBe('Paragraph 3');
    });

    test('getElementsByClassName finds elements', () => {
      const results = doc.getElementsByClassName('wiki-para');

      expect(results.length).toBe(5);
    });

    test('getElementsByTagName finds elements', () => {
      const results = doc.getElementsByTagName('li');

      expect(results.length).toBe(3);
    });
  });

  describe('Serialization', () => {
    test('toHTML returns HTML string', () => {
      const doc = new WikiDocument('Test', {});
      const para = doc.createElement('p', { id: 'test' });
      para.textContent = 'Test paragraph';
      doc.appendChild(para);

      const html = doc.toHTML();

      expect(html).toContain('<p id="test">');
      expect(html).toContain('Test paragraph');
      expect(html).toContain('</p>');
    });

    test('toString returns description', () => {
      const doc = new WikiDocument('Test content', {});
      doc.appendChild(doc.createElement('p'));
      doc.appendChild(doc.createElement('div'));

      const str = doc.toString();

      expect(str).toContain('WikiDocument');
      expect(str).toContain('2 nodes');
      expect(str).toContain('12 chars');
    });

    test('toJSON serializes document', () => {
      const doc = new WikiDocument('Original markup', {});
      doc.setMetadata('author', 'John');

      const para = doc.createElement('p');
      para.textContent = 'Test';
      doc.appendChild(para);

      const json = doc.toJSON();

      expect(json).toHaveProperty('pageData', 'Original markup');
      expect(json).toHaveProperty('html');
      expect(json).toHaveProperty('metadata');
      expect(json).toHaveProperty('version', '1.0.0');
      expect(json).toHaveProperty('timestamp');
      expect(json.metadata).toHaveProperty('author', 'John');
      expect(json.html).toContain('<p>Test</p>');
    });

    test('fromJSON restores document', () => {
      const original = new WikiDocument('Original content', {});
      original.setMetadata('author', 'John');

      const para = original.createElement('p');
      para.textContent = 'Test paragraph';
      original.appendChild(para);

      const json = original.toJSON();
      const restored = WikiDocument.fromJSON(json, { page: 'TestPage' });

      expect(restored.getPageData()).toBe('Original content');
      expect(restored.getMetadataValue('author')).toBe('John');
      expect(restored.toHTML()).toContain('<p>Test paragraph</p>');
      expect(restored.getContext()).toEqual({ page: 'TestPage' });
    });

    test('fromJSON works without context', () => {
      const json = { pageData: 'Test', html: '<p>Test</p>', metadata: {}, version: '1.0.0' };
      const doc = WikiDocument.fromJSON(json);

      expect(doc.getPageData()).toBe('Test');
      expect(doc.getContext()).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    test('clear removes all content', () => {
      const doc = new WikiDocument('Test', {});
      doc.appendChild(doc.createElement('p'));
      doc.appendChild(doc.createElement('div'));

      expect(doc.getChildCount()).toBe(2);

      doc.clear();

      expect(doc.getChildCount()).toBe(0);
      expect(doc.isEmpty()).toBe(true);
    });

    test('getChildCount returns child count', () => {
      const doc = new WikiDocument('Test', {});

      expect(doc.getChildCount()).toBe(0);

      doc.appendChild(doc.createElement('p'));
      expect(doc.getChildCount()).toBe(1);

      doc.appendChild(doc.createElement('div'));
      expect(doc.getChildCount()).toBe(2);
    });

    test('isEmpty returns true for empty document', () => {
      const doc = new WikiDocument('Test', {});

      expect(doc.isEmpty()).toBe(true);

      doc.appendChild(doc.createElement('p'));
      expect(doc.isEmpty()).toBe(false);
    });

    test('getStatistics returns statistics', () => {
      const doc = new WikiDocument('Test content', { page: 'TestPage' });
      doc.setMetadata('author', 'John');
      doc.appendChild(doc.createElement('p'));

      const stats = doc.getStatistics();

      expect(stats).toHaveProperty('nodeCount', 1);
      expect(stats).toHaveProperty('pageDataLength', 12);
      expect(stats).toHaveProperty('htmlLength');
      expect(stats).toHaveProperty('hasContext', true);
      expect(stats.metadata).toBeGreaterThan(0);
    });
  });

  describe('getRootElement', () => {
    test('returns root element', () => {
      const doc = new WikiDocument('Test', {});
      const root = doc.getRootElement();

      expect(root).toBeDefined();
      expect(root.tagName.toLowerCase()).toBe('body');
    });
  });
});
