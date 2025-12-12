import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { Operation } from '../../domain/models/Operation';
import crypto from 'crypto';

type RawSpec = any;

function makeOperationId(method: string, path: string, op: any): string {
  if (op && op.operationId) return String(op.operationId);
  const cleaned = path.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_');
  return `${method.toUpperCase()}_${cleaned}`;
}

function extractParameters(pathParams: any[], opParams: any[]): any[] {
  const map: Record<string, any> = {};
  (pathParams || []).forEach((p: any) => { if (p && p.name) map[`${p.in}:${p.name}`] = p; });
  (opParams || []).forEach((p: any) => { if (p && p.name) map[`${p.in}:${p.name}`] = p; });
  return Object.values(map);
}

function extractResponses(resObj: any): Array<any> {
  if (!resObj) return [];
  if (Array.isArray(resObj)) return resObj;
  return Object.keys(resObj).map(status => ({ status, description: resObj[status]?.description, content: resObj[status]?.content || resObj[status] }));
}

export async function normalizeSpec(raw: RawSpec, opts?: { id?: string }): Promise<NormalizedSpec> {
  const id = opts?.id || `spec-${(crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(36)}`;
  const info = raw?.info || {};
  const title = info.title || raw?.name || 'unnamed-spec';
  const version = info.version || raw?.version || (raw?.openapi ? raw.openapi : raw?.swagger);

  const servers: string[] = [];
  if (raw?.servers && Array.isArray(raw.servers)) {
    raw.servers.forEach((s: any) => { if (s && s.url) servers.push(s.url); });
  } else if (raw?.host) {
    const scheme = (raw.schemes && raw.schemes[0]) || 'https';
    const base = `${scheme}://${raw.host}${raw.basePath || ''}`;
    servers.push(base);
  }

  const tags: string[] = [];
  if (Array.isArray(raw?.tags)) {
    raw.tags.forEach((t: any) => { if (t && (t.name || t)) tags.push(t.name || t); });
  }

  const operations: Operation[] = [];
  const paths = raw?.paths || {};
  Object.keys(paths).forEach((pathKey) => {
    const pathItem = paths[pathKey] || {};
    const pathParams = pathItem.parameters || [];
    ['get','post','put','delete','patch','options','head'].forEach((method) => {
      const op = pathItem[method];
      if (!op) return;
      const params = extractParameters(pathParams, op.parameters || []);
      const operationId = makeOperationId(method, pathKey, op);
      const opTags = op.tags || op.tag || [];
      const requestBody = op.requestBody || (op.parameters ? op.parameters.find((p: any) => p.in === 'body' || p.name === 'body') : undefined) || null;
      const responses = extractResponses(op.responses || {});

      operations.push({
        operationId,
        method: method.toUpperCase(),
        path: pathKey,
        summary: op.summary || op.description || '',
        description: op.description || '',
        tags: Array.isArray(opTags) ? opTags : [opTags].filter(Boolean),
        parameters: params,
        requestBody,
        responses,
        security: op.security || raw.security || [],
      } as Operation);
    });
  });

  const normalized: NormalizedSpec = {
    id,
    title,
    version: String(version || ''),
    servers,
    tags,
    operationCount: operations.length,
    operations,
    raw,
  } as NormalizedSpec;

  return normalized;
}

export default normalizeSpec;
