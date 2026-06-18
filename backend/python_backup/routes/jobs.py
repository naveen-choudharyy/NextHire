from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Resume

jobs_bp = Blueprint('jobs', __name__)

# Mock database of current job listings
JOB_LISTINGS = [
    {
        'id': 'job-1',
        'title': 'React Front-End Developer',
        'company': 'TechCorp Systems',
        'location': 'Bengaluru (Hybrid)',
        'type': 'Full-time',
        'salary': '₹8,00,000 - ₹12,00,000/yr',
        'keywords': ['react', 'javascript', 'tailwind', 'typescript', 'redux', 'html', 'css'],
        'description': 'Responsible for developing highly responsive web interfaces using React.js and modern CSS frameworks.'
    },
    {
        'id': 'job-2',
        'title': 'Flask / Python Backend Developer',
        'company': 'DevScale Solutions',
        'location': 'Remote',
        'type': 'Full-time',
        'salary': '₹10,00,000 - ₹15,00,000/yr',
        'keywords': ['python', 'flask', 'sql', 'postgresql', 'apis', 'jwt', 'docker', 'rest'],
        'description': 'Build high performance REST APIs and manage relational database schemas using SQLAlchemy.'
    },
    {
        'id': 'job-3',
        'title': 'Data Analyst',
        'company': 'FinanceFlow Analytics',
        'location': 'Mumbai',
        'type': 'Full-time',
        'salary': '₹7,00,000 - ₹10,00,000/yr',
        'keywords': ['sql', 'python', 'pandas', 'tableau', 'excel', 'powerbi', 'statistics'],
        'description': 'Translate raw operational financial data into actionable visual insights and business intelligence.'
    },
    {
        'id': 'job-4',
        'title': 'Machine Learning Intern',
        'company': 'DeepAI Lab',
        'location': 'Remote',
        'type': 'Internship',
        'salary': '₹25,000/mo',
        'keywords': ['python', 'pytorch', 'tensorflow', 'machine learning', 'numpy', 'scikit-learn'],
        'description': 'Train, validate and deploy neural networks and custom models for image classification and NLP.'
    },
    {
        'id': 'job-5',
        'title': 'UI/UX Product Designer',
        'company': 'CreativeHub Agency',
        'location': 'Pune',
        'type': 'Full-time',
        'salary': '₹6,00,000 - ₹9,00,000/yr',
        'keywords': ['figma', 'design', 'wireframe', 'prototype', 'adobe', 'ux', 'ui'],
        'description': 'Design user-centric interfaces and map complex user journeys for Web/Mobile products.'
    },
    {
        'id': 'job-6',
        'title': 'Business Analyst (MBA Fresher)',
        'company': 'MarketGrow Consultancy',
        'location': 'New Delhi',
        'type': 'Full-time',
        'salary': '₹9,00,000 - ₹13,00,000/yr',
        'keywords': ['management', 'strategy', 'analysis', 'communication', 'agile', 'scrum', 'sql'],
        'description': 'Coordinate requirements between product stakeholders and technical engineering leads.'
    }
]

@jobs_bp.route('/match/<resume_id>', methods=['GET'])
@jwt_required()
def match_jobs(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.get(resume_id)
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
        
    if resume.user_id != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    # Extract keywords from resume
    content = resume.content or {}
    skills = [s.lower() for s in content.get('skills', [])]
    
    # Also extract from experience/projects text to improve match
    experience_desc = " ".join([exp.get('description', '').lower() for exp in content.get('experience', [])])
    projects_desc = " ".join([proj.get('description', '').lower() for proj in content.get('projects', [])])
    
    resume_corpus = " ".join(skills) + " " + experience_desc + " " + projects_desc
    
    # Score each job
    matches = []
    for job in JOB_LISTINGS:
        matching_keywords = []
        for kw in job['keywords']:
            # check if keyword matches skills or project/experience description
            if kw in resume_corpus:
                matching_keywords.append(kw)
                
        # calculate percentage match
        kw_len = len(job['keywords'])
        match_score = int((len(matching_keywords) / kw_len) * 100) if kw_len > 0 else 0
        
        # Give fallback 35% minimum match if they have at least 1 keyword, or 20% flat
        if match_score == 0 and len(matching_keywords) > 0:
            match_score = 35
            
        matches.append({
            'job': job,
            'match_score': max(20, match_score), # min 20% to look realistic
            'matching_keywords': matching_keywords
        })
        
    # Sort matches by match_score desc
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify(matches), 200
