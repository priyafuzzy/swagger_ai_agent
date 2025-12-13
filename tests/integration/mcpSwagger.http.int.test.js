process.env.MCP_ALLOWED_TOOLS = 'swagger.*';

const request = require('supertest');
const app = require('../../src/core/app').default;
const { specRepository } = require('../../src/infrastructure/persistence');
const loader = require('../../src/infrastructure/swagger/SwaggerLoader');

describe('HTTP /api/mcp/swagger endpoints', () => {
  beforeEach(async () => {
    // ensure no leftover spec with id
    // create fresh spec ids as needed per test
  });

  it('POST /api/mcp/swagger/parse parses JSON body', async () => {
    const payload = { content: JSON.stringify({ openapi: '3.0.0', info: { title: 'T' }, paths: {} }) };
    const res = await request(app).post('/api/mcp/swagger/parse').send(payload).expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.result).toBeDefined();
    expect(res.body.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('POST /api/mcp/swagger/fetch returns mocked fetched content', async () => {
    jest.spyOn(loader, 'fetchJsonFromUrl').mockResolvedValue({ openapi: '3.0.0', info: { title: 'Fetched' }, paths: {} });
    const res = await request(app).post('/api/mcp/swagger/fetch').send({ url: 'http://example.com/spec.yaml' }).expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('POST /api/mcp/swagger/operations lists operations for saved spec', async () => {
    const spec = { id: 'spec-int-1', title: 'Int Spec', operations: [{ operationId: 'op1', method: 'post', path: '/x' }] };
    await specRepository.save(spec);
    const res = await request(app).post('/api/mcp/swagger/operations').send({ specId: 'spec-int-1' }).expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.result.data)).toBe(true);
    expect(res.body.result.data[0]).toHaveProperty('operationId', 'op1');
  });
});

module.exports = {};
