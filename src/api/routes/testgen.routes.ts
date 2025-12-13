import { Router } from 'express';
import testgenController from '../controllers/testgen.controller';
import { validateGenerateAxiosTests } from '../validators/testgen.validator';

const router = Router();

// POST /api/testgen/generate-axios-tests
router.post('/generate-axios-tests', validateGenerateAxiosTests, testgenController.generateAxiosTestsHandler);

export default router;
