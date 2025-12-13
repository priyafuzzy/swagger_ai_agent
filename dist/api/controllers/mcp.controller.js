"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeToolHandler = executeToolHandler;
const FactoryAdapter_1 = require("../../infrastructure/mcp/FactoryAdapter");
const Logger_1 = __importDefault(require("../../infrastructure/logging/Logger"));
const mcp_1 = __importDefault(require("../../config/mcp"));
const ALLOWED_TOOLS = new Set(mcp_1.default.allowedTools || []);
async function executeToolHandler(req, res, next) {
    try {
        const { toolName, params, clientId } = req.body;
        if (!toolName)
            return res.status(400).json({ error: 'toolName is required' });
        if (!ALLOWED_TOOLS.has(toolName)) {
            Logger_1.default.warn(`[mcp.execute] Attempt to invoke disallowed tool: ${toolName}`);
            return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
        }
        const client = (0, FactoryAdapter_1.getCompatibilityClient)(clientId || 'generator');
        Logger_1.default.info(`[mcp.execute] Executing tool ${toolName} via client ${clientId || 'generator'}`);
        await client.connect();
        const result = await client.executeTool(toolName, params || {});
        Logger_1.default.info(`[mcp.execute] Tool ${toolName} completed`);
        res.json({ success: true, result });
    }
    catch (err) {
        next(err);
    }
}
exports.default = { executeToolHandler };
