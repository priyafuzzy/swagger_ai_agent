"use strict";
// Lightweight adapter placeholder for swagger/openapi parsing
// Future: replace with `swagger-parser` or `@apidevtools/swagger-parser` usage
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSwagger = parseSwagger;
async function parseSwagger(raw) {
    // For now assume the input is already parsed JSON/YAML object
    return raw;
}
exports.default = { parseSwagger };
