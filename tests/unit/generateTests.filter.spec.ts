import * as generator from '../../src/application/execution/generateTests.usecase';

describe('generateTestsForSpec filtering unknown operationIds', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('falls back when LLM returns unknown operationIds and returns warnings', async () => {
    const mockSpec = { operations: [{ operationId: 'op1', method: 'get', path: '/a' }] } as any;

    jest.mock('../../src/infrastructure/persistence', () => ({
      specRepository: { getById: async () => mockSpec },
    }));

    const fakeClient = {
      connect: async () => {},
      executeTool: async (toolName: string, params: any) => ({ success: true, data: JSON.stringify([{ id: 'tc1', operationId: 'unknown-op', name: 'LLM test', expectedStatus: 200, payloadStrategy: 'none' }]) }),
    } as any;

    const mod = await import('../../src/application/execution/generateTests.usecase');
    const result: any = await mod.generateTestsForSpec('spec-x', { useMCP: true, mcpClient: fakeClient });
    expect(result).toBeDefined();
    // result should be { tests: [...], warnings: [...] }
    expect((result as any).tests).toBeDefined();
    expect(Array.isArray((result as any).warnings)).toBe(true);
    expect((result as any).warnings.join('')).toMatch(/falling back/i);
  });
});
