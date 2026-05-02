import WikiContext from '../WikiContext';
import type { WikiEngine } from '../../types/WikiEngine';

// Mock managers for testing
const mockParser = {
  parse: vi.fn((content) => `<p>Parsed: ${content}</p>`)
};

const mockRenderingManager = {
  getParser: vi.fn(() => mockParser)
};

const mockVariableManager = {
  expandVariables: vi.fn((content) => content.replace(/\[\{\$pagename\}\]/g, 'TestPage'))
};

const mockEngine = {
  getManager: vi.fn((managerName) => {
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
    vi.clearAllMocks();

    context = new WikiContext(mockEngine as unknown as WikiEngine, {
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
      const minimalContext = new WikiContext(mockEngine as unknown as WikiEngine);
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
      const defaultContext = new WikiContext(mockEngine as unknown as WikiEngine);
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
            sessionId: 'test-session-id',
            query: undefined
          },
          themeContext: {
            activeTheme: 'default',
            themeInfo: null,
            displayTheme: 'system'
          },
          pageMetadata: null
        },
        engine: mockEngine
      });
    });

    test('should handle missing request object', () => {
      const contextWithoutRequest = new WikiContext(mockEngine as unknown as WikiEngine, {
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

  describe('userHasRole (static)', () => {
    test('returns true when userContext has the role', () => {
      expect(WikiContext.userHasRole({ roles: ['admin'] }, 'admin')).toBe(true);
    });

    test('multi-arg form matches if user has any role', () => {
      expect(WikiContext.userHasRole({ roles: ['editor'] }, 'admin', 'editor')).toBe(true);
    });

    test('returns false when userContext is null/undefined', () => {
      expect(WikiContext.userHasRole(null, 'admin')).toBe(false);
      expect(WikiContext.userHasRole(undefined, 'admin')).toBe(false);
    });

    test('returns false when roles array is missing or empty', () => {
      expect(WikiContext.userHasRole({}, 'admin')).toBe(false);
      expect(WikiContext.userHasRole({ roles: [] }, 'admin')).toBe(false);
    });

    test('returns false when called with no role names', () => {
      expect(WikiContext.userHasRole({ roles: ['admin'] })).toBe(false);
    });

    test('instance hasRole delegates to static implementation', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: ['editor'] }
      });
      expect(ctx.hasRole('editor')).toBe(WikiContext.userHasRole(ctx.userContext, 'editor'));
    });
  });

  describe('hasRole', () => {
    test('returns true when user carries one of the given roles', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: ['editor', 'reader'] }
      });
      expect(ctx.hasRole('admin', 'editor')).toBe(true);
    });

    test('returns true for single-arg role match', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: ['admin'] }
      });
      expect(ctx.hasRole('admin')).toBe(true);
    });

    test('returns false when user has none of the given roles', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: ['reader'] }
      });
      expect(ctx.hasRole('admin', 'editor')).toBe(false);
    });

    test('returns false when userContext is null', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine);
      expect(ctx.hasRole('admin')).toBe(false);
    });

    test('returns false when roles is missing or empty', () => {
      const noRoles = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { username: 'alice' }
      });
      const emptyRoles = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: [] }
      });
      expect(noRoles.hasRole('admin')).toBe(false);
      expect(emptyRoles.hasRole('admin')).toBe(false);
    });

    test('returns false when called with no role names', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: ['admin'] }
      });
      expect(ctx.hasRole()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    test('delegates to UserManager.hasPermission with the user\'s username', async () => {
      const userManagerMock = {
        hasPermission: vi.fn().mockResolvedValue(true)
      };
      const engineWithUser = {
        getManager: vi.fn((name) => {
          if (name === 'UserManager') return userManagerMock;
          return mockEngine.getManager(name);
        })
      };
      const ctx = new WikiContext(engineWithUser as unknown as WikiEngine, {
        userContext: { username: 'alice', roles: ['editor'] }
      });

      const result = await ctx.hasPermission('admin-system');

      expect(userManagerMock.hasPermission).toHaveBeenCalledWith('alice', 'admin-system');
      expect(result).toBe(true);
    });

    test('passes empty string username when userContext is null', async () => {
      const userManagerMock = {
        hasPermission: vi.fn().mockResolvedValue(false)
      };
      const engineWithUser = {
        getManager: vi.fn((name) => {
          if (name === 'UserManager') return userManagerMock;
          return mockEngine.getManager(name);
        })
      };
      const ctx = new WikiContext(engineWithUser as unknown as WikiEngine);

      const result = await ctx.hasPermission('admin-system');

      expect(userManagerMock.hasPermission).toHaveBeenCalledWith('', 'admin-system');
      expect(result).toBe(false);
    });

    test('returns false when UserManager is not available', async () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { username: 'alice', roles: ['admin'] }
      });
      // mockEngine returns null for UserManager
      const result = await ctx.hasPermission('admin-system');
      expect(result).toBe(false);
    });
  });

  describe('canAccess', () => {
    test('delegates to ACLManager.checkPagePermissionWithContext', async () => {
      const aclManagerMock = {
        checkPagePermissionWithContext: vi.fn().mockResolvedValue(true)
      };
      const engineWithAcl = {
        getManager: vi.fn((name) => {
          if (name === 'ACLManager') return aclManagerMock;
          return mockEngine.getManager(name);
        })
      };
      const ctx = new WikiContext(engineWithAcl as unknown as WikiEngine, {
        pageName: 'Main',
        userContext: { username: 'alice', roles: ['editor'] }
      });

      const result = await ctx.canAccess('edit');

      expect(aclManagerMock.checkPagePermissionWithContext).toHaveBeenCalledWith(ctx, 'edit');
      expect(result).toBe(true);
    });

    test('returns false when pageName is null', async () => {
      const aclManagerMock = {
        checkPagePermissionWithContext: vi.fn().mockResolvedValue(true)
      };
      const engineWithAcl = {
        getManager: vi.fn((name) => {
          if (name === 'ACLManager') return aclManagerMock;
          return mockEngine.getManager(name);
        })
      };
      const ctx = new WikiContext(engineWithAcl as unknown as WikiEngine, {
        userContext: { username: 'alice', roles: ['admin'] }
      });

      const result = await ctx.canAccess('edit');

      expect(aclManagerMock.checkPagePermissionWithContext).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('returns false when ACLManager is not available', async () => {
      // mockEngine returns null for ACLManager
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        pageName: 'Main',
        userContext: { username: 'alice', roles: ['admin'] }
      });
      const result = await ctx.canAccess('edit');
      expect(result).toBe(false);
    });
  });

  describe('getPrincipals', () => {
    test('returns roles plus username for authenticated user', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { username: 'alice', roles: ['editor', 'reader'] }
      });
      expect(ctx.getPrincipals()).toEqual(['editor', 'reader', 'alice']);
    });

    test('returns roles only when no username present', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { roles: ['anonymous'] }
      });
      expect(ctx.getPrincipals()).toEqual(['anonymous']);
    });

    test('returns empty array when userContext is null', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine);
      expect(ctx.getPrincipals()).toEqual([]);
    });

    test('returns just username when roles is missing', () => {
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { username: 'alice' }
      });
      expect(ctx.getPrincipals()).toEqual(['alice']);
    });

    test('returned array is a copy — does not alias userContext.roles', () => {
      const roles = ['editor'];
      const ctx = new WikiContext(mockEngine as unknown as WikiEngine, {
        userContext: { username: 'alice', roles }
      });
      const principals = ctx.getPrincipals();
      principals.push('mutated');
      expect(roles).toEqual(['editor']);
    });
  });
});
