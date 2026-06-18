import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Shield, Lock, Unlock, Eye, EyeOff, Activity, AlertTriangle, CheckCircle, Info, Database, Server, Smartphone, Key } from 'lucide-react';

const SecurityCenter = () => {
  const { user, token, getAuthHeaders } = useAuth();
  
  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsError, setLogsError] = useState('');

  // GDPR Encryption Preview State
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  
  // Encryption preview toggles
  const [showPlaintext, setShowPlaintext] = useState(false);

  useEffect(() => {
    if (token) {
      fetchLogs();
      fetchResumes();
    }
  }, [token]);

  useEffect(() => {
    if (selectedResumeId && resumes.length > 0) {
      const res = resumes.find(r => r.id === selectedResumeId);
      setSelectedResume(res || null);
    } else {
      setSelectedResume(null);
    }
  }, [selectedResumeId, resumes]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setLogsError('');
    try {
      const response = await fetch(`${API_BASE}/auth/security-logs`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data || []);
      } else {
        setLogsError('Failed to fetch security activity logs.');
      }
    } catch (e) {
      setLogsError('Could not connect to the audit API.');
    } finally {
      setLoadingLogs(false);
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
        setResumes(data || []);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResumes(false);
    }
  };

  const formatAction = (action) => {
    switch (action) {
      case 'USER_LOGGED_IN': return 'Successful Sign In';
      case 'USER_LOGIN_FAILED': return 'Failed Sign In Attempt';
      case 'USER_REGISTERED': return 'Account Registered';
      case 'USER_PROFILE_UPDATED': return 'Profile/Credentials Modified';
      case 'PASSWORD_RESET_REQUESTED': return 'Password Reset Initiated';
      case 'PAYMENT_COMPLETED': return 'Payment Order Verified';
      case 'PAYMENT_PENDING_APPROVAL': return 'UPI Reference Submitted';
      default: return action.replace(/_/g, ' ');
    }
  };

  // Helper to parse user agent
  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Microsoft Edge";

    if (ua.includes("Macintosh")) os = "macOS";
    else if (ua.includes("Windows")) os = "Windows OS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";

    return { browser, os };
  };

  const currentDevice = getDeviceDetails();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
          <Shield className="h-8 w-8 text-emerald-400" />
          <span>Security & GDPR Privacy Center</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor your active sessions, inspect cryptographically secure databases, and view your verified audit trail logs.
        </p>
      </div>

      {/* Top Section: Active Session and GDPR Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Session Card & Tech details */}
        <div className="space-y-8">
          
          {/* Current Session details */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
              <Smartphone className="h-4.5 w-4.5 text-emerald-400" />
              <span>Current Security Session</span>
            </h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center bg-dark-950/40 p-2.5 border border-dark-800 rounded-lg">
                <span className="text-gray-400">Authorized User:</span>
                <span className="font-semibold text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center bg-dark-950/40 p-2.5 border border-dark-800 rounded-lg">
                <span className="text-gray-400">Operating System:</span>
                <span className="font-semibold text-white">{currentDevice.os}</span>
              </div>
              <div className="flex justify-between items-center bg-dark-950/40 p-2.5 border border-dark-800 rounded-lg">
                <span className="text-gray-400">Browser Environment:</span>
                <span className="font-semibold text-white">{currentDevice.browser}</span>
              </div>
              <div className="flex justify-between items-center bg-dark-950/40 p-2.5 border border-dark-800 rounded-lg">
                <span className="text-gray-400">Account Role:</span>
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {user?.role || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptography details */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
              <Key className="h-4.5 w-4.5 text-emerald-400" />
              <span>Cryptographic Architecture</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This application complies with industry standard privacy guidelines (GDPR/CCPA) by implementing:
            </p>
            
            <ul className="space-y-2.5 text-[11px] text-gray-400 pt-1">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>AES-256-GCM Encryption</strong>: Data is encrypted using 256-bit symmetric keys with authenticated integrity checks.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>Random Initialization Vectors (IV)</strong>: Every record receives a unique salt, making duplicate inputs result in entirely distinct ciphertexts.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>Strict JWT Sessions</strong>: Handshakes are fully secured using HTTP-only cookies and cryptographically signed tokens.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: GDPR Database Encryption Visualizer Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 space-y-2 sm:space-y-0">
              <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                <Database className="h-4.5 w-4.5 text-emerald-400" />
                <span>GDPR Proof of Database Encryption at Rest</span>
              </h3>
              
              {!loadingResumes && resumes.length > 0 && (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="bg-dark-900 border border-dark-700 rounded-lg text-[11px] py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              )}
            </div>

            {loadingResumes ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border border-emerald-500 border-t-transparent" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic text-xs">
                No resumes found. Create a resume to view live database encryption examples.
              </div>
            ) : selectedResume ? (() => {
              const personal = selectedResume.content?.personal || {};
              const emailVal = personal.email || 'N/A';
              const phoneVal = personal.phone || 'N/A';
              const addressVal = personal.address || 'N/A';
              
              const encPreview = selectedResume.encrypted_preview || {};
              const encEmail = encPreview.email || 'N/A';
              const encPhone = encPreview.phone || 'N/A';
              const encAddress = encPreview.address || 'N/A';

              return (
                <div className="space-y-6">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Below is a real-time visual demonstration of data security. Mongoose hooks encrypt these candidate-identifiable fields using <strong>AES-256-GCM</strong> prior to database persistence. Only authenticated REST requests dynamically decrypt the ciphertext.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Database Storage Representation */}
                    <div className="p-4 bg-dark-950 border border-dark-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-rose-400 border-b border-dark-800 pb-2 text-xs font-bold font-mono">
                        <span className="flex items-center space-x-1.5">
                          <Lock className="h-3.5 w-3.5" />
                          <span>RAW MONGODB RECORD (Ciphertext)</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                          Encrypted
                        </span>
                      </div>
                      
                      <div className="space-y-3 font-mono text-[10px] text-gray-500 break-all select-all">
                        <div className="space-y-0.5">
                          <span className="text-gray-400 font-semibold">personal.email:</span>
                          <p className="bg-dark-900 p-2 rounded border border-dark-800/60 max-h-16 overflow-y-auto">{encEmail}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 font-semibold">personal.phone:</span>
                          <p className="bg-dark-900 p-2 rounded border border-dark-800/60 max-h-16 overflow-y-auto">{encPhone}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 font-semibold">personal.address:</span>
                          <p className="bg-dark-900 p-2 rounded border border-dark-800/60 max-h-16 overflow-y-auto">{encAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Authorized Client View */}
                    <div className="p-4 bg-dark-950/60 border border-dark-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-emerald-400 border-b border-dark-800 pb-2 text-xs font-bold font-mono">
                        <span className="flex items-center space-x-1.5">
                          <Unlock className="h-3.5 w-3.5" />
                          <span>REST CLIENT VIEW (Plaintext)</span>
                        </span>
                        
                        <button
                          onClick={() => setShowPlaintext(!showPlaintext)}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center space-x-1"
                        >
                          {showPlaintext ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Hide Data</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Reveal Plain</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="space-y-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-gray-400 font-semibold">personal.email:</span>
                          <p className="bg-dark-900 p-2 rounded border border-dark-800/60 font-medium font-mono text-gray-200">
                            {showPlaintext ? emailVal : '•••••••••••••••••••••'}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 font-semibold">personal.phone:</span>
                          <p className="bg-dark-900 p-2 rounded border border-dark-800/60 font-medium font-mono text-gray-200">
                            {showPlaintext ? phoneVal : '•••••••••••••••••••••'}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 font-semibold">personal.address:</span>
                          <p className="bg-dark-900 p-2 rounded border border-dark-800/60 font-medium font-mono text-gray-200">
                            {showPlaintext ? addressVal : '•••••••••••••••••••••'}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })() : null}

          </div>
        </div>

      </div>

      {/* Bottom Section: Activity Audit Log Trail */}
      <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
            <span>Security Activity & Audit Log Trail</span>
          </h3>
          
          <button
            onClick={fetchLogs}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
          >
            <span>Refresh Logs</span>
          </button>
        </div>

        {loadingLogs ? (
          <div className="h-32 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border border-emerald-500 border-t-transparent" />
          </div>
        ) : logsError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-xs flex items-center justify-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{logsError}</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-6">No session logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-800 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Event Action</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 font-mono">IP Address</th>
                  <th className="py-2.5 px-3 text-right">Event Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/60">
                {logs.map((log) => {
                  const isFail = log.status === 'failure';
                  return (
                    <tr key={log.id} className="hover:bg-dark-950/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-gray-200">
                        {formatAction(log.action)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isFail 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-400 select-all">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500 font-mono text-[10px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default SecurityCenter;
