import MockMCPAdapter from './MockMCPAdapter';
import OpenAIAdapter from './OpenAIAdapter';
import MCPAdapter from '../../domain/adapters/MCPAdapter';

export function getMCPAdapter(): MCPAdapter {
  const key = process.env.OPENAI_API_KEY || process.env.MCP_API_KEY;
  if (!key) {
    // default to mock adapter when no API key configured
    return new MockMCPAdapter();
  }
  return new OpenAIAdapter({ apiKey: key });
}

export default getMCPAdapter;
