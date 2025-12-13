import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { Operation } from '../../domain/models/Operation';

// Very small normalizer; extracts basic operation metadata from paths.
export function normalize(raw: any, opts?: { id?: string }): NormalizedSpec {
  const id = opts?.id || `spec-${Date.now().toString(36)}`;
  const title = raw?.info?.title || raw?.name || 'unnamed-spec';
  const version = raw?.info?.version || raw?.version || '';
  const servers = raw?.servers ? raw.servers.map((s: any) => s.url || String(s)) : [];
  const tags = Array.isArray(raw?.tags) ? raw.tags.map((t: any) => (t && t.name) ? t.name : String(t)) : [];

  const operations: Operation[] = [];
  try {
    const paths = raw?.paths || {};
    for (const p of Object.keys(paths)) {
      const methods = paths[p] || {};
      for (const m of Object.keys(methods)) {
        const op = (methods as any)[m];
        const operationId = (op && op.operationId) || `${m}_${p}`;
        const operation: Operation = {
          operationId,
          method: m,
          path: p,
          summary: op?.summary || op?.description || '',
          description: op?.description || undefined,
          parameters: op?.parameters || [],
          requestBody: op?.requestBody || undefined,
          responses: op?.responses ? Object.keys(op.responses).map((s) => ({ status: s, description: op.responses[s]?.description })) : [],
          tags: op?.tags || [],
        } as Operation;
        operations.push(operation);
      }
    }
  } catch (e) {
    // ignore extraction errors
  }

  const normalized: NormalizedSpec = {
    id,
    title,
    version,
    servers,
    tags,
    operationCount: operations.length,
    operations,
    raw,
  };

  return normalized;
}

export default { normalize };
