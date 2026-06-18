import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.userId ? (typeof ret.userId === 'object' && ret.userId.id ? ret.userId.id : ret.userId.toString()) : null;
      ret.is_featured = ret.isFeatured;
      ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : null;
      // Note: user_name will be dynamically added in the controller/serializer when user details are populated.
      ret.user_name = doc.userId && doc.userId.fullName ? doc.userId.fullName : 'Anonymous';
      delete ret._id;
      delete ret.userId;
      delete ret.isFeatured;
      delete ret.createdAt;
      delete ret.__v;
      return ret;
    }
  }
});

export const Review = mongoose.model('Review', reviewSchema);
