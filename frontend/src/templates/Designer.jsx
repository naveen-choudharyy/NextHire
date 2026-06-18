import React from 'react';

const Designer = ({ content }) => {
  const {
    personal = {},
    education = [],
    experience = [],
    projects = [],
    skills = [],
    certifications = [],
    achievements = [],
    languages = [],
    extracurriculars = []
  } = content;

  return (
    <div className="bg-stone-50 text-stone-800 p-10 font-sans leading-relaxed max-w-[800px] w-[800px] mx-auto text-[12px] shadow-sm select-text border-l-[10px] border-rose-500">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-wide uppercase">{personal.fullName || 'YOUR NAME'}</h1>
        <div className="text-sm font-medium text-rose-500 uppercase tracking-widest mt-1">Creative Product Designer</div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-500 text-[11px] mt-4 border-y border-stone-200 py-2">
          {personal.email && <span>Email: {personal.email}</span>}
          {personal.phone && <span>Phone: {personal.phone}</span>}
          {personal.location && <span>Location: {personal.location}</span>}
          {personal.website && <span>Portfolio: {personal.website}</span>}
          {personal.linkedin && <span>LinkedIn: {personal.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">My Story</h2>
          <p className="text-justify text-stone-600 leading-relaxed text-[12.5px]">{personal.summary}</p>
        </div>
      )}

      {/* Grid of Work & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Column (Experience & Projects - 2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Experience */}
          {experience.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest border-b border-stone-200 pb-1">Professional Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline font-semibold text-stone-900">
                      <span className="text-xs font-bold">{exp.role}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{exp.startYear} – {exp.endYear || 'Present'}</span>
                    </div>
                    <div className="text-[11px] text-rose-500/80 font-bold">{exp.company} {exp.location && `| ${exp.location}`}</div>
                    <p className="text-justify text-stone-600 text-[11.5px] leading-relaxed whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest border-b border-stone-200 pb-1">Featured Work</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-extrabold text-stone-900">{proj.name}</span>
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-rose-500 hover:underline font-semibold"
                        >
                          Project Link
                        </a>
                      )}
                    </div>
                    {proj.tech && <div className="text-[10px] text-stone-400 font-medium">Stack: {proj.tech}</div>}
                    <p className="text-justify text-stone-600 text-[11.5px]">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column (Skills, Education, Certifications - 1/3 width) */}
        <div className="space-y-6">
          
          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest border-b border-stone-200 pb-1">Creative Skills</h2>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-rose-500/10 text-rose-600 text-[10.5px] px-2 py-0.5 rounded font-medium border border-rose-500/10">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest border-b border-stone-200 pb-1">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-stone-900 leading-tight">{edu.school}</div>
                    <div className="text-[11px] text-stone-600">{edu.degree}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{edu.startYear} – {edu.endYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest border-b border-stone-200 pb-1">Credentials</h2>
              <div className="space-y-2 text-[11px] text-stone-600">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="leading-tight">
                    <strong>{cert.name}</strong>
                    <div className="text-stone-400 text-[9.5px]">{cert.issuer} ({cert.year})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest border-b border-stone-200 pb-1">Achievements</h2>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-600">
                {achievements.map((ach, idx) => (
                  <li key={idx} className="leading-tight">{ach}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Designer;
