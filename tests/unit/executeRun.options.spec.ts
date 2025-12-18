import { runPlanRepository, specRepository, environmentRepository, runReportRepository } from '../../src/infrastructure/persistence';
import { executeRun } from '../../src/application/execution/executeRun.usecase';

jest.mock('../../src/infrastructure/http/AxiosExecutionAdapter', () => ({
  executeOperation: jest.fn(),
}));

const { executeOperation } = require('../../src/infrastructure/http/AxiosExecutionAdapter');

describe('executeRun options', () => {
  beforeEach(async () => {
    // clear in-memory stores by re-creating them indirectly (repositories are singletons)
    // we rely on methods to overwrite entries
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('retries a failed test until success when retries>0', async () => {
    // prepare spec
    const spec = { id: 'spec-retry', title: 's', version: '1', servers: [], tags: [], operationCount: 1, operations: [{ operationId: 'op1', method: 'GET', path: '/p', responses: [{ status: '200' }] }], raw: {} };
    await specRepository.save(spec as any);
    // env
    const env = { id: 'env1', specId: 'spec-retry', name: 'qa', baseUrl: 'https://example.invalid', defaultHeaders: {}, authConfig: {} };
    await environmentRepository.save(env as any);

    // run plan
    const plan = {
      runId: 'run-retry',
      specId: 'spec-retry',
      envName: 'qa',
      operations: spec.operations,
      testCases: [{ id: 'tc1', operationId: 'op1', name: 't1', expectedStatus: 200 }],
      createdAt: new Date().toISOString(),
    };
    await runPlanRepository.save(plan as any);

    // mock executeOperation: first attempt 500, second attempt 200
    (executeOperation as jest.Mock).mockImplementationOnce(async () => ({ httpStatus: 500, durationMs: 10 }))
      .mockImplementationOnce(async () => ({ httpStatus: 200, durationMs: 12 }));

    const report = await executeRun({ runId: 'run-retry', options: { retries: 1 } });
    expect(report).toBeDefined();
    expect(report.passed).toBe(1);
    expect(report.failed + report.errors).toBe(0);
  });

  it('partialTestIds runs only selected tests', async () => {
    const spec = { id: 'spec-partial', title: 's', version: '1', servers: [], tags: [], operationCount: 2, operations: [{ operationId: 'opA', method: 'GET', path: '/a', responses: [{ status: '200' }] }, { operationId: 'opB', method: 'GET', path: '/b', responses: [{ status: '200' }] }], raw: {} };
    await specRepository.save(spec as any);
    const env = { id: 'env2', specId: 'spec-partial', name: 'qa', baseUrl: 'https://example.invalid', defaultHeaders: {}, authConfig: {} };
    await environmentRepository.save(env as any);

    const plan = {
      runId: 'run-partial',
      specId: 'spec-partial',
      envName: 'qa',
      operations: spec.operations,
      testCases: [
        { id: 'tcA', operationId: 'opA', name: 'a', expectedStatus: 200 },
        { id: 'tcB', operationId: 'opB', name: 'b', expectedStatus: 200 },
      ],
      createdAt: new Date().toISOString(),
    };
    await runPlanRepository.save(plan as any);

    (executeOperation as jest.Mock).mockImplementation(async () => ({ httpStatus: 200, durationMs: 5 }));

    const report = await executeRun({ runId: 'run-partial', options: { partialTestIds: ['tcB'] } });
    expect(report.total).toBe(1);
    expect(report.passed).toBe(1);
    // ensure we didn't run tcA
    expect(report.results.find(r => r.testCaseId === 'tcA')).toBeUndefined();
  });

  it('retryFailedOnly preserves passed tests and retries failures', async () => {
    const spec = { id: 'spec-retryOnly', title: 's', version: '1', servers: [], tags: [], operationCount: 2, operations: [{ operationId: 'opa', method: 'GET', path: '/a', responses: [{ status: '200' }] }, { operationId: 'opb', method: 'GET', path: '/b', responses: [{ status: '200' }] }], raw: {} };
    await specRepository.save(spec as any);
    const env = { id: 'env3', specId: 'spec-retryOnly', name: 'qa', baseUrl: 'https://example.invalid', defaultHeaders: {}, authConfig: {} };
    await environmentRepository.save(env as any);

    const plan = {
      runId: 'run-retryOnly',
      specId: 'spec-retryOnly',
      envName: 'qa',
      operations: spec.operations,
      testCases: [
        { id: 't1', operationId: 'opa', name: 'a', expectedStatus: 200 },
        { id: 't2', operationId: 'opb', name: 'b', expectedStatus: 200 },
      ],
      createdAt: new Date().toISOString(),
    };
    await runPlanRepository.save(plan as any);

    // previous report: t1 passed, t2 failed
    const prevReport = {
      runId: 'run-retryOnly', specId: 'spec-retryOnly', envName: 'qa', total: 2, passed: 1, failed: 1, errors: 0,
      results: [ { testCaseId: 't1', operationId: 'opa', status: 'passed', httpStatus: 200 }, { testCaseId: 't2', operationId: 'opb', status: 'failed', httpStatus: 500 } ],
      startedAt: new Date().toISOString(), finishedAt: new Date().toISOString()
    };
    await runReportRepository.save(prevReport as any);

    // mock: t2 will succeed on retry
    (executeOperation as jest.Mock).mockImplementation(async () => ({ httpStatus: 200, durationMs: 5 }));

    const report = await executeRun({ runId: 'run-retryOnly', options: { retryFailedOnly: true, retries: 1 } });
    // t1 should be preserved as passed, t2 should be retried and pass
    expect(report.passed).toBe(2);
    expect(report.total).toBe(2);
  });
});
