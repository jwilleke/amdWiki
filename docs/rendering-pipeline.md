# amdWiki Rendering Pipeline

The amdWiki rendering system uses a sophisticated 7-phase MarkupParser pipeline that provides 100% JSPWiki compatibility while maintaining extensibility and security.

## Overview

The rendering pipeline transforms wiki markup through seven distinct phases, each handling specific aspects of content processing:

```
Raw Wiki Content
       ↓
Phase 1: Preprocessing
       ↓
Phase 2: Syntax Recognition
       ↓
Phase 3: Context Resolution
       ↓
Phase 4: Content Transformation
       ↓
Phase 5: Filter Pipeline
       ↓
Phase 6: Markdown Conversion
       ↓
Phase 7: Post-processing
       ↓
Final HTML Output
```

## Phase Details

### Phase 1: Preprocessing
**Purpose**: Normalize content and prepare for processing
- Normalizes line endings and whitespace
- Handles character encoding
- Prepares initial parse context

### Phase 2: Syntax Recognition
**Purpose**: Identify and categorize wiki syntax elements
- Recognizes JSPWiki plugins: `[{PluginName param=value}]`
- Identifies system variables: `[{$variablename}]`
- Detects escaped syntax: `[[{syntax}]`
- Finds wiki links, attachments, and other markup

**Handler Priority Order** (highest to lowest):
1. **EscapedSyntaxHandler** (Priority: 100) - JSPWiki double bracket escaping
2. **WikiTagHandler** (Priority: 95) - Wiki tag processing
3. **PluginSyntaxHandler** (Priority: 90) - Plugin execution
4. **WikiFormHandler** (Priority: 85) - Form processing
5. **InterWikiLinkHandler** (Priority: 80) - InterWiki links
6. **AttachmentHandler** (Priority: 75) - File attachments
7. **WikiStyleHandler** (Priority: 70) - Style processing
8. **WikiLinkHandler** (Priority: 50) - Basic wiki links

### Phase 3: Context Resolution
**Purpose**: Build relationships and resolve references
- Creates link graph for page relationships
- Resolves plugin dependencies
- Builds context for cross-references

### Phase 4: Content Transformation
**Purpose**: Execute plugins and transform content
- **Plugin Execution**: Runs JSPWiki-compatible plugins
- **Variable Expansion**: Processes system variables like `[{$pagename}]`
- **HTML Protection**: Critical step that prevents double-encoding

#### HTML Protection System
The HTML Protection System is crucial for preventing double-encoding of generated HTML:

```javascript
// Before Protection:
content = '<img src="test.jpg" alt="Test" />'

// After Protection:
content = 'HTMLTOKEN0HTMLTOKEN'
context.protectedBlocks = ['<img src="test.jpg" alt="Test" />']
```

**Protected Elements**:
- `<ul>` and `<ol>` lists with nested `<li>` and `<a>` elements
- `<a>` anchor tags (standalone)
- `<img>` self-closing tags (from Image plugin)
- `<span>`, `<div>`, `<strong>`, `<em>`, `<code>` tags

### Phase 5: Filter Pipeline
**Purpose**: Apply security, validation, and content filters

**Filter Priority Order** (highest to lowest):
1. **SecurityFilter** (Priority: 110) - XSS, CSRF, HTML sanitization
2. **SpamFilter** (Priority: 100) - Spam detection and prevention
3. **ValidationFilter** (Priority: 90) - Content validation

#### SecurityFilter Integration
The SecurityFilter now preserves HTML protection tokens:

```javascript
// Preserve HTMLTOKEN placeholders
const htmlTokens = [];
let secureContent = content.replace(/HTMLTOKEN\d+HTMLTOKEN/g, (match) => {
  const placeholder = `SECURITYPROTECTED${htmlTokens.length}SECURITYPROTECTED`;
  htmlTokens.push(match);
  return placeholder;
});

// Apply security filtering...

// Restore HTMLTOKEN placeholders
secureContent = secureContent.replace(/SECURITYPROTECTED(\d+)SECURITYPROTECTED/g, (match, index) => {
  return htmlTokens[parseInt(index)] || match;
});
```

### Phase 6: Markdown Conversion
**Purpose**: Convert remaining markdown to HTML
- Uses Showdown.js for markdown processing
- Applies markdown extensions
- Converts standard markdown syntax

### Phase 7: Post-processing
**Purpose**: Final HTML cleanup and restoration
- **HTML Token Restoration**: Replaces HTMLTOKEN placeholders with original HTML
- **Link Processing**: Finalizes link attributes and classes
- **HTML Cleanup**: Removes artifacts and normalizes output

```javascript
// Token Restoration Example:
processedContent = processedContent.replace(/HTMLTOKEN(\d+)HTMLTOKEN/g, (match, index) => {
  return context.protectedBlocks[parseInt(index)] || match;
});
```

## JSPWiki Compatibility Features

### Plugin System
- **Normal Execution**: `[{Image src='test.jpg' alt='Test'}]` → `<img src="test.jpg" alt="Test" class="wiki-image" />`
- **Escaped Syntax**: `[[{Image src='test.jpg' alt='Test'}]` → `[{Image src='test.jpg' alt='Test'}]` (literal)

### System Variables
- `[{$pagename}]` - Current page name
- `[{$totalpages}]` - Total number of pages
- `[{$uptime}]` - Server uptime
- `[{$applicationname}]` - Application name
- `[{$baseurl}]` - Base URL
- `[{$timestamp}]` - Current ISO timestamp

### Supported Plugins
- **Image**: Display images with customizable attributes
- **SessionsPlugin**: Show active session count
- **TotalPagesPlugin**: Display total page count
- **UptimePlugin**: Show server uptime
- **ReferringPagesPlugin**: List pages that reference current page

## Configuration

The rendering pipeline is configured through `app-default-config.json` and can be overridden in `app-custom-config.json`:

```json
{
  "amdwiki": {
    "markup": {
      "enabled": true,
      "useAdvancedParser": true,
      "handlers": {
        "plugin": { "enabled": true },
        "variable": { "enabled": true },
        "wikilink": { "enabled": true },
        "escaped": { "enabled": true }
      },
      "filters": {
        "enabled": true,
        "security": {
          "preventXSS": true,
          "sanitizeHTML": true,
          "allowedTags": "a,img,ul,ol,li,p,br,strong,em,code,pre,blockquote,h1,h2,h3,h4,h5,h6,hr,table,thead,tbody,tr,th,td",
          "allowedAttributes": "href,src,alt,title,class,id"
        }
      }
    }
  }
}
```

## Performance Features

### Caching System
The pipeline includes multi-level caching:

- **Parse Results Cache**: TTL 300s
- **Handler Results Cache**: TTL 600s
- **Pattern Cache**: TTL 3600s
- **Variable Cache**: TTL 300s

### Performance Monitoring
Tracks key metrics with configurable alerts:
- Parse time threshold: 100ms
- Cache hit ratio minimum: 60%
- Error rate maximum: 5%

## Architecture Benefits

### Modularity
Each phase is independent and configurable, allowing for:
- Easy extension with new handlers
- Granular feature control
- Custom filter development

### Security
Multi-layered security approach:
- HTML sanitization in SecurityFilter
- XSS prevention at multiple levels
- Content validation throughout pipeline

### Extensibility
- Plugin system for custom functionality
- Handler priority system for processing order
- Filter chain for content processing
- Configuration override system

## Error Handling

The pipeline includes comprehensive error handling:
- Graceful degradation when handlers fail
- Detailed error logging with context
- Fallback to legacy renderer when needed
- Security violation logging and alerts

## Integration Points

### Link Graph
Maintains relationships between pages for:
- ReferringPagesPlugin functionality
- Orphaned page detection
- Navigation assistance

### Search Integration
Pipeline output feeds into search indexing for:
- Full-text search capabilities
- Metadata extraction
- Content categorization

This rendering pipeline provides a robust, secure, and extensible foundation for JSPWiki-compatible wiki markup processing while maintaining high performance and comprehensive feature support.