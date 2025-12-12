"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpec = validateSpec;
const persistence_1 = require("../../infrastructure/persistence");
async function validateSpec(specId) {
    const spec = await persistence_1.specRepository.getById(specId);
    if (!spec)
        return { valid: false, errors: [`Spec not found: ${specId}`] };
    const errors = [];
    if (!spec.raw)
        errors.push('raw spec missing');
    if (!spec.operations || spec.operations.length === 0)
        errors.push('no operations found');
    if (!spec.title)
        errors.push('title missing');
    return { valid: errors.length === 0, errors };
}
exports.default = validateSpec;
