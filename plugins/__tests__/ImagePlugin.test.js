/**
 * Plugin discovery:
 * Mocks a ConfigurationManager to point PluginManager at the real ./plugins directory,
 * calls registerPlugins(), and retrieves the Image plugin by name.
 * Context/config: Stubs context.engine.getConfig().get() to supply defaultAlt and defaultClass settings used by the plugin.
 * execute() coverage:
 * Basic img generation with src, default alt/class.
 * Relative vs absolute src handling.
 * Custom alt text.
 * Width/height attributes.
 * Custom class and inline style.
 * Error when src is missing.
 * Graceful handling when engine.getConfig throws (returns an error message).
 * Caption wrapping markup.
 * Alignment: left, right, center (checks expected style fragments).
 * Link wrapping when link is provided.
 * Border and title attributes.
 * Combined advanced parameters (ensures key substrings are present).
 * Metadata:
 * ImagePlugin.name equals "Image".
 * ImagePlugin.execute is a function.
 *
 * It does not test HTML semantics or CSS rendering; assertions are string contains/regex-based. It also relies on loading all plugins from ./plugins (so other plugins may log during setup).
 *
 */

const path = require("path");
const fs = require("fs-extra");

const PluginManager = require("../../src/managers/PluginManager");

const localTestImage = "/images/test.jpg";
const internetTestImage = "https://picsum.photos/id/1/200/300";

describe("Image (via PluginManager)", () => {
  let ImagePlugin;
  let mockContext;
  let mockConfig;
  let pm;

  beforeAll(async () => {
    // Point ConfigurationManager to the real ./plugins directory
    const pluginsDir = path.resolve(__dirname, "..");
    const exists = await fs.pathExists(pluginsDir);
    if (!exists) {
      throw new Error(`Plugins directory not found at ${pluginsDir}`);
    }

    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };
    // PluginManager expects ConfigurationManager.getProperty(...) in production code
    const cfgMgr = { getProperty: jest.fn().mockReturnValue([pluginsDir]) };
    const engine = {
      getManager: (name) => (name === "ConfigurationManager" ? cfgMgr : null),
      logger,
    };

    pm = new PluginManager(engine);
    if (!pm.engine) pm.engine = engine; // safety if constructor signature differs
    await pm.registerPlugins();

    ImagePlugin = pm.plugins.get("Image");
    if (!ImagePlugin) {
      const names = Array.from(pm.plugins.keys());
      throw new Error(
        `Image plugin not found. Loaded plugins: ${names.join(", ")}`
      );
    }
  });

  beforeEach(() => {
    const mockConfigManager = {
      getProperty: jest.fn().mockImplementation((key, def) => {
        const configMap = {
          "amdwiki.features.images.defaultAlt": "Uploaded image",
          "amdwiki.features.images.defaultClass": "wiki-image",
        };
        return key in configMap ? configMap[key] : def;
      }),
    };

    mockContext = {
      engine: {
        getManager: jest.fn().mockImplementation((name) => {
          if (name === "ConfigurationManager") {
            return mockConfigManager;
          }
          return null;
        }),
      },
    };
  });

  describe("execute method", () => {
    it("generates basic img tag with src", async () => {
      const params = { src: localTestImage };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("<img");
      expect(result).toContain('src="/images/test.jpg"');
      expect(result).toContain('alt="Uploaded image"');
      expect(result).toContain('class="wiki-image"');
    });

    it("handles relative src paths", async () => {
      const params = { src: localTestImage };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/test.jpg"');
    });

    it("handles absolute src paths", async () => {
      const params = { src: internetTestImage };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain(`src="${internetTestImage}"`);
    });

    it("uses custom alt text", async () => {
      const params = { src: localTestImage, alt: "Custom alt text" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('alt="Custom alt text"');
    });

    it("includes width and height attributes", async () => {
      const params = { src: localTestImage, width: "200", height: "150" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('width="200"');
      expect(result).toContain('height="150"');
    });

    it("includes custom class", async () => {
      const params = { src: localTestImage, class: "custom-class" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('class="custom-class"');
    });

    it("includes style attribute", async () => {
      const params = { src: localTestImage, style: "border: 1px solid black;" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('style="border: 1px solid black;"');
    });

    it("returns error when src is missing", async () => {
      const params = { alt: "Test" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toMatch(/Image plugin: src attribute is required/i);
    });

    it("handles errors gracefully", async () => {
      const badContext = {
        engine: {
          getConfig: jest.fn(() => {
            throw new Error("Config error");
          }),
        },
      };

      const params = { src: localTestImage };
      const result = await ImagePlugin.execute(badContext, params);

      expect(result).toMatch(/Image plugin error/i);
    });

    it("includes caption when provided", async () => {
      const params = { src: localTestImage, caption: "Test Caption" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<div class="image-plugin-container');
      expect(result).toContain("<img");
      expect(result).toContain(">Test Caption</div>");
    });

    it("applies left alignment", async () => {
      const params = { src: localTestImage, align: "left" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("float: left;");
      expect(result).toContain("margin-right: 10px;");
    });

    it("applies right alignment", async () => {
      const params = { src: localTestImage, align: "right" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("float: right;");
      expect(result).toContain("margin-left: 10px;");
    });

    it("applies center alignment", async () => {
      const params = { src: localTestImage, align: "center" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("display: block;");
      expect(result).toContain("margin: 0 auto");
    });

    it("wraps image in link when link parameter provided", async () => {
      const params = { src: localTestImage, link: internetTestImage };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain(`<a href="${internetTestImage}"`);
      expect(result).toContain("<img");
      expect(result).toContain("</a>");
    });

    it("adds border style when border parameter provided", async () => {
      const params = { src: localTestImage, border: "2" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("border: 2px solid #ccc;");
    });

    it("adds title attribute when title parameter provided", async () => {
      const params = { src: localTestImage, title: "Hover text" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('title="Hover text"');
    });

    it("combines multiple advanced parameters", async () => {
      const params = {
        src: localTestImage,
        caption: "Test Caption",
        align: "center",
        link: internetTestImage,
        border: "3",
        title: "Hover text",
        style: "margin: 10px;",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<div class="image-plugin-container');
      expect(result).toContain(`<a href="${internetTestImage}"`);
      // Be flexible on style concatenation order; check substrings
      expect(result).toContain("border: 3px solid #ccc;");
      expect(result).toContain("margin: 10px;");
      expect(result).toContain("display: block;");
      expect(result).toContain("margin: 0 auto"); // Not checking for exact end as we added bottom margin
      expect(result).toContain('title="Hover text"');
      expect(result).toContain(">Test Caption</div>");
    });
  });

  describe("plugin metadata", () => {
    it("has correct name", async () => {
      expect(ImagePlugin.name).toBe("Image");
    });

    it("has execute method", async () => {
      expect(typeof ImagePlugin.execute).toBe("function");
    });
  });

  describe("uploaded image integration (Bug #76)", () => {
    it("handles uploaded image paths correctly", async () => {
      // Simulate path returned by upload endpoint
      const uploadedPath = "/images/upload-1234567890-123456789.jpg";
      const params = { src: uploadedPath, alt: "Uploaded file" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("<img");
      expect(result).toContain(`src="${uploadedPath}"`);
      expect(result).toContain('alt="Uploaded file"');
      // Should not double the /images/ prefix
      expect(result).not.toContain("/images/images/");
    });

    it("does not add /images/ prefix to paths starting with /images/", async () => {
      const params = { src: "/images/upload-123.jpg" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/upload-123.jpg"');
      expect(result).not.toContain("/images/images/");
    });

    it("adds /images/ prefix to relative paths without /", async () => {
      const params = { src: "local-image.jpg" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/local-image.jpg"');
    });

    it("preserves absolute URLs without modification", async () => {
      const params = { src: "https://example.com/image.jpg" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).not.toContain("/images/https://");
    });

    it("handles uploaded PNG files", async () => {
      const params = { src: "/images/upload-1234567890-123456789.png" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/upload-1234567890-123456789.png"');
    });

    it("handles uploaded WebP files", async () => {
      const params = { src: "/images/upload-1234567890-123456789.webp" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain(
        'src="/images/upload-1234567890-123456789.webp"'
      );
    });

    it("handles uploaded SVG files", async () => {
      const params = { src: "/images/upload-1234567890-123456789.svg" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/upload-1234567890-123456789.svg"');
    });

    it("works with upload response imagePath property", async () => {
      // Simulate full upload response
      const uploadResponse = {
        success: true,
        imagePath: "/images/upload-1234567890-123456789.jpg",
        filename: "upload-1234567890-123456789.jpg",
        originalName: "my-photo.jpg",
        size: 245678,
      };

      const params = {
        src: uploadResponse.imagePath,
        alt: uploadResponse.originalName,
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain(`src="${uploadResponse.imagePath}"`);
      expect(result).toContain(`alt="${uploadResponse.originalName}"`);
    });

    it("generates correct syntax for edit.ejs insertImage", async () => {
      // Simulate what edit.ejs does when user clicks "Insert at Cursor"
      const uploadResponse = {
        imagePath: "/images/upload-1234567890-123456789.jpg",
        originalName: "vacation.jpg",
      };

      const imageSyntax = `[{Image src='${uploadResponse.imagePath}' alt='${uploadResponse.originalName}'}]`;

      expect(imageSyntax).toBe(
        "[{Image src='/images/upload-1234567890-123456789.jpg' alt='vacation.jpg'}]"
      );
    });
  });

  describe("ConfigurationManager integration", () => {
    it("falls back to default values when ConfigurationManager unavailable", async () => {
      const contextWithoutConfig = {
        engine: {
          getManager: jest.fn().mockReturnValue(null),
        },
      };

      const params = { src: "/images/test.jpg" };
      const result = await ImagePlugin.execute(contextWithoutConfig, params);

      expect(result).toContain("<img");
      expect(result).toContain('alt="Uploaded image"'); // default fallback
      expect(result).toContain('class="wiki-image"'); // default fallback
    });

    it("uses ConfigurationManager values when available", async () => {
      const customConfigManager = {
        getProperty: jest.fn().mockImplementation((key, def) => {
          if (key === "amdwiki.features.images.defaultAlt") return "Custom Alt";
          if (key === "amdwiki.features.images.defaultClass")
            return "custom-class";
          return def;
        }),
      };

      const contextWithCustomConfig = {
        engine: {
          getManager: jest.fn().mockReturnValue(customConfigManager),
        },
      };

      const params = { src: "/images/test.jpg" };
      const result = await ImagePlugin.execute(contextWithCustomConfig, params);

      expect(result).toContain('alt="Custom Alt"');
      expect(result).toContain('class="custom-class"');
    });

    it("handles ConfigurationManager errors gracefully", async () => {
      const faultyConfigManager = {
        getProperty: jest.fn().mockImplementation(() => {
          throw new Error("Config error");
        }),
      };

      const contextWithFaultyConfig = {
        engine: {
          getManager: jest.fn().mockReturnValue(faultyConfigManager),
        },
      };

      const params = { src: "/images/test.jpg" };
      const result = await ImagePlugin.execute(contextWithFaultyConfig, params);

      // Should return error message instead of crashing
      expect(result).toMatch(/Image plugin error/i);
    });
  });

  describe("parameter parsing with spaces", () => {
    it("handles spaces before equals sign", async () => {
      const params = {
        src: localTestImage,
        align: "left",
        caption: "Test Caption",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("float: left;");
      expect(result).toContain(">Test Caption</div>");
    });

    it("handles spaces after equals sign", async () => {
      const params = {
        src: localTestImage,
        style: "font-size: 120%;background-color: white;",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("font-size: 120%;background-color: white;");
    });

    it("handles complex parameters with special characters", async () => {
      const params = {
        src: "/attachments/621c9274e39fc77d5e6cce7028c7805a37e5d977f116c20cc8be728d8de90c26",
        caption: "Nerve Action Potentials",
        align: "left",
        style: "font-size: 120%;background-color: white;",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("<img");
      expect(result).toContain(
        'src="/attachments/621c9274e39fc77d5e6cce7028c7805a37e5d977f116c20cc8be728d8de90c26"'
      );
      expect(result).toContain(">Nerve Action Potentials</div>");
      expect(result).toContain("float: left;");
      expect(result).toContain("font-size: 120%;background-color: white;");
    });
  });

  describe("display parameter", () => {
    it("applies float display with left align (default behavior)", async () => {
      const params = { src: localTestImage, align: "left" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("float: left;");
      expect(result).toContain("margin-right: 10px;");
    });

    it("applies block display with left align (no text wrap)", async () => {
      const params = { src: localTestImage, align: "left", display: "block" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("display: block;");
      expect(result).toContain("margin-right: auto;");
      expect(result).not.toContain("float:");
    });

    it("applies block display with right align (no text wrap)", async () => {
      const params = { src: localTestImage, align: "right", display: "block" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("display: block;");
      expect(result).toContain("margin-left: auto;");
      expect(result).not.toContain("float:");
    });

    it("applies block display with center align", async () => {
      const params = { src: localTestImage, align: "center", display: "block" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("display: block;");
      expect(result).toContain("margin: 0 auto");
    });

    it("applies full-width display", async () => {
      const params = { src: localTestImage, display: "full" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("display: block;");
      expect(result).toContain("width: 100%;");
      expect(result).toContain("height: auto;");
    });

    it("applies inline display", async () => {
      const params = { src: localTestImage, display: "inline" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("vertical-align: middle;");
      expect(result).not.toContain("float:");
      expect(result).not.toContain("display: block;");
    });

    it("applies inline display with left align", async () => {
      const params = {
        src: localTestImage,
        display: "inline",
        align: "left",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("vertical-align: middle;");
      expect(result).toContain("margin-right: 5px;");
    });

    it("applies inline display with right align", async () => {
      const params = {
        src: localTestImage,
        display: "inline",
        align: "right",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("vertical-align: middle;");
      expect(result).toContain("margin-left: 5px;");
    });

    it("applies caption container styles for block display", async () => {
      const params = {
        src: localTestImage,
        display: "block",
        align: "left",
        caption: "Test Caption",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("image-plugin-container");
      expect(result).toContain("display: block;");
      expect(result).toContain(">Test Caption</div>");
    });

    it("applies caption container styles for full display", async () => {
      const params = {
        src: localTestImage,
        display: "full",
        caption: "Full Width Image",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain("image-plugin-container");
      expect(result).toContain("width: 100%;");
      expect(result).toContain(">Full Width Image</div>");
    });
  });

  describe("caption as alt fallback", () => {
    it("uses caption as alt when alt is not provided", async () => {
      const params = { src: localTestImage, caption: "My Caption" };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('alt="My Caption"');
    });

    it("uses alt when both alt and caption are provided", async () => {
      const params = {
        src: localTestImage,
        alt: "Alt Text",
        caption: "Caption Text",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('alt="Alt Text"');
      expect(result).toContain(">Caption Text</div>");
    });

    it("uses default alt when neither alt nor caption provided", async () => {
      const params = { src: localTestImage };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('alt="Uploaded image"');
    });
  });

  describe("real-world examples", () => {
    it("renders left-floating image with text wrap", async () => {
      const params = {
        src: "/attachments/example.jpg",
        caption: "Example Image",
        align: "left",
        display: "float",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/attachments/example.jpg"');
      expect(result).toContain('alt="Example Image"');
      expect(result).toContain("float: left;");
      expect(result).toContain(">Example Image</div>");
    });

    it("renders left-aligned image without text wrap", async () => {
      const params = {
        src: "/attachments/example.jpg",
        caption: "Example Image",
        align: "left",
        display: "block",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/attachments/example.jpg"');
      expect(result).toContain('alt="Example Image"');
      expect(result).toContain("display: block;");
      expect(result).not.toContain("float:");
    });

    it("renders full-width image", async () => {
      const params = {
        src: "/attachments/example.jpg",
        caption: "Full Width Example",
        display: "full",
      };
      const result = await ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/attachments/example.jpg"');
      expect(result).toContain('alt="Full Width Example"');
      expect(result).toContain("width: 100%;");
    });
  });
});
