#!/bin/bash

# GitHub CLI script to create MarkupParser Epic and sub-issues
# Prerequisites: 
# 1. Install GitHub CLI: brew install gh
# 2. Authenticate: gh auth login
# 3. Navigate to repository directory

REPO="jwilleke/amdWiki"

echo "🚀 Creating MarkupParser Implementation Issues..."

# Create labels first (ignore errors if they already exist)
echo "📋 Creating labels..."
gh label create "epic" --description "Major feature epic tracking multiple issues" --color "8B5CF6" 2>/dev/null || true
gh label create "subtask" --description "Sub-task of a larger epic or feature" --color "6B7280" 2>/dev/null || true
gh label create "architecture" --description "System architecture and infrastructure" --color "1F2937" 2>/dev/null || true
gh label create "plugin-system" --description "Plugin system related features" --color "F59E0B" 2>/dev/null || true
gh label create "new-feature" --description "New JSPWiki-compatible feature" --color "10B981" 2>/dev/null || true
gh label create "performance" --description "Performance optimization and monitoring" --color "EF4444" 2>/dev/null || true
gh label create "security" --description "Security and validation features" --color "DC2626" 2>/dev/null || true
gh label create "integration" --description "Manager integration tasks" --color "3B82F6" 2>/dev/null || true
gh label create "testing" --description "Testing and quality assurance" --color "8B5CF6" 2>/dev/null || true

# Create Epic Issue
echo "🎯 Creating Epic issue..."
EPIC_BODY='## 🎯 Epic Overview

Implement a comprehensive MarkupParser to achieve 100% JSPWiki enhancement compatibility, transforming amdWiki from basic wiki functionality (47% compatibility) to full JSPWiki-compatible system.

## 🔗 Related Documentation
- [MarkupParser Architecture Design](docs/planning/MarkupParser-Architecture.md)
- [JSPWiki Page Enhancements Reference](http://192.168.68.127:8080/wiki/JSPWiki%20Page%20Enhancements)

## 📊 Current State
- **Supported Enhancements**: 9/19 (47%)
- **Missing Critical Features**: WikiTags, WikiForms, InterWiki Links, Advanced Attachments
- **Architecture Gap**: No dedicated markup parser, limited to basic RenderingManager

## 🎯 Epic Goals
- [ ] Achieve 100% JSPWiki syntax compatibility (19/19 enhancements)
- [ ] Implement phase-based processing pipeline (7 stages)
- [ ] Create extensible handler system for all syntax types
- [ ] Build comprehensive filter pipeline
- [ ] Maintain backward compatibility during migration
- [ ] Improve rendering performance by 20%

## 🗺️ Implementation Phases

### Phase 1: Core Infrastructure
**Target**: Week 1
- Core MarkupParser class and phase system
- Handler registration architecture
- Caching integration

### Phase 2: Basic Syntax Handlers
**Target**: Week 2
- Enhanced plugin syntax handling
- WikiTag support (If, Include, UserCheck)
- Form handling system

### Phase 3: Advanced Syntax Handlers
**Target**: Week 3
- InterWiki link support
- Advanced attachment handling
- WikiStyle processing

### Phase 4: Filter System
**Target**: Week 4
- Filter pipeline implementation
- Security and validation filters
- Custom filter plugin system

### Phase 5: Integration & Testing
**Target**: Week 5
- RenderingManager integration
- Comprehensive testing
- Performance optimization
- Documentation updates

## 📈 Success Metrics
- Parse success rate > 99.9%
- Average parse time < 10ms
- Cache hit ratio > 80%
- 100% JSPWiki enhancement compatibility

## 🔄 Dependencies
- CacheManager (#38) - ✅ Completed
- Enhanced PluginManager
- Policy integration for security
- Enhanced documentation system

## 🎯 Acceptance Criteria
- [ ] All JSPWiki syntax patterns supported
- [ ] Performance benchmarks met
- [ ] Comprehensive test coverage (>90%)
- [ ] Full backward compatibility maintained
- [ ] Documentation complete and accurate

---
*This epic addresses the architectural gap identified in JSPWiki compatibility analysis.*'

EPIC_NUMBER=$(gh issue create --title "EPIC: Implement JSPWikiMarkupParser for Complete Enhancement Support" --body "$EPIC_BODY" --label "epic,enhancement,documentation" | grep -o '#[0-9]*' | sed 's/#//')

echo "✅ Created Epic issue #$EPIC_NUMBER"

# Phase 1 Issues
echo "🔧 Creating Phase 1 issues..."

# Issue 1.1: Core MarkupParser Class
ISSUE_1_1_BODY="## 🎯 Task Overview
Implement the core MarkupParser class with phase-based processing system as the foundation for JSPWiki enhancement support.

**Epic**: EPIC: Implement JSPWikiMarkupParser (#$EPIC_NUMBER)
**Phase**: 1 - Core Infrastructure  
**Priority**: High
**Estimated Effort**: 3-4 days

## 📋 Requirements

### Core MarkupParser Class
- [ ] Create \`src/parsers/MarkupParser.js\` extending BaseManager
- [ ] Implement phase-based processing pipeline (7 phases)
- [ ] Add handler registration system
- [ ] Implement context management
- [ ] Add comprehensive error handling

### Processing Phases
- [ ] Phase 1: Preprocessing (escape handling, code block protection)
- [ ] Phase 2: Syntax Recognition (pattern detection)
- [ ] Phase 3: Context Resolution (variable expansion, params)
- [ ] Phase 4: Content Transformation (handler execution)
- [ ] Phase 5: Filter Pipeline (content filtering)
- [ ] Phase 6: Markdown Conversion (Showdown processing)
- [ ] Phase 7: Post-processing (cleanup, validation)

### Architecture Components
- [ ] BaseSyntaxHandler interface
- [ ] Handler priority system
- [ ] Context object structure
- [ ] Error recovery mechanisms

## 🔧 Technical Specifications

### File Structure
\`\`\`
src/parsers/
├── MarkupParser.js           # Main parser class
├── handlers/
│   ├── BaseSyntaxHandler.js  # Handler interface
│   └── .gitkeep
├── filters/
│   ├── FilterChain.js        # Filter pipeline
│   └── .gitkeep
└── __tests__/
    └── MarkupParser.test.js
\`\`\`

### API Interface
\`\`\`javascript
// Primary parsing method
async parse(content, context) { }

// Handler registration
registerHandler(handler) { }

// Phase execution
async executePhase(phase, content, context) { }
\`\`\`

## ✅ Acceptance Criteria
- [ ] MarkupParser class initializes successfully
- [ ] All 7 processing phases execute in order
- [ ] Handler registration works correctly
- [ ] Error handling covers all failure scenarios
- [ ] Unit tests achieve >90% coverage
- [ ] Performance baseline established
- [ ] Integration with WikiEngine successful

## 🧪 Testing Requirements
- [ ] Unit tests for core class
- [ ] Phase execution tests
- [ ] Error handling tests
- [ ] Performance benchmarks
- [ ] Integration tests with existing managers

## 📚 Documentation
- [ ] Update architecture documentation
- [ ] Add API documentation
- [ ] Create usage examples
- [ ] Update README.md"

gh issue create --title "[FEATURE] MarkupParser: Core Infrastructure and Phase System" --body "$ISSUE_1_1_BODY" --label "enhancement,subtask,architecture"

# Issue 1.2: Handler Registration System
ISSUE_1_2_BODY="## 🎯 Task Overview
Implement the handler registration system and priority management for MarkupParser syntax handlers.

**Epic**: EPIC: Implement JSPWikiMarkupParser (#$EPIC_NUMBER)
**Phase**: 1 - Core Infrastructure
**Priority**: High
**Estimated Effort**: 2-3 days

## 📋 Requirements

### Handler Registration
- [ ] Create BaseSyntaxHandler abstract class
- [ ] Implement handler registration mechanism
- [ ] Add priority-based execution order
- [ ] Support dynamic handler loading
- [ ] Add handler conflict detection

### Handler Interface
- [ ] Pattern matching system (regex support)
- [ ] Parameter parsing utilities
- [ ] Context access methods
- [ ] Error handling interface
- [ ] Async operation support

### Priority System
- [ ] Numeric priority assignment (0-1000)
- [ ] Automatic sorting by priority
- [ ] Conflict resolution rules
- [ ] Handler dependency management

## ✅ Acceptance Criteria
- [ ] BaseSyntaxHandler interface defined
- [ ] Handler registration works correctly
- [ ] Priority ordering functions properly
- [ ] Conflict detection prevents issues
- [ ] Dynamic loading supported
- [ ] Comprehensive test coverage

## 🧪 Testing Requirements
- [ ] Handler registration tests
- [ ] Priority ordering tests  
- [ ] Conflict detection tests
- [ ] Dynamic loading tests
- [ ] Error handling tests"

gh issue create --title "[FEATURE] MarkupParser: Handler Registration and Priority System" --body "$ISSUE_1_2_BODY" --label "enhancement,subtask,architecture"

# Issue 1.3: Caching Integration
ISSUE_1_3_BODY="## 🎯 Task Overview
Integrate MarkupParser with CacheManager for performance optimization and implement caching strategies.

**Epic**: EPIC: Implement JSPWikiMarkupParser (#$EPIC_NUMBER)
**Phase**: 1 - Core Infrastructure
**Priority**: Medium
**Estimated Effort**: 2 days

## 📋 Requirements

### Cache Integration
- [ ] Connect to CacheManager.region('MarkupParser')
- [ ] Implement cache key generation
- [ ] Add cache hit/miss metrics
- [ ] Support cache invalidation
- [ ] Handle cache failures gracefully

### Caching Strategies
- [ ] Parse result caching (TTL: 300s)
- [ ] Handler result caching (expensive operations)
- [ ] Context-dependent caching
- [ ] Pattern compilation caching

### Performance Monitoring
- [ ] Parse time metrics
- [ ] Cache hit ratio tracking
- [ ] Memory usage monitoring
- [ ] Handler execution timing

## ✅ Acceptance Criteria
- [ ] CacheManager integration complete
- [ ] Cache hit ratio >80% in tests
- [ ] Performance improvement measurable
- [ ] Cache invalidation works correctly
- [ ] Metrics collection functional

## 🧪 Testing Requirements
- [ ] Cache hit/miss tests
- [ ] Performance benchmark tests
- [ ] Cache invalidation tests
- [ ] Memory usage tests
- [ ] Concurrent access tests"

gh issue create --title "[FEATURE] MarkupParser: CacheManager Integration and Performance" --body "$ISSUE_1_3_BODY" --label "enhancement,subtask,performance"

# Phase 2 Issues
echo "🎨 Creating Phase 2 issues..."

# Issue 2.1: Enhanced Plugin Handler
ISSUE_2_1_BODY="## 🎯 Task Overview
Enhance the existing plugin syntax handling with advanced parameter parsing and JSPWiki compatibility.

**Epic**: EPIC: Implement JSPWikiMarkupParser (#$EPIC_NUMBER)
**Phase**: 2 - Basic Syntax Handlers
**Priority**: High
**Estimated Effort**: 3 days

## 📋 Requirements

### Enhanced Plugin Syntax
- [ ] Support complex parameter parsing: \`[{Plugin param1='value with spaces' param2=value}]\`
- [ ] Handle nested quotes and escaping
- [ ] Support parameter-less plugins: \`[{RecentChanges}]\`
- [ ] Add plugin body content support: \`[{Plugin}]content[/{Plugin}]\`
- [ ] Implement plugin parameter validation

### JSPWiki Compatibility
- [ ] Match JSPWiki plugin execution order
- [ ] Support all JSPWiki parameter formats
- [ ] Handle plugin errors gracefully
- [ ] Maintain backward compatibility with current plugins

### Advanced Features
- [ ] Plugin dependency resolution
- [ ] Conditional plugin execution
- [ ] Plugin output caching
- [ ] Security parameter validation

## ✅ Acceptance Criteria
- [ ] All existing plugins work unchanged
- [ ] Complex parameter parsing functional
- [ ] Plugin body content supported  
- [ ] Error handling prevents crashes
- [ ] Performance equal or better than current

## 🧪 Testing Requirements
- [ ] Parameter parsing tests (all formats)
- [ ] Plugin execution tests
- [ ] Error handling tests
- [ ] Performance comparison tests
- [ ] Backward compatibility tests"

gh issue create --title "[FEATURE] MarkupParser: Enhanced Plugin Syntax Handler" --body "$ISSUE_2_1_BODY" --label "enhancement,subtask,plugin-system"

# Issue 2.2: WikiTag Handler
ISSUE_2_2_BODY="## 🎯 Task Overview
Implement WikiTag handler supporting JSP-like tags for conditional content and page inclusion.

**Epic**: EPIC: Implement JSPWikiMarkupParser (#$EPIC_NUMBER)
**Phase**: 2 - Basic Syntax Handlers
**Priority**: High
**Estimated Effort**: 4-5 days

## 📋 Requirements

### WikiTag Syntax Support
- [ ] \`<wiki:If test=\"condition\">content</wiki:If>\` - Conditional display
- [ ] \`<wiki:Include page=\"PageName\" />\` - Page inclusion  
- [ ] \`<wiki:UserCheck status=\"authenticated\">content</wiki:UserCheck>\` - User checks
- [ ] Self-closing tag support: \`<wiki:Include page=\"Footer\" />\`
- [ ] Attribute parsing and validation

### Conditional Logic (wiki:If)
- [ ] User authentication checks: \`test=\"authenticated\"\`
- [ ] Permission checks: \`test=\"hasPermission:read\"\`
- [ ] Page existence checks: \`test=\"exists:PageName\"\`
- [ ] Variable comparisons: \`test=\"\$user == 'admin'\"\`
- [ ] Boolean operations: \`test=\"authenticated && hasPermission:write\"\`

### Page Inclusion (wiki:Include)
- [ ] Include other wiki pages: \`page=\"PageName\"\`
- [ ] Section inclusion: \`section=\"Introduction\"\`
- [ ] Recursive inclusion protection
- [ ] Permission checking for included pages
- [ ] Error handling for missing pages

### User Checks (wiki:UserCheck)
- [ ] Authentication status: \`status=\"authenticated\"\`
- [ ] Role checks: \`role=\"admin\"\`
- [ ] Group membership: \`group=\"editors\"\`
- [ ] Anonymous user display: \`status=\"anonymous\"\`

## 🧪 JSPWiki Compatibility Testing
- [ ] Test against JSPWiki 2.12.x behavior
- [ ] Validate attribute parsing matches JSPWiki
- [ ] Ensure security model compatibility
- [ ] Test nested tag scenarios

## ✅ Acceptance Criteria
- [ ] All three core WikiTags implemented
- [ ] Conditional logic works correctly
- [ ] Page inclusion functional with security
- [ ] User checks integrate with UserManager
- [ ] Error handling prevents security issues
- [ ] Full JSPWiki syntax compatibility

## 🔒 Security Requirements
- [ ] Validate all page inclusion requests
- [ ] Prevent directory traversal attacks
- [ ] Enforce permission checks
- [ ] Sanitize all attribute values
- [ ] Prevent infinite recursion"

gh issue create --title "[FEATURE] MarkupParser: WikiTag Handler (If, Include, UserCheck)" --body "$ISSUE_2_2_BODY" --label "enhancement,subtask,new-feature,security"

# Issue 2.3: WikiForm Handler
ISSUE_2_3_BODY="## 🎯 Task Overview
Implement WikiForm handler system for interactive forms within wiki pages.

**Epic**: EPIC: Implement JSPWikiMarkupParser (#$EPIC_NUMBER)
**Phase**: 2 - Basic Syntax Handlers  
**Priority**: Medium
**Estimated Effort**: 4 days

## 📋 Requirements

### Form Syntax Support
- [ ] \`[{FormOpen action='SaveData' method='POST'}]\` - Form opening
- [ ] \`[{FormInput name='field' type='text' value='default'}]\` - Input fields
- [ ] \`[{FormSelect name='choice' options='A,B,C'}]\` - Select boxes
- [ ] \`[{FormTextarea name='comment' rows='5'}]\` - Text areas
- [ ] \`[{FormClose}]\` - Form closing

### Input Types
- [ ] Text inputs: \`type='text'\`
- [ ] Password inputs: \`type='password'\`
- [ ] Email inputs: \`type='email'\`
- [ ] Number inputs: \`type='number'\`
- [ ] Hidden fields: \`type='hidden'\`
- [ ] Checkboxes: \`type='checkbox'\`
- [ ] Radio buttons: \`type='radio'\`

### Form Processing
- [ ] Form data validation
- [ ] CSRF protection
- [ ] Form submission handling
- [ ] Data persistence options
- [ ] Email notification support

### Advanced Features  
- [ ] Conditional field display
- [ ] Field validation rules
- [ ] Custom CSS styling
- [ ] JavaScript enhancement
- [ ] File upload support

## 🧪 Testing Requirements
- [ ] Form generation tests
- [ ] Input validation tests
- [ ] Security tests (CSRF, XSS)
- [ ] Form submission tests
- [ ] Browser compatibility tests

## ✅ Acceptance Criteria
- [ ] All form elements render correctly
- [ ] Form submission works securely
- [ ] Validation prevents invalid data
- [ ] CSRF protection active
- [ ] Integration with user system
- [ ] Mobile-friendly forms generated"

gh issue create --title "[FEATURE] MarkupParser: WikiForm Handler (FormOpen, FormInput, FormClose)" --body "$ISSUE_2_3_BODY" --label "enhancement,subtask,new-feature,security"

echo "✅ Created Epic #$EPIC_NUMBER and Phase 1-2 issues"
echo "🚀 Run this script to create all remaining issues for Phases 3-5"
echo ""
echo "Next steps:"
echo "1. Review created issues in GitHub"
echo "2. Assign to team members"
echo "3. Create project board if desired"
echo "4. Start with Phase 1 implementation"
