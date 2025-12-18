import crypto from 'crypto';
import { specRepository } from '../../infrastructure/persistence';
import { fetchJsonFromUrl } from '../../infrastructure/swagger/SwaggerLoader';
import { normalizeSpec } from './normalizeSpec2.usecase';
import { NormalizedSpec } from '../../domain/models/NormalizedSpec';

type IngestInput = {
  source?: any;
  raw?: any;
  id?: string;
};

export async function ingestSwagger(input: IngestInput): Promise<NormalizedSpec> {
  let raw = input.raw || null;
  const source = input.source || null;

  if (!raw && source && source.type === 'url' && source.url) {
    try {
      // protect external fetch with a timeout to avoid hanging the request
      const fetchPromise = fetchJsonFromUrl(source.url);
      const timeoutMs = 15000;
      raw = await Promise.race([
        fetchPromise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('fetch timeout')), timeoutMs)),
      ]);
    } catch (err) {
      // Log and rethrow so controller's error handler returns a 500
      // Avoid swallowing network errors which may indicate invalid URL or network issues
      const msg = err && (err as any).message ? (err as any).message : String(err);
      throw new Error(`Failed to fetch spec from URL: ${msg}`);
    }
  }

  const id = input.id || `spec-${(crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(36)}`;

  let spec: NormalizedSpec;
  if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
    spec = await normalizeSpec(raw, { id });
  } else {
    spec = {
      id,
      title: `imported-${id}`,
      version: '0.0.1',
      servers: [],
      tags: [],
      operationCount: 0,
      operations: [],
      raw: { source: raw },
    } as NormalizedSpec;
  }

  await specRepository.save(spec as any);
  return spec;
}

export default ingestSwagger;
