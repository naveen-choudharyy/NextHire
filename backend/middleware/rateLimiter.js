import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// Stricter auth limiter (login/register/forgot-password)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 auth requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login or registration attempts. Please try again after an hour.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip} on path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// Payment order creation & verification limiter
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 order creation/verifications per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many payment operations. Please wait a few minutes before trying again.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Payment rate limit exceeded for IP: ${req.ip} on path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});
