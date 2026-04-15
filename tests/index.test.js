/**
 * Test Suite for Resume Parser and Job Matcher
 * Run with: npm test
 */

const { parseResume } = require('../src/parsers/resumeParser');
const { parseJobDescription } = require('../src/parsers/jobDescriptionParser');
const { matchResumeAgainstJobs } = require('../src/services/matchingService');
const { extractSkillsFromText } = require('../src/utils/skillsDatabase');
const {
  extractSalary,
  extractYearsOfExperience,
  extractEmail,
  extractName,
} = require('../src/utils/extractors');

describe('Extractors', () => {
  describe('extractSalary', () => {
    test('should extract LPA salary', () => {
      expect(extractSalary('Salary: 12 LPA')).toBe('12 LPA');
    });

    test('should extract salary range', () => {
      expect(extractSalary('10 - 15 LPA')).toBe('10 - 15 LPA');
    });

    test('should return null for no salary', () => {
      expect(extractSalary('No salary information')).toBeNull();
    });
  });

  describe('extractYearsOfExperience', () => {
    test('should extract years of experience', () => {
      expect(extractYearsOfExperience('4 years of experience')).toBe(4);
    });

    test('should extract fresher', () => {
      expect(extractYearsOfExperience('Fresher, Entry-Level')).toBe(0);
    });

    test('should calculate from date range', () => {
      const exp = extractYearsOfExperience('2015 - Present');
      expect(exp).toBeGreaterThan(0);
    });
  });

  describe('extractEmail', () => {
    test('should extract email', () => {
      expect(extractEmail('Contact: john@example.com')).toBe('john@example.com');
    });

    test('should return null for invalid email', () => {
      expect(extractEmail('No email here')).toBeNull();
    });
  });
});

describe('Skills Database', () => {
  describe('extractSkillsFromText', () => {
    test('should extract programming languages', () => {
      const skills = extractSkillsFromText('I have experience with Java and Python');
      expect(skills).toContain('Java');
      expect(skills).toContain('Python');
    });

    test('should extract frameworks', () => {
      const skills = extractSkillsFromText('Proficient in Spring Boot and React');
      expect(skills).toContain('Spring Boot');
      expect(skills).toContain('React');
    });

    test('should return empty array for no skills', () => {
      expect(extractSkillsFromText('')).toEqual([]);
    });
  });
});

describe('Resume Parser', () => {
  const sampleResume = `
    John Doe
    john@example.com | +919876543210
    
    Experience:
    5 years of experience with Java, Spring Boot, MySQL, and Docker
    
    Education: B.Tech
  `;

  test('should parse name', () => {
    const result = parseResume(sampleResume);
    expect(result.name).toBeTruthy();
  });

  test('should parse email', () => {
    const result = parseResume(sampleResume);
    expect(result.email).toBe('john@example.com');
  });

  test('should parse phone', () => {
    const result = parseResume(sampleResume);
    expect(result.phone).toBeTruthy();
  });

  test('should parse years of experience', () => {
    const result = parseResume(sampleResume);
    expect(result.yearsOfExperience).toBe(5);
  });

  test('should extract skills', () => {
    const result = parseResume(sampleResume);
    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.skills).toContain('Java');
  });
});

describe('Job Description Parser', () => {
  const sampleJD = `
    Senior Backend Developer
    
    About the Role:
    Develop high-performance backend services using Java and Spring Boot.
    
    Required Skills: Java, Spring Boot, MySQL, Docker
    Optional Skills: Kafka, AWS
    
    Experience Required: 4 years
    Salary: 12-15 LPA
  `;

  test('should parse job role', () => {
    const result = parseJobDescription(sampleJD, 'JD001');
    expect(result.role).toBeTruthy();
  });

  test('should parse salary', () => {
    const result = parseJobDescription(sampleJD, 'JD001');
    expect(result.salary).toBeTruthy();
  });

  test('should parse experience requirement', () => {
    const result = parseJobDescription(sampleJD, 'JD001');
    expect(result.yearsOfExperience).toBe(4);
  });

  test('should extract skills', () => {
    const result = parseJobDescription(sampleJD, 'JD001');
    expect(result.requiredSkills.length).toBeGreaterThan(0);
  });
});

describe('Matching Service', () => {
  const resume = {
    name: 'John Doe',
    email: 'john@example.com',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    yearsOfExperience: 5,
  };

  const job = {
    jobId: 'JD001',
    role: 'Backend Developer',
    requiredSkills: ['Java', 'Spring Boot', 'MySQL'],
    optionalSkills: ['Docker', 'Kafka'],
  };

  test('should calculate matching score', () => {
    const { matchResumeAgainstJobs } = require('../src/services/matchingService');
    const result = matchResumeAgainstJobs(resume, [job]);
    expect(result.matchingJobs[0].matchingScore).toBeGreaterThanOrEqual(0);
    expect(result.matchingJobs[0].matchingScore).toBeLessThanOrEqual(100);
  });

  test('should create skills analysis', () => {
    const result = matchResumeAgainstJobs(resume, [job]);
    const analysis = result.matchingJobs[0].skillsAnalysis;
    expect(Array.isArray(analysis)).toBe(true);
    expect(analysis.every(s => 'skill' in s && 'presentInResume' in s)).toBe(true);
  });

  test('should match perfect candidate', () => {
    const perfectResume = {
      ...resume,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Kafka'],
    };
    const result = matchResumeAgainstJobs(perfectResume, [job]);
    expect(result.matchingJobs[0].matchingScore).toBe(100);
  });

  test('should not match irrelevant candidate', () => {
    const mismatchResume = {
      ...resume,
      skills: ['Python', 'Django', 'PostgreSQL'],
    };
    const result = matchResumeAgainstJobs(mismatchResume, [job]);
    expect(result.matchingJobs[0].matchingScore).toBeLessThan(50);
  });
});
