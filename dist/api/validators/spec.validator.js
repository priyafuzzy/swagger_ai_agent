"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpecImport = validateSpecImport;
exports.validateSpecValidate = validateSpecValidate;
exports.validateSpecIdParam = validateSpecIdParam;
function validateSpecImport(req, res, next) {
    const { source } = req.body || {};
    if (!source || typeof source !== 'object')
        return res.status(400).json({ error: 'source is required and must be an object' });
    const { type } = source;
    if (!type || typeof type !== 'string')
        return res.status(400).json({ error: 'source.type is required and must be a string' });
    if (type === 'url') {
        if (!source.url || typeof source.url !== 'string')
            return res.status(400).json({ error: 'source.url is required for type="url"' });
    }
    else if (type === 'file') {
        if (!source.path || typeof source.path !== 'string')
            return res.status(400).json({ error: 'source.path is required for type="file"' });
    }
    else if (type === 'git') {
        if (!source.repo || typeof source.repo !== 'string')
            return res.status(400).json({ error: 'source.repo is required for type="git"' });
        if (!source.filePath || typeof source.filePath !== 'string')
            return res.status(400).json({ error: 'source.filePath is required for type="git"' });
    }
    else {
        return res.status(400).json({ error: `unsupported source.type: ${type}` });
    }
    next();
}
function validateSpecValidate(req, res, next) {
    const body = req.body || {};
    if (body.specId && typeof body.specId === 'string')
        return next();
    // allow raw spec content as `spec` or `specContent` (object or string)
    if (body.spec && (typeof body.spec === 'object' || typeof body.spec === 'string'))
        return next();
    if (body.specContent && (typeof body.specContent === 'object' || typeof body.specContent === 'string'))
        return next();
    return res.status(400).json({ error: 'Either specId (string) or spec/specContent (object|string) is required' });
}
function validateSpecIdParam(req, res, next) {
    const { specId } = req.params || {};
    if (!specId || typeof specId !== 'string')
        return res.status(400).json({ error: 'specId param is required' });
    next();
}
exports.default = { validateSpecImport, validateSpecValidate, validateSpecIdParam };
