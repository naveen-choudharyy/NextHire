import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import { FileText, Sparkles, AlertTriangle, ArrowLeft, Download, RefreshCw } from 'lucide-react';

const CoverLetter = () => {
  const { token, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (token) {
      checkAccessAndFetchResumes();
    }
  }, [token]);

  const checkAccessAndFetchResumes = async () => {
    try {
      // 1. Check payment plans
      const statusRes = await fetch(`${API_BASE}/payment/status`, {
        headers: getAuthHeaders()
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setHasAccess(statusData.has_cover_letter);
      }

      // 2. Fetch resumes for dropdown
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !jobDescription) return;

    setLoading(true);
    try {
      // Get resume content first
      const resumeRes = await fetch(`${API_BASE}/resume/${selectedResumeId}`, {
        headers: getAuthHeaders()
      });
      const resumeData = await resumeRes.json();

      // Trigger AI generation
      const response = await fetch(`${API_BASE}/ai/cover-letter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content: resumeData.content,
          job_description: jobDescription
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCoverLetter(data.cover_letter);
      } else {
        alert(data.error || 'Failed to generate cover letter');
      }
    } catch (e) {
      console.error(e);
      alert('Network error generating cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            p { margin-bottom: 20px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div>${coverLetter.replace(/\n/g, '<br/>')}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          The AI Cover Letter tool requires an active resume pass. Unlock it instantly with our <strong>Resume Builder Pass</strong> to generate unlimited personalized letters.
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
            Purchase Pass
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link to="/dashboard" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 mb-2 transition">
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white">AI Cover Letter Generator</h1>
        <p className="text-xs text-gray-400 mt-1">
          Draft tailored, job-specific cover letters that capture a recruiter’s interest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column (Inputs) */}
        <form onSubmit={handleGenerate} className="glass p-6 rounded-2xl border border-white/5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Select Profile Source</label>
            {resumes.length === 0 ? (
              <p className="text-xs text-red-400 italic">No resumes found. Create one on the dashboard first.</p>
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

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Paste Job Description</label>
            <textarea
              rows="8"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description or requirements here..."
              required
              className="w-full text-xs p-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-white placeholder-gray-600 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading || resumes.length === 0}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-lg transition shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Crafting Cover Letter...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Cover Letter</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column (Output) */}
        <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-dark-800 pb-3">
            <h3 className="font-bold text-white">Cover Letter Preview</h3>
            {coverLetter && (
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 font-semibold transition"
              >
                <Download className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[300px]">
            {coverLetter ? (
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full h-full min-h-[300px] text-xs p-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-300 leading-relaxed font-mono select-text"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-600">
                <FileText className="h-12 w-12 text-dark-700 mb-2" />
                <p className="text-xs">Your generated cover letter will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoverLetter;
