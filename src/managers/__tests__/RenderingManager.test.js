const RenderingManager = require('../RenderingManager');
const path = require('path');

// Mock dependencies
const mockEngine = {
  log: jest.fn(),
  getManager: jest.fn(),
  getConfig: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({
      wiki: { pagesDir: './pages' }
    })
  })
};

const mockPageManager = {
  getAllPages: jest.fn().mockReturnValue([
    { title: 'Welcome', content: 'Welcome to the wiki' },
    { title: 'Test Page', content: '[Welcome] is linked here' }
  ])
};

describe('RenderingManager', () => {
  let renderingManager;

  beforeEach(() => {
    renderingManager = new RenderingManager(mockEngine);
    mockEngine.getManager.mockReturnValue(mockPageManager);
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await renderingManager.initialize({});
      expect(renderingManager.initialized).toBe(true);
    });

    it('should build link graph during initialization', async () => {
      await renderingManager.initialize({});
      expect(renderingManager.linkGraph).toBeDefined();
      expect(Object.keys(renderingManager.linkGraph).length).toBeGreaterThan(0);
    });
  });

  describe('JSPWiki link rendering', () => {
    beforeEach(async () => {
      await renderingManager.initialize({});
    });

    it('should render simple wiki links', () => {
      const content = 'See [Welcome] for more info';
      const result = renderingManager.renderWikiLinks(content);
      
      expect(result).toContain('<a href="/view/Welcome"');
      expect(result).toContain('Welcome</a>');
    });

    it('should render links with custom text', () => {
      const content = 'Check out [the main page|Welcome]';
      const result = renderingManager.renderWikiLinks(content);
      
      expect(result).toContain('<a href="/view/Welcome"');
      expect(result).toContain('the main page</a>');
    });

    it('should render red links for non-existent pages', () => {
      const content = 'This links to [NonExistentPage]';
      const result = renderingManager.renderWikiLinks(content);
      
      expect(result).toContain('class="red-link"');
      expect(result).toContain('NonExistentPage');
    });

    it('should handle plugin syntax', () => {
      const content = 'Current time: [{UptimePlugin}]';
      const result = renderingManager.renderPlugins(content, {});
      
      // Should attempt to process plugin syntax
      expect(result).toBeDefined();
    });
  });

  describe('user variable expansion', () => {
    beforeEach(async () => {
      await renderingManager.initialize({});
    });

    it('should expand username variable', () => {
      const content = 'Hello [{$username}]!';
      const userContext = { username: 'testuser' };
      
      const result = renderingManager.expandUserVariables(content, userContext);
      
      expect(result).toBe('Hello testuser!');
    });

    it('should expand login status variable', () => {
      const content = 'Status: [{$loginstatus}]';
      const userContext = { username: 'testuser' };
      
      const result = renderingManager.expandUserVariables(content, userContext);
      
      expect(result).toContain('authenticated');
    });

    it('should handle anonymous users', () => {
      const content = 'User: [{$username}]';
      const userContext = { username: null };
      
      const result = renderingManager.expandUserVariables(content, userContext);
      
      expect(result).toBe('User: anonymous');
    });
  });

  describe('markdown rendering', () => {
    beforeEach(async () => {
      await renderingManager.initialize({});
    });

    it('should render markdown to HTML', async () => {
      const markdown = '# Test Header\n\nThis is **bold** text.';
      
      const result = await renderingManager.renderMarkdown(markdown);
      
      expect(result).toContain('<h1');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should preserve wiki links during markdown rendering', async () => {
      const markdown = 'See [Welcome] and **bold text**';
      const userContext = {};
      
      const result = await renderingManager.renderPage(markdown, userContext);
      
      expect(result).toContain('<a href="/view/Welcome"');
      expect(result).toContain('<strong>bold text</strong>');
    });
  });

  describe('link graph building', () => {
    it('should build bidirectional link graph', async () => {
      await renderingManager.initialize({});
      
      const linkGraph = renderingManager.linkGraph;
      
      expect(linkGraph).toBeDefined();
      expect(typeof linkGraph).toBe('object');
    });

    it('should find referring pages', () => {
      renderingManager.linkGraph = {
        'Welcome': ['Test Page', 'Another Page'],
        'Test Page': []
      };
      
      const referring = renderingManager.getReferringPages('Welcome');
      
      expect(referring).toContain('Test Page');
      expect(referring).toContain('Another Page');
    });
  });
});
