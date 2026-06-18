import express from 'express';
import { z } from 'zod';
import { aiController } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { isPremium } from '../middleware/premium.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation Schemas
const summarySchema = z.object({
  body: z.object({
    profile: z.record(z.any())
  })
});

const rewriteSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text to rewrite is required')
  })
});

const suggestSkillsSchema = z.object({
  body: z.object({
    role: z.string().min(1, 'Role description is required')
  })
});

const grammarSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text is required')
  })
});

const atsScoreSchema = z.object({
  body: z.object({
    content: z.record(z.any())
  })
});

const linkedinSchema = z.object({
  body: z.object({
    content: z.record(z.any())
  })
});

const coverLetterSchema = z.object({
  body: z.object({
    content: z.record(z.any()),
    job_description: z.string().min(1, 'Job description is required')
  })
});

// AI Routes
router.post('/summary', protect, validate(summarySchema), aiController.generateSummary);
router.post('/rewrite-achievement', protect, validate(rewriteSchema), aiController.rewriteAchievement);
router.post('/suggest-skills', protect, validate(suggestSkillsSchema), aiController.suggestSkills);
router.post('/grammar-correct', protect, validate(grammarSchema), aiController.grammarCorrect);
router.post('/ats-score', protect, validate(atsScoreSchema), aiController.atsScore);

// Premium AI Routes (guarded by isPremium check)
router.post('/linkedin', protect, isPremium, validate(linkedinSchema), aiController.linkedinOptimize);
router.post('/cover-letter', protect, isPremium, validate(coverLetterSchema), aiController.coverLetter);

export default router;
