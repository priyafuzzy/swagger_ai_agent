"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEnvironmentsUsecase = listEnvironmentsUsecase;
async function listEnvironmentsUsecase(repo, specId) {
    if (!specId)
        throw new Error('specId is required');
    const list = await repo.listBySpec(specId);
    return list || [];
}
exports.default = listEnvironmentsUsecase;
