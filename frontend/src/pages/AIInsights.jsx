import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { BrainCircuit, BookOpen, AlertCircle, Sparkles, HelpCircle, Briefcase, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';

// Hardcoded jobs matching the backend listings
const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'React Front-End Developer',
    company: 'TechCorp Systems',
    keywords: ['react', 'javascript', 'tailwind', 'typescript', 'redux', 'html', 'css'],
    description: 'Responsible for developing highly responsive web interfaces using React.js and modern CSS frameworks.'
  },
  {
    id: 'job-2',
    title: 'Flask / Python Backend Developer',
    company: 'DevScale Solutions',
    keywords: ['python', 'flask', 'sql', 'postgresql', 'apis', 'jwt', 'docker', 'rest'],
    description: 'Build high performance REST APIs and manage relational database schemas using SQLAlchemy.'
  },
  {
    id: 'job-3',
    title: 'Data Analyst',
    company: 'FinanceFlow Analytics',
    keywords: ['sql', 'python', 'pandas', 'tableau', 'excel', 'powerbi', 'statistics'],
    description: 'Translate raw operational financial data into actionable visual insights and business intelligence.'
  },
  {
    id: 'job-4',
    title: 'Machine Learning Intern',
    company: 'DeepAI Lab',
    keywords: ['python', 'pytorch', 'tensorflow', 'machine learning', 'numpy', 'scikit-learn'],
    description: 'Train, validate and deploy neural networks and custom models for image classification and NLP.'
  },
  {
    id: 'job-5',
    title: 'UI/UX Product Designer',
    company: 'CreativeHub Agency',
    keywords: ['figma', 'design', 'wireframe', 'prototype', 'adobe', 'ux', 'ui'],
    description: 'Design user-centric interfaces and map complex user journeys for Web/Mobile products.'
  },
  {
    id: 'job-6',
    title: 'Business Analyst (MBA Fresher)',
    company: 'MarketGrow Consultancy',
    keywords: ['management', 'strategy', 'analysis', 'communication', 'agile', 'scrum', 'sql'],
    description: 'Coordinate requirements between product stakeholders and technical engineering leads.'
  }
];

const AIInsights = () => {
  const { token, getAuthHeaders } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  
  // Insights State
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  // Skill Gap State
  const [selectedJobId, setSelectedJobId] = useState(MOCK_JOBS[0].id);
  const [skillGap, setSkillGap] = useState(null);
  const [loadingSkillGap, setLoadingSkillGap] = useState(false);

  useEffect(() => {
    if (token) {
      fetchResumes();
    }
  }, [token]);

  useEffect(() => {
    if (selectedResumeId) {
      fetchInsights(selectedResumeId);
    } else {
      setInsights(null);
    }
  }, [selectedResumeId]);

  useEffect(() => {
    if (selectedResumeId && selectedJobId) {
      fetchSkillGap();
    } else {
      setSkillGap(null);
    }
  }, [selectedResumeId, selectedJobId]);

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
          setSelectedResumeId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load resumes:', e);
    } finally {
      setLoadingResumes(false);
    }
  };

  const fetchInsights = async (resumeId) => {
    setLoadingInsights(true);
    setInsightsError('');
    try {
      const response = await fetch(`${API_BASE}/ml/insights/${resumeId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        const errData = await response.json();
        setInsightsError(errData.error || 'Failed to fetch AI insights.');
      }
    } catch (e) {
      setInsightsError('Could not connect to the analysis service.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchSkillGap = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    setLoadingSkillGap(true);
    const job = MOCK_JOBS.find(j => j.id === selectedJobId);
    try {
      const response = await fetch(`${API_BASE}/ml/skill-gap/${selectedResumeId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ job_description: `${job.title} ${job.description}` })
      });
      if (response.ok) {
        const data = await response.json();
        setSkillGap(data.missing_skills || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSkillGap(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
            <BrainCircuit className="h-8 w-8 text-brand-400" />
            <span>AI Career Insights & Analytics</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Machine Learning resume classification, text readability indexing, and semantic skill-gap analysis.
          </p>
        </div>

        {/* Resume Selector */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="flex items-center space-x-2 bg-dark-950/40 border border-dark-800 rounded-xl p-2">
            <span className="text-xs text-gray-400 font-medium px-2">Analyze:</span>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="bg-dark-900 border border-dark-700 rounded-lg text-xs font-semibold py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingResumes ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/5 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-dark-950 border border-dark-800 text-gray-500 mb-2">
            <BrainCircuit className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white">No Resumes Found</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            You need to create at least one resume to unlock AI Career Insights. Head back to your dashboard to build a profile.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-brand-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-brand-600 transition"
          >
            Go to Dashboard
          </a>
        </div>
      ) : loadingInsights ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : insightsError ? (
        <div className="glass p-6 rounded-2xl border border-rose-500/20 text-center space-y-2 text-rose-400">
          <AlertCircle className="h-8 w-8 mx-auto" />
          <p className="font-bold text-sm">Analysis Unavailable</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">{insightsError}</p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Classification Model Output */}
          <div className="lg:col-span-2 space-y-8 animate-fadeIn">
            
            {/* Classification Card */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                  <BarChart3 className="h-4.5 w-4.5 text-brand-400" />
                  <span>Resume Classification (Multinomial Naive Bayes)</span>
                </h3>
                {insights.prediction.is_fallback && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                    Fallback Rule
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-400 font-medium">Primary Predicted Profile</span>
                  <div className="text-2xl font-extrabold text-white mt-1 flex items-center space-x-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    <Sparkles className="h-6 w-6 text-brand-400 flex-shrink-0" />
                    <span>{insights.prediction.predicted_category}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs text-gray-400 font-semibold">Classification Vector Probabilities:</span>
                  {Object.entries(insights.prediction.probabilities)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, prob]) => {
                      const percentage = Math.round(prob * 100);
                      const isMain = category === insights.prediction.predicted_category;
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={isMain ? 'text-brand-400 font-bold' : 'text-gray-400'}>{category}</span>
                            <span className="text-gray-200">{percentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-dark-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMain ? 'bg-gradient-to-r from-brand-500 to-accent-500' : 'bg-dark-700'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Readability & Text metrics */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-bold text-white flex items-center space-x-2 text-sm border-b border-white/5 pb-4">
                <BookOpen className="h-4.5 w-4.5 text-brand-400" />
                <span>Text Metrics & Readability Index</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-dark-950/40 border border-dark-800 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Words</span>
                  <p className="text-lg font-extrabold text-white">{insights.analytics.word_count}</p>
                </div>
                <div className="p-4 bg-dark-950/40 border border-dark-800 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sentences</span>
                  <p className="text-lg font-extrabold text-white">{insights.analytics.sentence_count}</p>
                </div>
                <div className="p-4 bg-dark-950/40 border border-dark-800 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Avg Sentence Length</span>
                  <p className="text-lg font-extrabold text-white">{insights.analytics.avg_sentence_len} words</p>
                </div>
                <div className="p-4 bg-dark-950/40 border border-dark-800 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Readability Score</span>
                  <p className="text-lg font-extrabold text-brand-400">{insights.analytics.readability_score}/100</p>
                </div>
              </div>

              {/* Readability Gauge Details */}
              <div className="p-4 bg-dark-950/40 border border-dark-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Flesch Reading Ease Grade:</span>
                  <span className="font-extrabold text-white">{insights.analytics.readability_label}</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Flesch Reading Ease indexes readability. Higher scores (60-70+) indicate the resume is clear, punchy, and highly parsed by automated scanners. Scores below 40 are complex and may result in ATS parsing anomalies.
                </p>
              </div>
            </div>

            {/* Keyword Frequency Cloud */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
                <span>Primary Keyword Densities</span>
              </h3>
              <p className="text-xs text-gray-400">
                Most frequent keywords extracted by NLP parser (excluding standard English stopwords). Ensure your core technologies have the highest weight.
              </p>
              
              <div className="flex flex-wrap gap-2.5 pt-2">
                {insights.analytics.top_keywords.map((kw, i) => {
                  const size = kw.value > 4 ? 'text-sm px-3.5 py-1.5 font-extrabold bg-brand-500/10 border-brand-500/20 text-brand-400' :
                               kw.value > 2 ? 'text-xs px-2.5 py-1.5 font-bold bg-white/5 border-white/5 text-gray-200' :
                               'text-[11px] px-2 py-1 bg-dark-950/60 border-dark-800/40 text-gray-400';
                  return (
                    <span 
                      key={kw.text} 
                      className={`rounded-lg border transition duration-200 hover:scale-105 hover:border-brand-500/40 flex items-center space-x-1.5 cursor-default ${size}`}
                    >
                      <span>{kw.text}</span>
                      <span className="opacity-50 text-[10px]">({kw.value})</span>
                    </span>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Skill Gap Analyst */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 sticky top-24">
              <div className="space-y-1">
                <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                  <Briefcase className="h-4.5 w-4.5 text-brand-400" />
                  <span>Semantic Skill Gap Analyst</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Select a target job below to run semantic comparison models.
                </p>
              </div>

              {/* Job List Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Select Target Job:</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-lg text-xs font-semibold py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                >
                  {MOCK_JOBS.map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
                  ))}
                </select>
              </div>

              {/* Job Details Card */}
              {(() => {
                const job = MOCK_JOBS.find(j => j.id === selectedJobId);
                return (
                  <div className="p-3.5 bg-dark-950/40 border border-dark-800 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-white">{job.title}</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{job.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.keywords.map(kw => (
                        <span key={kw} className="text-[9px] bg-dark-900 border border-dark-800 text-gray-400 px-1.5 py-0.5 rounded font-mono uppercase">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Skill Gap Results */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex justify-between">
                  <span>ML Gap Suggestions:</span>
                  {loadingSkillGap && <span className="animate-pulse text-brand-400">Analyzing...</span>}
                </h4>

                {loadingSkillGap ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-dark-950 rounded animate-pulse" />
                    <div className="h-6 bg-dark-950 rounded animate-pulse" />
                  </div>
                ) : skillGap && skillGap.length === 0 ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center space-y-1">
                    <CheckCircle className="h-5 w-5 mx-auto" />
                    <p className="text-xs font-bold">100% Keywords Matched!</p>
                    <p className="text-[10px] text-gray-400">Excellent! Your resume contains all prominent keywords for this job.</p>
                  </div>
                ) : skillGap ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-400">
                      Add the following terms or skills to your resume content to improve your semantic matching score:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {skillGap.map(skill => (
                        <div key={skill} className="flex items-center space-x-1.5 p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs font-medium text-rose-300">
                          <span className="text-rose-400 font-extrabold text-[14px] leading-none">•</span>
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 italic">Select a job above to compile data.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">Please select a resume to start analysis.</div>
      )}
      
    </div>
  );
};

export default AIInsights;
