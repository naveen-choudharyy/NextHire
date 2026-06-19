import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import { FilePlus, Edit3, Trash2, Gift, Send, ExternalLink, Briefcase, Copy, Star, Sparkles, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Dashboard = () => {
  const { user, token, getAuthHeaders, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  
  // Job Recommendation State
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedResumeForJobs, setSelectedResumeForJobs] = useState('');

  // Referral State
  const [copied, setCopied] = useState(false);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Checkout Modal State for slot purchases
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('paytm');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
              fetchProfile();
              fetchPaymentHistory();
              handleCreateResume();
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

  // Payment History State
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const plans = [
    {
      name: "Resume Builder Pass",
      price: "₹30",
      description: "Full access to all templates, AI rewrites, score checkers, and cover letters.",
      type: "basic"
    }
  ];

  useEffect(() => {
    if (token) {
      fetchResumes();
      fetchPaymentHistory();
    }
  }, [token]);

  const fetchPaymentHistory = async () => {
    setLoadingPayments(true);
    try {
      const response = await fetch(`${API_BASE}/payment/history`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch payment history:", e);
    } finally {
      setLoadingPayments(false);
    }
  };


  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const response = await fetch(`${API_BASE}/resume`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
        if (data.length > 0) {
          // Select the first resume to load jobs for by default
          setSelectedResumeForJobs(data[0].id);
          fetchJobMatches(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load resumes', e);
    } finally {
      setLoadingResumes(false);
    }
  };

  const fetchJobMatches = async (resumeId) => {
    if (!resumeId) return;
    setLoadingJobs(true);
    try {
      const response = await fetch(`${API_BASE}/jobs/match/${resumeId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setMatchedJobs(data.slice(0, 3)); // show top 3 jobs
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCreateResume = async () => {
    try {
      const response = await fetch(`${API_BASE}/resume`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: 'My New Resume' })
      });
      if (response.ok) {
        const newResume = await response.json();
        navigate(`/builder/${newResume.id}`);
      } else if (response.status === 402) {
        // Open Checkout Modal
        setSelectedPlan(plans[0]); // default to basic
        setPaymentSuccess(false);
        setPaymentLoading(false);
        setShowCheckout(true);
        setShowQRScreen(false);
        setTimeLeft(300);
        setCurrentOrderData(null);
        setTransactionId('');
        setPaymentVerifying(false);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "Failed to initialize resume. Try again.");
      }
    } catch (e) {
      console.error(e);
    }
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
        fetchProfile();
        fetchPaymentHistory();
        setPaymentLoading(false);
        handleCreateResume();
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
                fetchProfile();
                fetchPaymentHistory();
                handleCreateResume();
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

      // Transition to simulated UPI QR payment display
      setCurrentOrderData(orderData);
      setTimeLeft(300); // Reset countdown to 5 minutes
      setShowQRScreen(true);
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/resume/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setResumes(resumes.filter(r => r.id !== id));
        if (selectedResumeForJobs === id) {
          setMatchedJobs([]);
        }
      }
    } catch (e) {
      console.error(e);
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
          fetchProfile();
          fetchPaymentHistory();
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

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!comment) return;
    
    try {
      const response = await fetch(`${API_BASE}/admin/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment })
      });
      if (response.ok) {
        setReviewSuccess(true);
        setComment('');
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Hello, {user?.fullName || 'User'}</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your professional resumes and matches below.</p>
        </div>
        <button
          onClick={handleCreateResume}
          className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg transition shadow-lg shadow-brand-500/20"
        >
          <FilePlus className="h-5 w-5" />
          <span>New Resume</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resumes List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Your Resumes</span>
            <span className="text-xs bg-dark-800 text-gray-400 rounded-full px-2.5 py-0.5 border border-dark-700">
              {resumes.length} total
            </span>
          </h2>

          {loadingResumes ? (
            <div className="h-48 flex items-center justify-center rounded-2xl bg-dark-800/40 border border-dark-800">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center rounded-2xl border-2 border-dashed border-dark-800 p-12 bg-dark-800/20">
              <p className="text-gray-400 text-sm mb-4">No resumes found. Start by creating a resume from scratch.</p>
              <button
                onClick={handleCreateResume}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                Create First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => navigate(`/builder/${resume.id}`)}
                  className="group relative glass hover:border-brand-500/40 p-5 rounded-xl border border-dark-800 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">
                        {resume.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        Template: {resume.template_id.replace('-', ' ')}
                      </p>
                    </div>
                    {resume.ats_score > 0 && (
                      <span className="text-xs bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20 rounded-full px-2 py-0.5">
                        ATS: {resume.ats_score}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center text-xs text-gray-500 border-t border-dark-800/80 pt-3">
                    <span>Updated {new Date(resume.updated_at).toLocaleDateString()}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/builder/${resume.id}`); }}
                        className="p-1 hover:text-white rounded"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteResume(resume.id, e)}
                        className="p-1 hover:text-red-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Job Recommendations widget */}
          {resumes.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-brand-500" />
                  <span>AI Job Recommendations</span>
                </h3>
                
                {/* Select Resume to recommendation toggle */}
                <select
                  value={selectedResumeForJobs}
                  onChange={(e) => {
                    setSelectedResumeForJobs(e.target.value);
                    fetchJobMatches(e.target.value);
                  }}
                  className="bg-dark-900 border border-dark-700 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              {loadingJobs ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                </div>
              ) : matchedJobs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No job recommendations loaded. Make sure your resume has skills filled in.</p>
              ) : (
                <div className="space-y-3">
                  {matchedJobs.map((match, idx) => (
                    <div key={match.job.id} className="flex justify-between items-center p-3.5 bg-dark-900/50 border border-dark-800 rounded-lg hover:border-dark-700 transition">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{match.job.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{match.job.company}</span>
                          <span>•</span>
                          <span>{match.job.location}</span>
                          <span>•</span>
                          <span className="text-brand-400 font-semibold">{match.job.salary}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-500/10 border border-brand-500/20 text-brand-400">
                          {match.match_score}% Match
                        </span>
                        <a
                          href="#apply"
                          onClick={(e) => {
                            e.preventDefault();
                            const query = encodeURIComponent(`${match.job.title} ${match.job.company}`);
                            window.open(`https://www.linkedin.com/jobs/search/?keywords=${query}`, '_blank');
                          }}
                          className="block text-[11px] text-gray-400 hover:text-brand-400 mt-1 underline transition-colors"
                        >
                          Quick Apply
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          


          {/* Testimonial review Submission Form */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="h-5 w-5 text-accent-500" />
              <span>Share Your Review</span>
            </h3>
            <p className="text-xs text-gray-400">Your reviews help us improve and inspire others.</p>
            
            {reviewSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                Review submitted successfully! Thank you.
              </div>
            )}

            <form onSubmit={handlePostReview} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-yellow-500 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Your Story</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Helped me get shortlisted at..."
                  required
                  className="w-full text-xs p-2.5 bg-dark-950 border border-dark-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-white placeholder-gray-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-dark-900 border border-dark-700 hover:bg-dark-800 text-white text-xs font-semibold py-2 rounded-lg transition"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Billing & Transaction History */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <CreditCard className="h-4.5 w-4.5 text-brand-400" />
              <span>Billing & Transaction History</span>
            </h3>
            
            {loadingPayments ? (
              <div className="h-16 flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border border-brand-500 border-t-transparent" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No transaction records found.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {payments.map((pay) => (
                  <div key={pay.id} className="p-3 bg-dark-950/40 border border-dark-800 rounded-lg text-xs space-y-1.5 hover:border-dark-700 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white capitalize">{pay.plan_type} Slot</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pay.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : pay.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Amount:</span>
                      <span className="font-semibold text-white">₹{pay.amount}</span>
                    </div>
                    {pay.razorpay_payment_id && (
                      <div className="flex justify-between text-gray-500 text-[10px] font-mono">
                        <span>TXID:</span>
                        <span className="select-all">{pay.razorpay_payment_id}</span>
                      </div>
                    )}
                    <div className="text-[9px] text-gray-500 text-right">
                      {new Date(pay.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (() => {
        const planPrice = parseInt(selectedPlan.price.replace('₹', ''), 10);
        const finalAmount = planPrice;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden animate-zoomIn">
              
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

              {paymentSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                    <span className="text-xl text-emerald-400">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
                  <p className="text-sm text-gray-400">
                    You have successfully purchased a <strong>{selectedPlan.name}</strong>. You can now build your resume.
                  </p>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      handleCreateResume(); // Automatically call create resume after payment success!
                    }}
                    className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-600 transition"
                  >
                    Create Resume Now
                  </button>
                </div>
              ) : paymentVerifying ? (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2 animate-pulse">
                    <span className="text-xl">⏳</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Verification Pending</h3>
                  <p className="text-sm text-gray-450">
                    Your payment reference (UTR: <strong>{transactionId}</strong>) has been submitted. The admin will verify the transfer shortly to unlock your slot.
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
                      className="w-full text-xs p-2.5 bg-dark-950 border border-dark-800 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                  
                  {/* Plan Selection tabs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Select Plan Type
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {plans.map((p) => (
                        <button
                          key={p.type}
                          type="button"
                          onClick={() => setSelectedPlan(p)}
                          className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 ${
                            selectedPlan.type === p.type ? 'border-brand-500 bg-brand-500/5 text-white' : 'border-dark-700 text-gray-400'
                          }`}
                        >
                          <span className="font-bold text-white text-xs">{p.name}</span>
                          <span className="text-brand-400 text-sm">{p.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan Summary */}
                  <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white">{selectedPlan.name}</h4>
                      <p className="text-xs text-gray-500">{selectedPlan.description}</p>
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

export default Dashboard;
