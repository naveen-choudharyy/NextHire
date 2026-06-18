import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  planType: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'resume_cover', 'resume_portfolio']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'verifying', 'completed', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  allocatedResumeId: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.userId ? ret.userId.toString() : null;
      ret.plan_type = ret.planType;
      ret.razorpay_order_id = ret.razorpayOrderId;
      ret.razorpay_payment_id = ret.razorpayPaymentId;
      ret.allocated_resume_id = ret.allocatedResumeId;
      ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : null;
      delete ret._id;
      delete ret.userId;
      delete ret.planType;
      delete ret.razorpayOrderId;
      delete ret.razorpayPaymentId;
      delete ret.allocatedResumeId;
      delete ret.createdAt;
      delete ret.updatedAt;
      delete ret.__v;
      return ret;
    }
  }
});

export const Payment = mongoose.model('Payment', paymentSchema);
