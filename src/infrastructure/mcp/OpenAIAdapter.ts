import axios from 'axios';
import MCPAdapter, { MCPResponse } from '../../domain/adapters/MCPAdapter';

export interface OpenAIAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export class OpenAIAdapter implements MCPAdapter {
  private opts: OpenAIAdapterOptions;

  constructor(opts: OpenAIAdapterOptions) {
    if (!opts || !opts.apiKey) throw new Error('OpenAI API key is required');
    this.opts = { baseUrl: 'https://api.openai.com', model: 'gpt-4o-mini', ...opts };
  }

  async generate(prompt: string, params: Record<string, any> = {}): Promise<MCPResponse> {
    // Minimal chat completion call to OpenAI-compatible endpoint. This is a lightweight
    // implementation; callers should handle errors and rate limits.
    const url = `${this.opts.baseUrl}/v1/chat/completions`;
    const body = {
      model: this.opts.model,
      messages: [{ role: 'user', content: prompt }],
      ...params,
    };

    try {
      const res = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${this.opts.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      const choice = res.data?.choices?.[0];
      const text = choice?.message?.content ?? String(res.data);
      return { text, raw: res.data };
    } catch (err: any) {
      // Normalize error to be informative for callers
      const status = err?.response?.status;
      const body = err?.response?.data;
      const msg = status ? `OpenAI request failed ${status}: ${JSON.stringify(body)}` : String(err?.message || err);
      throw new Error(msg);
    }
  }
}

export default OpenAIAdapter;
