# Enhanced Time-Based Permission System Design

## Current State Analysis

The amdWiki already has a solid foundation for time-based permissions:

### ✅ Existing Infrastructure

- **Business Hours Check**: `checkBusinessHours()` method in ACLManager
- **Configuration Structure**: Time-based settings in Config.js
- **Integration Points**: Context-aware permission system
- **Time Zone Support**: UTC with configurable time zones
- **Audit Logging**: Access decisions are logged

### 🔧 Current Limitations

- **Disabled by Default**: Business hours feature is disabled in config
- **Basic Scheduling**: Only supports simple business hours (9-5, weekdays)
- **No Holiday Support**: No way to exclude holidays or special dates
- **Limited Flexibility**: Cannot define custom schedules per user/role

## Enhanced System Design

### 🎯 Core Requirements

1. **Enable Existing Business Hours**: Activate the current business hours functionality
2. **Custom Schedules**: Support multiple named schedules (business, weekend, emergency, etc.)
3. **Holiday Exceptions**: Allow exclusion of specific dates
4. **Advanced Rules**: Time-based rules per user, role, or page
5. **Time Zone Awareness**: Proper handling of different time zones
6. **Gradual Rollout**: Enable features incrementally

### 📋 Implementation Plan

#### Phase 1: Enable Core Business Hours

- Enable business hours in configuration
- Test existing functionality
- Add admin controls for business hours management

#### Phase 2: Custom Schedules

- Define schedule templates (business, 24/7, weekend, etc.)
- Allow per-user/per-role schedule assignment
- Add schedule validation and conflict detection

#### Phase 3: Holiday & Exception Management

- Holiday calendar integration
- One-time exceptions (maintenance windows, events)
- Recurring exceptions (monthly patches, quarterly reviews)

#### Phase 4: Advanced Rules Engine

- Page-specific time restrictions
- Role-based time windows
- Conditional time rules (based on user attributes)

### 🔧 Technical Architecture

#### Schedule Definition Structure

```javascript
{
  name: 'business-hours',
  description: 'Standard business hours',
  timeZone: 'America/New_York',
  rules: [
    {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '17:00',
      type: 'allow'
    },
    {
      days: ['saturday', 'sunday'],
      type: 'deny'
    }
  ],
  exceptions: [
    {
      date: '2025-12-25',
      type: 'holiday',
      reason: 'Christmas Day'
    }
  ]
}
```

#### Configuration Enhancement

```javascript
accessControl: {
  contextAware: {
    enabled: true,
    timeZone: 'UTC',
    businessHours: {
      enabled: true,  // Enable existing functionality
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    customSchedules: {
      enabled: false,  // Phase 2 feature
      schedules: './config/schedules.json'
    },
    holidays: {
      enabled: false,  // Phase 3 feature
      calendar: './config/holidays.json'
    }
  }
}
```

### 🎛️ Admin Interface Requirements

1. **Business Hours Management**
   - Enable/disable business hours
   - Set time range and days
   - Configure time zone

2. **Schedule Management** (Phase 2)
   - Create/edit/delete custom schedules
   - Assign schedules to users/roles
   - Preview schedule coverage

3. **Holiday Management** (Phase 3)
   - Add/remove holidays
   - Import holiday calendars
   - Set recurring holidays

### 🧪 Testing Strategy

1. **Unit Tests**: Test time calculation logic
2. **Integration Tests**: Test with real user sessions
3. **Edge Cases**: Time zone transitions, daylight saving, leap years
4. **Load Tests**: Performance with many concurrent users
5. **User Acceptance**: Admin workflow testing

### 📊 Success Metrics

- **Security**: Zero unauthorized access during restricted hours
- **Usability**: Admin can configure schedules without technical issues
- **Performance**: <100ms overhead per access check
- **Reliability**: 99.9% uptime for time-based checks
- **Auditability**: 100% of access decisions logged with timestamps

### 🚀 Rollout Plan

1. **Week 1**: Enable and test existing business hours
2. **Week 2**: Add custom schedule support
3. **Week 3**: Implement holiday exceptions
4. **Week 4**: Add advanced rules and admin interface
5. **Week 5**: Comprehensive testing and documentation

This design builds on the existing solid foundation while adding the flexibility needed for complex time-based permission scenarios.
