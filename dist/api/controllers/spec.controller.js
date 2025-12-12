"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSpec = importSpec;
exports.listSpecs = listSpecs;
exports.getSpec = getSpec;
exports.getOperations = getOperations;
exports.getTags = getTags;
exports.postValidateSpec = postValidateSpec;
const persistence_1 = require("../../infrastructure/persistence");
const ingestSwagger_usecase_1 = require("../../application/spec/ingestSwagger.usecase");
const getSpec_usecase_1 = require("../../application/spec/getSpec.usecase");
const listOperations_usecase_1 = require("../../application/spec/listOperations.usecase");
const listTags_usecase_1 = require("../../application/spec/listTags.usecase");
const validateSpec_usecase_1 = require("../../application/spec/validateSpec.usecase");
async function importSpec(req, res, next) {
    try {
        // Accept either a raw spec in `body.raw` / `body.spec`, a `source` object, or the whole body.
        let raw = req.body?.raw || req.body?.spec || null;
        const source = req.body?.source || null;
        if (!raw)
            raw = req.body || {};
        // Delegate to the ingest use-case which handles URL fetching, normalization and persistence
        const spec = await (0, ingestSwagger_usecase_1.ingestSwagger)({ source, raw });
        res.json({ specId: spec.id, title: spec.title, version: spec.version, operationCount: spec.operationCount });
    }
    catch (err) {
        next(err);
    }
}
async function listSpecs(req, res, next) {
    try {
        const list = await persistence_1.specRepository.list();
        res.json({ count: list.length, specs: list });
    }
    catch (err) {
        next(err);
    }
}
async function getSpec(req, res, next) {
    try {
        const specId = req.params.specId;
        const spec = await (0, getSpec_usecase_1.getSpecById)(specId);
        res.json(spec);
    }
    catch (err) {
        next(err);
    }
}
async function getOperations(req, res, next) {
    try {
        const specId = req.params.specId;
        const ops = await (0, listOperations_usecase_1.listOperationsForSpec)(specId);
        res.json({ count: ops.length, operations: ops });
    }
    catch (err) {
        next(err);
    }
}
async function getTags(req, res, next) {
    try {
        const specId = req.params.specId;
        const tags = await (0, listTags_usecase_1.listTagsForSpec)(specId);
        res.json({ count: tags.length, tags });
    }
    catch (err) {
        next(err);
    }
}
async function postValidateSpec(req, res, next) {
    try {
        const specId = req.params.specId;
        const result = await (0, validateSpec_usecase_1.validateSpec)(specId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
exports.default = { importSpec, listSpecs, getSpec, getOperations, getTags, postValidateSpec };
