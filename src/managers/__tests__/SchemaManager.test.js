const SchemaManager = require('../SchemaManager');
const fs = require('fs').promises;
const path = require('path');

// Mock the base manager and file system
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn()
  }
}));

// Mock the base manager
const mockEngine = {
  log: jest.fn(),
  getConfig: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({
      workDir: '/test/work'
    })
  })
};

describe('SchemaManager', () => {
  let schemaManager;
  
  beforeEach(() => {
    schemaManager = new SchemaManager(mockEngine);
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid data files', async () => {
      // Mock file reading
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('persons.json')) {
          return Promise.resolve(JSON.stringify([{
            "@type": "Person",
            "@id": "test-person",
            "name": "Test User",
            "email": "test@example.com"
          }]));
        }
        if (filePath.includes('organizations.json')) {
          return Promise.resolve(JSON.stringify([{
            "@type": "Organization",
            "@id": "test-org",
            "name": "Test Organization"
          }]));
        }
      });

      await schemaManager.initialize({});
      
      expect(schemaManager.persons).toHaveLength(1);
      expect(schemaManager.organizations).toHaveLength(1);
    });

    it('should handle missing data files gracefully', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      
      await schemaManager.initialize({});
      
      expect(schemaManager.persons).toEqual([]);
      expect(schemaManager.organizations).toEqual([]);
    });
  });

  describe('person management', () => {
    beforeEach(async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      await schemaManager.initialize({});
    });

    it('should create a new person with Schema.org validation', () => {
      const personData = {
        name: "John Doe",
        email: "john@example.com",
        birthDate: "1990-01-01"
      };

      const result = schemaManager.createPerson(personData);

      expect(result).toMatchObject({
        "@type": "Person",
        "name": "John Doe",
        "email": "john@example.com",
        "birthDate": "1990-01-01"
      });
      expect(result["@id"]).toMatch(/^person-/);
    });

    it('should validate required Person fields', () => {
      expect(() => {
        schemaManager.createPerson({});
      }).toThrow('Person name is required');

      expect(() => {
        schemaManager.createPerson({ name: "Test" });
      }).toThrow('Person email is required');
    });

    it('should clean optional fields with null values', () => {
      const personData = {
        name: "John Doe",
        email: "john@example.com",
        nationality: null,
        address: null,
        birthDate: "1990-01-01"
      };

      const result = schemaManager.createPerson(personData);

      expect(result.nationality).toBeUndefined();
      expect(result.address).toBeUndefined();
      expect(result.birthDate).toBe("1990-01-01");
    });
  });

  describe('organization management', () => {
    beforeEach(async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      await schemaManager.initialize({});
    });

    it('should create a new organization with Schema.org validation', () => {
      const orgData = {
        name: "Test Corp",
        legalName: "Test Corporation LLC",
        address: {
          "@type": "PostalAddress",
          "streetAddress": "123 Main St",
          "addressLocality": "Anytown",
          "postalCode": "12345"
        }
      };

      const result = schemaManager.createOrganization(orgData);

      expect(result).toMatchObject({
        "@type": "Organization",
        "name": "Test Corp",
        "legalName": "Test Corporation LLC"
      });
      expect(result.address).toMatchObject(orgData.address);
    });

    it('should handle optional legalName and address fields', () => {
      const orgData = {
        name: "Simple Org",
        legalName: null,
        address: null
      };

      const result = schemaManager.createOrganization(orgData);

      expect(result.legalName).toBeUndefined();
      expect(result.address).toBeUndefined();
      expect(result.name).toBe("Simple Org");
    });
  });

  describe('data persistence', () => {
    it('should save persons data to file', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      fs.writeFile.mockResolvedValue();
      await schemaManager.initialize({});

      const person = schemaManager.createPerson({
        name: "Test User",
        email: "test@example.com"
      });

      await schemaManager.savePersons();

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('persons.json'),
        expect.stringContaining('"name":"Test User"')
      );
    });

    it('should save organizations data to file', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      fs.writeFile.mockResolvedValue();
      await schemaManager.initialize({});

      const org = schemaManager.createOrganization({
        name: "Test Organization"
      });

      await schemaManager.saveOrganizations();

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('organizations.json'),
        expect.stringContaining('"name":"Test Organization"')
      );
    });
  });

  describe('comprehensive site data', () => {
    it('should return complete site schema data', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('persons.json')) {
          return Promise.resolve(JSON.stringify([{
            "@type": "Person",
            "@id": "admin-person",
            "name": "Admin User",
            "email": "admin@example.com",
            "hasCredential": [{ "roles": ["admin"] }]
          }]));
        }
        if (filePath.includes('organizations.json')) {
          return Promise.resolve(JSON.stringify([{
            "@type": "Organization",
            "@id": "main-org",
            "name": "Test Organization"
          }]));
        }
      });

      await schemaManager.initialize({});
      
      const siteData = schemaManager.getComprehensiveSiteData();

      expect(siteData.adminUsers).toHaveLength(1);
      expect(siteData.adminUsers[0].name).toBe("Admin User");
      expect(siteData.organizations).toHaveLength(1);
      expect(siteData.organizations[0].name).toBe("Test Organization");
    });

    it('should filter out non-admin users from public data', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('persons.json')) {
          return Promise.resolve(JSON.stringify([
            {
              "@type": "Person",
              "@id": "admin-person",
              "name": "Admin User",
              "hasCredential": [{ "roles": ["admin"] }]
            },
            {
              "@type": "Person", 
              "@id": "regular-person",
              "name": "Regular User",
              "hasCredential": [{ "roles": ["user"] }]
            }
          ]));
        }
        return Promise.resolve(JSON.stringify([]));
      });

      await schemaManager.initialize({});
      
      const siteData = schemaManager.getComprehensiveSiteData();

      expect(siteData.adminUsers).toHaveLength(1);
      expect(siteData.adminUsers[0].name).toBe("Admin User");
    });
  });
});
