"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examplePayloadForOperation = examplePayloadForOperation;
exports.exampleValueForSchema = exampleValueForSchema;
// Simple payload template helpers used by the test generator.
// These are purposely small, deterministic, and easy to extend later.
function examplePayloadForOperation(op) {
    // If requestBody has an example, prefer it
    try {
        const rb = op.requestBody;
        if (rb && rb.content) {
            const first = Object.values(rb.content)[0];
            if (first && (first.example || first.examples))
                return first.example || first.examples;
            if (first && first.schema && first.schema.properties) {
                const props = {};
                for (const [k, v] of Object.entries(first.schema.properties)) {
                    props[k] = exampleValueForSchema(v);
                }
                return props;
            }
        }
    }
    catch (e) {
        // ignore and return null
    }
    return null;
}
function exampleValueForSchema(schema) {
    if (!schema)
        return null;
    if (schema.example !== undefined)
        return schema.example;
    if (schema.type === 'string')
        return 'string_example';
    if (schema.type === 'integer' || schema.type === 'number')
        return 1;
    if (schema.type === 'boolean')
        return false;
    if (schema.type === 'array')
        return [];
    if (schema.type === 'object')
        return {};
    return null;
}
exports.default = { examplePayloadForOperation, exampleValueForSchema };
