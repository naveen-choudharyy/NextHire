import React from 'react';

const SoftwareDeveloper = ({ content }) => {
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

  const sectionOrder = content.sectionOrder || ['education', 'experience', 'projects', 'skills', 'certifications', 'achievements'];

  const renderSection = (secName) => {
    switch (secName) {
      case 'skills':
        return skills.length > 0 && (
          <div className="mb-5" key="skills">
            <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Technical Toolkit</h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-800 text-[12px] px-2.5 py-0.5 rounded border border-slate-200 font-semibold font-mono">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      case 'projects':
        return projects.length > 0 && (
          <div className="mb-5" key="projects">
            <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Featured Projects</h2>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 text-[16px]">
                      {proj.name} 
                      {proj.tech && <span className="font-mono font-medium text-[13.5px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.2 ml-2">{proj.tech}</span>}
                    </h4>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12.5px] text-slate-500 hover:text-slate-800 hover:underline font-semibold"
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
        );
      case 'experience':
        return experience.length > 0 && (
          <div className="mb-5" key="experience">
            <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Work & Internships</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-[16px]">{exp.role}</h4>
                      <div className="text-[13.5px] text-indigo-600 font-bold">{exp.company} {exp.location && `(${exp.location})`}</div>
                    </div>
                    <span className="text-[13.5px] text-slate-500 font-mono">{exp.startYear} – {exp.endYear || 'Present'}</span>
                  </div>
                  <p className="text-justify leading-relaxed text-slate-600 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        const sColleges = education.filter(edu => !edu.type || edu.type === 'college');
        const sSchools = education.filter(edu => edu.type === 'school');
        const sOthers = education.filter(edu => edu.type === 'other');

        const renderEduGroupSD = (items) => {
          return items.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <div className="font-bold text-slate-900">{edu.school}</div>
                <div className="text-slate-600">{edu.degree} {edu.gpa && `— GPA/CGPA: ${edu.gpa}`}</div>
              </div>
              <div className="text-right text-[13.5px] text-slate-500 font-mono">
                {edu.startYear} – {edu.endYear}
                {edu.location && <div className="text-[11.5px] italic font-sans text-slate-400">{edu.location}</div>}
              </div>
            </div>
          ));
        };

        return education.length > 0 && (
          <div className="mb-5" key="education">
            <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Education</h2>
            
            <div className="space-y-4 pt-1">
              {sColleges.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">College / University</div>
                  <div className="space-y-3">{renderEduGroupSD(sColleges)}</div>
                </div>
              )}
              
              {sSchools.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Schooling</div>
                  <div className="space-y-3">{renderEduGroupSD(sSchools)}</div>
                </div>
              )}

              {sOthers.length > 0 && (
                <div className="space-y-2">
                  {sOthers.map((edu, oIdx) => {
                    const groupLabel = edu.customType ? edu.customType.toUpperCase() : 'OTHER';
                    return (
                      <div key={oIdx} className="space-y-2">
                        <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{groupLabel}</div>
                        <div className="space-y-3">{renderEduGroupSD([edu])}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case 'certifications':
        return certifications.length > 0 && (
          <div className="mb-5" key="certifications">
            <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Credentials</h2>
            <ul className="space-y-1.5 text-slate-600">
              {certifications.map((cert, idx) => (
                <li key={idx} className="text-[12.5px] leading-tight">
                  <strong>{cert.name}</strong> <span className="text-slate-450">•</span> {cert.issuer} ({cert.year})
                </li>
              ))}
            </ul>
          </div>
        );
      case 'achievements':
        return achievements.length > 0 && (
          <div className="mb-5" key="achievements">
            <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Key Awards</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              {achievements.map((ach, idx) => (
                <li key={idx} className="text-[12.5px] leading-relaxed text-justify">{ach}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-slate-800 p-8 font-sans leading-relaxed max-w-[800px] w-[800px] mx-auto text-[13.5px] shadow-sm select-text border-t-8 border-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 mb-5 gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">{personal.fullName || 'YOUR NAME'}</h1>
          <div className="text-[13.5px] text-slate-500 font-bold tracking-widest uppercase mt-1">Full Stack Developer</div>
        </div>
        <div className="flex flex-col text-left md:text-right text-[12.5px] text-slate-600 gap-0.5 leading-tight">
          {personal.email && <span>📧 {personal.email}</span>}
          {personal.phone && <span>📞 {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.website && <span>🌐 {personal.website}</span>}
          <div className="flex gap-2 mt-1 justify-start md:justify-end font-semibold text-slate-800">
            {personal.github && <span>github.com/{personal.github.replace(/https?:\/\/(www\.)?github\.com\//, '')}</span>}
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-5">
          <h2 className="text-[13.5px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Profile</h2>
          <p className="text-justify leading-relaxed text-slate-700">{personal.summary}</p>
        </div>
      )}

      {/* Dynamic Section Ordering */}
      {sectionOrder.map(sec => renderSection(sec))}

    </div>
  );
};

export default SoftwareDeveloper;
