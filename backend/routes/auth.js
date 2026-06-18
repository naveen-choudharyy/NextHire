import express from 'express';
import { z } from 'zod';
import { authController } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation Schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    full_name: z.string().min(1, 'Full name is required').optional(),
    referral_code: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

const profileUpdateSchema = z.object({
  body: z.object({
    full_name: z.string().min(1).optional(),
    password: z.string().min(6).optional()
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

// Auth Routes (with strict rate limiting on registration and logins)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected Profile Routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validate(profileUpdateSchema), authController.updateProfile);
router.get('/security-logs', protect, authController.getSecurityLogs);

export default router;
