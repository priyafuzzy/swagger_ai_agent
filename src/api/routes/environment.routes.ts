import { Router } from 'express';
import envController from '../controllers/environment.controller';
import { validateCreateEnvironment, validateEnvIdParamMiddleware } from '../validators/environment.validator';

const router = Router();

// POST /api/environment -> create a new environment for a spec
router.post('/', validateCreateEnvironment, envController.createEnvironment);
// GET /api/environment/:envId -> get environment details
router.get('/:envId', validateEnvIdParamMiddleware, envController.getEnvironment);
// PUT /api/environment/:envId -> update environment
router.put('/:envId', validateEnvIdParamMiddleware, envController.updateEnvironment);
// DELETE /api/environment/:envId -> delete environment
router.delete('/:envId', validateEnvIdParamMiddleware, envController.deleteEnvironment);

export default router;
