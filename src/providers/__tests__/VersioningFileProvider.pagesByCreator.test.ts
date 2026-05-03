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
