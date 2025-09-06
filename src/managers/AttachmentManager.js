const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * AttachmentManager - Handles file uploads and attachments
 * Similar to JSPWiki's AttachmentManager
 */
class AttachmentManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.attachmentsDirectory = './attachments';
    this.maxFileSize = 10 * 1024 * 1024; // 10MB default
    this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.md', '.doc', '.docx'];
    this.attachments = new Map(); // pageName -> attachments[]
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Set configuration
    this.attachmentsDirectory = config.attachmentsDirectory || './attachments';
    this.maxFileSize = config.maxFileSize || (10 * 1024 * 1024);
    this.allowedExtensions = config.allowedExtensions || this.allowedExtensions;
    
    // Create attachments directory
    await fs.mkdir(this.attachmentsDirectory, { recursive: true });
    
    // Load existing attachments index
    await this.loadAttachmentsIndex();
    
    console.log('📎 AttachmentManager initialized');
  }

  /**
   * Load attachments index from disk
   */
  async loadAttachmentsIndex() {
    try {
      const indexPath = path.join(this.attachmentsDirectory, 'attachments-index.json');
      const indexData = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(indexData);
      
      this.attachments = new Map(Object.entries(index));
      console.log(`📎 Loaded ${this.attachments.size} attachment groups`);
    } catch (err) {
      // Index doesn't exist yet, start fresh
      this.attachments = new Map();
    }
  }

  /**
   * Save attachments index to disk
   */
  async saveAttachmentsIndex() {
    try {
      const indexPath = path.join(this.attachmentsDirectory, 'attachments-index.json');
      const index = Object.fromEntries(this.attachments);
      await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    } catch (err) {
      console.error('Error saving attachments index:', err);
    }
  }

  /**
   * Upload an attachment for a page
   * @param {string} pageName - Page name
   * @param {Object} file - File object from multer
   * @returns {Object} Attachment metadata
   */
  async uploadAttachment(pageName, file) {
    // Validate file
    this.validateFile(file);
    
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileHash = crypto.randomBytes(8).toString('hex');
    const safeFileName = `${pageName}_${fileHash}${fileExt}`;
    const filePath = path.join(this.attachmentsDirectory, safeFileName);
    
    // Save file
    await fs.writeFile(filePath, file.buffer);
    
    // Create attachment metadata
    const attachment = {
      id: fileHash,
      originalName: file.originalname,
      fileName: safeFileName,
      path: filePath,
      size: file.size,
      mimeType: file.mimetype,
      uploadDate: new Date().toISOString(),
      pageName: pageName
    };
    
    // Add to index
    if (!this.attachments.has(pageName)) {
      this.attachments.set(pageName, []);
    }
    this.attachments.get(pageName).push(attachment);
    
    // Save index
    await this.saveAttachmentsIndex();
    
    console.log(`📎 Uploaded attachment: ${attachment.originalName} for page ${pageName}`);
    return attachment;
  }

  /**
   * Validate uploaded file
   * @param {Object} file - File object
   */
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
    }
    
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(fileExt)) {
      throw new Error(`File type not allowed. Allowed: ${this.allowedExtensions.join(', ')}`);
    }
  }

  /**
   * Get attachments for a page
   * @param {string} pageName - Page name
   * @returns {Array} List of attachments
   */
  getAttachments(pageName) {
    return this.attachments.get(pageName) || [];
  }

  /**
   * Get attachment by ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Object|null} Attachment object
   */
  getAttachment(attachmentId) {
    for (const attachments of this.attachments.values()) {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (attachment) return attachment;
    }
    return null;
  }

  /**
   * Delete an attachment
   * @param {string} attachmentId - Attachment ID
   */
  async deleteAttachment(attachmentId) {
    const attachment = this.getAttachment(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }
    
    // Delete file
    try {
      await fs.unlink(attachment.path);
    } catch (err) {
      console.warn('Could not delete attachment file:', err.message);
    }
    
    // Remove from index
    const pageAttachments = this.attachments.get(attachment.pageName);
    if (pageAttachments) {
      const index = pageAttachments.findIndex(a => a.id === attachmentId);
      if (index > -1) {
        pageAttachments.splice(index, 1);
        if (pageAttachments.length === 0) {
          this.attachments.delete(attachment.pageName);
        }
      }
    }
    
    // Save index
    await this.saveAttachmentsIndex();
    
    console.log(`📎 Deleted attachment: ${attachment.originalName}`);
  }

  /**
   * Get all attachments across all pages
   * @returns {Array} All attachments
   */
  getAllAttachments() {
    const allAttachments = [];
    for (const attachments of this.attachments.values()) {
      allAttachments.push(...attachments);
    }
    return allAttachments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }

  /**
   * Get attachment URL for serving
   * @param {string} attachmentId - Attachment ID
   * @returns {string} URL path
   */
  getAttachmentUrl(attachmentId) {
    return `/attachments/${attachmentId}`;
  }

  /**
   * Clean up orphaned attachments (attachments for pages that no longer exist)
   * @param {Array} existingPageNames - List of existing page names
   */
  async cleanupOrphanedAttachments(existingPageNames) {
    const pageNameSet = new Set(existingPageNames);
    let cleanedCount = 0;
    
    for (const [pageName, attachments] of this.attachments.entries()) {
      if (!pageNameSet.has(pageName)) {
        // Page no longer exists, delete all its attachments
        for (const attachment of attachments) {
          try {
            await fs.unlink(attachment.path);
            cleanedCount++;
          } catch (err) {
            console.warn('Could not delete orphaned attachment:', err.message);
          }
        }
        this.attachments.delete(pageName);
      }
    }
    
    if (cleanedCount > 0) {
      await this.saveAttachmentsIndex();
      console.log(`📎 Cleaned up ${cleanedCount} orphaned attachments`);
    }
  }
}

module.exports = AttachmentManager;
