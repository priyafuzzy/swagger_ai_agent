"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTagsForSpec = listTagsForSpec;
const persistence_1 = require("../../infrastructure/persistence");
async function listTagsForSpec(specId) {
    const spec = await persistence_1.specRepository.getById(specId);
    if (!spec)
        throw new Error(`Spec not found: ${specId}`);
    // prefer spec.tags if present, otherwise derive from operations
    if (Array.isArray(spec.tags) && spec.tags.length > 0)
        return spec.tags;
    const tags = new Set();
    (spec.operations || []).forEach((op) => {
        if (op.tags && Array.isArray(op.tags))
            op.tags.forEach((t) => tags.add(t));
    });
    return Array.from(tags);
}
exports.default = listTagsForSpec;
