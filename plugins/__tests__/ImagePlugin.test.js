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
    it("generates basic img tag with src", () => {
      const params = { src: localTestImage };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain("<img");
      expect(result).toContain('src="/images/test.jpg"');
      expect(result).toContain('alt="Uploaded image"');
      expect(result).toContain('class="wiki-image"');
    });

    it("handles relative src paths", () => {
      const params = { src: localTestImage };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('src="/images/test.jpg"');
    });

    it("handles absolute src paths", () => {
      const params = { src: internetTestImage };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain(`src="${internetTestImage}"`);
    });

    it("uses custom alt text", () => {
      const params = { src: localTestImage, alt: "Custom alt text" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('alt="Custom alt text"');
    });

    it("includes width and height attributes", () => {
      const params = { src: localTestImage, width: "200", height: "150" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('width="200"');
      expect(result).toContain('height="150"');
    });

    it("includes custom class", () => {
      const params = { src: localTestImage, class: "custom-class" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('class="custom-class"');
    });

    it("includes style attribute", () => {
      const params = { src: localTestImage, style: "border: 1px solid black;" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('style="border: 1px solid black;"');
    });

    it("returns error when src is missing", () => {
      const params = { alt: "Test" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toMatch(/Image plugin: src attribute is required/i);
    });

    it("handles errors gracefully", () => {
      const badContext = {
        engine: {
          getConfig: jest.fn(() => {
            throw new Error("Config error");
          }),
        },
      };

      const params = { src: localTestImage };
      const result = ImagePlugin.execute(badContext, params);

      expect(result).toMatch(/Image plugin error/i);
    });

    it("includes caption when provided", () => {
      const params = { src: localTestImage, caption: "Test Caption" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<div class="image-plugin-container');
      expect(result).toContain("<img");
      expect(result).toContain(">Test Caption</div>");
    });

    it("applies left alignment", () => {
      const params = { src: localTestImage, align: "left" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain("float: left;");
      expect(result).toContain("margin-right: 10px;");
    });

    it("applies right alignment", () => {
      const params = { src: localTestImage, align: "right" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain("float: right;");
      expect(result).toContain("margin-left: 10px;");
    });

    it("applies center alignment", () => {
      const params = { src: localTestImage, align: "center" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain("display: block;");
      expect(result).toContain("margin: 0 auto;");
    });

    it("wraps image in link when link parameter provided", () => {
      const params = { src: localTestImage, link: internetTestImage };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain(`<a href="${internetTestImage}"`);
      expect(result).toContain("<img");
      expect(result).toContain("</a>");
    });

    it("adds border style when border parameter provided", () => {
      const params = { src: localTestImage, border: "2" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain("border: 2px solid #ccc;");
    });

    it("adds title attribute when title parameter provided", () => {
      const params = { src: localTestImage, title: "Hover text" };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('title="Hover text"');
    });

    it("combines multiple advanced parameters", () => {
      const params = {
        src: localTestImage,
        caption: "Test Caption",
        align: "center",
        link: internetTestImage,
        border: "3",
        title: "Hover text",
        style: "margin: 10px;",
      };
      const result = ImagePlugin.execute(mockContext, params);

      expect(result).toContain('<div class="image-plugin-container');
      expect(result).toContain(`<a href="${internetTestImage}"`);
      // Be flexible on style concatenation order; check substrings
      expect(result).toContain("border: 3px solid #ccc;");
      expect(result).toContain("margin: 10px;");
      expect(result).toContain("display: block;");
      expect(result).toContain("margin: 0 auto;");
      expect(result).toContain('title="Hover text"');
      expect(result).toContain(">Test Caption</div>");
    });
  });

  describe("plugin metadata", () => {
    it("has correct name", () => {
      expect(ImagePlugin.name).toBe("Image");
    });

    it("has execute method", () => {
      expect(typeof ImagePlugin.execute).toBe("function");
    });
  });
});
