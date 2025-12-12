"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRunReportRepository = void 0;
class InMemoryRunReportRepository {
    constructor() {
        this.map = new Map();
    }
    async save(report) {
        this.map.set(report.runId, report);
    }
    async getByRunId(runId) {
        return this.map.get(runId) || null;
    }
}
exports.InMemoryRunReportRepository = InMemoryRunReportRepository;
exports.default = InMemoryRunReportRepository;
