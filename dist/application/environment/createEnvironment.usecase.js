"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironmentUsecase = createEnvironmentUsecase;
async function createEnvironmentUsecase(repo, input) {
    // pure application logic (no HTTP, no express) — validate and build entity
    if (!input || !input.specId || !input.name || !input.baseUrl) {
        throw new Error('specId, name and baseUrl are required');
    }
    const id = `env-${Date.now().toString(36)}`;
    const env = {
        id,
        specId: input.specId,
        name: input.name,
        baseUrl: input.baseUrl,
        defaultHeaders: input.defaultHeaders || {},
        auth: input.auth || null,
        active: true,
    };
    await repo.save(env);
    return env;
}
exports.default = createEnvironmentUsecase;
