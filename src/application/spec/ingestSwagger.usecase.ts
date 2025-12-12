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
    raw = await fetchJsonFromUrl(source.url);
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
