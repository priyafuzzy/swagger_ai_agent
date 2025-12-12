"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRun = executeRun;
const persistence_1 = require("../../infrastructure/persistence");
const AxiosExecutionAdapter_1 = require("../../infrastructure/http/AxiosExecutionAdapter");
async function executeRun(input) {
    // Fetch or create run plan
    let plan = null;
    if (input.runId) {
        plan = await persistence_1.runPlanRepository.getById(input.runId);
        if (!plan)
            throw new Error(`RunPlan not found: ${input.runId}`);
    }
    else if (input.specId && input.envName) {
        // create ad-hoc plan
        const created = await (await Promise.resolve().then(() => __importStar(require('./planRun.usecase')))).planRun({ specId: input.specId, envName: input.envName, selection: input.selection || { mode: 'full' } });
        plan = created;
    }
    else {
        throw new Error('Either runId or specId+envName required');
    }
    const spec = await persistence_1.specRepository.getById(plan.specId);
    if (!spec)
        throw new Error(`Spec not found: ${plan.specId}`);
    const envs = await persistence_1.environmentRepository.listBySpec(plan.specId);
    const env = envs.find((e) => e.name === plan.envName);
    if (!env)
        throw new Error(`Environment not found: ${plan.envName}`);
    const results = [];
    const startedAt = new Date().toISOString();
    for (const tc of plan.testCases) {
        const op = (plan.operations || []).find((o) => o.operationId === tc.operationId);
        if (!op) {
            results.push({ testCaseId: tc.id, operationId: tc.operationId, status: 'error', error: 'operation not found' });
            continue;
        }
        try {
            const exec = await (0, AxiosExecutionAdapter_1.executeOperation)(spec, op, env, tc.overrides || {});
            const passed = (exec.httpStatus === tc.expectedStatus);
            results.push({ testCaseId: tc.id, operationId: tc.operationId, status: passed ? 'passed' : 'failed', httpStatus: exec.httpStatus, durationMs: exec.durationMs, request: exec.request, response: exec.response });
        }
        catch (err) {
            results.push({ testCaseId: tc.id, operationId: tc.operationId, status: 'error', error: String(err?.message || err) });
        }
    }
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const errors = results.filter(r => r.status === 'error').length;
    const report = {
        runId: plan.runId,
        specId: plan.specId,
        envName: plan.envName,
        total: results.length,
        passed,
        failed,
        errors,
        results,
        startedAt,
        finishedAt: new Date().toISOString(),
    };
    // persist report
    await persistence_1.runReportRepository.save(report);
    return report;
}
exports.default = executeRun;
