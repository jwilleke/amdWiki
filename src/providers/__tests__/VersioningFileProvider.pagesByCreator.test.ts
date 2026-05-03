/**
 * VersioningFileProvider.getPagesByCreator tests (#640)
 *
 * Same fixture pattern as the recentChanges tests — construct the provider,
 * stamp a synthetic pageIndex, exercise the method directly.
 */

vi.unmock('../VersioningFileProvider');
vi.unmock('../../providers/VersioningFileProvider');
vi.unmock('../FileSystemProvider');
vi.unmock('../../providers/FileSystemProvider');

import VersioningFileProvider from '../VersioningFileProvider';

function makeEngine() {
  return {
    getManager: () => null,
    on: () => {},
    emit: () => {}
  } as unknown as ConstructorParameters<typeof VersioningFileProvider>[0];
}

function makeProvider() {
  const provider = new VersioningFileProvider(makeEngine());
  return provider as unknown as {
    pageIndex: {
      version: string;
      lastUpdated: string;
      pageCount: number;
      pages: Record<string, {
        title: string;
        uuid: string;
        lastModified: string;
        currentVersion: number;
        location: 'pages' | 'required-pages' | 'private';
        editor: string;
        author?: string;
        creator?: string;
        hasVersions: boolean;
        isPrivate?: boolean;
        audienceRoles?: string[];
      }>;
    } | null;
    getPagesByCreator: VersioningFileProvider['getPagesByCreator'];
  };
}

const baseEntry = (over: Partial<ReturnType<typeof makePageEntry>> = {}) => ({
  ...makePageEntry(),
  ...over
});

function makePageEntry() {
  return {
    title: 'Page',
    uuid: 'uuid',
    lastModified: '2026-05-01T00:00:00.000Z',
    currentVersion: 1,
    location: 'pages' as const,
    editor: 'alice',
    author: 'alice',
    creator: undefined as string | undefined,
    hasVersions: false,
    isPrivate: undefined as boolean | undefined,
    audienceRoles: undefined as string[] | undefined
  };
}

describe('VersioningFileProvider.getPagesByCreator (#640)', () => {
  test('returns [] when pageIndex is null', async () => {
    const p = makeProvider();
    p.pageIndex = null;
    expect(await p.getPagesByCreator('alice')).toEqual([]);
  });

  test('returns [] when username is empty', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 1,
      pages: { u1: baseEntry({ uuid: 'u1', author: 'alice' }) }
    };
    expect(await p.getPagesByCreator('')).toEqual([]);
  });

  test('matches by author field', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 3,
      pages: {
        u1: baseEntry({ uuid: 'u1', title: 'AlicePage', author: 'alice' }),
        u2: baseEntry({ uuid: 'u2', title: 'BobPage', author: 'bob' }),
        u3: baseEntry({ uuid: 'u3', title: 'AlicePage2', author: 'alice' })
      }
    };
    const result = await p.getPagesByCreator('alice');
    expect(result.map(e => e.title).sort()).toEqual(['AlicePage', 'AlicePage2']);
  });

  test('matches by creator field (denormalised on private pages)', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 2,
      pages: {
        u1: baseEntry({ uuid: 'u1', title: 'PrivAlice', author: 'alice', creator: 'alice', isPrivate: true }),
        u2: baseEntry({ uuid: 'u2', title: 'AdminCreatedForBob', author: 'admin', creator: 'bob', isPrivate: true })
      }
    };
    const aliceResult = await p.getPagesByCreator('alice');
    const bobResult = await p.getPagesByCreator('bob');
    expect(aliceResult.map(e => e.title)).toEqual(['PrivAlice']);
    expect(bobResult.map(e => e.title)).toEqual(['AdminCreatedForBob']);
  });

  test('onlyPrivate: true filters non-private pages out', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 3,
      pages: {
        u1: baseEntry({ uuid: 'u1', title: 'PublicAlice', author: 'alice' }),
        u2: baseEntry({ uuid: 'u2', title: 'PrivateAlice', author: 'alice', isPrivate: true }),
        u3: baseEntry({ uuid: 'u3', title: 'PublicAlice2', author: 'alice' })
      }
    };
    const all = await p.getPagesByCreator('alice');
    const onlyPrivate = await p.getPagesByCreator('alice', { onlyPrivate: true });
    expect(all).toHaveLength(3);
    expect(onlyPrivate).toHaveLength(1);
    expect(onlyPrivate[0].title).toBe('PrivateAlice');
  });

  test('default sort is lastModified descending', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 3,
      pages: {
        u1: baseEntry({ uuid: 'u1', title: 'Old', author: 'alice', lastModified: '2026-01-01' }),
        u2: baseEntry({ uuid: 'u2', title: 'New', author: 'alice', lastModified: '2026-05-01' }),
        u3: baseEntry({ uuid: 'u3', title: 'Mid', author: 'alice', lastModified: '2026-03-01' })
      }
    };
    const result = await p.getPagesByCreator('alice');
    expect(result.map(e => e.title)).toEqual(['New', 'Mid', 'Old']);
  });

  test('sortBy title-asc orders alphabetically', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 3,
      pages: {
        u1: baseEntry({ uuid: 'u1', title: 'Charlie', author: 'alice' }),
        u2: baseEntry({ uuid: 'u2', title: 'Alpha', author: 'alice' }),
        u3: baseEntry({ uuid: 'u3', title: 'Bravo', author: 'alice' })
      }
    };
    const result = await p.getPagesByCreator('alice', { sortBy: 'title-asc' });
    expect(result.map(e => e.title)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  test('respects limit', async () => {
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 5,
      pages: {
        u1: baseEntry({ uuid: 'u1', author: 'alice', lastModified: '2026-05-05' }),
        u2: baseEntry({ uuid: 'u2', author: 'alice', lastModified: '2026-05-04' }),
        u3: baseEntry({ uuid: 'u3', author: 'alice', lastModified: '2026-05-03' }),
        u4: baseEntry({ uuid: 'u4', author: 'alice', lastModified: '2026-05-02' }),
        u5: baseEntry({ uuid: 'u5', author: 'alice', lastModified: '2026-05-01' })
      }
    };
    const result = await p.getPagesByCreator('alice', { limit: 2 });
    expect(result).toHaveLength(2);
    expect(result.map(e => e.uuid)).toEqual(['u1', 'u2']);
  });

  test('does NOT apply visibility filter (caller is asking about own pages)', async () => {
    // Even private-with-no-audience pages are returned for the matching creator.
    const p = makeProvider();
    p.pageIndex = {
      version: '1', lastUpdated: '', pageCount: 1,
      pages: {
        u1: baseEntry({
          uuid: 'u1',
          title: 'AliceSecret',
          author: 'alice',
          creator: 'alice',
          isPrivate: true,
          audienceRoles: undefined // no audience whatsoever
        })
      }
    };
    const result = await p.getPagesByCreator('alice');
    expect(result.map(e => e.title)).toEqual(['AliceSecret']);
  });
});

// ─── #640 Phase 2: getPagesByEditor + getPagesSharedWith ─────────────────

function makeProviderWith(pages: Record<string, ReturnType<typeof makePageEntry>>) {
  const p = makeProvider();
  p.pageIndex = {
    version: '1', lastUpdated: '', pageCount: Object.keys(pages).length, pages
  };
  return p;
}

describe('VersioningFileProvider.getPagesByEditor (#640 Phase 2)', () => {
  test('returns [] when pageIndex is null or username empty', async () => {
    const p = makeProvider();
    p.pageIndex = null;
    expect(await (p as unknown as { getPagesByEditor: (u: string) => Promise<unknown[]> }).getPagesByEditor('alice')).toEqual([]);
  });

  test('matches by editor field', async () => {
    const p = makeProviderWith({
      u1: baseEntry({ uuid: 'u1', title: 'EditedByAlice', author: 'bob', editor: 'alice' }),
      u2: baseEntry({ uuid: 'u2', title: 'EditedByBob', author: 'bob', editor: 'bob' }),
      u3: baseEntry({ uuid: 'u3', title: 'AliceEditedAgain', author: 'carol', editor: 'alice' })
    });
    const result = await (p as unknown as { getPagesByEditor: (u: string) => Promise<{ title: string }[]> }).getPagesByEditor('alice');
    expect(result.map(e => e.title).sort()).toEqual(['AliceEditedAgain', 'EditedByAlice']);
  });

  test('respects limit', async () => {
    const pages: Record<string, ReturnType<typeof makePageEntry>> = {};
    for (let i = 0; i < 5; i++) {
      pages[`u${i}`] = baseEntry({ uuid: `u${i}`, editor: 'alice', lastModified: `2026-05-0${i + 1}` });
    }
    const p = makeProviderWith(pages);
    const result = await (p as unknown as { getPagesByEditor: (u: string, o?: { limit?: number }) => Promise<unknown[]> }).getPagesByEditor('alice', { limit: 2 });
    expect(result).toHaveLength(2);
  });
});

describe('VersioningFileProvider.getPagesSharedWith (#640 Phase 2)', () => {
  test('returns [] when principals empty', async () => {
    const p = makeProviderWith({
      u1: baseEntry({ uuid: 'u1', author: 'alice', audienceRoles: ['bob'] })
    });
    expect(await (p as unknown as { getPagesSharedWith: (ps: string[]) => Promise<unknown[]> }).getPagesSharedWith([])).toEqual([]);
  });

  test('matches when any principal appears in audienceRoles', async () => {
    const p = makeProviderWith({
      u1: baseEntry({ uuid: 'u1', title: 'Shared1', author: 'alice', audienceRoles: ['bob', 'carol'] }),
      u2: baseEntry({ uuid: 'u2', title: 'NotShared', author: 'alice', audienceRoles: ['carol'] }),
      u3: baseEntry({ uuid: 'u3', title: 'SharedRole', author: 'alice', audienceRoles: ['editor'] })
    });
    const result = await (p as unknown as { getPagesSharedWith: (ps: string[]) => Promise<{ title: string }[]> }).getPagesSharedWith(['bob']);
    expect(result.map(e => e.title)).toEqual(['Shared1']);

    const roleResult = await (p as unknown as { getPagesSharedWith: (ps: string[]) => Promise<{ title: string }[]> }).getPagesSharedWith(['editor']);
    expect(roleResult.map(e => e.title)).toEqual(['SharedRole']);
  });

  test('excludes pages owned by any principal (no double-count with /my/pages)', async () => {
    const p = makeProviderWith({
      u1: baseEntry({ uuid: 'u1', title: 'BobOwns', author: 'bob', audienceRoles: ['bob'] }),
      u2: baseEntry({ uuid: 'u2', title: 'AliceOwnsSharedToBob', author: 'alice', audienceRoles: ['bob'] }),
      u3: baseEntry({ uuid: 'u3', title: 'BobIsCreator', author: 'admin', creator: 'bob', audienceRoles: ['bob'] })
    });
    const result = await (p as unknown as { getPagesSharedWith: (ps: string[]) => Promise<{ title: string }[]> }).getPagesSharedWith(['bob']);
    // Bob owns u1 (author) and u3 (creator); only u2 is genuinely "shared with bob".
    expect(result.map(e => e.title)).toEqual(['AliceOwnsSharedToBob']);
  });

  test('returns [] when audienceRoles is empty/undefined on every page', async () => {
    const p = makeProviderWith({
      u1: baseEntry({ uuid: 'u1', author: 'alice' }) // no audienceRoles
    });
    expect(await (p as unknown as { getPagesSharedWith: (ps: string[]) => Promise<unknown[]> }).getPagesSharedWith(['bob'])).toEqual([]);
  });
});
