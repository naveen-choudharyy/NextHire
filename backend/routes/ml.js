import express from 'express';
import { z } from 'zod';
import { mlController } from '../controllers/mlController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const skillGapSchema = z.object({
  body: z.object({
    job_description: z.string().min(1, 'Job description is required')
  })
});

// Protect all routes in this router
router.use(protect);

router.post('/predict/:resumeId', mlController.predictResumeCategory.bind(mlController));
router.post('/insights/:resumeId', mlController.getResumeInsights.bind(mlController));
router.post('/skill-gap/:resumeId', validate(skillGapSchema), mlController.getSkillGapAnalysis.bind(mlController));

export default router;
