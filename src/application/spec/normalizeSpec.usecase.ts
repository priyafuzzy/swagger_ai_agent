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
  (pathParams || []).forEach((p: any) => map[`${p.in}:${p.name}`] = p);
  (opParams || []).forEach((p: any) => map[`${p.in}:${p.name}`] = p);
  return Object.values(map);
}

function extractResponses(resObj: any): Array<any> {
  if (!resObj) return [];
  if (Array.isArray(resObj)) return resObj;
  // OpenAPI 3.x and Swagger 2.0 responses are objects keyed by status
  return Object.keys(resObj).map(status => ({ status, description: resObj[status]?.description, content: resObj[status]?.content || resObj[status] }));
}

export async function normalizeSpec(raw: RawSpec, opts?: { id?: string }): Promise<NormalizedSpec> {
  // Pure transformation of the raw OpenAPI/Swagger spec into NormalizedSpec
  const id = opts?.id || `spec-${(crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(36)}`;
  const info = raw?.info || {};
  const title = info.title || raw?.name || 'unnamed-spec';
  const version = info.version || raw?.version || (raw?.openapi ? raw.openapi : raw?.swagger);

  // servers
  const servers: string[] = [];
  if (raw?.servers && Array.isArray(raw.servers)) {
    raw.servers.forEach((s: any) => { if (s && s.url) servers.push(s.url); });
  } else if (raw?.host) {
    const scheme = (raw.schemes && raw.schemes[0]) || 'https';
    const base = `${scheme}://${raw.host}${raw.basePath || ''}`;
    servers.push(base);
  } else if (raw?.x_server) {
    servers.push(raw.x_server);
  }

  // tags
  const tags: string[] = [];
  if (Array.isArray(raw?.tags)) {
    raw.tags.forEach((t: any) => { if (t && (t.name || t)) tags.push(t.name || t); });
  }

  const operations: Operation[] = [];
  const paths = raw?.paths || {};
  Object.keys(paths).forEach((pathKey) => {
    const pathItem = paths[pathKey] || {};
    // path-level parameters
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

export default { normalizeSpec };
import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { Operation } from '../../domain/models/Operation';
import crypto from 'crypto';

type RawSpec = any;

function ensureId(provided?: string) {
  if (provided) return provided;
  // prefer crypto.randomUUID when available
  // @ts-ignore
  if (crypto && (crypto as any).randomUUID) return `spec-${(crypto as any).randomUUID()}`;
  return `spec-${Date.now().toString(36)}`;
}

function extractServers(raw: RawSpec): string[] {
  if (!raw) return [];
  // OpenAPI 3.x
  if (Array.isArray(raw.servers) && raw.servers.length > 0) {
    return raw.servers.map((s: any) => s.url).filter(Boolean);
  }
  // Swagger 2.0
  if (raw.swagger && raw.swagger.startsWith('2')) {
    const host = raw.host || '';
    const basePath = raw.basePath || '';
    const schemes = raw.schemes && raw.schemes.length ? raw.schemes : ['https'];
    const urls: string[] = [];
    schemes.forEach((scheme: string) => {
      const h = host ? `${scheme}://${host}` : '';
      urls.push(`${h}${basePath}`);
    });
    return urls.filter(Boolean);
  }
  return [];
}

function extractTags(raw: RawSpec): string[] {
  if (!raw) return [];
  if (Array.isArray(raw.tags)) return raw.tags.map((t: any) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
  return [];
}

function normalizeOperation(path: string, method: string, op: any, pathParams?: any[]): Operation {
  const parameters: any[] = [];
  if (Array.isArray(pathParams)) parameters.push(...pathParams);
  if (Array.isArray(op.parameters)) parameters.push(...op.parameters);

  // For OpenAPI 3.x requestBody handling
  const requestBody = op.requestBody || (op.parameters && op.parameters.find((p: any) => p.in === 'body')) || null;

  const responses: any[] = [];
  if (op.responses) {
    for (const [status, resp] of Object.entries(op.responses)) {
      responses.push({ status, ...(resp as any) });
    }
  }

  const operationId = op.operationId || `${method.toUpperCase()} ${path}`;

  const security = op.security || null;

  const normalized: Operation = {
    operationId: String(operationId),
    method: method.toUpperCase(),
    path,
    summary: op.summary || op.description || undefined,
    description: op.description,
    tags: Array.isArray(op.tags) ? op.tags : [],
    parameters: parameters.map((p: any) => ({ name: p.name, in: p.in, required: !!p.required, schema: p.schema || p.type ? { type: p.type } : undefined, description: p.description })),
    requestBody,
    responses,
    security,
  };

  return normalized;
}

export async function normalizeSpec(raw: RawSpec, providedId?: string): Promise<NormalizedSpec> {
  const id = ensureId(providedId);

  const info = raw && (raw.info || raw.openapi?.info) ? (raw.info || raw.openapi?.info) : raw.info || {};
  const title = (info && info.title) || raw.info?.title || `spec-${id}`;
  const version = (info && (info.version || info.openapi)) || raw.version;

  const servers = extractServers(raw);
  const tags = extractTags(raw);

  const operations: Operation[] = [];

  const paths = raw.paths || {};
  for (const [p, methods] of Object.entries(paths)) {
    const pathItem = methods as any;
    const pathParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];
    for (const [m, op] of Object.entries(pathItem)) {
      const method = m.toLowerCase();
      if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        const normalizedOp = normalizeOperation(p, method, op, pathParams);
        operations.push(normalizedOp);
      }
    }
  }

  const normalized: NormalizedSpec = {
    id,
    title,
    version: typeof version === 'string' ? version : undefined,
    servers,
    tags,
    operationCount: operations.length,
    operations,
    raw,
  };

  return normalized;
}

export default normalizeSpec;
