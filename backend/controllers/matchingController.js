const semanticMatcher = require('../services/ai/semanticMatcher');
const AdvancedResumeParser = require('../services/ai/advancedResumeParser');
const User = require('../models/User');
const Internship = require('../models/Internship');

/**
 * Get matches for a student's resume
 */
exports.getStudentMatches = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);
    
    if (!student.parsedResume) {
      return res.status(404).json({
        success: false,
        message: 'Please upload your resume first'
      });
    }
    
    const matches = await semanticMatcher.findMatchesForResume(
      student.parsedResume,
      parseInt(req.query.limit) || 10
    );
    
    res.json({
      success: true,
      matches: matches
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get candidates for a company's job posting
 */
exports.getJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify the job belongs to this company
    const job = await Internship.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const matches = await semanticMatcher.findCandidatesForJob(
      jobId,
      parseInt(req.query.limit) || 10
    );
    
    res.json({
      success: true,
      candidates: matches
    });
  } catch (error) {
    console.error('Candidate matching error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Compare two candidates for a job
 */
exports.compareCandidates = async (req, res) => {
  try {
    const { jobId, candidateIds } = req.body;
    
    const job = await Internship.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const candidates = await User.find({
      _id: { $in: candidateIds },
      role: 'student'
    });
    
    const comparisons = [];
    for (const candidate of candidates) {
      if (!candidate.parsedResume) continue;
      
      const score = await semanticMatcher.calculateMatch(
        candidate.parsedResume,
        job
      );
      
      comparisons.push({
        candidate: {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email
        },
        matchScore: score
      });
    }
    
    comparisons.sort((a, b) => b.matchScore.total - a.matchScore.total);
    
    res.json({
      success: true,
      comparisons
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};