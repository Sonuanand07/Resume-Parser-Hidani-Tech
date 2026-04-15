/**
 * Job Matching Service
 * Calculates matching score and creates skill analysis
 */

/**
 * Calculate matching score between resume and job description
 * Formula: (Matched JD Skills / Total JD Skills) × 100
 * @param {string[]} resumeSkills - Skills from resume
 * @param {string[]} jdSkills - Skills from JD
 * @returns {Object} - { scorePercentage, matchedCount, totalCount }
 */
function calculateMatchingScore(resumeSkills, jdSkills) {
  if (!Array.isArray(resumeSkills) || !Array.isArray(jdSkills)) {
    throw new Error('Skills must be arrays');
  }

  if (jdSkills.length === 0) {
    return {
      scorePercentage: 0,
      matchedCount: 0,
      totalCount: 0,
    };
  }

  // Normalize skills for comparison
  const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase().trim());
  const normalizedJDSkills = jdSkills.map(s => s.toLowerCase().trim());

  // Count matches
  let matchedCount = 0;
  normalizedJDSkills.forEach(jdSkill => {
    if (normalizedResumeSkills.includes(jdSkill)) {
      matchedCount++;
    }
  });

  const totalCount = normalizedJDSkills.length;
  const scorePercentage = Math.round((matchedCount / totalCount) * 100);

  return {
    scorePercentage,
    matchedCount,
    totalCount,
  };
}

/**
 * Create skill analysis for matching
 * Indicates presence of each JD skill in resume
 * @param {string[]} resumeSkills - Skills from resume
 * @param {string[]} jdSkills - Skills from JD
 * @returns {Object[]} - Array of { skill, presentInResume }
 */
function createSkillsAnalysis(resumeSkills, jdSkills) {
  if (!Array.isArray(resumeSkills) || !Array.isArray(jdSkills)) {
    throw new Error('Skills must be arrays');
  }

  const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase().trim());

  return jdSkills.map(skill => ({
    skill: skill,
    presentInResume: normalizedResumeSkills.includes(skill.toLowerCase().trim()),
  }));
}

/**
 * Match a resume against multiple jobs
 * @param {Object} resume - Parsed resume data
 * @param {Object[]} jobs - Array of parsed job descriptions
 * @returns {Object} - Matched result with all jobs ranked
 */
function matchResumeAgainstJobs(resume, jobs) {
  if (!resume || !Array.isArray(jobs)) {
    throw new Error('Invalid resume or jobs data');
  }

  // Match against each job
  const matchingJobs = jobs.map(job => {
    const { scorePercentage, matchedCount, totalCount } = calculateMatchingScore(
      resume.skills,
      job.allSkills || job.requiredSkills || []
    );

    const skillsAnalysis = createSkillsAnalysis(
      resume.skills,
      job.allSkills || job.requiredSkills || []
    );

    return {
      jobId: job.jobId,
      role: job.role,
      aboutRole: job.aboutRole,
      salary: job.salary,
      requiredYearsOfExperience: job.yearsOfExperience,
      candidateYearsOfExperience: resume.yearsOfExperience,
      skillsAnalysis: skillsAnalysis,
      matchingScore: scorePercentage,
      matchedSkillsCount: matchedCount,
      totalSkillsCount: totalCount,
    };
  });

  // Sort by matching score (highest first)
  matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore);

  return {
    candidateName: resume.name,
    candidateEmail: resume.email,
    candidatePhone: resume.phone,
    candidateSalary: resume.salary,
    candidateYearsOfExperience: resume.yearsOfExperience,
    resumeSkills: resume.skills,
    matchingJobs: matchingJobs,
    totalJobsMatched: matchingJobs.length,
    bestMatchingJob: matchingJobs.length > 0 ? matchingJobs[0] : null,
  };
}

/**
 * Get match summary statistics
 * @param {Object[]} matchingJobs - Array of matching jobs
 * @returns {Object} - Summary statistics
 */
function getMatchingSummary(matchingJobs) {
  if (!Array.isArray(matchingJobs) || matchingJobs.length === 0) {
    return {
      totalJobs: 0,
      perfectMatches: 0,
      goodMatches: 0,
      poorMatches: 0,
      averageScore: 0,
    };
  }

  const perfectMatches = matchingJobs.filter(j => j.matchingScore === 100).length;
  const goodMatches = matchingJobs.filter(j => j.matchingScore >= 50 && j.matchingScore < 100).length;
  const poorMatches = matchingJobs.filter(j => j.matchingScore < 50).length;
  const averageScore = Math.round(
    matchingJobs.reduce((sum, j) => sum + j.matchingScore, 0) / matchingJobs.length
  );

  return {
    totalJobs: matchingJobs.length,
    perfectMatches: perfectMatches,
    goodMatches: goodMatches,
    poorMatches: poorMatches,
    averageScore: averageScore,
  };
}

module.exports = {
  calculateMatchingScore,
  createSkillsAnalysis,
  matchResumeAgainstJobs,
  getMatchingSummary,
};
