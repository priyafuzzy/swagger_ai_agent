import { Request, Response, NextFunction } from 'express';
import { environmentRepository } from '../../infrastructure/persistence';
import { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';
import createEnvironmentUsecase from '../../application/environment/createEnvironment.usecase';
import listEnvironmentsUsecase from '../../application/environment/listEnvironments.usecase';
import { validateCreateEnvironmentPayload, validateSpecIdParam } from '../validators/environment.validator';
import getEnvironmentUsecase from '../../application/environment/getEnvironment.usecase';
import updateEnvironmentUsecase from '../../application/environment/updateEnvironment.usecase';
import deleteEnvironmentUsecase from '../../application/environment/deleteEnvironment.usecase';
import { validateEnvIdParam, validateUpdateEnvironmentPayload } from '../validators/environment.validator';

export async function createEnvironment(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, name, baseUrl, defaultHeaders, auth } = req.body || {};
    const input = { specId, name, baseUrl, defaultHeaders, auth };
    const errors = validateCreateEnvironmentPayload(input);
    if (errors.length) return res.status(400).json({ errors });
    const env = await createEnvironmentUsecase(environmentRepository as any, input as any);
    res.status(201).json({ id: env.id, specId: env.specId, name: env.name, baseUrl: env.baseUrl });
  } catch (err) {
    // If validation-like error, send 400
    if (err && (err as Error).message && (err as Error).message.includes('required')) {
      return res.status(400).json({ error: (err as Error).message });
    }
    next(err);
  }
}

export async function listEnvironments(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const specErr = validateSpecIdParam(specId);
    if (specErr) return res.status(400).json({ error: specErr });
    const list = await listEnvironmentsUsecase(environmentRepository as any, specId);
    res.json({ count: list.length, environments: list });
  } catch (err) {
    next(err);
  }
}

export async function getEnvironment(req: Request, res: Response, next: NextFunction) {
  try {
    const envId = req.params.envId;
    const err = validateEnvIdParam(envId);
    if (err) return res.status(400).json({ error: err });
    const env = await getEnvironmentUsecase(environmentRepository as any, envId);
    if (!env) return res.status(404).json({ error: 'environment not found' });
    res.json(env);
  } catch (err) {
    next(err);
  }
}

export async function updateEnvironment(req: Request, res: Response, next: NextFunction) {
  try {
    const envId = req.params.envId;
    const envErr = validateEnvIdParam(envId);
    if (envErr) return res.status(400).json({ error: envErr });
    const payload = req.body || {};
    const errors = validateUpdateEnvironmentPayload(payload);
    if (errors.length) return res.status(400).json({ errors });
    const updated = await updateEnvironmentUsecase(environmentRepository as any, envId, payload as any);
    res.json(updated);
  } catch (err) {
    if (err && (err as Error).message && (err as Error).message.includes('not found')) return res.status(404).json({ error: (err as Error).message });
    next(err);
  }
}

export async function deleteEnvironment(req: Request, res: Response, next: NextFunction) {
  try {
    const envId = req.params.envId;
    const err = validateEnvIdParam(envId);
    if (err) return res.status(400).json({ error: err });
    await deleteEnvironmentUsecase(environmentRepository as any, envId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export default { createEnvironment, listEnvironments, getEnvironment, updateEnvironment, deleteEnvironment };
