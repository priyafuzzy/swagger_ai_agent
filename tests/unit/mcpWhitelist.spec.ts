import { executeToolHandler } from '../../src/api/controllers/mcp.controller';

describe('MCP whitelist enforcement', () => {
  test('rejects disallowed tool', async () => {
    const req: any = { body: { toolName: 'not-allowed-tool', params: {} } };
    const status = jest.fn(() => ({ json: jest.fn() }));
    const res: any = { status };
    const next = jest.fn();

    await executeToolHandler(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
  });
});
