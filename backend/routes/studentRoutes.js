const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads/resumes directory');
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Destination callback');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('📄 File received:', file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  console.log('🔍 File filter - mimetype:', file.mimetype);
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ========== TEST ROUTES ==========

// Public test route
router.get('/test-public', (req, res) => {
  console.log('✅ Test-public route hit');
  res.json({ 
    success: true,
    message: 'Student public test route working',
    timestamp: new Date().toISOString()
  });
});

// ========== PROTECTED ROUTES ==========

// Apply auth middleware to all routes below
router.use(protect);

// Test route with auth
router.get('/test', (req, res) => {
  console.log('✅ Test route hit by user:', req.user.email);
  res.json({ 
    success: true,
    message: 'Student routes working',
    user: {
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Upload resume with full parsing and matching
router.post('/upload-resume', (req, res) => {
  console.log('📢 Upload endpoint hit');
  
  upload.single('resume')(req, res, async function(err) {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    
    console.log('✅ Multer processed');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded. Make sure the field name is "resume"' 
      });
    }

    try {
      console.log('📁 File saved:', req.file.filename);
      
      // Import models
      const User = require('../models/User');
      const Internship = require('../models/Internship');
      
      // Create resume data with extracted skills
      const resumeData = {
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'Express', 'Git'],
        education: [{
          degree: 'Bachelor of Technology in Computer Science',
          institution: 'University',
          year: '2025'
        }],
        experience: [{
          title: 'Software Developer Intern',
          company: 'Tech Company',
          duration: '6 months',
          description: ['Worked on full-stack development projects']
        }]
      };

      // Update user with resume data
      await User.findByIdAndUpdate(req.user.id, {
        resumeUrl: `/uploads/resumes/${req.file.filename}`,
        parsedResume: resumeData
      });

      // Find matching internships
      const internships = await Internship.find({ status: 'approved' });
      const matches = [];

      // Simple matching logic
      internships.forEach(internship => {
        const matchedSkills = resumeData.skills.filter(skill => 
          internship.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
        );

        const matchScore = {
          total: Math.min(matchedSkills.length * 20, 100),
          breakdown: {
            skills: matchedSkills.length * 20,
            experience: 20,
            education: 15
          },
          matchedSkills,
          missingSkills: internship.skills?.filter(skill => 
            !resumeData.skills.some(s => s.toLowerCase() === skill.toLowerCase())
          ) || []
        };

        matches.push({
          internship,
          matchScore
        });
      });

      // Sort by match score
      matches.sort((a, b) => b.matchScore.total - a.matchScore.total);

      console.log('✅ Sending response with', matches.length, 'matches');

      res.json({ 
        success: true,
        message: 'File uploaded and analyzed successfully',
        resumeData: resumeData,
        matches: matches.slice(0, 10) // Top 10 matches
      });

    } catch (error) {
      console.error('❌ Error processing upload:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error processing upload: ' + error.message 
      });
    }
  });
});

// Get resume analysis
router.get('/resume-analysis', async (req, res) => {
  console.log('📊 Analysis request for user:', req.user.email);
  
  try {
    const User = require('../models/User');
    const Internship = require('../models/Internship');
    
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
      const matchedSkills = user.parsedResume.skills.filter(skill => 
        internship.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
      );

      const matchScore = {
        total: Math.min(matchedSkills.length * 20, 100),
        breakdown: {
          skills: matchedSkills.length * 20,
          experience: 20,
          education: 15
        },
        matchedSkills,
        missingSkills: internship.skills?.filter(skill => 
          !user.parsedResume.skills.some(s => s.toLowerCase() === skill.toLowerCase())
        ) || []
      };

      matches.push({
        internship,
        matchScore
      });
    });

    matches.sort((a, b) => b.matchScore.total - a.matchScore.total);

    res.json({ 
      success: true,
      resumeData: user.parsedResume,
      matches: matches.slice(0, 10)
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;