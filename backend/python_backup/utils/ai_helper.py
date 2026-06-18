import os
import re
import json
from openai import OpenAI

class AIHelper:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception:
                self.client = None

    def call_llm(self, system_prompt, user_prompt, fallback_handler):
        """Helper to invoke OpenAI or drop back to rule-based mock engine."""
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=800
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"OpenAI API error: {str(e)}, running mock fallback...")
        
        return fallback_handler(user_prompt)

    def generate_summary(self, profile_data):
        system_prompt = "You are a professional resume writer. Generate a concise, impactful 3-4 sentence professional summary based on the user's career details."
        user_prompt = f"Here is my professional profile:\n{json.dumps(profile_data, indent=2)}\n\nWrite a summary."
        
        def fallback(prompt):
            name = profile_data.get('fullName', 'Professional')
            skills = profile_data.get('skills', [])
            title = profile_data.get('title', 'Software Engineer')
            skills_str = ", ".join(skills[:4]) if skills else "software development"
            
            return f"Highly motivated and results-driven {title} with a proven track record of designing, developing, and deploying scalable software solutions. Proficient in {skills_str or 'modern technologies'}, with strong problem-solving skills and a passion for engineering high-performance applications. Excellent collaborator with experience leading cross-functional teams to deliver projects on time and within scope."

        return self.call_llm(system_prompt, user_prompt, fallback)

    def rewrite_achievement(self, text):
        system_prompt = "You are a professional resume coach. Rewrite the user's basic achievement into a high-impact, professional bullet point using the STAR method (Situation, Task, Action, Result). Use active verbs and add realistic metrics."
        user_prompt = f"Rewrite this achievement: '{text}'"

        def fallback(prompt):
            cleaned = text.strip().lower()
            if not cleaned:
                return "Developed and implemented scalable solutions to optimize system performance and user experience."
            
            # Match common descriptions to convert into beautiful STAR bullet points
            if "expense tracker" in cleaned:
                return "Developed a full-stack Expense Tracker application using React and Flask to monitor expenses and provide analytical insights, reducing load times by 25% and processing over 5,000 requests daily."
            elif "landing page" in cleaned or "website" in cleaned:
                return "Designed and deployed a responsive landing page using Tailwind CSS, boosting user engagement by 40% and reducing bounce rates by 15%."
            elif "portfolio" in cleaned:
                return "Architected a high-performance personal portfolio website using React, incorporating smooth Framer Motion animations to showcase technical projects and achievements."
            elif "ecommerce" in cleaned or "e-commerce" in cleaned or "shop" in cleaned:
                return "Built a robust E-commerce platform utilizing React, Node.js, and Stripe integration, managing a catalog of 200+ items and secure checkout pipelines."
            elif "chat" in cleaned or "messenger" in cleaned:
                return "Engineered a real-time messaging application utilizing WebSockets and React, facilitating instantaneous message transmission with sub-50ms latency."
            
            # Generic smart expansion
            words = text.split()
            main_noun = words[-1] if words else "components"
            return f"Designed and engineered a full-stack {text} utilizing modern software design patterns, enhancing operational efficiency by 15% and streamlining user workflows."

        return self.call_llm(system_prompt, user_prompt, fallback)

    def suggest_skills(self, role):
        system_prompt = "You are an ATS optimization bot. Provide a JSON object containing suggested skills for the specified role divided into 'languages', 'frameworks', 'databases', 'tools', and 'soft' (soft skills). Format output strictly as JSON: {\"languages\": \"...\", \"frameworks\": \"...\", \"databases\": \"...\", \"tools\": \"...\", \"soft\": \"...\"}"
        user_prompt = f"Role: {role}"

        def fallback(prompt):
            role_clean = role.lower()
            if "react" in role_clean or "frontend" in role_clean or "front-end" in role_clean:
                return json.dumps({
                    "languages": "JavaScript (ES6+), TypeScript, HTML5, CSS3",
                    "frameworks": "React.js, Redux Toolkit, Tailwind CSS, Next.js",
                    "databases": "MongoDB, PostgreSQL",
                    "tools": "Git, GitHub, VS Code, Postman, Vercel",
                    "soft": "Teamwork, Agile Communication, Problem Solving"
                })
            elif "flask" in role_clean or "backend" in role_clean or "back-end" in role_clean or "python" in role_clean:
                return json.dumps({
                    "languages": "Python, SQL, Bash",
                    "frameworks": "Flask, FastAPI, SQLAlchemy, Django",
                    "databases": "PostgreSQL, SQLite, Redis",
                    "tools": "Docker, Git, GitHub, Postman, Render",
                    "soft": "Problem Solving, Collaboration, API Design Thinking"
                })
            else:
                return json.dumps({
                    "languages": "Java, Python, C++, SQL",
                    "frameworks": "Spring Boot, Flask, React.js",
                    "databases": "MySQL, PostgreSQL",
                    "tools": "Git, GitHub, AWS, Docker",
                    "soft": "Communication, Leadership, Critical Thinking"
                })

        res = self.call_llm(system_prompt, user_prompt, fallback)
        try:
            if "```" in res:
                res = re.search(r"(\{.*\})", res.replace("\n", ""), re.DOTALL).group(1)
            return json.loads(res)
        except Exception:
            return {
                "languages": "JavaScript, HTML/CSS",
                "frameworks": "React, Tailwind",
                "databases": "MySQL",
                "tools": "Git, Vercel",
                "soft": "Teamwork, Problem Solving"
            }


    def grammar_correct(self, text):
        system_prompt = "Correct any spelling or grammatical errors in the user text, improving readability without changing its core meaning. Keep it professional."
        user_prompt = text

        def fallback(prompt):
            # Basic capitalization and punctuation fixes
            cleaned = text.strip()
            if not cleaned:
                return ""
            # Capitalize first letter
            cleaned = cleaned[0].upper() + cleaned[1:]
            if not cleaned.endswith('.'):
                cleaned += '.'
            return cleaned

        return self.call_llm(system_prompt, user_prompt, fallback)

    def analyze_ats(self, resume_content):
        # Calculate realistic score locally using our rigorous engine
        score = 40 # Base score starts at 40
        missing = []
        suggestions = []
        
        personal = resume_content.get('personal', {})
        education = resume_content.get('education', [])
        experience = resume_content.get('experience', [])
        projects = resume_content.get('projects', [])
        skills = resume_content.get('skills', {})
        certs = resume_content.get('certifications', [])
        
        # 1. Contact Info & Links (Max 15 points)
        if personal.get('email') and personal.get('phone'):
            score += 5
        else:
            suggestions.append("Add contact details: phone and email address are essential for ATS parsing.")
            missing.append("Contact Details")
            
        if personal.get('linkedin'):
            score += 5
        else:
            suggestions.append("Add your LinkedIn profile link to allow recruiters to view your professional network.")
            missing.append("LinkedIn URL")
            
        if personal.get('github'):
            score += 5
        else:
            suggestions.append("Include a GitHub profile link to showcase code repositories.")
            missing.append("GitHub URL")

        # 2. Professional Summary (Max 10 points)
        summary = personal.get('summary', '').strip()
        if summary:
            word_count = len(summary.split())
            if word_count < 20:
                score += 3
                suggestions.append("Your professional summary is too short. Aim for 30-50 words to make it impactful.")
            elif word_count > 100:
                score += 5
                suggestions.append("Your professional summary is too long. Keep it under 80 words.")
            else:
                score += 10
        else:
            suggestions.append("Include a professional summary highlighting your core value proposition and career target.")
            missing.append("Professional Summary")

        # 3. Work Experience Metrics & Action Verbs (Max 25 points)
        if len(experience) > 0:
            score += 10
            metric_bullets = 0
            action_verb_bullets = 0
            total_bullets = 0
            
            action_verbs_list = {"developed", "designed", "engineered", "implemented", "led", "managed", "created", "optimized", "built", "reduced", "increased", "improved", "automated", "spearheaded", "accelerated", "crafted", "delivered", "coordinated", "established", "architected", "deployed", "secured", "integrated", "monitored", "analyzed", "facilitated", "collaborated", "enhanced", "resolved", "pioneered", "upgraded", "launched", "streamlined", "transformed"}
            
            for exp in experience:
                desc = exp.get('description', '').strip()
                if desc:
                    bullets = [b.strip() for b in re.split(r'[\n•\-\*]', desc) if b.strip()]
                    total_bullets += len(bullets)
                    for bullet in bullets:
                        # Check for metrics
                        if re.search(r'\d+%', bullet) or re.search(r'\$\d+', bullet) or re.search(r'\b\d+\s*(?:hours|days|weeks|months|years|users|transactions|servers|records|percent|x)\b', bullet.lower()):
                            metric_bullets += 1
                        
                        # Check for starting action verb
                        first_word = bullet.split()[0].lower().strip(".,()-\"*") if bullet.split() else ""
                        if first_word in action_verbs_list:
                            action_verb_bullets += 1
            
            if total_bullets > 0:
                metric_ratio = metric_bullets / total_bullets
                verb_ratio = action_verb_bullets / total_bullets
                
                # Metrics (max 10)
                if metric_ratio >= 0.5:
                    score += 10
                elif metric_ratio >= 0.2:
                    score += 5
                    suggestions.append("Quantify more achievements! Only some of your bullet points contain measurable metrics (%, $, numbers).")
                else:
                    suggestions.append("Quantify your achievements: Add measurable metrics (e.g., 'increased revenue by 20%', 'reduced loading time by 15%') to prove your impact.")
                    missing.append("Quantifiable Metrics")
                
                # Action verbs (max 5)
                if verb_ratio >= 0.7:
                    score += 5
                else:
                    score += int(5 * verb_ratio)
                    suggestions.append("Start your bullet points with strong action verbs (e.g. Developed, Engineered, Optimized) rather than passive words.")
            else:
                suggestions.append("Add detailed bullet points describing your achievements under each work experience entry.")
        else:
            suggestions.append("Add work experience or internships to establish professional credibility.")
            missing.append("Work Experience Entries")

        # 4. Technical Projects (Max 15 points)
        if len(projects) > 0:
            score += 10
            if len(projects) < 2:
                suggestions.append("Add at least 2 distinct technical projects to demonstrate your practical application skills.")
            else:
                score += 5
        else:
            suggestions.append("Include personal or academic projects showcasing the technologies you list in your skills section.")
            missing.append("Projects Section")

        # 5. Core Tech Skills Alignment (Max 20 points)
        skills_text = ""
        if isinstance(skills, dict):
            skills_text = " ".join(skills.values()).lower()
        elif isinstance(skills, list):
            skills_text = " ".join(skills).lower()
        else:
            skills_text = str(skills).lower()
            
        if skills_text.strip():
            score += 10
            important_tools = ["git", "docker", "aws", "ci/cd", "agile", "sql", "api"]
            missing_tools = [t for t in important_tools if t not in skills_text]
            
            if missing_tools:
                score += max(0, 10 - len(missing_tools) * 2)
                for tool in missing_tools[:2]:
                    missing.append(tool.upper())
                    suggestions.append(f"Consider listing '{tool.upper()}' under your skills if you have experience with it, as it is a highly searched ATS keyword.")
            else:
                score += 10
        else:
            suggestions.append("Create a dedicated skills section to list your programming languages, frameworks, and tools.")
            missing.append("Skills Inventory")

        # 6. Certifications (Max 5 points)
        if certs and len(certs) > 0:
            score += 5

        # Cap score between 15 and 92 (leave room for improvement)
        score = max(15, min(92, score))
        
        # Try to call LLM for dynamic suggestions, and merge them
        system_prompt = "Analyze the resume content for ATS friendliness. Return a JSON object containing: 'score' (0-100), 'missing_keywords' (list), and 'suggestions' (list of strings)."
        user_prompt = json.dumps(resume_content)
        
        def fallback_handler(prompt):
            return ""
            
        llm_res = self.call_llm(system_prompt, user_prompt, fallback_handler)
        if llm_res:
            try:
                if "```" in llm_res:
                    llm_res = re.search(r"(\{.*\})", llm_res.replace("\n", ""), re.DOTALL).group(1)
                llm_data = json.loads(llm_res)
                # Merge suggestions & missing keywords from LLM
                for sug in llm_data.get('suggestions', []):
                    if sug not in suggestions and len(suggestions) < 6:
                        suggestions.append(sug)
                for kw in llm_data.get('missing_keywords', []):
                    if kw not in missing and len(missing) < 6:
                        missing.append(kw)
            except Exception:
                pass
                
        # Final formatting
        if score >= 85 and len(suggestions) == 0:
            suggestions.append("Outstanding resume metrics! Do a final spelling audit before submitting.")
            
        return {
            'score': score,
            'missing_keywords': missing,
            'suggestions': suggestions
        }

    def generate_linkedin(self, resume_content):
        system_prompt = "Generate 3 professional LinkedIn Headline suggestions and a complete 'About' section based on the user's resume. Return JSON: {'headlines': [...], 'about': '...'}"
        user_prompt = json.dumps(resume_content)

        def fallback(prompt):
            personal = resume_content.get('personal', {})
            name = personal.get('fullName', 'Professional')
            skills = resume_content.get('skills', [])
            skills_str = " | ".join(skills[:3]) if skills else "Software Engineering"
            
            headlines = [
                f"{skills_str} | Passionate about building robust scalable systems",
                f"Aspiring Software Developer | Expert in {skills[:2] if len(skills) > 1 else 'Modern Tech'}",
                f"Full Stack Developer | Transforming ideas into clean, functional code"
            ]
            
            about = f"Hi, I'm {name}! I am a passionate developer skilled in {', '.join(skills[:5]) if skills else 'software development'}. I love building full-stack products, learning new frameworks, and solving complex algorithmic challenges. Throughout my projects and internships, I have focused on writing clean, readable, and highly maintainable code. Let's connect!"
            
            return json.dumps({
                'headlines': headlines,
                'about': about
            })

        res = self.call_llm(system_prompt, user_prompt, fallback)
        try:
            if "```" in res:
                res = re.search(r"(\{.*\})", res.replace("\n", ""), re.DOTALL).group(1)
            return json.loads(res)
        except Exception:
            return {
                'headlines': ['Software Engineer | Problem Solver'],
                'about': 'Passionate software professional.'
            }

    def generate_cover_letter(self, resume_content, job_desc):
        system_prompt = f"Write a professional cover letter based on the applicant's resume and this job description: {job_desc}"
        user_prompt = json.dumps(resume_content)

        def fallback(prompt):
            personal = resume_content.get('personal', {})
            name = personal.get('fullName', 'Applicant')
            email = personal.get('email', 'email@example.com')
            phone = personal.get('phone', '+91 9999999999')
            
            # Simple keyword extraction from job description
            job_title = "Software Developer"
            company = "Hiring Team"
            
            # Extract basic job title if matches
            m = re.search(r'(react|flask|frontend|backend|data|python|ml|developer|analyst|engineer)', job_desc.lower())
            if m:
                job_title = m.group(1).capitalize() + " Developer"
            
            letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at your organization. With a solid foundation in software engineering and practical hands-on experience developing projects, I am confident in my ability to make a meaningful contribution to your team.

My technical background aligns well with the requirements outlined in the job description. I have worked extensively with modern technologies, developing and optimization applications that deliver positive user experiences. 

I would welcome the opportunity to discuss how my skills and qualifications make me a strong candidate for this role. Thank you for your time and consideration.

Sincerely,
{name}
{email} | {phone}"""
            return letter

        return self.call_llm(system_prompt, user_prompt, fallback)
