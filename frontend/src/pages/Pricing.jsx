import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Check, Shield, Award, CheckCircle, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Pricing = () => {
  const { user, token, getAuthHeaders, fetchProfile } = useAuth();
  const [purchasedPlans, setPurchasedPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('paytm');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Keys status & simulation settings
  const [keysStatus, setKeysStatus] = useState({ status: 'checking' });
  const [simulateMode, setSimulateMode] = useState(false);

  // UPI QR Code state & timer state
  const [showQRScreen, setShowQRScreen] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [transactionId, setTransactionId] = useState('');
  const [paymentVerifying, setPaymentVerifying] = useState(false);

  // Countdown timer hook
  useEffect(() => {
    let timer;
    if (showQRScreen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowQRScreen(false);
            setShowCheckout(false);
            alert("Payment session expired. Please scan and pay within 5 minutes.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRScreen, timeLeft]);

  // Polling payment status when order is active
  useEffect(() => {
    let interval;
    if (showCheckout && currentOrderData && !paymentSuccess) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE}/payment/history`, {
            headers: getAuthHeaders()
          });
          if (response.ok) {
            const history = await response.json();
            const order = history.find(p => p.razorpay_order_id === currentOrderData.order_id);
            if (order && order.status === 'completed') {
              setPaymentSuccess(true);
              setPaymentVerifying(false);
              setShowQRScreen(false);
              fetchPurchasedPlans();
              fetchProfile();
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error("Error polling payment status:", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [showCheckout, currentOrderData, paymentSuccess]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (token) {
      fetchPurchasedPlans();
      fetchKeysStatus();
    }
  }, [token]);

  const fetchKeysStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/payment/verify-keys`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setKeysStatus(data);
        if (data.status === 'invalid' || data.status === 'unconfigured') {
          setSimulateMode(true);
        }
      }
    } catch (e) {
      console.error("Failed to verify keys:", e);
    }
  };

  const fetchPurchasedPlans = async () => {
    try {
      const response = await fetch(`${API_BASE}/payment/status`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPurchasedPlans(data.purchased_plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleOpenCheckout = (plan) => {
    if (!user) {
      alert("Please login first to purchase a plan.");
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
    setPaymentSuccess(false);
    setPaymentLoading(false);
    setPaymentMethod('paytm');
    setSimulateMode(true);
    setShowQRScreen(false);
    setTimeLeft(300);
    setCurrentOrderData(null);
    setTransactionId('');
    setPaymentVerifying(false);
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      // Create Order on Backend (Dynamic simulation based on backend keys)
      const orderRes = await fetch(`${API_BASE}/payment/order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          plan_type: selectedPlan.type
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        const errorMsg = orderData.message || (typeof orderData.error === 'object' ? orderData.error?.message : orderData.error) || orderData.msg || 'Failed to create payment order';
        throw new Error(errorMsg);
      }

      // Check if order was fully paid using credits
      if (orderData.paid_with_credits) {
        setPaymentSuccess(true);
        fetchPurchasedPlans();
        fetchProfile();
        setPaymentLoading(false);
        return;
      }

      // If backend is configured with real keys, open official Razorpay Checkout modal
      if (!orderData.is_simulated && window.Razorpay) {
        const options = {
          key: orderData.razorpay_key_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'NextHire',
          description: selectedPlan.name,
          order_id: orderData.order_id,
          handler: async function (response) {
            setPaymentLoading(true);
            try {
              const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                setPaymentSuccess(true);
                setShowCheckout(false);
                fetchPurchasedPlans();
                fetchProfile();
              } else {
                const verifyErr = verifyData.message || verifyData.error || 'Payment verification failed';
                alert(`Verification failed: ${verifyErr}`);
              }
            } catch (err) {
              alert(`Verification error: ${err.message}`);
            } finally {
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: user?.fullName || 'User',
            email: user?.email || 'user@example.com'
          },
          theme: {
            color: '#4f46e5'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setPaymentLoading(false);
        return;
      }

      // Transition to UPI QR payment display
      setCurrentOrderData(orderData);
      setTimeLeft(300); // Reset countdown to 5 minutes
      setShowQRScreen(true);
      setPaymentLoading(false);
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
      setPaymentLoading(false);
    }
  };

  const handleVerifyQR = async () => {
    if (!currentOrderData) return;
    if (!/^\d{12}$/.test(transactionId)) {
      alert("Please enter a valid 12-digit UPI UTR / Reference number.");
      return;
    }
    setPaymentLoading(true);
    try {
      const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          razorpay_order_id: currentOrderData.order_id,
          transaction_id: transactionId
        })
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        if (verifyData.status === 'verifying') {
          setPaymentVerifying(true);
          setShowQRScreen(false);
        } else {
          setPaymentSuccess(true);
          setShowQRScreen(false);
          fetchPurchasedPlans();
          fetchProfile();
        }
      } else {
        const verifyError = verifyData.message || (typeof verifyData.error === 'object' ? verifyData.error?.message : verifyData.error) || verifyData.msg || 'Payment verification failed';
        alert(`Payment verification failed: ${verifyError}`);
      }
    } catch (err) {
      alert(`Payment verification error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const plans = [
    {
      name: "Resume Builder Pass",
      price: "₹30",
      description: "Full access to resume building, all templates, AI STAR rewriters, score checkers, and cover letters.",
      type: "basic",
      features: [
        "Access to All 4 Layout Templates",
        "Unlimited AI Bullet Point Rewrites",
        "AI Resume Summary Composer",
        "ATS Core Score Checker & Matcher",
        "Integrated AI Cover Letter Generator",
        "Professional PDF Download"
      ],
      icon: Award,
      color: "text-blue-400 border-blue-500/20",
      popular: true
    }
  ];

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Pick the perfect package to accelerate your job hunt. Pay once, download or host forever.
        </p>
      </div>

      {/* Plans grid */}
      <div className="max-w-md mx-auto">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isPurchased = purchasedPlans.includes(plan.type);
          
          return (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-2xl bg-dark-800/60 p-6 border transition-all duration-300 relative ${
                plan.popular ? 'border-brand-500 shadow-xl shadow-brand-500/5 ring-1 ring-brand-500' : 'border-dark-700'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              
              <div>
                <div className="flex justify-between items-start">
                  <span className={`p-2 rounded-lg bg-dark-900 border ${plan.color}`}>
                    <PlanIcon className="h-6 w-6" />
                  </span>
                  {isPurchased && (
                    <span className="text-xs bg-brand-500/15 text-brand-400 font-bold border border-brand-500/30 rounded-full px-2.5 py-0.5">
                      Active Plan
                    </span>
                  )}
                </div>
                
                <h3 className="mt-4 text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-400 min-h-[40px]">{plan.description}</p>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="ml-1 text-sm font-medium text-gray-500">one-time</span>
                </div>
                
                <ul className="mt-6 space-y-3 border-t border-dark-700 pt-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start text-sm text-gray-300">
                      <Check className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => handleOpenCheckout(plan)}
                className={`mt-8 w-full rounded-lg py-2.5 text-sm font-semibold text-center transition-all ${
                  plan.popular
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/10 shadow-lg shadow-brand-500/25'
                    : 'bg-dark-900 text-white hover:bg-dark-800 border border-dark-700'
                }`}
              >
                {isPurchased ? 'Buy Another Slot' : 'Purchase Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Checkout Simulation Modal */}
      {showCheckout && selectedPlan && (() => {
        const planPrice = parseInt(selectedPlan.price.replace('₹', ''), 10);
        const finalAmount = planPrice;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="bg-dark-950 p-4 border-b border-dark-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="bg-brand-500 p-1.5 rounded text-white text-xs font-bold">NH</span>
                  <span className="font-bold text-white">NextHire Checkout</span>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              {paymentSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
                  <p className="text-sm text-gray-400">
                    You have successfully purchased the <strong>{selectedPlan.name}</strong>. Your plan features are now active.
                  </p>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-600 transition"
                  >
                    Return to Panel
                  </button>
                </div>
              ) : paymentVerifying ? (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2 animate-pulse">
                    <span className="text-xl">⏳</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Verification Pending</h3>
                  <p className="text-sm text-gray-400">
                    Your payment reference (UTR: <strong>{transactionId}</strong>) has been submitted. The admin will verify the transfer shortly to unlock your plan.
                  </p>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-600 transition"
                  >
                    Close
                  </button>
                </div>
              ) : showQRScreen ? (
                <div className="p-6 space-y-6 text-center">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Scan & Pay via UPI</h3>
                    <p className="text-xs text-gray-400 text-center">Scan using any UPI app (GPay, Paytm, PhonePe)</p>
                  </div>

                  {/* Dynamic QR Code Card with Locked Amount */}
                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
                    <QRCodeSVG 
                      value={`upi://pay?pa=9257540743@ptsbi&pn=Naveen&am=${finalAmount}&mam=${finalAmount}&cu=INR&tr=${currentOrderData?.order_id || 'order'}`}
                      size={192}
                      className="mx-auto"
                    />
                  </div>

                  {/* Pricing and Timer Details */}
                  <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 space-y-2 text-left">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Plan:</span>
                      <span className="font-bold text-white">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Payable Amount:</span>
                      <span className="text-brand-400 font-extrabold text-lg">₹{finalAmount}</span>
                    </div>
                    <div className="border-t border-dark-800 pt-2 flex justify-between items-center text-sm">
                      <span className="text-gray-400">Session Expires In:</span>
                      <span className="text-rose-400 font-mono font-bold flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-2"></span>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-gray-400">
                      Enter UPI Ref No. / UTR (12 digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 123456789012"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs p-2.5 bg-dark-950 border border-dark-800 rounded-lg text-white font-mono placeholder-gray-655 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleVerifyQR}
                      disabled={paymentLoading || transactionId.length !== 12}
                      className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Verify Payment</span>
                      )}
                    </button>
                    <button
                      onClick={() => setShowQRScreen(false)}
                      className="w-full bg-dark-900 border border-dark-700 text-gray-400 py-2.5 rounded-lg font-semibold hover:text-white transition"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  
                  {/* Plan Summary */}
                  <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white">{selectedPlan.name}</h4>
                      <p className="text-xs text-gray-500">Includes lifetime templates & tools</p>
                    </div>
                    <span className="text-xl font-bold text-brand-400">{selectedPlan.price}</span>
                  </div>

                  {/* Plan Price Summary */}
                  <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 flex justify-between items-center text-sm font-bold text-white">
                    <span>Net Payable Amount:</span>
                    <span className="text-brand-400 text-lg">₹{finalAmount}</span>
                  </div>

                  {/* Checkout Trigger */}
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Generating QR Code...</span>
                      </>
                    ) : (
                      <span>Pay ₹{finalAmount}</span>
                    )}
                  </button>

                </div>
              )}

            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Pricing;
