# amdWiki vs Apache JSPWiki Architecture Comparison

This document compares the rendering pipeline architecture of amdWiki (Node.js) with Apache JSPWiki (Java), highlighting similarities, differences, and implementation approaches.

## Architecture Overview Comparison

### Apache JSPWiki (Java/JSP)

```text
Java Web Application (Servlet API 3.1)
├── WikiEngine (Central Controller)
├── RenderingManager
│   ├── XHTMLRenderer
│   ├── CreoleRenderer
│   ├── CleanTextRenderer
│   └── WysiwygEditingRenderer
├── PluginManager / DefaultPluginManager
│   └── Built-in Plugins (Java Classes)
├── Security (JAAS-based)
│   └── WEB-INF/jspwiki.policy
└── Configuration: jspwiki-custom.properties
```

### amdWiki (Node.js/Express)

```text
Node.js Web Application (Express Framework)
├── WikiEngine (Central Manager Orchestrator)
├── MarkupParser (7-Phase Pipeline)
│   ├── Syntax Handlers (8 Handlers)
│   ├── Filter Pipeline (3 Filters)
│   ├── PluginManager
│   └── HTML Protection System
├── RenderingManager (Advanced/Legacy)
├── Security (Multi-layered)
│   ├── SecurityFilter + SpamFilter + ValidationFilter
│   └── ACLManager + PolicyEvaluator
└── Configuration: app-default/custom-config.json
```

## Detailed Component Comparison

### 1. Core Engine Architecture

| Aspect | Apache JSPWiki | amdWiki |
|--------|----------------|---------|
| **Language** | Java | Node.js/JavaScript |
| **Runtime** | JVM (JDK 11+) | Node.js Runtime |
| **Web Framework** | Servlet API 3.1, JSP | Express.js |
| **Deployment** | WAR file to Tomcat/Jetty | npm package, PM2/Docker |
| **Central Controller** | `WikiEngine.java` | `WikiEngine.js` + Manager System |

### 2. Rendering Pipeline Architecture

#### Apache JSPWiki Rendering Flow

```text
Raw Wiki Content
       ↓
WikiEngine.getHTML()
       ↓
RenderingManager
       ↓
Strategy Pattern: Select Renderer
├── XHTMLRenderer (Primary)
├── CreoleRenderer (Alternative markup)
├── CleanTextRenderer (Plain text)
└── WysiwygEditingRenderer (Editor)
       ↓
Plugin Processing (PluginManager)
       ↓
Security Filtering (JAAS)
       ↓
Final HTML Output
```

#### amdWiki 7-Phase Pipeline

```text
Raw Wiki Content
       ↓
Phase 1: Preprocessing (Normalization)
       ↓
Phase 2: Syntax Recognition (8 Handlers)
       ↓
Phase 3: Context Resolution (Link Graph)
       ↓
Phase 4: Content Transformation + HTML Protection
       ↓
Phase 5: Filter Pipeline (Security/Spam/Validation)
       ↓
Phase 6: Markdown Conversion (Showdown.js)
       ↓
Phase 7: Post-processing + Token Restoration
       ↓
Final HTML Output
```

### 3. Plugin System Comparison

#### Apache JSPWiki Plugins

- **Interface**: `WikiPlugin` (Java interface)
- **Manager**: `PluginManager.java` / `DefaultPluginManager.java`
- **Location**: `org.apache.wiki.plugin` package
- **Type Safety**: Java compile-time type checking
- **Built-in Plugins**:
  - `CurrentTimePlugin`
  - `RecentChangesPlugin`
  - `SearchPlugin`
  - `ReferringPagesPlugin`
  - `WeblogPlugin`
  - `TableOfContents`

#### amdWiki Plugins

- **Interface**: JavaScript module exports (`execute` method)
- **Manager**: `PluginManager.js` with dynamic loading
- **Location**: `/plugins/` directory
- **Type Safety**: Runtime validation with parameter schemas
- **Built-in Plugins**:
  - `ImagePlugin.js`
  - `SessionsPlugin.js`
  - `TotalPagesPlugin.js`
  - `UptimePlugin.js`
  - `ReferringPagesPlugin.js`

### 4. Security Architecture

#### Apache JSPWiki Security

```text
JAAS (Java Authentication & Authorization)
├── WEB-INF/jspwiki.policy (Access Control)
├── Enterprise security integration
├── Servlet container security
└── Type-safe Java security model
```

#### amdWiki Security

```text
Multi-layered Node.js Security
├── SecurityFilter (XSS, CSRF, HTML Sanitization)
├── SpamFilter (Link limits, domain blacklists)
├── ValidationFilter (Content validation)
├── ACLManager (Page-level permissions)
├── PolicyEvaluator (Rule-based access control)
└── HTML Protection System (Double-encoding prevention)
```

### 5. Configuration Management

| Aspect | Apache JSPWiki | amdWiki |
|--------|----------------|---------|
| **Primary Config** | `jspwiki-custom.properties` | `app-custom-config.json` |
| **Format** | Java Properties | Hierarchical JSON |
| **Override System** | Properties file cascade | JSON merge with defaults |
| **Deployment Config** | WAR deployment descriptors | Environment variables + JSON |
| **Security Config** | `jspwiki.policy` (JAAS) | JSON policy definitions |

## Key Architectural Differences

### 1. Processing Philosophy

#### Apache JSPWiki: Strategy Pattern

- **Multiple Renderers**: Different renderer classes for different output formats
- **Renderer Selection**: Strategy pattern chooses appropriate renderer
- **Extensibility**: Add new renderers by implementing renderer interface
- **Focus**: Format-specific rendering strategies

#### amdWiki: Pipeline Processing

- **Single Pipeline**: One 7-phase pipeline handles all processing
- **Handler Priority**: Ordered handler execution within phases
- **Extensibility**: Add handlers/filters to existing pipeline phases
- **Focus**: Comprehensive processing with security integration

### 2. Plugin Integration

#### Apache JSPWiki

```java
public interface WikiPlugin {
    public String execute(WikiContext context, Map<String, String> params)
        throws PluginException;
}
```

- **Compile-time Safety**: Java interface ensures method signatures
- **Context Object**: Rich `WikiContext` with full engine access
- **Exception Handling**: Typed exception handling
- **Performance**: Compiled Java performance

#### amdWiki

```javascript
module.exports = {
    async execute(pluginName, pageName, params, context) {
        // Plugin implementation
        return htmlOutput;
    }
};
```

- **Runtime Flexibility**: Dynamic loading and parameter validation
- **Async Support**: Native Promise/async-await support
- **Context Isolation**: Controlled context exposure
- **Performance**: V8 JavaScript engine optimization

### 3. Security Models

#### Apache JSPWiki: Enterprise Security

- **JAAS Integration**: Full Java Authentication and Authorization Service
- **Container Security**: Leverages servlet container security
- **Policy Files**: Declarative security policies
- **Type Safety**: Compile-time security contract validation

#### amdWiki: Layered Web Security

- **Filter Chain**: Multiple security filters in processing pipeline
- **HTML Protection**: Prevents double-encoding vulnerabilities
- **Content Validation**: Real-time content security analysis
- **Dynamic Policies**: Runtime policy evaluation and updates

### 4. Performance Characteristics

| Aspect | Apache JSPWiki | amdWiki |
|--------|----------------|---------|
| **Startup Time** | Slower (JVM warmup) | Faster (Node.js startup) |
| **Runtime Performance** | Optimized JVM execution | V8 JavaScript optimization |
| **Memory Usage** | Higher JVM overhead | Lower Node.js footprint |
| **Concurrency Model** | Thread-based (servlet model) | Event-driven (single-threaded) |
| **Caching** | JVM heap + external | In-memory + Redis integration |

## Compatibility Analysis

### Syntax Compatibility

Both systems support identical JSPWiki markup:

- **Plugin Syntax**: `[{PluginName param=value}]` ✅
- **Variable Syntax**: `[{$variablename}]` ✅
- **Escaped Syntax**: `[[{syntax}]` ✅
- **Wiki Links**: `[PageName]` ✅
- **Inter-wiki Links**: `[WikiName:PageName]` ✅

### Plugin Compatibility

| Plugin | JSPWiki | amdWiki | Compatibility |
|--------|---------|---------|---------------|
| ReferringPages | ✅ | ✅ | Full |
| CurrentTime | ✅ | ⚠️ (as UptimePlugin) | Functional |
| Search | ✅ | ✅ | Full |
| Image | ⚠️ (built-in) | ✅ | Enhanced |
| TableOfContents | ✅ | ⚠️ (planned) | Partial |

## Migration Considerations

### From JSPWiki to amdWiki

**Advantages of amdWiki:**

- **Faster Development**: JavaScript ecosystem and npm packages
- **Modern Web Stack**: Express.js, modern frontend integration
- **Enhanced Security**: Multi-layered security with HTML protection
- **Better Performance**: Event-driven architecture for web workloads
- **Easier Deployment**: Docker/container-friendly, cloud-native

**Challenges:**

- **Plugin Migration**: Java plugins need JavaScript rewrite
- **Configuration Changes**: Properties files → JSON configuration
- **Security Model**: JAAS policies → JSON-based ACL system
- **Enterprise Features**: Some enterprise Java features may need adaptation

### Recommended Migration Path

1. **Content Migration**: Export JSPWiki pages → Import to amdWiki
2. **Plugin Assessment**: Inventory existing plugins → Rewrite in JavaScript
3. **Security Mapping**: JAAS policies → amdWiki ACL configuration
4. **Testing**: Comprehensive rendering compatibility testing
5. **Performance Tuning**: Node.js optimization for production load

## Conclusion

Both Apache JSPWiki and amdWiki provide robust wiki processing capabilities with different architectural approaches:

- **Apache JSPWiki**: Mature, enterprise-focused Java platform with proven scalability
- **amdWiki**: Modern, flexible Node.js platform with enhanced security and web-native features

The choice depends on organizational requirements:

- Choose **JSPWiki** for enterprise Java environments with existing infrastructure
- Choose **amdWiki** for modern web applications requiring flexibility and rapid development

Both maintain excellent JSPWiki markup compatibility while offering unique architectural advantages suited to their respective ecosystems.
