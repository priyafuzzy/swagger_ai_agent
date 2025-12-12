"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReportRepository = exports.runPlanRepository = exports.environmentRepository = exports.specRepository = void 0;
const InMemorySpecRepository_1 = __importDefault(require("./InMemorySpecRepository"));
const InMemoryEnvironmentRepository_1 = __importDefault(require("./InMemoryEnvironmentRepository"));
const InMemoryRunPlanRepository_1 = __importDefault(require("./InMemoryRunPlanRepository"));
const InMemoryRunReportRepository_1 = __importDefault(require("./InMemoryRunReportRepository"));
exports.specRepository = new InMemorySpecRepository_1.default();
exports.environmentRepository = new InMemoryEnvironmentRepository_1.default();
exports.runPlanRepository = new InMemoryRunPlanRepository_1.default();
exports.runReportRepository = new InMemoryRunReportRepository_1.default();
exports.default = {
    specRepository: exports.specRepository,
    environmentRepository: exports.environmentRepository,
    runPlanRepository: exports.runPlanRepository,
    runReportRepository: exports.runReportRepository,
};
