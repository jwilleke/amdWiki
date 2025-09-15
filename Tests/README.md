# amdWiki Route Tests

Comprehensive unit tests for all system routes in amdWiki, including GET /logout, POST /logout, and all other endpoints.

## Overview

This test suite provides complete coverage of all amdWiki routes with proper mocking and authentication testing. It tests:

- ✅ All public routes (GET /, GET /wiki/*, POST /save/*, etc.)
- ✅ All admin routes (GET /admin, POST /admin/users, etc.)
- ✅ Authentication and authorization checks
- ✅ CSRF protection validation
- ✅ Error handling for invalid routes
- ✅ Anonymous vs authenticated user scenarios

## Routes Tested

### Public Routes
- `GET /` - Home page
- `GET /wiki/:page` - View wiki page
- `GET /edit/:page` - Edit page
- `POST /save/:page` - Save page
- `GET /create` - Create page form
- `POST /create` - Create new page
- `POST /delete/:page` - Delete page
- `GET /search` - Search pages
- `GET /login` - Login form
- `POST /login` - Process login
- `GET /logout` - Logout (GET method)
- `POST /logout` - Logout (POST method)
- `GET /register` - Registration form
- `POST /register` - Process registration
- `GET /profile` - User profile
- `POST /profile` - Update profile
- `POST /preferences` - Update preferences
- `GET /user-info` - User information

### Admin Routes
- `GET /admin` - Admin dashboard
- `POST /admin/maintenance/toggle` - Toggle maintenance mode
- `GET /admin/users` - User management
- `POST /admin/users` - Create user
- `PUT /admin/users/:username` - Update user
- `DELETE /admin/users/:username` - Delete user
- `GET /admin/roles` - Role management
- `POST /admin/roles` - Create role
- `PUT /admin/roles/:role` - Update role
- `DELETE /admin/roles/:role` - Delete role
- `GET /admin/notifications` - Notification management
- `POST /admin/notifications/:id/dismiss` - Dismiss notification
- `POST /admin/notifications/clear-all` - Clear all notifications
- `GET /schema/person/:identifier` - Person schema
- `GET /schema/organization/:identifier` - Organization schema

## Running Tests

### Run All Route Tests
```bash
npm test tests/routes.test.js
```

### Run with Coverage
```bash
npm run test:coverage tests/routes.test.js
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="GET /logout"
```

### Run Test Runner Script
```bash
node scripts/run-route-tests.js
```

## Test Structure

### Mocking Strategy
- **WikiEngine**: Fully mocked with configurable managers
- **UserManager**: Mocks authentication, permissions, and user operations
- **PageManager**: Mocks page operations (get, save, delete)
- **ACLManager**: Mocks permission checks
- **NotificationManager**: Mocks notification operations
- **SchemaManager**: Mocks schema operations

### Test Categories

#### Authentication Tests
- Anonymous user access to public routes
- Authenticated user access to protected routes
- Admin user access to admin routes
- Invalid authentication scenarios

#### Authorization Tests
- Permission-based access control
- Role-based restrictions
- Admin-only route protection

#### CSRF Protection Tests
- POST requests without CSRF tokens
- POST requests with invalid CSRF tokens
- POST requests with valid CSRF tokens

#### Route-Specific Tests
- Successful operations (200/302 responses)
- Error conditions (403/404/500 responses)
- Redirect behaviors
- Parameter validation

## Example Test Output

```bash
PASS tests/routes.test.js
WikiRoutes - Comprehensive Route Testing
  Public Routes
    GET /
      ✓ should return 200 for home page (12ms)
    GET /wiki/:page
      ✓ should return 200 for existing page (3ms)
      ✓ should return 404 for non-existent page (2ms)
    GET /logout
      ✓ should logout and redirect (5ms)
    POST /logout
      ✓ should logout and redirect (4ms)
    ...
  Admin Routes
    GET /admin
      ✓ should return 200 for admin user (8ms)
      ✓ should return 403 for non-admin user (3ms)
    ...
  Error Handling
    ✓ should return 404 for unknown routes (2ms)
    ✓ should handle server errors gracefully (3ms)
  CSRF Protection
    ✓ should reject POST requests without CSRF token (3ms)
    ✓ should reject POST requests with invalid CSRF token (2ms)
  Authentication Checks
    ✓ should redirect unauthenticated users to login for protected routes (4ms)
    ✓ should allow anonymous access to public routes (3ms)

Test Suites: 1 passed, 1 total
Tests: 45 passed, 45 total
```

## Key Features Tested

### 1. GET /logout Route
```javascript
describe('GET /logout', () => {
  test('should logout and redirect', async () => {
    mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
    mockUserManager.destroySession.mockResolvedValue(true);

    const response = await request(app).get('/logout');
    expect(response.status).toBe(302);
    expect(mockUserManager.destroySession).toHaveBeenCalled();
  });
});
```

### 2. POST /logout Route
```javascript
describe('POST /logout', () => {
  test('should logout and redirect', async () => {
    mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
    mockUserManager.destroySession.mockResolvedValue(true);

    const response = await request(app)
      .post('/logout')
      .send({ _csrf: 'test-csrf-token' });

    expect(response.status).toBe(302);
    expect(mockUserManager.destroySession).toHaveBeenCalled();
  });
});
```

### 3. CSRF Protection
```javascript
describe('CSRF Protection', () => {
  test('should reject POST requests without CSRF token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'test', password: 'pass' });

    expect(response.status).toBe(403);
  });
});
```

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Route Tests
  run: npm test tests/routes.test.js

- name: Generate Coverage Report
  run: npm run test:coverage tests/routes.test.js
```

## Contributing

When adding new routes to amdWiki:

1. Add the route to `WikiRoutes.js`
2. Add corresponding tests to `tests/routes.test.js`
3. Update this README with the new route
4. Run tests to ensure everything works

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure all dependencies are properly mocked
2. **CSRF token errors**: Check that CSRF tokens are included in POST requests
3. **Authentication failures**: Verify mock user setup in test cases
4. **Route not found**: Ensure route is registered in `registerRoutes()` method

### Debug Mode

Run tests with verbose output:
```bash
npm test -- --verbose tests/routes.test.js
```

Run specific test with debug:
```bash
npm test -- --testNamePattern="GET /logout" --verbose
```
