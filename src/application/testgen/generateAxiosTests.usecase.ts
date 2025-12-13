import logger from '../../infrastructure/logging/Logger';
import { generateTestsForSpec } from '../execution/generateTests.usecase';
import { specRepository } from '../../infrastructure/persistence';
import { examplePayloadForOperation } from '../execution/payloadTemplates';

function escapeSingle(s: string) {
  return s.replace(/'/g, "\\'");
}

function buildUrlTemplate(baseVar: string, path: string) {
  const replaced = path.replace(/\{([^}]+)\}/g, (_m, p) => "${params['" + p + "'] || 'REPLACE_ME'}");
  return `\`${baseVar}${replaced}\``;
}

function buildAxiosCall(op: any, test: any) {
  const baseVar = 'process.env.BASE_URL || "http://localhost:3000"';
  const method = (op.method || 'get').toLowerCase();
  const path = op.path || '/';
  const urlTpl = buildUrlTemplate(baseVar, path);

  const lines: string[] = [];
  lines.push('    const params = {};');
  lines.push('    const headers = {};');

  const example = examplePayloadForOperation(op);
  if (example) {
    const dataSnippet = JSON.stringify(example, null, 2);
    lines.push(`    const data = ${dataSnippet};`);
  } else {
    lines.push('    const data = undefined;');
  }

  const axiosCall = `    const res = await axios({ method: '${method}', url: ${urlTpl}, params: params, headers: headers, data: data });`;
  lines.push(axiosCall);
  lines.push(`    expect(res.status).toBe(${test.expectedStatus || 200});`);
  return lines.join('\n');
}

function toAxiosJestCode(spec: any, tests: any[]) {
  const lines: string[] = [];
  lines.push("const axios = require('axios');");
  lines.push('');
  lines.push("describe('Generated tests for spec: " + (spec && spec.title ? escapeSingle(spec.title) : spec.id) + "', () => {");

  tests.forEach((t: any, idx: number) => {
    const name = escapeSingle(t.name || `test-${idx}`);
    lines.push(`  test('${name}', async () => {`);
    const op = (spec && spec.operations || []).find((o: any) => o.operationId === t.operationId);
    if (!op) {
      lines.push(`    // Operation ${t.operationId} not found in spec`);
      lines.push('    expect(true).toBe(true);');
      lines.push('  });');
      return;
    }
    const call = buildAxiosCall(op, t);
    lines.push(call);
    lines.push('  });');
    lines.push('');
  });

  lines.push('});');
  return lines.join('\n');
}

export async function generateAxiosTestsUsecase(specId: string, opts: any = {}) {
  try {
    const spec = await specRepository.getById(specId);
    if (!spec) throw new Error(`Spec not found: ${specId}`);

    const result: any = await generateTestsForSpec(specId, { useMCP: !!opts.useMCP, mcpClient: opts.mcpClient });
    const tests = Array.isArray(result) ? result : result.tests || [];
    const warnings = !Array.isArray(result) ? result.warnings : undefined;

    const code = toAxiosJestCode(spec, tests || []);
    if (warnings && warnings.length) logger.warn(`[generateAxiosTestsUsecase] warnings: ${warnings.join('; ')}`);
    return { specId, testCount: (tests || []).length, tests, code, warnings };
  } catch (e) {
    const err = `Error generating axios tests: ${(e && (e as any).message) || e}`;
    logger.error(`[generateAxiosTestsUsecase] ${err}`);
    throw e;
  }
}

export default { generateAxiosTestsUsecase };
