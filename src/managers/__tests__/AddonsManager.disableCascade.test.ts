import os from 'os';
import path from 'path';
import fs from 'fs-extra';

describe('AddonsManager.canDisable (#617)', () => {
  let tmpDir: string;
  let AddonsManager: any;

  const makeConfigManager = (enabledAddons: string[] = []) => ({
    getProperty: vi.fn((key: string, defaultValue: unknown) => {
      if (key === 'ngdpbase.managers.addons-manager.enabled') return true;
      if (key === 'ngdpbase.managers.addons-manager.addons-path') return tmpDir;
      if (key === 'ngdpbase.page.provider.filesystem.storagedir') return path.join(tmpDir, 'pages');
      if (key.startsWith('ngdpbase.addons.')) {
        const parts = key.split('.');
        const addonName = parts[2];
        const prop = parts[3];
        if (prop === 'enabled') return enabledAddons.includes(addonName);
      }
      if (key === 'ngdpbase.addons') return {};
      return defaultValue;
    }),
    getAllProperties: vi.fn(() => ({})),
    getCustomProperty: vi.fn(() => null),
    setRuntimeProperty: vi.fn()
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
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'addons-cascade-test-'));
    vi.resetModules();
    vi.clearAllMocks();
    const mod = await import('../AddonsManager');
    AddonsManager = mod.default ?? mod;
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
  });

  const writeAddon = async (name: string, dependencies: string[] = []) => {
    const dir = path.join(tmpDir, name);
    await fs.mkdir(dir);
    const deps = JSON.stringify(dependencies);
    await fs.writeFile(
      path.join(dir, 'index.js'),
      `module.exports = { name: '${name}', version: '1.0.0', dependencies: ${deps}, register: () => {} };`,
      'utf8'
    );
  };

  test('permits disable when no other addon depends on it', async () => {
    await writeAddon('person-contacts');
    const manager = new AddonsManager(makeEngine(makeConfigManager(['person-contacts'])));
    await manager.initialize();

    const result = manager.canDisable('person-contacts');
    expect(result.ok).toBe(true);
  });

  test('refuses disable when an enabled addon depends on it', async () => {
    await writeAddon('person-contacts');
    await writeAddon('accounting', ['person-contacts']);
    const manager = new AddonsManager(makeEngine(makeConfigManager(['person-contacts', 'accounting'])));
    await manager.initialize();

    const result = manager.canDisable('person-contacts');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedBy).toEqual(['accounting']);
    }
  });

  test('permits disable when only disabled addons depend on it', async () => {
    await writeAddon('person-contacts');
    await writeAddon('accounting', ['person-contacts']);
    // accounting is installed but DISABLED
    const manager = new AddonsManager(makeEngine(makeConfigManager(['person-contacts'])));
    await manager.initialize();

    const result = manager.canDisable('person-contacts');
    expect(result.ok).toBe(true);
  });

  test('reports all enabled dependents when multiple block the disable', async () => {
    await writeAddon('person-contacts');
    await writeAddon('accounting', ['person-contacts']);
    await writeAddon('crm', ['person-contacts']);
    const manager = new AddonsManager(
      makeEngine(makeConfigManager(['person-contacts', 'accounting', 'crm']))
    );
    await manager.initialize();

    const result = manager.canDisable('person-contacts');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedBy.sort()).toEqual(['accounting', 'crm']);
    }
  });
});
