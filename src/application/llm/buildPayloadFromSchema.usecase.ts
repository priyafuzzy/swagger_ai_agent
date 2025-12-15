import { specRepository } from '../../infrastructure/persistence';
import PayloadBuilderLlmClient from '../../infrastructure/llm/PayloadBuilderLlmClient';
import { examplePayloadForOperation } from '../execution/payloadTemplates';

export type BuildPayloadOpts = {
  mode?: 'schema-only' | 'schema-with-llm' | 'prefer-example';
  hints?: Record<string, any>;
  clientName?: string;
};

/**
 * Build example payload(s) for an operation by schema, optionally using an LLM when schema-derived
 * values are incomplete. Returns `null` when no schema or example can be derived.
 */
export async function buildPayloadFromSchemaUsecase(specId: string, operationId: string, opts: BuildPayloadOpts = {}): Promise<any> {
  const mode = opts.mode || 'schema-with-llm';
  const hints = opts.hints || {};

  if (!specId) throw new Error('specId is required');
  if (!operationId) throw new Error('operationId is required');

  const spec = await specRepository.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);

  const op = (spec.operations || []).find((o: any) => o.operationId === operationId || `${o.method}_${o.path}` === operationId);
  if (!op) throw new Error(`Operation not found: ${operationId}`);

  // 1) Prefer explicit examples if requested
  if (mode === 'prefer-example') {
    const ex = examplePayloadForOperation(op);
    if (ex) return ex;
  }

  // 2) Try to find request body schema (OpenAPI 3.x) or body parameter (Swagger 2.0)
  let schema: any = null;
  try {
    const rb = (op as any).requestBody;
    if (rb && rb.content) {
      const first = Object.values(rb.content)[0] as any;
      schema = first && (first.schema || first);
    }
    if (!schema && Array.isArray((op as any).parameters)) {
      const bodyParam = (op as any).parameters.find((p: any) => p.in === 'body' || p.name === 'body');
      if (bodyParam) schema = bodyParam.schema || bodyParam;
    }
  } catch (e) {
    // ignore
  }

  // 3) If no schema, but an example exists, return it
  const example = examplePayloadForOperation(op);
  if (!schema) return example || null;

  // 4) Build deterministic example from schema first
  const builder = new PayloadBuilderLlmClient({ clientName: opts.clientName || 'generator', useMCP: opts.mode !== 'schema-only' });
  const deterministic = builder['simpleBuild'] ? (builder as any).simpleBuild(schema) : null;
  if (deterministic && !builder['requiresLLM']?.(schema, deterministic)) return deterministic;

  // 5) If mode allows LLM, call builder to refine
  if (mode === 'schema-with-llm') {
    const llmPayload = await builder.buildPayloadFromSchema(schema, hints);
    if (llmPayload) return llmPayload;
  }

  // 6) fallback to example or deterministic
  return example || deterministic || null;
}

export default { buildPayloadFromSchemaUsecase };
