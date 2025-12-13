"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mcp_controller_1 = __importDefault(require("../controllers/mcp.controller"));
const mcp_validator_1 = require("../validators/mcp.validator");
const router = (0, express_1.Router)();
// POST /api/mcp/execute -> execute a tool on the MCP compatibility client
router.post('/execute', mcp_validator_1.validateMcpExecute, mcp_controller_1.default.executeToolHandler);
exports.default = router;
