"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestSwagger = ingestSwagger;
const crypto_1 = __importDefault(require("crypto"));
const persistence_1 = require("../../infrastructure/persistence");
const SwaggerLoader_1 = require("../../infrastructure/swagger/SwaggerLoader");
const normalizeSpec2_usecase_1 = require("./normalizeSpec2.usecase");
async function ingestSwagger(input) {
    let raw = input.raw || null;
    const source = input.source || null;
    if (!raw && source && source.type === 'url' && source.url) {
        raw = await (0, SwaggerLoader_1.fetchJsonFromUrl)(source.url);
    }
    const id = input.id || `spec-${crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : Date.now().toString(36)}`;
    let spec;
    if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
        spec = await (0, normalizeSpec2_usecase_1.normalizeSpec)(raw, { id });
    }
    else {
        spec = {
            id,
            title: `imported-${id}`,
            version: '0.0.1',
            servers: [],
            tags: [],
            operationCount: 0,
            operations: [],
            raw: { source: raw },
        };
    }
    await persistence_1.specRepository.save(spec);
    return spec;
}
exports.default = ingestSwagger;
