import { Request, Response, NextFunction } from 'express';
import { specRepository } from '../../infrastructure/persistence';
import crypto from 'crypto';
import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { normalizeSpec } from '../../application/spec/normalizeSpec2.usecase';
import http from 'http';
import https from 'https';

async function fetchJsonFromUrl(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, (res) => {
        const { statusCode } = res;
        if (statusCode && statusCode >= 400) {
          reject(new Error(`Request failed with status ${statusCode}`));
          res.resume();
          return;
        }
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve(parsed);
          } catch (err) {
            // if not JSON, return raw
            resolve(raw);
          }
        });
      });
      req.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

export async function importSpec(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept either a raw spec in `body.raw` / `body.spec`, a `source` object, or the whole body.
    let raw = req.body?.raw || req.body?.spec || null;
    const source = req.body?.source || null;
    if (!raw) raw = req.body || {};

    // If a URL source is provided, fetch it
    if (source && source.type === 'url' && source.url) {
      try {
        const fetched = await fetchJsonFromUrl(source.url);
        if (fetched) raw = fetched;
      } catch (err) {
        // propagate fetch error
        return next(err);
      }
    }
    const id = `spec-${(crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(36)}`;

    let spec: NormalizedSpec;
    if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
      // Use the normalization use-case to produce a NormalizedSpec
      spec = await normalizeSpec(raw, { id });
    } else {
      // Fallback stub for empty input
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

    res.json({ specId: spec.id, title: spec.title, version: spec.version, operationCount: spec.operationCount });
  } catch (err) {
    next(err);
  }
}

export async function listSpecs(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await specRepository.list();
    res.json({ count: list.length, specs: list });
  } catch (err) {
    next(err);
  }
}

export default { importSpec, listSpecs };
