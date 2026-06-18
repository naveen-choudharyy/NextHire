import { Payment } from '../models/Payment.js';
import { PaymentRequiredError } from '../utils/errors.js';

export const isPremium = async (req, res, next) => {
  try {
    // Admins always bypass premium checks
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Look for any completed payment for this user (basic or legacy premium)
    const activePayment = await Payment.findOne({
      userId: req.user._id,
      planType: { $in: ['basic', 'premium'] },
      status: 'completed'
    });

    if (!activePayment) {
      return next(new PaymentRequiredError('Resume plan purchase required to access this feature.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
