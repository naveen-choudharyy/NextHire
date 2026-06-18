import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creditsAwarded: {
    type: Number,
    default: 10
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.referrer_id = ret.referrerId ? ret.referrerId.toString() : null;
      ret.referee_id = ret.refereeId ? ret.refereeId.toString() : null;
      ret.credits_awarded = ret.creditsAwarded;
      ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : null;
      delete ret._id;
      delete ret.referrerId;
      delete ret.refereeId;
      delete ret.creditsAwarded;
      delete ret.createdAt;
      delete ret.__v;
      return ret;
    }
  }
});

export const Referral = mongoose.model('Referral', referralSchema);
