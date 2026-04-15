/**
 * Test with actual samples from sample-data
 * Run with: npm test -- integration.test.js
 */

const { SAMPLE_RESUME, SAMPLE_JD } = require('../sample-data/samples');
const { parseResume } = require('../src/parsers/resumeParser');
const { parseJobDescription } = require('../src/parsers/jobDescriptionParser');
const { matchResumeAgainstJobs } = require('../src/services/matchingService');

describe('Integration Tests', () => {
  describe('Full Workflow', () => {
    test('should parse sample resume successfully', () => {
      const result = parseResume(SAMPLE_RESUME);
      
      expect(result.name).toBeTruthy();
      expect(result.email).toBeTruthy();
      expect(result.yearsOfExperience).toBeGreaterThan(0);
      expect(result.skills.length).toBeGreaterThan(0);
    });

    test('should parse sample job description successfully', () => {
      const result = parseJobDescription(SAMPLE_JD, 'JD001');
      
      expect(result.role).toBeTruthy();
      expect(result.requiredSkills.length).toBeGreaterThan(0);
    });

    test('should match resume to job successfully', () => {
      const resume = parseResume(SAMPLE_RESUME);
      const job = parseJobDescription(SAMPLE_JD, 'JD001');
      
      const result = matchResumeAgainstJobs(resume, [job]);
      
      expect(result.candidateName).toBe(resume.name);
      expect(result.matchingJobs.length).toBe(1);
      expect(result.matchingJobs[0].matchingScore).toBeGreaterThanOrEqual(0);
      expect(result.matchingJobs[0].matchingScore).toBeLessThanOrEqual(100);
    });

    test('should provide skill analysis', () => {
      const resume = parseResume(SAMPLE_RESUME);
      const job = parseJobDescription(SAMPLE_JD, 'JD001');
      
      const result = matchResumeAgainstJobs(resume, [job]);
      const skillsAnalysis = result.matchingJobs[0].skillsAnalysis;
      
      expect(Array.isArray(skillsAnalysis)).toBe(true);
      expect(skillsAnalysis.length).toBeGreaterThan(0);
      expect(skillsAnalysis.every(s => 'skill' in s && 'presentInResume' in s)).toBe(true);
    });
  });
});
