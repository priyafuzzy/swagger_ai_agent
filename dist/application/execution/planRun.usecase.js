"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.planRun = planRun;
const crypto_1 = __importDefault(require("crypto"));
const persistence_1 = require("../../infrastructure/persistence");
const generateTests_usecase_1 = require("./generateTests.usecase");
async function planRun(input) {
    const { specId, envName, selection, useMCP } = input;
    if (!specId)
        throw new Error('specId is required');
    const spec = await persistence_1.specRepository.getById(specId);
    if (!spec)
        throw new Error(`Spec not found: ${specId}`);
    const envs = await persistence_1.environmentRepository.listBySpec(specId);
    const env = envs.find((e) => (envName ? e.name === envName : e.active)) || envs[0];
    if (!env)
        throw new Error(`Environment not found for spec ${specId}`);
    // select operations
    let ops = spec.operations || [];
    if (selection && selection.mode === 'tag' && Array.isArray(selection.tags)) {
        ops = ops.filter((o) => (o.tags || []).some((t) => selection.tags.includes(t)));
    }
    else if (selection && selection.mode === 'operation' && Array.isArray(selection.operationIds)) {
        ops = ops.filter((o) => selection.operationIds.includes(o.operationId));
    }
    // Optionally generate richer tests via MCP/LLM
    let testCases = [];
    let warnings;
    if (useMCP || process.env.PLAN_GENERATE_WITH_MCP === 'true') {
        try {
            const result = await (0, generateTests_usecase_1.generateTestsForSpec)(specId, { useMCP: true });
            if (Array.isArray(result)) {
                testCases = result;
            }
            else if (result && Array.isArray(result.tests)) {
                testCases = result.tests;
                warnings = result.warnings;
            }
            else {
                testCases = (ops || []).map((op, idx) => ({
                    id: `tc-${idx}-${op.operationId}`,
                    name: `Test ${op.operationId}`,
                    operationId: op.operationId,
                    expectedStatus: 200,
                    payloadStrategy: 'none',
                }));
            }
        }
        catch (e) {
            testCases = (ops || []).map((op, idx) => ({
                id: `tc-${idx}-${op.operationId}`,
                name: `Test ${op.operationId}`,
                operationId: op.operationId,
                expectedStatus: 200,
                payloadStrategy: 'none',
            }));
        }
    }
    else {
        testCases = (ops || []).map((op, idx) => ({
            id: `tc-${idx}-${op.operationId}`,
            name: `Test ${op.operationId}`,
            operationId: op.operationId,
            expectedStatus: 200,
            payloadStrategy: 'none',
        }));
    }
    const runId = `run-${crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : Date.now().toString(36)}`;
    const plan = {
        runId,
        specId,
        envName: env.name,
        operations: ops,
        testCases,
        createdAt: new Date().toISOString(),
        ...(warnings ? { warnings } : {}),
    };
    await persistence_1.runPlanRepository.save(plan);
    return plan;
}
exports.default = planRun;
