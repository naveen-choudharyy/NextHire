import mongoose from 'mongoose';
import crypto from 'crypto';
import { encrypt, decrypt } from '../utils/encryption.js';

const resumeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => crypto.randomUUID()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  templateId: {
    type: String,
    required: true,
    default: 'ats-friendly'
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  atsScore: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  portfolioSlug: {
    type: String,
    unique: true,
    sparse: true
  },
  downloadedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      ret.user_id = ret.userId ? ret.userId.toString() : null;
      ret.template_id = ret.templateId;
      ret.ats_score = ret.atsScore;
      ret.is_public = ret.isPublic;
      ret.portfolio_slug = ret.portfolioSlug;
      ret.downloaded_at = ret.downloadedAt ? ret.downloadedAt.toISOString() : null;
      ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : null;
      ret.updated_at = ret.updatedAt ? ret.updatedAt.toISOString() : null;
      
      // Construct visual proof of encryption for UI demo
      const email = ret.content?.personal?.email;
      const phone = ret.content?.personal?.phone;
      const address = ret.content?.personal?.address;
      
      ret.encrypted_preview = {
        email: email ? encrypt(email) : null,
        phone: phone ? encrypt(phone) : null,
        address: address ? encrypt(address) : null
      };

      delete ret._id;
      delete ret.userId;
      delete ret.templateId;
      delete ret.atsScore;
      delete ret.isPublic;
      delete ret.portfolioSlug;
      delete ret.downloadedAt;
      delete ret.createdAt;
      delete ret.updatedAt;
      delete ret.__v;
      return ret;
    }
  }
});

// Encryption Helpers for Schema hooks
function encryptPersonalFields(content) {
  if (content && content.personal) {
    if (content.personal.email) {
      content.personal.email = encrypt(content.personal.email);
    }
    if (content.personal.phone) {
      content.personal.phone = encrypt(content.personal.phone);
    }
    if (content.personal.address) {
      content.personal.address = encrypt(content.personal.address);
    }
  }
}

function decryptPersonalFields(content) {
  if (content && content.personal) {
    if (content.personal.email) {
      content.personal.email = decrypt(content.personal.email);
    }
    if (content.personal.phone) {
      content.personal.phone = decrypt(content.personal.phone);
    }
    if (content.personal.address) {
      content.personal.address = decrypt(content.personal.address);
    }
  }
}

// Pre-save hook to encrypt sensitive fields
resumeSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    encryptPersonalFields(this.content);
    this.markModified('content');
  }
  next();
});

// Post-save hook to restore plain text in-memory
resumeSchema.post('save', function (doc) {
  if (doc && doc.content) {
    decryptPersonalFields(doc.content);
  }
});

// Query post-hooks to automatically decrypt values
resumeSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => {
      if (doc && doc.content) {
        decryptPersonalFields(doc.content);
      }
    });
  }
});

resumeSchema.post('findOne', function (doc) {
  if (doc && doc.content) {
    decryptPersonalFields(doc.content);
  }
});

resumeSchema.post('init', function (doc) {
  if (doc && doc.content) {
    decryptPersonalFields(doc.content);
  }
});

export const Resume = mongoose.model('Resume', resumeSchema);
