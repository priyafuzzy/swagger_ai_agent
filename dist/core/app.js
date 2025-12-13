"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const requestLogger_1 = require("./middlewares/requestLogger");
const errorHandler_1 = require("./middlewares/errorHandler");
const spec_routes_1 = __importDefault(require("../../src/api/routes/spec.routes"));
const environment_routes_1 = __importDefault(require("../../src/api/routes/environment.routes"));
const execution_routes_1 = __importDefault(require("../../src/api/routes/execution.routes"));
const testgen_routes_1 = __importDefault(require("../../src/api/routes/testgen.routes"));
const mcp_routes_1 = __importDefault(require("../../src/api/routes/mcp.routes"));
const mcp_swagger_routes_1 = __importDefault(require("../../src/api/routes/mcp.swagger.routes"));
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use(requestLogger_1.requestLogger);
// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Mount spec API (stubbed for now)
app.use('/api/spec', spec_routes_1.default);
// Mount environment API
app.use('/api/environment', environment_routes_1.default);
// Mount execution API
app.use('/api/execution', execution_routes_1.default);
// Mount testgen API
app.use('/api/testgen', testgen_routes_1.default);
// Mount MCP API
app.use('/api/mcp', mcp_routes_1.default);
// Mount MCP Swagger helpers
app.use('/api/mcp/swagger', mcp_swagger_routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
