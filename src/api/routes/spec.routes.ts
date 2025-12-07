import { Router } from 'express';

const router = Router();

// Minimal stub for /api/spec/import
router.post('/import', (req, res) => {
  const now = Date.now();
  const specId = `spec-${now}`;
  res.json({ specId, title: 'stubbed-spec', version: '0.0.1', operationCount: 0 });
});

export default router;
