import express from 'express';
import { z } from 'zod';
import { paymentController } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation Schemas
const createOrderSchema = z.object({
  body: z.object({
    plan_type: z.enum(['basic', 'premium', 'resume_cover', 'resume_portfolio']),
    simulate: z.boolean().optional() // Ignored in production, kept for API compatibility with old client
  })
});

const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Order ID is required'),
    transaction_id: z.string().regex(/^\d{12}$/, 'Transaction ID must be a 12-digit number').optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional()
  })
});

// Payment Routes
router.post('/order', protect, paymentLimiter, validate(createOrderSchema), paymentController.createOrder);
router.post('/verify', protect, paymentLimiter, validate(verifyPaymentSchema), paymentController.verifyPayment);
router.get('/status', protect, paymentController.getPaymentStatus);
router.get('/history', protect, paymentController.getPaymentHistory);
router.get('/verify-keys', protect, paymentController.verifyKeys);

// Public webhook route (called directly by Razorpay)
router.post('/webhook', paymentController.webhook);

export default router;
