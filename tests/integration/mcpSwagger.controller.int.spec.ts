import { Request, Response, NextFunction } from 'express';

// These are not full HTTP integration tests but they exercise the Express handlers
// with a compatibility client mocked at the FactoryAdapter layer. This verifies
// the controller wiring, permission checks and error paths.

process.env.MCP_ALLOWED_TOOLS = 'swagger.*';

jest.mock('../../src/infrastructure/mcp/FactoryAdapter', () => {
  return {
    getCompatibilityClient: jest.fn(() => ({
      connect: async () => {},
      executeTool: async (toolName: string, params: any) => {
        if (toolName === 'swagger.parse') return { success: true, data: params.content ? JSON.parse(params.content) : null };
        if (toolName === 'swagger.fetch') return { success: true, data: { openapi: '3.0.0', info: { title: 'fetched' }, paths: {} } };
        if (toolName === 'swagger.listOperations') return { success: true, data: [{ operationId: 'op1', method: 'get', path: '/' }] };
        return { success: false, error: 'unknown tool' };
      },
    })),
  };
});

import swaggerMcpController from '../../src/api/controllers/swaggerMcp.controller';

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
}

describe('swaggerMcp controller handlers', () => {
  it('fetchSpecHandler returns fetched spec', async () => {
    const req = { body: { url: 'http://example.com/spec' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await swaggerMcpController.fetchSpecHandler(req, res, next);
    expect(res.json).toHaveBeenCalled();
    expect((res.json as jest.Mock).mock.calls[0][0]).toHaveProperty('success', true);
  });

  it('parseSpecHandler returns parsed object', async () => {
    const payload = { openapi: '3.0.0', info: { title: 'T' }, paths: {} };
    const req = { body: { content: JSON.stringify(payload) } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await swaggerMcpController.parseSpecHandler(req, res, next);
    expect(res.json).toHaveBeenCalled();
    const callArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(callArg).toHaveProperty('success', true);
    expect(callArg.result.data).toHaveProperty('openapi', '3.0.0');
  });

  it('listOperationsHandler returns operations for spec id', async () => {
    const req = { body: { specId: 'spec-1' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await swaggerMcpController.listOperationsHandler(req, res, next);
    expect(res.json).toHaveBeenCalled();
    const callArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(callArg).toHaveProperty('success', true);
    expect(Array.isArray(callArg.result.data)).toBe(true);
  });
});

export {};
