const SchemaManager = require("../SchemaManager");

jest.mock('fs-extra', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  existsSync: jest.fn(),
  ensureDir: jest.fn()
}));

const fs = require('fs-extra');

const mockCfgMgr = { getProperty: jest.fn().mockImplementation((k,d)=>d) };
const mockEngine = { getManager: jest.fn(n => n==='ConfigurationManager'?mockCfgMgr:null) };

describe("SchemaManager", () => {
  let schemaManager;
  
  beforeEach(() => {
    schemaManager = new SchemaManager(mockEngine);
    jest.clearAllMocks();
  });

  it("should initialize with empty collections", async () => {
    fs.mkdir.mockResolvedValue();
    fs.existsSync.mockReturnValue(false);

    await schemaManager.initialize({});

    expect(schemaManager.persons.size).toBe(0);
    expect(schemaManager.organizations.size).toBe(0);
  });

  it("should validate person fields correctly", () => {
    expect(() => {
      schemaManager.validateAndEnhancePerson({});
    }).toThrow('Person identifier is required');

    expect(() => {
      schemaManager.validateAndEnhancePerson({ identifier: "test" });
    }).toThrow('Person name is required');
  });
});
