"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const environment_controller_1 = __importDefault(require("../controllers/environment.controller"));
const router = (0, express_1.Router)();
// POST /api/environment -> create a new environment for a spec
router.post('/', environment_controller_1.default.createEnvironment);
// GET /api/environment/:envId -> get environment details
router.get('/:envId', environment_controller_1.default.getEnvironment);
// PUT /api/environment/:envId -> update environment
router.put('/:envId', environment_controller_1.default.updateEnvironment);
// DELETE /api/environment/:envId -> delete environment
router.delete('/:envId', environment_controller_1.default.deleteEnvironment);
exports.default = router;
