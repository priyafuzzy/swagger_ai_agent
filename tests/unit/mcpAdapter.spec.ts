import { MockMCPAdapter } from '../../src/infrastructure/mcp/MockMCPAdapter';

describe('MockMCPAdapter', () => {
  it('returns deterministic mock responses', async () => {
    const adapter = new MockMCPAdapter();
    const resp = await adapter.generate('Hello world', { temp: 0.1 });
    expect(resp.text).toContain('MOCK_RESPONSE');
    expect(resp.raw).toBeDefined();
    expect(resp.raw.promptLength).toBeGreaterThan(0);
  });
});
