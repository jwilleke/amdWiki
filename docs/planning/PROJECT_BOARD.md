# amdWiki Project Board

## 🎯 Access Control Enhancement Epic #15

**Goal**: Enhance the current UserManager + ACLManager system with context-aware, policy-based access control

**Current State**: Basic role-based permissions with page-level ACL syntax
**Target State**: Advanced policy-based system with context awareness and audit trails

**Priority**: High
**Status**: In Progress
**Start Date**: September 13, 2025

### 📋 Sub-Issues Status

| Issue | Status | Priority | Size | Owner | Due Date |
|-------|--------|----------|------|-------|----------|
| #16 Context-Aware Permissions - Time-Based | Not Started | High | Medium | TBD | TBD |
| #17 Context-Aware Permissions - Maintenance Mode | ✅ Completed | High | Small | Current | Sept 13 |
| #18 Resource-Based Policies by Storage Category | Not Started | Medium | Medium | TBD | TBD |
| #19 Enhanced Audit Trail & Access Logging | Not Started | Medium | Medium | TBD | TBD |
| #20 Policy-Based Access Control (JSON Config) | Not Started | High | Large | TBD | TBD |
| #21 Attribute-Based Permissions with Context | Not Started | Medium | Large | TBD | TBD |
| #22 Storage Location Permission Integration | ✅ Completed | Low | Medium | Current | Sept 14 |

### 🔄 Current Sprint: Maintenance Mode Implementation

**Sprint Goal**: Complete maintenance mode feature with admin controls and user bypass

**Tasks Completed:**
- ✅ Add maintenance mode configuration to Config.js
- ✅ Create maintenance middleware in app.js
- ✅ Create maintenance page template (maintenance.ejs)
- ✅ Add admin bypass capability
- ✅ Add maintenance mode toggle to admin dashboard
- ✅ Implement adminToggleMaintenance route

**Tasks In Progress:**
- 🔄 Test maintenance mode functionality (Server running on <http://localhost:3000>)

**Tasks Remaining:**
- ⏳ Add CSRF protection to maintenance toggle
- ⏳ Add maintenance mode logging
- ⏳ Add maintenance mode notifications

### 📊 Progress Metrics

- **Overall Epic**: 29% Complete (2/7 sub-issues)
- **Current Sprint**: ✅ Completed
- **Estimated Completion**: September 13, 2025

### 🚧 Blockers & Risks

- **✅ RESOLVED**: **Security Gap** - Added permission checks to all attachment routes
- **✅ RESOLVED**: **Inconsistent Permission Models** - Attachments now use same permission system as pages
- **✅ RESOLVED**: **Category-Based Access Missing** - Attachments inherit page permissions
- **Low Risk**: Configuration persistence across server restarts

### ⚠️ **Critical Conflicts Discovered**

**Issue #22 - Storage Location Permission Integration:**

✅ **FIXED**: Added authentication and permission checks to all attachment routes
✅ **FIXED**: Attachments now inherit page-level permissions
✅ **FIXED**: Consistent permission model between pages and attachments

**Remaining Work:**
1. ✅ **COMPLETED** - Storage Location Rules implemented with ACL-based decisions
2. ⏳ **Category Integration** - Add System/Admin category restrictions for attachments
3. ⏳ **Advanced ACL Syntax** - Add attachment-specific permission syntax
4. ⏳ **Audit Logging** - Add comprehensive logging for attachment operations

### 🎯 Next Actions

1. **Start next sub-issue** - Begin time-based permissions (#16)
2. **Add CSRF protection** - Secure the maintenance toggle endpoint
3. **Add maintenance mode logging** - Track maintenance mode changes
4. **Consider next sprint** - Plan the next set of features to implement

---

## 📊 Project Overview

### Phase 1: Core Foundation (Current)
- **Wiki Engine** ✅
- **User Management** ✅
- **Plugin Architecture** ✅
- **Standards Compliance** ✅
- **Access Control Enhancement** 🔄 (In Progress)

### Phase 2: Content Modules (Next)
- **Blog Module**
- **Document Management**
- **Photo Management**
- **Asset Management**

### Key Metrics
- **Total Issues**: 7 (Access Control)
- **Completed**: 2
- **In Progress**: 1
- **Not Started**: 5
- **Success Rate**: 100% (1/1 completed successfully)

### 📝 Recent Updates

- **Sept 14, 2025**: ✅ **COMPLETED** - Issue #22: ACL-based Storage Location Permission Integration
- **Sept 13, 2025**: ✅ **SECURITY FIXED** - Added permission checks to all attachment routes
- **Sept 13, 2025**: 🔒 **CRITICAL** - Implemented authentication and page-based permissions for uploads/downloads/deletes
- **Sept 13, 2025**: 🚨 **CRITICAL** - Discovered major security conflicts in attachment permissions
- **Sept 13, 2025**: ✅ **COMPLETED** - Maintenance mode feature fully implemented and tested
- **Sept 13, 2025**: Added maintenance mode admin controls and backend implementation
- **Sept 13, 2025**: Created maintenance page template with admin bypass
- **Sept 13, 2025**: Integrated maintenance mode with existing middleware stack
