import hmac
import hashlib
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import Payment, User

payment_bp = Blueprint('payment', __name__)

PRICING_PLANS = {
    'basic': 30.00,
    'premium': 50.00
}

def complete_payment_record(payment, user):
    payment.status = 'completed'
    
    # Process referral payout on first completed payment
    if user and user.referred_by:
        from models import Referral
        existing_referral = Referral.query.filter_by(referee_id=user.id).first()
        if not existing_referral:
            # First payment! Find the referrer
            referrer = User.query.filter_by(referral_code=user.referred_by).first()
            if referrer:
                # Award ₹5 credits to referrer
                referrer.credits += 5
                
                # Log referral
                referral_record = Referral(
                    referrer_id=referrer.id,
                    referee_id=user.id,
                    credits_awarded=5
                )
                db.session.add(referral_record)
                db.session.flush()
                
                # Check for free resume slot (every 6 successful referrals)
                successful_referrals_count = Referral.query.filter_by(referrer_id=referrer.id).count()
                if successful_referrals_count % 6 == 0:
                    import secrets
                    free_slot = Payment(
                        user_id=referrer.id,
                        amount=0.0,
                        plan_type='basic',
                        status='completed',
                        razorpay_order_id=f"free_ref_{secrets.token_hex(8)}",
                        razorpay_payment_id="referral_bonus_free_slot"
                    )
                    db.session.add(free_slot)

@payment_bp.route('/order', methods=['POST'])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    plan_type = data.get('plan_type')
    
    if plan_type not in PRICING_PLANS:
        return jsonify({'error': 'Invalid plan type selected'}), 400
        
    plan_price = PRICING_PLANS[plan_type]
    
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # Calculate applied credits
    used_credits = min(plan_price, user.credits)
    amount = plan_price - used_credits
    
    from flask import current_app
    razorpay_key_id = current_app.config.get("RAZORPAY_KEY_ID", "rzp_test_mock_123456")
    razorpay_key_secret = current_app.config.get("RAZORPAY_KEY_SECRET", "mock_secret_123456")
    
    # Check if credits fully cover the price
    if amount == 0:
        # Deduct credits immediately
        user.credits -= int(used_credits)
        
        import secrets
        order_id = f"credit_use_{secrets.token_hex(8)}"
        
        payment_record = Payment(
            user_id=int(user_id),
            amount=0.0,
            plan_type=plan_type,
            status='completed',
            razorpay_order_id=order_id,
            razorpay_payment_id="paid_with_credits"
        )
        db.session.add(payment_record)
        
        # Process referrals & slot bonuses
        complete_payment_record(payment_record, user)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Failed to create payment order via credits'}), 500
            
        return jsonify({
            'order_id': order_id,
            'amount': 0,
            'currency': 'INR',
            'plan_type': plan_type,
            'razorpay_key_id': razorpay_key_id,
            'paid_with_credits': True
        }), 201
        
    simulate = data.get('simulate', False)
    is_keys_configured = razorpay_key_id and razorpay_key_id != "rzp_test_mock_123456" and razorpay_key_secret and razorpay_key_secret != "mock_secret_123456"
    simulate_order = simulate or not is_keys_configured

    if not simulate_order:
        try:
            import razorpay
            client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
            # Create Razorpay order
            rzp_order = client.order.create({
                "amount": int(amount * 100), # amount in paise
                "currency": "INR"
            })
            order_id = rzp_order.get("id")
        except Exception as e:
            print("Razorpay order creation failed:", str(e))
            return jsonify({
                'error': f'Razorpay order creation failed: {str(e)}',
                'razorpay_error': True,
                'suggestion': 'It looks like your Razorpay credentials failed authentication. Please verify your keys or enable Sandbox Simulation Mode for testing.'
            }), 400
    else:
        import secrets
        order_id = f"sim_ord_{secrets.token_hex(8)}"

    # Create pending payment record
    payment_record = Payment(
        user_id=int(user_id),
        amount=amount,
        plan_type=plan_type,
        status='pending',
        razorpay_order_id=order_id
    )
    
    db.session.add(payment_record)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create payment order'}), 500
        
    return jsonify({
        'order_id': order_id,
        'amount': amount * 100, # paise
        'currency': 'INR',
        'plan_type': plan_type,
        'razorpay_key_id': razorpay_key_id if not simulate_order else 'rzp_test_mock_123456',
        'is_simulated': simulate_order
    }), 201

@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    order_id = data.get('razorpay_order_id')
    payment_id = data.get('razorpay_payment_id')
    signature = data.get('razorpay_signature')
    
    if not order_id:
        return jsonify({'error': 'Order ID is required'}), 400
        
    payment = Payment.query.filter_by(razorpay_order_id=order_id).first()
    if not payment:
        return jsonify({'error': 'Payment transaction not found'}), 404
        
    user = User.query.get(payment.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    from flask import current_app
    razorpay_key_id = current_app.config.get("RAZORPAY_KEY_ID")
    razorpay_key_secret = current_app.config.get("RAZORPAY_KEY_SECRET")

    # Check if it was a simulated order
    if order_id.startswith('sim_ord_'):
        payment.status = 'completed'
        payment.razorpay_payment_id = payment_id or f"pay_sim_{secrets_payment_id()}"
    else:
        if not razorpay_key_id or razorpay_key_id == "rzp_test_mock_123456" or not razorpay_key_secret or razorpay_key_secret == "mock_secret_123456":
            return jsonify({'error': 'Razorpay payment gateway is not configured. Please set real keys in the backend .env file.'}), 400

        if not signature or signature == "sandbox_sig":
            return jsonify({'error': 'Invalid payment signature. Sandbox payments are not supported.'}), 400
            
        try:
            import razorpay
            client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
            # This throws an exception if the signature is invalid
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
            payment.status = 'completed'
            payment.razorpay_payment_id = payment_id
        except Exception as e:
            print("Razorpay signature verification failed:", str(e))
            return jsonify({'error': f'Payment signature verification failed: {str(e)}'}), 400
            
    # Deduct user credits if any were used
    plan_price = PRICING_PLANS.get(payment.plan_type, 30.0)
    used_credits = max(0.0, plan_price - payment.amount)
    if used_credits > 0:
        user.credits = max(0, user.credits - int(used_credits))
        
    # Process referral payout on first completed payment
    complete_payment_record(payment, user)
        
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to record payment verification'}), 500
        
    return jsonify({
        'message': 'Payment verified successfully',
        'payment': payment.to_dict()
    }), 200

@payment_bp.route('/status', methods=['GET'])
@jwt_required()
def payment_status():
    user_id = get_jwt_identity()
    # Find all completed payments for this user
    payments = Payment.query.filter_by(user_id=int(user_id), status='completed').all()
    plans = [p.plan_type for p in payments]
    
    return jsonify({
        'purchased_plans': plans,
        'has_premium': 'premium' in plans,
        'has_portfolio': False,
        'has_cover_letter': 'premium' in plans
    }), 200

@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def payment_history():
    user_id = get_jwt_identity()
    payments = Payment.query.filter_by(user_id=int(user_id)).order_by(Payment.created_at.desc()).all()
    return jsonify([p.to_dict() for p in payments]), 200

@payment_bp.route('/verify-keys', methods=['GET'])
@jwt_required()
def verify_keys():
    from flask import current_app
    import razorpay
    
    razorpay_key_id = current_app.config.get("RAZORPAY_KEY_ID")
    razorpay_key_secret = current_app.config.get("RAZORPAY_KEY_SECRET")
    
    if not razorpay_key_id or razorpay_key_id == "rzp_test_mock_123456" or not razorpay_key_secret or razorpay_key_secret == "mock_secret_123456":
        return jsonify({
            'status': 'unconfigured',
            'error': 'Keys are missing or set to mock defaults.'
        }), 200
        
    try:
        client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
        client.order.create({
            "amount": 100,
            "currency": "INR"
        })
        return jsonify({
            'status': 'valid',
            'key_id': razorpay_key_id
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'invalid',
            'key_id': razorpay_key_id,
            'error': str(e)
        }), 200

def secrets_payment_id():
    import secrets
    return secrets.token_hex(7)
