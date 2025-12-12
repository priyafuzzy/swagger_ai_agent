"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
