const WikiContext = require('../WikiContext');

// Mock managers for testing
const mockParser = {
  parse: jest.fn((content) => `<p>Parsed: ${content}</p>`)
};

const mockRenderingManager = {
  getParser: jest.fn(() => mockParser)
};

const mockVariableManager = {
  expandVariables: jest.fn((content) => content.replace(/\[\{\$pagename\}\]/g, 'TestPage'))
};

const mockEngine = {
  getManager: jest.fn((managerName) => {
    switch (managerName) {
      case 'RenderingManager':
        return mockRenderingManager;
      case 'VariableManager':
        return mockVariableManager;
      case 'PageManager':
      case 'PluginManager':
      case 'ACLManager':
        return null;
      default:
        return null;
    }
  })
};

describe('WikiContext', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();

    context = new WikiContext(mockEngine, {
      context: WikiContext.CONTEXT.VIEW,
      pageName: 'TestPage',
      content: 'Test content with [{$pagename}]',
      userContext: { isAuthenticated: true, roles: ['user'] },
      request: {
        headers: {
          'user-agent': 'test-agent',
          'accept-language': 'en-US'
        },
        ip: '127.0.0.1',
        sessionID: 'test-session-id'
      }
    });
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(context.engine).toBe(mockEngine);
      expect(context.context).toBe(WikiContext.CONTEXT.VIEW);
      expect(context.pageName).toBe('TestPage');
      expect(context.content).toBe('Test content with [{$pagename}]');
      expect(context.userContext.isAuthenticated).toBe(true);
      expect(context.renderingManager).toBe(mockRenderingManager);
      expect(context.variableManager).toBe(mockVariableManager);
    });

    test('should throw error if engine not provided', () => {
      expect(() => new WikiContext(null)).toThrow('WikiContext requires a valid WikiEngine instance');
    });

    test('should use defaults for optional properties', () => {
      const minimalContext = new WikiContext(mockEngine);
      expect(minimalContext.context).toBe(WikiContext.CONTEXT.NONE);
      expect(minimalContext.pageName).toBeNull();
      expect(minimalContext.content).toBeNull();
      expect(minimalContext.userContext).toBeNull();
    });
  });

  describe('getContext', () => {
    test('should return the context type', () => {
      expect(context.getContext()).toBe(WikiContext.CONTEXT.VIEW);
    });

    test('should return NONE for default context', () => {
      const defaultContext = new WikiContext(mockEngine);
      expect(defaultContext.getContext()).toBe(WikiContext.CONTEXT.NONE);
    });
  });

  describe('renderMarkdown', () => {
    test('should use MarkupParser when available', async () => {
      const content = '# Test Header';
      const result = await context.renderMarkdown(content);

      expect(mockRenderingManager.getParser).toHaveBeenCalled();
      expect(mockParser.parse).toHaveBeenCalledWith(content, expect.objectContaining({
        pageContext: expect.objectContaining({
          pageName: 'TestPage'
        }),
        engine: mockEngine
      }));
      expect(result).toBe('<p>Parsed: # Test Header</p>');
    });

    test('should use default content if none provided', async () => {
      await context.renderMarkdown();

      expect(mockParser.parse).toHaveBeenCalledWith(
        'Test content with [{$pagename}]',
        expect.any(Object)
      );
    });

    test('should fallback to Showdown when parser not available', async () => {
      mockRenderingManager.getParser.mockReturnValueOnce(null);

      const result = await context.renderMarkdown('# Fallback Test');

      // Should use fallback converter (Showdown)
      expect(result).toContain('Fallback Test');
      expect(mockParser.parse).not.toHaveBeenCalled();
    });

    test('should expand variables in fallback mode', async () => {
      mockRenderingManager.getParser.mockReturnValueOnce(null);

      const result = await context.renderMarkdown('[{$pagename}] test');

      expect(mockVariableManager.expandVariables).toHaveBeenCalled();
      expect(result).toContain('TestPage');
    });
  });

  describe('toParseOptions', () => {
    test('should create correct parse options object', () => {
      const options = context.toParseOptions();

      expect(options).toEqual({
        pageContext: {
          pageName: 'TestPage',
          userContext: { isAuthenticated: true, roles: ['user'] },
          requestInfo: {
            acceptLanguage: 'en-US',
            userAgent: 'test-agent',
            clientIp: '127.0.0.1',
            referer: undefined,
            sessionId: 'test-session-id'
          }
        },
        engine: mockEngine
      });
    });

    test('should handle missing request object', () => {
      const contextWithoutRequest = new WikiContext(mockEngine, {
        pageName: 'Test'
      });

      const options = contextWithoutRequest.toParseOptions();

      expect(options.pageContext.requestInfo).toEqual({
        acceptLanguage: undefined,
        userAgent: undefined,
        clientIp: undefined,
        referer: undefined,
        sessionId: undefined
      });
    });
  });

  describe('Context constants', () => {
    test('should have all context type constants', () => {
      expect(WikiContext.CONTEXT.VIEW).toBe('view');
      expect(WikiContext.CONTEXT.EDIT).toBe('edit');
      expect(WikiContext.CONTEXT.PREVIEW).toBe('preview');
      expect(WikiContext.CONTEXT.DIFF).toBe('diff');
      expect(WikiContext.CONTEXT.INFO).toBe('info');
      expect(WikiContext.CONTEXT.NONE).toBe('none');
    });
  });
});
