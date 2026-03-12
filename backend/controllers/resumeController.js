const ResumeParser = require('../services/resumeParser');
const User = require('../models/User');
const Internship = require('../models/Internship');
const path = require('path');
const fs = require('fs');

// @desc    Upload and parse resume
// @route   POST /api/students/upload-resume
// @access  Private (Student only)
exports.uploadResume = async (req, res) => {
  try {
    console.log('📁 Upload request received');
    console.log('📄 File:', req.file);
    console.log('👤 User:', req.user.id);

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Only students can upload resumes' 
      });
    }

    // Parse resume
    console.log('🔍 Parsing resume...');
    const resumeData = await ResumeParser.parseResume(
      req.file.path,
      req.file.mimetype
    );

    // Update user with resume data
    const user = await User.findById(req.user.id);
    user.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    user.parsedResume = resumeData;
    await user.save();

    console.log('✅ Resume parsed and saved');

    // Find matching internships
    const internships = await Internship.find({ status: 'approved' });
    const matches = [];

    internships.forEach(internship => {
      const matchScore = ResumeParser.calculateMatchScore(
        resumeData,
        internship
      );
      
      if (matchScore.total > 0) {
        matches.push({
          internship,
          matchScore
        });
      }
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore.total - a.matchScore.total);

    res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      resumeData,
      matches: matches.slice(0, 10) // Top 10 matches
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error processing resume' 
    });
  }
};

// @desc    Get resume analysis and matches
// @route   GET /api/students/resume-analysis
// @access  Private (Student only)
exports.getResumeAnalysis = async (req, res) => {
  try {
    console.log('📊 Analysis request for user:', req.user.id);

    const user = await User.findById(req.user.id);
    
    if (!user.parsedResume) {
      return res.status(404).json({ 
        success: false,
        message: 'No resume found. Please upload your resume first.' 
      });
    }

    // Find matching internships
    const internships = await Internship.find({ status: 'approved' });
    const matches = [];

    internships.forEach(internship => {
      const matchScore = ResumeParser.calculateMatchScore(
        user.parsedResume,
        internship
      );
      
      matches.push({
        internship,
        matchScore
      });
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore.total - a.matchScore.total);

    res.json({
      success: true,
      resumeData: user.parsedResume,
      matches: matches.slice(0, 10) // Top 10 matches
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error getting analysis' 
    });
  }
};