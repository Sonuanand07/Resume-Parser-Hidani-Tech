/**
 * Database Service
 * Handles SQLite database operations for resumes and jobs
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './database/resume_matcher.db';

class DatabaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      // Ensure database directory exists
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(() => {
            this.initialized = true;
            resolve();
          }).catch(reject);
        }
      });
    });
  }

  /**
   * Create required tables
   * @returns {Promise<void>}
   */
  async createTables() {
    const tables = [
      // Resumes table
      `CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        salary TEXT,
        years_of_experience REAL,
        skills TEXT,
        education TEXT,
        raw_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Jobs table
      `CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        salary TEXT,
        years_of_experience REAL,
        required_skills TEXT,
        optional_skills TEXT,
        about_role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Matches table (for storing match results)
      `CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER NOT NULL,
        job_id TEXT NOT NULL,
        matching_score INTEGER,
        matched_skills_count INTEGER,
        skills_analysis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(resume_id) REFERENCES resumes(id)
      )`,
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
  }

  /**
   * Generic run method for executing SQL
   * @param {string} sql - SQL query
   * @param {any[]} params - Query parameters
   * @returns {Promise<any>}
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database error:', err, sql);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Generic get method for executing SQL
   * @param {string} sql - SQL query
   * @param {any[]} params - Query parameters
   * @returns {Promise<any>}
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database error:', err, sql);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Generic all method for executing SQL
   * @param {string} sql - SQL query
   * @param {any[]} params - Query parameters
   * @returns {Promise<any[]>}
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database error:', err, sql);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Save resume to database
   * @param {Object} resumeData - Parsed resume data
   * @returns {Promise<number>} - Resume ID
   */
  async saveResume(resumeData) {
    const sql = `
      INSERT INTO resumes (name, email, phone, salary, years_of_experience, skills, education, raw_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      resumeData.name,
      resumeData.email || null,
      resumeData.phone || null,
      resumeData.salary || null,
      resumeData.yearsOfExperience || 0,
      JSON.stringify(resumeData.skills || []),
      JSON.stringify(resumeData.education || []),
      resumeData.rawText || null,
    ];

    const result = await this.run(sql, params);
    return result.id;
  }

  /**
   * Save job to database
   * @param {Object} jobData - Parsed job description data
   * @returns {Promise<string>} - Job ID
   */
  async saveJob(jobData) {
    const sql = `
      INSERT OR REPLACE INTO jobs (job_id, role, salary, years_of_experience, required_skills, optional_skills, about_role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      jobData.jobId,
      jobData.role,
      jobData.salary || null,
      jobData.yearsOfExperience || null,
      JSON.stringify(jobData.requiredSkills || []),
      JSON.stringify(jobData.optionalSkills || []),
      jobData.aboutRole || null,
    ];

    await this.run(sql, params);
    return jobData.jobId;
  }

  /**
   * Save match result to database
   * @param {number} resumeId - Resume ID
   * @param {string} jobId - Job ID
   * @param {Object} matchResult - Match result data
   * @returns {Promise<number>} - Match ID
   */
  async saveMatch(resumeId, jobId, matchResult) {
    const sql = `
      INSERT INTO matches (resume_id, job_id, matching_score, matched_skills_count, skills_analysis)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      resumeId,
      jobId,
      matchResult.matchingScore || 0,
      matchResult.matchedSkillsCount || 0,
      JSON.stringify(matchResult.skillsAnalysis || []),
    ];

    const result = await this.run(sql, params);
    return result.id;
  }

  /**
   * Get all resumes
   * @returns {Promise<Object[]>} - Array of resumes
   */
  async getAllResumes() {
    const resumes = await this.all('SELECT * FROM resumes');
    return resumes.map(r => ({
      ...r,
      skills: JSON.parse(r.skills || '[]'),
      education: JSON.parse(r.education || '[]'),
    }));
  }

  /**
   * Get resume by ID
   * @param {number} id - Resume ID
   * @returns {Promise<Object>} - Resume data
   */
  async getResumeById(id) {
    const resume = await this.get('SELECT * FROM resumes WHERE id = ?', [id]);
    if (resume) {
      return {
        ...resume,
        skills: JSON.parse(resume.skills || '[]'),
        education: JSON.parse(resume.education || '[]'),
      };
    }
    return null;
  }

  /**
   * Get all jobs
   * @returns {Promise<Object[]>} - Array of jobs
   */
  async getAllJobs() {
    const jobs = await this.all('SELECT * FROM jobs');
    return jobs.map(j => ({
      ...j,
      requiredSkills: JSON.parse(j.required_skills || '[]'),
      optionalSkills: JSON.parse(j.optional_skills || '[]'),
    }));
  }

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Job data
   */
  async getJobById(jobId) {
    const job = await this.get('SELECT * FROM jobs WHERE job_id = ?', [jobId]);
    if (job) {
      return {
        ...job,
        requiredSkills: JSON.parse(job.required_skills || '[]'),
        optionalSkills: JSON.parse(job.optional_skills || '[]'),
      };
    }
    return null;
  }

  /**
   * Get matches for a resume
   * @param {number} resumeId - Resume ID
   * @returns {Promise<Object[]>} - Array of matches
   */
  async getMatchesForResume(resumeId) {
    return await this.all(
      `SELECT * FROM matches WHERE resume_id = ? ORDER BY matching_score DESC`,
      [resumeId]
    );
  }

  /**
   * Delete resume
   * @param {number} id - Resume ID
   * @returns {Promise<void>}
   */
  async deleteResume(id) {
    await this.run('DELETE FROM resumes WHERE id = ?', [id]);
  }

  /**
   * Delete job
   * @param {string} jobId - Job ID
   * @returns {Promise<void>}
   */
  async deleteJob(jobId) {
    await this.run('DELETE FROM jobs WHERE job_id = ?', [jobId]);
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            console.log('Database connection closed');
            this.initialized = false;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new DatabaseService();
