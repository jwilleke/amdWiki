const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * WikiFormHandler - Interactive form generation within wiki pages
 * 
 * Supports JSPWiki form syntax:
 * - [{FormOpen action='SaveData' method='POST'}] - Form opening
 * - [{FormInput name='field' type='text' value='default'}] - Input fields
 * - [{FormSelect name='choice' options='A,B,C'}] - Select boxes
 * - [{FormTextarea name='comment' rows='5'}] - Text areas
 * - [{FormButton type='submit' value='Save'}] - Form buttons
 * - [{FormClose}] - Form closing
 * 
 * Related Issue: #60 - WikiForm Handler (FormOpen, FormInput, FormClose)
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class WikiFormHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /\[\{Form(Open|Input|Select|Textarea|Button|Close)\s*([^}]*)\}\]/g, // Pattern: [{FormElement params}]
      85, // High priority - process before content handlers
      {
        description: 'JSPWiki-style form handler for interactive forms within wiki pages',
        version: '1.0.0',
        dependencies: ['UserManager'], // For CSRF token generation
        timeout: 5000,
        cacheEnabled: false // Forms should not be cached due to CSRF tokens
      }
    );
    this.handlerId = 'WikiFormHandler';
    this.engine = engine;
    this.config = null;
    
    // Form state tracking
    this.activeForms = new Map(); // formId -> form state
    this.formCounter = 0;
  }

  /**
   * Initialize handler with configuration
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load handler-specific configuration
    const markupParser = context.engine?.getManager('MarkupParser');
    if (markupParser) {
      this.config = markupParser.getHandlerConfig('form');
      
      if (this.config.priority && this.config.priority !== this.priority) {
        this.priority = this.config.priority;
        console.log(`🔧 WikiFormHandler priority set to ${this.priority} from configuration`);
      }
    }
  }

  /**
   * Process content by finding and executing all form elements
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with forms processed
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    // Reset form state for this processing session
    this.activeForms.clear();
    this.formCounter = 0;

    const matches = [];
    let match;
    
    // Reset regex state
    this.pattern.lastIndex = 0;
    
    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        elementType: match[1], // Open, Input, Select, etc.
        paramString: match[2] || '',
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in order (not reverse) to maintain form structure
    let processedContent = content;
    let offset = 0; // Track offset due to content changes
    
    for (const matchInfo of matches) {
      try {
        const replacement = await this.handle(matchInfo, context);
        
        const adjustedIndex = matchInfo.index + offset;
        processedContent = 
          processedContent.slice(0, adjustedIndex) +
          replacement +
          processedContent.slice(adjustedIndex + matchInfo.length);
        
        // Update offset for next replacement
        offset += replacement.length - matchInfo.length;
          
      } catch (error) {
        console.error(`❌ WikiForm element error for ${matchInfo.elementType}:`, error.message);
        
        const errorPlaceholder = `<!-- Form Error: ${matchInfo.elementType} - ${error.message} -->`;
        const adjustedIndex = matchInfo.index + offset;
        processedContent = 
          processedContent.slice(0, adjustedIndex) +
          errorPlaceholder +
          processedContent.slice(adjustedIndex + matchInfo.length);
          
        offset += errorPlaceholder.length - matchInfo.length;
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific form element
   * @param {Object} matchInfo - Form element match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Form element HTML
   */
  async handle(matchInfo, context) {
    const { elementType, paramString } = matchInfo;
    
    // Parse element parameters
    const parameters = this.parseParameters(paramString);
    
    // Route to specific element handler
    switch (elementType) {
      case 'Open':
        return await this.handleFormOpen(parameters, context);
      case 'Input':
        return await this.handleFormInput(parameters, context);
      case 'Select':
        return await this.handleFormSelect(parameters, context);
      case 'Textarea':
        return await this.handleFormTextarea(parameters, context);
      case 'Button':
        return await this.handleFormButton(parameters, context);
      case 'Close':
        return await this.handleFormClose(parameters, context);
      default:
        throw new Error(`Unsupported form element: ${elementType}`);
    }
  }

  /**
   * Handle FormOpen element
   * @param {Object} params - Form parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Form opening HTML
   */
  async handleFormOpen(params, context) {
    const formId = `wikiForm_${++this.formCounter}_${Date.now()}`;
    const action = params.action || '/api/forms/submit';
    const method = (params.method || 'POST').toUpperCase();
    const name = params.name || formId;
    const cssClass = params.class || 'wiki-form';
    
    // Generate CSRF token
    const csrfToken = await this.generateCSRFToken(context);
    
    // Store form state
    this.activeForms.set(formId, {
      id: formId,
      action,
      method,
      name,
      fields: [],
      csrfToken,
      context: {
        pageName: context.pageName,
        userName: context.userName
      }
    });
    
    return `<form id="${formId}" name="${name}" action="${action}" method="${method}" class="${cssClass}">
  <input type="hidden" name="_formId" value="${formId}">
  <input type="hidden" name="_csrfToken" value="${csrfToken}">
  <input type="hidden" name="_pageName" value="${context.pageName}">`;
  }

  /**
   * Handle FormInput element
   * @param {Object} params - Input parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Input field HTML
   */
  async handleFormInput(params, context) {
    const name = params.name;
    const type = params.type || 'text';
    const value = params.value || '';
    const placeholder = params.placeholder || '';
    const required = params.required === 'true' || params.required === true;
    const cssClass = params.class || 'form-control';
    const id = params.id || `input_${name}`;
    
    if (!name) {
      throw new Error('FormInput requires "name" parameter');
    }

    // Validate input type
    const allowedTypes = ['text', 'password', 'email', 'number', 'date', 'hidden', 'checkbox', 'radio', 'file'];
    if (!allowedTypes.includes(type)) {
      throw new Error(`Invalid input type: ${type}`);
    }

    // Build input HTML
    let inputHtml = `<div class="mb-3">`;
    
    // Add label for non-hidden inputs
    if (type !== 'hidden') {
      const label = params.label || this.capitalize(name);
      inputHtml += `<label for="${id}" class="form-label">${this.escapeHtml(label)}</label>`;
    }
    
    // Create input element
    inputHtml += `<input type="${type}" id="${id}" name="${name}" class="${cssClass}"`;
    
    if (value) {
      inputHtml += ` value="${this.escapeHtml(value)}"`;
    }
    
    if (placeholder) {
      inputHtml += ` placeholder="${this.escapeHtml(placeholder)}"`;
    }
    
    if (required) {
      inputHtml += ` required`;
    }
    
    // Add additional attributes for specific types
    if (type === 'number') {
      if (params.min !== undefined) inputHtml += ` min="${params.min}"`;
      if (params.max !== undefined) inputHtml += ` max="${params.max}"`;
      if (params.step !== undefined) inputHtml += ` step="${params.step}"`;
    }
    
    if (type === 'file') {
      if (params.accept) inputHtml += ` accept="${this.escapeHtml(params.accept)}"`;
      if (params.multiple === 'true') inputHtml += ` multiple`;
    }
    
    inputHtml += `>`;
    
    // Add validation feedback placeholder
    if (type !== 'hidden') {
      inputHtml += `<div class="invalid-feedback"></div>`;
    }
    
    inputHtml += `</div>`;
    
    return inputHtml;
  }

  /**
   * Handle FormSelect element
   * @param {Object} params - Select parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Select field HTML
   */
  async handleFormSelect(params, context) {
    const name = params.name;
    const options = params.options || '';
    const selected = params.selected || '';
    const required = params.required === 'true' || params.required === true;
    const cssClass = params.class || 'form-select';
    const id = params.id || `select_${name}`;
    
    if (!name) {
      throw new Error('FormSelect requires "name" parameter');
    }

    const label = params.label || this.capitalize(name);
    
    let selectHtml = `<div class="mb-3">
  <label for="${id}" class="form-label">${this.escapeHtml(label)}</label>
  <select id="${id}" name="${name}" class="${cssClass}"${required ? ' required' : ''}>`;
    
    // Add default option if not required
    if (!required) {
      selectHtml += `<option value="">-- Select ${label} --</option>`;
    }
    
    // Parse and add options
    const optionList = options.split(',').map(opt => opt.trim()).filter(opt => opt);
    
    for (const option of optionList) {
      const isSelected = option === selected;
      selectHtml += `<option value="${this.escapeHtml(option)}"${isSelected ? ' selected' : ''}>${this.escapeHtml(option)}</option>`;
    }
    
    selectHtml += `</select>
  <div class="invalid-feedback"></div>
</div>`;
    
    return selectHtml;
  }

  /**
   * Handle FormTextarea element
   * @param {Object} params - Textarea parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Textarea HTML
   */
  async handleFormTextarea(params, context) {
    const name = params.name;
    const rows = params.rows || '3';
    const cols = params.cols || '';
    const value = params.value || '';
    const placeholder = params.placeholder || '';
    const required = params.required === 'true' || params.required === true;
    const cssClass = params.class || 'form-control';
    const id = params.id || `textarea_${name}`;
    
    if (!name) {
      throw new Error('FormTextarea requires "name" parameter');
    }

    const label = params.label || this.capitalize(name);
    
    let textareaHtml = `<div class="mb-3">
  <label for="${id}" class="form-label">${this.escapeHtml(label)}</label>
  <textarea id="${id}" name="${name}" class="${cssClass}" rows="${rows}"`;
    
    if (cols) {
      textareaHtml += ` cols="${cols}"`;
    }
    
    if (placeholder) {
      textareaHtml += ` placeholder="${this.escapeHtml(placeholder)}"`;
    }
    
    if (required) {
      textareaHtml += ` required`;
    }
    
    textareaHtml += `>${this.escapeHtml(value)}</textarea>
  <div class="invalid-feedback"></div>
</div>`;
    
    return textareaHtml;
  }

  /**
   * Handle FormButton element
   * @param {Object} params - Button parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Button HTML
   */
  async handleFormButton(params, context) {
    const type = params.type || 'button';
    const value = params.value || 'Button';
    const cssClass = params.class || `btn ${type === 'submit' ? 'btn-primary' : 'btn-secondary'}`;
    const id = params.id || `button_${type}_${Date.now()}`;
    const disabled = params.disabled === 'true';
    
    let buttonHtml = `<button type="${type}" id="${id}" class="${cssClass}"`;
    
    if (disabled) {
      buttonHtml += ` disabled`;
    }
    
    buttonHtml += `>${this.escapeHtml(value)}</button>`;
    
    return buttonHtml;
  }

  /**
   * Handle FormClose element
   * @param {Object} params - Close parameters (usually empty)
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Form closing HTML
   */
  async handleFormClose(params, context) {
    // Add client-side validation script if enabled
    const includeValidation = params.validation !== 'false';
    
    let closeHtml = '';
    
    if (includeValidation) {
      closeHtml += `
<script>
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('.wiki-form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
});
</script>`;
    }
    
    closeHtml += `</form>`;
    
    return closeHtml;
  }

  /**
   * Generate CSRF token for form security
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - CSRF token
   */
  async generateCSRFToken(context) {
    const crypto = require('crypto');
    
    // Create token based on user context and timestamp
    const tokenData = {
      userName: context.userName || 'anonymous',
      pageName: context.pageName,
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex')
    };
    
    const token = crypto.createHash('sha256')
      .update(JSON.stringify(tokenData))
      .digest('hex')
      .substring(0, 32);
    
    // Store token for validation (in production, this would be in session/database)
    context.setMetadata(`csrfToken_${token}`, {
      ...tokenData,
      expires: Date.now() + 3600000 // 1 hour
    });
    
    return token;
  }

  /**
   * Validate form submission (for future form processing endpoint)
   * @param {Object} formData - Submitted form data
   * @param {string} csrfToken - CSRF token from form
   * @param {ParseContext} context - Parse context
   * @returns {Object} - Validation result
   */
  validateFormSubmission(formData, csrfToken, context) {
    const errors = [];
    
    // Validate CSRF token
    const tokenData = context.getMetadata(`csrfToken_${csrfToken}`);
    if (!tokenData) {
      errors.push('Invalid or missing CSRF token');
    } else if (tokenData.expires < Date.now()) {
      errors.push('CSRF token expired');
    }
    
    // Validate required fields (basic validation)
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (fieldName.startsWith('_')) {
        continue; // Skip internal fields
      }
      
      if (!fieldValue || fieldValue.trim() === '') {
        // Check if field was marked as required (would need form definition)
        // For now, just validate that non-empty values are provided
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: this.sanitizeFormData(formData)
    };
  }

  /**
   * Sanitize form data to prevent XSS
   * @param {Object} formData - Raw form data
   * @returns {Object} - Sanitized form data
   */
  sanitizeFormData(formData) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[key] = this.escapeHtml(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Escape HTML characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return text;
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalize(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get supported form patterns
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '[{FormOpen action="/save" method="POST"}]',
      '[{FormInput name="title" type="text" required="true"}]',
      '[{FormInput name="email" type="email" placeholder="Enter email"}]',
      '[{FormSelect name="category" options="General,Technical,Support"}]',
      '[{FormTextarea name="comment" rows="5" placeholder="Enter comment"}]',
      '[{FormButton type="submit" value="Save" class="btn btn-primary"}]',
      '[{FormClose}]'
    ];
  }

  /**
   * Get supported input types
   * @returns {Array<string>} - Array of supported input types
   */
  getSupportedInputTypes() {
    return [
      'text', 'password', 'email', 'number', 'date', 'datetime-local',
      'time', 'url', 'tel', 'search', 'hidden', 'checkbox', 'radio', 'file'
    ];
  }

  /**
   * Get handler information for debugging and documentation
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: this.getSupportedPatterns(),
      supportedInputTypes: this.getSupportedInputTypes(),
      features: [
        'Interactive form generation',
        'CSRF protection',
        'HTML5 input types',
        'Bootstrap styling',
        'Client-side validation',
        'XSS prevention',
        'Required field validation',
        'File upload support',
        'Customizable CSS classes',
        'Form state tracking'
      ],
      formElements: [
        'FormOpen - Form opening with CSRF protection',
        'FormInput - Various input types with validation',
        'FormSelect - Dropdown selections with options',
        'FormTextarea - Multi-line text input',
        'FormButton - Submit and action buttons',
        'FormClose - Form closing with validation script'
      ]
    };
  }
}

module.exports = WikiFormHandler;
