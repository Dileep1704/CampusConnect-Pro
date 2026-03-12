const enhancedMatcher = require('../services/ai/enhancedMatcher');
const vectorSearch = require('../services/ai/vectorSearchService');
const rankingModel = require('../services/ai/rankingModel');
const aiFeatures = require('../services/ai/aiFeaturesService');
const User = require('../models/User');
const Internship = require('../models/Internship');
const sentenceTransformer = require('../services/ai/sentenceTransformerService');

/**
 * Get enhanced AI matches for student
 */
exports.getEnhancedMatches = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    if (!student.parsedResume) {
      return res.status(404).json({
        success: false,
        message: 'Please upload your resume first'
      });
    }

    // Get matches using enhanced matcher
    const internships = await Internship.find({ status: 'approved' });
    const matches = [];

    for (const job of internships) {
      const score = await enhancedMatcher.calculateMatch(
        student.parsedResume,
        job
      );
      
      // Use ML model if trained
      if (rankingModel.trained) {
        score.mlProbability = await rankingModel.predict(
          student.parsedResume,
          job,
          score
        );
      }
      
      matches.push({
        internship: job,
        matchScore: score
      });
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore.total - a.matchScore.total);

    res.json({
      success: true,
      matches: matches.slice(0, 10),
      usingAI: {
        transformers: true,
        vectorSearch: vectorSearch.initialized,
        mlModel: rankingModel.trained
      }
    });

  } catch (error) {
    console.error('Enhanced matching error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get resume feedback and analysis
 */
exports.getResumeFeedback = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    if (!student.parsedResume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found'
      });
    }

    const feedback = await aiFeatures.generateResumeFeedback(student.parsedResume);
    const recommendations = await aiFeatures.getRecommendations(student.parsedResume, 5);
    const roadmap = await aiFeatures.getSkillRoadmap(
      student.parsedResume.skills || [],
      'fullstack' // Could be dynamic based on user preferences
    );

    res.json({
      success: true,
      feedback,
      recommendations,
      roadmap
    });

  } catch (error) {
    console.error('Resume feedback error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search similar internships using vector search
 */
exports.vectorSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    // Generate embedding for query
    const embedding = await sentenceTransformer.generateEmbedding(query);
    
    // Search vector index
    const results = await vectorSearch.search(embedding, 10);

    // Fetch full internship details
    const internships = await Internship.find({
      _id: { $in: results.map(r => r.id) }
    });

    // Combine with scores
    const searchResults = results.map(result => ({
      internship: internships.find(i => i._id.toString() === result.id),
      score: result.score,
      distance: result.distance
    }));

    res.json({
      success: true,
      results: searchResults
    });

  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Train ranking model with historical data
 */
exports.trainRankingModel = async (req, res) => {
  try {
    // Only admins can train models
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get historical application data
    const applications = await Application.find({
      status: { $in: ['accepted', 'rejected'] }
    }).populate('student internship');

    const trainingData = [];

    for (const app of applications) {
      const student = await User.findById(app.student);
      const job = await Internship.findById(app.internship);
      
      if (student?.parsedResume && job) {
        const scores = await enhancedMatcher.calculateMatch(
          student.parsedResume,
          job
        );
        
        const features = rankingModel.extractFeatures(
          student.parsedResume,
          job,
          scores
        );
        
        trainingData.push({
          features,
          matchProbability: app.status === 'accepted' ? 1 : 0
        });
      }
    }

    // Train the model
    await rankingModel.train(trainingData);
    
    // Save the model
    await rankingModel.saveModel('./models/ranking');

    res.json({
      success: true,
      message: 'Model trained successfully',
      dataPoints: trainingData.length
    });

  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};