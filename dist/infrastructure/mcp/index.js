"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMCPAdapter = getMCPAdapter;
const MockMCPAdapter_1 = __importDefault(require("./MockMCPAdapter"));
const OpenAIAdapter_1 = __importDefault(require("./OpenAIAdapter"));
function getMCPAdapter() {
    const key = process.env.OPENAI_API_KEY || process.env.MCP_API_KEY;
    if (!key) {
        // default to mock adapter when no API key configured
        return new MockMCPAdapter_1.default();
    }
    return new OpenAIAdapter_1.default({ apiKey: key });
}
exports.default = getMCPAdapter;
