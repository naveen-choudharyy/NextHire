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

const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'admin'], {
      required_error: 'Role is required and must be either "user" or "admin"'
    })
  })
});

const updateUserCreditsSchema = z.object({
  body: z.object({
    credits: z.number({
      required_error: 'Credits must be a number'
    }).min(0, 'Credits cannot be negative')
  })
});

const toggleReviewFeaturedSchema = z.object({
  body: z.object({
    isFeatured: z.boolean({
      required_error: 'isFeatured is required and must be a boolean'
    })
  })
});

// Admin Dashboard stats (restricted to admin role only)
router.get('/stats', protect, isAdmin, adminController.getStats);
router.get('/payments/pending', protect, isAdmin, adminController.getPendingPayments);
router.post('/payments/:id/approve', protect, isAdmin, adminController.approvePayment);
router.post('/payments/:id/reject', protect, isAdmin, adminController.rejectPayment);

// User Management (Admin only)
router.get('/users', protect, isAdmin, adminController.getUsers);
router.put('/users/:id/role', protect, isAdmin, validate(updateUserRoleSchema), adminController.updateUserRole);
router.put('/users/:id/credits', protect, isAdmin, validate(updateUserCreditsSchema), adminController.updateUserCredits);
router.delete('/users/:id', protect, isAdmin, adminController.deleteUser);

// Review Moderation (Admin only)
router.get('/reviews/all', protect, isAdmin, adminController.getAllReviews);
router.put('/reviews/:id/feature', protect, isAdmin, validate(toggleReviewFeaturedSchema), adminController.toggleReviewFeatured);
router.delete('/reviews/:id', protect, isAdmin, adminController.deleteReview);

// Audit Logs & Full Payments ledger (Admin only)
router.get('/logs', protect, isAdmin, adminController.getAuditLogs);
router.get('/payments', protect, isAdmin, adminController.getPayments);

// Public reviews / Testimonials
router.get('/reviews', adminController.getReviews);
router.post('/reviews', protect, validate(reviewSchema), adminController.postReview);

export default router;
