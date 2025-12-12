"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEnvironmentUsecase = deleteEnvironmentUsecase;
async function deleteEnvironmentUsecase(repo, envId) {
    if (!envId)
        throw new Error('envId is required');
    await repo.delete(envId);
}
exports.default = deleteEnvironmentUsecase;
