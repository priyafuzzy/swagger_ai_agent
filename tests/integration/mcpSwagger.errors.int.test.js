// Tests for error and permission scenarios on /api/mcp/swagger endpoints

const axios = require('axios');
const http = require('http');

function startServerWithEnv(envValue) {
  // reset loaded modules so config reads new env
  jest.resetModules();
  process.env.MCP_ALLOWED_TOOLS = envValue;
  const app = require('../../src/core/app').default;
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

describe('HTTP /api/mcp/swagger error & permission scenarios', () => {
  it('returns 400 when /parse missing content', async () => {
    const { server, baseUrl } = await startServerWithEnv('swagger.*');
    try {
      const res = await axios.post(`${baseUrl}/api/mcp/swagger/parse`, {}, { validateStatus: () => true });
      expect(res.status).toBe(400);
      expect(res.data).toHaveProperty('error', 'content is required');
    } finally {
      server.close();
    }
  });

  it('returns 403 when tool is not allowed', async () => {
    const { server, baseUrl } = await startServerWithEnv('');
    try {
      const res = await axios.post(`${baseUrl}/api/mcp/swagger/fetch`, { url: 'http://example.com/spec' }, { validateStatus: () => true });
      expect(res.status).toBe(403);
      expect(res.data).toHaveProperty('error');
      expect(String(res.data.error)).toMatch(/Tool not allowed/);
    } finally {
      server.close();
    }
  });

  it('returns 400 when /operations missing specId', async () => {
    const { server, baseUrl } = await startServerWithEnv('swagger.*');
    try {
      const res = await axios.post(`${baseUrl}/api/mcp/swagger/operations`, {}, { validateStatus: () => true });
      expect(res.status).toBe(400);
      expect(res.data).toHaveProperty('error', 'specId is required');
    } finally {
      server.close();
    }
  });
});

module.exports = {};
