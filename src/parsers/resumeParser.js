/**
 * Resume Parser
 * Extracts structured information from resume text
 */

const {
  extractSalary,
  extractYearsOfExperience,
  extractPhoneNumber,
  extractEmail,
  extractName,
  extractEducation,
} = require('../utils/extractors');

const {
  extractSkillsFromText,
  findCanonicalSkill,
} = require('../utils/skillsDatabase');

/**
 * Parse resume text and extract structured information
 * @param {string} resumeText - Raw resume text
 * @returns {Object} - Structured resume data
 */
function parseResume(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    throw new Error('Invalid resume text');
  }

  const name = extractName(resumeText);
  const email = extractEmail(resumeText);
  const phone = extractPhoneNumber(resumeText);
  const salary = extractSalary(resumeText);
  const yearsOfExperience = extractYearsOfExperience(resumeText);
  const education = extractEducation(resumeText);
  const skills = extractSkillsFromText(resumeText);

  return {
    name: name || 'Unknown',
    email: email || null,
    phone: phone || null,
    salary: salary || null,
    yearsOfExperience: yearsOfExperience !== null ? parseFloat(yearsOfExperience) : 0,
    education: education,
    skills: skills,
    rawText: resumeText.substring(0, 500), // Store first 500 chars for debugging
  };
}

/**
 * Parse multiple resumes
 * @param {string[]} resumeTexts - Array of raw resume texts
 * @returns {Object[]} - Array of structured resume data
 */
function parseMultipleResumes(resumeTexts) {
  if (!Array.isArray(resumeTexts)) {
    throw new Error('Input must be an array of resume texts');
  }

  return resumeTexts.map((text, index) => {
    try {
      return {
        ...parseResume(text),
        resumeIndex: index,
      };
    } catch (error) {
      console.error(`Error parsing resume ${index}:`, error.message);
      return {
        name: `Resume ${index}`,
        email: null,
        phone: null,
        salary: null,
        yearsOfExperience: 0,
        education: [],
        skills: [],
        error: error.message,
      };
    }
  });
}

module.exports = {
  parseResume,
  parseMultipleResumes,
};
