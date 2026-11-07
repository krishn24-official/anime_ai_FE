import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Minimal localStorage stand-in (vitest runs in the node environment here).
const makeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    _data: data,
  };
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ADMIN = { id: 'u1', email: 'admin@x.com', username: 'admin', is_admin: true };

// Fresh module instance per test so the client re-reads the stubbed localStorage.
const loadClient = async (storage: ReturnType<typeof makeStorage>) => {
  vi.stubGlobal('localStorage', storage);
  vi.resetModules();
  return (await import('./apiClient')).apiClient;
};

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;
const mockFetch = (handler: Handler) => {
  const fn = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(String(input), init))
  );
  vi.stubGlobal('fetch', fn);
  return fn;
};
const authOf = (init: RequestInit) => (init.headers as Record<string, string>)?.Authorization;
const calls = (fn: ReturnType<typeof mockFetch>, path: string) =>
  fn.mock.calls.filter(([u]) => String(u).endsWith(path));

describe('apiClient session handling', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('refreshes an expired admin token and retries as the same user (no guest fallback)', async () => {
    const storage = makeStorage({
      anime_ai_token: 'old-access',
      anime_ai_refresh_token: 'refresh-1',
      anime_ai_user: JSON.stringify(ADMIN),
    });
    const fetchFn = mockFetch((url, init) => {
      if (url.endsWith('/auth/refresh'))
        return json(200, { user: ADMIN, access_token: 'new-access', refresh_token: 'refresh-2' });
      if (url.endsWith('/admin/trending'))
        return authOf(init) === 'Bearer new-access' ? json(200, [{ pinned: true }]) : json(401, { detail: 'expired' });
      return json(500, {});
    });
    const client = await loadClient(storage);
    const events: string[] = [];
    client.onAuthEvent((e) => events.push(e.type));

    const data = await client.get<unknown[]>('/admin/trending');

    expect(data).toHaveLength(1);
    expect(calls(fetchFn, '/auth/login')).toHaveLength(0);
    expect(storage.getItem('anime_ai_token')).toBe('new-access');
    expect(storage.getItem('anime_ai_refresh_token')).toBe('refresh-2');
    expect(events).toEqual(['refreshed']);
  });

  it('shares one refresh call between concurrent 401s (refresh tokens are single-use)', async () => {
    const storage = makeStorage({
      anime_ai_token: 'old-access',
      anime_ai_refresh_token: 'refresh-1',
      anime_ai_user: JSON.stringify(ADMIN),
    });
    const fetchFn = mockFetch((url, init) => {
      if (url.endsWith('/auth/refresh'))
        return json(200, { user: ADMIN, access_token: 'new-access', refresh_token: 'refresh-2' });
      return authOf(init) === 'Bearer new-access' ? json(200, { ok: true }) : json(401, {});
    });
    const client = await loadClient(storage);

    await Promise.all([client.get('/admin/anime'), client.get('/admin/movies'), client.get('/watchlist')]);

    expect(calls(fetchFn, '/auth/refresh')).toHaveLength(1);
  });

  it('expires the session (clears stored user) when refresh fails, then continues as guest', async () => {
    const storage = makeStorage({
      anime_ai_token: 'old-access',
      anime_ai_refresh_token: 'revoked',
      anime_ai_user: JSON.stringify(ADMIN),
    });
    const fetchFn = mockFetch((url, init) => {
      if (url.endsWith('/auth/refresh')) return json(401, { detail: 'Invalid or revoked refresh token' });
      if (url.endsWith('/auth/login')) return json(200, { access_token: 'guest-access' });
      if (url.endsWith('/admin/trending'))
        return authOf(init) === 'Bearer guest-access' ? json(403, { detail: 'Admin access required' }) : json(401, {});
      return json(500, {});
    });
    const client = await loadClient(storage);
    const events: string[] = [];
    client.onAuthEvent((e) => events.push(e.type));

    await expect(client.get('/admin/trending')).rejects.toThrow('Admin access required');

    expect(events).toEqual(['expired']);
    expect(storage.getItem('anime_ai_user')).toBeNull();
    expect(calls(fetchFn, '/auth/login')).toHaveLength(1);
  });

  it('never answers /auth/me with the guest profile', async () => {
    const storage = makeStorage({
      anime_ai_token: 'old-access',
      anime_ai_refresh_token: 'revoked',
      anime_ai_user: JSON.stringify(ADMIN),
    });
    const fetchFn = mockFetch((url) => {
      if (url.endsWith('/auth/refresh')) return json(401, {});
      if (url.endsWith('/auth/login')) return json(200, { access_token: 'guest-access' });
      return json(401, { detail: 'Could not validate credentials' });
    });
    const client = await loadClient(storage);

    await expect(client.get('/auth/me')).rejects.toThrow();

    expect(calls(fetchFn, '/auth/login')).toHaveLength(0);
    expect(storage.getItem('anime_ai_user')).toBeNull();
  });

  it('silently re-issues an expired guest token without an "expired" event', async () => {
    const storage = makeStorage({ anime_ai_token: 'old-guest' });
    mockFetch((url, init) => {
      if (url.endsWith('/auth/login')) return json(200, { access_token: 'guest-2' });
      return authOf(init) === 'Bearer guest-2' ? json(200, []) : json(401, {});
    });
    const client = await loadClient(storage);
    const events: string[] = [];
    client.onAuthEvent((e) => events.push(e.type));

    await client.get('/watchlist');

    expect(events).toEqual([]);
    expect(storage.getItem('anime_ai_token')).toBe('guest-2');
  });
});
