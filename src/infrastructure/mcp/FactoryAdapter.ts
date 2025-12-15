import MCPAdapter from '../../domain/adapters/MCPAdapter';
import { MockMCPAdapter } from './MockMCPAdapter';
import * as SwaggerLoader from '../swagger/SwaggerLoader';
import { specRepository } from '../persistence';
import OpenApiNormalizer from '../swagger/OpenApiNormalizer';
import SwaggerValidator from '../swagger/validator';
import logger from '../logging/Logger';

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
    // Provide default tools including text generation and swagger helpers
    return [
      { name: 'text_generation', description: 'Generate text from prompt', parameters: [{ name: 'prompt', type: 'string', description: 'User prompt', required: true }] },
      { name: 'swagger.fetch', description: 'Fetch and parse a remote Swagger/OpenAPI spec by URL', parameters: [{ name: 'url', type: 'string', description: 'Spec URL', required: true }] },
      { name: 'swagger.parse', description: 'Parse raw Swagger/OpenAPI content (JSON or YAML)', parameters: [{ name: 'content', type: 'string', description: 'Spec content', required: true }] },
      { name: 'swagger.listOperations', description: 'List operations from a normalized spec by id', parameters: [{ name: 'specId', type: 'string', description: 'Normalized spec id', required: true }] },
      { name: 'swagger.normalize', description: 'Normalize a raw OpenAPI/Swagger document and persist as a normalized spec', parameters: [{ name: 'specId', type: 'string', description: 'Optional id to assign', required: false }, { name: 'raw', type: 'object', description: 'Parsed spec object', required: false }, { name: 'content', type: 'string', description: 'Raw spec content (JSON/YAML)', required: false }, { name: 'url', type: 'string', description: 'URL to fetch a spec from before normalizing', required: false }] },
      { name: 'swagger.validate', description: 'Validate a spec payload or existing normalized spec id', parameters: [{ name: 'specId', type: 'string', description: 'Normalized spec id', required: false }, { name: 'raw', type: 'object', description: 'Parsed spec object', required: false }, { name: 'content', type: 'string', description: 'Raw spec content (JSON/YAML)', required: false }] },
    ];
  }

  async executeTool<T = unknown>(toolName: string, params: Record<string, unknown>): Promise<McpToolResult<T>> {
    const started = Date.now();
    try {
      // Handle swagger helpers locally
      if (toolName === 'swagger.fetch') {
        const url = params && (params['url'] as string);
        if (!url) throw new Error('url parameter is required');
        const data = await SwaggerLoader.fetchJsonFromUrl(url);
        const duration = Date.now() - started;
        return { success: true, data: data as any, duration, toolName, timestamp: new Date() };
      }

      if (toolName === 'swagger.parse') {
        const content = params && (params['content'] as string);
        if (!content) throw new Error('content parameter is required');
        // try JSON then YAML
        try {
          const parsed = JSON.parse(content);
          const duration = Date.now() - started;
          return { success: true, data: parsed as any, duration, toolName, timestamp: new Date() };
        } catch (e) {
          const parsed = require('js-yaml').load(content);
          const duration = Date.now() - started;
          return { success: true, data: parsed as any, duration, toolName, timestamp: new Date() };
        }
      }

      if (toolName === 'swagger.listOperations') {
        const specId = params && (params['specId'] as string);
        if (!specId) throw new Error('specId parameter is required');
        const spec = await specRepository.getById(specId);
        if (!spec) throw new Error(`Spec not found: ${specId}`);
        const ops = (spec.operations || []).map((o: any) => ({ operationId: o.operationId, method: o.method, path: o.path, summary: o.summary }));
        const duration = Date.now() - started;
        return { success: true, data: ops as any, duration, toolName, timestamp: new Date() };
      }

      if (toolName === 'swagger.normalize') {
        // Accept raw object, content string, or url to fetch
        const specIdOpt = params && (params['specId'] as string);
        let raw = params && (params['raw'] as any);
        const content = params && (params['content'] as string);
        const url = params && (params['url'] as string);
        if (!raw) {
          if (content) {
            try {
              raw = JSON.parse(content);
            } catch (_) {
              raw = require('js-yaml').load(content);
            }
          } else if (url) {
            raw = await SwaggerLoader.fetchJsonFromUrl(url);
          }
        }
        if (!raw) throw new Error('No spec provided (raw, content or url)');
        // Normalize and persist
        const normalized = OpenApiNormalizer.normalize(raw, { id: specIdOpt });
        await specRepository.save(normalized as any);
        const duration = Date.now() - started;
        return { success: true, data: normalized as any, duration, toolName, timestamp: new Date() };
      }

      if (toolName === 'swagger.validate') {
        const specId = params && (params['specId'] as string);
        let raw = params && (params['raw'] as any);
        const content = params && (params['content'] as string);
        if (!raw && content) {
          try { raw = JSON.parse(content); } catch (_) { raw = require('js-yaml').load(content); }
        }
        if (!raw && specId) {
          const spec = await specRepository.getById(specId);
          if (!spec) throw new Error(`Spec not found: ${specId}`);
          raw = spec.raw || spec;
        }
        if (!raw) throw new Error('No spec provided to validate');

        const result = SwaggerValidator.validateSpec(raw);
        const duration = Date.now() - started;
        return { success: result.valid, data: result, duration, toolName, timestamp: new Date() } as any;
      }

      // Fallback: For common case, expect { prompt: string }
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
