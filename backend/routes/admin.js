import express from 'express';
import { z } from 'zod';
import { adminController } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation Schemas
const reviewSchema = z.object({
  body: z.object({
    rating: z.union([z.number(), z.string()]), // accepts string rating from forms and parses in controller
    comment: z.string().min(5, 'Review comment must be at least 5 characters long')
  })
});

// Admin Dashboard stats (restricted to admin role only)
router.get('/stats', protect, isAdmin, adminController.getStats);
router.get('/payments/pending', protect, isAdmin, adminController.getPendingPayments);
router.post('/payments/:id/approve', protect, isAdmin, adminController.approvePayment);
router.post('/payments/:id/reject', protect, isAdmin, adminController.rejectPayment);

// Public reviews / Testimonials
router.get('/reviews', adminController.getReviews);
router.post('/reviews', protect, validate(reviewSchema), adminController.postReview);

export default router;
