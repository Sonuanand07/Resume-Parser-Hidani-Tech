/**
 * Demo Script - Resume Parser and Job Matcher
 * 
 * This script demonstrates how to use the API programmatically
 * Run with: npm run demo (add this to package.json scripts)
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Sample data
const SAMPLE_RESUME = `
JOHN DOE
Email: john.doe@example.com | Phone: +919876543210

PROFESSIONAL SUMMARY
Experienced Backend Developer with 4.5 years of professional experience building scalable web applications
using Java, Spring Boot, and microservices architecture. Strong expertise in database optimization and cloud deployment.

PROFESSIONAL EXPERIENCE

Senior Backend Developer | Tech Solutions Inc. | Jan 2021 - Present
- Led development of microservices architecture
- Designed and implemented RESTful APIs using Spring Boot
- Optimized database queries reducing latency by 40%
- Managed Docker containerization and Kubernetes deployments
Skills: Java, Spring Boot, MySQL, PostgreSQL, Docker, Kubernetes, AWS, Git, JUnit, Maven

Backend Developer | Digital Innovations Ltd. | Jun 2018 - Dec 2020
- Developed and maintained 15+ microservices
- Implemented caching strategies using Redis
- Collaborated with frontend team on API design
Skills: Java, Spring Framework, MySQL, REST APIs, Maven, Docker

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science
National Institute of Technology, 2017

SKILLS
Languages: Java, Python, JavaScript
Frameworks: Spring Boot, Spring Framework
Databases: MySQL, PostgreSQL, MongoDB
DevOps: Docker, Kubernetes, AWS (EC2, S3)
Tools: Git, Maven, JIRA
`;

const SAMPLE_JD_1 = `
JOB TITLE: Senior Backend Developer
COMPANY: Tech Innovations Inc.

ABOUT THE ROLE:
We are seeking an experienced Senior Backend Developer to join our platform team. You will be responsible for
designing and implementing high-performance backend services. Our tech stack is built on Java and Spring Boot.

EXPERIENCE REQUIRED: 4+ years in backend development

SALARY: 12-18 LPA

REQUIRED SKILLS:
- Java 8+ with strong OOP concepts
- Spring Boot and Spring Framework
- MySQL or PostgreSQL
- Docker and containerization
- REST API design and implementation
- Unit testing with JUnit and Mockito
- Git version control

OPTIONAL SKILLS:
- Kubernetes orchestration
- Apache Kafka
- AWS cloud services
- CI/CD pipelines
`;

const SAMPLE_JD_2 = `
JOB TITLE: Frontend Developer
COMPANY: Web Solutions Inc.

ABOUT THE ROLE:
Build amazing user interfaces using React and modern JavaScript. Work with a talented team to create
responsive and performant web applications.

EXPERIENCE REQUIRED: 3 years

SALARY: 8-12 LPA

REQUIRED SKILLS:
- React and JavaScript
- CSS3 and HTML5
- Redux or similar state management
- RESTful API integration

OPTIONAL SKILLS:
- TypeScript
- Next.js
- Testing libraries
`;

// Main demo function
async function runDemo() {
  console.log('\n' + '='.repeat(80));
  console.log('Resume Parser and Job Matcher - Demo');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Check Server Health
    console.log('1️⃣  Checking server health...\n');
    const healthOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const health = await makeRequest(healthOptions);
    console.log('✅ Server Status:', health.message);
    console.log();

    // 2. Parse Resume
    console.log('2️⃣  Parsing Resume...\n');
    const parseResumeOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/parse-resume',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const parsedResume = await makeRequest(parseResumeOptions, {
      resumeText: SAMPLE_RESUME
    });

    console.log('✅ Resume Parsed Successfully!');
    console.log('   Name:', parsedResume.data.name);
    console.log('   Email:', parsedResume.data.email);
    console.log('   Phone:', parsedResume.data.phone);
    console.log('   Years of Experience:', parsedResume.data.yearsOfExperience);
    console.log('   Skills:', parsedResume.data.skills.join(', '));
    console.log();

    // 3. Parse Job Descriptions
    console.log('3️⃣  Parsing Job Descriptions...\n');
    const parseJDOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/parse-job-description',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const job1 = await makeRequest(parseJDOptions, {
      jdText: SAMPLE_JD_1,
      jobId: 'JD001'
    });

    const job2 = await makeRequest(parseJDOptions, {
      jdText: SAMPLE_JD_2,
      jobId: 'JD002'
    });

    console.log('✅ Job 1 -', job1.data.role);
    console.log('   Required Skills:', job1.data.requiredSkills.join(', '));
    console.log();
    console.log('✅ Job 2 -', job2.data.role);
    console.log('   Required Skills:', job2.data.requiredSkills.join(', '));
    console.log();

    // 4. Match Resume to Jobs
    console.log('4️⃣  Matching Resume to Jobs...\n');
    const matchOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/match-resume-to-jobs',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const matchResult = await makeRequest(matchOptions, {
      resumeText: SAMPLE_RESUME,
      jobs: [
        { text: SAMPLE_JD_1, jobId: 'JD001' },
        { text: SAMPLE_JD_2, jobId: 'JD002' }
      ]
    });

    console.log('✅ Matching Complete!\n');
    console.log('📊 Summary Statistics:');
    console.log('   Total Jobs Matched:', matchResult.data.summary.totalJobs);
    console.log('   Perfect Matches (100%):', matchResult.data.summary.perfectMatches);
    console.log('   Good Matches (50-99%):', matchResult.data.summary.goodMatches);
    console.log('   Poor Matches (<50%):', matchResult.data.summary.poorMatches);
    console.log('   Average Score:', matchResult.data.summary.averageScore + '%');
    console.log();

    // 5. Show Detailed Match Results
    console.log('📋 Match Details (sorted by score):\n');
    matchResult.data.matchingJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.role} (${job.jobId})`);
      console.log(`   Matching Score: ${job.matchingScore}%`);
      console.log(`   Matched Skills: ${job.matchedSkillsCount}/${job.totalSkillsCount}`);
      
      // Show skill breakdown
      const matchedSkills = job.skillsAnalysis
        .filter(s => s.presentInResume)
        .map(s => s.skill);
      const missingSkills = job.skillsAnalysis
        .filter(s => !s.presentInResume)
        .map(s => s.skill);
      
      if (matchedSkills.length > 0) {
        console.log('   ✅ Has Skills:', matchedSkills.join(', '));
      }
      if (missingSkills.length > 0) {
        console.log('   ❌ Missing Skills:', missingSkills.join(', '));
      }
      console.log();
    });

    // 6. Best Match
    console.log('🏆 Best Matching Job:');
    const bestMatch = matchResult.data.bestMatchingJob;
    console.log(`   Role: ${bestMatch.role}`);
    console.log(`   Score: ${bestMatch.matchingScore}%`);
    console.log(`   Message: ${'This candidate is a ' + 
      (bestMatch.matchingScore >= 80 ? 'PERFECT fit' : 
       bestMatch.matchingScore >= 50 ? 'GOOD fit' : 
       'PARTIAL fit')}`);
    console.log();

    console.log('='.repeat(80));
    console.log('✨ Demo completed successfully!');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure the server is running: npm start');
    process.exit(1);
  }
}

// Run demo
runDemo();
