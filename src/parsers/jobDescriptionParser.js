/**
 * Job Description Parser
 * Extracts structured information from JD text
 */

const {
  extractSalary,
  extractYearsOfExperience,
} = require('../utils/extractors');

const {
  extractSkillsFromText,
} = require('../utils/skillsDatabase');

/**
 * Parse job description text and extract structured information
 * @param {string} jdText - Raw JD text
 * @param {string} jobId - Unique job ID
 * @returns {Object} - Structured JD data
 */
function parseJobDescription(jdText, jobId = null) {
  if (!jdText || typeof jdText !== 'string') {
    throw new Error('Invalid JD text');
  }

  // Extract role/title - usually first meaningful heading
  const role = extractJobRole(jdText);
  
  // Extract about role (job description summary)
  const aboutRole = extractAboutRole(jdText);
  
  // Extract salary
  const salary = extractSalary(jdText);
  
  // Extract experience required
  const yearsOfExperience = extractYearsOfExperience(jdText);
  
  // Extract required and optional skills
  const { requiredSkills, optionalSkills } = extractSkillsWithCategorization(jdText);

  return {
    jobId: jobId || `JD_${Date.now()}`,
    role: role || 'Unknown Role',
    salary: salary || null,
    yearsOfExperience: yearsOfExperience !== null ? parseFloat(yearsOfExperience) : null,
    requiredSkills: requiredSkills,
    optionalSkills: optionalSkills,
    aboutRole: aboutRole || null,
    allSkills: [...new Set([...requiredSkills, ...optionalSkills])],
  };
}

/**
 * Extract job role/title from JD
 * @param {string} text - JD text
 * @returns {string|null}
 */
function extractJobRole(text) {
  // Pattern 1: "Role: X" or "Position: X" or "Job Title: X"
  const labeledMatch = text.match(/(?:Role|Position|Job\s+Title|Title):\s*([^\n]+)/i);
  if (labeledMatch) {
    return labeledMatch[1].trim().split('\n')[0];
  }

  // Pattern 2: Common job title patterns at the beginning
  const titleMatch = text.match(/^(.*?(?:Developer|Engineer|Analyst|Manager|Architect|Specialist|Consultant|Lead|Senior|Junior|Intern)).*$/im);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Pattern 3: Second non-empty line (first is usually resume header)
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length >= 2) {
    return lines[1].trim();
  }

  return null;
}

/**
 * Extract about role (job description summary)
 * @param {string} text - JD text
 * @returns {string|null}
 */
function extractAboutRole(text) {
  // Pattern 1: Text between "About", "Description", "Responsibilities" and next section
  const aboutMatch = text.match(/(?:About\s+(?:the\s+)?(?:Role|Job|Position)|Job\s+Description|Role\s+Description)[:\s]*([^\n]*(?:\n(?!(?:Requirements|Qualifications|Skills|Responsibilities|Experience|About|We\s+are|You\s+will|Salary|Compensation)).)*)/i);
  
  if (aboutMatch) {
    let description = aboutMatch[1]
      .trim()
      .split('\n')
      .slice(0, 10) // Limit to first 10 lines
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (description.length > 0) {
      return description.substring(0, 500); // Limit length
    }
  }

  // Pattern 2: Extract first substantial paragraph
  const paragraphs = text.split('\n\n');
  for (let para of paragraphs) {
    if (para.length > 50 && para.length < 500 && !/^(?:Skills|Requirements|Qualifications|Experience)/i.test(para)) {
      return para.trim().substring(0, 500);
    }
  }

  return null;
}

/**
 * Extract required and optional skills from JD
 * @param {string} text - JD text
 * @returns {Object} - { requiredSkills: [], optionalSkills: [] }
 */
function extractSkillsWithCategorization(text) {
  const requiredSkills = new Set();
  const optionalSkills = new Set();

  // Extract all skills first
  const allSkills = extractSkillsFromText(text);

  // Try to categorize based on context
  // Required skills section
  const requiredMatch = text.match(/(?:Required\s+(?:Skills|Qualifications|Experience)|Must\s+Have)[:\s]*([^\n]*(?:\n(?!(?:Optional|Nice\s+To\s+Have|Preferred|Desired|Should|Will|About|Responsibilities|Salary)).)*)/i);
  
  if (requiredMatch) {
    const requiredText = requiredMatch[1];
    allSkills.forEach(skill => {
      if (new RegExp(skill, 'i').test(requiredText)) {
        requiredSkills.add(skill);
      }
    });
  }

  // Optional skills section
  const optionalMatch = text.match(/(?:Optional|Nice\s+To\s+Have|Preferred|Desired|Should\s+Have)[:\s]*([^\n]*(?:\n(?!(?:Required|Must\s+Have|About|Responsibilities|Salary)).)*)/i);
  
  if (optionalMatch) {
    const optionalText = optionalMatch[1];
    allSkills.forEach(skill => {
      if (new RegExp(skill, 'i').test(optionalText)) {
        optionalSkills.add(skill);
      }
    });
  }

  // If no categorization found, mark first 60% as required, rest as optional
  if (requiredSkills.size === 0 && optionalSkills.size === 0) {
    const skipsCount = Math.ceil(allSkills.length * 0.6);
    allSkills.slice(0, skipsCount).forEach(skill => requiredSkills.add(skill));
    allSkills.slice(skipsCount).forEach(skill => optionalSkills.add(skill));
  }

  return {
    requiredSkills: Array.from(requiredSkills),
    optionalSkills: Array.from(optionalSkills),
  };
}

/**
 * Parse multiple job descriptions
 * @param {Array} jobsData - Array of { text, jobId? }
 * @returns {Object[]} - Array of structured JD data
 */
function parseMultipleJobDescriptions(jobsData) {
  if (!Array.isArray(jobsData)) {
    throw new Error('Input must be an array of job descriptions');
  }

  return jobsData.map((job, index) => {
    try {
      const jobId = job.jobId || `JD${String(index + 1).padStart(3, '0')}`;
      const text = typeof job === 'string' ? job : job.text;
      return parseJobDescription(text, jobId);
    } catch (error) {
      console.error(`Error parsing JD ${index}:`, error.message);
      return {
        jobId: `JD${String(index + 1).padStart(3, '0')}`,
        role: 'Unknown Role',
        salary: null,
        yearsOfExperience: null,
        requiredSkills: [],
        optionalSkills: [],
        aboutRole: null,
        allSkills: [],
        error: error.message,
      };
    }
  });
}

module.exports = {
  parseJobDescription,
  parseMultipleJobDescriptions,
  extractJobRole,
  extractAboutRole,
  extractSkillsWithCategorization,
};
