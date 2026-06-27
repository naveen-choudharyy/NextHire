import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import {
  Users,
  DollarSign,
  FileCode,
  CheckCircle,
  BarChart3,
  ShieldAlert,
  Search,
  Trash2,
  Edit3,
  Star,
  RefreshCw,
  FileText,
  Check,
  X,
  Shield,
  Coins,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'users' | 'reviews' | 'transactions' | 'logs'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingPayments, setPendingPayments] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // User Management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editCreditsValue, setEditCreditsValue] = useState(0);

  // Review Moderation state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Transaction Ledger state
  const [allPayments, setAllPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user]);

  // Handle active tab fetching
  useEffect(() => {
    if (user && user.role === 'admin') {
      if (activeTab === 'stats') {
        fetchAdminStats();
        fetchPendingPayments();
      } else if (activeTab === 'users') {
        fetchUsers(searchQuery);
      } else if (activeTab === 'reviews') {
        fetchReviews();
      } else if (activeTab === 'transactions') {
        fetchAllPayments();
      } else if (activeTab === 'logs') {
        fetchAuditLogs();
      }
    }
  }, [activeTab, user]);

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

  // 1. User Management Functions
  const fetchUsers = async (query = '') => {
    setUsersLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/users?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUpdateRole = async (targetUserId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const response = await fetch(`${API_BASE}/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchUsers(searchQuery);
      } else {
        alert(data.error || data.message || "Failed to update role.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating role.");
    }
  };

  const handleUpdateCredits = async (targetUserId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${targetUserId}/credits`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits: Number(editCreditsValue) })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setEditingUserId(null);
        fetchUsers(searchQuery);
      } else {
        alert(data.error || data.message || "Failed to update credits.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating credits.");
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm("WARNING: Deleting this user will permanently delete their account, resumes, and reviews. This action CANNOT be undone. Are you sure you want to proceed?")) return;
    try {
      const response = await fetch(`${API_BASE}/admin/users/${targetUserId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchUsers(searchQuery);
      } else {
        alert(data.error || data.message || "Failed to delete user.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error deleting user.");
    }
  };

  // 2. Review Moderation Functions
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/reviews/all`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleReviewFeatured = async (reviewId, currentFeatured) => {
    try {
      const response = await fetch(`${API_BASE}/admin/reviews/${reviewId}/feature`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFeatured: !currentFeatured })
      });
      const data = await response.json();
      if (response.ok) {
        fetchReviews();
      } else {
        alert(data.error || data.message || "Failed to update featured status.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`${API_BASE}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchReviews();
      } else {
        alert(data.error || data.message || "Failed to delete review.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error deleting review.");
    }
  };

  // 3. Transaction Ledger Functions
  const fetchAllPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/payments`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAllPayments(data);
      }
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // 4. Audit Logs Functions
  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/logs`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs:", e);
    } finally {
      setLogsLoading(false);
    }
  };

  // Global error view
  if (error) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  // Initial dashboard load spinner
  if (loading && !stats) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Format template statistics for Recharts
  const templateChartData = stats ? Object.keys(stats.template_analytics || {}).map(key => ({
    name: key.replace('-', ' ').toUpperCase(),
    resumes: stats.template_analytics[key]
  })) : [];

  // Format signup data for line charts
  const signupChartData = stats ? stats.daily_signups || [] : [];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-brand-500" />
            <span>Admin Management Console</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time control over SaaS users, payments, reviews, and security logs.</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'stats') { fetchAdminStats(); fetchPendingPayments(); }
            else if (activeTab === 'users') fetchUsers(searchQuery);
            else if (activeTab === 'reviews') fetchReviews();
            else if (activeTab === 'transactions') fetchAllPayments();
            else if (activeTab === 'logs') fetchAuditLogs();
          }}
          className="flex items-center space-x-2 bg-dark-800 hover:bg-dark-700 text-gray-300 font-semibold px-4 py-2 rounded-lg text-xs transition border border-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 space-x-6 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'stats' ? 'border-brand-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard & Approvals</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'users' ? 'border-brand-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Directory</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'reviews' ? 'border-brand-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Star className="h-4 w-4" />
          <span>Reviews Moderation</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'transactions' ? 'border-brand-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Transaction Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'logs' ? 'border-brand-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Security Audit Logs</span>
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. STATS & ANALYTICS TAB */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8 animate-fadeIn">
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
                      <tr key={p.id || index} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300">
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
        </div>
      )}

      {/* 2. USER DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          {/* User Search & Filter */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(searchQuery)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-dark-950 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={() => fetchUsers(searchQuery)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>
          </div>

          {/* User Directory Table */}
          <div className="glass rounded-2xl border border-white/5 p-6">
            {usersLoading ? (
              <div className="py-12 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-dark-700 text-gray-400">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">System Role</th>
                      <th className="py-3 px-4">Credits Balance</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users && users.length > 0 ? (
                      users.map((u) => (
                        <tr key={u.id} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300">
                          <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                            {u.role === 'admin' && <Shield className="h-3.5 w-3.5 text-brand-400" />}
                            <span>{u.fullName || 'No Name'}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-400">{u.email}</td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              disabled={u.id === user.id}
                              className="bg-dark-900 border border-white/15 rounded text-[11px] px-2 py-1 text-white focus:outline-none focus:border-brand-500 disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {editingUserId === u.id ? (
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type="number"
                                  value={editCreditsValue}
                                  onChange={(e) => setEditCreditsValue(e.target.value)}
                                  className="w-16 bg-dark-950 border border-white/20 rounded text-[11px] px-1.5 py-0.5 text-white focus:outline-none focus:border-brand-500"
                                />
                                <button
                                  onClick={() => handleUpdateCredits(u.id)}
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Coins className="h-3.5 w-3.5 text-yellow-500" />
                                <span className="font-bold text-white">{u.credits}</span>
                                <button
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditCreditsValue(u.credits);
                                  }}
                                  className="text-gray-500 hover:text-white p-1 rounded"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user.id}
                              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded disabled:opacity-50 transition"
                              title="Delete user permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-gray-500 italic">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REVIEWS MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="glass rounded-2xl border border-white/5 p-6">
            {reviewsLoading ? (
              <div className="py-12 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-dark-700 text-gray-400">
                      <th className="py-3 px-4">Reviewer</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Comment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews && reviews.length > 0 ? (
                      reviews.map((r) => (
                        <tr key={r.id} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{r.user_name || 'Anonymous'}</div>
                            <div className="text-[10px] text-gray-500">{r.user_email || 'No email'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < r.rating ? 'fill-current' : 'text-gray-600'}`}
                                />
                              ))}
                              <span className="ml-1 font-bold text-white text-[11px]">{r.rating}/5</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-sm break-words italic text-gray-300">
                            "{r.comment}"
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleReviewFeatured(r.id, r.isFeatured)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition flex items-center space-x-1 ${
                                r.isFeatured
                                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                                  : 'bg-dark-800 text-gray-400 border-white/5 hover:text-white hover:bg-dark-700'
                              }`}
                            >
                              <Star className={`h-3 w-3 ${r.isFeatured ? 'fill-current' : ''}`} />
                              <span>{r.isFeatured ? 'Featured' : 'Standard'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded transition"
                              title="Delete review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-gray-500 italic">No reviews found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TRANSACTION LEDGER TAB */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="glass rounded-2xl border border-white/5 p-6">
            {paymentsLoading ? (
              <div className="py-12 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-dark-700 text-gray-400">
                      <th className="py-3 px-4">Order ID / Ref ID</th>
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Paid Amount</th>
                      <th className="py-3 px-4">Transaction Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments && allPayments.length > 0 ? (
                      allPayments.map((p) => (
                        <tr key={p.id} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300">
                          <td className="py-3 px-4">
                            <div className="font-mono text-white text-[11px]">{p.razorpay_order_id}</div>
                            <div className="text-[9px] text-gray-500 font-mono">Pay ID: {p.razorpay_payment_id || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{p.user_name || 'Unknown'}</div>
                            <div className="text-[10px] text-gray-500">{p.user_email || 'Unknown'}</div>
                          </td>
                          <td className="py-3 px-4 capitalize font-semibold">{p.plan_type.replace('_', ' ')}</td>
                          <td className="py-3 px-4 font-bold text-white">₹{p.amount}</td>
                          <td className="py-3 px-4">
                            {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              p.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : p.status === 'pending' || p.status === 'verifying'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-gray-500 italic">No payments processed.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SECURITY AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="glass rounded-2xl border border-white/5 p-6">
            {logsLoading ? (
              <div className="py-12 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-dark-700 text-gray-400">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs && auditLogs.length > 0 ? (
                      auditLogs.map((l) => (
                        <tr key={l.id} className="border-b border-dark-800 hover:bg-dark-800/40 text-gray-300">
                          <td className="py-3 px-4 whitespace-nowrap text-gray-400">
                            {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{l.user_name || 'System/Guest'}</div>
                            <div className="text-[10px] text-gray-500">{l.user_email || 'anonymous'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-brand-400">{l.action}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              l.status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : l.status === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-500">{l.ipAddress || '127.0.0.1'}</td>
                          <td className="py-3 px-4 max-w-xs truncate font-mono text-[10px] text-gray-400" title={JSON.stringify(l.details)}>
                            {JSON.stringify(l.details)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-gray-500 italic">No audit logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
