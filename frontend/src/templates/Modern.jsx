import React from 'react';

const Modern = ({ content }) => {
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
    <div className="bg-white text-gray-800 max-w-[800px] w-[800px] mx-auto min-h-[1000px] shadow-sm select-text flex flex-row text-[13.5px]">
      
      {/* Left Sidebar (Dark background) */}
      <div className="w-[260px] bg-slate-900 text-slate-100 p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          
          {/* Avatar Area */}
          <div className="border-b border-slate-700 pb-5">
            <h2 className="text-[22px] font-bold uppercase tracking-wide text-white">{personal.fullName || 'YOUR NAME'}</h2>
            <div className="text-[13.5px] text-indigo-400 font-semibold mt-1">Professional Profile</div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h3 className="text-[13.5px] font-bold uppercase text-indigo-400 tracking-wider">Contact</h3>
            <div className="space-y-1 text-slate-300 text-[12.5px] leading-relaxed">
              {personal.email && <div className="truncate">📧 {personal.email}</div>}
              {personal.phone && <div>📞 {personal.phone}</div>}
              {personal.location && <div>📍 {personal.location}</div>}
              {personal.website && <div className="truncate">🌐 {personal.website}</div>}
              {personal.linkedin && <div className="truncate">🔗 {personal.linkedin}</div>}
              {personal.github && <div className="truncate">🐙 {personal.github}</div>}
            </div>
          </div>

          {/* Technical Skills */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[13.5px] font-bold uppercase text-indigo-400 tracking-wider">Core Skills</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-[11.5px] px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[13.5px] font-bold uppercase text-indigo-400 tracking-wider">Certifications</h3>
              <div className="space-y-2 text-[12.5px]">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="border-l-2 border-slate-700 pl-2" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="font-bold text-white leading-tight">{cert.name}</div>
                    <div className="text-slate-400 text-[11.5px]">{cert.issuer} ({cert.year})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Languages & Extra */}
        <div className="space-y-4 pt-4 border-t border-slate-800 text-[12.5px]">
          {languages.length > 0 && (
            <div>
              <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">Languages</span>
              <span className="text-slate-300">{languages.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Content Section (Light background) */}
      <div className="flex-1 p-8 space-y-6 bg-slate-50">
        
        {/* Profile Summary */}
        {personal.summary && (
          <div className="space-y-2">
            <h2 className="text-[16px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-500 pb-1.5" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>Profile</h2>
            <p className="text-justify leading-relaxed text-slate-700">{personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-500 pb-1.5" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-1" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{exp.role}</h4>
                      <div className="text-[13.5px] text-indigo-600 font-semibold">{exp.company}</div>
                    </div>
                    <span className="text-[13.5px] text-slate-500 font-medium">{exp.startYear} – {exp.endYear || 'Present'}</span>
                  </div>
                  {exp.location && <div className="text-[11.5px] text-slate-400 italic">{exp.location}</div>}
                  <p className="text-justify leading-relaxed text-slate-600 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-500 pb-1.5" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>Projects</h2>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900">
                      {proj.name} {proj.tech && <span className="font-normal text-slate-500">({proj.tech})</span>}
                    </h4>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] text-indigo-650 hover:underline font-semibold"
                      >
                        Project Link
                      </a>
                    )}
                  </div>
                  <p className="text-justify leading-relaxed text-slate-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-500 pb-1.5" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>Education</h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div>
                    <h4 className="font-bold text-slate-900">{edu.school}</h4>
                    <div className="text-slate-600">{edu.degree} {edu.gpa && `— GPA: ${edu.gpa}`}</div>
                  </div>
                  <div className="text-right text-[13.5px] text-slate-500">
                    <div>{edu.startYear} – {edu.endYear}</div>
                    {edu.location && <div className="text-[11.5px] italic text-slate-400">{edu.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-500 pb-1.5" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>Achievements</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              {achievements.map((ach, idx) => (
                <li key={idx} className="text-justify leading-relaxed" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>{ach}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
};

export default Modern;
