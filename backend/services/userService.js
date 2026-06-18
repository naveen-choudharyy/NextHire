import crypto from 'crypto';
import { User } from '../models/User.js';
import { Referral } from '../models/Referral.js';
import { Payment } from '../models/Payment.js';
import { logger } from '../utils/logger.js';
import { AuditLog } from '../models/AuditLog.js';

class UserService {
  // Generate a unique referral code
  async generateUniqueReferralCode() {
    let code;
    let exists = true;
    while (exists) {
      code = `NH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const user = await User.findOne({ referralCode: code });
      if (!user) exists = false;
    }
    return code;
  }

  // Handle first payment referral reward logic
  async processReferralReward(user, session = null) {
    return; // Referral logic disabled per user request
    if (!user || !user.referredBy) return;

    try {
      // 1. Check if referee already has an associated referral record
      const existingReferral = await Referral.findOne({ refereeId: user._id });
      if (existingReferral) return; // Already processed!

      // 2. Find referrer
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (!referrer) return;

      // 3. Award ₹5 credits to referrer
      referrer.credits += 5;
      await referrer.save({ session });

      // 4. Record the referral
      const referralRecord = await Referral.create(
        [{
          referrerId: referrer._id,
          refereeId: user._id,
          creditsAwarded: 5
        }],
        { session }
      );

      logger.info(`Referral reward processed. Referrer: ${referrer.email}, Referee: ${user.email}, credits: +₹5`);
      await AuditLog.create([{
        userId: referrer._id,
        action: 'REFERRAL_REWARD_AWARDED',
        status: 'success',
        details: { refereeId: user._id, credits: 5 }
      }], { session });

      // 5. Count successful referrals for this referrer
      const successfulReferralsCount = await Referral.countDocuments({ referrerId: referrer._id });

      // Every 6 successful referrals, award 1 free basic resume slot
      if (successfulReferralsCount % 6 === 0) {
        const freeOrderId = `free_ref_${crypto.randomBytes(8).toString('hex')}`;
        await Payment.create(
          [{
            userId: referrer._id,
            amount: 0.0,
            planType: 'basic',
            status: 'completed',
            razorpayOrderId: freeOrderId,
            razorpayPaymentId: 'referral_bonus_free_slot'
          }],
          { session }
        );

        logger.info(`Referrer ${referrer.email} achieved ${successfulReferralsCount} referrals. Awarded 1 free basic resume slot.`);
        await AuditLog.create([{
          userId: referrer._id,
          action: 'FREE_SLOT_AWARDED',
          status: 'success',
          details: { referralsCount: successfulReferralsCount, orderId: freeOrderId }
        }], { session });
      }
    } catch (error) {
      logger.error(`Failed to process referral reward: ${error.message}`);
      // Don't throw, prevent crashing the core payment completion flow
    }
  }
}

export const userService = new UserService();
