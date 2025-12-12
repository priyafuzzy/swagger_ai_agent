"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRunPlanRepository = void 0;
class InMemoryRunPlanRepository {
    constructor() {
        this.map = new Map();
    }
    async save(plan) {
        this.map.set(plan.runId, plan);
    }
    async getById(runId) {
        return this.map.get(runId) || null;
    }
    async list() {
        return Array.from(this.map.values());
    }
}
exports.InMemoryRunPlanRepository = InMemoryRunPlanRepository;
exports.default = InMemoryRunPlanRepository;
