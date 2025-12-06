# Installation Flow - Issues & Root Cause Analysis

**Status:** DIAGNOSING LOOPING ISSUE
**Date:** 2025-12-06
**Issue:** Form keeps looping when partial installation state is detected

## Problem Description

When launching amdWiki with a partially completed installation state, the installation form:
1. Displays correctly
2. Shows "Partial installation detected" warning
3. User fills out the form and submits
4. Form keeps looping back with incomplete installation message instead of proceeding

## Root Cause Analysis

### Issue 1: Overly Strict Partial Installation Blocking

**File:** `src/services/InstallService.js:209-226`

```javascript
async processInstallation(installData) {
  // ... line 217-226
  const partialState = await this.detectPartialInstallation();
  if (partialState.isPartial) {
    throw new Error('Partial installation detected. Please reset the installation before continuing...');
  }
```

**Problem:**
- The `processInstallation()` method BLOCKS any new installation attempt if a partial state exists
- But a partial state means: (config written) OR (org created) OR (admin created) OR (pages copied) but NOT all completed
- The logic prevents the user from completing the installation by retrying - it forces a reset instead

**Expected Behavior:**
- Should allow retrying to COMPLETE the partial installation
- Should only block if state is truly corrupt/inconsistent (not just incomplete)

### Issue 2: Partial State Detection Logic

**File:** `src/services/InstallService.js:56-85`

```javascript
async detectPartialInstallation() {
  // ...
  const steps = {
    configWritten: customConfigExists,
    organizationCreated: organizationsExist,
    adminCreated: adminExists,
    pagesCopied: pagesExist
  };

  const isPartial = Object.values(steps).some(v => v === true) && !completed;
  // This means: "partial if ANY step exists AND install not marked complete"
```

**Problem:**
- ANY combination of incomplete steps = partial
- But user should be able to continue filling in the missing steps
- For example: config exists but pages not copied = can still copy pages on retry
- Current logic treats this as an error state instead of an incomplete state

### Issue 3: Installation Mark Complete

**File:** `src/services/InstallService.js:241-248`

```javascript
// After all steps, mark installation complete
await this.#markInstallationComplete();
```

**Issue:** Looking at the code flow, if ANY step fails after config is written, the installation is left in a partial state with no way to retry without resetting.

## Installation Flow States

### State 1: Fresh Installation (NO partial installation)
- ✅ No `app-custom-config.json`
- ✅ No `users/organizations.json`
- ✅ Admin user exists (auto-created on startup)
- ✅ Pages directory empty

**Expected:** User can submit form normally

### State 2: Partial Installation After Config Write
- ✅ `app-custom-config.json` EXISTS
- ❌ `users/organizations.json` does NOT exist
- ✅ Admin user exists
- ❌ Pages directory empty

**Current Behavior:** BLOCKED - "Partial installation detected"
**Expected Behavior:** Allow user to continue (write org, copy pages, mark complete)

### State 3: Partial Installation After Organization Write
- ✅ `app-custom-config.json` EXISTS
- ✅ `users/organizations.json` EXISTS
- ✅ Admin user exists
- ❌ Pages directory empty

**Current Behavior:** BLOCKED - "Partial installation detected"
**Expected Behavior:** Allow user to continue (copy pages, mark complete)

### State 4: Complete Installation
- ✅ `app-custom-config.json` EXISTS
- ✅ `users/organizations.json` EXISTS
- ✅ Admin user exists
- ✅ Pages directory has .md files
- ✅ `amdwiki.install.completed` = true

**Current Behavior:** Installation form blocked, redirects to home
**Expected Behavior:** ✅ Correct

## The Looping Scenario

1. User starts fresh installation, sees empty form
2. User fills form: app name, base URL, org info, password
3. User clicks "Install"
4. Step 1: Config file written ✅
5. Step 2: Fails (e.g., org write fails, or pages copy fails)
6. Installation service catches error and returns `success: false`
7. InstallRoutes redirects to `/install` with error message
8. User sees form AND partial installation warning
9. User fills form again
10. User clicks "Install" again
11. **LOOP:** `detectPartialInstallation()` now returns `isPartial: true` because config file still exists
12. InstallService throws error: "Partial installation detected"
13. User is blocked from retrying
14. User must click "Reset Installation" instead

## Solution Approach

### Option A: Allow Retry of Partial Installation (RECOMMENDED)

Modify `processInstallation()` to:
1. Detect partial state
2. **Instead of blocking**, continue with remaining steps
3. Skip steps that are already completed
4. Only fail if data is corrupt (not just incomplete)

**Benefits:**
- User can retry naturally
- No need to click "Reset"
- Better UX

### Option B: Clear Partial State on New Submit

Modify InstallRoutes to:
1. On form submit, check for partial state
2. If partial detected, silently reset before processing
3. Continue with new installation

**Benefits:**
- Simple implementation
- User sees no warning

**Drawbacks:**
- Data loss without explicit confirmation
- Less transparent to user

### Option C: Smarter Partial State Detection

Modify to only block if state is CORRUPTED, not incomplete:
- Config written but invalid = corrupt
- Org data written but config missing = corrupt
- Pages exist but no config = corrupt

**Benefits:**
- Allows retries
- Still protects against true corruption

## Recommended Fix

**Option A is best** - allow retrying partial installations.

Modify `InstallService.processInstallation()`:

1. **Don't block on partial installation**
   - Remove or conditionally check the early partial state detection

2. **Skip already-completed steps**
   ```javascript
   // Skip config write if it already exists
   if (!customConfigExists) {
     await this.#writeCustomConfig(installData);
   }

   // Skip org write if it already exists
   if (!organizationsExist) {
     await this.#writeOrganizationData(installData);
   }

   // Skip admin update if already completed
   // (but user may want to change password again)

   // Always try to copy pages if requested
   if (installData.copyStartupPages && !pagesExist) {
     await this.#copyStartupPages();
   }
   ```

3. **Mark complete only when all steps done**
   - After all steps, mark `amdwiki.install.completed = true`

4. **Return clear status**
   - Show user which steps were completed in this attempt
   - Show which were already done previously

## Implementation Notes

- Must maintain password update capability (user should be able to change password even if installation partially complete)
- Backup strategy should be maintained (don't overwrite existing org data)
- Clear cache after changes (ConfigurationManager reload)
- Test with multiple retry scenarios

## Files to Modify

- `src/services/InstallService.js` - Main fix in `processInstallation()` and `detectPartialInstallation()`
- `src/routes/InstallRoutes.js` - May need to adjust response handling
- `views/install.ejs` - May need clearer messaging about partial completion

## Testing Scenarios

1. ✅ Fresh install → submit once → success
2. ⚠️ Fresh install → submit → config fails → submit again → should complete
3. ⚠️ Fresh install → submit with copyStartupPages=false → submit again with copyStartupPages=true → should copy pages
4. ⚠️ Partial install → submit → should complete, not loop
5. ✅ Complete install → /install → redirects to home (no install form)

