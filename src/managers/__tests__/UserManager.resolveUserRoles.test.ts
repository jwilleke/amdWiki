/**
 * UserManager.resolveUserRoles tests (#617 follow-up, iteration 3a — read swap).
 *
 * Verifies that base role names are sourced from RoleManager records when
 * present, with a fallback to User.roles[] when RoleManager / PersonManager
 * are unavailable, when the user has no paired Person record, or when
 * RoleManager has zero records for the Person (mirror drift).
 */
import UserManager from '../UserManager';
import type { WikiEngine } from '../../types/WikiEngine';

const PERSON_ID = 'urn:uuid:11111111-1111-1111-1111-111111111111';

const makeConfigManager = () => ({
  getProperty: vi.fn((key: string, defaultValue: unknown) => {
    const config: Record<string, unknown> = {
      'ngdpbase.user.provider.default': 'fileuserprovider',
      'ngdpbase.user.provider': 'fileuserprovider',
      'ngdpbase.user.defaultPassword': 'admin',
      'ngdpbase.user.passwordSalt': 'test-salt',
      'ngdpbase.user.sessionExpiration': 3600000,
      'ngdpbase.user.defaultTimezone': 'UTC',
      'ngdpbase.directories.users': './users'
    };
    return key in config ? config[key] : defaultValue;
  })
});

interface MockRole {
  '@id': string;
  namedPosition: string;
  organization: { '@id': string };
  member?: { '@id': string }[];
}

function makeMocks(opts: {
  person?: { '@id': string; identifier: string } | null;
  roles?: MockRole[] | null;
  registerPersonManager?: boolean;
  registerRoleManager?: boolean;
}) {
  const personManager = opts.registerPersonManager === false ? null : {
    getByIdentifier: vi.fn(async () => opts.person ?? null)
  };
  const roleManager = opts.registerRoleManager === false ? null : {
    listByMember: vi.fn(async () => opts.roles ?? [])
  };
  return { personManager, roleManager };
}

function makeEngine(
  mocks: ReturnType<typeof makeMocks>,
  configManager: ReturnType<typeof makeConfigManager>
) {
  return {
    getManager: vi.fn((name: string) => {
      if (name === 'ConfigurationManager') return configManager;
      if (name === 'PersonManager') return mocks.personManager;
      if (name === 'RoleManager') return mocks.roleManager;
      return null;
    }),
    getConfig: vi.fn(() => ({ get: vi.fn() }))
  };
}

async function newUserManager(mocks: ReturnType<typeof makeMocks>) {
  const configManager = makeConfigManager();
  const engine = makeEngine(mocks, configManager);
  const manager = new UserManager(engine as unknown as WikiEngine);
  await manager.initialize();
  return manager;
}

describe('UserManager.resolveUserRoles (#617 iteration 3a)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns role.namedPosition[] from RoleManager when records exist', async () => {
    const mocks = makeMocks({
      person: { '@id': PERSON_ID, identifier: 'alice' },
      roles: [
        { '@id': 'r1', namedPosition: 'admin', organization: { '@id': 'o' } },
        { '@id': 'r2', namedPosition: 'editor', organization: { '@id': 'o' } }
      ]
    });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: ['legacy-should-not-be-returned']
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result.sort()).toEqual(['admin', 'editor']);
    expect(mocks.roleManager.listByMember).toHaveBeenCalledWith(PERSON_ID);
  });

  test('falls back to User.roles[] when RoleManager has no records for the Person', async () => {
    const mocks = makeMocks({
      person: { '@id': PERSON_ID, identifier: 'alice' },
      roles: []
    });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: ['admin', 'editor']
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual(['admin', 'editor']);
  });

  test('falls back to User.roles[] when the user has no paired Person record', async () => {
    const mocks = makeMocks({
      person: null,
      roles: [{ '@id': 'r', namedPosition: 'admin', organization: { '@id': 'o' } }]
    });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: ['reader']
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual(['reader']);
    expect(mocks.roleManager.listByMember).not.toHaveBeenCalled();
  });

  test('falls back to User.roles[] when RoleManager is unavailable', async () => {
    const mocks = makeMocks({
      person: { '@id': PERSON_ID, identifier: 'alice' },
      registerRoleManager: false
    });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: ['reader']
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual(['reader']);
  });

  test('falls back to User.roles[] when PersonManager is unavailable', async () => {
    const mocks = makeMocks({
      registerPersonManager: false,
      roles: [{ '@id': 'r', namedPosition: 'admin', organization: { '@id': 'o' } }]
    });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: ['reader']
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual(['reader']);
  });

  test('falls back to User.roles[] when RoleManager.listByMember throws', async () => {
    const mocks = makeMocks({
      person: { '@id': PERSON_ID, identifier: 'alice' },
      roles: []
    });
    mocks.roleManager.listByMember = vi.fn().mockRejectedValue(new Error('disk corrupt'));
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: ['reader']
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual(['reader']);
  });

  test('returns empty array when nothing is available (no Person, no User.roles)', async () => {
    const mocks = makeMocks({ person: null });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice'
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual([]);
  });

  test('does NOT inject pseudo-roles (Authenticated, All) — caller does that', async () => {
    const mocks = makeMocks({
      person: { '@id': PERSON_ID, identifier: 'alice' },
      roles: [{ '@id': 'r', namedPosition: 'admin', organization: { '@id': 'o' } }]
    });
    const userManager = await newUserManager(mocks);
    userManager.provider.getUser = vi.fn().mockResolvedValue({
      username: 'alice',
      roles: []
    });

    const result = await userManager.resolveUserRoles('alice');

    expect(result).toEqual(['admin']);
    expect(result).not.toContain('Authenticated');
    expect(result).not.toContain('All');
  });
});
