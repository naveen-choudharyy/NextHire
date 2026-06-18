import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, Resume, Payment, Review

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized. Admin access required.'}), 403
        
    # Gather statistics
    total_users = User.query.count()
    total_resumes = Resume.query.count()
    
    # Revenue calculations
    payments_completed = Payment.query.filter_by(status='completed').all()
    total_revenue = sum(p.amount for p in payments_completed)
    
    # Template usage
    template_counts = {}
    resumes = Resume.query.all()
    for r in resumes:
        template_counts[r.template_id] = template_counts.get(r.template_id, 0) + 1
        
    # User signups over last 7 days
    today = datetime.datetime.utcnow().date()
    daily_signups = []
    for i in range(7):
        day = today - datetime.timedelta(days=i)
        start_time = datetime.datetime.combine(day, datetime.time.min)
        end_time = datetime.datetime.combine(day, datetime.time.max)
        count = User.query.filter(User.created_at >= start_time, User.created_at <= end_time).count()
        daily_signups.append({
            'date': day.strftime('%Y-%m-%d'),
            'count': count
        })
    daily_signups.reverse()
        
    return jsonify({
        'total_users': total_users,
        'total_resumes': total_resumes,
        'total_revenue': total_revenue,
        'template_analytics': template_counts,
        'daily_signups': daily_signups,
        'payments': [p.to_dict() for p in payments_completed[-15:]] # last 15 payments
    }), 200

# Public Reviews/Testimonials Route
@admin_bp.route('/reviews', methods=['GET'])
def get_reviews():
    # Fetch top/featured reviews to display on landing page
    reviews = Review.query.order_by(Review.created_at.desc()).limit(10).all()
    return jsonify([r.to_dict() for r in reviews]), 200

@admin_bp.route('/reviews', methods=['POST'])
@jwt_required()
def post_review():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    rating = data.get('rating')
    comment = data.get('comment')
    
    if not rating or not comment:
        return jsonify({'error': 'Rating and comment are required'}), 400
        
    try:
        rating_val = int(rating)
        if rating_val < 1 or rating_val > 5:
            raise ValueError()
    except ValueError:
        return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
        
    # Check if user already reviewed
    existing = Review.query.filter_by(user_id=int(user_id)).first()
    if existing:
        existing.rating = rating_val
        existing.comment = comment
        existing.created_at = datetime.datetime.utcnow()
    else:
        new_review = Review(
            user_id=int(user_id),
            rating=rating_val,
            comment=comment,
            is_featured=(rating_val >= 4)
        )
        db.session.add(new_review)
        
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to post review'}), 500
        
    return jsonify({'message': 'Review submitted successfully'}), 201
