import { Request, Response, NextFunction } from 'express';
import { planRun } from '../../application/execution/planRun.usecase';
import { executeRun } from '../../application/execution/executeRun.usecase';
import { generateTestsForSpec } from '../../application/execution/generateTests.usecase';
import { runReportRepository } from '../../infrastructure/persistence';

export async function planRunHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, envName, selection } = req.body;
    const { useMCP } = req.body;
    const plan = await planRun({ specId, envName, selection, useMCP });
    const payload: any = { runId: plan.runId, specId: plan.specId, envName: plan.envName, operationCount: (plan.operations || []).length, testCount: (plan.testCases || []).length };
    if ((plan as any).warnings) payload.warnings = (plan as any).warnings;
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function runHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { runId, specId, envName, selection } = req.body;
    const report = await executeRun({ runId, specId, envName, selection });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function generateTestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId } = req.body;
    if (!specId) return res.status(400).json({ error: 'specId is required' });
    const tests = await generateTestsForSpec(specId);
    res.json({ specId, testCount: tests.length, testCases: tests });
  } catch (err) {
    next(err);
  }
}

export async function getRunStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const runId = req.params.runId;
    const report = await runReportRepository.getByRunId(runId);
    if (!report) return res.status(404).json({ error: 'Run report not found' });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export default { planRunHandler, runHandler, getRunStatus, generateTestsHandler };
