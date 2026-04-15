/**
 * API Routes
 * Defines all API endpoints for resume parsing and job matching
 */

const express = require('express');
const router = express.Router();
const { parseResume } = require('../parsers/resumeParser');
const { parseJobDescription, parseMultipleJobDescriptions } = require('../parsers/jobDescriptionParser');
const { matchResumeAgainstJobs, getMatchingSummary } = require('../services/matchingService');
const databaseService = require('../database/databaseService');

/**
 * POST /api/parse-resume
 * Parse a single resume
 */
router.post('/parse-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'resumeText is required and must be a string',
      });
    }

    const parsedResume = parseResume(resumeText);

    // Save to database
    const resumeId = await databaseService.saveResume(parsedResume);

    res.json({
      success: true,
      data: {
        ...parsedResume,
        resumeId: resumeId,
      },
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/parse-job-description
 * Parse a single job description
 */
router.post('/parse-job-description', async (req, res) => {
  try {
    const { jdText, jobId } = req.body;

    if (!jdText || typeof jdText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'jdText is required and must be a string',
      });
    }

    const parsedJob = parseJobDescription(jdText, jobId);

    // Save to database
    await databaseService.saveJob(parsedJob);

    res.json({
      success: true,
      data: parsedJob,
    });
  } catch (error) {
    console.error('Error parsing JD:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/match-resume-to-jobs
 * Match resume against multiple jobs
 */
router.post('/match-resume-to-jobs', async (req, res) => {
  try {
    const { resumeText, jobs } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'resumeText is required and must be a string',
      });
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'jobs must be a non-empty array',
      });
    }

    // Parse resume
    const parsedResume = parseResume(resumeText);

    // Parse all job descriptions
    const parsedJobs = parseMultipleJobDescriptions(jobs);

    // Match resume against jobs
    const matchResults = matchResumeAgainstJobs(parsedResume, parsedJobs);

    // Get summary statistics
    const summary = getMatchingSummary(matchResults.matchingJobs);

    // Save to database
    const resumeId = await databaseService.saveResume(parsedResume);
    for (const job of parsedJobs) {
      await databaseService.saveJob(job);
    }
    for (const match of matchResults.matchingJobs) {
      await databaseService.saveMatch(resumeId, match.jobId, match);
    }

    res.json({
      success: true,
      data: {
        ...matchResults,
        summary: summary,
      },
    });
  } catch (error) {
    console.error('Error in match-resume-to-jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/resumes
 * Get all saved resumes
 */
router.get('/resumes', async (req, res) => {
  try {
    const resumes = await databaseService.getAllResumes();
    res.json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/resumes/:id
 * Get a specific resume
 */
router.get('/resumes/:id', async (req, res) => {
  try {
    const resume = await databaseService.getResumeById(parseInt(req.params.id));

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    const matches = await databaseService.getMatchesForResume(parseInt(req.params.id));

    res.json({
      success: true,
      data: {
        resume: resume,
        matches: matches,
      },
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jobs
 * Get all saved job descriptions
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await databaseService.getAllJobs();
    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jobs/:jobId
 * Get a specific job description
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const job = await databaseService.getJobById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/resumes/:id
 * Delete a resume
 */
router.delete('/resumes/:id', async (req, res) => {
  try {
    await databaseService.deleteResume(parseInt(req.params.id));
    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/jobs/:jobId
 * Delete a job description
 */
router.delete('/jobs/:jobId', async (req, res) => {
  try {
    await databaseService.deleteJob(req.params.jobId);
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
