import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { userService } from '../services/userService.js';

class AdminController {
  // Get dashboard stats
  async getStats(req, res, next) {
    try {
      const totalUsers = await User.countDocuments();
      const totalResumes = await Resume.countDocuments();

      // Calculate total revenue
      const completedPayments = await Payment.find({ status: 'completed' });
      const totalRevenue = completedPayments.reduce((acc, p) => acc + p.amount, 0);

      // Template usage analytics
      const templateCounts = {};
      const resumes = await Resume.find({}, 'templateId');
      for (const r of resumes) {
        templateCounts[r.templateId] = (templateCounts[r.templateId] || 0) + 1;
      }

      // Calculate signups over the last 7 days
      const today = new Date();
      const dailySignups = [];

      for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        
        const startTime = new Date(day.setHours(0, 0, 0, 0));
        const endTime = new Date(day.setHours(23, 59, 59, 999));

        const count = await User.countDocuments({
          createdAt: {
            $gte: startTime,
            $lte: endTime
          }
        });

        const dateStr = startTime.toISOString().split('T')[0];
        dailySignups.push({
          date: dateStr,
          count
        });
      }
      dailySignups.reverse();

      // Get last 15 payments
      const lastPayments = await Payment.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(15);

      res.status(200).json({
        total_users: totalUsers,
        total_resumes: totalResumes,
        total_revenue: totalRevenue,
        template_analytics: templateCounts,
        daily_signups: dailySignups,
        payments: lastPayments.map(p => p.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  // Get testimonials
  async getReviews(req, res, next) {
    try {
      const reviews = await Review.find()
        .populate('userId', 'fullName')
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json(reviews.map(r => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  // Submit/update testimonial
  async postReview(req, res, next) {
    try {
      const { rating, comment } = req.body;
      const userId = req.user._id;

      if (!rating || !comment) {
        return next(new BadRequestError('Rating and comment are required.'));
      }

      const ratingVal = parseInt(rating, 10);
      if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
        return next(new BadRequestError('Rating must be an integer between 1 and 5.'));
      }

      // Check if user already submitted a review
      let review = await Review.findOne({ userId });

      if (review) {
        review.rating = ratingVal;
        review.comment = comment;
        review.isFeatured = ratingVal >= 4;
        await review.save();
      } else {
        review = await Review.create({
          userId,
          rating: ratingVal,
          comment,
          isFeatured: ratingVal >= 4
        });
      }

      res.status(201).json({
        message: 'Review submitted successfully',
        review: review.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Get payments pending manual verification
  async getPendingPayments(req, res, next) {
    try {
      const pendingPayments = await Payment.find({ status: 'verifying' })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      res.status(200).json(pendingPayments.map(p => {
        const json = p.toJSON();
        json.user_email = p.userId ? p.userId.email : 'Unknown';
        json.user_name = p.userId ? p.userId.fullName : 'Unknown';
        return json;
      }));
    } catch (error) {
      next(error);
    }
  }

  // Approve payment manually
  async approvePayment(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id);

      if (!payment) {
        return next(new NotFoundError('Payment record not found.'));
      }

      if (payment.status === 'completed') {
        return res.status(200).json({ message: 'Payment already approved.' });
      }

      payment.status = 'completed';
      await payment.save();

      // Trigger user profile features unlock / referral hooks
      const user = await User.findById(payment.userId);
      if (user) {
        await userService.processReferralReward(user);
      }

      res.status(200).json({ message: 'Payment approved successfully.', payment: payment.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  // Reject payment manually
  async rejectPayment(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id);

      if (!payment) {
        return next(new NotFoundError('Payment record not found.'));
      }

      payment.status = 'failed';
      await payment.save();

      res.status(200).json({ message: 'Payment rejected successfully.', payment: payment.toJSON() });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
