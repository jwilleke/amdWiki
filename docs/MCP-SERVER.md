# amdWiki MCP Server

The amdWiki MCP (Model Context Protocol) Server provides AI assistants like Claude with direct access to wiki content, search functionality, validation, and metadata operations.

## Overview

The MCP server exposes 12 specialized tools that allow AI assistants to:

- Query and search wiki pages
- Access metadata and categories
- Validate and generate page metadata
- Find similar pages and attachments
- Query configuration settings
- Get search statistics

## Installation

The MCP SDK is already installed as a dependency:

```bash
npm install
```

## Running the MCP Server

### Development Mode

```bash
npm run build  # Build TypeScript first
npm run mcp    # Start MCP server
```

The server runs in stdio mode, communicating via standard input/output as per the MCP specification.

### Integration with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "amdwiki": {
      "command": "node",
      "args": [
        "/path/to/amdWiki/dist/mcp-server.js"
      ],
      "cwd": "/path/to/amdWiki"
    }
  }
}
```

### Integration with Claude Code CLI

Add to your MCP settings file:

```json
{
  "mcpServers": {
    "amdwiki": {
      "command": "node",
      "args": [
        "/path/to/amdWiki/dist/mcp-server.js"
      ],
      "cwd": "/path/to/amdWiki"
    }
  }
}
```

## Available Tools

### 1. amdwiki_query_page

Get complete page content and metadata by identifier.

**Parameters:**

- `identifier` (string, required): Page title, UUID, or slug
- `include_content` (boolean, optional): Include full content (default: true)

**Example:**

```json
{
  "identifier": "Main",
  "include_content": true
}
```

**Returns:**

```json
{
  "title": "Main",
  "uuid": "abc123...",
  "slug": "main",
  "category": "general",
  "keywords": ["welcome", "introduction"],
  "lastModified": "2025-11-26T...",
  "editor": "admin",
  "content": "# Welcome to amdWiki..."
}
```

### 2. amdwiki_list_pages

List all pages with optional filtering.

**Parameters:**

- `category` (string, optional): Filter by system category
- `keywords` (array, optional): Filter by user keywords
- `limit` (number, optional): Max results (default: 50)

**Example:**

```json
{
  "category": "documentation",
  "keywords": ["tutorial"],
  "limit": 20
}
```

### 3. amdwiki_search

Full-text search with advanced filtering.

**Parameters:**

- `query` (string, required): Search text
- `categories` (array, optional): Filter by categories
- `keywords` (array, optional): Filter by keywords
- `search_in` (array, optional): Fields to search (default: ["title", "content", "metadata"])
- `max_results` (number, optional): Max results (default: 20)

**Example:**

```json
{
  "query": "validation metadata",
  "categories": ["documentation"],
  "max_results": 10
}
```

**Returns:**

```json
{
  "total": 5,
  "results": [
    {
      "title": "ValidationManager",
      "score": 0.95,
      "excerpt": "...validation of metadata...",
      "category": "documentation",
      "keywords": ["validation", "metadata"],
      "uuid": "5100a3df..."
    }
  ]
}
```

### 4. amdwiki_get_metadata

Get page metadata only (fast, no content).

**Parameters:**

- `identifier` (string, required): Page identifier

**Example:**

```json
{
  "identifier": "Main"
}
```

### 5. amdwiki_list_categories

Get all system categories with configurations.

**Parameters:** None

**Returns:**

```json
{
  "categories": [
    {
      "label": "general",
      "description": "General wiki pages",
      "default": true,
      "storageLocation": "regular",
      "enabled": true
    },
    {
      "label": "documentation",
      "description": "Documentation",
      "storageLocation": "required",
      "enabled": true
    }
  ]
}
```

### 6. amdwiki_list_keywords

Get all user keywords in use across pages.

**Parameters:** None

**Returns:**

```json
{
  "keywords": ["tutorial", "guide", "api", "configuration", ...]
}
```

### 7. amdwiki_validate_metadata

Validate page metadata structure.

**Parameters:**

- `metadata` (object, required): Metadata to validate

**Example:**

```json
{
  "metadata": {
    "title": "New Page",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "new-page",
    "system-category": "general",
    "user-keywords": ["example"]
  }
}
```

**Returns:**

```json
{
  "valid": true,
  "errors": []
}
```

### 8. amdwiki_generate_metadata

Generate valid metadata template for a new page.

**Parameters:**

- `title` (string, required): Page title
- `category` (string, optional): System category (default: "general")
- `keywords` (array, optional): User keywords (max 5)

**Example:**

```json
{
  "title": "My New Page",
  "category": "documentation",
  "keywords": ["tutorial", "guide"]
}
```

**Returns:** Complete valid metadata object ready for use.

### 9. amdwiki_get_attachments

List attachments for a page.

**Parameters:**

- `page_name` (string, required): Page identifier

**Example:**

```json
{
  "page_name": "Main"
}
```

**Returns:**

```json
{
  "attachments": [
    {
      "id": "attachment-uuid",
      "filename": "diagram.png",
      "size": 12345,
      "mimeType": "image/png",
      "uploadedBy": "admin",
      "uploadedAt": "2025-11-26T..."
    }
  ]
}
```

### 10. amdwiki_search_similar

Find pages similar to a given page.

**Parameters:**

- `page_name` (string, required): Reference page
- `limit` (number, optional): Max results (default: 10)

**Example:**

```json
{
  "page_name": "ValidationManager",
  "limit": 5
}
```

### 11. amdwiki_get_configuration

Get wiki configuration value(s).

**Parameters:**

- `key` (string, optional): Specific config key

**Example:**

```json
{
  "key": "amdwiki.page.provider"
}
```

If no key provided, returns all configuration (large response).

### 12. amdwiki_search_statistics

Get search index statistics.

**Parameters:** None

**Returns:**

```json
{
  "documentCount": 125,
  "indexSize": "2.3 MB",
  "lastIndexed": "2025-11-26T..."
}
```

## Use Cases

### 1. AI-Assisted Content Discovery

AI assistants can search and navigate your wiki content naturally:

```text
User: "Find all documentation pages about validation"
AI: Uses amdwiki_search with category filter
```

### 2. Context-Aware Development

When developing features, AI can pull relevant wiki documentation:

```text
User: "I'm working on the page manager, show me related docs"
AI: Uses amdwiki_search and amdwiki_search_similar
```

### 3. Metadata Management

AI can help validate and generate metadata:

```text
User: "Create metadata for a new tutorial page"
AI: Uses amdwiki_generate_metadata with appropriate category
```

### 4. Content Analysis

AI can analyze wiki structure and relationships:

```text
User: "What categories exist and how many pages in each?"
AI: Uses amdwiki_list_categories and amdwiki_list_pages
```

## Architecture

### Server Structure

```text
mcp-server.ts           # TypeScript source
├── Tool Definitions    # 12 tool schemas
├── Request Handlers    # ListTools, CallTool
└── WikiEngine Init     # Lazy initialization

dist/mcp-server.js      # Compiled JavaScript
```

### WikiEngine Integration

The MCP server initializes WikiEngine on first tool call and maintains a single instance for all subsequent requests. This provides access to:

- **PageManager**: Page CRUD operations
- **SearchManager**: Full-text search with Lunr
- **ValidationManager**: Metadata validation and category management
- **AttachmentManager**: File attachment operations
- **ConfigurationManager**: System configuration access

### Communication Protocol

The server uses **stdio transport** per MCP specification:

- Receives JSON-RPC requests via stdin
- Sends JSON-RPC responses via stdout
- Logs errors to stderr

## Error Handling

All tool calls return structured error responses:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Page not found: NonExistentPage"
    }
  ],
  "isError": true
}
```

Common errors:

- `Page not found`: Invalid identifier
- `Invalid metadata`: Validation failure
- `Manager not initialized`: WikiEngine initialization failed

## Performance Considerations

### Caching

The WikiEngine maintains in-memory caches:

- Page cache (full content)
- Title/UUID/Slug indexes
- Search index (Lunr)

### Lazy Loading

WikiEngine initializes only on first tool call, reducing startup time.

### Query Optimization

Use `include_content: false` for metadata-only queries to reduce response size.

## Security

### Access Control

The MCP server runs with full wiki access. Ensure:

- Server is only accessible to trusted AI assistants
- File system permissions are properly configured
- Configuration files are protected

### Data Exposure

Be aware that:

- All page content is accessible via MCP
- Configuration values can be queried
- No user authentication is enforced at MCP level

### Best Practices

1. Run MCP server in controlled environments
2. Use file system permissions to restrict data access
3. Monitor MCP server logs for unusual activity
4. Consider implementing rate limiting for production use

## Development

### Adding New Tools

1. Define tool schema in `ListToolsRequestSchema` handler
2. Add case to `CallToolRequestSchema` handler
3. Implement tool method in `AmdWikiMCPServer` class
4. Update documentation

Example:

```typescript
{
  name: 'amdwiki_my_tool',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' }
    },
    required: ['param']
  }
}
```

### Testing

```bash
# Build
npm run build

# Run MCP server manually
node dist/mcp-server.js

# Test with MCP client or inspector tool
```

### Debugging

Enable debug logging by adding to WikiEngine initialization:

```typescript
console.error('MCP Debug:', JSON.stringify(result, null, 2));
```

All debug output goes to stderr (not stdout, which is reserved for MCP protocol).

## Troubleshooting

### Server Won't Start

**Issue**: `Cannot find module '@modelcontextprotocol/sdk'`

**Solution**:

```bash
npm install
npm run build
```

### WikiEngine Initialization Fails

**Issue**: `Manager not initialized`

**Solution**: Check that:

- `config/` directory exists
- `pages/` and `required-pages/` directories exist
- Configuration files are valid JSON

### Tool Returns Empty Results

**Issue**: Search/list operations return no results

**Solution**:

- Verify pages exist: `ls pages/`
- Rebuild search index: Restart MCP server
- Check page metadata format

### Performance Issues

**Issue**: Slow tool responses

**Solution**:

- Use `include_content: false` when content not needed
- Reduce `max_results` and `limit` parameters
- Check disk I/O performance
- Monitor WikiEngine cache sizes

## Future Enhancements

Planned improvements:

- [ ] Page creation/editing tools
- [ ] User authentication integration
- [ ] Rate limiting
- [ ] Streaming responses for large content
- [ ] GraphQL-style queries
- [ ] Webhook notifications for page changes
- [ ] Export/import tools
- [ ] Backup management tools

## References

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [amdWiki Architecture](./architecture/)
- [ValidationManager](../required-pages/5100a3df-0d87-4d85-87de-359f51029c67.md)
- [Policies-Roles-Permissions](./architecture/Policies-Roles-Permissions.md)

## License

Same as amdWiki main license.
