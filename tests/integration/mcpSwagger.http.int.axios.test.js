process.env.MCP_ALLOWED_TOOLS = 'swagger.*';

const axios = require('axios');
const http = require('http');

// Mock the FactoryAdapter to control swagger.fetch behavior reliably
jest.mock('../../src/infrastructure/mcp/FactoryAdapter', () => ({
  getCompatibilityClient: () => ({
    connect: async () => {},
    executeTool: async (toolName, params) => {
      if (toolName === 'swagger.fetch') return { success: true, data: { openapi: '3.0.0', info: { title: 'Fetched' }, paths: {} }, duration: 1, toolName, timestamp: new Date() };
      if (toolName === 'swagger.parse') return { success: true, data: params.content ? JSON.parse(params.content) : null, duration: 1, toolName, timestamp: new Date() };
      if (toolName === 'swagger.listOperations') return { success: true, data: [{ operationId: 'op1', method: 'get', path: '/' }], duration: 1, toolName, timestamp: new Date() };
      return { success: false, error: 'unknown tool', duration: 1, toolName, timestamp: new Date() };
    },
  }),
}));

const app = require('../../src/core/app').default;
const { specRepository } = require('../../src/infrastructure/persistence');
// const loader = require('../../src/infrastructure/swagger/SwaggerLoader');

describe('HTTP /api/mcp/swagger endpoints (axios)', () => {
  let server;
  let baseUrl;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('POST /api/mcp/swagger/parse parses JSON body', async () => {
    const payload = { content: JSON.stringify({ openapi: '3.0.0', info: { title: 'T' }, paths: {} }) };
    const res = await axios.post(`${baseUrl}/api/mcp/swagger/parse`, payload);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('success', true);
    expect(res.data.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('POST /api/mcp/swagger/fetch returns mocked fetched content', async () => {
    const res = await axios.post(`${baseUrl}/api/mcp/swagger/fetch`, { url: 'http://example.com/spec.yaml' });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('success', true);
    expect(res.data.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('POST /api/mcp/swagger/operations lists operations for saved spec', async () => {
    const spec = { id: 'spec-int-1', title: 'Int Spec', operations: [{ operationId: 'op1', method: 'post', path: '/x' }] };
    await specRepository.save(spec);
    const res = await axios.post(`${baseUrl}/api/mcp/swagger/operations`, { specId: 'spec-int-1' });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('success', true);
    expect(Array.isArray(res.data.result.data)).toBe(true);
    expect(res.data.result.data[0]).toHaveProperty('operationId', 'op1');
  });
});

module.exports = {};
