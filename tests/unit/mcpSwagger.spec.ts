import { getCompatibilityClient, resetCompatibilityClients } from '../../src/infrastructure/mcp/FactoryAdapter';

const sampleSpec = {
  openapi: '3.0.0',
  info: { title: 'Sample API', version: '1.0.0' },
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: { '200': { description: 'ok' } },
      },
    },
  },
};

describe('MCP Swagger tools', () => {
  afterEach(() => resetCompatibilityClients());

  it('parses content via swagger.parse', async () => {
    const client = getCompatibilityClient('test-parse');
    await client.connect();
    const res = await client.executeTool('swagger.parse', { content: JSON.stringify(sampleSpec) });
    expect(res.success).toBe(true);
    expect((res.data as any).info.title).toBe('Sample API');
  });

  it('validates content via swagger.validate', async () => {
    const client = getCompatibilityClient('test-validate');
    await client.connect();
    const res = await client.executeTool('swagger.validate', { content: JSON.stringify(sampleSpec) });
    expect(res.success).toBe(true);
    expect((res.data as any).valid).toBe(true);
  });

  it('normalizes and persists via swagger.normalize and lists operations', async () => {
    const client = getCompatibilityClient('test-normalize');
    await client.connect();
    const norm = await client.executeTool('swagger.normalize', { content: JSON.stringify(sampleSpec) });
    expect(norm.success).toBe(true);
    const specId = (norm.data as any).id;
    expect(specId).toBeDefined();

    const list = await client.executeTool('swagger.listOperations', { specId });
    expect(list.success).toBe(true);
    expect(Array.isArray(list.data as any)).toBe(true);
    expect((list.data as any).find((o: any) => o.operationId === 'listPets')).toBeDefined();
  });
});
