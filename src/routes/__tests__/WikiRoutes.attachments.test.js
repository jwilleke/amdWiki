const { describe, test, expect, beforeEach } = require('@jest/globals');
const WikiRoutes = require('../WikiRoutes');

// Mock dependencies
const mockAttachmentManager = {
  uploadAttachment: jest.fn(),
  getAttachment: jest.fn(),
  deleteAttachment: jest.fn(),
  getAttachmentPath: jest.fn()
};

const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'AttachmentManager') return mockAttachmentManager;
    return null;
  })
};

// Create request object with proper structure
const createMockReq = (userContext = null, params = {}, body = {}, file = null) => ({
  params,
  body,
  file,
  session: {},
  path: '/test',
  userContext
});

const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    sendFile: jest.fn()
  };
  return res;
};

describe('WikiRoutes - Attachment Security (Issue #22)', () => {
  let wikiRoutes;

  beforeEach(() => {
    wikiRoutes = new WikiRoutes(mockEngine);
    jest.clearAllMocks();
  });

  describe('uploadAttachment', () => {
    test('should allow authenticated users to upload attachments', async () => {
      // Setup - authenticated user with file
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { page: 'TestPage' },
        { description: 'Test attachment' },
        { buffer: Buffer.from('test'), originalname: 'test.pdf', mimetype: 'application/pdf', size: 4 }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.uploadAttachment.mockResolvedValue({
        identifier: 'test-attachment',
        filename: 'test.pdf',
        url: '/attachments/test.pdf'
      });

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockAttachmentManager.uploadAttachment).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          attachment: expect.objectContaining({
            identifier: 'test-attachment'
          })
        })
      );
    });

    test('should deny access for unauthenticated users', async () => {
      // Setup - no user context
      const mockReq = createMockReq(
        null,  // Not authenticated
        { page: 'TestPage' },
        {}
      );
      const mockRes = createMockRes();

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required to upload attachments'
      });
    });

    test('should deny access when user is not authenticated', async () => {
      // Setup - user context exists but isAuthenticated is false
      const mockReq = createMockReq(
        { username: 'guest', isAuthenticated: false },
        { page: 'TestPage' },
        {}
      );
      const mockRes = createMockRes();

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required to upload attachments'
      });
    });

    test('should return 400 when no file is uploaded', async () => {
      // Setup - authenticated user but no file
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { page: 'TestPage' },
        {},
        null  // No file
      );
      const mockRes = createMockRes();

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });

    test('should handle upload errors gracefully', async () => {
      // Setup - authenticated user with file but upload fails
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { page: 'TestPage' },
        {},
        { buffer: Buffer.from('test'), originalname: 'test.pdf', mimetype: 'application/pdf', size: 4 }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.uploadAttachment.mockRejectedValue(new Error('Upload failed'));

      // Execute
      await wikiRoutes.uploadAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Upload failed'
      });
    });
  });

  describe('serveAttachment', () => {
    test('should serve attachments to authorized users', async () => {
      // Setup - serveAttachment uses attachmentId param
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { attachmentId: 'test-attachment-id' }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.getAttachment.mockResolvedValue({
        buffer: Buffer.from('test file content'),
        metadata: {
          name: 'test.pdf',
          encodingFormat: 'application/pdf',
          contentSize: 17
        }
      });

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockAttachmentManager.getAttachment).toHaveBeenCalledWith('test-attachment-id');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.send).toHaveBeenCalled();
    });

    test('should return 404 for non-existent attachments', async () => {
      // Setup
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { attachmentId: 'nonexistent-id' }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.getAttachment.mockResolvedValue(null);

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should handle file system errors', async () => {
      // Setup
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { attachmentId: 'test-attachment-id' }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.getAttachment.mockRejectedValue(new Error('File system error'));

      // Execute
      await wikiRoutes.serveAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteAttachment', () => {
    test('should allow authorized users to delete attachments', async () => {
      // Setup - deleteAttachment uses attachmentId param
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { attachmentId: 'test-attachment-id' }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.deleteAttachment.mockResolvedValue(true);

      // Execute
      await wikiRoutes.deleteAttachment(mockReq, mockRes);

      // Verify
      expect(mockAttachmentManager.deleteAttachment).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test('should deny delete access for unauthenticated users', async () => {
      // Setup
      const mockReq = createMockReq(
        null,  // Not authenticated
        { attachmentId: 'test-attachment-id' }
      );
      const mockRes = createMockRes();

      // Execute
      await wikiRoutes.deleteAttachment(mockReq, mockRes);

      // Verify - implementation returns 401 for unauthenticated
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('should handle delete errors gracefully', async () => {
      // Setup
      const mockReq = createMockReq(
        { username: 'testuser', isAuthenticated: true },
        { attachmentId: 'test-attachment-id' }
      );
      const mockRes = createMockRes();

      mockAttachmentManager.deleteAttachment.mockRejectedValue(new Error('Delete failed'));

      // Execute
      await wikiRoutes.deleteAttachment(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
