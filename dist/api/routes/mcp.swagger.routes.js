"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const swaggerMcp_controller_1 = __importDefault(require("../controllers/swaggerMcp.controller"));
const router = (0, express_1.Router)();
// POST /api/mcp/swagger/fetch -> fetch a remote spec via MCP tool
router.post('/fetch', swaggerMcp_controller_1.default.fetchSpecHandler);
// POST /api/mcp/swagger/parse -> parse raw spec content via MCP tool
router.post('/parse', swaggerMcp_controller_1.default.parseSpecHandler);
// POST /api/mcp/swagger/operations -> list operations for a spec via MCP tool
router.post('/operations', swaggerMcp_controller_1.default.listOperationsHandler);
exports.default = router;
