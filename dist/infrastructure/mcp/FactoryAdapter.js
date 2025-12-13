"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibilityMcpClient = void 0;
exports.getCompatibilityClient = getCompatibilityClient;
exports.resetCompatibilityClients = resetCompatibilityClients;
const MockMCPAdapter_1 = require("./MockMCPAdapter");
const SwaggerLoader_1 = __importDefault(require("../swagger/SwaggerLoader"));
const persistence_1 = require("../persistence");
const OpenApiNormalizer_1 = __importDefault(require("../swagger/OpenApiNormalizer"));
const validator_1 = __importDefault(require("../swagger/validator"));
// A thin compatibility client that wraps our MCPAdapter and exposes the IMcpClient subset.
class CompatibilityMcpClient {
    constructor(serverName, adapter) {
        this.status = 'disconnected';
        this.config = { serverName, serverType: 'compatibility' };
        this.adapter = adapter || new MockMCPAdapter_1.MockMCPAdapter();
    }
    async connect() {
        // adapter may not require connect; mark connected
        this.status = 'connected';
    }
    async disconnect() {
        this.status = 'disconnected';
    }
    async getAvailableTools() {
        // Provide default tools including text generation and swagger helpers
        return [
            { name: 'text_generation', description: 'Generate text from prompt', parameters: [{ name: 'prompt', type: 'string', description: 'User prompt', required: true }] },
            { name: 'swagger.fetch', description: 'Fetch and parse a remote Swagger/OpenAPI spec by URL', parameters: [{ name: 'url', type: 'string', description: 'Spec URL', required: true }] },
            { name: 'swagger.parse', description: 'Parse raw Swagger/OpenAPI content (JSON or YAML)', parameters: [{ name: 'content', type: 'string', description: 'Spec content', required: true }] },
            { name: 'swagger.listOperations', description: 'List operations from a normalized spec by id', parameters: [{ name: 'specId', type: 'string', description: 'Normalized spec id', required: true }] },
            { name: 'swagger.normalize', description: 'Normalize a raw OpenAPI/Swagger document and persist as a normalized spec', parameters: [{ name: 'specId', type: 'string', description: 'Optional id to assign', required: false }, { name: 'raw', type: 'object', description: 'Parsed spec object', required: false }, { name: 'content', type: 'string', description: 'Raw spec content (JSON/YAML)', required: false }, { name: 'url', type: 'string', description: 'URL to fetch a spec from before normalizing', required: false }] },
            { name: 'swagger.validate', description: 'Validate a spec payload or existing normalized spec id', parameters: [{ name: 'specId', type: 'string', description: 'Normalized spec id', required: false }, { name: 'raw', type: 'object', description: 'Parsed spec object', required: false }, { name: 'content', type: 'string', description: 'Raw spec content (JSON/YAML)', required: false }] },
        ];
    }
    async executeTool(toolName, params) {
        const started = Date.now();
        try {
            // Handle swagger helpers locally
            if (toolName === 'swagger.fetch') {
                const url = params && params['url'];
                if (!url)
                    throw new Error('url parameter is required');
                const data = await SwaggerLoader_1.default.fetchJsonFromUrl(url);
                const duration = Date.now() - started;
                return { success: true, data: data, duration, toolName, timestamp: new Date() };
            }
            if (toolName === 'swagger.parse') {
                const content = params && params['content'];
                if (!content)
                    throw new Error('content parameter is required');
                // try JSON then YAML
                try {
                    const parsed = JSON.parse(content);
                    const duration = Date.now() - started;
                    return { success: true, data: parsed, duration, toolName, timestamp: new Date() };
                }
                catch (e) {
                    const parsed = require('js-yaml').load(content);
                    const duration = Date.now() - started;
                    return { success: true, data: parsed, duration, toolName, timestamp: new Date() };
                }
            }
            if (toolName === 'swagger.listOperations') {
                const specId = params && params['specId'];
                if (!specId)
                    throw new Error('specId parameter is required');
                const spec = await persistence_1.specRepository.getById(specId);
                if (!spec)
                    throw new Error(`Spec not found: ${specId}`);
                const ops = (spec.operations || []).map((o) => ({ operationId: o.operationId, method: o.method, path: o.path, summary: o.summary }));
                const duration = Date.now() - started;
                return { success: true, data: ops, duration, toolName, timestamp: new Date() };
            }
            if (toolName === 'swagger.normalize') {
                // Accept raw object, content string, or url to fetch
                const specIdOpt = params && params['specId'];
                let raw = params && params['raw'];
                const content = params && params['content'];
                const url = params && params['url'];
                if (!raw) {
                    if (content) {
                        try {
                            raw = JSON.parse(content);
                        }
                        catch (_) {
                            raw = require('js-yaml').load(content);
                        }
                    }
                    else if (url) {
                        raw = await SwaggerLoader_1.default.fetchJsonFromUrl(url);
                    }
                }
                if (!raw)
                    throw new Error('No spec provided (raw, content or url)');
                // Normalize and persist
                const normalized = OpenApiNormalizer_1.default.normalize(raw, { id: specIdOpt });
                await persistence_1.specRepository.save(normalized);
                const duration = Date.now() - started;
                return { success: true, data: normalized, duration, toolName, timestamp: new Date() };
            }
            if (toolName === 'swagger.validate') {
                const specId = params && params['specId'];
                let raw = params && params['raw'];
                const content = params && params['content'];
                if (!raw && content) {
                    try {
                        raw = JSON.parse(content);
                    }
                    catch (_) {
                        raw = require('js-yaml').load(content);
                    }
                }
                if (!raw && specId) {
                    const spec = await persistence_1.specRepository.getById(specId);
                    if (!spec)
                        throw new Error(`Spec not found: ${specId}`);
                    raw = spec.raw || spec;
                }
                if (!raw)
                    throw new Error('No spec provided to validate');
                const result = validator_1.default.validateSpec(raw);
                const duration = Date.now() - started;
                return { success: result.valid, data: result, duration, toolName, timestamp: new Date() };
            }
            // Fallback: For common case, expect { prompt: string }
            const prompt = (params && params['prompt']) || JSON.stringify(params || {});
            const resp = await this.adapter.generate(String(prompt));
            const duration = Date.now() - started;
            return { success: true, data: (resp.raw ?? resp.text), duration, toolName, timestamp: new Date() };
        }
        catch (err) {
            const duration = Date.now() - started;
            return { success: false, error: err?.message ?? String(err), duration, toolName, timestamp: new Date() };
        }
    }
    async hasTool(toolName) {
        const tools = await this.getAvailableTools();
        return tools.some((t) => t.name === toolName);
    }
    isConnected() {
        return this.status === 'connected';
    }
    async getToolDefinition(toolName) {
        const tools = await this.getAvailableTools();
        return tools.find((t) => t.name === toolName) || null;
    }
}
exports.CompatibilityMcpClient = CompatibilityMcpClient;
// A small factory that returns compatibility clients and caches them by name.
const clientMap = new Map();
function getCompatibilityClient(serverName = 'default', adapter) {
    if (clientMap.has(serverName))
        return clientMap.get(serverName);
    const client = new CompatibilityMcpClient(serverName, adapter);
    clientMap.set(serverName, client);
    return client;
}
function resetCompatibilityClients() {
    clientMap.clear();
}
exports.default = { CompatibilityMcpClient, getCompatibilityClient, resetCompatibilityClients };
