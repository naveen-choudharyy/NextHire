import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../context/AuthContext';
import { Mail, Phone, Globe, Briefcase, Award, GraduationCap, Code } from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PortfolioView = () => {
  const { slug } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublicPortfolio();
  }, [slug]);

  const fetchPublicPortfolio = async () => {
    try {
      const response = await fetch(`${API_BASE}/resume/public/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-white p-4 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-white">Portfolio Not Found</h1>
        <p className="text-gray-400 max-w-md">This portfolio profile does not exist or has been set to private by the owner.</p>
        <Link to="/" className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-lg">
          Create Your Portfolio
        </Link>
      </div>
    );
  }

  const { personal = {}, education = [], experience = [], projects = [], skills = [], certifications = [] } = resumeData.content;

  return (
    <div className="bg-dark-950 text-gray-200 min-h-screen font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Portfolio Header/Hero */}
      <header className="relative overflow-hidden bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 border-b border-dark-900 py-24 px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Glow ball */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 bg-brand-500/10 rounded-full blur-3xl" />
        
        <h1 className="text-5xl font-black text-white sm:text-6xl tracking-tight relative z-10">
          {personal.fullName || 'Professional Profile'}
        </h1>
        
        {personal.summary && (
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed relative z-10">
            {personal.summary}
          </p>
        )}

        {/* Contact Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-gray-400 relative z-10">
          {personal.email && (
            <span className="flex items-center space-x-1 bg-dark-900 border border-dark-850 px-3 py-1.5 rounded-full">
              <Mail className="h-3.5 w-3.5 text-brand-500" />
              <span>{personal.email}</span>
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center space-x-1 bg-dark-900 border border-dark-850 px-3 py-1.5 rounded-full">
              <Phone className="h-3.5 w-3.5 text-brand-500" />
              <span>{personal.phone}</span>
            </span>
          )}
          {personal.location && (
            <span className="flex items-center space-x-1 bg-dark-900 border border-dark-850 px-3 py-1.5 rounded-full">
              <span>📍 {personal.location}</span>
            </span>
          )}
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-4 pt-2 relative z-10">
          {personal.github && (
            <a
              href={`https://github.com/${personal.github.replace(/https?:\/\/(www\.)?github\.com\//, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-white transition border border-dark-800"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {personal.linkedin && (
            <a
              href={`https://linkedin.com/in/${personal.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-white transition border border-dark-800"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
        </div>

      </header>

      {/* Main Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Skills Toolkit */}
        {skills.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Code className="h-5 w-5 text-brand-500" />
              <span>Skills Toolkit</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-dark-900 border border-dark-850 text-gray-300 text-xs px-3.5 py-1.5 rounded-lg font-semibold hover:border-brand-500/40 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Featured Projects */}
        {projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Code className="h-5 w-5 text-brand-500" />
              <span>Featured Work</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div key={idx} className="bg-dark-900/50 border border-dark-850 p-6 rounded-xl hover:border-brand-500/20 transition-all duration-300 group">
                  <h3 className="font-extrabold text-white text-lg group-hover:text-brand-400 transition-colors">
                    {proj.name}
                  </h3>
                  {proj.tech && (
                    <span className="inline-block mt-1 text-[10px] bg-brand-500/10 text-brand-450 border border-brand-500/20 rounded-full px-2 py-0.5 font-semibold font-mono">
                      {proj.tech}
                    </span>
                  )}
                  <p className="text-gray-400 text-xs mt-4 leading-relaxed">{proj.description}</p>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-brand-500 hover:text-brand-450 font-bold mt-4"
                    >
                      <span>View Live Code</span>
                      <span>→</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-brand-500" />
              <span>Professional Experience</span>
            </h2>
            <div className="space-y-6 border-l border-dark-800 ml-3 pl-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative space-y-2">
                  {/* Timeline dot */}
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-dark-950" />
                  
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <h3 className="font-bold text-white text-sm">{exp.role}</h3>
                    <span className="text-xs text-gray-500 font-mono">{exp.startYear} – {exp.endYear || 'Present'}</span>
                  </div>
                  
                  <div className="text-xs text-brand-400 font-semibold">{exp.company} {exp.location && `| ${exp.location}`}</div>
                  <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line text-justify">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-dark-900">
          
          {education.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-brand-500" />
                <span>Education Background</span>
              </h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-bold text-white text-sm">{edu.school}</h4>
                    <div className="text-xs text-gray-400">{edu.degree} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{edu.startYear} – {edu.endYear}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Award className="h-5 w-5 text-brand-500" />
                <span>Licenses & Certifications</span>
              </h2>
              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="leading-tight">
                    <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                    <div className="text-xs text-gray-400">{cert.issuer}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{cert.year}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

      </main>

      {/* Footer / Call to action */}
      <footer className="border-t border-dark-900 bg-dark-950 py-12 text-center text-xs text-gray-600">
        <p>© 2026 {personal.fullName}. Hosted via NextHire Resume Platform.</p>
        <Link to="/" className="inline-block mt-3 text-brand-500 hover:text-brand-450 hover:underline">
          Create Your Own Digital Portfolio Portfolio →
        </Link>
      </footer>

    </div>
  );
};

export default PortfolioView;
