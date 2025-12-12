"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOperation = executeOperation;
const axios_1 = __importDefault(require("axios"));
function buildUrl(base, path, pathParams, query) {
    let url = (base || '').replace(/\/$/, '') + path;
    if (pathParams) {
        Object.keys(pathParams).forEach((k) => {
            url = url.replace(new RegExp(`\\{${k}\\}`, 'g'), encodeURIComponent(String(pathParams[k])));
        });
    }
    // append query
    if (query && Object.keys(query).length > 0) {
        const qs = Object.keys(query).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`).join('&');
        url += (url.includes('?') ? '&' : '?') + qs;
    }
    return url;
}
async function executeOperation(spec, operation, env, overrides) {
    const start = Date.now();
    try {
        const pathParams = (overrides && overrides.pathParams) || {};
        const query = (overrides && overrides.query) || {};
        const headers = Object.assign({}, env?.defaultHeaders || {}, overrides?.headers || {});
        const body = overrides?.body || null;
        const url = buildUrl(env.baseUrl || '', operation.path, pathParams, query);
        const config = {
            url,
            method: (operation.method || 'GET').toLowerCase(),
            headers,
            data: body,
            validateStatus: () => true,
            timeout: 15000,
        };
        const resp = await axios_1.default.request(config);
        const durationMs = Date.now() - start;
        return {
            httpStatus: resp.status,
            request: { url, method: config.method, headers, body },
            response: { status: resp.status, headers: resp.headers, data: resp.data },
            durationMs,
        };
    }
    catch (err) {
        const durationMs = Date.now() - start;
        return {
            httpStatus: err?.response?.status,
            request: null,
            response: null,
            durationMs,
        };
    }
}
exports.default = { executeOperation };
