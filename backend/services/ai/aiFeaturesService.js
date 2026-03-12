/**
 * AI Features Service
 * Provides intelligent insights and recommendations
 */

const advancedSkillExtractor = require('../nlp/advancedSkillExtractor');
const sentenceTransformer = require('./sentenceTransformerService');
const Internship = require('../../models/Internship');

class AIFeaturesService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await sentenceTransformer.initialize();
      this.initialized = true;
    }
  }

  /**
   * Generate resume feedback
   */
  async generateResumeFeedback(resumeData) {
    const feedback = {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      missingSkills: [],
      score: 0
    };

    // Analyze skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      if (resumeData.skills.length >= 10) {
        feedback.strengths.push('✅ Strong technical skill set with 10+ skills');
        feedback.score += 20;
      } else if (resumeData.skills.length >= 5) {
        feedback.strengths.push('✅ Good foundational skill set');
        feedback.score += 15;
      } else {
        feedback.weaknesses.push('❌ Limited technical skills - consider adding more');
        feedback.suggestions.push('📚 Consider adding more relevant skills to your resume');
      }
    } else {
      feedback.weaknesses.push('❌ No skills listed');
      feedback.suggestions.push('📝 Add a skills section to your resume');
    }

    // Analyze experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      const totalExp = resumeData.experience.length;
      if (totalExp >= 3) {
        feedback.strengths.push(`✅ Strong work experience with ${totalExp} positions`);
        feedback.score += 25;
      } else if (totalExp >= 1) {
        feedback.strengths.push('✅ Relevant work experience found');
        feedback.score += 15;
      }
    } else {
      feedback.weaknesses.push('❌ No work experience listed');
      feedback.suggestions.push('💼 Add internships or projects to your experience section');
    }

    // Analyze education
    if (resumeData.education && resumeData.education.length > 0) {
      feedback.strengths.push('✅ Education background included');
      feedback.score += 15;
    } else {
      feedback.weaknesses.push('❌ No education details found');
      feedback.suggestions.push('🎓 Add your educational background');
    }

    // Generate skill gap analysis
    const marketSkills = [
      'React', 'Node.js', 'Python', 'AWS', 'Docker',
      'TypeScript', 'GraphQL', 'MongoDB', 'PostgreSQL'
    ];

    const currentSkills = resumeData.skills?.map(s => 
      typeof s === 'string' ? s : s.name
    ) || [];

    feedback.missingSkills = marketSkills.filter(skill => 
      !currentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );

    if (feedback.missingSkills.length > 0) {
      feedback.suggestions.push(
        `🚀 Consider learning: ${feedback.missingSkills.slice(0, 3).join(', ')}`
      );
    }

    // Calculate overall score
    feedback.score = Math.min(feedback.score + (100 - feedback.score) * 0.5, 100);
    
    return feedback;
  }

  /**
   * Get personalized internship recommendations
   */
  async getRecommendations(resumeData, limit = 5) {
    await this.initialize();

    const internships = await Internship.find({ status: 'approved' });
    
    // Prepare resume text
    const resumeText = this.prepareResumeText(resumeData);
    const resumeEmbedding = await sentenceTransformer.generateEmbedding(resumeText);

    const recommendations = [];

    for (const job of internships) {
      const jobText = this.prepareJobText(job);
      const jobEmbedding = await sentenceTransformer.generateEmbedding(jobText);
      
      const similarity = sentenceTransformer.cosineSimilarity(resumeEmbedding, jobEmbedding);
      
      // Calculate skill match
      const skillMatch = this.calculateSkillMatch(resumeData.skills, job.skills);
      
      recommendations.push({
        internship: {
          id: job._id,
          title: job.title,
          company: job.companyName,
          location: job.location,
          type: job.type,
          stipend: job.stipend,
          deadline: job.applicationDeadline
        },
        matchScore: Math.round(similarity * 100),
        skillMatch: Math.round(skillMatch * 100),
        overallFit: Math.round((similarity * 0.7 + skillMatch * 0.3) * 100),
        reason: this.generateRecommendationReason(job, skillMatch)
      });
    }

    // Sort by match score
    recommendations.sort((a, b) => b.overallFit - a.overallFit);
    
    return recommendations.slice(0, limit);
  }

  /**
   * Prepare resume text for embedding
   */
  prepareResumeText(resumeData) {
    const parts = [];
    
    if (resumeData.skills) {
      parts.push(...resumeData.skills.map(s => typeof s === 'string' ? s : s.name));
    }
    
    if (resumeData.experience) {
      resumeData.experience.forEach(exp => {
        if (exp.title) parts.push(exp.title);
        if (exp.description) parts.push(exp.description.join(' '));
      });
    }
    
    if (resumeData.education) {
      resumeData.education.forEach(edu => {
        if (edu.degree) parts.push(edu.degree);
        if (edu.field) parts.push(edu.field);
      });
    }
    
    return parts.join(' ');
  }

  /**
   * Prepare job text for embedding
   */
  prepareJobText(job) {
    return [
      job.title,
      job.description,
      ...(job.requirements || []),
      ...(job.skills || [])
    ].join(' ');
  }

  /**
   * Calculate skill match
   */
  calculateSkillMatch(resumeSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 1;
    if (!resumeSkills || resumeSkills.length === 0) return 0;
    
    const resumeSkillNames = resumeSkills.map(s => 
      typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()
    );
    
    const matches = jobSkills.filter(skill => 
      resumeSkillNames.includes(skill.toLowerCase())
    ).length;
    
    return matches / jobSkills.length;
  }

  /**
   * Generate recommendation reason
   */
  generateRecommendationReason(job, skillMatch) {
    if (skillMatch >= 0.8) {
      return `Perfect match! Your skills align perfectly with this ${job.title} position`;
    } else if (skillMatch >= 0.6) {
      return `Good fit! You have most of the required skills for this role`;
    } else if (skillMatch >= 0.4) {
      return `You have some relevant skills for this position`;
    } else {
      return `Consider gaining additional skills for this role`;
    }
  }

  /**
   * Get skill development roadmap
   */
  async getSkillRoadmap(currentSkills, targetRole) {
    const roadmap = {
      currentLevel: this.assessSkillLevel(currentSkills),
      targetRole: targetRole,
      recommendedSkills: [],
      learningPath: [],
      estimatedTime: ''
    };

    // Get role requirements (simplified)
    const roleRequirements = {
      'frontend': ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
      'backend': ['Node.js', 'Python', 'SQL', 'MongoDB', 'API Design'],
      'fullstack': ['React', 'Node.js', 'MongoDB', 'Express', 'REST APIs'],
      'data scientist': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
      'devops': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux']
    };

    const requirements = roleRequirements[targetRole.toLowerCase()] || [];

    // Find missing skills
    const currentSkillNames = currentSkills.map(s => s.name.toLowerCase());
    const missingSkills = requirements.filter(s => 
      !currentSkillNames.includes(s.toLowerCase())
    );

    // Generate learning path
    missingSkills.forEach((skill, index) => {
      roadmap.recommendedSkills.push(skill);
      roadmap.learningPath.push({
        skill,
        priority: index + 1,
        resources: this.getLearningResources(skill),
        estimatedHours: 20 + index * 5
      });
    });

    // Estimate time
    const totalHours = roadmap.learningPath.reduce((acc, item) => acc + item.estimatedHours, 0);
    roadmap.estimatedTime = `${Math.ceil(totalHours / 40)} weeks`;

    return roadmap;
  }

  /**
   * Assess skill level
   */
  assessSkillLevel(skills) {
    const count = skills.length;
    if (count >= 15) return 'expert';
    if (count >= 10) return 'advanced';
    if (count >= 5) return 'intermediate';
    return 'beginner';
  }

  /**
   * Get learning resources for a skill
   */
  getLearningResources(skill) {
    const resources = {
      'React': [
        'React Official Tutorial',
        'Full Stack Open',
        'Scrimba React Course'
      ],
      'Node.js': [
        'Node.js Official Docs',
        'The Odin Project',
        'FreeCodeCamp Node.js'
      ],
      'Python': [
        'Python.org Tutorial',
        'Automate the Boring Stuff',
        'Coursera Python for Everybody'
      ]
    };

    return resources[skill] || [
      `${skill} Official Documentation`,
      `Online courses on ${skill}`,
      `Practice projects with ${skill}`
    ];
  }
}

module.exports = new AIFeaturesService();