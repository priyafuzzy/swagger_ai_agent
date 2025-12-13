import crypto from 'crypto';
import { specRepository, environmentRepository, runPlanRepository } from '../../infrastructure/persistence';
import { RunPlan } from '../../domain/models/RunPlan';
import { generateTestsForSpec } from './generateTests.usecase';

type Selection = {
  mode: 'full' | 'tag' | 'operation';
  tags?: string[];
  operationIds?: string[];
};

export async function planRun(input: { specId: string; envName?: string; selection?: Selection; useMCP?: boolean }): Promise<RunPlan> {
  const { specId, envName, selection, useMCP } = input as any;
  if (!specId) throw new Error('specId is required');
  const spec = await specRepository.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);

  const envs = await environmentRepository.listBySpec(specId as any);
  const env = envs.find((e: any) => (envName ? e.name === envName : e.active)) || envs[0];
  if (!env) throw new Error(`Environment not found for spec ${specId}`);

  // select operations
  let ops = spec.operations || [];
  if (selection && selection.mode === 'tag' && Array.isArray(selection.tags)) {
    ops = ops.filter((o: any) => (o.tags || []).some((t: string) => selection.tags!.includes(t)));
  } else if (selection && selection.mode === 'operation' && Array.isArray(selection.operationIds)) {
    ops = ops.filter((o: any) => selection.operationIds!.includes(o.operationId));
  }

  // Optionally generate richer tests via MCP/LLM
  let testCases: any[] = [];
  let warnings: string[] | undefined;
  if (useMCP || process.env.PLAN_GENERATE_WITH_MCP === 'true') {
    try {
      const result: any = await generateTestsForSpec(specId, { useMCP: true });
      if (Array.isArray(result)) {
        testCases = result;
      } else if (result && Array.isArray(result.tests)) {
        testCases = result.tests;
        warnings = result.warnings;
      } else {
        testCases = (ops || []).map((op: any, idx: number) => ({
          id: `tc-${idx}-${op.operationId}`,
          name: `Test ${op.operationId}`,
          operationId: op.operationId,
          expectedStatus: 200,
          payloadStrategy: 'none',
        }));
      }
    } catch (e) {
      testCases = (ops || []).map((op: any, idx: number) => ({
        id: `tc-${idx}-${op.operationId}`,
        name: `Test ${op.operationId}`,
        operationId: op.operationId,
        expectedStatus: 200,
        payloadStrategy: 'none',
      }));
    }
  } else {
    testCases = (ops || []).map((op: any, idx: number) => ({
      id: `tc-${idx}-${op.operationId}`,
      name: `Test ${op.operationId}`,
      operationId: op.operationId,
      expectedStatus: 200,
      payloadStrategy: 'none',
    }));
  }

  const runId = `run-${(crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(36)}`;

  const plan: RunPlan = {
    runId,
    specId,
    envName: env.name,
    operations: ops,
    testCases,
    createdAt: new Date().toISOString(),
    ...(warnings ? { warnings } : {}),
  } as RunPlan;

  await runPlanRepository.save(plan as any);
  return plan;
}

export default planRun;
