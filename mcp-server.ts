#!/usr/bin/env node

/**
 * amdWiki MCP Server
 *
 * Model Context Protocol server providing AI assistants with direct access
 * to amdWiki content, search, validation, and metadata operations.
 *
 * @see https://modelcontextprotocol.io
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import * as path from 'path';
import * as fs from 'fs-extra';

// Import WikiEngine and types
import WikiEngine from './src/WikiEngine.js';
import type { WikiConfig } from './src/types/Config.js';

/**
 * Tool arguments interfaces
 */
interface QueryPageArgs {
  identifier: string;
  include_content?: boolean;
}

interface ListPagesArgs {
  category?: string;
  keywords?: string[];
  limit?: number;
}

interface SearchArgs {
  query: string;
  categories?: string[];
  keywords?: string[];
  search_in?: string[];
  max_results?: number;
}

interface GetMetadataArgs {
  identifier: string;
}

interface ListCategoriesArgs {}

interface ListKeywordsArgs {}

interface ValidateMetadataArgs {
  metadata: Record<string, any>;
}

interface GenerateMetadataArgs {
  title: string;
  category?: string;
  keywords?: string[];
}

interface GetAttachmentsArgs {
  page_name: string;
}

interface SearchSimilarArgs {
  page_name: string;
  limit?: number;
}

interface GetConfigurationArgs {
  key?: string;
}

interface GetSearchStatisticsArgs {}

/**
 * Manager type interfaces for type-safe manager access
 */
interface SearchManagerType {
  advancedSearch(options: Record<string, unknown>): Promise<unknown[]>;
  getAllSystemCategories(): Promise<string[]>;
  getAllUserKeywords(): Promise<string[]>;
  validateMetadata(metadata: Record<string, unknown>): Promise<{ valid: boolean; issues: unknown[] }>;
  generateValidMetadata(title: string, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
  suggestSimilarPages(pageName: string, limit?: number): Promise<unknown[]>;
  getStatistics(): Promise<Record<string, unknown>>;
}

interface PageManagerType {
  listAttachments(pageName: string): Promise<unknown[]>;
}

interface ValidationManagerType {
  getAllSystemCategories(): string[];
  getAllUserKeywords(): Promise<string[]>;
  validateMetadata(metadata: Record<string, unknown>): { valid: boolean; issues: unknown[] };
  generateValidMetadata(title: string, options?: Record<string, unknown>): Record<string, unknown>;
}

/**
 * Initialize WikiEngine instance
 */
async function initializeWikiEngine(): Promise<WikiEngine> {
  const engine = new WikiEngine({} as WikiConfig, null);
  await engine.initialize({} as WikiConfig);
  return engine;
}

/**
 * MCP Server Implementation
 */
class AmdWikiMCPServer {
  private server: Server;
  private wikiEngine: WikiEngine | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'amdwiki-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'amdwiki_query_page',
          description: 'Get page content and metadata by identifier (title, UUID, or slug)',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Page identifier: title (e.g., "Main"), UUID, or slug',
              },
              include_content: {
                type: 'boolean',
                description: 'Include full page content (default: true)',
                default: true,
              },
            },
            required: ['identifier'],
          },
        },
        {
          name: 'amdwiki_list_pages',
          description: 'List all pages with optional filtering by category or keywords',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by system category (e.g., "general", "documentation", "system")',
              },
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by user keywords',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of pages to return',
                default: 50,
              },
            },
          },
        },
        {
          name: 'amdwiki_search',
          description: 'Full-text search across wiki pages with advanced filtering',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query text',
              },
              categories: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by system categories',
              },
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by user keywords',
              },
              search_in: {
                type: 'array',
                items: { type: 'string', enum: ['title', 'content', 'metadata'] },
                description: 'Fields to search in',
                default: ['title', 'content', 'metadata'],
              },
              max_results: {
                type: 'number',
                description: 'Maximum results to return',
                default: 20,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'amdwiki_get_metadata',
          description: 'Get page metadata only (fast query without content)',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Page identifier: title, UUID, or slug',
              },
            },
            required: ['identifier'],
          },
        },
        {
          name: 'amdwiki_list_categories',
          description: 'Get all system categories with their configurations',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'amdwiki_list_keywords',
          description: 'Get all user keywords currently in use across pages',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'amdwiki_validate_metadata',
          description: 'Validate page metadata structure and values',
          inputSchema: {
            type: 'object',
            properties: {
              metadata: {
                type: 'object',
                description: 'Page metadata object to validate',
              },
            },
            required: ['metadata'],
          },
        },
        {
          name: 'amdwiki_generate_metadata',
          description: 'Generate valid metadata template for a new page',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Page title',
              },
              category: {
                type: 'string',
                description: 'System category (default: "general")',
              },
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'User keywords (max 5)',
              },
            },
            required: ['title'],
          },
        },
        {
          name: 'amdwiki_get_attachments',
          description: 'List attachments for a specific page',
          inputSchema: {
            type: 'object',
            properties: {
              page_name: {
                type: 'string',
                description: 'Page name or identifier',
              },
            },
            required: ['page_name'],
          },
        },
        {
          name: 'amdwiki_search_similar',
          description: 'Find pages similar to a given page',
          inputSchema: {
            type: 'object',
            properties: {
              page_name: {
                type: 'string',
                description: 'Page name to find similar pages for',
              },
              limit: {
                type: 'number',
                description: 'Maximum similar pages to return',
                default: 10,
              },
            },
            required: ['page_name'],
          },
        },
        {
          name: 'amdwiki_get_configuration',
          description: 'Get wiki configuration value(s)',
          inputSchema: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'Configuration key (e.g., "amdwiki.page.provider")',
              },
            },
          },
        },
        {
          name: 'amdwiki_get_search_statistics',
          description: 'Get search index statistics',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Ensure WikiEngine is initialized
        if (!this.wikiEngine) {
          this.wikiEngine = await initializeWikiEngine();
        }

        switch (name) {
          case 'amdwiki_query_page':
            return await this.queryPage(args as unknown as QueryPageArgs);

          case 'amdwiki_list_pages':
            return await this.listPages(args as unknown as ListPagesArgs);

          case 'amdwiki_search':
            return await this.search(args as unknown as SearchArgs);

          case 'amdwiki_get_metadata':
            return await this.getMetadata(args as unknown as GetMetadataArgs);

          case 'amdwiki_list_categories':
            return await this.listCategories(args as unknown as ListCategoriesArgs);

          case 'amdwiki_list_keywords':
            return await this.listKeywords(args as unknown as ListKeywordsArgs);

          case 'amdwiki_validate_metadata':
            return await this.validateMetadata(args as unknown as ValidateMetadataArgs);

          case 'amdwiki_generate_metadata':
            return await this.generateMetadata(args as unknown as GenerateMetadataArgs);

          case 'amdwiki_get_attachments':
            return await this.getAttachments(args as unknown as GetAttachmentsArgs);

          case 'amdwiki_search_similar':
            return await this.searchSimilar(args as unknown as SearchSimilarArgs);

          case 'amdwiki_get_configuration':
            return await this.getConfiguration(args as unknown as GetConfigurationArgs);

          case 'amdwiki_get_search_statistics':
            return await this.getSearchStatistics(args as unknown as GetSearchStatisticsArgs);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Tool Implementation: Query Page
   */
  private async queryPage(args: QueryPageArgs) {
    const { identifier, include_content = true } = args;
    const pageManager = this.wikiEngine!.getPageManager();

    if (!pageManager.pageExists(identifier)) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const page: any = await pageManager.getPage(identifier);

    const result: Record<string, any> = {
      title: page.metadata.title,
      uuid: page.metadata.uuid,
      slug: page.metadata.slug,
      category: page.metadata['system-category'],
      keywords: page.metadata['user-keywords'] || [],
      lastModified: page.metadata.lastModified,
      editor: page.metadata.editor,
    };

    if (include_content) {
      result.content = page.content;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: List Pages
   */
  private async listPages(args: ListPagesArgs) {
    const { category, keywords, limit = 50 } = args;
    const pageManager = this.wikiEngine!.getPageManager();

    const pageTitles = await pageManager.getAllPages();

    // Fetch metadata for all pages
    const pagesWithMetadata: any[] = [];
    for (const title of pageTitles) {
      try {
        const metadata = await pageManager.getPageMetadata(title);
        if (metadata) {
          pagesWithMetadata.push({ title, metadata });
        }
      } catch (error) {
        // Skip pages that can't be loaded
        continue;
      }
    }

    // Filter by category
    let filteredPages = pagesWithMetadata;
    if (category) {
      filteredPages = filteredPages.filter(page =>
        page.metadata['system-category'] === category
      );
    }

    // Filter by keywords
    if (keywords && keywords.length > 0) {
      filteredPages = filteredPages.filter(page => {
        const pageKeywords = page.metadata['user-keywords'] || [];
        return keywords.some(kw => pageKeywords.includes(kw));
      });
    }

    // Apply limit
    filteredPages = filteredPages.slice(0, limit);

    // Format results
    const results = filteredPages.map(page => ({
      title: page.metadata.title,
      uuid: page.metadata.uuid,
      slug: page.metadata.slug,
      category: page.metadata['system-category'],
      keywords: page.metadata['user-keywords'] || [],
      lastModified: page.metadata.lastModified,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: results.length,
            pages: results,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Search
   */
  private async search(args: SearchArgs) {
    const {
      query,
      categories,
      keywords,
      search_in = ['title', 'content', 'metadata'],
      max_results = 20,
    } = args;

    const searchManager = this.wikiEngine!.getManager('SearchManager') as SearchManagerType;

    const options: Record<string, any> = {
      query,
      searchIn: search_in,
      maxResults: max_results,
    };

    if (categories && categories.length > 0) {
      options.categories = categories;
    }

    if (keywords && keywords.length > 0) {
      options.userKeywords = keywords;
    }

    const results = await searchManager.advancedSearch(options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: results.length,
            results: results.map((r: any) => ({
              title: r.title,
              score: r.score,
              excerpt: r.excerpt,
              category: r.category,
              keywords: r.keywords,
              uuid: r.uuid,
            })),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Get Metadata
   */
  private async getMetadata(args: GetMetadataArgs) {
    const { identifier } = args;
    const pageManager = this.wikiEngine!.getPageManager();

    if (!pageManager.pageExists(identifier)) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const metadata = await pageManager.getPageMetadata(identifier);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: List Categories
   */
  private async listCategories(args: ListCategoriesArgs) {
    const validationManager = this.wikiEngine!.getManager('ValidationManager') as ValidationManagerType;
    const categories = validationManager.getAllSystemCategories();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ categories }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: List Keywords
   */
  private async listKeywords(args: ListKeywordsArgs) {
    const validationManager = this.wikiEngine!.getManager('ValidationManager') as ValidationManagerType;
    const keywords = await validationManager.getAllUserKeywords();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ keywords }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Validate Metadata
   */
  private async validateMetadata(args: ValidateMetadataArgs) {
    const { metadata } = args;
    const validationManager = this.wikiEngine!.getManager('ValidationManager') as ValidationManagerType;

    const result = validationManager.validateMetadata(metadata);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Generate Metadata
   */
  private async generateMetadata(args: GenerateMetadataArgs) {
    const { title, category, keywords } = args;
    const validationManager = this.wikiEngine!.getManager('ValidationManager') as ValidationManagerType;

    const options: Record<string, any> = {};
    if (category) options['system-category'] = category;
    if (keywords) options['user-keywords'] = keywords;

    const metadata = validationManager.generateValidMetadata(title, options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Get Attachments
   */
  private async getAttachments(args: GetAttachmentsArgs) {
    const { page_name } = args;
    const attachmentManager = this.wikiEngine!.getManager('AttachmentManager') as PageManagerType;

    const attachments = await attachmentManager.listAttachments(page_name);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ attachments }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Search Similar
   */
  private async searchSimilar(args: SearchSimilarArgs) {
    const { page_name, limit = 10 } = args;
    const searchManager = this.wikiEngine!.getManager('SearchManager') as SearchManagerType;

    const similar = await searchManager.suggestSimilarPages(page_name, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ similar }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Get Configuration
   */
  private async getConfiguration(args: GetConfigurationArgs) {
    const { key } = args;
    const configManager: any = this.wikiEngine!.getManager('ConfigurationManager');

    if (key) {
      const value = configManager.get(key);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ [key]: value }, null, 2),
          },
        ],
      };
    }

    // Return all configuration (this could be large)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(configManager.getAllProperties(), null, 2),
        },
      ],
    };
  }

  /**
   * Tool Implementation: Get Search Statistics
   */
  private async getSearchStatistics(args: GetSearchStatisticsArgs) {
    const searchManager = this.wikiEngine!.getManager('SearchManager') as SearchManagerType;
    const stats = await searchManager.getStatistics();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('amdWiki MCP Server started');
  }
}

// Start the server
const server = new AmdWikiMCPServer();
server.start().catch(console.error);
