"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSpec = importSpec;
exports.listSpecs = listSpecs;
const persistence_1 = require("../../infrastructure/persistence");
const crypto_1 = __importDefault(require("crypto"));
const normalizeSpec2_usecase_1 = require("../../application/spec/normalizeSpec2.usecase");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
async function fetchJsonFromUrl(url) {
    return new Promise((resolve, reject) => {
        try {
            const client = url.startsWith('https') ? https_1.default : http_1.default;
            const req = client.get(url, (res) => {
                const { statusCode } = res;
                if (statusCode && statusCode >= 400) {
                    reject(new Error(`Request failed with status ${statusCode}`));
                    res.resume();
                    return;
                }
                let raw = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => raw += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(raw);
                        resolve(parsed);
                    }
                    catch (err) {
                        // if not JSON, return raw
                        resolve(raw);
                    }
                });
            });
            req.on('error', (err) => reject(err));
        }
        catch (err) {
            reject(err);
        }
    });
}
async function importSpec(req, res, next) {
    try {
        // Accept either a raw spec in `body.raw` / `body.spec`, a `source` object, or the whole body.
        let raw = req.body?.raw || req.body?.spec || null;
        const source = req.body?.source || null;
        if (!raw)
            raw = req.body || {};
        // If a URL source is provided, fetch it
        if (source && source.type === 'url' && source.url) {
            try {
                const fetched = await fetchJsonFromUrl(source.url);
                if (fetched)
                    raw = fetched;
            }
            catch (err) {
                // propagate fetch error
                return next(err);
            }
        }
        const id = `spec-${crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : Date.now().toString(36)}`;
        let spec;
        if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
            // Use the normalization use-case to produce a NormalizedSpec
            spec = await (0, normalizeSpec2_usecase_1.normalizeSpec)(raw, { id });
        }
        else {
            // Fallback stub for empty input
            spec = {
                id,
                title: `imported-${id}`,
                version: '0.0.1',
                servers: [],
                tags: [],
                operationCount: 0,
                operations: [],
                raw: { source: raw },
            };
        }
        await persistence_1.specRepository.save(spec);
        res.json({ specId: spec.id, title: spec.title, version: spec.version, operationCount: spec.operationCount });
    }
    catch (err) {
        next(err);
    }
}
async function listSpecs(req, res, next) {
    try {
        const list = await persistence_1.specRepository.list();
        res.json({ count: list.length, specs: list });
    }
    catch (err) {
        next(err);
    }
}
exports.default = { importSpec, listSpecs };
