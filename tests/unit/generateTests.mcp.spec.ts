import * as generator from '../../src/application/execution/generateTests.usecase';

describe('generateTestsForSpec with MCP', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('uses provided MCP client response when valid JSON returned', async () => {
    const mockSpec = { operations: [{ operationId: 'op1', method: 'get', path: '/a' }] } as any;

    jest.mock('../../src/infrastructure/persistence', () => ({
      specRepository: { getById: async () => mockSpec },
    }));

    // create a fake MCP client that returns JSON array
    const fakeClient = {
      connect: async () => {},
      executeTool: async (toolName: string, params: any) => ({ success: true, data: JSON.stringify([{ id: 'tc1', operationId: 'op1', name: 'LLM test', expectedStatus: 200, payloadStrategy: 'none' }]) }),
    } as any;

    const mod = await import('../../src/application/execution/generateTests.usecase');
    const result: any = await mod.generateTestsForSpec('spec-x', { useMCP: true, mcpClient: fakeClient });
    const tests = Array.isArray(result) ? result : result.tests;
    expect(Array.isArray(tests)).toBe(true);
    expect(tests[0].id).toBe('tc1');
    expect(tests[0].operationId).toBe('op1');
  });
});
