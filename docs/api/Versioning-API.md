# Version Management API Reference

Complete REST API reference for amdWiki's version management system.

## Overview

The Version Management API provides programmatic access to page version history, comparison, and restoration features. All endpoints require VersioningFileProvider to be enabled.

**Base URL**: `http://your-wiki-domain.com/api`

**Authentication**: Required for destructive operations (POST/PUT/DELETE)

**Content-Type**: `application/json`

**Response Format**: JSON

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get Version History](#get-version-history)
  - [Get Specific Version](#get-specific-version)
  - [Compare Versions](#compare-versions)
  - [Restore Version](#restore-version)
- [Data Models](#data-models)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Authentication

### Session-Based Authentication

All API requests use session-based authentication via cookies.

**Login Required For**:
- POST `/api/page/:identifier/restore/:version` (Restore version)

**Anonymous Access**:
- GET endpoints (history, version, compare) - Subject to page permissions

### Checking Authentication

The API uses the existing amdWiki session system. Ensure you have a valid session cookie.

---

## Endpoints

### Get Version History

Retrieve all versions for a specific page.

#### Request

```http
GET /api/page/:identifier/versions
```

**Parameters**:
- `identifier` (path, required): Page title or UUID

**Headers**:
- None required

#### Response

**Success (200)**:
```json
{
  "success": true,
  "identifier": "Main",
  "versionCount": 3,
  "versions": [
    {
      "version": 3,
      "dateCreated": "2024-10-16T10:30:00Z",
      "author": "admin",
      "changeType": "updated",
      "comment": "Fixed typos",
      "contentHash": "a1b2c3...",
      "contentSize": 5324,
      "compressed": false,
      "isDelta": true,
      "isCheckpoint": false
    },
    {
      "version": 2,
      "dateCreated": "2024-10-15T15:45:00Z",
      "author": "john",
      "changeType": "updated",
      "comment": "Added new section",
      "contentHash": "d4e5f6...",
      "contentSize": 5100,
      "compressed": false,
      "isDelta": true,
      "isCheckpoint": false
    },
    {
      "version": 1,
      "dateCreated": "2024-10-14T09:00:00Z",
      "author": "admin",
      "changeType": "created",
      "comment": "Initial version",
      "contentHash": "g7h8i9...",
      "contentSize": 4850,
      "compressed": false,
      "isDelta": false,
      "isCheckpoint": false
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Page doesn't exist
- `501 Not Implemented`: Versioning not enabled
- `500 Internal Server Error`: Server error

#### Example

```bash
# Using curl
curl -X GET http://localhost:3000/api/page/Main/versions

# Using JavaScript fetch
fetch('/api/page/Main/versions')
  .then(res => res.json())
  .then(data => console.log(data.versions));
```

---

### Get Specific Version

Retrieve the content and metadata for a specific version.

#### Request

```http
GET /api/page/:identifier/version/:version
```

**Parameters**:
- `identifier` (path, required): Page title or UUID
- `version` (path, required): Version number (positive integer)

**Headers**:
- None required

#### Response

**Success (200)**:
```json
{
  "success": true,
  "identifier": "Main",
  "version": 2,
  "content": "# Welcome to Main\n\nThis is version 2 content...",
  "metadata": {
    "version": 2,
    "dateCreated": "2024-10-15T15:45:00Z",
    "author": "john",
    "changeType": "updated",
    "comment": "Added new section",
    "contentHash": "d4e5f6...",
    "contentSize": 5100,
    "compressed": false,
    "isDelta": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid version number
- `404 Not Found`: Page or version doesn't exist
- `501 Not Implemented`: Versioning not enabled
- `500 Internal Server Error`: Server error

#### Example

```bash
# Using curl
curl -X GET http://localhost:3000/api/page/Main/version/2

# Using JavaScript fetch
fetch('/api/page/Main/version/2')
  .then(res => res.json())
  .then(data => {
    console.log('Content:', data.content);
    console.log('Author:', data.metadata.author);
  });
```

---

### Compare Versions

Compare two versions to see what changed.

#### Request

```http
GET /api/page/:identifier/compare/:v1/:v2
```

**Parameters**:
- `identifier` (path, required): Page title or UUID
- `v1` (path, required): First version number (positive integer)
- `v2` (path, required): Second version number (positive integer)

**Headers**:
- None required

**Notes**:
- Order matters: `v1` is the "old" version, `v2` is the "new" version
- Can compare any two versions (not just consecutive)

#### Response

**Success (200)**:
```json
{
  "success": true,
  "identifier": "Main",
  "comparison": {
    "version1": {
      "version": 1,
      "dateCreated": "2024-10-14T09:00:00Z",
      "author": "admin",
      "changeType": "created",
      "comment": "Initial version"
    },
    "version2": {
      "version": 2,
      "dateCreated": "2024-10-15T15:45:00Z",
      "author": "john",
      "changeType": "updated",
      "comment": "Added new section"
    },
    "diff": [
      [0, "# Welcome to Main\n"],
      [0, "\n"],
      [0, "This is the main page.\n"],
      [1, "\n## New Section\n"],
      [1, "This section was added in v2.\n"]
    ],
    "stats": {
      "additions": 2,
      "deletions": 0,
      "unchanged": 3
    }
  }
}
```

**Diff Format**:
- `[0, "text"]`: Unchanged line
- `[1, "text"]`: Added line (in v2, not in v1)
- `[-1, "text"]`: Deleted line (in v1, not in v2)

**Error Responses**:
- `400 Bad Request`: Invalid version numbers
- `404 Not Found`: Page or versions don't exist
- `501 Not Implemented`: Versioning not enabled
- `500 Internal Server Error`: Server error

#### Example

```bash
# Using curl
curl -X GET http://localhost:3000/api/page/Main/compare/1/2

# Using JavaScript fetch
fetch('/api/page/Main/compare/1/2')
  .then(res => res.json())
  .then(data => {
    console.log('Changes:', data.comparison.stats);
    console.log('Additions:', data.comparison.stats.additions);
    console.log('Deletions:', data.comparison.stats.deletions);
  });
```

---

### Restore Version

Restore a page to a previous version by creating a new version with old content.

#### Request

```http
POST /api/page/:identifier/restore/:version
```

**Parameters**:
- `identifier` (path, required): Page title or UUID
- `version` (path, required): Version number to restore to (positive integer)

**Headers**:
- `Content-Type: application/json`
- `Cookie: connect.sid=...` (session cookie - **required**)

**Body** (optional):
```json
{
  "comment": "Reverting spam edits"
}
```

**Body Fields**:
- `comment` (string, optional): Reason for restore. Default: "Restored from vX"

#### Response

**Success (200)**:
```json
{
  "success": true,
  "identifier": "Main",
  "restoredFromVersion": 2,
  "newVersion": 5,
  "message": "Successfully restored to version 2, created version 5"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid version number
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Page or version doesn't exist
- `501 Not Implemented`: Versioning not enabled
- `500 Internal Server Error`: Server error

#### Example

```bash
# Using curl with session cookie
curl -X POST http://localhost:3000/api/page/Main/restore/2 \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie" \
  -d '{"comment": "Reverting spam edits"}'

# Using JavaScript fetch (browser with session)
fetch('/api/page/Main/restore/2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comment: 'Reverting spam edits'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Restored! New version:', data.newVersion);
  });
```

---

## Data Models

### Version Object

Represents metadata for a single page version.

```typescript
{
  version: number;              // Version number (1, 2, 3, ...)
  dateCreated: string;          // ISO 8601 timestamp
  author: string;               // Username of editor
  changeType: string;           // "created" | "updated" | "restored"
  comment: string;              // Description of changes
  contentHash: string;          // SHA-256 hash of content
  contentSize: number;          // Size in bytes
  compressed: boolean;          // Whether content is gzip compressed
  isDelta: boolean;             // Whether stored as diff (v2+)
  isCheckpoint?: boolean;       // Whether this is a full snapshot
}
```

### Diff Object

Represents a single change operation.

```typescript
[
  operation: number,  // -1 = delete, 0 = unchanged, 1 = insert
  text: string        // The text content
]
```

### Stats Object

Summary statistics for a comparison.

```typescript
{
  additions: number;    // Number of lines added
  deletions: number;    // Number of lines deleted
  unchanged: number;    // Number of lines unchanged
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | Success | Request completed successfully |
| `400` | Bad Request | Invalid version number, missing parameters |
| `401` | Unauthorized | Not authenticated (restore only) |
| `403` | Forbidden | No permission to access page |
| `404` | Not Found | Page or version doesn't exist |
| `500` | Internal Server Error | Server-side error |
| `501` | Not Implemented | Versioning not enabled |

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Error Messages

**Page Not Found**:
```json
{
  "error": "Page not found",
  "message": "Page not found: NonExistentPage"
}
```

**Invalid Version**:
```json
{
  "error": "Invalid version number",
  "message": "Version must be a positive integer"
}
```

**Versioning Not Supported**:
```json
{
  "error": "Versioning not supported",
  "message": "Current page provider does not support version history"
}
```

**Authentication Required**:
```json
{
  "error": "Authentication required",
  "message": "You must be logged in to restore versions"
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced on version management endpoints.

**Best Practices**:
- Cache version history results when possible
- Don't poll for updates; use websockets if available
- Batch operations when retrieving multiple versions
- Respect server resources

---

## Examples

### Example 1: Get All Versions and Display

```javascript
async function displayVersionHistory(pageName) {
  try {
    const response = await fetch(`/api/page/${encodeURIComponent(pageName)}/versions`);
    const data = await response.json();

    if (!data.success) {
      console.error('Error:', data.error);
      return;
    }

    console.log(`${pageName} has ${data.versionCount} versions:`);
    data.versions.forEach(v => {
      console.log(`v${v.version}: ${v.comment} by ${v.author} on ${v.dateCreated}`);
    });
  } catch (error) {
    console.error('Failed to fetch versions:', error);
  }
}

displayVersionHistory('Main');
```

### Example 2: Compare Latest with Previous

```javascript
async function showRecentChanges(pageName) {
  try {
    // Get version history
    const historyRes = await fetch(`/api/page/${encodeURIComponent(pageName)}/versions`);
    const historyData = await historyRes.json();

    if (historyData.versionCount < 2) {
      console.log('Not enough versions to compare');
      return;
    }

    const latest = historyData.versions[0].version;
    const previous = historyData.versions[1].version;

    // Compare versions
    const compareRes = await fetch(`/api/page/${encodeURIComponent(pageName)}/compare/${previous}/${latest}`);
    const compareData = await compareRes.json();

    const stats = compareData.comparison.stats;
    console.log(`Recent changes to ${pageName}:`);
    console.log(`  Added: ${stats.additions} lines`);
    console.log(`  Removed: ${stats.deletions} lines`);
    console.log(`  Unchanged: ${stats.unchanged} lines`);
  } catch (error) {
    console.error('Failed to compare versions:', error);
  }
}

showRecentChanges('Main');
```

### Example 3: Restore to Last Good Version

```javascript
async function revertToLastGoodVersion(pageName, goodVersion, reason) {
  try {
    const response = await fetch(
      `/api/page/${encodeURIComponent(pageName)}/restore/${goodVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: reason
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log(`Restored ${pageName} to v${goodVersion}`);
      console.log(`Created new version: v${data.newVersion}`);
    } else {
      console.error('Restore failed:', data.error);
    }
  } catch (error) {
    console.error('Failed to restore version:', error);
  }
}

revertToLastGoodVersion('Main', 5, 'Reverting spam');
```

### Example 4: Get Version Content for Export

```javascript
async function exportVersion(pageName, version) {
  try {
    const response = await fetch(
      `/api/page/${encodeURIComponent(pageName)}/version/${version}`
    );
    const data = await response.json();

    if (data.success) {
      // Create downloadable file
      const blob = new Blob([data.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageName}-v${version}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Failed to export version:', error);
  }
}

exportVersion('Main', 3);
```

### Example 5: Bulk Version Analysis

```javascript
async function analyzePageActivity(pageNames) {
  const results = await Promise.all(
    pageNames.map(async (pageName) => {
      try {
        const res = await fetch(`/api/page/${encodeURIComponent(pageName)}/versions`);
        const data = await res.json();

        if (!data.success) return null;

        return {
          page: pageName,
          versionCount: data.versionCount,
          lastAuthor: data.versions[0]?.author,
          lastModified: data.versions[0]?.dateCreated,
          totalEdits: data.versions.length
        };
      } catch (error) {
        return null;
      }
    })
  );

  const active = results.filter(r => r !== null);
  console.log('Page Activity Summary:');
  active.forEach(r => {
    console.log(`${r.page}: ${r.versionCount} versions, last by ${r.lastAuthor}`);
  });
}

analyzePageActivity(['Main', 'About', 'Contact']);
```

---

## Integration Examples

### React Component

```jsx
import { useState, useEffect } from 'react';

function VersionHistory({ pageName }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/page/${encodeURIComponent(pageName)}/versions`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVersions(data.versions);
        } else {
          setError(data.error);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [pageName]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Version</th>
          <th>Date</th>
          <th>Author</th>
          <th>Comment</th>
        </tr>
      </thead>
      <tbody>
        {versions.map(v => (
          <tr key={v.version}>
            <td>v{v.version}</td>
            <td>{new Date(v.dateCreated).toLocaleString()}</td>
            <td>{v.author}</td>
            <td>{v.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Node.js Script

```javascript
const fetch = require('node-fetch');

async function backupPageVersions(pageName, outputDir) {
  const historyRes = await fetch(
    `http://localhost:3000/api/page/${encodeURIComponent(pageName)}/versions`
  );
  const historyData = await historyRes.json();

  for (const versionMeta of historyData.versions) {
    const versionRes = await fetch(
      `http://localhost:3000/api/page/${encodeURIComponent(pageName)}/version/${versionMeta.version}`
    );
    const versionData = await versionRes.json();

    const filename = `${outputDir}/${pageName}-v${versionMeta.version}.md`;
    require('fs').writeFileSync(filename, versionData.content);
    console.log(`Saved ${filename}`);
  }
}

backupPageVersions('Main', './backups');
```

---

## Security Considerations

### Authentication
- All GET endpoints respect page ACL permissions
- POST /restore requires authenticated user
- Session cookies must be httpOnly

### Input Validation
- Page identifiers are URL-decoded
- Version numbers must be positive integers
- Comments are stored as-is (sanitized on display)

### Rate Limiting
- Consider implementing rate limiting for production
- Monitor for abuse patterns
- Log all restore operations

### Best Practices
- Always use HTTPS in production
- Validate user permissions before allowing restores
- Log all version operations for audit trail
- Implement CSRF protection for POST endpoints

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-10-16 | Initial API documentation |

---

## Support

For issues or questions:
- **Documentation**: See [User Guide](../user-guide/Using-Version-History.md)
- **Administration**: See [Deployment Guide](../admin/Versioning-Deployment-Guide.md)
- **Issues**: Report at your wiki's issue tracker

---

**Last Updated**: 2024-10-16
**API Version**: 1.0
**Applies to**: amdWiki 1.3.2+
