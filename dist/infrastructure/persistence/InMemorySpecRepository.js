"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySpecRepository = void 0;
class InMemorySpecRepository {
    constructor() {
        this.map = new Map();
    }
    async save(spec) {
        this.map.set(spec.id, spec);
    }
    async getById(id) {
        return this.map.get(id) || null;
    }
    async list() {
        return Array.from(this.map.values());
    }
}
exports.InMemorySpecRepository = InMemorySpecRepository;
exports.default = InMemorySpecRepository;
