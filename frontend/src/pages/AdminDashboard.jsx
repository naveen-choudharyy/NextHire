import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, DollarSign, FileCode, CheckCircle, BarChart3, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingPayments, setPendingPayments] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    } else {
      fetchAdminStats();
      fetchPendingPayments();
    }
  }, [user]);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/payments/pending`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data);
      }
    } catch (e) {
      console.error("Failed to fetch pending payments:", e);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    setActionLoadingId(paymentId);
    try {
      const response = await fetch(`${API_BASE}/admin/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        alert("Payment approved successfully!");
        fetchAdminStats();
        fetchPendingPayments();
      } else {
        alert(data.error || data.message || "Failed to approve payment.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error approving payment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    setActionLoadingId(paymentId);
    try {
      const response = await fetch(`${API_BASE}/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        alert("Payment rejected successfully!");
        fetchAdminStats();
        fetchPendingPayments();
      } else {
        alert(data.error || data.message || "Failed to reject payment.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error rejecting payment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to fetch admin stats');
      }
    } catch (e) {
      console.error(e);
      setError('Network error loading admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-gray-400 text-sm">{error || "You do not have administrative permissions to view this resource."}</p>
      </div>
    );
  }

  // Format template statistics for Recharts
  const templateChartData = Object.keys(stats.template_analytics || {}).map(key => ({
    name: key.replace('-', ' ').toUpperCase(),
    resumes: stats.template_analytics[key]
  }));

  // Format signup data for line charts
  const signupChartData = stats.daily_signups || [];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-brand-500" />
          <span>Admin Management Console</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Real-time reports on users, subscriptions, templates and signups.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-black text-white">{stats.total_users}</p>
          </div>
          <span className="p-3 bg-brand-500/10 text-brand-400 rounded-lg">
            <Users className="h-6 w-6" />
          </span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Gross Revenue</p>
            <p className="text-3xl font-black text-white">₹{stats.total_revenue}</p>
          </div>
          <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Resumes Generated</p>
            <p className="text-3xl font-black text-white">{stats.total_resumes}</p>
          </div>
          <span className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <FileCode className="h-6 w-6" />
          </span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Premium Purchases</p>
            <p className="text-3xl font-black text-white">{stats.payments?.length || 0}</p>
          </div>
          <span className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
            <CheckCircle className="h-6 w-6" />
          </span>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Signup Velocity Chart */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Signup Velocity (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Template Popularity Chart */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Popular Resume Templates</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                <Bar dataKey="resumes" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Payments Pending Manual Verification Section */}
      <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Payments Pending Manual Verification</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-700 text-gray-400">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Payable</th>
                <th className="py-3 px-4 font-mono">UTR / Ref Code</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments && pendingPayments.length > 0 ? (
                pendingPayments.map((p, index) => (
                  <tr key={p.id || index} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300 animate-fadeIn">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.user_name || 'Unknown'}</div>
                      <div className="text-[10px] text-gray-500">{p.user_email || 'Unknown'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400">{p.razorpay_order_id}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{p.plan_type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{p.amount}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-400">{p.razorpay_payment_id || 'N/A'}</td>
                    <td className="py-3 px-4">{p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprovePayment(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded transition disabled:opacity-50 text-[10px] shadow-sm shadow-emerald-500/10"
                      >
                        {actionLoadingId === p.id ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRejectPayment(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded transition disabled:opacity-50 text-[10px] shadow-sm shadow-rose-500/10"
                      >
                        {actionLoadingId === p.id ? "Rejecting..." : "Reject"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500 italic">No payments pending manual verification.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions History Listing */}
      <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-700 text-gray-400">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Plan Selected</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Transaction Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.payments && stats.payments.length > 0 ? (
                stats.payments.map((p, index) => (
                  <tr key={p.id || index} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300">
                    <td className="py-3 px-4 font-mono text-gray-400">{p.razorpay_order_id}</td>
                    <td className="py-3 px-4">{p.user_id}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{p.plan_type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{p.amount}</td>
                    <td className="py-3 px-4">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500 italic">No transactions processed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
