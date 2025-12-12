"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestsForOperations = generateTestsForOperations;
exports.generateTestsForSpec = generateTestsForSpec;
const persistence_1 = require("../../infrastructure/persistence");
const FactoryAdapter_1 = require("../../infrastructure/mcp/FactoryAdapter");
const ajv_1 = __importDefault(require("ajv"));
const llmSchema_1 = require("./llmSchema");
const payloadTemplates_1 = require("./payloadTemplates");
function generateTestsForOperations(operations) {
    const tests = [];
    operations.forEach((op, idx) => {
        const baseId = `tc-${idx}-${op.method}_${op.path.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        // Happy-path test
        tests.push({
            id: `${baseId}-happy`,
            operationId: op.operationId || `${op.method}_${op.path}`,
            name: `happy: ${op.method.toUpperCase()} ${op.path}`,
            expectedStatus: guessSuccessStatus(op),
            payloadStrategy: (0, payloadTemplates_1.examplePayloadForOperation)(op) ? 'example' : 'none',
        });
        // Negative / validation test (expect 400)
        tests.push({
            id: `${baseId}-negative`,
            operationId: op.operationId || `${op.method}_${op.path}`,
            name: `negative: ${op.method.toUpperCase()} ${op.path}`,
            expectedStatus: 400,
            payloadStrategy: 'none',
        });
        // Auth test (if security present)
        if (op.security && op.security.length > 0) {
            tests.push({
                id: `${baseId}-auth`,
                operationId: op.operationId || `${op.method}_${op.path}`,
                name: `auth: ${op.method.toUpperCase()} ${op.path}`,
                expectedStatus: 401,
                payloadStrategy: (0, payloadTemplates_1.examplePayloadForOperation)(op) ? 'example' : 'none',
            });
        }
    });
    return tests;
}
async function generateTestsForSpec(specId, opts = {}) {
    const spec = await persistence_1.specRepository.getById(specId);
    if (!spec)
        throw new Error(`Spec not found: ${specId}`);
    const ops = spec.operations || [];
    const useMCP = opts.useMCP || process.env.GENERATE_WITH_MCP === 'true';
    if (useMCP) {
        const client = opts.mcpClient || (0, FactoryAdapter_1.getCompatibilityClient)('generator');
        try {
            await client.connect();
            const prompt = `You are an assistant that outputs a JSON array of test case objects. For each operation provide an object with keys: operationId, id (optional), name, expectedStatus (number), payloadStrategy(one of example|schema|llm|none). Input operations: ${JSON.stringify(ops.map((o) => ({ path: o.path, method: o.method, operationId: o.operationId })))}. Output ONLY valid JSON array.`;
            const resp = await client.executeTool('text_generation', { prompt });
            const text = (resp.data && typeof resp.data === 'string') ? resp.data : JSON.stringify(resp.data || resp);
            let parsed;
            parsed = JSON.parse(text);
        }
        catch (e) {
            // invalid JSON — fallback
            parsed = null;
            const warn = `LLM returned invalid JSON; falling back to deterministic generation`;
            // return fallback below with warning
            const fallback = generateTestsForOperations(ops);
            return { tests: fallback, warnings: [warn] };
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
            // Cross-validate operationId against known operations in the spec
            const knownOps = new Set(ops.map((o) => o.operationId));
            const filtered = parsed.filter((p) => p && typeof p.operationId === 'string' && knownOps.has(p.operationId));
            const rejected = parsed
                .map((p) => (p && p.operationId ? p.operationId : null))
                .filter((id) => id && !knownOps.has(id));
            if (filtered.length === 0) {
                // no valid operationIds returned by LLM — treat as failure and fall back
                const warn = `LLM returned no operationIds that match the spec; falling back to deterministic generation`;
                const fallback = generateTestsForOperations(ops);
                return { tests: fallback, warnings: rejected.length ? [warn, `Rejected operationIds: ${Array.from(new Set(rejected)).join(',')}`] : [warn] };
            }
            else {
                const ajv = new ajv_1.default();
                const validate = ajv.compile(llmSchema_1.testCasesArraySchema);
                const valid = validate(filtered);
                if (valid) {
                    const tests = filtered.map((p) => ({
                        id: p.id || `tc-llm-${Math.random().toString(36).slice(2, 8)}`,
                        operationId: p.operationId,
                        name: p.name || `${p.operationId}`,
                        expectedStatus: p.expectedStatus || 200,
                        payloadStrategy: p.payloadStrategy || 'none',
                    }));
                    const warnings = [];
                    if (rejected.length)
                        warnings.push(`Filtered out unknown operationIds: ${Array.from(new Set(rejected)).join(',')}`);
                    return { tests, warnings: warnings.length ? warnings : undefined };
                }
            }
        }
    }
    try { }
    catch (e) {
        // fall back to deterministic generator below
    }
}
return generateTestsForOperations(ops);
function guessSuccessStatus(op) {
    // Choose first 2xx response if present, otherwise 200
    try {
        const responses = op.responses || [];
        for (const r of responses) {
            const s = Number(r.status);
            if (!isNaN(s) && s >= 200 && s < 300)
                return s;
        }
    }
    catch (e) {
        // ignore
    }
    return 200;
}
exports.default = { generateTestsForOperations, generateTestsForSpec };
