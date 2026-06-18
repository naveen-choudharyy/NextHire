import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import { BrainCircuit, Sparkles, AlertTriangle, ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react';

const LinkedIn = () => {
  const { token, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [headlines, setHeadlines] = useState([]);
  const [aboutText, setAboutText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAbout, setCopiedAbout] = useState(false);

  useEffect(() => {
    if (token) {
      checkAccessAndFetchResumes();
    }
  }, [token]);

  const checkAccessAndFetchResumes = async () => {
    try {
      const statusRes = await fetch(`${API_BASE}/payment/status`, {
        headers: getAuthHeaders()
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setHasAccess(statusData.has_premium || statusData.has_portfolio);
      }

      const resumesRes = await fetch(`${API_BASE}/resume`, {
        headers: getAuthHeaders()
      });
      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setResumes(resumesData);
        if (resumesData.length > 0) {
          setSelectedResumeId(resumesData[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedResumeId) return;

    setLoading(true);
    try {
      const resumeRes = await fetch(`${API_BASE}/resume/${selectedResumeId}`, {
        headers: getAuthHeaders()
      });
      const resumeData = await resumeRes.json();

      const response = await fetch(`${API_BASE}/ai/linkedin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: resumeData.content })
      });

      const data = await response.json();
      if (response.ok) {
        setHeadlines(data.headlines || []);
        setAboutText(data.about || '');
      } else {
        alert(data.error || 'Failed to generate LinkedIn optimizations');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyHeadline = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAbout = () => {
    navigator.clipboard.writeText(aboutText);
    setCopiedAbout(true);
    setTimeout(() => setCopiedAbout(false), 2000);
  };

  if (checkingAccess) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-white">Resume Pass Required</h2>
        <p className="text-gray-400 text-sm">
          LinkedIn profile optimization requires an active resume pass. Unlock it instantly with our <strong>Resume Builder Pass</strong> to polish your digital profile.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 border border-dark-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-800 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/pricing"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm text-white font-semibold shadow-lg shadow-brand-500/25 transition"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link to="/dashboard" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 mb-2 transition">
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white">LinkedIn Profile Optimizer</h1>
        <p className="text-xs text-gray-400 mt-1">
          Generate headlines and descriptive "About" sections based on your resume achievements.
        </p>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Choose Resume Profile</label>
            {resumes.length === 0 ? (
              <p className="text-xs text-red-400 italic">No resumes found. Create one first.</p>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full text-xs p-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || resumes.length === 0}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-lg transition shadow-md shadow-brand-500/20 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Optimizing Profiles...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="h-4 w-4" />
                <span>Analyze & Optimize</span>
              </>
            )}
          </button>
        </div>

        {/* Headlines and About sections */}
        {(headlines.length > 0 || aboutText) && (
          <div className="space-y-6 border-t border-dark-800 pt-6 animate-zoomIn">
            
            {/* Headlines Section */}
            {headlines.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Suggested Headline Bullets</h3>
                <div className="space-y-2">
                  {headlines.map((hl, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-dark-900/50 border border-dark-800 rounded-lg">
                      <span className="text-xs text-gray-300 leading-relaxed pr-4">{hl}</span>
                      <button
                        onClick={() => copyHeadline(hl, idx)}
                        className="text-brand-500 hover:text-brand-400 p-1 bg-dark-900 border border-dark-850 rounded hover:bg-dark-800 flex items-center space-x-1"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-[10px] text-brand-400 font-bold px-1">Copied!</span>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            {aboutText && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Suggested "About" Section</h3>
                  <button
                    onClick={copyAbout}
                    className="text-brand-500 hover:text-brand-400 text-xs font-semibold flex items-center space-x-1"
                  >
                    {copiedAbout ? (
                      <span className="text-[10px] text-brand-400 font-bold">Copied!</span>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-dark-900/50 border border-dark-800 rounded-lg text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                  {aboutText}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default LinkedIn;
