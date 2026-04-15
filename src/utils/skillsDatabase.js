/**
 * Comprehensive Skills Database
 * Contains normalized skill names and variations for accurate matching
 */

const SKILLS_DATABASE = {
  'PROGRAMMING_LANGUAGES': {
    'Java': ['java', 'j2ee', 'j2se'],
    'Python': ['python', 'py'],
    'JavaScript': ['javascript', 'js', 'nodejs', 'node.js'],
    'TypeScript': ['typescript', 'ts'],
    'C++': ['c++', 'cpp', 'c plus plus'],
    'C#': ['c#', 'csharp', 'c sharp', '.net'],
    'Go': ['golang', 'go'],
    'Rust': ['rust'],
    'PHP': ['php'],
    'Ruby': ['ruby', 'rails'],
    'Kotlin': ['kotlin'],
    'Swift': ['swift'],
    'R': ['r programming', 'r language'],
  },
  'WEB_FRAMEWORKS': {
    'Spring Boot': ['spring boot', 'springboot', 'spring-boot'],
    'Spring': ['spring', 'spring framework'],
    'Express': ['express', 'express.js'],
    'Django': ['django'],
    'Flask': ['flask'],
    'React': ['react', 'react.js', 'reactjs'],
    'Vue': ['vue', 'vue.js', 'vuejs'],
    'Angular': ['angular', 'angular.js', 'angularjs'],
    'Next.js': ['nextjs', 'next.js', 'next'],
    'FastAPI': ['fastapi', 'fast api'],
  },
  'DATABASES': {
    'MySQL': ['mysql', 'sql'],
    'PostgreSQL': ['postgresql', 'postgres', 'psql'],
    'MongoDB': ['mongodb', 'mongo'],
    'Firebase': ['firebase'],
    'Oracle': ['oracle', 'oracle database'],
    'SQLServer': ['sqlserver', 'sql server', 'mssql'],
    'Redis': ['redis'],
    'Elasticsearch': ['elasticsearch', 'elastic search'],
    'DynamoDB': ['dynamodb', 'dynamo db'],
    'Cassandra': ['cassandra'],
  },
  'CLOUD_PLATFORMS': {
    'AWS': ['aws', 'amazon web services', 'amazon aws'],
    'Azure': ['azure', 'microsoft azure'],
    'Google Cloud': ['gcp', 'google cloud', 'google cloud platform'],
    'Docker': ['docker', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s'],
    'Heroku': ['heroku'],
  },
  'DEVOPS_TOOLS': {
    'Docker': ['docker', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s', 'orchestration'],
    'Jenkins': ['jenkins', 'ci/cd', 'continuous integration'],
    'GitLab CI': ['gitlab ci', 'gitlab-ci'],
    'GitHub Actions': ['github actions'],
    'Terraform': ['terraform'],
    'Ansible': ['ansible'],
    'Nginx': ['nginx'],
    'Apache': ['apache'],
  },
  'MESSAGE_BROKERS': {
    'Kafka': ['kafka', 'apache kafka'],
    'RabbitMQ': ['rabbitmq', 'rabbit mq'],
    'ActiveMQ': ['activemq', 'active mq'],
    'AWS SQS': ['sqs', 'aws sqs'],
    'Azure Service Bus': ['service bus', 'azure service bus'],
  },
  'TOOLS_PLATFORMS': {
    'Git': ['git', 'github', 'gitlab', 'bitbucket'],
    'Maven': ['maven'],
    'Gradle': ['gradle'],
    'npm': ['npm', 'node package manager'],
    'JIRA': ['jira'],
    'Linux': ['linux', 'unix'],
    'Windows': ['windows', 'dos'],
  },
  'DATA_SCIENCE': {
    'Machine Learning': ['machine learning', 'ml', 'ml engineering'],
    'Deep Learning': ['deep learning', 'dl'],
    'Data Analysis': ['data analysis', 'analytics'],
    'Pandas': ['pandas'],
    'NumPy': ['numpy', 'np'],
    'Scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn'],
    'TensorFlow': ['tensorflow', 'tensor flow'],
    'PyTorch': ['pytorch', 'py torch'],
  },
  'TESTING': {
    'Unit Testing': ['unit testing', 'junit', 'testng'],
    'JUnit': ['junit'],
    'Pytest': ['pytest'],
    'Mockito': ['mockito'],
    'Selenium': ['selenium'],
  },
};

/**
 * Normalize skill name to standard format
 * @param {string} skill - Raw skill name
 * @returns {string} - Normalized skill name
 */
function normalizeSkill(skill) {
  if (!skill) return '';
  
  const normalized = skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s#.+\-]/g, '');
  
  return normalized;
}

/**
 * Find canonical skill name for a given variation
 * @param {string} skill - Skill name or variation
 * @returns {string|null} - Canonical skill name or null
 */
function findCanonicalSkill(skill) {
  const normalized = normalizeSkill(skill);
  
  if (!normalized) return null;
  
  for (const category in SKILLS_DATABASE) {
    const categorySkills = SKILLS_DATABASE[category];
    
    for (const canonicalName in categorySkills) {
      const variations = categorySkills[canonicalName];
      
      if (variations.some(v => normalizeSkill(v) === normalized)) {
        return canonicalName;
      }
      
      if (normalizeSkill(canonicalName) === normalized) {
        return canonicalName;
      }
    }
  }
  
  // If not found in database, return the normalized skill as-is
  return normalized.length > 0 ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : null;
}

/**
 * Extract all skills from text
 * @param {string} text - Text to extract skills from
 * @returns {string[]} - Array of canonical skill names
 */
function extractSkillsFromText(text) {
  if (!text) return [];
  
  const skills = new Set();
  const textLower = text.toLowerCase();
  
  for (const category in SKILLS_DATABASE) {
    const categorySkills = SKILLS_DATABASE[category];
    
    for (const canonicalName in categorySkills) {
      const variations = categorySkills[canonicalName];
      
      variations.forEach(variation => {
        // Create regex with word boundaries
        const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        
        if (regex.test(textLower)) {
          skills.add(canonicalName);
        }
      });
    }
  }
  
  return Array.from(skills);
}

/**
 * Check if skill exists in database
 * @param {string} skill - Skill to check
 * @returns {boolean}
 */
function isValidSkill(skill) {
  return findCanonicalSkill(skill) !== null;
}

module.exports = {
  SKILLS_DATABASE,
  normalizeSkill,
  findCanonicalSkill,
  extractSkillsFromText,
  isValidSkill,
};
