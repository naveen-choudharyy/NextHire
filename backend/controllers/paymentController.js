import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { paymentService } from '../services/paymentService.js';
import { userService } from '../services/userService.js';
import { logger } from '../utils/logger.js';
import { AuditLog } from '../models/AuditLog.js';
import { config } from '../config/index.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

const PRICING_PLANS = {
  basic: 1.00
};

class PaymentController {
  // Create order
  async createOrder(req, res, next) {
    try {
      const { plan_type } = req.body;
      const userId = req.user._id;
      let orderId;

      if (!PRICING_PLANS[plan_type]) {
        return next(new BadRequestError('Invalid plan type selected.'));
      }

      const planPrice = PRICING_PLANS[plan_type];
      const user = req.user;

      // Calculate applied credits (disabled)
      const usedCredits = 0;
      const amount = planPrice;

      // 1. Check if credits fully cover the price
      if (amount === 0) {
        // Deduct credits immediately
        user.credits -= Math.floor(usedCredits);
        await user.save();

        const orderId = `credit_use_${crypto.randomBytes(8).toString('hex')}`;

        const paymentRecord = await Payment.create({
          userId,
          amount: 0.0,
          planType: plan_type,
          status: 'completed',
          razorpayOrderId: orderId,
          razorpayPaymentId: 'paid_with_credits'
        });

        // Award referral payouts if applicable
        await userService.processReferralReward(user);

        await AuditLog.create({
          userId,
          action: 'PAYMENT_VIA_CREDITS',
          status: 'success',
          details: { planType: plan_type, amount: 0.0, orderId }
        });

        return res.status(201).json({
          order_id: orderId,
          amount: 0,
          currency: 'INR',
          plan_type,
          razorpay_key_id: config.razorpayKeyId,
          paid_with_credits: true
        });
      }

      // 2. Check if sandbox simulation should be run
      const simulate = req.body.simulate || config.razorpayKeyId === 'rzp_test_mock_123456';

      if (simulate) {
        orderId = `sim_ord_${crypto.randomBytes(8).toString('hex')}`;
        await Payment.create({
          userId,
          amount,
          planType: plan_type,
          status: 'pending',
          razorpayOrderId: orderId
        });

        await AuditLog.create({
          userId,
          action: 'PAYMENT_ORDER_SIMULATED',
          status: 'success',
          details: { planType: plan_type, amount, orderId }
        });

        return res.status(201).json({
          order_id: orderId,
          amount: amount * 100, // paise
          currency: 'INR',
          plan_type,
          razorpay_key_id: 'rzp_test_mock_123456',
          is_simulated: true
        });
      }

      // 3. Otherwise create a Razorpay Order
      const receiptId = `rcpt_${crypto.randomBytes(6).toString('hex')}`;

      try {
        const rzpOrder = await paymentService.createRazorpayOrder(
          Math.floor(amount * 100), // paise
          receiptId
        );
        orderId = rzpOrder.id;
      } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || 'Authentication failed or connection error';
        logger.error(`Razorpay order creation failed: ${errMsg}`);
        return next(new BadRequestError(`Razorpay order creation failed: ${errMsg}. Please configure API keys or verify connections.`));
      }

      // 4. Create pending payment record
      await Payment.create({
        userId,
        amount,
        planType: plan_type,
        status: 'pending',
        razorpayOrderId: orderId
      });

      await AuditLog.create({
        userId,
        action: 'PAYMENT_ORDER_CREATED',
        status: 'success',
        details: { planType: plan_type, amount, orderId }
      });

      res.status(201).json({
        order_id: orderId,
        amount: amount * 100, // paise
        currency: 'INR',
        plan_type,
        razorpay_key_id: config.razorpayKeyId,
        is_simulated: false
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify payment
  async verifyPayment(req, res, next) {
    try {
      const { razorpay_order_id, transaction_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (transaction_id) {
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) {
          return next(new NotFoundError(`Payment transaction not found for Order ID: ${razorpay_order_id}`));
        }

        if (payment.status === 'completed') {
          return res.status(200).json({
            message: 'Payment already verified and completed.',
            status: 'completed',
            payment: payment.toJSON()
          });
        }

        // Set status to completed and save transaction ID
        payment.status = 'completed';
        payment.razorpayPaymentId = transaction_id;
        await payment.save();

        // Trigger user profile features unlock / referral hooks
        const user = await User.findById(payment.userId);
        if (user) {
          await userService.processReferralReward(user);
        }

        await AuditLog.create({
          userId: payment.userId,
          action: 'PAYMENT_COMPLETED_VIA_UTR',
          status: 'success',
          details: { orderId: razorpay_order_id, transactionId: transaction_id }
        });

        return res.status(200).json({
          message: 'Payment verified successfully.',
          status: 'completed',
          payment: payment.toJSON()
        });
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new BadRequestError('All Razorpay response fields are required.'));
      }

      // Invoke centralized verification service
      const payment = await paymentService.completePayment({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        checkStatusApi: true // Perform double-verification
      });

      res.status(200).json({
        message: 'Payment verified successfully',
        status: 'completed',
        payment: payment.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Webhook receiver
  async webhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      
      // We need raw request body to verify webhook signature
      const rawBody = req.rawBody || JSON.stringify(req.body);

      // Verify signature
      if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
        logger.warn('Razorpay webhook signature verification failed.');
        await AuditLog.create({
          action: 'WEBHOOK_VERIFICATION_FAILED',
          status: 'warning',
          details: { signature }
        });
        return next(new BadRequestError('Invalid webhook signature.'));
      }

      const event = req.body.event;
      logger.info(`Received Razorpay Webhook event: ${event}`);

      if (event === 'payment.captured' || event === 'order.paid') {
        const payload = req.body.payload;
        const paymentEntity = payload.payment.entity;
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        // Process payment capture asynchronously (idempotent checks handled inside service)
        await paymentService.completePayment({
          orderId,
          paymentId,
          checkStatusApi: false // Webhook trigger indicates it's already captured, bypass double-fetch to save API calls
        });

        await AuditLog.create({
          action: 'WEBHOOK_PAYMENT_PROCESSED',
          status: 'success',
          details: { event, orderId, paymentId }
        });
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error(`Webhook processing failed: ${error.message}`);
      // Send 200 OK regardless to acknowledge receipt to Razorpay (prevent webhook retry loops)
      res.status(200).json({ status: 'error', message: error.message });
    }
  }

  // Get active plans and plan checks
  async getPaymentStatus(req, res, next) {
    try {
      const payments = await Payment.find({ userId: req.user._id, status: 'completed' });
      const plans = payments.map(p => p.planType);

      res.status(200).json({
        purchased_plans: plans,
        has_premium: plans.includes('basic'),
        has_portfolio: false,
        has_cover_letter: plans.includes('basic')
      });
    } catch (error) {
      next(error);
    }
  }

  // Payment history
  async getPaymentHistory(req, res, next) {
    try {
      const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.status(200).json(payments.map(p => p.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  // Verify key credentials
  async verifyKeys(req, res, next) {
    try {
      if (
        !config.razorpayKeyId ||
        config.razorpayKeyId === 'rzp_test_mock_123456' ||
        !config.razorpayKeySecret ||
        config.razorpayKeySecret === 'mock_secret_123456'
      ) {
        return res.status(200).json({
          status: 'unconfigured',
          error: 'Keys are missing or set to mock defaults.'
        });
      }

      try {
        // Try to create a dummy 1 rupee order to check credentials
        await paymentService.createRazorpayOrder(100, `tst_${crypto.randomBytes(4).toString('hex')}`);
        res.status(200).json({
          status: 'valid',
          key_id: config.razorpayKeyId
        });
      } catch (err) {
        res.status(200).json({
          status: 'invalid',
          key_id: config.razorpayKeyId,
          error: err.message
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
