import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export class AIHelper {
  constructor() {
    this.client = null;
    if (config.openaiApiKey) {
      try {
        this.client = new OpenAI({
          apiKey: config.openaiApiKey
        });
      } catch (error) {
        logger.error(`Failed to initialize OpenAI client: ${error.message}`);
      }
    }
  }

  async callLLM(systemPrompt, userPrompt, fallbackHandler) {
    if (this.client) {
      try {
        const response = await this.client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        });
        return response.choices[0].message.content.trim();
      } catch (error) {
        logger.error(`OpenAI API error: ${error.message}, running mock fallback...`);
      }
    }
    return fallbackHandler(userPrompt);
  }

  async generateSummary(profileData) {
    const systemPrompt = 'You are a professional resume writer. Generate a concise, impactful 3-4 sentence professional summary based on the user\'s career details.';
    const userPrompt = `Here is my professional profile:\n${JSON.stringify(profileData, null, 2)}\n\nWrite a summary.`;

    const fallback = () => {
      const name = profileData.fullName || 'Professional';
      const skills = profileData.skills || [];
      const title = profileData.title || 'Software Engineer';
      const skillsStr = skills.slice(0, 4).join(', ');

      return `Highly motivated and results-driven ${title} with a proven track record of designing, developing, and deploying scalable software solutions. Proficient in ${skillsStr || 'modern technologies'}, with strong problem-solving skills and a passion for engineering high-performance applications. Excellent collaborator with experience leading cross-functional teams to deliver projects on time and within scope.`;
    };

    return this.callLLM(systemPrompt, userPrompt, fallback);
  }

  async rewriteAchievement(text) {
    const systemPrompt = 'You are a professional resume coach. Rewrite the user\'s basic achievement into a high-impact, professional bullet point using the STAR method (Situation, Task, Action, Result). Use active verbs and add realistic metrics.';
    const userPrompt = `Rewrite this achievement: '${text}'`;

    const fallback = () => {
      const cleaned = text.trim().toLowerCase();
      if (!cleaned) {
        return 'Developed and implemented scalable solutions to optimize system performance and user experience.';
      }

      if (cleaned.includes('expense tracker')) {
        return 'Developed a full-stack Expense Tracker application using React and Flask to monitor expenses and provide analytical insights, reducing load times by 25% and processing over 5,000 requests daily.';
      } else if (cleaned.includes('landing page') || cleaned.includes('website')) {
        return 'Designed and deployed a responsive landing page using Tailwind CSS, boosting user engagement by 40% and reducing bounce rates by 15%.';
      } else if (cleaned.includes('portfolio')) {
        return 'Architected a high-performance personal portfolio website using React, incorporating smooth Framer Motion animations to showcase technical projects and achievements.';
      } else if (cleaned.includes('ecommerce') || cleaned.includes('e-commerce') || cleaned.includes('shop')) {
        return 'Built a robust E-commerce platform utilizing React, Node.js, and Stripe integration, managing a catalog of 200+ items and secure checkout pipelines.';
      } else if (cleaned.includes('chat') || cleaned.includes('messenger')) {
        return 'Engineered a real-time messaging application utilizing WebSockets and React, facilitating instantaneous message transmission with sub-50ms latency.';
      }

      const words = text.split(/\s+/);
      const mainNoun = words[words.length - 1] || 'components';
      return `Designed and engineered a full-stack ${text} utilizing modern software design patterns, enhancing operational efficiency by 15% and streamlining user workflows.`;
    };

    return this.callLLM(systemPrompt, userPrompt, fallback);
  }

  async suggestSkills(role) {
    const systemPrompt = 'You are an ATS optimization bot. Provide a JSON object containing suggested skills for the specified role divided into \'languages\', \'frameworks\', \'databases\', \'tools\', and \'soft\' (soft skills). Format output strictly as JSON: {"languages": "...", "frameworks": "...", "databases": "...", "tools": "...", "soft": "..."}';
    const userPrompt = `Role: ${role}`;

    const fallback = () => {
      const roleClean = role.toLowerCase();
      if (roleClean.includes('react') || roleClean.includes('frontend') || roleClean.includes('front-end')) {
        return JSON.stringify({
          languages: 'JavaScript (ES6+), TypeScript, HTML5, CSS3',
          frameworks: 'React.js, Redux Toolkit, Tailwind CSS, Next.js',
          databases: 'MongoDB, PostgreSQL',
          tools: 'Git, GitHub, VS Code, Postman, Vercel',
          soft: 'Teamwork, Agile Communication, Problem Solving'
        });
      } else if (roleClean.includes('flask') || roleClean.includes('backend') || roleClean.includes('back-end') || roleClean.includes('python')) {
        return JSON.stringify({
          languages: 'Python, SQL, Bash',
          frameworks: 'Flask, FastAPI, SQLAlchemy, Django',
          databases: 'PostgreSQL, SQLite, Redis',
          tools: 'Docker, Git, GitHub, Postman, Render',
          soft: 'Problem Solving, Collaboration, API Design Thinking'
        });
      } else {
        return JSON.stringify({
          languages: 'Java, Python, C++, SQL',
          frameworks: 'Spring Boot, Flask, React.js',
          databases: 'MySQL, PostgreSQL',
          tools: 'Git, GitHub, AWS, Docker',
          soft: 'Communication, Leadership, Critical Thinking'
        });
      }
    };

    const res = await this.callLLM(systemPrompt, userPrompt, fallback);
    try {
      let parsed = res;
      if (res.includes('```')) {
        const match = res.match(/(\{.*\})/s);
        if (match) {
          parsed = match[1];
        }
      }
      return JSON.parse(parsed);
    } catch (error) {
      return {
        languages: 'JavaScript, HTML/CSS',
        frameworks: 'React, Tailwind',
        databases: 'MySQL',
        tools: 'Git, Vercel',
        soft: 'Teamwork, Problem Solving'
      };
    }
  }

  async grammarCorrect(text) {
    const systemPrompt = 'Correct any spelling or grammatical errors in the user text, improving readability without changing its core meaning. Keep it professional.';
    const userPrompt = text;

    const fallback = () => {
      let cleaned = text.trim();
      if (!cleaned) return '';
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      if (!cleaned.endsWith('.')) {
        cleaned += '.';
      }
      return cleaned;
    };

    return this.callLLM(systemPrompt, userPrompt, fallback);
  }

  async analyzeATS(resumeContent) {
    let score = 40;
    const missing = [];
    const suggestions = [];

    const personal = resumeContent.personal || {};
    const education = resumeContent.education || [];
    const experience = resumeContent.experience || [];
    const projects = resumeContent.projects || [];
    const skills = resumeContent.skills || {};
    const certs = resumeContent.certifications || [];

    // 1. Contact Info & Links (Max 15 points)
    if (personal.email && personal.phone) {
      score += 5;
    } else {
      suggestions.push('Add contact details: phone and email address are essential for ATS parsing.');
      missing.push('Contact Details');
    }

    if (personal.linkedin) {
      score += 5;
    } else {
      suggestions.push('Add your LinkedIn profile link to allow recruiters to view your professional network.');
      missing.push('LinkedIn URL');
    }

    if (personal.github) {
      score += 5;
    } else {
      suggestions.push('Include a GitHub profile link to showcase code repositories.');
      missing.push('GitHub URL');
    }

    // 2. Professional Summary (Max 10 points)
    const summary = (personal.summary || '').trim();
    if (summary) {
      const wordCount = summary.split(/\s+/).length;
      if (wordCount < 20) {
        score += 3;
        suggestions.push('Your professional summary is too short. Aim for 30-50 words to make it impactful.');
      } else if (wordCount > 100) {
        score += 5;
        suggestions.push('Your professional summary is too long. Keep it under 80 words.');
      } else {
        score += 10;
      }
    } else {
      suggestions.push('Include a professional summary highlighting your core value proposition and career target.');
      missing.push('Professional Summary');
    }

    // 3. Work Experience Metrics & Action Verbs (Max 25 points)
    if (experience.length > 0) {
      score += 10;
      let metricBullets = 0;
      let actionVerbBullets = 0;
      let totalBullets = 0;

      const actionVerbsList = new Set([
        'developed', 'designed', 'engineered', 'implemented', 'led', 'managed', 'created', 'optimized',
        'built', 'reduced', 'increased', 'improved', 'automated', 'spearheaded', 'accelerated', 'crafted',
        'delivered', 'coordinated', 'established', 'architected', 'deployed', 'secured', 'integrated',
        'monitored', 'analyzed', 'facilitated', 'collaborated', 'enhanced', 'resolved', 'pioneered',
        'upgraded', 'launched', 'streamlined', 'transformed'
      ]);

      for (const exp of experience) {
        const desc = (exp.description || '').trim();
        if (desc) {
          const bullets = desc.split(/[\n•\-\*]/).map(b => b.trim()).filter(Boolean);
          totalBullets += bullets.length;
          for (const bullet of bullets) {
            // Check for metrics
            if (/\d+%/.test(bullet) || /\$\d+/.test(bullet) || /\b\d+\s*(hours|days|weeks|months|years|users|transactions|servers|records|percent|x)\b/i.test(bullet)) {
              metricBullets++;
            }
            // Check for starting action verb
            const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[.,()"'*-]/g, '') || '';
            if (actionVerbsList.has(firstWord)) {
              actionVerbBullets++;
            }
          }
        }
      }

      if (totalBullets > 0) {
        const metricRatio = metricBullets / totalBullets;
        const verbRatio = actionVerbBullets / totalBullets;

        if (metricRatio >= 0.5) {
          score += 10;
        } else if (metricRatio >= 0.2) {
          score += 5;
          suggestions.push('Quantify more achievements! Only some of your bullet points contain measurable metrics (%, $, numbers).');
        } else {
          suggestions.push('Quantify your achievements: Add measurable metrics (e.g., \'increased revenue by 20%\', \'reduced loading time by 15%\') to prove your impact.');
          missing.push('Quantifiable Metrics');
        }

        if (verbRatio >= 0.7) {
          score += 5;
        } else {
          score += Math.floor(5 * verbRatio);
          suggestions.push('Start your bullet points with strong action verbs (e.g. Developed, Engineered, Optimized) rather than passive words.');
        }
      } else {
        suggestions.push('Add detailed bullet points describing your achievements under each work experience entry.');
      }
    } else {
      suggestions.push('Add work experience or internships to establish professional credibility.');
      missing.push('Work Experience Entries');
    }

    // 4. Technical Projects (Max 15 points)
    if (projects.length > 0) {
      score += 10;
      if (projects.length < 2) {
        suggestions.push('Add at least 2 distinct technical projects to demonstrate your practical application skills.');
      } else {
        score += 5;
      }
    } else {
      suggestions.push('Include personal or academic projects showcasing the technologies you list in your skills section.');
      missing.push('Projects Section');
    }

    // 5. Core Tech Skills Alignment (Max 20 points)
    let skillsText = '';
    if (typeof skills === 'object') {
      skillsText = Object.values(skills).join(' ').toLowerCase();
    } else if (Array.isArray(skills)) {
      skillsText = skills.join(' ').toLowerCase();
    } else {
      skillsText = String(skills).toLowerCase();
    }

    if (skillsText.trim()) {
      score += 10;
      const importantTools = ['git', 'docker', 'aws', 'ci/cd', 'agile', 'sql', 'api'];
      const missingTools = importantTools.filter(t => !skillsText.includes(t));

      if (missingTools.length > 0) {
        score += Math.max(0, 10 - missingTools.length * 2);
        for (const tool of missingTools.slice(0, 2)) {
          missing.push(tool.toUpperCase());
          suggestions.push(`Consider listing '${tool.toUpperCase()}' under your skills if you have experience with it, as it is a highly searched ATS keyword.`);
        }
      } else {
        score += 10;
      }
    } else {
      suggestions.push('Create a dedicated skills section to list your programming languages, frameworks, and tools.');
      missing.push('Skills Inventory');
    }

    // 6. Certifications (Max 5 points)
    if (certs && certs.length > 0) {
      score += 5;
    }

    score = Math.max(15, Math.min(92, score));

    const systemPrompt = 'Analyze the resume content for ATS friendliness. Return a JSON object containing: \'score\' (0-100), \'missing_keywords\' (list), and \'suggestions\' (list of strings).';
    const userPrompt = JSON.stringify(resumeContent);

    const fallbackHandler = () => '';

    const llmRes = await this.callLLM(systemPrompt, userPrompt, fallbackHandler);
    if (llmRes) {
      try {
        let parsed = llmRes;
        if (llmRes.includes('```')) {
          const match = llmRes.match(/(\{.*\})/s);
          if (match) {
            parsed = match[1];
          }
        }
        const llmData = JSON.parse(parsed);
        for (const sug of llmData.suggestions || []) {
          if (!suggestions.includes(sug) && suggestions.length < 6) {
            suggestions.push(sug);
          }
        }
        for (const kw of llmData.missing_keywords || []) {
          if (!missing.includes(kw) && missing.length < 6) {
            missing.push(kw);
          }
        }
      } catch (e) {
        // Silently skip LLM failures
      }
    }

    if (score >= 85 && suggestions.length === 0) {
      suggestions.push('Outstanding resume metrics! Do a final spelling audit before submitting.');
    }

    return {
      score,
      missing_keywords: missing,
      suggestions
    };
  }

  async generateLinkedIn(resumeContent) {
    const systemPrompt = 'Generate 3 professional LinkedIn Headline suggestions and a complete \'About\' section based on the user\'s resume. Return JSON: {\'headlines\': [...], \'about\': \'...\'}';
    const userPrompt = JSON.stringify(resumeContent);

    const fallback = () => {
      const personal = resumeContent.personal || {};
      const name = personal.fullName || 'Professional';
      const skills = resumeContent.skills || {};
      let skillsArray = [];
      if (typeof skills === 'object') {
        skillsArray = Object.values(skills).flatMap(s => s.split(',').map(x => x.trim()));
      }
      const skillsStr = skillsArray.slice(0, 3).join(' | ') || 'Software Engineering';

      const headlines = [
        `${skillsStr} | Passionate about building robust scalable systems`,
        `Aspiring Software Developer | Expert in ${skillsArray.slice(0, 2).join(', ') || 'Modern Tech'}`,
        'Full Stack Developer | Transforming ideas into clean, functional code'
      ];

      const about = `Hi, I'm ${name}! I am a passionate developer skilled in ${skillsArray.slice(0, 5).join(', ') || 'software development'}. I love building full-stack products, learning new frameworks, and solving complex algorithmic challenges. Throughout my projects and internships, I have focused on writing clean, readable, and highly maintainable code. Let's connect!`;

      return JSON.stringify({ headlines, about });
    };

    const res = await this.callLLM(systemPrompt, userPrompt, fallback);
    try {
      let parsed = res;
      if (res.includes('```')) {
        const match = res.match(/(\{.*\})/s);
        if (match) {
          parsed = match[1];
        }
      }
      return JSON.parse(parsed);
    } catch (e) {
      return {
        headlines: ['Software Engineer | Problem Solver'],
        about: 'Passionate software professional.'
      };
    }
  }

  async generateCoverLetter(resumeContent, jobDesc) {
    const systemPrompt = `Write a professional cover letter based on the applicant's resume and this job description: ${jobDesc}`;
    const userPrompt = JSON.stringify(resumeContent);

    const fallback = () => {
      const personal = resumeContent.personal || {};
      const name = personal.fullName || 'Applicant';
      const email = personal.email || 'email@example.com';
      const phone = personal.phone || '+91 9999999999';

      let jobTitle = 'Software Developer';
      const cleanJobDesc = jobDesc.toLowerCase();
      const match = cleanJobDesc.match(/(react|flask|frontend|backend|data|python|ml|developer|analyst|engineer)/);
      if (match) {
        jobTitle = match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' Developer';
      }

      return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at your organization. With a solid foundation in software engineering and practical hands-on experience developing projects, I am confident in my ability to make a meaningful contribution to your team.

My technical background aligns well with the requirements outlined in the job description. I have worked extensively with modern technologies, developing and optimizing applications that deliver positive user experiences. 

I would welcome the opportunity to discuss how my skills and qualifications make me a strong candidate for this role. Thank you for your time and consideration.

Sincerely,
${name}
${email} | ${phone}`;
    };

    return this.callLLM(systemPrompt, userPrompt, fallback);
  }
}
export const aiHelper = new AIHelper();
