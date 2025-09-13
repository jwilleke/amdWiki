const ImagePlugin = require('./ImagePlugin');

describe('Image', () => {
  let mockContext;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      get: jest.fn()
    };
    mockConfig.get.mockImplementation((key, defaultValue) => {
      const configMap = {
        'features.images.defaultAlt': 'Uploaded image',
        'features.images.defaultClass': 'wiki-image'
      };
      return configMap[key] || defaultValue;
    });

    mockContext = {
      engine: {
        getConfig: jest.fn().mockReturnValue(mockConfig)
      }
    };
  });

  describe('execute method', () => {
    it('should generate basic img tag with src', () => {
      const params = { src: '/images/test.jpg' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<img');
      expect(result).toContain('src="/images/test.jpg"');
      expect(result).toContain('alt="Uploaded image"');
      expect(result).toContain('class="wiki-image"');
      expect(result).toContain('/>');
    });

    it('should handle relative src paths', () => {
      const params = { src: 'test.jpg' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/test.jpg"');
    });

    it('should handle absolute src paths', () => {
      const params = { src: 'https://example.com/image.jpg' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="https://example.com/image.jpg"');
    });

    it('should use custom alt text', () => {
      const params = { src: '/images/test.jpg', alt: 'Custom alt text' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('alt="Custom alt text"');
    });

    it('should include width and height attributes', () => {
      const params = { src: '/images/test.jpg', width: '200', height: '150' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('width="200"');
      expect(result).toContain('height="150"');
    });

    it('should include custom class', () => {
      const params = { src: '/images/test.jpg', class: 'custom-class' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('class="custom-class"');
    });

    it('should include style attribute', () => {
      const params = { src: '/images/test.jpg', style: 'border: 1px solid black;' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('style="border: 1px solid black;"');
    });

    it('should return error when src is missing', () => {
      const params = { alt: 'Test' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('Image plugin: src attribute is required');
    });

    it('should handle errors gracefully', () => {
      // Create a context that will cause an error
      const badContext = {
        engine: {
          getConfig: jest.fn().mockImplementation(() => {
            throw new Error('Config error');
          })
        }
      };

      const params = { src: '/images/test.jpg' };
      const result = ImagePlugin.execute(badContext, params);

      expect(result).toContain('Image plugin error');
    });

    it('should include caption when provided', () => {
      const params = { src: '/images/test.jpg', caption: 'Test Caption' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<div class="image-plugin-container');
      expect(result).toContain('<img');
      expect(result).toContain('<div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">Test Caption</div>');
      expect(result).toContain('</div>');
    });

    it('should apply left alignment', () => {
      const params = { src: '/images/test.jpg', align: 'left' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('style="float: left; margin-right: 10px;');
    });

    it('should apply right alignment', () => {
      const params = { src: '/images/test.jpg', align: 'right' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('style="float: right; margin-left: 10px;');
    });

    it('should apply center alignment', () => {
      const params = { src: '/images/test.jpg', align: 'center' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('style="display: block; margin: 0 auto;');
    });

    it('should wrap image in link when link parameter provided', () => {
      const params = { src: '/images/test.jpg', link: 'https://example.com' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain('<img');
      expect(result).toContain('</a>');
    });

    it('should add border style when border parameter provided', () => {
      const params = { src: '/images/test.jpg', border: '2' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('border: 2px solid #ccc;');
    });

    it('should add title attribute when title parameter provided', () => {
      const params = { src: '/images/test.jpg', title: 'Hover text' };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('title="Hover text"');
    });

    it('should combine multiple advanced parameters', () => {
      const params = {
        src: '/images/test.jpg',
        caption: 'Test Caption',
        align: 'center',
        link: 'https://example.com',
        border: '3',
        title: 'Hover text',
        style: 'margin: 10px;'
      };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<div class="image-plugin-container');
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain('style="border: 3px solid #ccc;;margin: 10px; display: block; margin: 0 auto;"');
      expect(result).toContain('title="Hover text"');
      expect(result).toContain('<div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">Test Caption</div>');
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(ImagePlugin.name).toBe('Image');
    });

    it('should have execute method', () => {
      expect(typeof ImagePlugin.execute).toBe('function');
    });
  });
});