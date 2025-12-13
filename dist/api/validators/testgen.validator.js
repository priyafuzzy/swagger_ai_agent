"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGenerateAxiosTests = validateGenerateAxiosTests;
function validateGenerateAxiosTests(req, res, next) {
    const { specId, selection, options } = req.body || {};
    if (!specId || typeof specId !== 'string')
        return res.status(400).json({ error: 'specId is required and must be a string' });
    if (selection && typeof selection !== 'object')
        return res.status(400).json({ error: 'selection must be an object' });
    if (options && typeof options !== 'object')
        return res.status(400).json({ error: 'options must be an object' });
    if (options && options.useMCP !== undefined && typeof options.useMCP !== 'boolean')
        return res.status(400).json({ error: 'options.useMCP must be boolean' });
    next();
}
exports.default = { validateGenerateAxiosTests };
