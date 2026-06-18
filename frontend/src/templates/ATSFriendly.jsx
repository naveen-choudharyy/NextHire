import React from 'react';

const ATSFriendly = ({ content }) => {
  const {
    personal = {},
    education = [],
    experience = [],
    projects = [],
    skills = {},
    certifications = [],
    achievements = [],
    languages = [],
    extracurriculars = []
  } = content;

  // Helper to render bullet lists from multiline descriptions
  const renderBulletPoints = (text) => {
    if (!text) return null;
    const lines = text
      .split('\n')
      .map(line => line.trim().replace(/^[-*•·]\s*/, ''))
      .filter(line => line.length > 0);

    return (
      <div className="mt-1 space-y-1 text-black text-[12.5px] leading-relaxed" style={{ paddingLeft: '15px' }}>
        {lines.map((line, i) => (
          <div key={i} className="flex items-start text-justify">
            <span className="mr-2 select-none text-[12.5px]">•</span>
            <span className="flex-1">{line}</span>
          </div>
        ))}
      </div>
    );
  };

  // Build inline contact details row as active hyperlinks
  const contactItems = [];
  
  if (personal.email) {
    contactItems.push(
      <a href={`mailto:${personal.email}`} className="hover:underline text-black" key="email">
        {personal.email}
      </a>
    );
  }
  
  if (personal.phone) {
    contactItems.push(
      <a href={`tel:${personal.phone}`} className="hover:underline text-black" key="phone">
        {personal.phone}
      </a>
    );
  }
  
  if (personal.location) {
    contactItems.push(
      <span className="text-black" key="location">
        {personal.location}
      </span>
    );
  }
  
  if (personal.website) {
    const displayWeb = personal.website.replace(/https?:\/\/(www\.)?/, '');
    const absUrl = personal.website.startsWith('http') ? personal.website : `https://${personal.website}`;
    contactItems.push(
      <a href={absUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-black" key="website">
        {displayWeb}
      </a>
    );
  }
  
  if (personal.linkedin) {
    const displayLinkedin = personal.linkedin.replace(/https?:\/\/(www\.)?/, '');
    const absUrl = personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`;
    contactItems.push(
      <a href={absUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-black" key="linkedin">
        {displayLinkedin}
      </a>
    );
  }
  
  if (personal.github) {
    const displayGithub = personal.github.replace(/https?:\/\/(www\.)?/, '');
    const absUrl = personal.github.startsWith('http') ? personal.github : `https://${personal.github}`;
    contactItems.push(
      <a href={absUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-black" key="github">
        {displayGithub}
      </a>
    );
  }

  const sectionOrder = content.sectionOrder || ['education', 'experience', 'projects', 'skills', 'certifications', 'achievements'];

  const renderSection = (secName) => {
    switch (secName) {
      case 'education':
        const colleges = education.filter(edu => !edu.type || edu.type === 'college');
        const schools = education.filter(edu => edu.type === 'school');
        const others = education.filter(edu => edu.type === 'other');

        const renderEduGroup = (items, isSchoolGroup) => {
          return items.map((edu, idx) => {
            const lowerDegree = (edu.degree || '').toLowerCase();
            const resolvedIsSchool = edu.type ? edu.type === 'school' : (lowerDegree.includes('class') || lowerDegree.includes('10th') || lowerDegree.includes('12th') || lowerDegree.includes('school') || lowerDegree.includes('secondary') || lowerDegree.includes('matric') || lowerDegree.includes('ssc') || lowerDegree.includes('hsc'));
            const schoolDetails = (edu.school || '') + (edu.school && edu.location ? `, ${edu.location}` : (edu.location || ''));
            const displayGpa = edu.gpa ? (edu.gpa.toLowerCase().includes('cgpa') || edu.gpa.includes('%') ? edu.gpa : (resolvedIsSchool ? `${edu.gpa}%` : `CGPA: ${edu.gpa}`)) : '';

            if (resolvedIsSchool) {
              return (
                <div key={idx} className="space-y-0.5 text-[12.5px] text-black">
                  <div className="flex justify-between">
                    <span className="font-bold">{edu.degree || ''}</span>
                    <span className="font-normal">{displayGpa}</span>
                  </div>
                  <div className="flex justify-between mt-0.5 text-black">
                    <span className="font-normal">{schoolDetails}</span>
                    <span className="font-normal">{edu.startYear && edu.endYear ? `${edu.startYear} – ${edu.endYear}` : (edu.endYear || '')}</span>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={idx} className="space-y-0.5 text-[12.5px] text-black">
                  <div className="flex justify-between">
                    <span className="font-bold">{edu.degree || ''}</span>
                    <span className="font-normal">{schoolDetails}</span>
                  </div>
                  <div className="flex justify-between mt-0.5 text-black">
                    <span className="font-normal">{displayGpa}</span>
                    <span className="font-normal">{edu.startYear && edu.endYear ? `${edu.startYear} – ${edu.endYear}` : (edu.endYear || '')}</span>
                  </div>
                </div>
              );
            }
          });
        };

        return education.length > 0 && (
          <div className="mt-4 mb-2.5" key="education">
            <h2 className="text-[14px] font-bold tracking-wider text-black">Education</h2>
            <div className="border-b border-black mt-1 mb-2"></div>
            
            <div className="space-y-4">
              {colleges.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">College / University</div>
                  <div className="space-y-3">{renderEduGroup(colleges, false)}</div>
                </div>
              )}
              
              {schools.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Schooling</div>
                  <div className="space-y-3">{renderEduGroup(schools, true)}</div>
                </div>
              )}

              {others.length > 0 && (
                <div className="space-y-2">
                  {others.map((edu, oIdx) => {
                    const groupLabel = edu.customType ? edu.customType.toUpperCase() : 'OTHER';
                    return (
                      <div key={oIdx} className="space-y-2">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{groupLabel}</div>
                        <div className="space-y-3">{renderEduGroup([edu], false)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case 'experience':
        return experience.length > 0 && (
          <div className="mt-4 mb-2.5" key="experience">
            <h2 className="text-[14px] font-bold tracking-wider text-black">Experience</h2>
            <div className="border-b border-black mt-1 mb-2"></div>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-0.5 text-[12.5px]">
                  <div className="flex justify-between text-black">
                    <span className="font-bold">{exp.role || ''}</span>
                    <span className="font-normal">{exp.startYear && exp.endYear ? `${exp.startYear} – ${exp.endYear}` : (exp.startYear || exp.endYear || '')}</span>
                  </div>
                  <div className="flex justify-between text-black mt-0.5">
                    <span className="italic">{exp.company || ''}</span>
                    <span className="font-normal">{exp.location || ''}</span>
                  </div>
                  {renderBulletPoints(exp.description)}
                </div>
              ))}
            </div>
          </div>
        );
      case 'projects':
        return projects.length > 0 && (
          <div className="mt-4 mb-2.5" key="projects">
            <h2 className="text-[14px] font-bold tracking-wider text-black">Projects</h2>
            <div className="border-b border-black mt-1 mb-2"></div>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5 text-[12.5px]">
                  <div className="flex justify-between items-baseline text-black">
                    <span className="font-bold">
                      {proj.name || ''}
                      {proj.name && proj.tech && <span className="font-normal italic"> | {proj.tech}</span>}
                      {!proj.name && proj.tech && <span className="font-normal italic">{proj.tech}</span>}
                    </span>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] underline text-black font-normal"
                      >
                        Project Link
                      </a>
                    )}
                  </div>
                  {renderBulletPoints(proj.description)}
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return ((skills.languages) || (skills.frameworks) || (skills.databases) || (skills.tools) || (skills.soft) || (skills.other)) && (
          <div className="mt-4 mb-2.5" key="skills">
            <h2 className="text-[14px] font-bold tracking-wider text-black">Technical Skills</h2>
            <div className="border-b border-black mt-1 mb-2"></div>
            <div className="space-y-1 text-black leading-relaxed text-[12.5px]">
              {skills.languages && (
                <div>
                  <strong>Languages:</strong> {skills.languages}
                </div>
              )}
              {skills.frameworks && (
                <div>
                  <strong>Frameworks & Libraries:</strong> {skills.frameworks}
                </div>
              )}
              {skills.databases && (
                <div>
                  <strong>Databases:</strong> {skills.databases}
                </div>
              )}
              {skills.tools && (
                <div>
                  <strong>Tools & Technologies:</strong> {skills.tools}
                </div>
              )}
              {skills.soft && (
                <div>
                  <strong>Soft Skills:</strong> {skills.soft}
                </div>
              )}
              {skills.other && (
                <div>
                  <strong>Methodologies & Practices:</strong> {skills.other}
                </div>
              )}
            </div>
          </div>
        );
      case 'certifications':
        return certifications.length > 0 && (
          <div className="mt-4 mb-2.5" key="certifications">
            <h2 className="text-[14px] font-bold tracking-wider text-black">Certifications</h2>
            <div className="border-b border-black mt-1 mb-2"></div>
            <div className="space-y-1 text-black text-[12.5px]" style={{ paddingLeft: '15px' }}>
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start text-justify leading-relaxed">
                  <span className="mr-2 select-none text-[12.5px]">•</span>
                  <span className="flex-1">
                    <strong>{cert.name}</strong> — {cert.issuer} ({cert.year})
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'achievements':
        return achievements.length > 0 && (
          <div className="mt-4 mb-2.5" key="achievements">
            <h2 className="text-[14px] font-bold tracking-wider text-black">Achievements</h2>
            <div className="border-b border-black mt-1 mb-2"></div>
            <div className="space-y-1 text-black text-[12.5px]" style={{ paddingLeft: '15px' }}>
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start text-justify leading-relaxed">
                  <span className="mr-2 select-none text-[12.5px]">•</span>
                  <span className="flex-1">{ach}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-black px-16 py-9 leading-relaxed max-w-[800px] w-[800px] min-h-[1030px] mx-auto text-[12.5px] select-text shadow-sm" style={{ fontFamily: "'Times New Roman', Times, Baskerville, Georgia, serif" }}>
      
      {/* Header (Centered) */}
      <div className="text-center mb-5 space-y-1">
        <h1 className="text-[24px] font-bold tracking-tight text-black leading-none">{personal.fullName || 'YOUR NAME'}</h1>
        {personal.title && (
          <div className="text-[13.5px] text-black font-normal mt-1">{personal.title}</div>
        )}
        <div className="text-[11.5px] text-black flex flex-wrap justify-center items-center gap-x-2.5 mt-1.5">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-black font-medium">|</span>}
              {item}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Profile Summary (Optional) */}
      {personal.summary && (
        <div className="mt-4 mb-2.5">
          <h2 className="text-[14px] font-bold tracking-wider text-black">Professional Summary</h2>
          <div className="border-b border-black mt-1 mb-2"></div>
          <p className="text-justify text-black leading-relaxed">{personal.summary}</p>
        </div>
      )}

      {/* Dynamic Section Ordering */}
      {sectionOrder.map(sec => renderSection(sec))}

    </div>
  );
};

export default ATSFriendly;

