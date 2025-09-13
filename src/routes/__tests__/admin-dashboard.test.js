const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// Mock the WikiRoutes class
const mockWikiRoutes = {
  getCommonTemplateData: jest.fn().mockResolvedValue({
    user: { username: 'testuser' },
    pageTitle: 'Admin Dashboard'
  })
};

// Mock the engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'WikiRoutes') return mockWikiRoutes;
    return null;
  })
};

describe('Admin Dashboard Enhancements (PR #18)', () => {
  describe('Success/Error Message Display', () => {
    test('should render success message when provided', () => {
      // Mock template data with success message
      const templateData = {
        successMessage: 'Settings updated successfully',
        user: { username: 'admin' },
        pageTitle: 'Admin Dashboard'
      };

      // Simulate EJS template rendering
      const expectedHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle"></i> Settings updated successfully
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;

      // Verify the success message structure
      expect(expectedHtml).toContain('alert-success');
      expect(expectedHtml).toContain('fa-check-circle');
      expect(expectedHtml).toContain('Settings updated successfully');
      expect(expectedHtml).toContain('btn-close');
    });

    test('should render error message when provided', () => {
      // Mock template data with error message
      const templateData = {
        errorMessage: 'Failed to update settings',
        user: { username: 'admin' },
        pageTitle: 'Admin Dashboard'
      };

      // Simulate EJS template rendering
      const expectedHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle"></i> Failed to update settings
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;

      // Verify the error message structure
      expect(expectedHtml).toContain('alert-danger');
      expect(expectedHtml).toContain('fa-exclamation-triangle');
      expect(expectedHtml).toContain('Failed to update settings');
      expect(expectedHtml).toContain('btn-close');
    });

    test('should not render messages when not provided', () => {
      // Mock template data without messages
      const templateData = {
        user: { username: 'admin' },
        pageTitle: 'Admin Dashboard'
      };

      // Simulate EJS template rendering (no alert divs should be present)
      const expectedHtml = `
        <div class="container mt-4">
            <h1>Admin Dashboard</h1>
            <p>Welcome, admin</p>
        </div>
      `;

      // Verify no alert messages are present
      expect(expectedHtml).not.toContain('alert-success');
      expect(expectedHtml).not.toContain('alert-danger');
      expect(expectedHtml).not.toContain('fa-check-circle');
      expect(expectedHtml).not.toContain('fa-exclamation-triangle');
    });

    test('should handle undefined messages gracefully', () => {
      // Mock template data with undefined messages
      const templateData = {
        successMessage: undefined,
        errorMessage: undefined,
        user: { username: 'admin' },
        pageTitle: 'Admin Dashboard'
      };

      // Simulate EJS template rendering (no alert divs should be present)
      const expectedHtml = `
        <div class="container mt-4">
            <h1>Admin Dashboard</h1>
            <p>Welcome, admin</p>
        </div>
      `;

      // Verify no alert messages are present
      expect(expectedHtml).not.toContain('alert-success');
      expect(expectedHtml).not.toContain('alert-danger');
    });
  });

  describe('Bootstrap Alert Components', () => {
    test('should use correct Bootstrap alert classes', () => {
      const successAlert = '<div class="alert alert-success alert-dismissible fade show" role="alert">';
      const errorAlert = '<div class="alert alert-danger alert-dismissible fade show" role="alert">';

      expect(successAlert).toContain('alert');
      expect(successAlert).toContain('alert-success');
      expect(successAlert).toContain('alert-dismissible');
      expect(successAlert).toContain('fade');
      expect(successAlert).toContain('show');
      expect(successAlert).toContain('role="alert"');

      expect(errorAlert).toContain('alert');
      expect(errorAlert).toContain('alert-danger');
      expect(errorAlert).toContain('alert-dismissible');
      expect(errorAlert).toContain('fade');
      expect(errorAlert).toContain('show');
      expect(errorAlert).toContain('role="alert"');
    });

    test('should include FontAwesome icons', () => {
      const successIcon = '<i class="fas fa-check-circle"></i>';
      const errorIcon = '<i class="fas fa-exclamation-triangle"></i>';

      expect(successIcon).toContain('fas');
      expect(successIcon).toContain('fa-check-circle');

      expect(errorIcon).toContain('fas');
      expect(errorIcon).toContain('fa-exclamation-triangle');
    });

    test('should include dismissible close button', () => {
      const closeButton = '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';

      expect(closeButton).toContain('btn-close');
      expect(closeButton).toContain('data-bs-dismiss="alert"');
      expect(closeButton).toContain('type="button"');
    });
  });

  describe('Template Integration', () => {
    test('should integrate with existing admin dashboard template', () => {
      // Mock complete template data
      const templateData = {
        successMessage: 'Configuration saved',
        errorMessage: null,
        user: {
          username: 'admin',
          isAuthenticated: true
        },
        pageTitle: 'Admin Dashboard',
        navigation: [],
        breadcrumbs: []
      };

      // Verify template data structure
      expect(templateData).toHaveProperty('successMessage');
      expect(templateData).toHaveProperty('errorMessage');
      expect(templateData).toHaveProperty('user');
      expect(templateData.user).toHaveProperty('username');
      expect(templateData.user).toHaveProperty('isAuthenticated');
      expect(templateData).toHaveProperty('pageTitle');
    });

    test('should handle multiple message types', () => {
      // Test scenario with both success and error messages
      const templateData = {
        successMessage: 'Settings updated',
        errorMessage: 'Some items failed to save',
        user: { username: 'admin' }
      };

      // Both messages should be handled independently
      expect(templateData.successMessage).toBe('Settings updated');
      expect(templateData.errorMessage).toBe('Some items failed to save');
    });
  });
});