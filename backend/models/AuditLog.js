import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    required: true,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.userId ? ret.userId.toString() : null;
      ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : null;
      delete ret._id;
      delete ret.userId;
      delete ret.createdAt;
      delete ret.__v;
      return ret;
    }
  }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
