import { logger } from './logger.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

class MLClient {
  // Check if Python ML Service is running
  async isHealthy() {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Predict resume career category
  async predictCategory(text) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`ML Service responded with status: ${response.status}`);
    } catch (error) {
      logger.warn(`ML service /predict failed: ${error.message}. Returning fallback.`);
      
      // Fallback category mapping based on simple keyword heuristics
      const lower = text.toLowerCase();
      let predicted_category = "Backend & Cloud Engineering";
      const probabilities = {
        "Data Science & Machine Learning": 0.1,
        "Frontend Web Development": 0.1,
        "Backend & Cloud Engineering": 0.5,
        "Product Management & Operations": 0.1,
        "Finance & Business Analysis": 0.1
      };

      if (lower.includes('data science') || lower.includes('machine learning') || lower.includes('python') && lower.includes('models') || lower.includes('pandas') || lower.includes('pytorch')) {
        predicted_category = "Data Science & Machine Learning";
        probabilities["Data Science & Machine Learning"] = 0.8;
        probabilities["Backend & Cloud Engineering"] = 0.1;
      } else if (lower.includes('react') || lower.includes('css') || lower.includes('tailwind') || lower.includes('frontend') || lower.includes('html')) {
        predicted_category = "Frontend Web Development";
        probabilities["Frontend Web Development"] = 0.8;
        probabilities["Backend & Cloud Engineering"] = 0.1;
      } else if (lower.includes('product manager') || lower.includes('agile') || lower.includes('scrum') || lower.includes('operations')) {
        predicted_category = "Product Management & Operations";
        probabilities["Product Management & Operations"] = 0.8;
        probabilities["Backend & Cloud Engineering"] = 0.1;
      } else if (lower.includes('finance') || lower.includes('budget') || lower.includes('business analyst') || lower.includes('valuation')) {
        predicted_category = "Finance & Business Analysis";
        probabilities["Finance & Business Analysis"] = 0.8;
        probabilities["Backend & Cloud Engineering"] = 0.1;
      }

      return {
        predicted_category,
        probabilities,
        is_fallback: true
      };
    }
  }

  // Cosine similarity job matching
  async matchJobs(resumeText, jobs) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/match-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, jobs }),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`ML Service responded with status: ${response.status}`);
    } catch (error) {
      logger.warn(`ML service /match-jobs failed: ${error.message}. Executing local fallback matching.`);
      return null; // Signals routing to use native JS regex fallback
    }
  }

  // NLP Analytics & Readability
  async analyzeResume(text) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/analyze-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`ML Service responded with status: ${response.status}`);
    } catch (error) {
      logger.warn(`ML service /analyze-resume failed: ${error.message}. Returning fallback.`);
      
      const words = text.split(/\s+/).filter(Boolean);
      const word_count = words.length || 1;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentence_count = sentences.length || 1;

      return {
        word_count,
        sentence_count,
        avg_sentence_len: roundToDec(word_count / sentence_count, 1),
        readability_score: 65.0,
        readability_label: "Standard / Moderate (8th-9th Grade) [Fallback]",
        top_keywords: [
          { text: "development", value: 3 },
          { text: "project", value: 2 },
          { text: "application", value: 2 }
        ],
        is_fallback: true
      };
    }
  }

  // Get skill gap analysis
  async getSkillGap(resumeText, jobDescription) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/skill-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`ML Service responded with status: ${response.status}`);
    } catch (error) {
      logger.warn(`ML service /skill-gap failed: ${error.message}. Returning empty gaps.`);
      return {
        missing_skills: ["Communication", "Leadership", "Technology"]
      };
    }
  }
}

function roundToDec(num, decimals) {
  const p = Math.pow(10, decimals);
  return Math.round(num * p) / p;
}

export const mlClient = new MLClient();
