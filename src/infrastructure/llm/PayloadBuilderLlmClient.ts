import logger from '../logging/Logger';
import { getCompatibilityClient } from '../mcp/FactoryAdapter';

export interface PayloadBuilderOptions {
  clientName?: string;
  useMCP?: boolean;
}

export class PayloadBuilderLlmClient {
  private clientName: string;
  private useMCP: boolean;

  constructor(opts?: PayloadBuilderOptions) {
    this.clientName = opts?.clientName || 'generator';
    this.useMCP = typeof opts?.useMCP === 'boolean' ? opts!.useMCP! : true;
  }

  // Public method: try to build an example payload for a given JSON Schema-like object
  async buildPayloadFromSchema(schema: any, hints?: Record<string, any>): Promise<any> {
    // First attempt a deterministic build from the schema itself
    try {
      const simple = this.simpleBuild(schema);
      // If the deterministic build looks complete, return it
      if (simple !== null && !this.requiresLLM(schema, simple)) return simple;
    } catch (e) {
      logger.warn('[PayloadBuilderLlmClient] simple build failed: ' + String(e));
    }

    // If allowed, ask the compatibility MCP client (LLM) to produce a payload
    if (this.useMCP) {
      try {
        const client = getCompatibilityClient(this.clientName);
        await client.connect();
        const prompt = this.makePrompt(schema, hints);
        const resp = await client.executeTool('text_generation', { prompt });
        const raw = resp && (resp.data ?? resp) as any;
        const text = typeof raw === 'string' ? raw : (raw && raw.text) || JSON.stringify(raw);
        try {
          const parsed = JSON.parse(text);
          return parsed;
        } catch (e) {
          // Try to extract JSON block in text
          const m = text && text.match(/\{[\s\S]*\}/);
          if (m) {
            try {
              return JSON.parse(m[0]);
            } catch (_) {
              logger.warn('[PayloadBuilderLlmClient] could not parse LLM output as JSON');
            }
          }
          logger.warn('[PayloadBuilderLlmClient] LLM returned non-JSON payload');
        }
      } catch (err: any) {
        logger.warn('[PayloadBuilderLlmClient] MCP/LLM call failed: ' + String(err?.message || err));
      }
    }

    // Fallback: return minimal deterministic payload (may be null)
    return this.simpleBuild(schema);
  }

  // Build a minimal payload from a JSON-schema-like object deterministically
  private simpleBuild(schema: any): any {
    if (!schema) return null;
    const t = schema.type || (schema.properties ? 'object' : undefined);
    if (!t) return null;
    if (t === 'string') return schema.example ?? schema.default ?? 'string_example';
    if (t === 'integer' || t === 'number') return schema.example ?? schema.default ?? 1;
    if (t === 'boolean') return schema.example ?? schema.default ?? false;
    if (t === 'array') {
      const items = schema.items ? this.simpleBuild(schema.items) : null;
      return items === null ? [] : [items];
    }
    if (t === 'object' || schema.properties) {
      const out: Record<string, any> = {};
      const props = schema.properties || {};
      for (const [k, v] of Object.entries(props)) {
        out[k] = this.simpleBuild(v as any);
      }
      return out;
    }
    return null;
  }

  // Heuristic to decide whether schema needs LLM assistance (e.g., required fields missing or many nulls)
  private requiresLLM(schema: any, built: any): boolean {
    if (!schema || !built) return true;
    if (!schema.properties) return false;
    const required: string[] = Array.isArray(schema.required) ? schema.required : [];
    for (const r of required) {
      if (built[r] === null || built[r] === undefined) return true;
    }
    // if more than half of properties are null-ish, prefer LLM
    const props = Object.keys(schema.properties || {});
    if (!props.length) return false;
    const nullCount = props.reduce((acc, p) => (built[p] === null || built[p] === undefined ? acc + 1 : acc), 0);
    return nullCount > props.length / 2;
  }

  // Create a clear prompt for the LLM to produce a JSON example matching the schema
  private makePrompt(schema: any, hints?: Record<string, any>): string {
    const brief = (hints && hints.domain) ? `Domain: ${hints.domain}. ` : '';
    const locale = (hints && hints.locale) ? `Locale: ${hints.locale}. ` : '';
    const schemaStr = JSON.stringify(schema, null, 2);
    return `You are given a JSON Schema. Produce a single example JSON object that conforms to the schema. ${brief}${locale}Output ONLY the JSON object without commentary. Schema:\n${schemaStr}`;
  }
}

export default PayloadBuilderLlmClient;
