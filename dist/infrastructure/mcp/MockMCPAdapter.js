"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMCPAdapter = void 0;
class MockMCPAdapter {
    async generate(prompt, params) {
        // Return a deterministic mock response useful for unit tests
        const text = `MOCK_RESPONSE for prompt: ${prompt.slice(0, 200)}`;
        return { text, raw: { promptLength: prompt.length, params } };
    }
}
exports.MockMCPAdapter = MockMCPAdapter;
exports.default = MockMCPAdapter;
