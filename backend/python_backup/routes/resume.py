from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import Resume, User

resume_bp = Blueprint('resume', __name__)

@resume_bp.route('', methods=['GET'])
@jwt_required()
def get_all_resumes():
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=int(user_id)).order_by(Resume.updated_at.desc()).all()
    return jsonify([r.to_dict() for r in resumes]), 200

@resume_bp.route('/<resume_id>', methods=['GET'])
@jwt_required(optional=True)
def get_resume(resume_id):
    resume = Resume.query.get(resume_id)
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
        
    current_user_id = get_jwt_identity()
    
    # If not the owner and not public, deny
    if not resume.is_public and (not current_user_id or int(current_user_id) != resume.user_id):
        return jsonify({'error': 'Access denied'}), 403
        
    # Check if this resume has an allocated completed payment
    from models import Payment, User
    payment = Payment.query.filter_by(allocated_resume_id=resume.id, status='completed').first()
    
    # Backward compatibility: Auto-allocate if an unallocated payment is found for this user
    owner = User.query.get(resume.user_id)
    is_admin = owner and owner.role == 'admin'
    
    if not payment and not is_admin:
        unallocated = Payment.query.filter_by(user_id=resume.user_id, status='completed', allocated_resume_id=None).first()
        if unallocated:
            unallocated.allocated_resume_id = resume.id
            try:
                db.session.commit()
                payment = unallocated
            except Exception:
                db.session.rollback()
                
    resume_dict = resume.to_dict()
    resume_dict['has_paid'] = (payment is not None) or is_admin
    resume_dict['plan_type'] = payment.plan_type if payment else ('premium' if is_admin else None)
    
    return jsonify(resume_dict), 200

@resume_bp.route('', methods=['POST'])
@jwt_required()
def create_resume():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    user = User.query.get(int(user_id))
    is_admin = user and user.role == 'admin'
    unallocated_payment = None
    
    if not is_admin:
        # Enforce business limit: User must have an unallocated completed payment
        from models import Payment
        unallocated_payment = Payment.query.filter_by(
            user_id=int(user_id),
            status='completed',
            allocated_resume_id=None
        ).first()
        
        if not unallocated_payment:
            return jsonify({
                'error': 'Please purchase a resume slot to create a new resume. Each slot is ₹30.'
            }), 402  # 402 Payment Required

    # Initial empty or basic template structure
    default_content = {
        'personal': {
            'fullName': '', 
            'email': user.email if user else '', 
            'phone': '', 'website': '',
            'github': '', 'linkedin': '', 'location': '', 'summary': ''
        },
        'education': [],
        'experience': [],
        'projects': [],
        'skills': {
            'languages': '',
            'frameworks': '',
            'databases': '',
            'tools': '',
            'soft': '',
            'other': ''
        },
        'certifications': [],
        'achievements': [],
        'languages': [],
        'extracurriculars': []
    }

    # Check if they passed content
    content = data.get('content', default_content)

    title = data.get('title', 'Untitled Resume')
    template_id = data.get('template_id', 'ats-friendly')
    
    # Create resume
    new_resume = Resume(
        user_id=int(user_id),
        title=title,
        template_id=template_id,
        content=content,
        portfolio_slug=f"portfolio-{secrets_slug(6)}"
    )
    
    db.session.add(new_resume)
    
    # Allocate payment if not admin
    if unallocated_payment:
        unallocated_payment.allocated_resume_id = new_resume.id
        
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create resume: {str(e)}'}), 500
        
    return jsonify(new_resume.to_dict()), 201

@resume_bp.route('/<resume_id>', methods=['PUT'])
@jwt_required()
def update_resume(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.get(resume_id)
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
        
    if resume.user_id != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json() or {}
    user = User.query.get(int(user_id))
    
    if 'title' in data:
        resume.title = data['title']
    if 'template_id' in data:
        resume.template_id = data['template_id']
    if 'content' in data:
        # Lock name to first saved value on this resume to prevent account sharing
        personal = data['content'].get('personal', {})
        new_name = personal.get('fullName', '').strip()
        
        existing_name = resume.content.get('personal', {}).get('fullName', '').strip() if (resume.content and 'personal' in resume.content) else ''
        
        if existing_name:
            if not new_name:
                personal['fullName'] = existing_name
            elif new_name.lower().replace(" ", "") != existing_name.lower().replace(" ", ""):
                return jsonify({
                    'error': f'To prevent account sharing, you cannot change the name on this resume once it has been saved. The name must match: "{existing_name}".'
                }), 400
        resume.content = data['content']
    if 'ats_score' in data:
        resume.ats_score = data['ats_score']
    if 'is_public' in data:
        resume.is_public = data['is_public']
    if 'portfolio_slug' in data:
        slug = data['portfolio_slug'].strip().lower().replace(" ", "-")
        # Ensure slug is unique
        existing = Resume.query.filter(Resume.portfolio_slug == slug, Resume.id != resume_id).first()
        if existing:
            return jsonify({'error': 'Portfolio URL slug is already in use'}), 400
        resume.portfolio_slug = slug
        
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed'}), 500
        
    return jsonify(resume.to_dict()), 200

@resume_bp.route('/<resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.get(resume_id)
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
        
    if resume.user_id != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(resume)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Delete failed'}), 500
        
    return jsonify({'message': 'Resume deleted successfully'}), 200

@resume_bp.route('/<resume_id>/download-start', methods=['POST'])
@jwt_required()
def start_download_window(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.get(resume_id)
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
        
    if resume.user_id != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    import datetime
    now = datetime.datetime.utcnow()
    
    # Check if currently active (within 24 hours of first download)
    is_active = False
    if resume.downloaded_at:
        elapsed = (now - resume.downloaded_at).total_seconds()
        if elapsed < 86400: # 24 hours
            is_active = True
            
    if is_active:
        return jsonify({
            'message': 'Download window is already active',
            'resume': resume.to_dict(),
            'expires_in_seconds': int(86400 - (now - resume.downloaded_at).total_seconds())
        }), 200
        
    # If not active, we need to activate or reactivate
    # 1. Check if it is the free resume slot (oldest created resume) and has never been downloaded
    resumes = Resume.query.filter_by(user_id=int(user_id)).order_by(Resume.created_at.asc()).all()
    is_free_resume = len(resumes) > 0 and resumes[0].id == resume.id
    
    if is_free_resume and not resume.downloaded_at:
        # Free activation
        resume.downloaded_at = now
        try:
            db.session.commit()
            return jsonify({
                'message': 'Free download slot activated',
                'resume': resume.to_dict(),
                'expires_in_seconds': 86400
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Failed to activate download slot'}), 500
            
    # 2. Paid activation or reactivation (either expired free resume, or any paid resume)
    # Search for an unallocated completed payment
    from models import Payment
    unallocated_payment = Payment.query.filter_by(
        user_id=int(user_id),
        status='completed',
        allocated_resume_id=None
    ).first()
    
    if not unallocated_payment:
        return jsonify({
            'error': 'Download period expired. Please purchase another plan to reactivate download access or create a new resume.',
            'code': 'PAYMENT_REQUIRED'
        }), 402
        
    # Allocate payment to this resume
    unallocated_payment.allocated_resume_id = resume.id
    resume.downloaded_at = now
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Download slot activated/reactivated successfully via plan allocation',
            'resume': resume.to_dict(),
            'expires_in_seconds': 86400
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to allocate payment slot: {str(e)}'}), 500

@resume_bp.route('/public/<slug>', methods=['GET'])
def get_public_resume(slug):
    resume = Resume.query.filter_by(portfolio_slug=slug, is_public=True).first()
    if not resume:
        return jsonify({'error': 'Public portfolio resume not found'}), 404
        
    return jsonify({
        'content': resume.content,
        'template_id': resume.template_id,
        'title': resume.title
    }), 200

def secrets_slug(length=6):
    import secrets
    return secrets.token_hex(length // 2)
