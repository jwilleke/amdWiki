# Policy-Based Access Control Administration Guide

## Overview

amdWiki's Policy-Based Access Control (PBAC) system provides flexible, JSON-based access control policies that allow administrators to define sophisticated permission rules beyond traditional role-based access control.

### Key Features

- **JSON Schema Validation**: Ensures policy integrity and prevents configuration errors
- **Flexible Subject Matching**: Support for users, roles, groups, attributes, and authentication status
- **Advanced Conditions**: Time ranges, IP restrictions, user attributes, and custom conditions
- **Priority System**: Higher-priority policies override lower ones
- **Performance Caching**: Optimized for repeated evaluations
- **Audit Integration**: Full logging of policy decisions

## Accessing Policy Management

### Web Interface

1. Log in to amdWiki as an administrator
2. Navigate to `/admin/policies` or click "Policy Management" from the admin dashboard
3. The policy management interface will display:
   - Policy statistics overview
   - List of existing policies
   - Create/Edit/Delete controls

### API Access

The policy system also provides RESTful API endpoints:

```http
GET    /admin/policies          # List all policies
POST   /admin/policies          # Create new policy
GET    /admin/policies/:id      # Get specific policy
PUT    /admin/policies/:id      # Update policy
DELETE /admin/policies/:id      # Delete policy
```

## Understanding Policy Components

### Policy Structure

Every policy consists of the following components:

```json
{
  "id": "unique-policy-identifier",
  "name": "Human-readable policy name",
  "description": "Detailed description of the policy",
  "priority": 50,
  "effect": "allow|deny",
  "subjects": [...],
  "resources": [...],
  "actions": [...],
  "conditions": [...],
  "metadata": {...}
}
```

### Subjects (Who)

Subjects define who the policy applies to. Supported types:

- **user**: Specific username (`"value": "john.doe"`)
- **role**: Users with specific role (`"value": "editor"`)
- **group**: Users in specific group (`"value": "marketing"`)
- **attribute**: Users with specific attribute (`"key": "department", "value": "IT"`)
- **authenticated**: Any authenticated user
- **anonymous**: Non-authenticated users
- **admin**: Users with admin privileges

### Resources (What)

Resources define what the policy applies to. Supported types:

- **page**: Wiki pages (`"pattern": "*"`, `"pattern": "Admin*"`)
- **attachment**: File attachments (`"pattern": "*.pdf"`)
- **category**: Pages in specific category (`"value": "System"`)
- **tag**: Pages with specific tag (`"value": "confidential"`)
- **resource-type**: Specific resource types (`"value": "page"`)
- **path**: URL path patterns (`"pattern": "/api/*"`)

### Actions (How)

Actions define what operations are allowed/denied:

- **view**: Read/view content
- **edit**: Modify content
- **delete**: Remove content
- **create**: Create new content
- **upload**: Upload files
- **download**: Download files
- **admin**: Administrative operations

### Conditions (When)

Conditions add additional constraints. Supported types:

- **time-range**: Time-based restrictions
- **ip-range**: IP address restrictions
- **user-attribute**: User attribute checks
- **context-attribute**: Request context checks
- **environment**: Environment-specific rules
- **session-attribute**: Session-based conditions

## Creating Policies

### Using the Web Interface

1. Click "Create Policy" button
2. Fill in basic information:
   - **Policy Name**: Descriptive name
   - **Priority**: Number (higher = more important)
   - **Effect**: Allow or Deny
   - **Description**: Optional details

3. Define **Subjects** (Who):
   - Click "Add Subject"
   - Choose subject type
   - Enter value/pattern

4. Define **Resources** (What):
   - Click "Add Resource"
   - Choose resource type
   - Enter value/pattern

5. Select **Actions** (How):
   - Check applicable actions

6. Add **Conditions** (When - optional):
   - Click "Add Condition"
   - Choose condition type
   - Configure parameters

7. Click "Create Policy"

### Using JSON (Advanced)

For complex policies, you can edit the JSON directly:

```json
{
  "id": "business-hours-edit",
  "name": "Business Hours Edit Access",
  "description": "Allow editing only during business hours",
  "priority": 100,
  "effect": "allow",
  "subjects": [
    {
      "type": "role",
      "value": "editor"
    }
  ],
  "resources": [
    {
      "type": "page",
      "pattern": "*"
    }
  ],
  "actions": ["edit"],
  "conditions": [
    {
      "type": "time-range",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

## Common Policy Examples

### 1. Role-Based Access

**Allow editors to edit all pages:**
```json
{
  "id": "editor-full-edit",
  "name": "Editor Full Edit Access",
  "priority": 50,
  "effect": "allow",
  "subjects": [{"type": "role", "value": "editor"}],
  "resources": [{"type": "page", "pattern": "*"}],
  "actions": ["view", "edit", "create"]
}
```

### 2. Time-Based Restrictions

**Restrict admin access to business hours:**
```json
{
  "id": "admin-business-hours",
  "name": "Admin Business Hours Only",
  "priority": 200,
  "effect": "deny",
  "subjects": [{"type": "role", "value": "admin"}],
  "resources": [{"type": "page", "pattern": "*"}],
  "actions": ["edit", "delete"],
  "conditions": [
    {
      "type": "time-range",
      "startTime": "18:00",
      "endTime": "08:00"
    }
  ]
}
```

### 3. IP-Based Security

**Restrict sensitive content to internal network:**
```json
{
  "id": "internal-network-only",
  "name": "Internal Network Only",
  "priority": 150,
  "effect": "deny",
  "subjects": [{"type": "anonymous"}],
  "resources": [{"type": "category", "value": "Confidential"}],
  "actions": ["view"],
  "conditions": [
    {
      "type": "ip-range",
      "ranges": ["192.168.0.0/16", "10.0.0.0/8"]
    }
  ]
}
```

### 4. Department-Based Access

**Allow IT department full access to system pages:**
```json
{
  "id": "it-system-access",
  "name": "IT System Access",
  "priority": 100,
  "effect": "allow",
  "subjects": [
    {
      "type": "attribute",
      "key": "department",
      "value": "IT"
    }
  ],
  "resources": [{"type": "category", "value": "System"}],
  "actions": ["view", "edit", "delete", "admin"]
}
```

### 5. Emergency Access Override

**Allow emergency access during critical situations:**
```json
{
  "id": "emergency-access",
  "name": "Emergency Access Override",
  "priority": 1000,
  "effect": "allow",
  "subjects": [{"type": "role", "value": "emergency"}],
  "resources": [{"type": "page", "pattern": "*"}],
  "actions": ["view", "edit", "delete"],
  "conditions": [
    {
      "type": "context-attribute",
      "key": "emergencyMode",
      "value": true
    }
  ]
}
```

## Policy Priority and Conflicts

### Understanding Priority

- **Higher numbers = Higher priority**
- Policies are evaluated in priority order (highest first)
- Conflicting policies are resolved by priority
- Default priority is 50

### Conflict Resolution

When multiple policies apply to the same request:

1. **Same Effect**: All matching policies are considered
2. **Different Effects**: Highest priority policy wins
3. **Equal Priority**: First matching policy wins (deterministic but not recommended)

### Best Practices

- Use priority ranges:
  - 1-99: General policies
  - 100-499: Department/role specific
  - 500-899: Security policies
  - 900-999: Emergency/override policies
- Avoid equal priorities for conflicting policies
- Document priority schemes in your organization

## Managing Existing Policies

### Viewing Policies

- **Dashboard**: Overview of all policies with statistics
- **List View**: Detailed list with quick actions
- **JSON View**: Raw policy structure for advanced users

### Editing Policies

1. Click the "Edit" button next to any policy
2. Modify the policy structure
3. Save changes (validation runs automatically)
4. Review conflicts and warnings

### Deleting Policies

1. Click the "Delete" button
2. Confirm deletion
3. System validates no critical dependencies

### Policy Validation

The system automatically validates policies for:

- **Schema Compliance**: JSON structure correctness
- **Business Logic**: Duplicate entries, invalid combinations
- **Semantic Issues**: Logical inconsistencies
- **Conflicts**: Overlapping policies with different effects

## Monitoring and Auditing

### Policy Statistics

The dashboard shows:
- Total number of policies
- Allow vs Deny policy counts
- Average priority
- Cache performance metrics

### Audit Logs

Policy decisions are logged with:
- User information
- Resource accessed
- Action attempted
- Policy that granted/denied access
- Timestamp and context

### Performance Monitoring

Monitor:
- Policy evaluation times
- Cache hit rates
- Most frequently evaluated policies
- Policy conflicts and warnings

## Troubleshooting

### Common Issues

#### Policy Not Taking Effect

**Symptoms**: Expected access behavior not occurring

**Solutions**:
1. Check policy priority vs conflicting policies
2. Verify subject/resource/action matching
3. Review condition requirements
4. Check for syntax errors in JSON

#### Unexpected Access Denied

**Symptoms**: Users can't access resources they should

**Solutions**:
1. Look for higher-priority deny policies
2. Check condition evaluation
3. Verify user attributes/roles
4. Review audit logs for decision details

#### Performance Issues

**Symptoms**: Slow page loads, high CPU usage

**Solutions**:
1. Review cache hit rates
2. Optimize policy conditions
3. Reduce number of policies
4. Check for inefficient patterns

#### Validation Errors

**Symptoms**: Policies can't be saved due to validation errors

**Solutions**:
1. Review error messages carefully
2. Check JSON syntax
3. Verify required fields are present
4. Ensure values match expected formats

### Debug Tools

#### Policy Testing

Use the web interface to test policies:
1. Create test scenarios
2. Simulate user contexts
3. Verify expected outcomes

#### Audit Log Analysis

Review audit logs for:
- Policy decision patterns
- Common access issues
- Performance bottlenecks
- Security incidents

#### Cache Statistics

Monitor cache performance:
- Hit/miss ratios
- Cache size vs max size
- Evaluation times
- Memory usage

## Best Practices

### Policy Design

1. **Start Simple**: Begin with basic role-based policies
2. **Use Descriptive Names**: Clear, searchable policy names
3. **Document Everything**: Detailed descriptions and comments
4. **Test Thoroughly**: Validate policies in staging environment
5. **Plan for Growth**: Design for future requirements

### Security Considerations

1. **Defense in Depth**: Multiple layers of access control
2. **Least Privilege**: Grant minimum required access
3. **Regular Reviews**: Audit policies periodically
4. **Emergency Access**: Plan for override scenarios
5. **Monitoring**: Log and monitor all access decisions

### Performance Optimization

1. **Efficient Patterns**: Use specific patterns over wildcards
2. **Minimize Conditions**: Only add necessary conditions
3. **Cache-Friendly**: Design for cache effectiveness
4. **Regular Cleanup**: Remove obsolete policies

### Maintenance

1. **Version Control**: Track policy changes
2. **Backup Regularly**: Maintain policy backups
3. **Change Management**: Document policy modifications
4. **User Communication**: Notify users of policy changes

## Advanced Topics

### Custom Conditions

For complex requirements, you can implement custom condition types:

```javascript
// Example custom condition implementation
{
  "type": "custom",
  "name": "department-budget-check",
  "parameters": {
    "department": "IT",
    "budgetLimit": 50000
  }
}
```

### Policy Templates

Create reusable policy templates for common scenarios:

- **Read-Only Access**: Basic viewing permissions
- **Contributor Access**: View + edit permissions
- **Moderator Access**: Contributor + delete permissions
- **Admin Access**: Full permissions

### Integration with External Systems

The policy system can integrate with:
- LDAP/Active Directory for user attributes
- External authorization services
- Custom user attribute providers
- Third-party security systems

## Support and Resources

### Getting Help

1. **Documentation**: This guide and inline help
2. **Logs**: Check application logs for errors
3. **Audit Trail**: Review access decision logs
4. **Community**: Check for similar issues/solutions

### Configuration Files

Key configuration files:
- `config/app-default-config.json`: Policy storage (key: `amdwiki.access.policies`)
- `config/policy-schemas.json`: Schema definitions
- ~~`config/access-policies.json`~~: **DEPRECATED** - Policies now in app-default-config.json

### API Reference

Complete API documentation available at `/admin/policies/api-docs`

---

*This guide covers amdWiki Policy-Based Access Control version 1.0. For the latest updates and additional features, check the official documentation.*
