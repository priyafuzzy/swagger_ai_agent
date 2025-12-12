"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironment = createEnvironment;
exports.listEnvironments = listEnvironments;
exports.getEnvironment = getEnvironment;
exports.updateEnvironment = updateEnvironment;
exports.deleteEnvironment = deleteEnvironment;
const persistence_1 = require("../../infrastructure/persistence");
const createEnvironment_usecase_1 = __importDefault(require("../../application/environment/createEnvironment.usecase"));
const listEnvironments_usecase_1 = __importDefault(require("../../application/environment/listEnvironments.usecase"));
const environment_validator_1 = require("../validators/environment.validator");
const getEnvironment_usecase_1 = __importDefault(require("../../application/environment/getEnvironment.usecase"));
const updateEnvironment_usecase_1 = __importDefault(require("../../application/environment/updateEnvironment.usecase"));
const deleteEnvironment_usecase_1 = __importDefault(require("../../application/environment/deleteEnvironment.usecase"));
const environment_validator_2 = require("../validators/environment.validator");
async function createEnvironment(req, res, next) {
    try {
        const { specId, name, baseUrl, defaultHeaders, auth } = req.body || {};
        const input = { specId, name, baseUrl, defaultHeaders, auth };
        const errors = (0, environment_validator_1.validateCreateEnvironmentPayload)(input);
        if (errors.length)
            return res.status(400).json({ errors });
        const env = await (0, createEnvironment_usecase_1.default)(persistence_1.environmentRepository, input);
        res.status(201).json({ id: env.id, specId: env.specId, name: env.name, baseUrl: env.baseUrl });
    }
    catch (err) {
        // If validation-like error, send 400
        if (err && err.message && err.message.includes('required')) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
}
async function listEnvironments(req, res, next) {
    try {
        const specId = req.params.specId;
        const specErr = (0, environment_validator_1.validateSpecIdParam)(specId);
        if (specErr)
            return res.status(400).json({ error: specErr });
        const list = await (0, listEnvironments_usecase_1.default)(persistence_1.environmentRepository, specId);
        res.json({ count: list.length, environments: list });
    }
    catch (err) {
        next(err);
    }
}
async function getEnvironment(req, res, next) {
    try {
        const envId = req.params.envId;
        const err = (0, environment_validator_2.validateEnvIdParam)(envId);
        if (err)
            return res.status(400).json({ error: err });
        const env = await (0, getEnvironment_usecase_1.default)(persistence_1.environmentRepository, envId);
        if (!env)
            return res.status(404).json({ error: 'environment not found' });
        res.json(env);
    }
    catch (err) {
        next(err);
    }
}
async function updateEnvironment(req, res, next) {
    try {
        const envId = req.params.envId;
        const envErr = (0, environment_validator_2.validateEnvIdParam)(envId);
        if (envErr)
            return res.status(400).json({ error: envErr });
        const payload = req.body || {};
        const errors = (0, environment_validator_2.validateUpdateEnvironmentPayload)(payload);
        if (errors.length)
            return res.status(400).json({ errors });
        const updated = await (0, updateEnvironment_usecase_1.default)(persistence_1.environmentRepository, envId, payload);
        res.json(updated);
    }
    catch (err) {
        if (err && err.message && err.message.includes('not found'))
            return res.status(404).json({ error: err.message });
        next(err);
    }
}
async function deleteEnvironment(req, res, next) {
    try {
        const envId = req.params.envId;
        const err = (0, environment_validator_2.validateEnvIdParam)(envId);
        if (err)
            return res.status(400).json({ error: err });
        await (0, deleteEnvironment_usecase_1.default)(persistence_1.environmentRepository, envId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
exports.default = { createEnvironment, listEnvironments, getEnvironment, updateEnvironment, deleteEnvironment };
