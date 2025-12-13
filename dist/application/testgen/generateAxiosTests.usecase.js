"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAxiosTestsUsecase = generateAxiosTestsUsecase;
const Logger_1 = __importDefault(require("../../infrastructure/logging/Logger"));
const generateTests_usecase_1 = require("../execution/generateTests.usecase");
const persistence_1 = require("../../infrastructure/persistence");
const payloadTemplates_1 = require("../execution/payloadTemplates");
function escapeSingle(s) {
    return s.replace(/'/g, "\\'");
}
function buildUrlTemplate(baseVar, path) {
    const replaced = path.replace(/\{([^}]+)\}/g, (_m, p) => "${params['" + p + "'] || 'REPLACE_ME'}");
    return `\`${baseVar}${replaced}\``;
}
function buildAxiosCall(op, test) {
    const baseVar = 'process.env.BASE_URL || "http://localhost:3000"';
    const method = (op.method || 'get').toLowerCase();
    const path = op.path || '/';
    const urlTpl = buildUrlTemplate(baseVar, path);
    const lines = [];
    lines.push('    const params = {};');
    lines.push('    const headers = {};');
    const example = (0, payloadTemplates_1.examplePayloadForOperation)(op);
    if (example) {
        const dataSnippet = JSON.stringify(example, null, 2);
        lines.push(`    const data = ${dataSnippet};`);
    }
    else {
        lines.push('    const data = undefined;');
    }
    const axiosCall = `    const res = await axios({ method: '${method}', url: ${urlTpl}, params: params, headers: headers, data: data });`;
    lines.push(axiosCall);
    lines.push(`    expect(res.status).toBe(${test.expectedStatus || 200});`);
    return lines.join('\n');
}
function toAxiosJestCode(spec, tests) {
    const lines = [];
    lines.push("const axios = require('axios');");
    lines.push('');
    lines.push("describe('Generated tests for spec: " + (spec && spec.title ? escapeSingle(spec.title) : spec.id) + "', () => {");
    tests.forEach((t, idx) => {
        const name = escapeSingle(t.name || `test-${idx}`);
        lines.push(`  test('${name}', async () => {`);
        const op = (spec && spec.operations || []).find((o) => o.operationId === t.operationId);
        if (!op) {
            lines.push(`    // Operation ${t.operationId} not found in spec`);
            lines.push('    expect(true).toBe(true);');
            lines.push('  });');
            return;
        }
        const call = buildAxiosCall(op, t);
        lines.push(call);
        lines.push('  });');
        lines.push('');
    });
    lines.push('});');
    return lines.join('\n');
}
async function generateAxiosTestsUsecase(specId, opts = {}) {
    try {
        const spec = await persistence_1.specRepository.getById(specId);
        if (!spec)
            throw new Error(`Spec not found: ${specId}`);
        const result = await (0, generateTests_usecase_1.generateTestsForSpec)(specId, { useMCP: !!opts.useMCP, mcpClient: opts.mcpClient });
        const tests = Array.isArray(result) ? result : result.tests || [];
        const warnings = !Array.isArray(result) ? result.warnings : undefined;
        const code = toAxiosJestCode(spec, tests || []);
        if (warnings && warnings.length)
            Logger_1.default.warn(`[generateAxiosTestsUsecase] warnings: ${warnings.join('; ')}`);
        return { specId, testCount: (tests || []).length, tests, code, warnings };
    }
    catch (e) {
        const err = `Error generating axios tests: ${(e && e.message) || e}`;
        Logger_1.default.error(`[generateAxiosTestsUsecase] ${err}`);
        throw e;
    }
}
exports.default = { generateAxiosTestsUsecase };
