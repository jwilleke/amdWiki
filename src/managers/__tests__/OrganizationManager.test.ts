import os from 'os';
import path from 'path';
import fs from 'fs-extra';

describe('OrganizationManager (#617)', () => {
  let tmpDir: string;
  let OrganizationManager: any;

  const makeConfigManager = (overrides: Record<string, unknown> = {}) => ({
    getProperty: vi.fn((key: string, defaultValue: unknown) => {
      const map = overrides;
      if (key in map) return map[key];
      return defaultValue;
    }),
    getResolvedDataPath: vi.fn((_key: string, _defaultValue: string) =>
      (overrides['ngdpbase.application.organization.storagedir'] as string)
        ?? path.join(tmpDir, 'organizations')
    )
  });

  const makeEngine = (configManager: ReturnType<typeof makeConfigManager>) => ({
    getManager: vi.fn((name: string) =>
      name === 'ConfigurationManager' ? configManager : null
    )
  });

  beforeAll(() => {
    vi.setConfig({ testTimeout: 10000 });
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'org-mgr-test-'));
    vi.resetModules();
    vi.clearAllMocks();
    // FAST_STORAGE not set — use the temp-dir override below
    delete process.env.FAST_STORAGE;
    delete process.env.INSTANCE_DATA_FOLDER;
    process.env.INSTANCE_DATA_FOLDER = tmpDir;

    const mod = await import('../OrganizationManager');
    OrganizationManager = mod.default ?? mod;
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
    delete process.env.INSTANCE_DATA_FOLDER;
  });

  test('seedFromConfig writes an Organization JSON-LD file with the correct @id', async () => {
    const configManager = makeConfigManager({
      'ngdpbase.application.organization.storagedir': path.join(tmpDir, 'organizations')
    });
    const engine = makeEngine(configManager);

    const manager = new OrganizationManager(engine);
    await manager.initialize();

    const org = await manager.seedFromConfig({
      orgName: 'Acme Corporation',
      orgUrl: 'https://example.com/',
      orgDescription: 'We make widgets',
      adminEmail: 'tech@example.com',
      filename: 'acme-corporation.json'
    });

    expect(org).not.toBeNull();
    expect(org!['@type']).toBe('Organization');
    expect(org!['@id']).toBe('https://example.com/');
    expect(org!.name).toBe('Acme Corporation');
    expect(org!.contactPoint?.[0]?.email).toBe('tech@example.com');

    const written = await fs.readJson(path.join(tmpDir, 'organizations', 'acme-corporation.json'));
    expect(written['@id']).toBe('https://example.com/');
  });

  test('seedFromConfig is idempotent — second call returns existing org without rewrite', async () => {
    const configManager = makeConfigManager({
      'ngdpbase.application.organization.storagedir': path.join(tmpDir, 'organizations')
    });
    const engine = makeEngine(configManager);

    const manager = new OrganizationManager(engine);
    await manager.initialize();

    const first = await manager.seedFromConfig({
      orgName: 'Acme',
      orgUrl: 'https://acme.test/',
      filename: 'acme.json'
    });

    // Tamper with the file to prove the second call doesn't overwrite
    const filePath = path.join(tmpDir, 'organizations', 'acme.json');
    await fs.writeJson(filePath, { ...first, marker: 'tampered' });

    const second = await manager.seedFromConfig({
      orgName: 'Acme (different name)',
      orgUrl: 'https://different.test/',
      filename: 'acme.json'
    });

    expect((second).marker).toBe('tampered');
    expect((second)['@id']).toBe('https://acme.test/');
  });

  test('getInstallOrg returns the org named by the .file config key', async () => {
    const configManager = makeConfigManager({
      'ngdpbase.application.organization.storagedir': path.join(tmpDir, 'organizations'),
      'ngdpbase.application.organization.file': 'acme.json'
    });
    const engine = makeEngine(configManager);

    const manager = new OrganizationManager(engine);
    await manager.initialize();
    await manager.seedFromConfig({
      orgName: 'Acme',
      orgUrl: 'https://acme.test/',
      filename: 'acme.json'
    });

    const anchor = await manager.getInstallOrg();
    expect(anchor).not.toBeNull();
    expect(anchor!.name).toBe('Acme');
  });

  test('list returns multiple orgs (multi-org from day one)', async () => {
    const configManager = makeConfigManager({
      'ngdpbase.application.organization.storagedir': path.join(tmpDir, 'organizations')
    });
    const engine = makeEngine(configManager);

    const manager = new OrganizationManager(engine);
    await manager.initialize();

    await manager.create({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://one.test/',
      name: 'One'
    });
    await manager.create({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://two.test/',
      name: 'Two'
    });

    const all = await manager.list();
    expect(all).toHaveLength(2);
    expect(all.map((o: any) => o['@id']).sort()).toEqual(['https://one.test/', 'https://two.test/']);
  });

  test('startup invariant — install-complete + missing anchor file → throws', async () => {
    const orgsDir = path.join(tmpDir, 'organizations');
    await fs.ensureDir(orgsDir);

    // Mark install as complete WITHOUT writing the anchor file.
    await fs.writeJson(path.join(tmpDir, '.install-complete'), { marker: true });

    const configManager = makeConfigManager({
      'ngdpbase.application.organization.storagedir': orgsDir,
      'ngdpbase.application.organization.file': 'never-written.json'
    });
    const engine = makeEngine(configManager);

    const manager = new OrganizationManager(engine);
    await expect(manager.initialize()).rejects.toThrow(/anchor organization file is missing/);
  });
});
