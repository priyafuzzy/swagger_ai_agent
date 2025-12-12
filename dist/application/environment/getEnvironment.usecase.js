"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentUsecase = getEnvironmentUsecase;
async function getEnvironmentUsecase(repo, envId) {
    if (!envId)
        throw new Error('envId is required');
    const env = await repo.getById(envId);
    return env;
}
exports.default = getEnvironmentUsecase;
