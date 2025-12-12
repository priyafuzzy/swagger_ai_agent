import { Router } from 'express';
import specController from '../controllers/spec.controller';
import environmentController from '../controllers/environment.controller';

const router = Router();

// POST /api/spec/import -> delegates to controller
router.post('/import', specController.importSpec);
router.get('/', specController.listSpecs);

// Spec introspection
router.get('/:specId', specController.getSpec);
router.get('/:specId/operations', specController.getOperations);
router.get('/:specId/tags', specController.getTags);
router.post('/:specId/validate', specController.postValidateSpec);

// GET /api/spec/:specId/environments -> list environments for a spec
router.get('/:specId/environments', environmentController.listEnvironments);

export default router;
