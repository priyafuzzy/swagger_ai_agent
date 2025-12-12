import MCPAdapter, { MCPResponse } from '../../domain/adapters/MCPAdapter';

export class MockMCPAdapter implements MCPAdapter {
  async generate(prompt: string, params?: Record<string, any>): Promise<MCPResponse> {
    // Return a deterministic mock response useful for unit tests
    const text = `MOCK_RESPONSE for prompt: ${prompt.slice(0, 200)}`;
    return { text, raw: { promptLength: prompt.length, params } };
  }
}

export default MockMCPAdapter;
