const SchemaManager = require("../SchemaManager");

jest.mock('fs-extra', () => ({
  readdir: jest.fn(),
  readJson: jest.fn(),
  existsSync: jest.fn(),
  ensureDir: jest.fn()
}));

const fs = require('fs-extra');

const mockCfgMgr = { getProperty: jest.fn().mockReturnValue('./config/schemas'), getResolvedDataPath: jest.fn().mockReturnValue('./config/schemas') };
const mockEngine = { getManager: jest.fn(n => n==='ConfigurationManager'?mockCfgMgr:null) };

describe("SchemaManager", () => {
  let schemaManager;

  beforeEach(() => {
    schemaManager = new SchemaManager(mockEngine);
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it("should initialize with empty schemas Map", () => {
      expect(schemaManager.schemas).toBeInstanceOf(Map);
      expect(schemaManager.schemas.size).toBe(0);
    });
  });

  describe('initialize()', () => {
    it("should load schemas from schema directory", async () => {
      fs.readdir.mockResolvedValue(['page.schema.json', 'user.schema.json', 'other.txt']);
      fs.readJson.mockResolvedValueOnce({ type: 'object', title: 'Page Schema' });
      fs.readJson.mockResolvedValueOnce({ type: 'object', title: 'User Schema' });

      await schemaManager.initialize({});

      expect(fs.readdir).toHaveBeenCalledWith('./config/schemas');
      expect(fs.readJson).toHaveBeenCalledTimes(2);
      expect(schemaManager.schemas.size).toBe(2);
      expect(schemaManager.schemas.get('page')).toEqual({ type: 'object', title: 'Page Schema' });
      expect(schemaManager.schemas.get('user')).toEqual({ type: 'object', title: 'User Schema' });
    });

    it("should handle missing schema directory gracefully", async () => {
      const error = new Error('ENOENT');
      error.code = 'ENOENT';
      fs.readdir.mockRejectedValue(error);

      await schemaManager.initialize({});

      expect(schemaManager.schemas.size).toBe(0);
      // Should not throw, just log warning
    });

    it("should throw error if ConfigurationManager not available", async () => {
      const engineWithoutConfig = { getManager: jest.fn(() => null) };
      const manager = new SchemaManager(engineWithoutConfig);

      await expect(manager.initialize({})).rejects.toThrow('SchemaManager requires ConfigurationManager');
    });

    it("should use custom schema directory from config", async () => {
      mockCfgMgr.getResolvedDataPath.mockReturnValueOnce('/custom/schemas');
      fs.readdir.mockResolvedValue([]);

      await schemaManager.initialize({});

      expect(mockCfgMgr.getResolvedDataPath).toHaveBeenCalledWith('amdwiki.directories.schemas', './data/schemas');
      expect(fs.readdir).toHaveBeenCalledWith('/custom/schemas');
    });
  });

  describe('getSchema()', () => {
    beforeEach(async () => {
      fs.readdir.mockResolvedValue(['page.schema.json']);
      fs.readJson.mockResolvedValue({ type: 'object', title: 'Page Schema' });
      await schemaManager.initialize({});
    });

    it("should retrieve a loaded schema by name", () => {
      const schema = schemaManager.getSchema('page');
      expect(schema).toEqual({ type: 'object', title: 'Page Schema' });
    });

    it("should return undefined for non-existent schema", () => {
      const schema = schemaManager.getSchema('nonexistent');
      expect(schema).toBeUndefined();
    });
  });

  describe('getAllSchemaNames()', () => {
    it("should return empty array when no schemas loaded", () => {
      const names = schemaManager.getAllSchemaNames();
      expect(names).toEqual([]);
    });

    it("should return all loaded schema names", async () => {
      fs.readdir.mockResolvedValue(['page.schema.json', 'user.schema.json', 'config.schema.json']);
      fs.readJson.mockResolvedValue({ type: 'object' });
      await schemaManager.initialize({});

      const names = schemaManager.getAllSchemaNames();
      expect(names).toEqual(['page', 'user', 'config']);
    });
  });
});
