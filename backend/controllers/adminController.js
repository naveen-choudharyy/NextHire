import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { AuditLog } from '../models/AuditLog.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
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

  // Get all users (searchable)
  async getUsers(req, res, next) {
    try {
      const { q } = req.query;
      let filter = {};
      
      if (q) {
        const regex = new RegExp(q, 'i');
        filter = {
          $or: [
            { fullName: regex },
            { email: regex }
          ]
        };
      }

      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json(users.map(u => u.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  // Update user role
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (id === req.user._id.toString()) {
        return next(new ForbiddenError('You cannot change your own admin role.'));
      }

      const user = await User.findById(id);
      if (!user) {
        return next(new NotFoundError('User not found.'));
      }

      const oldRole = user.role;
      user.role = role;
      await user.save();

      await AuditLog.create({
        userId: req.user._id,
        action: 'ADMIN_USER_ROLE_UPDATE',
        status: 'success',
        details: { targetUserId: id, oldRole, newRole: role }
      });

      res.status(200).json({ message: `User role updated to ${role} successfully.`, user: user.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  // Update user credits
  async updateUserCredits(req, res, next) {
    try {
      const { id } = req.params;
      const { credits } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return next(new NotFoundError('User not found.'));
      }

      const oldCredits = user.credits;
      user.credits = credits;
      await user.save();

      await AuditLog.create({
        userId: req.user._id,
        action: 'ADMIN_USER_CREDITS_UPDATE',
        status: 'success',
        details: { targetUserId: id, oldCredits, newCredits: credits }
      });

      res.status(200).json({ message: `User credits updated to ${credits} successfully.`, user: user.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  // Delete user cascade
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (id === req.user._id.toString()) {
        return next(new ForbiddenError('You cannot delete your own admin account.'));
      }

      const user = await User.findById(id);
      if (!user) {
        return next(new NotFoundError('User not found.'));
      }

      // Cascade delete resumes & reviews
      await Resume.deleteMany({ userId: id });
      await Review.deleteMany({ userId: id });
      
      // Delete user
      await User.findByIdAndDelete(id);

      await AuditLog.create({
        userId: req.user._id,
        action: 'ADMIN_USER_DELETE',
        status: 'success',
        details: { targetUserId: id, email: user.email, name: user.fullName }
      });

      res.status(200).json({ message: 'User and all associated data deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // Get all reviews for moderation
  async getAllReviews(req, res, next) {
    try {
      const reviews = await Review.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      res.status(200).json(reviews.map(r => {
        const json = r.toJSON();
        json.user_email = r.userId ? r.userId.email : 'Unknown';
        json.user_name = r.userId ? r.userId.fullName : 'Unknown';
        return json;
      }));
    } catch (error) {
      next(error);
    }
  }

  // Toggle review featured status
  async toggleReviewFeatured(req, res, next) {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return next(new NotFoundError('Review not found.'));
      }

      review.isFeatured = isFeatured;
      await review.save();

      await AuditLog.create({
        userId: req.user._id,
        action: 'ADMIN_REVIEW_FEATURE_TOGGLE',
        status: 'success',
        details: { reviewId: id, isFeatured }
      });

      res.status(200).json({ message: `Review featured status set to ${isFeatured}.`, review: review.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return next(new NotFoundError('Review not found.'));
      }

      await Review.findByIdAndDelete(id);

      await AuditLog.create({
        userId: req.user._id,
        action: 'ADMIN_REVIEW_DELETE',
        status: 'success',
        details: { reviewId: id, comment: review.comment }
      });

      res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // Get all audit logs
  async getAuditLogs(req, res, next) {
    try {
      const logs = await AuditLog.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(200);

      res.status(200).json(logs.map(l => {
        const json = l.toJSON();
        json.user_email = l.userId ? l.userId.email : 'System/Anonymous';
        json.user_name = l.userId ? l.userId.fullName : 'System/Anonymous';
        return json;
      }));
    } catch (error) {
      next(error);
    }
  }

  // Get all payments (transactions ledger)
  async getPayments(req, res, next) {
    try {
      const payments = await Payment.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(200);

      res.status(200).json(payments.map(p => {
        const json = p.toJSON();
        json.user_email = p.userId ? p.userId.email : 'Unknown';
        json.user_name = p.userId ? p.userId.fullName : 'Unknown';
        return json;
      }));
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
