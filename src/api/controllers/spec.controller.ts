import { Request, Response, NextFunction } from 'express';
import { specRepository } from '../../infrastructure/persistence';
import { ingestSwagger } from '../../application/spec/ingestSwagger.usecase';
import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { getSpecById } from '../../application/spec/getSpec.usecase';
import { listOperationsForSpec } from '../../application/spec/listOperations.usecase';
import { listTagsForSpec } from '../../application/spec/listTags.usecase';
import { validateSpec } from '../../application/spec/validateSpec.usecase';

export async function importSpec(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept either a raw spec in `body.raw` / `body.spec`, a `source` object, or the whole body.
    let raw = req.body?.raw || req.body?.spec || null;
    const source = req.body?.source || null;
    if (!raw) raw = req.body || {};

    // Delegate to the ingest use-case which handles URL fetching, normalization and persistence
    const spec: NormalizedSpec = await ingestSwagger({ source, raw });

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

export async function getSpec(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const spec = await getSpecById(specId);
    res.json(spec);
  } catch (err) {
    next(err);
  }
}

export async function getOperations(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const ops = await listOperationsForSpec(specId);
    res.json({ count: ops.length, operations: ops });
  } catch (err) {
    next(err);
  }
}

export async function getTags(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const tags = await listTagsForSpec(specId);
    res.json({ count: tags.length, tags });
  } catch (err) {
    next(err);
  }
}

export async function postValidateSpec(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const result = await validateSpec(specId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export default { importSpec, listSpecs, getSpec, getOperations, getTags, postValidateSpec };
