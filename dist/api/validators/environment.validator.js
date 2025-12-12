"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateEnvironmentPayload = validateCreateEnvironmentPayload;
exports.validateSpecIdParam = validateSpecIdParam;
exports.validateEnvIdParam = validateEnvIdParam;
exports.validateUpdateEnvironmentPayload = validateUpdateEnvironmentPayload;
function validateCreateEnvironmentPayload(payload) {
    const errors = [];
    if (!payload) {
        errors.push('body is required');
        return errors;
    }
    if (!payload.specId || typeof payload.specId !== 'string')
        errors.push('specId is required and must be a string');
    if (!payload.name || typeof payload.name !== 'string')
        errors.push('name is required and must be a string');
    if (!payload.baseUrl || typeof payload.baseUrl !== 'string')
        errors.push('baseUrl is required and must be a string');
    // optional: basic URL pattern
    return errors;
}
function validateSpecIdParam(specId) {
    if (!specId || typeof specId !== 'string')
        return 'specId is required in the path and must be a string';
    return null;
}
function validateEnvIdParam(envId) {
    if (!envId || typeof envId !== 'string')
        return 'envId is required in the path and must be a string';
    return null;
}
function validateUpdateEnvironmentPayload(payload) {
    const errors = [];
    if (!payload || typeof payload !== 'object') {
        errors.push('body is required');
        return errors;
    }
    if (payload.name !== undefined && typeof payload.name !== 'string')
        errors.push('name must be a string');
    if (payload.baseUrl !== undefined && typeof payload.baseUrl !== 'string')
        errors.push('baseUrl must be a string');
    if (payload.defaultHeaders !== undefined && typeof payload.defaultHeaders !== 'object')
        errors.push('defaultHeaders must be an object');
    if (payload.active !== undefined && typeof payload.active !== 'boolean')
        errors.push('active must be boolean');
    return errors;
}
exports.default = { validateCreateEnvironmentPayload, validateSpecIdParam };
