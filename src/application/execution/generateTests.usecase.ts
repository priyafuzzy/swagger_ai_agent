import { v4 as uuidv4 } from 'uuid';
import { Operation } from '../../domain/models/Operation';
import { TestCaseDefinition } from '../../domain/models/RunPlan';
import { specRepository } from '../../infrastructure/persistence';
import { getCompatibilityClient } from '../../infrastructure/mcp/FactoryAdapter';
import Ajv from 'ajv';
import { testCasesArraySchema } from './llmSchema';
import { examplePayloadForOperation } from './payloadTemplates';

export function generateTestsForOperations(operations: Operation[]): TestCaseDefinition[] {
  const tests: TestCaseDefinition[] = [];
  operations.forEach((op, idx) => {
    const baseId = `tc-${idx}-${op.method}_${op.path.replace(/[^a-zA-Z0-9_]/g, '_')}`;

    // Happy-path test
    tests.push({
      id: `${baseId}-happy`,
      operationId: op.operationId || `${op.method}_${op.path}`,
      name: `happy: ${op.method.toUpperCase()} ${op.path}`,
      expectedStatus: guessSuccessStatus(op),
      payloadStrategy: examplePayloadForOperation(op) ? 'example' : 'none',
    });

    // Negative / validation test (expect 400)
    tests.push({
      id: `${baseId}-negative`,
      operationId: op.operationId || `${op.method}_${op.path}`,
      name: `negative: ${op.method.toUpperCase()} ${op.path}`,
      expectedStatus: 400,
      payloadStrategy: 'none',
    });

    // Auth test (if security present)
    if (op.security && (op.security as any).length > 0) {
      tests.push({
        id: `${baseId}-auth`,
        operationId: op.operationId || `${op.method}_${op.path}`,
        name: `auth: ${op.method.toUpperCase()} ${op.path}`,
        expectedStatus: 401,
        payloadStrategy: examplePayloadForOperation(op) ? 'example' : 'none',
      });
    }
  });
  return tests;
}

export type GenerateTestsOptions = { useMCP?: boolean; mcpClient?: any };

export async function generateTestsForSpec(specId: string, opts: GenerateTestsOptions = {}): Promise<{ tests: TestCaseDefinition[]; warnings?: string[] } | TestCaseDefinition[]> {
  const spec = await specRepository.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);
  const ops: Operation[] = spec.operations || [];

  const useMCP = opts.useMCP || process.env.GENERATE_WITH_MCP === 'true';
  if (useMCP) {
    const client = opts.mcpClient || getCompatibilityClient('generator');
      try {
      await client.connect();
      const prompt = `You are an assistant that outputs a JSON array of test case objects. For each operation provide an object with keys: operationId, id (optional), name, expectedStatus (number), payloadStrategy(one of example|schema|llm|none). Input operations: ${JSON.stringify(
        ops.map((o) => ({ path: o.path, method: o.method, operationId: o.operationId }))
      )}. Output ONLY valid JSON array.`;
      const resp = await client.executeTool('text_generation', { prompt });
      const text = (resp.data && typeof resp.data === 'string') ? resp.data : JSON.stringify(resp.data || resp);
      let parsed: any;
        parsed = JSON.parse(text);
      } catch (e) {
        // invalid JSON — fallback
        parsed = null;
        const warn = `LLM returned invalid JSON; falling back to deterministic generation`;
        // return fallback below with warning
        const fallback = generateTestsForOperations(ops);
        return { tests: fallback, warnings: [warn] };
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Cross-validate operationId against known operations in the spec
        const knownOps = new Set(ops.map((o) => o.operationId));
        const filtered = parsed.filter((p: any) => p && typeof p.operationId === 'string' && knownOps.has(p.operationId));
        const rejected = parsed
          .map((p: any) => (p && p.operationId ? p.operationId : null))
          .filter((id: any) => id && !knownOps.has(id));
        if (filtered.length === 0) {
          // no valid operationIds returned by LLM — treat as failure and fall back
          const warn = `LLM returned no operationIds that match the spec; falling back to deterministic generation`;
          const fallback = generateTestsForOperations(ops);
          return { tests: fallback, warnings: rejected.length ? [warn, `Rejected operationIds: ${Array.from(new Set(rejected)).join(',')}`] : [warn] };
        } else {
          const ajv = new Ajv();
          const validate = ajv.compile(testCasesArraySchema as any);
          const valid = validate(filtered);
          if (valid) {
            const tests = filtered.map((p: any) => ({
              id: p.id || `tc-llm-${Math.random().toString(36).slice(2, 8)}`,
              operationId: p.operationId,
              name: p.name || `${p.operationId}`,
              expectedStatus: p.expectedStatus || 200,
              payloadStrategy: p.payloadStrategy || 'none',
            }));
            const warnings: string[] = [];
            if (rejected.length) warnings.push(`Filtered out unknown operationIds: ${Array.from(new Set(rejected)).join(',')}`);
            return { tests, warnings: warnings.length ? warnings : undefined };
          }
        }
      }
    } catch (e) {
      // fall back to deterministic generator below
    }
  }

  return generateTestsForOperations(ops);
}

function guessSuccessStatus(op: Operation): number {
  // Choose first 2xx response if present, otherwise 200
  try {
    const responses = op.responses || [];
    for (const r of responses) {
      const s = Number(r.status);
      if (!isNaN(s) && s >= 200 && s < 300) return s;
    }
  } catch (e) {
    // ignore
  }
  return 200;
}

export default { generateTestsForOperations, generateTestsForSpec };
