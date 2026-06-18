import { Resume } from '../models/Resume.js';
import { mlClient } from '../utils/mlClient.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

class MLController {
  // Utility to compile resume fields into a single text block for NLP
  getResumeCorpus(resume) {
    const content = resume.content || {};
    const personal = content.personal || {};
    const summary = personal.summary || '';
    
    // Extract education
    const education = (content.education || [])
      .map(edu => `${edu.degree || ''} ${edu.fieldOfStudy || ''} ${edu.school || ''} ${edu.description || ''}`)
      .join(' ');
      
    // Extract experience
    const experience = (content.experience || [])
      .map(exp => `${exp.position || ''} ${exp.company || ''} ${exp.description || ''}`)
      .join(' ');
      
    // Extract projects
    const projects = (content.projects || [])
      .map(proj => `${proj.title || ''} ${proj.description || ''}`)
      .join(' ');
      
    // Extract skills
    let skillsList = [];
    const skills = content.skills || {};
    if (typeof skills === 'object') {
      skillsList = Object.values(skills).flatMap(s => String(s).split(/[\s,]+/));
    } else if (Array.isArray(skills)) {
      skillsList = skills;
    }
    const skillsStr = skillsList.join(' ');
    
    // Compile corpus
    return [
      resume.title,
      summary,
      skillsStr,
      experience,
      projects,
      education
    ].filter(Boolean).join('\n');
  }

  // POST /api/ml/predict/:resumeId
  async predictResumeCategory(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.resumeId);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Unauthorized to analyze this resume.'));
      }

      const corpus = this.getResumeCorpus(resume);
      if (!corpus.trim()) {
        return next(new BadRequestError('Resume is empty. Please add details first.'));
      }

      const prediction = await mlClient.predictCategory(corpus);
      res.status(200).json(prediction);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ml/insights/:resumeId
  async getResumeInsights(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.resumeId);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Unauthorized to analyze this resume.'));
      }

      const corpus = this.getResumeCorpus(resume);
      if (!corpus.trim()) {
        return next(new BadRequestError('Resume is empty. Please add details first.'));
      }

      // Parallel requests to ML service
      const [prediction, analytics] = await Promise.all([
        mlClient.predictCategory(corpus),
        mlClient.analyzeResume(corpus)
      ]);

      res.status(200).json({
        prediction,
        analytics
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ml/skill-gap/:resumeId
  async getSkillGapAnalysis(req, res, next) {
    try {
      const { job_description } = req.body;
      if (!job_description) {
        return next(new BadRequestError('Job description is required for skill gap analysis.'));
      }

      const resume = await Resume.findById(req.params.resumeId);
      if (!resume) {
        return next(new NotFoundError('Resume not found.'));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Unauthorized to analyze this resume.'));
      }

      const corpus = this.getResumeCorpus(resume);
      const gap = await mlClient.getSkillGap(corpus, job_description);
      res.status(200).json(gap);
    } catch (error) {
      next(error);
    }
  }
}

export const mlController = new MLController();
