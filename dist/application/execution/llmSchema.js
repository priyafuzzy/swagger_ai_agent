"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCasesArraySchema = exports.testCaseSchema = void 0;
exports.testCaseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        operationId: { type: 'string' },
        name: { type: 'string' },
        expectedStatus: { type: 'number' },
        payloadStrategy: { type: 'string', enum: ['example', 'schema', 'llm', 'none'] },
    },
    required: ['operationId', 'name'],
    additionalProperties: false,
};
exports.testCasesArraySchema = {
    type: 'array',
    items: exports.testCaseSchema,
};
exports.default = { testCaseSchema: exports.testCaseSchema, testCasesArraySchema: exports.testCasesArraySchema };
