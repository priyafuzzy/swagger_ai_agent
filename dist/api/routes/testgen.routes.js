"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testgen_controller_1 = __importDefault(require("../controllers/testgen.controller"));
const testgen_validator_1 = require("../validators/testgen.validator");
const router = (0, express_1.Router)();
// POST /api/testgen/generate-axios-tests
router.post('/generate-axios-tests', testgen_validator_1.validateGenerateAxiosTests, testgen_controller_1.default.generateAxiosTestsHandler);
exports.default = router;
