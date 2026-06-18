import secrets
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User, Referral

auth_bp = Blueprint('auth', __name__)

def generate_unique_referral_code():
    while True:
        code = f"NH-{secrets.token_hex(3).upper()}"
        if not User.query.filter_by(referral_code=code).first():
            return code

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    ref_code_used = data.get('referral_code') # Code of user who referred this new user
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 400
        
    new_user = User(
        email=email,
        full_name=full_name,
        referral_code=generate_unique_referral_code()
    )
    new_user.set_password(password)
    
    # Process Referral Code (relationship stored, credits awarded later upon first payment)
    if ref_code_used:
        referrer = User.query.filter_by(referral_code=ref_code_used.strip()).first()
        if referrer:
            new_user.referred_by = referrer.referral_code
            
    db.session.add(new_user)
        
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed. Please try again.'}), 500
        
    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        'message': 'User registered successfully',
        'token': access_token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if request.method == 'GET':
        return jsonify(user.to_dict()), 200
        
    # PUT request
    data = request.get_json() or {}
    user.full_name = data.get('full_name', user.full_name)
    
    # If password is changing
    new_password = data.get('password')
    if new_password:
        user.set_password(new_password)
        
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Profile update failed'}), 500
        
    return jsonify(user.to_dict()), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Avoid user enumeration, return success
        return jsonify({'message': 'If the email exists, a reset code was sent.'}), 200
        
    return jsonify({'message': 'Reset link sent to your registered email.'}), 200
