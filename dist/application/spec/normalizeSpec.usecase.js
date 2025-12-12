"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSpec = normalizeSpec;
exports.normalizeSpec = normalizeSpec;
exports.normalizeSpec = normalizeSpec;
const crypto_1 = __importDefault(require("crypto"));
function makeOperationId(method, path, op) {
    if (op && op.operationId)
        return String(op.operationId);
    const cleaned = path.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_');
    return `${method.toUpperCase()}_${cleaned}`;
}
function extractParameters(pathParams, opParams) {
    const map = {};
    (pathParams || []).forEach((p) => { if (p && p.name)
        map[`${p.in}:${p.name}`] = p; });
    (opParams || []).forEach((p) => { if (p && p.name)
        map[`${p.in}:${p.name}`] = p; });
    return Object.values(map);
}
function extractResponses(resObj) {
    if (!resObj)
        return [];
    if (Array.isArray(resObj))
        return resObj;
    return Object.keys(resObj).map(status => ({ status, description: resObj[status]?.description, content: resObj[status]?.content || resObj[status] }));
}
async function normalizeSpec(raw, opts) {
    const id = opts?.id || `spec-${crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : Date.now().toString(36)}`;
    const info = raw?.info || {};
    const title = info.title || raw?.name || 'unnamed-spec';
    const version = info.version || raw?.version || (raw?.openapi ? raw.openapi : raw?.swagger);
    const servers = [];
    if (raw?.servers && Array.isArray(raw.servers)) {
        raw.servers.forEach((s) => { if (s && s.url)
            servers.push(s.url); });
    }
    else if (raw?.host) {
        const scheme = (raw.schemes && raw.schemes[0]) || 'https';
        const base = `${scheme}://${raw.host}${raw.basePath || ''}`;
        servers.push(base);
    }
    const tags = [];
    if (Array.isArray(raw?.tags)) {
        raw.tags.forEach((t) => { if (t && (t.name || t))
            tags.push(t.name || t); });
    }
    const operations = [];
    const paths = raw?.paths || {};
    Object.keys(paths).forEach((pathKey) => {
        const pathItem = paths[pathKey] || {};
        const pathParams = pathItem.parameters || [];
        ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].forEach((method) => {
            const op = pathItem[method];
            if (!op)
                return;
            const params = extractParameters(pathParams, op.parameters || []);
            const operationId = makeOperationId(method, pathKey, op);
            const opTags = op.tags || op.tag || [];
            const requestBody = op.requestBody || (op.parameters ? op.parameters.find((p) => p.in === 'body' || p.name === 'body') : undefined) || null;
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
            });
        });
    });
    const normalized = {
        id,
        title,
        version: String(version || ''),
        servers,
        tags,
        operationCount: operations.length,
        operations,
        raw,
    };
    return normalized;
}
exports.default = normalizeSpec;
function makeOperationId(method, path, op) {
    if (op && op.operationId)
        return String(op.operationId);
    const cleaned = path.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_');
    return `${method.toUpperCase()}_${cleaned}`;
}
function extractParameters(pathParams, opParams) {
    const map = {};
    (pathParams || []).forEach((p) => map[`${p.in}:${p.name}`] = p);
    (opParams || []).forEach((p) => map[`${p.in}:${p.name}`] = p);
    return Object.values(map);
}
function extractResponses(resObj) {
    if (!resObj)
        return [];
    if (Array.isArray(resObj))
        return resObj;
    // OpenAPI 3.x and Swagger 2.0 responses are objects keyed by status
    return Object.keys(resObj).map(status => ({ status, description: resObj[status]?.description, content: resObj[status]?.content || resObj[status] }));
}
async function normalizeSpec(raw, opts) {
    // Pure transformation of the raw OpenAPI/Swagger spec into NormalizedSpec
    const id = opts?.id || `spec-${crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : Date.now().toString(36)}`;
    const info = raw?.info || {};
    const title = info.title || raw?.name || 'unnamed-spec';
    const version = info.version || raw?.version || (raw?.openapi ? raw.openapi : raw?.swagger);
    // servers
    const servers = [];
    if (raw?.servers && Array.isArray(raw.servers)) {
        raw.servers.forEach((s) => { if (s && s.url)
            servers.push(s.url); });
    }
    else if (raw?.host) {
        const scheme = (raw.schemes && raw.schemes[0]) || 'https';
        const base = `${scheme}://${raw.host}${raw.basePath || ''}`;
        servers.push(base);
    }
    else if (raw?.x_server) {
        servers.push(raw.x_server);
    }
    // tags
    const tags = [];
    if (Array.isArray(raw?.tags)) {
        raw.tags.forEach((t) => { if (t && (t.name || t))
            tags.push(t.name || t); });
    }
    const operations = [];
    const paths = raw?.paths || {};
    Object.keys(paths).forEach((pathKey) => {
        const pathItem = paths[pathKey] || {};
        // path-level parameters
        const pathParams = pathItem.parameters || [];
        ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].forEach((method) => {
            const op = pathItem[method];
            if (!op)
                return;
            const params = extractParameters(pathParams, op.parameters || []);
            const operationId = makeOperationId(method, pathKey, op);
            const opTags = op.tags || op.tag || [];
            const requestBody = op.requestBody || (op.parameters ? op.parameters.find((p) => p.in === 'body' || p.name === 'body') : undefined) || null;
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
            });
        });
    });
    const normalized = {
        id,
        title,
        version: String(version || ''),
        servers,
        tags,
        operationCount: operations.length,
        operations,
        raw,
    };
    return normalized;
}
exports.default = { normalizeSpec };
function ensureId(provided) {
    if (provided)
        return provided;
    // prefer crypto.randomUUID when available
    // @ts-ignore
    if (crypto_1.default && crypto_1.default.randomUUID)
        return `spec-${crypto_1.default.randomUUID()}`;
    return `spec-${Date.now().toString(36)}`;
}
function extractServers(raw) {
    if (!raw)
        return [];
    // OpenAPI 3.x
    if (Array.isArray(raw.servers) && raw.servers.length > 0) {
        return raw.servers.map((s) => s.url).filter(Boolean);
    }
    // Swagger 2.0
    if (raw.swagger && raw.swagger.startsWith('2')) {
        const host = raw.host || '';
        const basePath = raw.basePath || '';
        const schemes = raw.schemes && raw.schemes.length ? raw.schemes : ['https'];
        const urls = [];
        schemes.forEach((scheme) => {
            const h = host ? `${scheme}://${host}` : '';
            urls.push(`${h}${basePath}`);
        });
        return urls.filter(Boolean);
    }
    return [];
}
function extractTags(raw) {
    if (!raw)
        return [];
    if (Array.isArray(raw.tags))
        return raw.tags.map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
    return [];
}
function normalizeOperation(path, method, op, pathParams) {
    const parameters = [];
    if (Array.isArray(pathParams))
        parameters.push(...pathParams);
    if (Array.isArray(op.parameters))
        parameters.push(...op.parameters);
    // For OpenAPI 3.x requestBody handling
    const requestBody = op.requestBody || (op.parameters && op.parameters.find((p) => p.in === 'body')) || null;
    const responses = [];
    if (op.responses) {
        for (const [status, resp] of Object.entries(op.responses)) {
            responses.push({ status, ...resp });
        }
    }
    const operationId = op.operationId || `${method.toUpperCase()} ${path}`;
    const security = op.security || null;
    const normalized = {
        operationId: String(operationId),
        method: method.toUpperCase(),
        path,
        summary: op.summary || op.description || undefined,
        description: op.description,
        tags: Array.isArray(op.tags) ? op.tags : [],
        parameters: parameters.map((p) => ({ name: p.name, in: p.in, required: !!p.required, schema: p.schema || p.type ? { type: p.type } : undefined, description: p.description })),
        requestBody,
        responses,
        security,
    };
    return normalized;
}
async function normalizeSpec(raw, providedId) {
    const id = ensureId(providedId);
    const info = raw && (raw.info || raw.openapi?.info) ? (raw.info || raw.openapi?.info) : raw.info || {};
    const title = (info && info.title) || raw.info?.title || `spec-${id}`;
    const version = (info && (info.version || info.openapi)) || raw.version;
    const servers = extractServers(raw);
    const tags = extractTags(raw);
    const operations = [];
    const paths = raw.paths || {};
    for (const [p, methods] of Object.entries(paths)) {
        const pathItem = methods;
        const pathParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];
        for (const [m, op] of Object.entries(pathItem)) {
            const method = m.toLowerCase();
            if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
                const normalizedOp = normalizeOperation(p, method, op, pathParams);
                operations.push(normalizedOp);
            }
        }
    }
    const normalized = {
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
exports.default = normalizeSpec;
