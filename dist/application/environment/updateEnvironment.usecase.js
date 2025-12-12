"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnvironmentUsecase = updateEnvironmentUsecase;
async function updateEnvironmentUsecase(repo, envId, input) {
    if (!envId)
        throw new Error('envId is required');
    const existing = await repo.getById(envId);
    if (!existing)
        throw new Error('environment not found');
    const updated = {
        ...existing,
        name: input.name ?? existing.name,
        baseUrl: input.baseUrl ?? existing.baseUrl,
        defaultHeaders: input.defaultHeaders ?? existing.defaultHeaders,
        auth: input.auth ?? existing.auth,
        active: typeof input.active === 'boolean' ? input.active : existing.active,
    };
    await repo.save(updated);
    return updated;
}
exports.default = updateEnvironmentUsecase;
