import express from 'express';
import { z } from 'zod';
import { resumeController } from '../controllers/resumeController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation Schemas
const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    template_id: z.string().min(1).optional(),
    content: z.record(z.any()).optional()
  })
});

const updateResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    template_id: z.string().min(1).optional(),
    content: z.record(z.any()).optional(),
    ats_score: z.number().min(0).max(100).optional(),
    is_public: z.boolean().optional(),
    portfolio_slug: z.string().min(1).optional()
  })
});

// Resume routes
router.get('/', protect, resumeController.getAllResumes);
router.post('/', protect, validate(createResumeSchema), resumeController.createResume);

// Public live portfolio route (must be registered before /:id parameter match)
router.get('/public/:slug', resumeController.getPublicResume);

// Single resume routes
router.get('/:id', optionalProtect, resumeController.getResume);
router.put('/:id', protect, validate(updateResumeSchema), resumeController.updateResume);
router.delete('/:id', protect, resumeController.deleteResume);

// Download window route
router.post('/:id/download-start', protect, resumeController.startDownloadWindow);

export default router;
