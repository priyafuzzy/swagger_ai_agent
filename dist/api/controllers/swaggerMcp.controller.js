"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSpecHandler = fetchSpecHandler;
exports.parseSpecHandler = parseSpecHandler;
exports.listOperationsHandler = listOperationsHandler;
const FactoryAdapter_1 = require("../../infrastructure/mcp/FactoryAdapter");
const Logger_1 = __importDefault(require("../../infrastructure/logging/Logger"));
const mcp_1 = __importDefault(require("../../config/mcp"));
const ALLOWED_TOOLS = new Set(mcp_1.default.allowedTools || []);
function isAllowed(toolName) {
    if (!toolName)
        return false;
    // allow wildcard prefix 'swagger.' matching
    if (ALLOWED_TOOLS.has(toolName))
        return true;
    for (const t of ALLOWED_TOOLS) {
        if (t.endsWith('*') && toolName.startsWith(t.replace(/\*$/, '')))
            return true;
    }
    return false;
}
async function fetchSpecHandler(req, res, next) {
    try {
        const { url, clientId } = req.body || {};
        if (!url)
            return res.status(400).json({ error: 'url is required' });
        const toolName = 'swagger.fetch';
        if (!isAllowed(toolName))
            return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
        const client = (0, FactoryAdapter_1.getCompatibilityClient)(clientId || 'generator');
        await client.connect();
        const result = await client.executeTool(toolName, { url });
        res.json({ success: true, result });
    }
    catch (err) {
        Logger_1.default.error('[mcp.swagger.fetch] ' + String(err));
        next(err);
    }
}
async function parseSpecHandler(req, res, next) {
    try {
        const { content, clientId } = req.body || {};
        if (!content)
            return res.status(400).json({ error: 'content is required' });
        const toolName = 'swagger.parse';
        if (!isAllowed(toolName))
            return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
        const client = (0, FactoryAdapter_1.getCompatibilityClient)(clientId || 'generator');
        await client.connect();
        const result = await client.executeTool(toolName, { content });
        res.json({ success: true, result });
    }
    catch (err) {
        Logger_1.default.error('[mcp.swagger.parse] ' + String(err));
        next(err);
    }
}
async function listOperationsHandler(req, res, next) {
    try {
        const { specId, clientId } = req.body || {};
        if (!specId)
            return res.status(400).json({ error: 'specId is required' });
        const toolName = 'swagger.listOperations';
        if (!isAllowed(toolName))
            return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
        const client = (0, FactoryAdapter_1.getCompatibilityClient)(clientId || 'generator');
        await client.connect();
        const result = await client.executeTool(toolName, { specId });
        res.json({ success: true, result });
    }
    catch (err) {
        Logger_1.default.error('[mcp.swagger.listOperations] ' + String(err));
        next(err);
    }
}
exports.default = { fetchSpecHandler, parseSpecHandler, listOperationsHandler };
