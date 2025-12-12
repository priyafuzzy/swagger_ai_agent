import { Router } from 'express';
import specController from '../controllers/spec.controller';
import environmentController from '../controllers/environment.controller';

const router = Router();

// POST /api/spec/import -> delegates to controller
router.post('/import', specController.importSpec);
router.get('/', specController.listSpecs);
// GET /api/spec/:specId/environments -> list environments for a spec
router.get('/:specId/environments', environmentController.listEnvironments);

export default router;
