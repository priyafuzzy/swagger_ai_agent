"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const execution_controller_1 = __importDefault(require("../controllers/execution.controller"));
const router = (0, express_1.Router)();
// POST /api/execution/plan -> create a run plan
router.post('/plan', execution_controller_1.default.planRunHandler);
// POST /api/execution/generate -> generate test cases for a spec (no persist)
router.post('/generate', execution_controller_1.default.generateTestsHandler);
// POST /api/execution/run -> execute a plan or plan+run
router.post('/run', execution_controller_1.default.runHandler);
// GET /api/execution/status/:runId -> get report
router.get('/status/:runId', execution_controller_1.default.getRunStatus);
exports.default = router;
