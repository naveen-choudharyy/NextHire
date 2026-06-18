import crypto from 'crypto';
import { Resume } from '../models/Resume.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { BadRequestError, ForbiddenError, NotFoundError, PaymentRequiredError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

class ResumeController {
  // Fetch all resumes for user
  async getAllResumes(req, res, next) {
    try {
      const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
      res.status(200).json(resumes.map(r => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  // Fetch single resume
  async getResume(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      // Authorization check
      const currentUserId = req.user ? req.user._id.toString() : null;
      const ownerId = resume.userId.toString();

      if (!resume.isPublic && (!currentUserId || currentUserId !== ownerId)) {
        return next(new ForbiddenError('Access denied. Private resume.'));
      }

      // Check payment status of this resume
      let payment = await Payment.findOne({ allocatedResumeId: resume._id, status: 'completed' });
      
      const owner = await User.findById(resume.userId);
      const isOwnerAdmin = owner && owner.role === 'admin';

      // Backwards compatibility: Auto-allocate if an unallocated payment is found
      if (!payment && !isOwnerAdmin && currentUserId === ownerId) {
        const unallocated = await Payment.findOne({
          userId: resume.userId,
          status: 'completed',
          allocatedResumeId: null
        });

        if (unallocated) {
          unallocated.allocatedResumeId = resume._id;
          await unallocated.save();
          payment = unallocated;
          logger.info(`Auto-allocated unallocated payment ${unallocated._id} to resume ${resume._id}`);
        }
      }

      const hasPaid = (payment !== null) || isOwnerAdmin;
      const planType = payment ? payment.planType : (isOwnerAdmin ? 'premium' : null);

      const resumeJson = resume.toJSON();
      resumeJson.has_paid = hasPaid;
      resumeJson.plan_type = planType;

      res.status(200).json(resumeJson);
    } catch (error) {
      next(error);
    }
  }

  // Create new resume
  async createResume(req, res, next) {
    try {
      const userId = req.user._id;
      const user = req.user;
      const isUserAdmin = user.role === 'admin';
      let unallocatedPayment = null;

      if (!isUserAdmin) {
        // Enforce payment slot requirement
        unallocatedPayment = await Payment.findOne({
          userId,
          status: 'completed',
          allocatedResumeId: null
        });

        if (!unallocatedPayment) {
          return next(new PaymentRequiredError('Please purchase a resume slot to create a new resume. Each slot is ₹30.'));
        }
      }

      // Initial empty resume template skeleton
      const defaultContent = {
        personal: {
          fullName: '',
          email: user.email || '',
          phone: '',
          website: '',
          github: '',
          linkedin: '',
          location: '',
          summary: ''
        },
        education: [],
        experience: [],
        projects: [],
        skills: {
          languages: '',
          frameworks: '',
          databases: '',
          tools: '',
          soft: '',
          other: ''
        },
        certifications: [],
        achievements: [],
        languages: [],
        extracurriculars: []
      };

      const title = req.body.title || 'Untitled Resume';
      const templateId = req.body.template_id || 'ats-friendly';
      const content = req.body.content || defaultContent;
      const portfolioSlug = `portfolio-${crypto.randomBytes(3).toString('hex')}`;

      // Create resume
      const newResume = new Resume({
        userId,
        title,
        templateId,
        content,
        portfolioSlug
      });

      await newResume.save();

      // Allocate slot
      if (unallocatedPayment) {
        unallocatedPayment.allocatedResumeId = newResume._id;
        await unallocatedPayment.save();
        logger.info(`Allocated payment ${unallocatedPayment._id} to newly created resume ${newResume._id}`);
      }

      res.status(201).json(newResume.toJSON());
    } catch (error) {
      next(error);
    }
  }

  // Update resume
  async updateResume(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Unauthorized to update this resume.'));
      }

      const data = req.body;

      if (data.title !== undefined) {
        resume.title = data.title;
      }
      if (data.template_id !== undefined) {
        resume.templateId = data.template_id;
      }
      if (data.content !== undefined) {
        // Prevent account sharing: Lock fullName to the first value saved on this resume
        const newPersonal = data.content.personal || {};
        const newName = (newPersonal.fullName || '').trim();

        const existingPersonal = (resume.content && resume.content.personal) || {};
        const existingName = (existingPersonal.fullName || '').trim();

        if (existingName) {
          if (!newName) {
            newPersonal.fullName = existingName;
          } else if (newName.toLowerCase().replace(/\s+/g, '') !== existingName.toLowerCase().replace(/\s+/g, '')) {
            return next(new BadRequestError(`To prevent account sharing, you cannot change the name on this resume once it has been saved. The name must match: "${existingName}".`));
          }
        }
        resume.content = data.content;
      }
      if (data.ats_score !== undefined) {
        resume.atsScore = data.ats_score;
      }
      if (data.is_public !== undefined) {
        resume.isPublic = data.is_public;
      }
      if (data.portfolio_slug !== undefined) {
        const slug = data.portfolio_slug.trim().toLowerCase().replace(/\s+/g, '-');
        
        // Ensure unique slug
        const existing = await Resume.findOne({ portfolioSlug: slug, _id: { $ne: resume._id } });
        if (existing) {
          return next(new BadRequestError('Portfolio URL slug is already in use.'));
        }
        resume.portfolioSlug = slug;
      }

      // Mongoose saves updates
      await resume.save();
      res.status(200).json(resume.toJSON());
    } catch (error) {
      next(error);
    }
  }

  // Delete resume
  async deleteResume(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Unauthorized to delete this resume.'));
      }

      await Resume.findByIdAndDelete(resume._id);
      res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Manage download lock activations
  async startDownloadWindow(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Unauthorized access.'));
      }

      const now = new Date();
      let isActive = false;

      // Check if download window is active (24 hours window)
      if (resume.downloadedAt) {
        const elapsedSeconds = (now.getTime() - resume.downloadedAt.getTime()) / 1000;
        if (elapsedSeconds < 86400) {
          isActive = true;
        }
      }

      if (isActive) {
        return res.status(200).json({
          message: 'Download window is already active',
          resume: resume.toJSON(),
          expires_in_seconds: Math.floor(86400 - (now.getTime() - resume.downloadedAt.getTime()) / 1000)
        });
      }

      // If window is expired or never activated:
      // 1. Is this the free resume slot? (First/oldest resume)
      const userResumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: 1 });
      const isFreeResume = userResumes.length > 0 && userResumes[0]._id === resume._id;

      if (isFreeResume && !resume.downloadedAt) {
        resume.downloadedAt = now;
        await resume.save();
        return res.status(200).json({
          message: 'Free download slot activated',
          resume: resume.toJSON(),
          expires_in_seconds: 86400
        });
      }

      // 2. Reactivate/activate via unallocated payment
      const unallocatedPayment = await Payment.findOne({
        userId: req.user._id,
        status: 'completed',
        allocatedResumeId: null
      });

      if (!unallocatedPayment) {
        return next(new PaymentRequiredError('Download period expired. Please purchase another plan to reactivate download access or create a new resume.'));
      }

      // Allocate slot & activate download
      unallocatedPayment.allocatedResumeId = resume._id;
      await unallocatedPayment.save();

      resume.downloadedAt = now;
      await resume.save();

      logger.info(`Reactivated download window for resume ${resume._id} using payment ${unallocatedPayment._id}`);

      res.status(200).json({
        message: 'Download slot activated/reactivated successfully via plan allocation',
        resume: resume.toJSON(),
        expires_in_seconds: 86400
      });
    } catch (error) {
      next(error);
    }
  }

  // Fetch public portfolio
  async getPublicResume(req, res, next) {
    try {
      const resume = await Resume.findOne({ portfolioSlug: req.params.slug, isPublic: true });
      if (!resume) {
        return next(new NotFoundError('Public portfolio resume not found.'));
      }
      res.status(200).json({
        content: resume.content,
        template_id: resume.templateId,
        title: resume.title
      });
    } catch (error) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();
