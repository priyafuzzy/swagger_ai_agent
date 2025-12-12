import { Router } from 'express';
import envController from '../controllers/environment.controller';

const router = Router();

// POST /api/environment -> create a new environment for a spec
router.post('/', envController.createEnvironment);
// GET /api/environment/:envId -> get environment details
router.get('/:envId', envController.getEnvironment);
// PUT /api/environment/:envId -> update environment
router.put('/:envId', envController.updateEnvironment);
// DELETE /api/environment/:envId -> delete environment
router.delete('/:envId', envController.deleteEnvironment);

export default router;
