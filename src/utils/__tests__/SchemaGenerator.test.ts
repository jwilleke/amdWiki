/**
 * SchemaGenerator tests — uncovered methods
 *
 * Covers:
 * - generatePageSchema() — all schema type branches
 * - enhanceTechArticle()
 * - enhanceCreativeWork()
 * - enhanceWebPage() — breadcrumb, mainEntity, significantLink
 * - generateScriptTag()
 * - generateSiteSchema()
 * - generatePersonSchema()
 * - generateOrganizationSchema()
 * - generateSoftwareSchema()
 * - generateComprehensiveSchema()
 *
 * @jest-environment node
 */

import SchemaGenerator from '../SchemaGenerator';

describe('SchemaGenerator — generatePageSchema()', () => {
  test('default WebPage schema with minimal data', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Home' });
    expect(schema['@type']).toBe('WebPage');
    expect(schema.name).toBe('Home');
  });

  test('TechArticle for Documentation category', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Docs', categories: ['Documentation'] });
    expect(schema['@type']).toBe('TechArticle');
  });

  test('TechArticle for documentation keyword', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Page', userKeywords: ['documentation'] });
    expect(schema['@type']).toBe('TechArticle');
  });

  test('TechArticle for title containing documentation', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'My Documentation Guide' });
    expect(schema['@type']).toBe('TechArticle');
  });

  test('CreativeWork for Project category', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Page', categories: ['Project'] });
    expect(schema['@type']).toBe('CreativeWork');
  });

  test('CreativeWork for vision keyword', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Page', userKeywords: ['vision'] });
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.genre).toBe('Project Planning');
  });

  test('CreativeWork for roadmap keyword', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Page', userKeywords: ['roadmap'] });
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.genre).toBe('Project Planning');
  });

  test('Article for Meeting Notes category', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Page', categories: ['Meeting Notes'] });
    expect(schema['@type']).toBe('Article');
  });

  test('Article for title containing meeting', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Weekly Meeting Notes' });
    expect(schema['@type']).toBe('Article');
  });

  test('includes dateCreated when provided', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'P', dateCreated: '2024-01-01' });
    expect(schema.dateCreated).toBe('2024-01-01');
  });

  test('includes keywords when userKeywords present', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'P', userKeywords: ['alpha', 'beta'] });
    expect(schema.keywords).toBe('alpha, beta');
  });

  test('adds about as DefinedTerm array for WebPage with categories', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'P', categories: ['Tech', 'Guide'] });
    expect(Array.isArray(schema.about)).toBe(true);
    const about = schema.about as Array<{ '@type': string }>;
    expect(about[0]['@type']).toBe('DefinedTerm');
  });

  test('adds about as Thing for non-WebPage with categories', () => {
    const schema = SchemaGenerator.generatePageSchema({
      title: 'Documentation',
      categories: ['Tech'],
      userKeywords: ['documentation']
    });
    expect(schema['@type']).toBe('TechArticle');
    const about = schema.about as Array<{ '@type': string }>;
    expect(about[0]['@type']).toBe('Thing');
  });

  test('adds relatedLink for WebPage with category', () => {
    const schema = SchemaGenerator.generatePageSchema(
      { title: 'P', category: 'Tech' },
      { baseUrl: 'https://wiki.test' }
    );
    expect(Array.isArray(schema.relatedLink)).toBe(true);
  });

  test('uses provided pageUrl', () => {
    const schema = SchemaGenerator.generatePageSchema(
      { title: 'P' },
      { pageUrl: 'https://wiki.test/view/P' }
    );
    expect(schema.url).toBe('https://wiki.test/view/P');
  });
});

describe('SchemaGenerator — enhanceTechArticle()', () => {
  test('sets articleSection from categories', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'Page', categories: ['Documentation', 'API'] });
    expect(schema.articleSection).toBe('Documentation, API');
  });

  test('sets about for plugins keyword', () => {
    const schema = SchemaGenerator.generatePageSchema({
      title: 'Plugin Guide',
      categories: ['Documentation'],
      userKeywords: ['plugins']
    });
    const about = schema.about as Array<{ '@type': string }>;
    expect(about[0]['@type']).toBe('SoftwareApplication');
  });

  test('articleSection defaults to Documentation when no categories', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'documentation page' });
    expect(schema.articleSection).toBe('Documentation');
  });
});

describe('SchemaGenerator — enhanceWebPage()', () => {
  test('adds breadcrumb for nested category path', () => {
    const schema = SchemaGenerator.generatePageSchema(
      { title: 'P', category: 'System/Config' },
      { baseUrl: 'https://wiki.test' }
    );
    expect(schema.breadcrumb).toBeDefined();
    const breadcrumb = schema.breadcrumb as { '@type': string; itemListElement: unknown[] };
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement.length).toBe(2);
  });

  test('mainContentOfPage always set for WebPage', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'P' });
    expect(schema.mainContentOfPage).toBeDefined();
  });

  test('mainEntity DefinedTermSet for Categories title', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'List of Categories' });
    const entity = schema.mainEntity as { '@type': string };
    expect(entity['@type']).toBe('DefinedTermSet');
    expect((entity as { name: string }).name).toContain('Categories');
  });

  test('mainEntity DefinedTermSet for Keywords title', () => {
    const schema = SchemaGenerator.generatePageSchema({ title: 'User Keywords' });
    const entity = schema.mainEntity as { '@type': string };
    expect(entity['@type']).toBe('DefinedTermSet');
    expect((entity as { name: string }).name).toContain('Keywords');
  });

  test('significantLink for System category', () => {
    const schema = SchemaGenerator.generatePageSchema(
      { title: 'P', categories: ['System'] },
      { baseUrl: 'https://wiki.test' }
    );
    expect(Array.isArray(schema.significantLink)).toBe(true);
    expect((schema.significantLink as string[]).length).toBeGreaterThan(0);
  });
});

describe('SchemaGenerator — generateScriptTag()', () => {
  test('wraps schema in JSON-LD script tag', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Test' };
    const tag = SchemaGenerator.generateScriptTag(schema);
    expect(tag).toContain('<script type="application/ld+json">');
    expect(tag).toContain('</script>');
    expect(tag).toContain('"@type": "WebPage"');
  });
});

describe('SchemaGenerator — generateSiteSchema()', () => {
  test('maps pages to schema array', () => {
    const pages = [{ title: 'A' }, { title: 'B' }];
    const schemas = SchemaGenerator.generateSiteSchema(pages);
    expect(schemas.length).toBe(2);
    expect(schemas[0].name).toBe('A');
    expect(schemas[1].name).toBe('B');
  });

  test('returns empty array for no pages', () => {
    expect(SchemaGenerator.generateSiteSchema([])).toEqual([]);
  });
});

describe('SchemaGenerator — generatePersonSchema()', () => {
  test('strips authentication field', () => {
    const person = { identifier: 'user1', name: 'Alice', authentication: { password: 'secret' } };
    const schema = SchemaGenerator.generatePersonSchema(person);
    expect(schema.authentication).toBeUndefined();
    expect(schema.name).toBe('Alice');
  });

  test('adds url from baseUrl when url missing', () => {
    const person = { identifier: 'user1' };
    const schema = SchemaGenerator.generatePersonSchema(person, { baseUrl: 'https://wiki.test' });
    expect(schema.url).toBe('https://wiki.test/person/user1');
  });

  test('preserves existing url', () => {
    const person = { identifier: 'user1', url: 'https://custom.url/user1' };
    const schema = SchemaGenerator.generatePersonSchema(person, { baseUrl: 'https://wiki.test' });
    expect(schema.url).toBe('https://custom.url/user1');
  });
});

describe('SchemaGenerator — generateOrganizationSchema()', () => {
  test('returns org data with added url', () => {
    const org = { name: 'Acme Corp' };
    const schema = SchemaGenerator.generateOrganizationSchema(org, { baseUrl: 'https://wiki.test' });
    expect(schema.url).toBe('https://wiki.test');
    expect(schema.name).toBe('Acme Corp');
  });

  test('preserves existing org url', () => {
    const org = { name: 'Acme', url: 'https://acme.com' };
    const schema = SchemaGenerator.generateOrganizationSchema(org, { baseUrl: 'https://wiki.test' });
    expect(schema.url).toBe('https://acme.com');
  });
});

describe('SchemaGenerator — generateSoftwareSchema()', () => {
  test('basic schema from config', () => {
    const config = { applicationName: 'MyWiki', version: '1.0.0' };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    expect(schema['@type']).toBe('SoftwareApplication');
    expect(schema.name).toBe('MyWiki');
    expect(schema.softwareRequirements).toBe('Node.js');
  });

  test('prefers application.name over applicationName', () => {
    const config = {
      application: { name: 'AppName', version: '2.0', applicationCategory: 'Wiki' },
      applicationName: 'FallbackName'
    };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    expect(schema.name).toBe('AppName');
  });

  test('adds serviceType and serverStatus for server config', () => {
    const config = { server: { port: 3000 } };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    expect(schema.serviceType).toBe('Web Application');
    expect(schema.serverStatus).toContain('3000');
  });

  test('server without port sets serviceType only', () => {
    const config = { server: {} };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    expect(schema.serviceType).toBe('Web Application');
    expect(schema.serverStatus).toBeUndefined();
  });

  test('adds feature list', () => {
    const config = {
      features: {
        export: { html: true, pdf: true },
        attachments: { enabled: true },
        llm: { enabled: true }
      }
    };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    expect(Array.isArray(schema.featureList)).toBe(true);
    expect((schema.featureList as string[]).length).toBe(4);
  });

  test('no featureList when no features enabled', () => {
    const config = { features: { export: { html: false, pdf: false } } };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    expect(schema.featureList).toBeUndefined();
  });

  test('uses organization from config', () => {
    const config = { organization: { '@type': 'Organization', name: 'MyOrg' } };
    const schema = SchemaGenerator.generateSoftwareSchema(config);
    const author = schema.author as { name: string };
    expect(author.name).toBe('MyOrg');
  });

  test('uses organizationName option when no org in config', () => {
    const schema = SchemaGenerator.generateSoftwareSchema({}, { organizationName: 'Custom Org' });
    const author = schema.author as { name: string };
    expect(author.name).toBe('Custom Org');
  });
});

describe('SchemaGenerator — generateComprehensiveSchema()', () => {
  test('returns empty array for empty site data', () => {
    const schemas = SchemaGenerator.generateComprehensiveSchema({});
    expect(schemas).toEqual([]);
  });

  test('includes org schemas', () => {
    const siteData = {
      organizations: [{ name: 'Org1' }, { name: 'Org2' }]
    };
    const schemas = SchemaGenerator.generateComprehensiveSchema(siteData);
    expect(schemas.length).toBe(2);
  });

  test('includes software schema from config', () => {
    const siteData = { config: { applicationName: 'TestWiki' } };
    const schemas = SchemaGenerator.generateComprehensiveSchema(siteData);
    expect(schemas.length).toBe(1);
    expect(schemas[0]['@type']).toBe('SoftwareApplication');
  });

  test('includes only admin non-system persons', () => {
    const siteData = {
      persons: [
        { identifier: 'admin1', hasCredential: [{ credentialCategory: 'admin' }], isSystem: false },
        { identifier: 'user1', hasCredential: [{ credentialCategory: 'member' }], isSystem: false },
        { identifier: 'sys1', hasCredential: [{ credentialCategory: 'admin' }], isSystem: true }
      ]
    };
    const schemas = SchemaGenerator.generateComprehensiveSchema(siteData);
    expect(schemas.length).toBe(1);
    const person = schemas[0] as { identifier: string };
    expect(person.identifier).toBe('admin1');
  });

  test('includes all schema types together', () => {
    const siteData = {
      organizations: [{ name: 'Org' }],
      config: { applicationName: 'Wiki' },
      persons: [
        { identifier: 'admin', hasCredential: [{ credentialCategory: 'admin' }], isSystem: false }
      ]
    };
    const schemas = SchemaGenerator.generateComprehensiveSchema(siteData, { baseUrl: 'https://w.test' });
    expect(schemas.length).toBe(3);
  });
});
