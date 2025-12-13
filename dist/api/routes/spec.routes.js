"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spec_controller_1 = __importDefault(require("../controllers/spec.controller"));
const environment_controller_1 = __importDefault(require("../controllers/environment.controller"));
const spec_validator_1 = require("../validators/spec.validator");
const router = (0, express_1.Router)();
// POST /api/spec/import -> delegates to controller
router.post('/import', spec_validator_1.validateSpecImport, spec_controller_1.default.importSpec);
router.get('/', spec_controller_1.default.listSpecs);
// Spec introspection
router.get('/:specId', spec_controller_1.default.getSpec);
router.get('/:specId/operations', spec_validator_1.validateSpecIdParam, spec_controller_1.default.getOperations);
router.get('/:specId/tags', spec_validator_1.validateSpecIdParam, spec_controller_1.default.getTags);
router.post('/:specId/validate', spec_validator_1.validateSpecIdParam, spec_validator_1.validateSpecValidate, spec_controller_1.default.postValidateSpec);
// GET /api/spec/:specId/environments -> list environments for a spec
router.get('/:specId/environments', environment_controller_1.default.listEnvironments);
exports.default = router;
