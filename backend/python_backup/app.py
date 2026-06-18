import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database import db
from models import User, Review

# Import routes
from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.ai import ai_bp
from routes.payment import payment_bp
from routes.admin import admin_bp
from routes.jobs import jobs_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize DB & JWT
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    
    # Create tables & seed data
    with app.app_context():
        db.create_all()
        seed_data()
        
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy', 'service': 'NextHire API'}), 200
        
    return app

def seed_data():
    # 1. Seed Admin User
    admin = User.query.filter_by(email='admin@nexthire.com').first()
    if not admin:
        admin_user = User(
            email='admin@nexthire.com',
            full_name='NextHire Administrator',
            referral_code='NH-ADMIN',
            role='admin',
            credits=100
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        print("Seeded admin account (admin@nexthire.com / admin123)")
        
    # 2. Seed Testimonials/Reviews
    if Review.query.count() == 0:
        # Create a mock user to assign reviews to
        mock_reviewer = User.query.filter_by(email='user@test.com').first()
        if not mock_reviewer:
            mock_reviewer = User(
                email='user@test.com',
                full_name='Naveen Kumar',
                referral_code='NH-TESTER',
                role='user',
                credits=20
            )
            mock_reviewer.set_password('user123')
            db.session.add(mock_reviewer)
            db.session.flush()
            
        reviews = [
            Review(user_id=mock_reviewer.id, rating=5, comment="Helped me get shortlisted at Infosys! The AI achievement rewriter is pure magic.", is_featured=True),
            Review(user_id=mock_reviewer.id, rating=5, comment="A absolute steal at ₹30/resume. ATS score optimizer pointed out exactly what was missing.", is_featured=True),
            Review(user_id=mock_reviewer.id, rating=5, comment="Built my developer portfolio in 1-click. Downloaded the source and hosted it on my own server easily.", is_featured=True),
            Review(user_id=mock_reviewer.id, rating=4, comment="Very clean, ATS-friendly templates. Landed 3 interviews within 2 weeks of applying.", is_featured=True),
        ]
        db.session.bulk_save_objects(reviews)
        print("Seeded reviews/testimonials")
        
    db.session.commit()

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
