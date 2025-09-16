const { describe, test, expect, beforeEach } = require('@jest/globals');
const WikiRoutes = require('../WikiRoutes');

// Mock dependencies
const mockUserManager = {
  getCurrentUser: jest.fn(),
  hasPermission: jest.fn()
};

const mockACLManager = {
  checkAttachmentPermission: jest.fn()
};

const mockAttachmentManager = {
  uploadAttachment: jest.fn(),
  getAttachment: jest.fn(),
  deleteAttachment: jest.fn(),
  getAttachmentPath: jest.fn()
};

const mockEngine = {
  getManager: jest.fn((name) => {
    switch (name) {
      case 'UserManager': return mockUserManager;
      case 'ACLManager': return mockACLManager;
      case 'AttachmentManager': return mockAttachmentManager;
      default: return null;
    }
  })
};

const mockReq = {
  params: {},
  body: {},
  session: {},
  path: '/test'
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
  redirect: jest.fn(),
  setHeader: jest.fn(),
  sendFile: jest.fn()
};

const mockNext = jest.fn();

describe('WikiRoutes - Attachment Security (Issue #22)', () => {
  let wikiRoutes;

  beforeEach(() => {
    wikiRoutes = new WikiRoutes(mockEngine);
    jest.clearAllMocks();
  });

  describe('uploadAttachment', () => {
    test('should allow authenticated users to upload attachments', async () => {
      // Setup
      mockReq.params = { page: 'TestPage' };
      mockReq.body = { filename: 'test.pdf' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.uploadAttachment.mockResolvedValue({
        id: 'test-attachment',
        filename: 'test.pdf'
      });

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockUserManager.getCurrentUser).toHaveBeenCalledWith(mockReq);
      expect(mockACLManager.checkAttachmentPermission).toHaveBeenCalledWith(
        { username: 'testuser', isAuthenticated: true },
        expect.any(String),
        'upload'
      );
      expect(mockAttachmentManager.uploadAttachment).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        attachment: {
          id: 'test-attachment',
          filename: 'test.pdf'
        }
      });
    });

    test('should deny access for unauthenticated users', async () => {
      // Setup
      mockReq.params = { page: 'TestPage' };
      mockUserManager.getCurrentUser.mockResolvedValue(null);

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required to upload attachments'
      });
    });

    test('should deny access when attachment permission is denied', async () => {
      // Setup
      mockReq.params = { page: 'SystemPage' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'regularuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(false);

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permission denied to upload attachments to this page'
      });
    });

    test('should handle upload errors gracefully', async () => {
      // Setup
      mockReq.params = { page: 'TestPage' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.uploadAttachment.mockRejectedValue(new Error('Upload failed'));

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Upload failed'
      });
    });
  });

  describe('serveAttachment', () => {
    test('should serve attachments to authorized users', async () => {
      // Setup
      mockReq.params = { attachmentId: 'test-attachment' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.getAttachment.mockReturnValue({
        id: 'test-attachment',
        filename: 'test.pdf',
        pageName: 'TestPage'
      });
      mockAttachmentManager.getAttachmentPath.mockReturnValue('/path/to/test.pdf');

      // Mock fs.existsSync and res.sendFile
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      mockRes.sendFile = jest.fn();

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockUserManager.getCurrentUser).toHaveBeenCalledWith(mockReq);
      expect(mockACLManager.checkAttachmentPermission).toHaveBeenCalledWith(
        { username: 'testuser', isAuthenticated: true },
        'test-attachment',
        'view'
      );
      expect(mockRes.sendFile).toHaveBeenCalledWith('/path/to/test.pdf');

      // Restore fs.existsSync
      fs.existsSync.mockRestore();
    });

    test('should deny access for unauthorized users', async () => {
      // Setup
      mockReq.params = { id: 'system-attachment' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'regularuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(false);

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permission denied to view this attachment'
      });
    });

    test('should return 404 for non-existent attachments', async () => {
      // Setup
      mockReq.params = { id: 'nonexistent' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.getAttachment.mockReturnValue(null);

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Attachment not found'
      });
    });

    test('should handle file system errors', async () => {
      // Setup
      mockReq.params = { attachmentId: 'test-attachment' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.getAttachment.mockReturnValue({
        id: 'test-attachment',
        filename: 'test.pdf'
      });
      mockAttachmentManager.getAttachmentPath.mockReturnValue('/path/to/test.pdf');

      // Mock fs.existsSync to return false
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Attachment file not found'
      });

      // Restore fs.existsSync
      fs.existsSync.mockRestore();
    });
  });

  describe('deleteAttachment', () => {
    test('should allow authorized users to delete attachments', async () => {
      // Setup
      mockReq.params = { attachmentId: 'test-attachment' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.deleteAttachment.mockResolvedValue(true);

      // Execute
      await wikiRoutes.deleteAttachment(mockReq, mockRes);

      // Verify
      expect(mockUserManager.getCurrentUser).toHaveBeenCalledWith(mockReq);
      expect(mockACLManager.checkAttachmentPermission).toHaveBeenCalledWith(
        { username: 'testuser', isAuthenticated: true },
        'test-attachment',
        'delete'
      );
      expect(mockAttachmentManager.deleteAttachment).toHaveBeenCalledWith('test-attachment');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Attachment deleted successfully'
      });
    });

    test('should deny delete access for unauthorized users', async () => {
      // Setup
      mockReq.params = { id: 'system-attachment' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'regularuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(false);

      // Execute
      await wikiRoutes.deleteAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permission denied to delete this attachment'
      });
    });

    test('should handle delete errors gracefully', async () => {
      // Setup
      mockReq.params = { attachmentId: 'test-attachment' };
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'testuser',
        isAuthenticated: true
      });
      mockACLManager.checkAttachmentPermission.mockResolvedValue(true);
      mockAttachmentManager.deleteAttachment.mockRejectedValue(new Error('Delete failed'));

      // Execute
      await wikiRoutes.deleteAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Delete failed'
      });
    });
  });
});