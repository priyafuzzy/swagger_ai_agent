"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecById = getSpecById;
const persistence_1 = require("../../infrastructure/persistence");
async function getSpecById(specId) {
    const spec = await persistence_1.specRepository.getById(specId);
    if (!spec)
        throw new Error(`Spec not found: ${specId}`);
    return spec;
}
exports.default = getSpecById;
