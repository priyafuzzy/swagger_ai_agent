"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibilityMcpClient = void 0;
exports.getCompatibilityClient = getCompatibilityClient;
exports.resetCompatibilityClients = resetCompatibilityClients;
const MockMCPAdapter_1 = require("./MockMCPAdapter");
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
        // Provide a default text-generation tool
        return [
            { name: 'text_generation', description: 'Generate text from prompt', parameters: [{ name: 'prompt', type: 'string', description: 'User prompt', required: true }] },
        ];
    }
    async executeTool(toolName, params) {
        const started = Date.now();
        try {
            // For common case, expect { prompt: string }
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
