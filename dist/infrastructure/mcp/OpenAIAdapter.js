"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenAIAdapter {
    constructor(opts) {
        if (!opts || !opts.apiKey)
            throw new Error('OpenAI API key is required');
        this.opts = { baseUrl: 'https://api.openai.com', model: 'gpt-4o-mini', ...opts };
    }
    async generate(prompt, params = {}) {
        // Minimal chat completion call to OpenAI-compatible endpoint. This is a lightweight
        // implementation; callers should handle errors and rate limits.
        const url = `${this.opts.baseUrl}/v1/chat/completions`;
        const body = {
            model: this.opts.model,
            messages: [{ role: 'user', content: prompt }],
            ...params,
        };
        const res = await axios_1.default.post(url, body, {
            headers: {
                Authorization: `Bearer ${this.opts.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const choice = res.data?.choices?.[0];
        const text = choice?.message?.content ?? String(res.data);
        return { text, raw: res.data };
    }
}
exports.OpenAIAdapter = OpenAIAdapter;
exports.default = OpenAIAdapter;
