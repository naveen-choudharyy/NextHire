import { aiHelper } from '../utils/aiHelper.js';
import { BadRequestError } from '../utils/errors.js';

class AIController {
  // Generate professional summary
  async generateSummary(req, res, next) {
    try {
      const { profile } = req.body;
      if (!profile) {
        return next(new BadRequestError('Profile data is required.'));
      }
      const summary = await aiHelper.generateSummary(profile);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  }

  // Rewrite achievements into STAR bullet points
  async rewriteAchievement(req, res, next) {
    try {
      const { text } = req.body;
      if (!text) {
        return next(new BadRequestError('Text to rewrite is required.'));
      }
      const rewritten = await aiHelper.rewriteAchievement(text);
      res.status(200).json({ rewritten });
    } catch (error) {
      next(error);
    }
  }

  // Suggest skills based on job role
  async suggestSkills(req, res, next) {
    try {
      const { role } = req.body;
      if (!role) {
        return next(new BadRequestError('Role description/title is required.'));
      }
      const skills = await aiHelper.suggestSkills(role);
      res.status(200).json({ skills });
    } catch (error) {
      next(error);
    }
  }

  // Grammar correction
  async grammarCorrect(req, res, next) {
    try {
      const { text } = req.body;
      if (!text) {
        return next(new BadRequestError('Text is required.'));
      }
      const corrected = await aiHelper.grammarCorrect(text);
      res.status(200).json({ corrected });
    } catch (error) {
      next(error);
    }
  }

  // ATS scoring analysis
  async atsScore(req, res, next) {
    try {
      const { content } = req.body;
      if (!content) {
        return next(new BadRequestError('Resume content is required.'));
      }
      const analysis = await aiHelper.analyzeATS(content);
      res.status(200).json(analysis);
    } catch (error) {
      next(error);
    }
  }

  // LinkedIn optimization profile suggestions
  async linkedinOptimize(req, res, next) {
    try {
      const { content } = req.body;
      if (!content) {
        return next(new BadRequestError('Resume content is required.'));
      }
      const result = await aiHelper.generateLinkedIn(content);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // AI Cover Letter Generator
  async coverLetter(req, res, next) {
    try {
      const { content, job_description } = req.body;
      if (!content || !job_description) {
        return next(new BadRequestError('Resume content and job description are required.'));
      }
      const letter = await aiHelper.generateCoverLetter(content, job_description);
      res.status(200).json({ cover_letter: letter });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
