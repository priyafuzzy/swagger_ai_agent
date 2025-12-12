"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planRunHandler = planRunHandler;
exports.runHandler = runHandler;
exports.generateTestsHandler = generateTestsHandler;
exports.getRunStatus = getRunStatus;
const planRun_usecase_1 = require("../../application/execution/planRun.usecase");
const executeRun_usecase_1 = require("../../application/execution/executeRun.usecase");
const generateTests_usecase_1 = require("../../application/execution/generateTests.usecase");
const persistence_1 = require("../../infrastructure/persistence");
async function planRunHandler(req, res, next) {
    try {
        const { specId, envName, selection } = req.body;
        const { useMCP } = req.body;
        const plan = await (0, planRun_usecase_1.planRun)({ specId, envName, selection, useMCP });
        const payload = { runId: plan.runId, specId: plan.specId, envName: plan.envName, operationCount: (plan.operations || []).length, testCount: (plan.testCases || []).length };
        if (plan.warnings)
            payload.warnings = plan.warnings;
        res.json(payload);
    }
    catch (err) {
        next(err);
    }
}
async function runHandler(req, res, next) {
    try {
        const { runId, specId, envName, selection } = req.body;
        const report = await (0, executeRun_usecase_1.executeRun)({ runId, specId, envName, selection });
        res.json(report);
    }
    catch (err) {
        next(err);
    }
}
async function generateTestsHandler(req, res, next) {
    try {
        const { specId } = req.body;
        if (!specId)
            return res.status(400).json({ error: 'specId is required' });
        const tests = await (0, generateTests_usecase_1.generateTestsForSpec)(specId);
        res.json({ specId, testCount: tests.length, testCases: tests });
    }
    catch (err) {
        next(err);
    }
}
async function getRunStatus(req, res, next) {
    try {
        const runId = req.params.runId;
        const report = await persistence_1.runReportRepository.getByRunId(runId);
        if (!report)
            return res.status(404).json({ error: 'Run report not found' });
        res.json(report);
    }
    catch (err) {
        next(err);
    }
}
exports.default = { planRunHandler, runHandler, getRunStatus, generateTestsHandler };
