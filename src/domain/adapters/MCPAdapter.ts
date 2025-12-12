export interface MCPResponse {
  text: string;
  raw?: any;
}

export default interface MCPAdapter {
  // Generate text from a prompt with optional params (temperature, maxTokens, etc.)
  generate(prompt: string, params?: Record<string, any>): Promise<MCPResponse>;
}
