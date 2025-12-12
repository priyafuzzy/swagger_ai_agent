import { getCompatibilityClient, resetCompatibilityClients } from '../../src/infrastructure/mcp/FactoryAdapter';
import { MockMCPAdapter } from '../../src/infrastructure/mcp/MockMCPAdapter';

describe('CompatibilityMcpClient', () => {
  afterEach(() => resetCompatibilityClients());

  it('executes text_generation via wrapped adapter', async () => {
    const mock = new MockMCPAdapter();
    const client = getCompatibilityClient('test', mock);
    await client.connect();
    expect(client.isConnected()).toBe(true);
    const res = await client.executeTool('text_generation', { prompt: 'hello world' });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(await client.hasTool('text_generation')).toBe(true);
  });
});
