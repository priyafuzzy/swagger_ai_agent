import MCPAdapter from '../../domain/adapters/MCPAdapter';
import { MockMCPAdapter } from './MockMCPAdapter';

// Minimal IMcpClient-like interfaces (compatible subset)
export type McpConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface McpToolParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

export interface McpToolDefinition {
  name: string;
  description?: string;
  parameters?: McpToolParameter[];
}

export interface McpToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  toolName: string;
  timestamp: Date;
}

export interface IMcpClient {
  readonly config: { serverName: string; serverType?: string };
  readonly status: McpConnectionStatus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getAvailableTools(): Promise<McpToolDefinition[]>;
  executeTool<T = unknown>(toolName: string, params: Record<string, unknown>): Promise<McpToolResult<T>>;
  hasTool(toolName: string): Promise<boolean>;
  isConnected(): boolean;
  getToolDefinition(toolName: string): Promise<McpToolDefinition | null>;
}

// A thin compatibility client that wraps our MCPAdapter and exposes the IMcpClient subset.
export class CompatibilityMcpClient implements IMcpClient {
  config: { serverName: string; serverType?: string };
  private adapter: MCPAdapter;
  status: McpConnectionStatus = 'disconnected';

  constructor(serverName: string, adapter?: MCPAdapter) {
    this.config = { serverName, serverType: 'compatibility' };
    this.adapter = adapter || new MockMCPAdapter();
  }

  async connect(): Promise<void> {
    // adapter may not require connect; mark connected
    this.status = 'connected';
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
  }

  async getAvailableTools(): Promise<McpToolDefinition[]> {
    // Provide a default text-generation tool
    return [
      { name: 'text_generation', description: 'Generate text from prompt', parameters: [{ name: 'prompt', type: 'string', description: 'User prompt', required: true }] },
    ];
  }

  async executeTool<T = unknown>(toolName: string, params: Record<string, unknown>): Promise<McpToolResult<T>> {
    const started = Date.now();
    try {
      // For common case, expect { prompt: string }
      const prompt = (params && (params['prompt'] as unknown)) || JSON.stringify(params || {});
      const resp = await this.adapter.generate(String(prompt));
      const duration = Date.now() - started;
      return { success: true, data: (resp.raw ?? resp.text) as any, duration, toolName, timestamp: new Date() };
    } catch (err: any) {
      const duration = Date.now() - started;
      return { success: false, error: err?.message ?? String(err), duration, toolName, timestamp: new Date() };
    }
  }

  async hasTool(toolName: string): Promise<boolean> {
    const tools = await this.getAvailableTools();
    return tools.some((t) => t.name === toolName);
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  async getToolDefinition(toolName: string): Promise<McpToolDefinition | null> {
    const tools = await this.getAvailableTools();
    return tools.find((t) => t.name === toolName) || null;
  }
}

// A small factory that returns compatibility clients and caches them by name.
const clientMap: Map<string, CompatibilityMcpClient> = new Map();

export function getCompatibilityClient(serverName = 'default', adapter?: MCPAdapter): CompatibilityMcpClient {
  if (clientMap.has(serverName)) return clientMap.get(serverName)!;
  const client = new CompatibilityMcpClient(serverName, adapter);
  clientMap.set(serverName, client);
  return client;
}

export function resetCompatibilityClients(): void {
  clientMap.clear();
}

export default { CompatibilityMcpClient, getCompatibilityClient, resetCompatibilityClients };
