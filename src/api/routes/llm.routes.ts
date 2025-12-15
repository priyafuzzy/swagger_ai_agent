import { Router } from 'express';
import { buildPayloadHandler } from '../controllers/llm.controller';
import { validateBuildPayload } from '../validators/llm.validator';

const router = Router();

// POST /api/llm/build-payload
router.post('/build-payload', validateBuildPayload, buildPayloadHandler);

export default router;
