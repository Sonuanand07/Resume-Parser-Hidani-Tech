#!/usr/bin/env node

/**
 * Interactive API Testing Script
 * Test the Resume Parser API with various examples
 * Run with: node api-test.js
 */

const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let response = '';

      res.on('data', (chunk) => {
        response += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(response));
        } catch (_) {
          resolve(response);
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

// Test cases
const tests = {
  1: {
    name: 'Parse a Resume',
    async run() {
      console.log('\n📄 Testing: Parse Resume\n');
      const result = await makeRequest('POST', '/api/parse-resume', {
        resumeText: `
          John Doe
          john.doe@example.com | +919876543210
          
          Professional Summary:
          5 years of experience in Backend Development using Java and Spring Boot
          
          Skills: Java, Spring Boot, MySQL, Docker, AWS, Git
          Education: B.Tech in Computer Science
        `
      });

      console.log('✅ Response:');
      console.log(JSON.stringify(result, null, 2));
    }
  },

  2: {
    name: 'Parse a Job Description',
    async run() {
      console.log('\n🏢 Testing: Parse Job Description\n');
      const result = await makeRequest('POST', '/api/parse-job-description', {
        jdText: `
          Backend Developer
          
          About the Role:
          Design and implement backend services using Java and Spring Boot
          
          Required Experience: 3 years
          
          Salary: 10-15 LPA
          
          Required Skills:
          - Java
          - Spring Boot
          - MySQL
          - Docker
          
          Optional Skills:
          - Kafka
          - AWS
        `,
        jobId: 'JD001'
      });

      console.log('✅ Response:');
      console.log(JSON.stringify(result, null, 2));
    }
  },

  3: {
    name: 'Match Resume to Jobs',
    async run() {
      console.log('\n🎯 Testing: Match Resume to Jobs\n');
      const result = await makeRequest('POST', '/api/match-resume-to-jobs', {
        resumeText: `
          Jane Smith
          jane@example.com
          
          3 years of Python development
          Skills: Python, Flask, PostgreSQL, Docker, Git
          Education: B.Sc
        `,
        jobs: [
          {
            text: `
              Python Developer
              Required: Python, Flask, PostgreSQL
              Optional: Docker, AWS
              Salary: 8-12 LPA
            `,
            jobId: 'JD001'
          },
          {
            text: `
              Java Backend Developer
              Required: Java, Spring Boot, MySQL
              Optional: Docker, Kubernetes
              Salary: 10-15 LPA
            `,
            jobId: 'JD002'
          }
        ]
      });

      console.log('✅ Response:');
      console.log(JSON.stringify(result, null, 2));
    }
  },

  4: {
    name: 'Get All Resumes',
    async run() {
      console.log('\n📚 Testing: Get All Resumes\n');
      const result = await makeRequest('GET', '/api/resumes');

      console.log('✅ Response:');
      if (result.data && result.data.length === 0) {
        console.log('  No resumes in database yet');
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    }
  },

  5: {
    name: 'Health Check',
    async run() {
      console.log('\n❤️ Testing: Health Check\n');
      const result = await makeRequest('GET', '/api/health');

      console.log('✅ Response:');
      console.log(JSON.stringify(result, null, 2));
    }
  },

  6: {
    name: 'Test Perfect Match Scenario',
    async run() {
      console.log('\n⭐ Testing: Perfect Match Scenario (100%)\n');
      const result = await makeRequest('POST', '/api/match-resume-to-jobs', {
        resumeText: `
          Alice Johnson
          alice@example.com
          
          5 years experience
          Skills: Java, Spring Boot, MySQL, Docker, Kafka, AWS
        `,
        jobs: [
          {
            text: `
              Senior Backend Developer
              Required Skills: Java, Spring Boot, MySQL, Docker
              Optional: Kafka, AWS
            `,
            jobId: 'PERFECT'
          }
        ]
      });

      console.log('✅ Response (should have 100% match):');
      console.log(JSON.stringify(result, null, 2));
    }
  },

  7: {
    name: 'Test Partial Match Scenario',
    async run() {
      console.log('\n🔶 Testing: Partial Match Scenario (50%)\n');
      const result = await makeRequest('POST', '/api/match-resume-to-jobs', {
        resumeText: `
          Bob Wilson
          bob@example.com
          
          2 years experience
          Skills: Java, Spring Boot
        `,
        jobs: [
          {
            text: `
              Backend Developer
              Required: Java, Spring Boot, MySQL, Docker
            `,
            jobId: 'PARTIAL'
          }
        ]
      });

      console.log('✅ Response (should have 50% match):');
      console.log(JSON.stringify(result, null, 2));
    }
  },

  8: {
    name: 'Test No Match Scenario',
    async run() {
      console.log('\n❌ Testing: No Match Scenario (0%)\n');
      const result = await makeRequest('POST', '/api/match-resume-to-jobs', {
        resumeText: `
          Carol Davis
          carol@example.com
          
          1 year experience
          Skills: HTML, CSS, JavaScript
        `,
        jobs: [
          {
            text: `
              Backend Developer
              Required: Java, Spring Boot, MySQL, Docker
            `,
            jobId: 'NOMATCH'
          }
        ]
      });

      console.log('✅ Response (should have 0% match):');
      console.log(JSON.stringify(result, null, 2));
    }
  }
};

// Display menu
function displayMenu() {
  console.clear();
  console.log('\n' + '='.repeat(60));
  console.log('Resume Parser API - Interactive Testing');
  console.log('='.repeat(60));
  console.log('\nAvailable Tests:\n');

  Object.entries(tests).forEach(([key, test]) => {
    console.log(`  ${key}. ${test.name}`);
  });

  console.log(`  0. Exit\n`);
}

// Run test
async function runTest(choice) {
  if (choice === '0') {
    console.log('\n👋 Goodbye!\n');
    rl.close();
    process.exit(0);
  }

  const test = tests[choice];
  if (!test) {
    console.log('\n❌ Invalid choice. Please try again.');
    return;
  }

  try {
    await test.run();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n⚠️  Make sure the server is running (npm start)');
  }

  rl.question('\nPress Enter to continue...', () => {
    displayMenu();
    askForInput();
  });
}

// Ask for input
function askForInput() {
  rl.question('Select a test (0-8): ', (choice) => {
    runTest(choice);
  });
}

// Start
displayMenu();
askForInput();
