import { generateTestsForOperations } from '../../src/application/execution/generateTests.usecase';

describe('generateTestsForOperations', () => {
  it('generates happy / negative tests for basic operations', () => {
    const ops: any[] = [
      {
        operationId: 'op1',
        method: 'get',
        path: '/api/foo',
        responses: [{ status: 200 }],
      },
      {
        operationId: 'op2',
        method: 'post',
        path: '/api/bar',
        requestBody: { content: { 'application/json': { schema: { properties: { name: { type: 'string' } } } } } },
        responses: [{ status: 201 }],
      },
    ];

    const tests = generateTestsForOperations(ops as any);
    expect(tests.length).toBeGreaterThanOrEqual(4);
    const happy = tests.find((t) => t.name.startsWith('happy'));
    expect(happy).toBeDefined();
    expect(happy?.expectedStatus).toBe(200);
  });
});
