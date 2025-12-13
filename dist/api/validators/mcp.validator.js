"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMcpExecute = validateMcpExecute;
function validateMcpExecute(req, res, next) {
    const { toolName, params, clientId } = req.body || {};
    if (!toolName || typeof toolName !== 'string')
        return res.status(400).json({ error: 'toolName is required and must be a string' });
    if (params !== undefined && typeof params !== 'object')
        return res.status(400).json({ error: 'params must be an object' });
    if (clientId !== undefined && typeof clientId !== 'string')
        return res.status(400).json({ error: 'clientId must be a string' });
    next();
}
exports.default = { validateMcpExecute };
