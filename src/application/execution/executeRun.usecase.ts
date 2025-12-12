import { runPlanRepository, runReportRepository, specRepository, environmentRepository } from '../../infrastructure/persistence';
import { executeOperation } from '../../infrastructure/http/AxiosExecutionAdapter';
import { RunReport, TestResult } from '../../domain/models/RunReport';

export async function executeRun(input: { runId?: string; specId?: string; envName?: string; selection?: any }): Promise<RunReport> {
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

  const results: TestResult[] = [];

  const startedAt = new Date().toISOString();

  for (const tc of plan.testCases) {
    const op = (plan.operations || []).find((o: any) => o.operationId === tc.operationId);
    if (!op) {
      results.push({ testCaseId: tc.id, operationId: tc.operationId, status: 'error', error: 'operation not found' } as TestResult);
      continue;
    }

    try {
      const exec = await executeOperation(spec, op, env, tc.overrides || {});
      const passed = (exec.httpStatus === tc.expectedStatus);
      results.push({ testCaseId: tc.id, operationId: tc.operationId, status: passed ? 'passed' : 'failed', httpStatus: exec.httpStatus, durationMs: exec.durationMs, request: exec.request, response: exec.response } as TestResult);
    } catch (err: any) {
      results.push({ testCaseId: tc.id, operationId: tc.operationId, status: 'error', error: String(err?.message || err) } as TestResult);
    }
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
