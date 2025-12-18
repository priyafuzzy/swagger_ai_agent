import * as SwaggerLoader from '../../src/infrastructure/swagger/SwaggerLoader';

describe('SwaggerLoader.loadFromGit', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws on invalid repo format', async () => {
    await expect(SwaggerLoader.loadFromGit({ repo: 'invalid-repo', filePath: 'a.yaml' })).rejects.toThrow(/Invalid repo format/);
  });

  it('fetches raw file using provided ref and falls back to defaults', async () => {
    const spy = jest.spyOn(SwaggerLoader as any, 'fetchJsonFromUrl');
    // first call (branch) fails, second call (main) succeeds
    spy.mockImplementationOnce(async (..._args: any[]) => { throw new Error('not found'); });
    spy.mockImplementationOnce(async (...args: any[]) => ({ ok: true, from: String(args[0] || '') }));

    const res = await SwaggerLoader.loadFromGit({ repo: 'owner/repo', ref: 'feature-branch', filePath: 'path/to/spec.json' });
    expect(res).toEqual({ ok: true, from: expect.any(String) });
    expect(spy).toHaveBeenCalled();
  });
});
