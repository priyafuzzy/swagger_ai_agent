import { runPlanRepository, runReportRepository, specRepository, environmentRepository } from '../../infrastructure/persistence';
import { executeOperation } from '../../infrastructure/http/AxiosExecutionAdapter';
import { RunReport, TestResult } from '../../domain/models/RunReport';

export type ExecuteRunOptions = {
  retries?: number; // number of retries per test on failure (default 0)
  retryFailedOnly?: boolean; // when true and runId provided, only retry previously failed tests
  partialTestIds?: string[]; // run only these test case ids from the plan
};

export async function executeRun(input: { runId?: string; specId?: string; envName?: string; selection?: any; options?: ExecuteRunOptions }): Promise<RunReport> {
  // Fetch or create run plan
  let plan: any = null;
  if (input.runId) {
    plan = await runPlanRepository.getById(input.runId);
    if (!plan) throw new Error(`RunPlan not found: ${input.runId}`);
  } else if (input.specId && input.envName) {
    // create ad-hoc plan
    const created = await (await import('./planRun.usecase')).planRun({ specId: input.specId, envName: input.envName, selection: input.selection || { mode: 'full' } });
    plan = created;
  } else {
    throw new Error('Either runId or specId+envName required');
  }

  const spec = await specRepository.getById(plan.specId);
  if (!spec) throw new Error(`Spec not found: ${plan.specId}`);

  const envs = await environmentRepository.listBySpec(plan.specId);
  const env = envs.find((e: any) => e.name === plan.envName);
  if (!env) throw new Error(`Environment not found: ${plan.envName}`);

  const opts: ExecuteRunOptions = (input as any).options || {};
  const retries = Number(opts.retries || 0);
  const partialIds = Array.isArray(opts.partialTestIds) ? opts.partialTestIds : null;

  const results: TestResult[] = [];
  const startedAt = new Date().toISOString();

  // determine which test cases to run
  let testCases = Array.isArray(plan.testCases) ? plan.testCases.slice() : [];
  if (partialIds && partialIds.length) {
    testCases = testCases.filter((t: any) => partialIds.includes(t.id));
  }

  for (const tc of testCases) {
    // if retryFailedOnly and existing report present, and previous result was passed, skip
    if (opts.retryFailedOnly && input.runId) {
      const prevReport = await runReportRepository.getByRunId(input.runId!);
      if (prevReport && Array.isArray(prevReport.results)) {
        const prev = prevReport.results.find((r: any) => r.testCaseId === tc.id);
        if (prev && prev.status === 'passed') {
          results.push(prev);
          continue;
        }
      }
    }

    const op = (plan.operations || []).find((o: any) => o.operationId === tc.operationId);
    if (!op) {
      results.push({ testCaseId: tc.id, operationId: tc.operationId, status: 'error', error: 'operation not found' } as TestResult);
      continue;
    }

    let attempt = 0;
    let lastResult: TestResult | null = null;
    while (attempt <= retries) {
      attempt += 1;
      try {
        const exec = await executeOperation(spec, op, env, tc.overrides || {});
        const passed = (exec.httpStatus === tc.expectedStatus);
        const status: TestResult['status'] = passed ? 'passed' : 'failed';
        lastResult = { testCaseId: tc.id, operationId: tc.operationId, status, httpStatus: exec.httpStatus, durationMs: exec.durationMs, request: exec.request, response: exec.response } as TestResult;
        if (passed) break; // success
        // if not passed and we have retries left, loop to retry
      } catch (err: any) {
        lastResult = { testCaseId: tc.id, operationId: tc.operationId, status: 'error', error: String(err?.message || err) } as TestResult;
        // if error and retries left, retry
      }
      if (attempt > retries) break;
    }
    results.push(lastResult as TestResult);
  }

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const errors = results.filter(r => r.status === 'error').length;

  const report: RunReport = {
    runId: plan.runId,
    specId: plan.specId,
    envName: plan.envName,
    total: results.length,
    passed,
    failed,
    errors,
    results,
    startedAt,
    finishedAt: new Date().toISOString(),
  };

  // persist report
  await runReportRepository.save(report as any);

  return report;
}

export default executeRun;
