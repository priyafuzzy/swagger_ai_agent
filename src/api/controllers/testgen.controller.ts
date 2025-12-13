import { Request, Response, NextFunction } from 'express';
import { generateAxiosTestsUsecase } from '../../application/testgen/generateAxiosTests.usecase';

function toAxiosJestCode(specId: string, tests: any[]) {
  // Simple code generator: create an Axios + Jest test stub per test case
  const lines: string[] = [];
  lines.push("const axios = require('axios');");
  lines.push("describe('Generated tests for spec: " + specId + "', () => {");
  tests.forEach((t: any) => {
    lines.push(`  test('${t.name}', async () => {`);
    lines.push("    // TODO: fill request details based on operationId/payloadStrategy");
    lines.push("    const res = await axios.get('http://example.invalid/');");
    lines.push("    expect(res.status).toBe(" + (t.expectedStatus || 200) + ");");
    lines.push('  });');
  });
  lines.push('});');
  return lines.join('\n');
}

export async function generateAxiosTestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, selection, options } = req.body;
    if (!specId) return res.status(400).json({ error: 'specId is required' });
    const result: any = await generateAxiosTestsUsecase(specId, { useMCP: options && options.useMCP });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export default { generateAxiosTestsHandler };
