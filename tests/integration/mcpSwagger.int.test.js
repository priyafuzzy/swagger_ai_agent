process.env.MCP_ALLOWED_TOOLS = 'swagger.*';

const request = require('supertest');
const app = require('../../src/core/app').default;
const { specRepository } = require('../../src/infrastructure/persistence');

describe('/api/mcp/swagger integration', () => {
  it('POST /api/mcp/swagger/parse should parse JSON content', async () => {
    const payload = {
      content: JSON.stringify({ openapi: '3.0.0', info: { title: 'T' }, paths: {} }),
    };
    const res = await request(app).post('/api/mcp/swagger/parse').send(payload).expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.result).toBeDefined();
    expect(res.body.result.success).toBe(true);
    expect(res.body.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('POST /api/mcp/swagger/fetch should return fetched spec (mocked loader)', async () => {
    const loader = require('../../src/infrastructure/swagger/SwaggerLoader');
    jest.spyOn(loader, 'fetchJsonFromUrl').mockResolvedValue({ openapi: '3.0.0', info: { title: 'Fetched' }, paths: {} });

    const res = await request(app).post('/api/mcp/swagger/fetch').send({ url: 'http://example.com/spec.yaml' }).expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('POST /api/mcp/swagger/operations should list operations for a saved spec', async () => {
    const spec = {
      id: 'spec-test-1',
      title: 'Spec Test',
      operations: [
        { operationId: 'op1', method: 'get', path: '/pets', summary: 'List pets' },
      ],
    };
    await specRepository.save(spec);

    const res = await request(app).post('/api/mcp/swagger/operations').send({ specId: 'spec-test-1' }).expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.result.data)).toBe(true);
    expect(res.body.result.data[0]).toHaveProperty('operationId', 'op1');
  });
});

module.exports = {};
