const SchemaManager = require("../SchemaManager");

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn()
  },
  existsSync: jest.fn()
}));

const fs = require('fs').promises;
const fsSync = require('fs');

const mockEngine = {
  log: jest.fn(),
  getConfig: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue('test-value')
  })
};

describe("SchemaManager", () => {
  let schemaManager;
  
  beforeEach(() => {
    schemaManager = new SchemaManager(mockEngine);
    jest.clearAllMocks();
  });

  it("should initialize with empty collections", async () => {
    fs.mkdir.mockResolvedValue();
    fsSync.existsSync.mockReturnValue(false);
    
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
