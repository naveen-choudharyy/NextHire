import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/errors.js';

// Import models for seeding
import { User } from './models/User.js';
import { Review } from './models/Review.js';

// Import routes
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import aiRoutes from './routes/ai.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import jobsRoutes from './routes/jobs.js';
import mlRoutes from './routes/ml.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Reflect the request origin back or allow non-browser requests
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logger using Morgan integrated with Winston
const morganFormat = config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Body parser, reading data from body into req.body (and extracting raw body buffer for Webhooks)
app.use(express.json({
  limit: '10kb',
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.rawBody = buf.toString();
    }
  }
}));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Apply global rate limiter to all API endpoints
app.use('/api', apiLimiter);

// Health Check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'NextHire API (Node/Express)' });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/ml', mlRoutes);

// Catch-all for unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized Error Middleware
app.use(errorHandler);

// Database seed function
const seedData = async () => {
  try {
    // 1. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@nexthire.com' });
    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@nexthire.com',
        fullName: 'NextHire Administrator',
        referralCode: 'NH-ADMIN',
        role: 'admin',
        credits: 100
      });
      // Set password (hashes automatically in pre-save)
      adminUser.passwordHash = 'admin123';
      await adminUser.save();
      logger.info('Seeded admin account (admin@nexthire.com / admin123)');
    }

    // 2. Seed Testimonials/Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      // Create a mock user to assign reviews to
      let mockReviewer = await User.findOne({ email: 'user@test.com' });
      if (!mockReviewer) {
        mockReviewer = new User({
          email: 'user@test.com',
          fullName: 'Naveen Kumar',
          referralCode: 'NH-TESTER',
          role: 'user',
          credits: 0
        });
        mockReviewer.passwordHash = 'user123';
        await mockReviewer.save();
      }

      const reviews = [
        { userId: mockReviewer._id, rating: 5, comment: 'Helped me get shortlisted at Infosys! The AI achievement rewriter is pure magic.', isFeatured: true },
        { userId: mockReviewer._id, rating: 5, comment: 'A absolute steal at ₹30/resume. ATS score optimizer pointed out exactly what was missing.', isFeatured: true },
        { userId: mockReviewer._id, rating: 5, comment: 'Built my developer portfolio in 1-click. Downloaded the source and hosted it on my own server easily.', isFeatured: true },
        { userId: mockReviewer._id, rating: 4, comment: 'Very clean, ATS-friendly templates. Landed 3 interviews within 2 weeks of applying.', isFeatured: true }
      ];

      await Review.insertMany(reviews);
      logger.info('Seeded reviews/testimonials');
    }
  } catch (error) {
    logger.error(`Failed to seed data: ${error.message}`);
  }
};

// Start Server
const startServer = async () => {
  // Connect to DB
  await connectDB();

  // Run Seed Data
  await seedData();

  app.listen(config.port, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

startServer();

export default app;
