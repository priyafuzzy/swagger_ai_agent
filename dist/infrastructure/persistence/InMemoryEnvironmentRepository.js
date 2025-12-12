"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEnvironmentRepository = void 0;
class InMemoryEnvironmentRepository {
    constructor() {
        this.map = new Map();
    }
    async save(env) {
        this.map.set(env.id, env);
    }
    async getById(id) {
        return this.map.get(id) || null;
    }
    async listBySpec(specId) {
        return Array.from(this.map.values()).filter(e => e.specId === specId);
    }
    async delete(id) {
        this.map.delete(id);
    }
}
exports.InMemoryEnvironmentRepository = InMemoryEnvironmentRepository;
exports.default = InMemoryEnvironmentRepository;
