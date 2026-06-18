from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils.ai_helper import AIHelper

ai_bp = Blueprint('ai', __name__)
ai_helper = AIHelper()

@ai_bp.route('/summary', methods=['POST'])
@jwt_required()
def generate_summary():
    data = request.get_json() or {}
    profile_data = data.get('profile')
    if not profile_data:
        return jsonify({'error': 'Profile data is required'}), 400
        
    summary = ai_helper.generate_summary(profile_data)
    return jsonify({'summary': summary}), 200

@ai_bp.route('/rewrite-achievement', methods=['POST'])
@jwt_required()
def rewrite_achievement():
    data = request.get_json() or {}
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text to rewrite is required'}), 400
        
    rewritten = ai_helper.rewrite_achievement(text)
    return jsonify({'rewritten': rewritten}), 200

@ai_bp.route('/suggest-skills', methods=['POST'])
@jwt_required()
def suggest_skills():
    data = request.get_json() or {}
    role = data.get('role')
    if not role:
        return jsonify({'error': 'Role description/title is required'}), 400
        
    skills = ai_helper.suggest_skills(role)
    return jsonify({'skills': skills}), 200

@ai_bp.route('/grammar-correct', methods=['POST'])
@jwt_required()
def grammar_correct():
    data = request.get_json() or {}
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text is required'}), 400
        
    corrected = ai_helper.grammar_correct(text)
    return jsonify({'corrected': corrected}), 200

@ai_bp.route('/ats-score', methods=['POST'])
@jwt_required()
def ats_score():
    data = request.get_json() or {}
    resume_content = data.get('content')
    if not resume_content:
        return jsonify({'error': 'Resume content is required'}), 400
        
    analysis = ai_helper.analyze_ats(resume_content)
    return jsonify(analysis), 200

@ai_bp.route('/linkedin', methods=['POST'])
@jwt_required()
def linkedin_optimize():
    data = request.get_json() or {}
    resume_content = data.get('content')
    if not resume_content:
        return jsonify({'error': 'Resume content is required'}), 400
        
    result = ai_helper.generate_linkedin(resume_content)
    return jsonify(result), 200

@ai_bp.route('/cover-letter', methods=['POST'])
@jwt_required()
def cover_letter():
    data = request.get_json() or {}
    resume_content = data.get('content')
    job_desc = data.get('job_description')
    
    if not resume_content or not job_desc:
        return jsonify({'error': 'Resume content and job description are required'}), 400
        
    letter = ai_helper.generate_cover_letter(resume_content, job_desc)
    return jsonify({'cover_letter': letter}), 200
