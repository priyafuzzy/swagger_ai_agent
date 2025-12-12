"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOperationsForSpec = listOperationsForSpec;
const persistence_1 = require("../../infrastructure/persistence");
async function listOperationsForSpec(specId) {
    const spec = await persistence_1.specRepository.getById(specId);
    if (!spec)
        throw new Error(`Spec not found: ${specId}`);
    return spec.operations || [];
}
exports.default = listOperationsForSpec;
