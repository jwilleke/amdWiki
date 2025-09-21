#!/bin/bash

# GitHub REST API script to create MarkupParser issues using curl
# Prerequisites: 
# 1. Set GITHUB_TOKEN environment variable with your personal access token
# 2. Replace REPO_OWNER and REPO_NAME with your values

REPO_OWNER="jwilleke"
REPO_NAME="amdWiki"
API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME"

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable not set"
    echo "Please set it with: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo "🚀 Creating MarkupParser Issues via GitHub API..."

# Function to create label
create_label() {
    local name="$1"
    local description="$2"
    local color="$3"
    
    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_URL/labels" \
        -d "{\"name\":\"$name\",\"description\":\"$description\",\"color\":\"$color\"}" > /dev/null 2>&1
}

# Function to create issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    response=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_URL/issues" \
        -d "{\"title\":\"$title\",\"body\":\"$body\",\"labels\":[$labels]}")
    
    echo "$response" | grep -o '"number":[0-9]*' | cut -d':' -f2
}

# Create labels
echo "📋 Creating labels..."
create_label "epic" "Major feature epic tracking multiple issues" "8B5CF6"
create_label "subtask" "Sub-task of a larger epic or feature" "6B7280"
create_label "architecture" "System architecture and infrastructure" "1F2937"
create_label "plugin-system" "Plugin system related features" "F59E0B"
create_label "new-feature" "New JSPWiki-compatible feature" "10B981"
create_label "performance" "Performance optimization and monitoring" "EF4444"
create_label "security" "Security and validation features" "DC2626"
create_label "integration" "Manager integration tasks" "3B82F6"
create_label "testing" "Testing and quality assurance" "8B5CF6"

# Create Epic Issue
echo "🎯 Creating Epic issue..."
EPIC_TITLE="EPIC: Implement JSPWikiMarkupParser for Complete Enhancement Support"
EPIC_BODY="## 🎯 Epic Overview

Implement a comprehensive MarkupParser to achieve 100% JSPWiki enhancement compatibility, transforming amdWiki from basic wiki functionality (47% compatibility) to full JSPWiki-compatible system.

## 🔗 Related Documentation
- [MarkupParser Architecture Design](docs/planning/MarkupParser-Architecture.md)
- [GitHub Issues Plan](docs/planning/GitHub-Issues-MarkupParser.md)

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

## 📈 Success Metrics
- Parse success rate > 99.9%
- Average parse time < 10ms
- Cache hit ratio > 80%
- 100% JSPWiki enhancement compatibility

## ✅ Acceptance Criteria
- [ ] All JSPWiki syntax patterns supported
- [ ] Performance benchmarks met
- [ ] Comprehensive test coverage (>90%)
- [ ] Full backward compatibility maintained
- [ ] Documentation complete and accurate"

EPIC_NUMBER=$(create_issue "$EPIC_TITLE" "$EPIC_BODY" "\"epic\",\"enhancement\",\"documentation\"")

echo "✅ Created Epic issue #$EPIC_NUMBER"

# Create first few issues as examples
echo "🔧 Creating Phase 1 issue..."

ISSUE_TITLE="[FEATURE] MarkupParser: Core Infrastructure and Phase System"
ISSUE_BODY="## 🎯 Task Overview
Implement the core MarkupParser class with phase-based processing system.

**Epic**: #$EPIC_NUMBER - Implement JSPWikiMarkupParser
**Phase**: 1 - Core Infrastructure
**Priority**: High
**Estimated Effort**: 3-4 days

## ✅ Acceptance Criteria
- [ ] MarkupParser class initializes successfully
- [ ] All 7 processing phases execute in order
- [ ] Handler registration works correctly
- [ ] Unit tests achieve >90% coverage"

ISSUE_1=$(create_issue "$ISSUE_TITLE" "$ISSUE_BODY" "\"enhancement\",\"subtask\",\"architecture\"")

echo "✅ Created issue #$ISSUE_1"

echo ""
echo "🎉 **Sample Issues Created Successfully!**"
echo "Epic: #$EPIC_NUMBER"
echo "First Issue: #$ISSUE_1"
echo ""
echo "To create all remaining issues, continue adding similar curl commands for each phase."
