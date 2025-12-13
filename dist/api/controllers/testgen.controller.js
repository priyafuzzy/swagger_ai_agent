"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAxiosTestsHandler = generateAxiosTestsHandler;
const generateAxiosTests_usecase_1 = require("../../application/testgen/generateAxiosTests.usecase");
function toAxiosJestCode(specId, tests) {
    // Simple code generator: create an Axios + Jest test stub per test case
    const lines = [];
    lines.push("const axios = require('axios');");
    lines.push("describe('Generated tests for spec: " + specId + "', () => {");
    tests.forEach((t) => {
        lines.push(`  test('${t.name}', async () => {`);
        lines.push("    // TODO: fill request details based on operationId/payloadStrategy");
        lines.push("    const res = await axios.get('http://example.invalid/');");
        lines.push("    expect(res.status).toBe(" + (t.expectedStatus || 200) + ");");
        lines.push('  });');
    });
    lines.push('});');
    return lines.join('\n');
}
async function generateAxiosTestsHandler(req, res, next) {
    try {
        const { specId, selection, options } = req.body;
        if (!specId)
            return res.status(400).json({ error: 'specId is required' });
        const result = await (0, generateAxiosTests_usecase_1.generateAxiosTestsUsecase)(specId, { useMCP: options && options.useMCP });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
exports.default = { generateAxiosTestsHandler };
