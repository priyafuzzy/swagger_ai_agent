import { Router } from 'express';
import executionController from '../controllers/execution.controller';

const router = Router();

// POST /api/execution/plan -> create a run plan
router.post('/plan', executionController.planRunHandler);
// POST /api/execution/generate -> generate test cases for a spec (no persist)
router.post('/generate', executionController.generateTestsHandler);
// POST /api/execution/run -> execute a plan or plan+run
router.post('/run', executionController.runHandler);
// GET /api/execution/status/:runId -> get report
router.get('/status/:runId', executionController.getRunStatus);

export default router;
